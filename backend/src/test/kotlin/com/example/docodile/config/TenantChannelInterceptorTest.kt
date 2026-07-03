package com.example.docodile.config

import com.example.docodile.security.AppUserPrincipal
import com.example.docodile.security.TokenService
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.MessageDeliveryException
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import java.util.UUID

class TenantChannelInterceptorTest {

    private val interceptor = TenantChannelInterceptor(mock(TokenService::class.java))
    private val channel = mock(MessageChannel::class.java)

    private fun principal(schema: String) = AppUserPrincipal(
        userId = UUID.randomUUID(), schema = schema,
        role = "DOCTOR", email = "doc@clinic", passwordHash = "", active = true,
    )

    private fun subscribeMessage(destination: String, schema: String?): Message<*> {
        val accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE)
        accessor.destination = destination
        if (schema != null) {
            val p = principal(schema)
            accessor.user = UsernamePasswordAuthenticationToken(p, null, p.authorities)
        }
        return org.springframework.messaging.support.MessageBuilder
            .createMessage(ByteArray(0), accessor.messageHeaders)
    }

    @Test
    fun `subscribe to own clinic topic is allowed`() {
        val msg = subscribeMessage("/topic/clinic/tskin", schema = "tskin")
        assertDoesNotThrow { interceptor.preSend(msg, channel) }
    }

    @Test
    fun `subscribe to another clinic topic is rejected`() {
        val msg = subscribeMessage("/topic/clinic/acme", schema = "tskin")
        assertThrows(MessageDeliveryException::class.java) { interceptor.preSend(msg, channel) }
    }

    @Test
    fun `unauthenticated subscribe to a clinic topic is rejected`() {
        val msg = subscribeMessage("/topic/clinic/tskin", schema = null)
        assertThrows(MessageDeliveryException::class.java) { interceptor.preSend(msg, channel) }
    }

    @Test
    fun `subscribe attempting to widen the schema segment is rejected`() {
        val msg = subscribeMessage("/topic/clinic/tskin/secret", schema = "tskin")
        assertThrows(MessageDeliveryException::class.java) { interceptor.preSend(msg, channel) }
    }

    @Test
    fun `subscribe to a non-clinic topic is not constrained`() {
        val msg = subscribeMessage("/user/queue/messages", schema = "tskin")
        assertDoesNotThrow { interceptor.preSend(msg, channel) }
    }
}
