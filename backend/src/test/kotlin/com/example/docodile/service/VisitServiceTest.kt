package com.example.docodile.service

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.Patient
import com.example.docodile.domain.RxRow
import com.example.docodile.domain.Visit
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.RxRowDTO
import com.example.docodile.web.SaveVisitRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class VisitServiceTest {

    @Mock private lateinit var visitRepository: VisitRepository
    @Mock private lateinit var rxRowRepository: RxRowRepository
    @Mock private lateinit var patientRepository: PatientRepository
    @Mock private lateinit var clinicEntityRepository: ClinicEntityRepository
    @Mock private lateinit var appUserRepository: AppUserRepository
    @Mock private lateinit var currentUser: CurrentUser

    @InjectMocks private lateinit var visitService: VisitService

    @Test
    fun `update wipes existing rx rows before saving the new ones`() {
        val clinicId = UUID.randomUUID()
        val visitId = UUID.randomUUID()
        val clinic = ClinicEntity(id = clinicId, name = "C")
        val patient = Patient(id = UUID.randomUUID(), clinic = clinic)
        val existing = Visit(id = visitId, clinic = clinic, patient = patient, visitDate = LocalDate.now())

        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(visitRepository.findByIdAndClinicId(visitId, clinicId)).thenReturn(existing)
        `when`(visitRepository.save(any(Visit::class.java))).thenAnswer { it.arguments[0] }
        `when`(rxRowRepository.saveAll(anyList<RxRow>())).thenAnswer { it.arguments[0] as List<RxRow> }

        val request = SaveVisitRequest(
            complaints = "updated complaints",
            prescriptions = listOf(
                RxRowDTO(position = 1, medicine = "Paracetamol"),
                RxRowDTO(position = 2, medicine = "Vitamin C")
            )
        )

        visitService.update(visitId, request)

        // Old rows must be wiped before new ones are saved.
        verify(rxRowRepository).deleteByVisitId(visitId)

        // New rows have the right positions / medicines.
        @Suppress("UNCHECKED_CAST")
        val captor = ArgumentCaptor.forClass(MutableList::class.java) as ArgumentCaptor<List<RxRow>>
        verify(rxRowRepository).saveAll(captor.capture())
        val saved = captor.value
        assertEquals(2, saved.size)
        assertEquals("Paracetamol", saved[0].medicine)
        assertEquals(1.toShort(), saved[0].position)
        assertEquals("Vitamin C", saved[1].medicine)
    }

    @Test
    fun `get throws when visit does not belong to caller's clinic`() {
        val clinicId = UUID.randomUUID()
        val otherClinicVisitId = UUID.randomUUID()
        `when`(currentUser.clinicId()).thenReturn(clinicId)
        `when`(visitRepository.findByIdAndClinicId(otherClinicVisitId, clinicId)).thenReturn(null)

        assertThrows(IllegalArgumentException::class.java) {
            visitService.get(otherClinicVisitId)
        }
    }

    @Test
    fun `create rejects patient from a different clinic`() {
        val callerClinicId = UUID.randomUUID()
        val otherClinic = ClinicEntity(id = UUID.randomUUID(), name = "Other")
        val patient = Patient(id = UUID.randomUUID(), clinic = otherClinic) // belongs to a different clinic

        `when`(currentUser.clinicId()).thenReturn(callerClinicId)
        `when`(clinicEntityRepository.findById(callerClinicId)).thenReturn(
            Optional.of(ClinicEntity(id = callerClinicId, name = "Mine"))
        )
        `when`(patientRepository.findById(patient.id)).thenReturn(Optional.of(patient))

        val ex = assertThrows(IllegalArgumentException::class.java) {
            visitService.create(patient.id, SaveVisitRequest())
        }
        assertNotNull(ex.message)
    }

    private fun <T> anyList(): List<T> = org.mockito.ArgumentMatchers.anyList()
}
