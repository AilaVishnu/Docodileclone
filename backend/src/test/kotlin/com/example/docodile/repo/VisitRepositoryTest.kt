package com.example.docodile.repo

import com.example.docodile.domain.Patient
import com.example.docodile.domain.Visit
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate

@DataJpaTest
@ActiveProfiles("test")
class VisitRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val visitRepository: VisitRepository
) {
    private lateinit var patient: Patient

    @BeforeEach
    fun setup() {
        patient = Patient(name = "Patient A")
        entityManager.persist(patient)
        entityManager.flush()
    }

    @Test
    fun `findAllByPatientIdOrderByVisitDateAscCreatedAtAsc returns ascending by visit_date`() {
        entityManager.persist(Visit(patient = patient, visitDate = LocalDate.of(2026, 5, 22)))
        entityManager.persist(Visit(patient = patient, visitDate = LocalDate.of(2026, 6, 12)))
        entityManager.flush()

        val found = visitRepository.findAllByPatientIdOrderByVisitDateAscCreatedAtAsc(patient.id)

        assertEquals(2, found.size)
        assertEquals(LocalDate.of(2026, 5, 22), found[0].visitDate)
        assertEquals(LocalDate.of(2026, 6, 12), found[1].visitDate)
    }

    @Test
    fun `findLastVisitDates returns latest date per patient`() {
        entityManager.persist(Visit(patient = patient, visitDate = LocalDate.of(2026, 5, 22)))
        entityManager.persist(Visit(patient = patient, visitDate = LocalDate.of(2026, 6, 12)))
        entityManager.flush()

        val rows = visitRepository.findLastVisitDates()
        assertEquals(1, rows.size)
        assertEquals(patient.id, rows[0].getPatientId())
        assertEquals(LocalDate.of(2026, 6, 12), rows[0].getLastVisitDate())
    }
}
