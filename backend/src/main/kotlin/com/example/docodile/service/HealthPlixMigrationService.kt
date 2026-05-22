package com.example.docodile.service

import com.example.docodile.domain.Patient
import com.example.docodile.domain.RxRow
import com.example.docodile.domain.Visit
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import jakarta.persistence.EntityManager
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayInputStream
import java.time.Instant
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.zip.ZipInputStream

/**
 * Self-service importer for a HealthPlix EMR export. Accepts the four
 * standard export CSVs and loads them into the calling clinic:
 *
 *   APD            → patient
 *   Clinical       → visit (diagnosis / tests / complaints / follow-up)
 *   Investigations → visit vitals, or privateNotes for lab results
 *   Medications    → rx_row (parsed from the multi-line `pres` blob)
 *
 * Everything is scoped to the JWT clinic, so a clinic can only ever
 * import into its own tenant. Re-running the same files upserts via
 * external_ref instead of duplicating. Migrated visits get no
 * createdByDoctor — patient data is clinic-shared, not doctor-owned.
 */
@Service
class HealthPlixMigrationService(
    private val patientRepository: PatientRepository,
    private val visitRepository: VisitRepository,
    private val rxRowRepository: RxRowRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val currentUser: CurrentUser,
    private val entityManager: EntityManager,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    data class Result(
        // Total records migrated (created + updated) — so a re-run reports
        // the real totals, not just what was newly inserted.
        val patients: Int,
        val visits: Int,
        val prescriptions: Int,   // visit-prescriptions (one per Medications row)
        val medicines: Int,       // individual medicine lines across all prescriptions
        val investigations: Int,
        val skipped: Int,
        val skippedDetails: List<String>,
        val warnings: List<String>,
    )

    // HealthPlix APD created_on looks like "06.Jan.2025".
    private val apdDateFmt = DateTimeFormatter.ofPattern("dd.MMM.yyyy", Locale.ENGLISH)

    // Test names in the Investigations file that are really vitals — these
    // land in the visit's vital columns; anything else is a lab result and
    // gets appended to privateNotes.
    private val vitalNames = setOf("weight", "height", "temperature", "pulse", "bmi", "spo2", "waist", "hip")

    // Columns each export must contain. Used to reject a file dropped into
    // the wrong slot up front, instead of silently skipping every row.
    private val requiredColumns = mapOf(
        "Patients" to listOf("ID", "name"),
        "Clinical" to listOf("org_person_bid_str", "visit_date"),
        "Investigations" to listOf("org_person_bid_str", "test_result_date", "test_name"),
        "Medications" to listOf("patient_id", "visit_date", "pres"),
    )

    /**
     * Import from a single ZIP of the HealthPlix export. Each CSV inside is
     * identified by its header columns — not its filename — so the four
     * files can be zipped in any order, any folder depth, any naming.
     */
    @Transactional
    fun migrateZip(zipBytes: ByteArray): Result {
        val bySlot = HashMap<String, String>()
        val unrecognised = mutableListOf<String>()
        ZipInputStream(ByteArrayInputStream(zipBytes)).use { zin ->
            var entry = zin.nextEntry
            while (entry != null) {
                val name = entry.name.substringAfterLast('/')
                if (!entry.isDirectory && name.lowercase().endsWith(".csv")) {
                    val content = zin.readBytes().toString(Charsets.UTF_8)
                    val slot = detectSlot(content)
                    if (slot != null) bySlot[slot] = content else unrecognised.add(name)
                }
                zin.closeEntry()
                entry = zin.nextEntry
            }
        }
        if (bySlot.isEmpty()) {
            throw IllegalArgumentException(
                "No recognisable HealthPlix CSV files were found in the ZIP." +
                    if (unrecognised.isNotEmpty()) " Skipped: ${unrecognised.joinToString(", ")}." else ""
            )
        }
        return migrate(
            patientsCsv = bySlot["Patients"],
            clinicalCsv = bySlot["Clinical"],
            investigationsCsv = bySlot["Investigations"],
            medicationsCsv = bySlot["Medications"],
        )
    }

    @Transactional
    fun migrate(
        patientsCsv: String?,
        clinicalCsv: String?,
        investigationsCsv: String?,
        medicationsCsv: String?,
    ): Result {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }

        // Validate every supplied file's header against the slot it landed
        // in. A mismatched file is rejected with a clear message before any
        // row is touched — nothing is imported until all files look right.
        val headerErrors = listOfNotNull(
            validateHeader("Patients", patientsCsv),
            validateHeader("Clinical", clinicalCsv),
            validateHeader("Investigations", investigationsCsv),
            validateHeader("Medications", medicationsCsv),
        )
        if (headerErrors.isNotEmpty()) throw IllegalArgumentException(headerErrors.joinToString("  "))

        // Preload everything previously imported for this clinic so a
        // re-run upserts instead of duplicating.
        val patientByRef = patientRepository.findAllByClinicIdAndExternalRefIsNotNull(clinicId)
            .associateByTo(HashMap()) { it.externalRef!! }
        val visitByRef = visitRepository.findAllByClinicIdAndExternalRefIsNotNull(clinicId)
            .associateByTo(HashMap()) { it.externalRef!! }
        // Visits that already existed before this run — only these can carry
        // stale rx_rows worth clearing. Brand-new visits never do, so they
        // skip the per-visit DELETE entirely (big win on a first import).
        val preExistingVisitIds = visitByRef.values.mapTo(HashSet()) { it.id }

        var patients = 0
        var prescriptions = 0
        var medicines = 0
        var investigations = 0
        var skipped = 0
        val warnings = mutableListOf<String>()
        val skippedDetails = mutableListOf<String>()
        // Distinct visits the import wrote to — counted at the end so a
        // re-run reports the true total, not just newly created visits.
        val touchedVisitIds = HashSet<java.util.UUID>()
        val now = Instant.now()

        fun warn(msg: String) { if (warnings.size < 50) warnings.add(msg) }
        fun skip(reason: String) {
            skipped++
            if (skippedDetails.size < 200) skippedDetails.add(reason)
        }

        // Resolve a patient by HealthPlix ref, creating a name-only stub if
        // the patient file didn't include them — never drop a visit/rx.
        fun resolvePatient(ref: String): Patient {
            patientByRef[ref]?.let { return it }
            val stub = Patient(
                clinic = clinic,
                name = ref,           // best we can do without the APD row
                createdAt = now,
                externalRef = ref,
            )
            entityManager.persist(stub)
            patientByRef[ref] = stub
            patients++
            warn("Patient '$ref' referenced but not in the patient file — created a stub.")
            return stub
        }

        // Get or create the visit for (patientRef, date). Visit external_ref
        // is "<patientRef>|<isoDate>" so it's stable across files + re-runs.
        fun resolveVisit(patientRef: String, date: LocalDate): Visit {
            val key = "$patientRef|$date"
            visitByRef[key]?.let { touchedVisitIds.add(it.id); return it }
            val patient = resolvePatient(patientRef)
            val v = Visit(
                clinic = clinic,
                patient = patient,
                visitDate = date,
                createdAt = now,
                updatedAt = now,
                externalRef = key,
            )
            entityManager.persist(v)
            visitByRef[key] = v
            touchedVisitIds.add(v.id)
            return v
        }

        // ── 1. Patients ──────────────────────────────────────────────────
        if (!patientsCsv.isNullOrBlank()) {
            val rows = parseCsv(patientsCsv)
            val header = headerIndex(rows.firstOrNull())
            for (row in rows.drop(1)) {
                val ref = cell(row, header, "ID").trim()
                val name = cell(row, header, "name").trim()
                if (ref.isEmpty() || name.isEmpty()) { skip("Patient row with no ID or name"); continue }
                if (name.lowercase() in setOf("demo patient", "demo 1")) { skip("Demo/sample patient row"); continue }

                val existing = patientByRef[ref]
                val p = existing ?: Patient(clinic = clinic, externalRef = ref, createdAt = now)
                p.name = name
                p.phone = cell(row, header, "phone_number").trim().ifBlank { null }
                p.email = cell(row, header, "email_id").trim().ifBlank { null }?.lowercase()
                p.gender = cell(row, header, "Sex").trim().lowercase().ifBlank { null }
                // HealthPlix age is in YEARS; Docodile stores age in MONTHS.
                p.age = cell(row, header, "age").trim().toIntOrNull()?.let { it * 12 }
                p.dob = parseHpDob(cell(row, header, "dob"))
                if (p.createdAt == null) p.createdAt = parseApdDate(cell(row, header, "created_on")) ?: now
                p.archived = false
                if (existing == null) {
                    // New patient → INSERT. Existing rows are already managed
                    // (loaded into the persistence context above), so the
                    // field mutations flush as an UPDATE on their own.
                    entityManager.persist(p)
                    patientByRef[ref] = p
                }
                patients++   // counts both new and updated patients
            }
        }

        // ── 2. Clinical visits ───────────────────────────────────────────
        if (!clinicalCsv.isNullOrBlank()) {
            val rows = parseCsv(clinicalCsv)
            val header = headerIndex(rows.firstOrNull())
            for (row in rows.drop(1)) {
                val ref = cell(row, header, "org_person_bid_str").trim()
                val date = parseHpDate(cell(row, header, "visit_date"))
                if (ref.isEmpty() || date == null) { skip("Clinical row with no patient ID or visit date"); continue }
                if (ref == "2") { skip("Clinical demo patient row"); continue }

                val v = resolveVisit(ref, date)
                v.diagnosis = cell(row, header, "diagnosis_temp").trim().ifBlank { null }
                v.complaints = cell(row, header, "complaints").trim().ifBlank { null }
                v.tests = cell(row, header, "tests_advised").trim().ifBlank { null }
                v.reviewDate = parseHpDate(cell(row, header, "next_visit_date"))
                v.updatedAt = now
                // v is managed (just persisted, or loaded from the seed) —
                // no explicit save; the change flushes at commit.
            }
        }

        // ── 3. Investigations (vitals / lab results) ─────────────────────
        if (!investigationsCsv.isNullOrBlank()) {
            val rows = parseCsv(investigationsCsv)
            val header = headerIndex(rows.firstOrNull())
            for (row in rows.drop(1)) {
                val ref = cell(row, header, "org_person_bid_str").trim()
                val date = parseHpDate(cell(row, header, "test_result_date"))
                val testName = cell(row, header, "test_name").trim()
                val resultText = cell(row, header, "test_result_text").trim()
                if (ref.isEmpty() || date == null || testName.isEmpty()) {
                    skip("Investigations row with no patient ID, date or test name"); continue
                }

                val v = resolveVisit(ref, date)
                when (testName.lowercase()) {
                    "weight" -> v.weight = resultText
                    "height" -> v.height = resultText
                    "temperature" -> v.temperature = resultText
                    "pulse" -> v.pulse = resultText
                    "bmi" -> v.bmi = resultText
                    "spo2" -> v.spo2 = resultText
                    "waist" -> v.waist = resultText
                    "hip" -> v.hip = resultText
                    else -> {
                        // Lab result — Docodile has no results table, so
                        // append to privateNotes rather than lose it.
                        val line = "$testName: $resultText"
                        v.privateNotes = listOfNotNull(v.privateNotes?.ifBlank { null }, line).joinToString("\n")
                    }
                }
                v.updatedAt = now
                investigations++
            }
        }

        // ── 4. Medications → rx_row ──────────────────────────────────────
        if (!medicationsCsv.isNullOrBlank()) {
            val rows = parseCsv(medicationsCsv)
            val header = headerIndex(rows.firstOrNull())

            // Pass 1 — resolve every visit and parse its prescription blob.
            val pending = ArrayList<Pair<Visit, List<ParsedMed>>>()
            for (row in rows.drop(1)) {
                val ref = cell(row, header, "patient_id").trim()
                val date = parseHpDate(cell(row, header, "visit_date"))
                val pres = cell(row, header, "pres")
                if (ref.isEmpty() || date == null || pres.isBlank()) {
                    skip("Medications row with no patient ID, date or prescription"); continue
                }
                if (ref == "2") { skip("Medications demo patient row"); continue }

                val v = resolveVisit(ref, date)
                val meds = parsePresBlob(pres)
                if (meds.isNotEmpty()) pending.add(v to meds)
            }
            prescriptions += pending.size

            // Clear prior rx for visits that already existed — one bulk
            // DELETE, so the inserts below batch cleanly. New visits have no
            // rx to clear, so they're excluded.
            val toClear = pending.mapNotNullTo(HashSet()) { (v, _) ->
                v.id.takeIf { it in preExistingVisitIds }
            }
            if (toClear.isNotEmpty()) rxRowRepository.deleteByVisitIdIn(toClear)

            // Pass 2 — persist the new rx rows. Position runs per visit so
            // several medication rows for one visit append in order.
            val nextPos = HashMap<java.util.UUID, Int>()
            for ((v, meds) in pending) {
                var pos = nextPos.getOrDefault(v.id, 0)
                for (m in meds) {
                    pos += 1
                    entityManager.persist(
                        RxRow(
                            visit = v,
                            position = pos.toShort(),
                            medicine = m.medicine,
                            dosage = m.dosage,
                            whenToTake = m.whenToTake,
                            frequency = m.frequency,
                            duration = m.duration,
                            notes = m.notes,
                            createdAt = now,
                        )
                    )
                    medicines++
                }
                nextPos[v.id] = pos
            }
        }

        val visits = touchedVisitIds.size
        log.info(
            "HealthPlix migration into clinic {} — patients={} visits={} prescriptions={} medicines={} inv={} skipped={}",
            clinicId, patients, visits, prescriptions, medicines, investigations, skipped,
        )
        return Result(
            patients, visits, prescriptions, medicines,
            investigations, skipped, skippedDetails, warnings,
        )
    }

    // ── validation ───────────────────────────────────────────────────────

    /**
     * Identify which of the four exports a CSV is, by matching its header
     * against each slot's required columns. Returns null if it matches none
     * (e.g. an unrelated file zipped in alongside the export).
     */
    private fun detectSlot(csv: String): String? {
        val header = headerIndex(parseCsv(csv).firstOrNull())
        if (header.isEmpty()) return null
        return requiredColumns.entries
            .firstOrNull { (_, cols) -> cols.all { it.lowercase() in header } }
            ?.key
    }


    /**
     * Returns null if the CSV is absent or its header carries every column
     * the slot needs; otherwise a human-readable error naming the slot and
     * the missing columns — so a file dropped into the wrong slot is caught
     * before import rather than silently skipping every row.
     */
    private fun validateHeader(slot: String, csv: String?): String? {
        if (csv.isNullOrBlank()) return null
        val required = requiredColumns[slot] ?: return null
        val header = headerIndex(parseCsv(csv).firstOrNull())
        val missing = required.filter { it.lowercase() !in header }
        if (missing.isEmpty()) return null
        return "The file in the $slot slot doesn't look like a HealthPlix $slot export — " +
            "it's missing the column(s): ${missing.joinToString(", ")}. " +
            "Check you uploaded the right file into the $slot slot."
    }

    // ── parsing helpers ──────────────────────────────────────────────────

    /** One parsed medicine line from the `pres` blob. */
    private data class ParsedMed(
        val medicine: String?,
        val dosage: String?,
        val whenToTake: String?,
        val frequency: String?,
        val duration: String?,
        val notes: String?,
    )

    /**
     * The HealthPlix `pres` cell is a multi-line blob, one medicine per
     * line, pipe-delimited "Key: Value" pairs:
     *
     *   Medicine: X|Quantity: 0.0|Dosage: 0-0-1.0-0|Timing: |When: |
     *   Frequency: daily|Duration: 1 month|Notes: ...
     *
     * Docodile mapping: HealthPlix "Dosage" (the morning-noon-eve-night
     * pattern) → frequency; "Duration" → duration; "When" → whenToTake;
     * "Notes" (+ a non-trivial "Frequency" word) → notes.
     */
    private fun parsePresBlob(blob: String): List<ParsedMed> {
        val out = mutableListOf<ParsedMed>()
        for (rawLine in blob.split('\n')) {
            val line = rawLine.trim()
            if (line.isEmpty() || !line.contains("Medicine:")) continue
            val fields = HashMap<String, String>()
            for (part in line.split('|')) {
                val idx = part.indexOf(':')
                if (idx <= 0) continue
                fields[part.substring(0, idx).trim().lowercase()] = part.substring(idx + 1).trim()
            }
            val medicine = fields["medicine"]?.ifBlank { null } ?: continue
            val freqWord = fields["frequency"]?.ifBlank { null }
            val baseNotes = fields["notes"]?.ifBlank { null }
            // Fold a meaningful frequency word ("stat", "weekly"…) into notes
            // since Docodile has no separate field for it.
            val notes = listOfNotNull(
                baseNotes,
                freqWord?.takeIf { it.lowercase() !in setOf("daily", "") },
            ).joinToString(" · ").ifBlank { null }
            out.add(
                ParsedMed(
                    medicine = medicine,
                    dosage = null,                       // HealthPlix has no per-dose unit
                    whenToTake = fields["when"]?.ifBlank { null },
                    frequency = fields["dosage"]?.ifBlank { null },   // the X-X-X-X pattern
                    duration = fields["duration"]?.ifBlank { null }?.takeIf { it != "0" },
                    notes = notes,
                )
            )
        }
        return out
    }

    /** RFC-4180 CSV parser — handles quoted fields with embedded commas + newlines. */
    private fun parseCsv(text: String): List<List<String>> {
        val rows = mutableListOf<List<String>>()
        var row = mutableListOf<String>()
        val field = StringBuilder()
        var inQuotes = false
        var i = 0
        // Strip a leading UTF-8 BOM if present.
        val s = if (text.startsWith("﻿")) text.substring(1) else text
        while (i < s.length) {
            val c = s[i]
            if (inQuotes) {
                if (c == '"') {
                    if (i + 1 < s.length && s[i + 1] == '"') { field.append('"'); i += 2 }
                    else { inQuotes = false; i++ }
                } else { field.append(c); i++ }
            } else when (c) {
                '"' -> { inQuotes = true; i++ }
                ',' -> { row.add(field.toString()); field.setLength(0); i++ }
                '\r' -> i++
                '\n' -> { row.add(field.toString()); field.setLength(0); rows.add(row); row = mutableListOf(); i++ }
                else -> { field.append(c); i++ }
            }
        }
        if (field.isNotEmpty() || row.isNotEmpty()) { row.add(field.toString()); rows.add(row) }
        return rows
    }

    /** Map header names → column index, case-insensitive. */
    private fun headerIndex(header: List<String>?): Map<String, Int> =
        header?.withIndex()?.associate { (i, name) -> name.trim().lowercase() to i } ?: emptyMap()

    private fun cell(row: List<String>, header: Map<String, Int>, name: String): String {
        val idx = header[name.lowercase()] ?: return ""
        return row.getOrNull(idx) ?: ""
    }

    // HealthPlix CSV dates — visit_date / next_visit_date / test_result_date
    // / dob come through as "dd-MM-yy" (21-04-25). A few columns instead
    // carry the ISO "0101-01-01" sentinel meaning "none".
    private val hpDateFormats = listOf(
        DateTimeFormatter.ofPattern("dd-MM-yy", Locale.ENGLISH),
        DateTimeFormatter.ofPattern("dd-MM-yyyy", Locale.ENGLISH),
    )

    /** Parse a HealthPlix date. Empty or the 0101 sentinel → null. */
    private fun parseHpDate(raw: String): LocalDate? {
        val t = raw.trim()
        if (t.isEmpty() || t.startsWith("0101")) return null
        for (fmt in hpDateFormats) {
            val d = runCatching { LocalDate.parse(t, fmt) }.getOrNull()
            if (d != null) return d
        }
        return runCatching { LocalDate.parse(t) }.getOrNull()
    }

    /**
     * Parse a date of birth. Same "dd-MM-yy" form, but a two-digit year
     * pivots at 2000 — so someone born in 1965 would land in 2065. If the
     * parsed date is in the future, roll it back a century.
     */
    private fun parseHpDob(raw: String): LocalDate? {
        val d = parseHpDate(raw) ?: return null
        return if (d.isAfter(LocalDate.now())) d.minusYears(100) else d
    }

    /** "06.Jan.2025" → Instant (start of day). */
    private fun parseApdDate(raw: String): Instant? {
        val t = raw.trim()
        if (t.isEmpty()) return null
        return runCatching { LocalDate.parse(t, apdDateFmt).atStartOfDay(java.time.ZoneOffset.UTC).toInstant() }
            .getOrNull()
    }
}
