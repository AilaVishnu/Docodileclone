package com.example.docodile.config

import com.example.docodile.security.AppUserPrincipal
import com.example.docodile.security.TokenService
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer
import org.springframework.messaging.simp.config.ChannelRegistration
import java.util.UUID

@Configuration
class WebSocketSecurityConfig(
    private val tokenService: TokenService,
) : WebSocketMessageBrokerConfigurer {

    override fun configureClientInboundChannel(registration: ChannelRegistration) {
        registration.interceptors(object : ChannelInterceptor {
            override fun preSend(message: Message<*>, channel: MessageChannel): Message<*> {
                val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java)
                if (accessor != null && StompCommand.CONNECT == accessor.command) {
                    val authHeader = accessor.getFirstNativeHeader("Authorization") ?: ""
                    val token = authHeader.removePrefix("Bearer ").trim()
                    if (token.isNotEmpty() && tokenService.validateToken(token)) {
                        val claims = tokenService.parseClaims(token)
                        val userId = (claims["user_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }
                        val tenantId = (claims["tenant_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }
                        val clinicId = (claims["clinic_id"] as? String)?.let { runCatching { UUID.fromString(it) }.getOrNull() }
                        val role = claims["role"] as? String
                        val email = claims["email"] as? String ?: ""
                        if (userId != null && tenantId != null && role != null) {
                            val principal = AppUserPrincipal(
                                userId = userId, tenantId = tenantId, clinicId = clinicId,
                                role = role, email = email, passwordHash = "", active = true,
                            )
                            accessor.user = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
                        }
                    }
                }
                return message
            }
        })
    }
}
