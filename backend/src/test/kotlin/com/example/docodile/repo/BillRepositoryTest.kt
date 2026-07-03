package com.example.docodile.repo

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Appointment
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
import java.time.LocalDateTime
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

    private fun bill(patient: Patient, seq: Int, billDate: LocalDate, due: BigDecimal = BigDecimal.ZERO, refund: BigDecimal = BigDecimal.ZERO): Bill {
        val b = Bill(
            patient = patient,
            invoiceNo = "INV_" + seq.toString().padStart(4, '0'),
            seq = seq,
            billDate = billDate,
            billed = BigDecimal("100"),
            paid = BigDecimal("100") - due,
            due = due,
            refund = refund,
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
    fun `billStatsByPatientForDate groups a day's bills per patient with due and refund totals`() {
        val today = LocalDate.now()
        bill(asha, seq = 1, billDate = today)                          // fully paid
        bill(asha, seq = 2, billDate = today, due = BigDecimal("40"))  // still owes 40
        bill(ravi, seq = 3, billDate = today, refund = BigDecimal("100")) // refunded
        bill(ravi, seq = 4, billDate = today.minusDays(1))            // different day — excluded
        entityManager.flush()
        entityManager.clear()

        val stats = billRepository.billStatsByPatientForDate(today)
            .associate { it[0] as UUID to Triple((it[1] as Number).toLong(), it[2] as BigDecimal, it[3] as BigDecimal) }

        assertEquals(2L, stats[asha.id]?.first)
        assertEquals(0, stats[asha.id]!!.second.compareTo(BigDecimal("40")))  // due
        assertEquals(0, stats[asha.id]!!.third.compareTo(BigDecimal.ZERO))    // no refund
        assertEquals(1L, stats[ravi.id]?.first)
        assertEquals(0, stats[ravi.id]!!.second.compareTo(BigDecimal.ZERO))   // no due
        assertEquals(0, stats[ravi.id]!!.third.compareTo(BigDecimal("100")))  // refunded 100
    }

    @Test
    fun `billStatsByAppointment keys each visit's bill to its own appointment`() {
        val doctor = AppUser(name = "Dr. Smith")
        entityManager.persist(doctor)
        val apt1 = Appointment(patient = asha, doctor = doctor, scheduledTime = LocalDateTime.now())
        val apt2 = Appointment(patient = asha, doctor = doctor, scheduledTime = LocalDateTime.now())
        entityManager.persist(apt1)
        entityManager.persist(apt2)
        entityManager.flush()

        // Same patient, two visits: apt1's bill is paid, apt2's bill is refunded.
        billLinked(apt1, seq = 1)
        billLinked(apt2, seq = 2, refund = BigDecimal("100"))
        entityManager.flush()
        entityManager.clear()

        val stats = billRepository.billStatsByAppointment(listOf(apt1.id!!, apt2.id!!))
            .associate { it[0] as UUID to Triple((it[1] as Number).toLong(), it[2] as BigDecimal, it[3] as BigDecimal) }

        // The refund stays on apt2 — apt1 (the other visit) is not coloured by it.
        assertEquals(0, stats[apt1.id]!!.third.compareTo(BigDecimal.ZERO))
        assertEquals(0, stats[apt2.id]!!.third.compareTo(BigDecimal("100")))
    }

    private fun billLinked(appt: Appointment, seq: Int, due: BigDecimal = BigDecimal.ZERO, refund: BigDecimal = BigDecimal.ZERO): Bill {
        val b = Bill(
            patient = asha,
            appointment = appt,
            invoiceNo = "INV_" + seq.toString().padStart(4, '0'),
            seq = seq,
            billDate = LocalDate.now(),
            billed = BigDecimal("100"),
            paid = BigDecimal("100") - due,
            due = due,
            refund = refund,
        )
        entityManager.persist(b)
        return b
    }
}
