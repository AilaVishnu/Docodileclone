package com.example.docodile.service

import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
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

    @Mock
    private lateinit var currentUser: CurrentUser

    @InjectMocks
    private lateinit var patientService: PatientService

    @Test
    fun `should list patients for the current clinic`() {
        val clinicId = UUID.randomUUID()
        val patients = listOf(Patient(id = UUID.randomUUID(), name = "Alice"))

        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(patientRepository.findAllByClinicId(clinicId)).thenReturn(patients)

        val result = patientService.listPatients()

        assertEquals(1, result.size)
        assertEquals("Alice", result[0].name)
    }
}
