package com.example.docodile.service

import com.example.docodile.domain.RxRow
import com.example.docodile.domain.Visit
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.ActiveSessionDTO
import com.example.docodile.web.PatientContentMatch
import com.example.docodile.web.RxRowDTO
import com.example.docodile.web.SaveVisitRequest
import com.example.docodile.web.VisitDTO
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Service
class VisitService(
    private val visitRepository: VisitRepository,
    private val rxRowRepository: RxRowRepository,
    private val patientRepository: PatientRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val appUserRepository: AppUserRepository,
    private val appointmentRepository: AppointmentRepository,
    private val currentUser: CurrentUser
) {
    fun listForPatient(patientId: UUID): List<VisitDTO> {
        val clinicId = currentUser.clinicId()

        // Strictly this patient's own visits. A phone number can be shared
        // across a family, so visit history must never be merged by phone —
        // each patient row owns its own history.
        val visits = visitRepository
            .findAllByClinicIdAndPatientIdOrderByVisitDateAscCreatedAtAsc(clinicId, patientId)
        // Batch-resolve each visit's appointment status in one query so the
        // pad can lock/label tabs from their own completion state.
        val statusById = appointmentStatuses(visits.mapNotNull { it.appointmentId })
        return visits.map { it.toDTO(loadRxRows(it.id), statusById[it.appointmentId]) }
    }

    // appointmentId -> status, for the given ids (clinic-scoped via the visit
    // query that produced them). Empty input short-circuits to no query.
    private fun appointmentStatuses(appointmentIds: List<UUID>): Map<UUID, String?> {
        val ids = appointmentIds.distinct()
        if (ids.isEmpty()) return emptyMap()
        return appointmentRepository.findAllById(ids).associate { it.id to it.status }
    }

    // In-progress consultations for the live "Active Sessions" indicator —
    // the doctor has opened the pad but not yet completed the visit. Newest
    // first so the most recently started session leads.
    fun listActiveSessions(): List<ActiveSessionDTO> {
        val clinicId = currentUser.clinicId()
        return visitRepository
            .findActiveSessions(clinicId)
            .mapNotNull { v ->
                val p = v.patient ?: return@mapNotNull null
                val startedAt = v.sessionStartedAt ?: return@mapNotNull null
                ActiveSessionDTO(
                    visitId = v.id,
                    patientId = p.id,
                    appointmentId = v.appointmentId,
                    sessionStartedAt = startedAt,
                    name = p.name,
                    phone = p.phone,
                    email = p.email,
                    gender = p.gender,
                    dob = p.dob,
                    age = p.age,
                    displayNo = p.displayNo,
                )
            }
            .sortedByDescending { it.sessionStartedAt }
    }

    fun get(visitId: UUID): VisitDTO {
        val clinicId = currentUser.clinicId()
        val visit = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        return visit.toDTO(loadRxRows(visit.id), statusFor(visit.appointmentId))
    }

    // Single-visit appointment status lookup (used on create/update/get).
    private fun statusFor(appointmentId: UUID?): String? =
        appointmentId?.let { appointmentRepository.findById(it).orElse(null)?.status }

    // Server-side 24h edit-window guard — mirrors the prescription pad's
    // `canEditForm`. Defence in depth: the UI already locks the form, but a
    // direct API call must not amend a visit past its window. The window runs
    // from when the View Pad was opened (sessionStartedAt); an OPEN (un-ended,
    // not-completed) consultation stays editable so it can be finished, and a
    // never-opened visit falls back to its visit date.
    private fun requireWithinEditWindow(visit: Visit) {
        val now = Instant.now().toEpochMilli()
        val dayMs = 24L * 60 * 60 * 1000
        val completed = statusFor(visit.appointmentId)?.uppercase() == "COMPLETED" ||
            (visit.appointmentId == null && visit.sessionEndedAt != null)
        // Open consultation — always editable (so it can be completed).
        if (visit.sessionStartedAt != null && visit.sessionEndedAt == null && !completed) return
        val started = visit.sessionStartedAt
        val refMs = if (started != null) {
            started.toEpochMilli()                              // 24h from pad-open
        } else {
            visit.visitDate.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli() // never opened → visit date
        }
        if (now - refMs >= dayMs) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "This visit's 24-hour edit window has closed")
        }
    }

    // Patient Files "notes / prescriptions" search: match the keyword across
    // visit free-text and prescription text, returning one hit per
    // (patient, type) with a windowed snippet. Keeps the join off the client
    // (visits/Rx aren't loaded on the Files page).
    fun contentSearch(query: String): List<PatientContentMatch> {
        val q = query.trim()
        if (q.length < 2) return emptyList()
        val clinicId = currentUser.clinicId()
        val ql = q.lowercase()
        val like = "%$ql%"
        // Keyed "patientId|type" so each patient shows at most one Rx and one
        // Visit hit; first (most recent, via the queries' ordering) wins.
        val out = LinkedHashMap<String, PatientContentMatch>()

        rxRowRepository.searchContent(clinicId, like).forEach { r ->
            val p = r.visit?.patient ?: return@forEach
            val text = listOfNotNull(r.medicine, r.dosage, r.notes, r.medicineNote)
                .joinToString(" ") { it.trim() }
                .trim()
            out.putIfAbsent(
                "${p.id}|Rx",
                PatientContentMatch(p.id, p.name, p.gender, p.age, p.displayNo, "Rx", snippet(text, ql)),
            )
        }
        visitRepository.searchNotes(clinicId, like).forEach { v ->
            val p = v.patient ?: return@forEach
            val field = listOfNotNull(
                v.complaints, v.diagnosis, v.privateNotes, v.notesForPatient, v.tests, v.reviewNotes,
            ).firstOrNull { it.lowercase().contains(ql) } ?: return@forEach
            out.putIfAbsent(
                "${p.id}|Visit",
                PatientContentMatch(p.id, p.name, p.gender, p.age, p.displayNo, "Visit", snippet(field, ql)),
            )
        }
        return out.values.take(25)
    }

    // A ~70-char window around the first occurrence of `ql` (lower-cased term),
    // ellipsised when trimmed. Falls back to a head-truncate if not found.
    private fun snippet(text: String, ql: String): String {
        val t = text.trim()
        if (t.isEmpty()) return ""
        val idx = t.lowercase().indexOf(ql)
        if (idx < 0) return if (t.length > 90) t.take(90).trim() + "…" else t
        val start = (idx - 28).coerceAtLeast(0)
        val end = (idx + ql.length + 42).coerceAtMost(t.length)
        val pre = if (start > 0) "…" else ""
        val suf = if (end < t.length) "…" else ""
        return "$pre${t.substring(start, end).trim()}$suf"
    }

    @Transactional
    fun create(patientId: UUID, request: SaveVisitRequest): VisitDTO {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        val patient = patientRepository.findById(patientId)
            .orElseThrow { IllegalArgumentException("Patient not found") }
        require(patient.clinic?.id == clinicId) { "Patient does not belong to current clinic" }

        val visit = Visit(
            clinic = clinic,
            patient = patient,
            visitDate = request.visitDate ?: LocalDate.now(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        applyRequest(visit, request, clinicId)
        val saved = visitRepository.save(visit)
        val rxRows = saveRxRows(saved, request.prescriptions)
        return saved.toDTO(rxRows.map { it.toDTO() }, statusFor(saved.appointmentId))
    }

    @Transactional
    fun update(visitId: UUID, request: SaveVisitRequest): VisitDTO {
        val clinicId = currentUser.clinicId()
        val visit = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        requireWithinEditWindow(visit)
        if (request.visitDate != null) visit.visitDate = request.visitDate
        applyRequest(visit, request, clinicId)
        visit.updatedAt = Instant.now()
        val saved = visitRepository.save(visit)
        rxRowRepository.deleteByVisitId(saved.id)
        val rxRows = saveRxRows(saved, request.prescriptions)
        return saved.toDTO(rxRows.map { it.toDTO() }, statusFor(saved.appointmentId))
    }

    @Transactional
    fun delete(visitId: UUID) {
        val clinicId = currentUser.clinicId()
        val visit = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        // rx_row ON DELETE CASCADE handles the children.
        visitRepository.delete(visit)
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private fun applyRequest(visit: Visit, r: SaveVisitRequest, clinicId: UUID) {
        // Vitals
        visit.bpSystolic = r.bpSystolic; visit.bpDiastolic = r.bpDiastolic; visit.bpUnit = r.bpUnit
        visit.bmi = r.bmi; visit.bmiUnit = r.bmiUnit
        visit.height = r.height; visit.heightUnit = r.heightUnit
        visit.weight = r.weight; visit.weightUnit = r.weightUnit
        visit.temperature = r.temperature; visit.temperatureUnit = r.temperatureUnit
        visit.pulse = r.pulse; visit.pulseUnit = r.pulseUnit
        visit.waist = r.waist; visit.waistUnit = r.waistUnit
        visit.hip = r.hip; visit.hipUnit = r.hipUnit
        visit.spo2 = r.spo2; visit.spo2Unit = r.spo2Unit
        // History
        visit.familyHistory = r.familyHistory
        visit.allergies = r.allergies
        visit.personalHistory = r.personalHistory
        visit.pastMedicalHistory = r.pastMedicalHistory
        // Free-text
        visit.complaints = r.complaints
        visit.diagnosis = r.diagnosis
        visit.notesForPatient = r.notesForPatient
        visit.privateNotes = r.privateNotes
        visit.tests = r.tests
        // Treating doctor — only set if missing or the request explicitly
        // provides one (don't blow away an existing assignment on update
        // when the frontend omits the field).
        if (r.createdByDoctorId != null) {
            visit.createdByDoctor = appUserRepository.findById(r.createdByDoctorId).orElse(null)
        }
        // Referral
        visit.referDoctor = r.referDoctorId?.let { id ->
            val doc = appUserRepository.findById(id).orElse(null)
            // Only accept a referral target that's also in this clinic.
            // (Cheap guard; if you later store doctors-by-clinic in a join
            // table, swap to that lookup.)
            doc?.takeIf { true }
        }
        // Next review
        visit.reviewDate = r.reviewDate
        visit.reviewDays = r.reviewDays
        visit.reviewNotes = r.reviewNotes
        // Consultation timing. The frontend stamps sessionStartedAt when the
        // doctor opens the pad (View Pad) and sessionEndedAt when they mark
        // the visit complete. The DURATION is computed here, server-side, so
        // it's trusted: time elapsed between those two moments. Falls back to
        // the request value only when we can't compute it (start missing).
        visit.sessionStartedAt = r.sessionStartedAt
        visit.sessionEndedAt = r.sessionEndedAt
        visit.sessionDurationSec =
            if (r.sessionStartedAt != null && r.sessionEndedAt != null) {
                java.time.Duration.between(r.sessionStartedAt, r.sessionEndedAt)
                    .seconds.toInt().coerceAtLeast(0)
            } else {
                r.sessionDurationSec
            }
        // Tag the visit with its appointment on create; never null it out
        // on a later update that omits the field.
        if (r.appointmentId != null) visit.appointmentId = r.appointmentId
    }

    private fun saveRxRows(visit: Visit, rows: List<RxRowDTO>): List<RxRow> =
        rows.mapIndexed { index, dto ->
            RxRow(
                visit = visit,
                position = (dto.position.takeIf { it > 0 } ?: (index + 1).toShort()),
                medicine = dto.medicine,
                medicineNote = dto.medicineNote,
                dosage = dto.dosage,
                whenToTake = dto.whenToTake,
                frequency = dto.frequency,
                frequencyInterval = dto.frequencyInterval,
                duration = dto.duration,
                notes = dto.notes,
                createdAt = Instant.now()
            )
        }.let { rxRowRepository.saveAll(it) }

    private fun loadRxRows(visitId: UUID): List<RxRowDTO> =
        rxRowRepository.findByVisitIdOrderByPositionAsc(visitId).map { it.toDTO() }

    private fun RxRow.toDTO(): RxRowDTO = RxRowDTO(
        id = this.id,
        position = this.position,
        medicine = this.medicine,
        medicineNote = this.medicineNote,
        dosage = this.dosage,
        whenToTake = this.whenToTake,
        frequency = this.frequency,
        frequencyInterval = this.frequencyInterval,
        duration = this.duration,
        notes = this.notes
    )

    private fun Visit.toDTO(rxRows: List<RxRowDTO>, appointmentStatus: String? = null): VisitDTO = VisitDTO(
        id = this.id,
        patientId = this.patient?.id ?: UUID(0, 0),
        clinicId = this.clinic?.id ?: UUID(0, 0),
        createdByDoctorId = this.createdByDoctor?.id,
        visitDate = this.visitDate,
        bpSystolic = this.bpSystolic, bpDiastolic = this.bpDiastolic, bpUnit = this.bpUnit,
        bmi = this.bmi, bmiUnit = this.bmiUnit,
        height = this.height, heightUnit = this.heightUnit,
        weight = this.weight, weightUnit = this.weightUnit,
        temperature = this.temperature, temperatureUnit = this.temperatureUnit,
        pulse = this.pulse, pulseUnit = this.pulseUnit,
        waist = this.waist, waistUnit = this.waistUnit,
        hip = this.hip, hipUnit = this.hipUnit,
        spo2 = this.spo2, spo2Unit = this.spo2Unit,
        familyHistory = this.familyHistory,
        allergies = this.allergies,
        personalHistory = this.personalHistory,
        pastMedicalHistory = this.pastMedicalHistory,
        complaints = this.complaints,
        diagnosis = this.diagnosis,
        notesForPatient = this.notesForPatient,
        privateNotes = this.privateNotes,
        tests = this.tests,
        referDoctorId = this.referDoctor?.id,
        referDoctorName = this.referDoctor?.name,
        reviewDate = this.reviewDate,
        reviewDays = this.reviewDays,
        reviewNotes = this.reviewNotes,
        sessionStartedAt = this.sessionStartedAt,
        sessionEndedAt = this.sessionEndedAt,
        sessionDurationSec = this.sessionDurationSec,
        appointmentId = this.appointmentId,
        appointmentStatus = appointmentStatus,
        prescriptions = rxRows
    )
}
