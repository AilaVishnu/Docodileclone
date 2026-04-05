package com.example.docodile.repo

import com.example.docodile.domain.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
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
}
