package com.example.docodile.service

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.MigrationRun
import com.example.docodile.domain.Patient
import com.example.docodile.domain.RxRow
import com.example.docodile.domain.Visit
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.MigrationRunRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class HealthPlixMigrationServiceTest {

    @Mock private lateinit var patientRepository: PatientRepository
    @Mock private lateinit var visitRepository: VisitRepository
    @Mock private lateinit var rxRowRepository: RxRowRepository
    @Mock private lateinit var clinicEntityRepository: ClinicEntityRepository
    @Mock private lateinit var migrationRunRepository: MigrationRunRepository
    @Mock private lateinit var currentUser: CurrentUser
    @Mock private lateinit var entityManager: EntityManager

    @InjectMocks
    private lateinit var service: HealthPlixMigrationService

    private val clinicId: UUID = UUID.randomUUID()
    private val clinic = ClinicEntity(id = clinicId, name = "Test Clinic")

    private fun baseStubs(
        existingPatients: List<Patient> = emptyList(),
        existingVisits: List<Visit> = emptyList(),
        takenDisplayNos: List<Int> = emptyList(),
    ) {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId)).thenReturn(Optional.of(clinic))
        whenever(patientRepository.findAllByClinicIdAndExternalRefIsNotNull(clinicId)).thenReturn(existingPatients)
        whenever(visitRepository.findAllByClinicIdAndExternalRefIsNotNull(clinicId)).thenReturn(existingVisits)
        whenever(patientRepository.findDisplayNosByClinicId(clinicId)).thenReturn(takenDisplayNos)
    }

    // ── creation counts ───────────────────────────────────────────────────

    @Test
    fun `migrate creates a new patient via entityManager persist`() {
        baseStubs()
        val patientsCsv = """
            ID,name,phone_number,email_id,Sex,age,dob,created_on
            T960,John Doe,9991112222,JOHN@X.COM,Male,40,,06.Jan.2025
        """.trimIndent()

        val result = service.migrate(patientsCsv, null, null, null)

        assertEquals(1, result.patients)
        verify(entityManager, times(1)).persist(any<Patient>())
    }

    @Test
    fun `migrate creates patient, visit and rx rows from the four exports`() {
        baseStubs()
        val patientsCsv = """
            ID,name,phone_number,email_id,Sex,age,dob,created_on
            T100,Jane Roe,,,Female,30,,
        """.trimIndent()
        val clinicalCsv = """
            org_person_bid_str,visit_date,diagnosis_temp,complaints,tests_advised,next_visit_date
            T100,21-04-25,Viral Fever,Fever,CBC,
        """.trimIndent()
        val medicationsCsv = "patient_id,visit_date,pres\n" +
            "T100,21-04-25,\"Medicine: Paracetamol|Dosage: 1.0-0-1.0|When: After food|Duration: 5 days|Notes: hydrate\"\n"

        val result = service.migrate(patientsCsv, clinicalCsv, null, medicationsCsv)

        assertEquals(1, result.patients)
        assertEquals(1, result.visits)
        assertEquals(1, result.prescriptions)
        assertEquals(1, result.medicines)
        // 1 patient + 1 visit + 1 rx row persisted
        verify(entityManager, times(1)).persist(any<Patient>())
        verify(entityManager, times(1)).persist(any<Visit>())
        verify(entityManager, times(1)).persist(any<RxRow>())
        verify(migrationRunRepository, times(1)).save(any<MigrationRun>())
    }

    // ── field mapping ─────────────────────────────────────────────────────

    @Test
    fun `migrate stores HealthPlix age in years as months`() {
        baseStubs()
        val patientsCsv = """
            ID,name,age,Sex
            T7,Aged Patient,40,Male
        """.trimIndent()

        service.migrate(patientsCsv, null, null, null)

        val captor = argumentCaptor<Patient>()
        verify(entityManager).persist(captor.capture())
        // 40 years → 480 months
        assertEquals(480, captor.firstValue.age)
        assertEquals("Aged Patient", captor.firstValue.name)
    }

    @Test
    fun `migrate keeps the numeric part of the HealthPlix id as display number`() {
        baseStubs()
        val patientsCsv = """
            ID,name
            T960,Numbered Patient
        """.trimIndent()

        service.migrate(patientsCsv, null, null, null)

        val captor = argumentCaptor<Patient>()
        verify(entityManager).persist(captor.capture())
        assertEquals(960, captor.firstValue.displayNo)
        assertEquals("T960", captor.firstValue.externalRef)
    }

    @Test
    fun `migrate parses HealthPlix dd-MM-yy visit date`() {
        baseStubs()
        val patientsCsv = """
            ID,name
            T100,Jane Roe
        """.trimIndent()
        val clinicalCsv = """
            org_person_bid_str,visit_date,diagnosis_temp,complaints
            T100,21-04-25,Viral,Fever
        """.trimIndent()

        service.migrate(patientsCsv, clinicalCsv, null, null)

        val captor = argumentCaptor<Visit>()
        verify(entityManager).persist(captor.capture())
        assertEquals(LocalDate.of(2025, 4, 21), captor.firstValue.visitDate)
        assertEquals("Viral", captor.firstValue.diagnosis)
        assertEquals("T100|2025-04-21", captor.firstValue.externalRef)
    }

    @Test
    fun `migrate normalizes the dose pattern into frequency on the rx row`() {
        baseStubs()
        val patientsCsv = "ID,name\nT100,Jane Roe\n"
        val medicationsCsv = "patient_id,visit_date,pres\n" +
            "T100,21-04-25,\"Medicine: Crocin|Dosage: 1.0-0-1.0-0|When: After food|Duration: 3 days\"\n"

        service.migrate(patientsCsv, null, null, medicationsCsv)

        val captor = argumentCaptor<RxRow>()
        verify(entityManager).persist(captor.capture())
        val rx = captor.firstValue
        assertEquals("Crocin", rx.medicine)
        // whole-number floats collapse to ints
        assertEquals("1-0-1-0", rx.frequency)
        assertEquals("After food", rx.whenToTake)
        assertEquals("3 days", rx.duration)
    }

    // ── idempotency ───────────────────────────────────────────────────────

    @Test
    fun `re-running with same external_ref updates existing patient without inserting`() {
        val existing = Patient(
            id = UUID.randomUUID(),
            clinic = clinic,
            name = "Old Name",
            externalRef = "T100",
            displayNo = 100,
        )
        baseStubs(existingPatients = listOf(existing), takenDisplayNos = listOf(100))
        val patientsCsv = """
            ID,name,phone_number
            T100,New Name,9998887777
        """.trimIndent()

        val result = service.migrate(patientsCsv, null, null, null)

        // counts both new and updated → 1
        assertEquals(1, result.patients)
        // existing managed entity is mutated, NOT persisted again
        verify(entityManager, never()).persist(any<Patient>())
        assertEquals("New Name", existing.name)
        assertEquals("9998887777", existing.phone)
    }

    @Test
    fun `re-running with same visit external_ref reuses existing visit and clears its rx`() {
        val existingPatient = Patient(
            id = UUID.randomUUID(), clinic = clinic, name = "Jane", externalRef = "T100", displayNo = 100,
        )
        val existingVisit = Visit(
            id = UUID.randomUUID(),
            clinic = clinic,
            patient = existingPatient,
            visitDate = LocalDate.of(2025, 4, 21),
            externalRef = "T100|2025-04-21",
        )
        baseStubs(
            existingPatients = listOf(existingPatient),
            existingVisits = listOf(existingVisit),
            takenDisplayNos = listOf(100),
        )
        val clinicalCsv = """
            org_person_bid_str,visit_date,diagnosis_temp
            T100,21-04-25,Updated Dx
        """.trimIndent()
        val medicationsCsv = "patient_id,visit_date,pres\n" +
            "T100,21-04-25,\"Medicine: Crocin|Dosage: 1.0\"\n"

        val result = service.migrate(null, clinicalCsv, null, medicationsCsv)

        assertEquals(1, result.visits)
        // no new patient or visit persisted — both reused
        verify(entityManager, never()).persist(any<Patient>())
        verify(entityManager, never()).persist(any<Visit>())
        // pre-existing visit's stale rx rows are bulk-deleted before reinsert
        verify(rxRowRepository, times(1)).deleteByVisitIdIn(any())
        // new rx row IS persisted
        verify(entityManager, times(1)).persist(any<RxRow>())
        // existing visit mutated in place
        assertEquals("Updated Dx", existingVisit.diagnosis)
    }

    // ── header validation ─────────────────────────────────────────────────

    @Test
    fun `migrate rejects a file dropped into the wrong slot`() {
        baseStubs()
        // This CSV is missing the Patients-slot required columns (ID, name)
        val wrongFile = """
            foo,bar
            1,2
        """.trimIndent()

        val ex = org.junit.jupiter.api.assertThrows<IllegalArgumentException> {
            service.migrate(wrongFile, null, null, null)
        }
        assertTrue(ex.message!!.contains("Patients"))
        verify(entityManager, never()).persist(any())
    }

    // ── stub patient on dangling reference ────────────────────────────────

    @Test
    fun `clinical row referencing an unknown patient creates a stub patient`() {
        baseStubs()
        // No patients CSV — the clinical row references T500 which doesn't exist
        val clinicalCsv = """
            org_person_bid_str,visit_date,complaints
            T500,21-04-25,Headache
        """.trimIndent()

        val result = service.migrate(null, clinicalCsv, null, null)

        // a stub patient + a visit are both created
        assertEquals(1, result.patients)
        assertEquals(1, result.visits)
        verify(entityManager, times(1)).persist(any<Patient>())
        verify(entityManager, times(1)).persist(any<Visit>())
        assertTrue(result.warnings.any { it.contains("T500") })
    }

    // ── migration run record ──────────────────────────────────────────────

    @Test
    fun `migrate records a HealthPlix migration run with totals`() {
        baseStubs()
        val patientsCsv = "ID,name\nT1,A\nT2,B\n"

        service.migrate(patientsCsv, null, null, null)

        val captor = argumentCaptor<MigrationRun>()
        verify(migrationRunRepository).save(captor.capture())
        val run = captor.firstValue
        assertEquals("HealthPlix", run.platform)
        assertEquals(2, run.patients)
        assertNotNull(run.clinic)
    }
}
