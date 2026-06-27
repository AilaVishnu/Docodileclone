package com.example.docodile.repo

import com.example.docodile.domain.Patient
import com.example.docodile.domain.RxRow
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
class RxRowRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val rxRowRepository: RxRowRepository
) {
    private lateinit var visit: Visit

    @BeforeEach
    fun setup() {
        val patient = Patient(name = "P")
        entityManager.persist(patient)
        visit = Visit(patient = patient, visitDate = LocalDate.now())
        entityManager.persist(visit)
        entityManager.flush()
    }

    @Test
    fun `findByVisitIdOrderByPositionAsc returns rows in position order`() {
        entityManager.persist(RxRow(visit = visit, position = 3, medicine = "C"))
        entityManager.persist(RxRow(visit = visit, position = 1, medicine = "A"))
        entityManager.persist(RxRow(visit = visit, position = 2, medicine = "B"))
        entityManager.flush()
        entityManager.clear()

        val rows = rxRowRepository.findByVisitIdOrderByPositionAsc(visit.id)

        assertEquals(listOf("A", "B", "C"), rows.map { it.medicine })
    }

    @Test
    fun `deleteByVisitId wipes all rows for that visit`() {
        entityManager.persist(RxRow(visit = visit, position = 1, medicine = "A"))
        entityManager.persist(RxRow(visit = visit, position = 2, medicine = "B"))
        entityManager.flush()

        val deleted = rxRowRepository.deleteByVisitId(visit.id)
        entityManager.clear()

        assertEquals(2, deleted)
        assertEquals(0, rxRowRepository.findByVisitIdOrderByPositionAsc(visit.id).size)
    }
}
