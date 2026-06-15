package com.example.docodile.service

import jakarta.mail.internet.MimeMessage
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.mail.MailSendException
import org.springframework.mail.javamail.JavaMailSender

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class EmailServiceTest {

    @Mock
    private lateinit var mailSender: JavaMailSender

    @InjectMocks
    private lateinit var emailService: EmailService

    private fun stubMimeMessage() {
        whenever(mailSender.createMimeMessage())
            .thenReturn(MimeMessage(null as jakarta.mail.Session?))
    }

    // ---------------------------------------------------------------------
    // sendPasswordResetEmail
    // ---------------------------------------------------------------------

    @Test
    fun `sendPasswordResetEmail builds a message and sends it`() {
        stubMimeMessage()

        emailService.sendPasswordResetEmail("u@example.com", "Alice", "https://link")

        verify(mailSender, times(1)).createMimeMessage()
        verify(mailSender, times(1)).send(any<MimeMessage>())
    }

    @Test
    fun `sendPasswordResetEmail swallows MailException`() {
        stubMimeMessage()
        whenever(mailSender.send(any<MimeMessage>())).thenThrow(MailSendException("smtp down"))

        assertDoesNotThrow {
            emailService.sendPasswordResetEmail("u@example.com", "Alice", "https://link")
        }
    }

    // ---------------------------------------------------------------------
    // sendWelcomeEmail
    // ---------------------------------------------------------------------

    @Test
    fun `sendWelcomeEmail builds a message and sends it`() {
        stubMimeMessage()

        emailService.sendWelcomeEmail("u@example.com", "Bob", "Acme Clinic", "https://setup")

        verify(mailSender, times(1)).createMimeMessage()
        verify(mailSender, times(1)).send(any<MimeMessage>())
    }

    @Test
    fun `sendWelcomeEmail swallows MailException`() {
        stubMimeMessage()
        whenever(mailSender.send(any<MimeMessage>())).thenThrow(MailSendException("smtp down"))

        assertDoesNotThrow {
            emailService.sendWelcomeEmail("u@example.com", "Bob", "Acme Clinic", "https://setup")
        }
    }

    // ---------------------------------------------------------------------
    // sendCorrectionComplete
    // ---------------------------------------------------------------------

    @Test
    fun `sendCorrectionComplete approved builds a message and sends it`() {
        stubMimeMessage()

        emailService.sendCorrectionComplete("u@example.com", "Name", "New Name", approved = true)

        verify(mailSender, times(1)).createMimeMessage()
        verify(mailSender, times(1)).send(any<MimeMessage>())
    }

    @Test
    fun `sendCorrectionComplete rejected builds a message and sends it`() {
        stubMimeMessage()

        emailService.sendCorrectionComplete("u@example.com", "Name", "New Name", approved = false)

        verify(mailSender, times(1)).createMimeMessage()
        verify(mailSender, times(1)).send(any<MimeMessage>())
    }

    @Test
    fun `sendCorrectionComplete swallows MailException`() {
        stubMimeMessage()
        whenever(mailSender.send(any<MimeMessage>())).thenThrow(MailSendException("smtp down"))

        assertDoesNotThrow {
            emailService.sendCorrectionComplete("u@example.com", "Name", "New Name", approved = true)
        }
    }
}
