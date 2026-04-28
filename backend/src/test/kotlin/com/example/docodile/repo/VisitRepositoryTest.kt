package com.example.docodile.repo

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.Patient
import com.example.docodile.domain.Tenant
import com.example.docodile.domain.Visit
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate
import java.util.UUID

@DataJpaTest
@ActiveProfiles("test")
class VisitRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val visitRepository: VisitRepository
) {
    private lateinit var tenant: Tenant
    private lateinit var clinicA: ClinicEntity
    private lateinit var clinicB: ClinicEntity
    private lateinit var patientA: Patient
    private lateinit var patientB: Patient

    @BeforeEach
    fun setup() {
        tenant = Tenant(name = "Test Tenant")
        entityManager.persist(tenant)

        clinicA = ClinicEntity(name = "Clinic A", tenant = tenant)
        clinicB = ClinicEntity(name = "Clinic B", tenant = tenant)
        entityManager.persist(clinicA)
        entityManager.persist(clinicB)

        patientA = Patient(name = "Patient A", clinic = clinicA)
        patientB = Patient(name = "Patient B", clinic = clinicB)
        entityManager.persist(patientA)
        entityManager.persist(patientB)

        entityManager.flush()
    }

    @Test
    fun `findAllByClinicIdAndPatientId returns ascending by visit_date for matching pair only`() {
        entityManager.persist(Visit(clinic = clinicA, patient = patientA, visitDate = LocalDate.of(2026, 5, 22)))
        entityManager.persist(Visit(clinic = clinicA, patient = patientA, visitDate = LocalDate.of(2026, 6, 12)))
        entityManager.persist(Visit(clinic = clinicB, patient = patientB, visitDate = LocalDate.of(2026, 4, 1))) // different clinic
        entityManager.flush()

        val found = visitRepository.findAllByClinicIdAndPatientIdOrderByVisitDateAsc(clinicA.id, patientA.id)

        assertEquals(2, found.size, "should only return visits for clinic A + patient A")
        assertEquals(LocalDate.of(2026, 5, 22), found[0].visitDate)
        assertEquals(LocalDate.of(2026, 6, 12), found[1].visitDate)
    }

    @Test
    fun `findByIdAndClinicId enforces cross-clinic guard`() {
        val visit = Visit(clinic = clinicA, patient = patientA, visitDate = LocalDate.now())
        entityManager.persist(visit)
        entityManager.flush()

        assertNotNull(visitRepository.findByIdAndClinicId(visit.id, clinicA.id))
        // Same visit ID, but a caller scoped to clinic B must not see it.
        assertNull(visitRepository.findByIdAndClinicId(visit.id, clinicB.id))
        // Random ID — also null.
        assertNull(visitRepository.findByIdAndClinicId(UUID.randomUUID(), clinicA.id))
    }

    @Test
    fun `findLastVisitDatesByClinic returns latest date per patient scoped to clinic`() {
        entityManager.persist(Visit(clinic = clinicA, patient = patientA, visitDate = LocalDate.of(2026, 5, 22)))
        entityManager.persist(Visit(clinic = clinicA, patient = patientA, visitDate = LocalDate.of(2026, 6, 12)))
        entityManager.persist(Visit(clinic = clinicB, patient = patientB, visitDate = LocalDate.of(2026, 4, 1)))
        entityManager.flush()

        val rows = visitRepository.findLastVisitDatesByClinic(clinicA.id)
        assertEquals(1, rows.size, "only patientA should appear for clinicA")
        assertEquals(patientA.id, rows[0].getPatientId())
        assertEquals(LocalDate.of(2026, 6, 12), rows[0].getLastVisitDate())
    }
}
