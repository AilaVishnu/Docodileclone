package com.example.docodile.repo

import com.example.docodile.domain.Bill
import com.example.docodile.domain.Patient
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@DataJpaTest
@ActiveProfiles("test")
class BillRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val billRepository: BillRepository,
) {

    private lateinit var asha: Patient
    private lateinit var ravi: Patient

    @BeforeEach
    fun setup() {
        asha = Patient(name = "Asha")
        ravi = Patient(name = "Ravi")
        entityManager.persist(asha)
        entityManager.persist(ravi)
        entityManager.flush()
    }

    private fun bill(patient: Patient, seq: Int, billDate: LocalDate): Bill {
        val b = Bill(
            patient = patient,
            invoiceNo = "INV_" + seq.toString().padStart(4, '0'),
            seq = seq,
            billDate = billDate,
            billed = BigDecimal("100"),
            paid = BigDecimal("100"),
            due = BigDecimal.ZERO,
            refund = BigDecimal.ZERO,
        )
        entityManager.persist(b)
        return b
    }

    @Test
    fun `maxSeq is zero with no bills and the highest seq otherwise`() {
        assertEquals(0, billRepository.maxSeq())

        bill(asha, seq = 1, billDate = LocalDate.now())
        bill(ravi, seq = 7, billDate = LocalDate.now())
        bill(asha, seq = 3, billDate = LocalDate.now())
        entityManager.flush()

        // maxSeq is schema-wide (not per-patient) — the invoice counter is shared.
        assertEquals(7, billRepository.maxSeq())
    }

    @Test
    fun `findHistory returns only that patient's bills, newest seq first`() {
        bill(asha, seq = 1, billDate = LocalDate.now().minusDays(2))
        bill(asha, seq = 4, billDate = LocalDate.now())
        bill(ravi, seq = 2, billDate = LocalDate.now()) // other patient — must not appear
        entityManager.flush()
        entityManager.clear()

        val history = billRepository.findHistory(asha.id)

        assertEquals(listOf(4, 1), history.map { it.seq })
    }

    @Test
    fun `findClinicBills includes both bounds and orders newest seq first`() {
        bill(asha, seq = 1, billDate = LocalDate.of(2026, 6, 1))   // lower bound (inclusive)
        bill(ravi, seq = 2, billDate = LocalDate.of(2026, 6, 15))
        bill(asha, seq = 3, billDate = LocalDate.of(2026, 6, 30))  // upper bound (inclusive)
        bill(ravi, seq = 4, billDate = LocalDate.of(2026, 7, 5))   // past the upper bound — excluded
        entityManager.flush()
        entityManager.clear()

        val inRange = billRepository.findClinicBills(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30))

        assertEquals(listOf(3, 2, 1), inRange.map { it.seq })
    }

    @Test
    fun `countByPatientForDate groups a day's bills per patient`() {
        val today = LocalDate.now()
        bill(asha, seq = 1, billDate = today)
        bill(asha, seq = 2, billDate = today)
        bill(ravi, seq = 3, billDate = today)
        bill(ravi, seq = 4, billDate = today.minusDays(1)) // different day — excluded
        entityManager.flush()
        entityManager.clear()

        val counts = billRepository.countByPatientForDate(today)
            .associate { it[0] as UUID to (it[1] as Number).toLong() }

        assertEquals(2L, counts[asha.id])
        assertEquals(1L, counts[ravi.id])
    }
}
