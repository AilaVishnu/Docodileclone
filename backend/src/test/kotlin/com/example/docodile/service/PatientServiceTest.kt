package com.example.docodile.service

import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.VisitRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.Instant
import java.time.LocalDate
import java.util.*

@ExtendWith(MockitoExtension::class)
class PatientServiceTest {

    @Mock
    private lateinit var patientRepository: PatientRepository

    @Mock
    private lateinit var visitRepository: VisitRepository

    @Mock
    private lateinit var appointmentRepository: AppointmentRepository

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @InjectMocks
    private lateinit var patientService: PatientService

    @Test
    fun `should list active patients`() {
        val patients = listOf(Patient(id = UUID.randomUUID(), name = "Alice"))

        `when`(patientRepository.findAllByDeletedAtIsNull()).thenReturn(patients)

        val result = patientService.listPatients()

        assertEquals(1, result.size)
        assertEquals("Alice", result[0].name)
    }

    @Test
    fun `findOrCreate creates a new patient with the next display number when none matches`() {
        `when`(patientRepository.findAllByDeletedAtIsNull()).thenReturn(emptyList())
        `when`(patientRepository.findMaxDisplayNo()).thenReturn(40)
        `when`(patientRepository.save(any(Patient::class.java))).thenAnswer { it.arguments[0] }

        val p = patientService.findOrCreate("Asha", "+91 98765 43210", "a@x.com", "Female", "1990-05-01", null)

        assertEquals("Asha", p.name)
        assertEquals(41, p.displayNo)                 // next free T### number
        assertEquals(LocalDate.of(1990, 5, 1), p.dob) // ISO dob parsed
    }

    @Test
    fun `findOrCreate reuses an existing patient with the same phone and name`() {
        val existing = Patient(id = UUID.randomUUID(), name = "Asha", phone = "+91 98765 43210", createdAt = Instant.now())
        `when`(patientRepository.findAllByDeletedAtIsNull()).thenReturn(listOf(existing))
        `when`(patientRepository.save(any(Patient::class.java))).thenAnswer { it.arguments[0] }

        // Different formatting + case, same person → the existing record.
        val p = patientService.findOrCreate("asha", "9876543210", "new@x.com", "Female", null, 360)

        assertEquals(existing.id, p.id)
        assertEquals("new@x.com", p.email)              // mutable fields refreshed
        verify(patientRepository, never()).findMaxDisplayNo() // no new number assigned
    }

    @Test
    fun `findOrCreate creates a new patient when the phone matches but the name differs`() {
        // Families share a mobile: same number, different name → a new patient.
        val existing = Patient(id = UUID.randomUUID(), name = "Ravi", phone = "+91 98765 43210", createdAt = Instant.now())
        `when`(patientRepository.findAllByDeletedAtIsNull()).thenReturn(listOf(existing))
        `when`(patientRepository.findMaxDisplayNo()).thenReturn(7)
        `when`(patientRepository.save(any(Patient::class.java))).thenAnswer { it.arguments[0] }

        val p = patientService.findOrCreate("Sita", "9876543210", null, "Female", null, null)

        assertEquals("Sita", p.name)
        assertEquals(8, p.displayNo)
        assertNotEquals(existing.id, p.id)
    }
}
