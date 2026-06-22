package com.example.docodile.repo

import com.example.docodile.domain.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@DataJpaTest
@ActiveProfiles("test")
class AppointmentRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val appointmentRepository: AppointmentRepository
) {

    private lateinit var tenant: Tenant
    private lateinit var clinic: ClinicEntity
    private lateinit var patient: Patient
    private lateinit var doctor: AppUser

    @BeforeEach
    fun setup() {
        tenant = Tenant(name = "Test Tenant")
        entityManager.persist(tenant)

        clinic = ClinicEntity(name = "Test Clinic", tenant = tenant)
        entityManager.persist(clinic)

        patient = Patient(name = "Test Patient", clinic = clinic)
        entityManager.persist(patient)

        doctor = AppUser(email = "doctor@example.com", role = Role.DOCTOR, tenant = tenant)
        entityManager.persist(doctor)

        entityManager.flush()
    }

    @Test
    fun `should find appointments by clinic id`() {
        val appointment = Appointment(
            clinic = clinic,
            patient = patient,
            doctor = doctor,
            scheduledTime = LocalDateTime.now()
        )
        entityManager.persist(appointment)
        entityManager.flush()

        val found = appointmentRepository.findAllByClinicId(clinic.id)
        assertEquals(1, found.size)
        assertEquals(appointment.id, found[0].id)
    }

    @Test
    fun `should find appointments between scheduled times`() {
        val now = LocalDateTime.of(2023, 10, 10, 10, 0)
        val appointment = Appointment(
            clinic = clinic,
            patient = patient,
            doctor = doctor,
            scheduledTime = now
        )
        entityManager.persist(appointment)
        entityManager.flush()

        val found = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(
            clinic.id,
            now.minusHours(1),
            now.plusHours(1)
        )
        assertEquals(1, found.size)

        val notFound = appointmentRepository.findAllByClinicIdAndScheduledTimeBetween(
            clinic.id,
            now.plusHours(2),
            now.plusHours(3)
        )
        assertTrue(notFound.isEmpty())
    }

    @Test
    fun `markStaleAtDocAsUnseen flips only never-opened stale At-Doc appointments`() {
        val cutoff: LocalDateTime = LocalDate.now().atStartOfDay()
        val stale = cutoff.minusHours(2)        // before today's start
        val todayLater = cutoff.plusHours(2)    // today, not yet stale

        // (1) Stale At-Doc (IN_PROGRESS) with NO started visit → should flip.
        val neverOpened = Appointment(
            clinic = clinic, patient = patient, doctor = doctor,
            scheduledTime = stale, status = "IN_PROGRESS"
        )
        entityManager.persist(neverOpened)

        // (2) Stale At-Doc WITH a started visit (pad was opened) → must NOT flip.
        val opened = Appointment(
            clinic = clinic, patient = patient, doctor = doctor,
            scheduledTime = stale, status = "IN_PROGRESS"
        )
        entityManager.persist(opened)
        entityManager.persist(
            Visit(clinic = clinic, patient = patient, appointmentId = opened.id, sessionStartedAt = Instant.now())
        )

        // (3) Legacy AT_DOC alias, stale, never opened → should also flip.
        val legacyAtDoc = Appointment(
            clinic = clinic, patient = patient, doctor = doctor,
            scheduledTime = stale, status = "AT_DOC"
        )
        entityManager.persist(legacyAtDoc)

        // (4) Today's At-Doc (not yet stale) → must NOT flip.
        val todayAtDoc = Appointment(
            clinic = clinic, patient = patient, doctor = doctor,
            scheduledTime = todayLater, status = "IN_PROGRESS"
        )
        entityManager.persist(todayAtDoc)

        // (5) Stale WAITING → handled by the no-show sweep, not this one.
        val waiting = Appointment(
            clinic = clinic, patient = patient, doctor = doctor,
            scheduledTime = stale, status = "WAITING"
        )
        entityManager.persist(waiting)

        entityManager.flush()
        entityManager.clear()

        val touched = appointmentRepository.markStaleAtDocAsUnseen(cutoff)
        assertEquals(2, touched) // neverOpened + legacyAtDoc

        assertEquals("UNSEEN", appointmentRepository.findById(neverOpened.id).get().status)
        assertEquals("UNSEEN", appointmentRepository.findById(legacyAtDoc.id).get().status)
        assertEquals("IN_PROGRESS", appointmentRepository.findById(opened.id).get().status)
        assertEquals("IN_PROGRESS", appointmentRepository.findById(todayAtDoc.id).get().status)
        assertEquals("WAITING", appointmentRepository.findById(waiting.id).get().status)
    }
}
