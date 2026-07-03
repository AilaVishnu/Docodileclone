package com.example.docodile.service

import com.example.docodile.domain.Patient
import com.example.docodile.domain.RxRow
import com.example.docodile.domain.Visit
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.web.RxRowDTO
import com.example.docodile.web.SaveVisitRequest
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class VisitServiceTest {

    @Mock private lateinit var visitRepository: VisitRepository
    @Mock private lateinit var rxRowRepository: RxRowRepository
    @Mock private lateinit var patientRepository: PatientRepository
    @Mock private lateinit var appUserRepository: AppUserRepository
    @Mock private lateinit var appointmentRepository: AppointmentRepository

    @InjectMocks private lateinit var visitService: VisitService

    @Test
    fun `update wipes existing rx rows before saving the new ones`() {
        val visitId = UUID.randomUUID()
        val patient = Patient(id = UUID.randomUUID())
        val existing = Visit(id = visitId, patient = patient, visitDate = LocalDate.now())

        `when`(visitRepository.findById(visitId)).thenReturn(Optional.of(existing))
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
    fun `get throws when visit is not found`() {
        val visitId = UUID.randomUUID()
        `when`(visitRepository.findById(visitId)).thenReturn(Optional.empty())

        assertThrows(IllegalArgumentException::class.java) {
            visitService.get(visitId)
        }
    }

    @Test
    fun `update rejects edits past the 24h edit window`() {
        val visitId = UUID.randomUUID()
        val patient = Patient(id = UUID.randomUUID())
        // Pad opened 3 days ago and ended; no appointment → finished. Well past
        // the 24h window measured from pad-open, so an update must be rejected.
        val stale = Visit(id = visitId, patient = patient, visitDate = LocalDate.now().minusDays(3))
        stale.sessionStartedAt = Instant.now().minusSeconds(3 * 24 * 3600)
        stale.sessionEndedAt = Instant.now().minusSeconds(3 * 24 * 3600 - 600)

        `when`(visitRepository.findById(visitId)).thenReturn(Optional.of(stale))

        assertThrows(ResponseStatusException::class.java) {
            visitService.update(visitId, SaveVisitRequest())
        }
    }

    private fun <T> anyList(): List<T> = org.mockito.ArgumentMatchers.anyList()
}
