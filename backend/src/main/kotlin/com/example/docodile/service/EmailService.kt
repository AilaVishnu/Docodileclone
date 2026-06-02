package com.example.docodile.service

import jakarta.mail.internet.MimeMessage
import org.slf4j.LoggerFactory
import org.springframework.mail.MailException
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class EmailService(private val mailSender: JavaMailSender) {

    private val log = LoggerFactory.getLogger(EmailService::class.java)

    @Async
    fun sendWelcomeEmail(to: String, name: String, clinicName: String, setupLink: String) {
        try {
            val msg: MimeMessage = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(msg, false, "UTF-8")
            helper.setTo(to)
            helper.setSubject("Welcome to $clinicName - Setup your password")
            helper.setText(buildWelcomeHtml(name, clinicName, setupLink), true)
            mailSender.send(msg)
            log.info("Welcome email sent to {}", to)
        } catch (e: MailException) {
            log.error("Failed to send welcome email to {}: {}", to, e.message)
        } catch (e: Exception) {
            log.error("Unexpected error sending welcome email to {}: {}", to, e.message)
        }
    }

    private fun buildWelcomeHtml(name: String, clinicName: String, setupLink: String): String = """
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0"
                     style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                <tr><td>
                  <h1 style="font-family:serif;font-size:28px;color:#202020;margin:0 0 8px;">
                    Welcome to $clinicName
                  </h1>
                  <p style="font-size:16px;color:#555;margin:0 0 24px;">
                    Hi, ${name.ifBlank { "there" }},
                  </p>
                  <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 24px;">
                    An account has been created for you in Docodile. Click the button below to
                    set up your password and activate your account.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                    <tr><td align="center"
                            style="background:#556536;border-radius:999px;padding:12px 32px;">
                      <a href="$setupLink"
                         style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                        Set up your password
                      </a>
                    </td></tr>
                  </table>
                  <p style="font-size:13px;color:#888;margin:0 0 8px;">
                    This link expires in 24 hours.
                  </p>
                  <p style="font-size:12px;color:#aaa;margin:0;">
                    If you did not expect this email, please ignore it.
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
    """.trimIndent()
}
