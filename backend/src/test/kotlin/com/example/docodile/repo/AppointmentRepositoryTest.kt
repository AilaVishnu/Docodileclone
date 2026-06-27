package com.example.docodile.repo

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Patient
import com.example.docodile.domain.Role
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDateTime

@DataJpaTest
@ActiveProfiles("test")
class AppointmentRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val appointmentRepository: AppointmentRepository
) {

    private lateinit var patient: Patient
    private lateinit var doctor: AppUser

    @BeforeEach
    fun setup() {
        patient = Patient(name = "Test Patient")
        entityManager.persist(patient)

        doctor = AppUser(email = "doctor@example.com", role = Role.DOCTOR)
        entityManager.persist(doctor)

        entityManager.flush()
    }

    @Test
    fun `should find appointments between scheduled times`() {
        val now = LocalDateTime.of(2023, 10, 10, 10, 0)
        val appointment = Appointment(
            patient = patient,
            doctor = doctor,
            scheduledTime = now
        )
        entityManager.persist(appointment)
        entityManager.flush()

        val found = appointmentRepository.findAllByScheduledTimeBetween(
            now.minusHours(1),
            now.plusHours(1)
        )
        assertEquals(1, found.size)

        val notFound = appointmentRepository.findAllByScheduledTimeBetween(
            now.plusHours(2),
            now.plusHours(3)
        )
        assertTrue(notFound.isEmpty())
    }
}
