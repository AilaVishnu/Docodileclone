package com.example.docodile.service

import com.example.docodile.repo.AppointmentRepository
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class NoShowSweepJobTest {

    @Mock
    private lateinit var appointmentRepository: AppointmentRepository

    @InjectMocks
    private lateinit var noShowSweepJob: NoShowSweepJob

    @Test
    fun `sweepNightly invokes the bulk no-show update`() {
        whenever(appointmentRepository.markBookedBeforeAsNoShow(any())).thenReturn(3)

        noShowSweepJob.sweepNightly()

        verify(appointmentRepository, times(1)).markBookedBeforeAsNoShow(any())
    }

    @Test
    fun `sweepOnBoot invokes the bulk no-show update`() {
        whenever(appointmentRepository.markBookedBeforeAsNoShow(any())).thenReturn(0)

        noShowSweepJob.sweepOnBoot()

        verify(appointmentRepository, times(1)).markBookedBeforeAsNoShow(any())
    }

    @Test
    fun `sweep uses start-of-today as the cutoff`() {
        whenever(appointmentRepository.markBookedBeforeAsNoShow(any())).thenReturn(0)

        noShowSweepJob.sweepNightly()

        val captor = argumentCaptor<LocalDateTime>()
        verify(appointmentRepository).markBookedBeforeAsNoShow(captor.capture())
        org.junit.jupiter.api.Assertions.assertEquals(
            LocalDate.now().atStartOfDay(),
            captor.firstValue
        )
    }

    @Test
    fun `sweep does not throw when no rows are touched`() {
        whenever(appointmentRepository.markBookedBeforeAsNoShow(any())).thenReturn(0)

        assertDoesNotThrow { noShowSweepJob.sweepNightly() }
    }
}
