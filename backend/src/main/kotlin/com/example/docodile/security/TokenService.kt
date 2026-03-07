package com.example.docodile.security

import com.example.docodile.config.JwtProperties
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.util.Date
import java.util.UUID

@Service
class TokenService(private val props: JwtProperties) {
    private val key = Keys.hmacShaKeyFor(props.secret.toByteArray(StandardCharsets.UTF_8))

    fun generateToken(userId: UUID, tenantId: UUID, role: String, email: String, clinicId: UUID?): String {
        val now = Date()
        val expiry = Date(now.time + props.expirationMs)

        val builder = Jwts.builder()
            .setSubject(userId.toString())
            .setIssuedAt(now)
            .setExpiration(expiry)
            .claim("user_id", userId.toString())
            .claim("tenant_id", tenantId.toString())
            .claim("role", role)
            .claim("email", email)
            .signWith(key, SignatureAlgorithm.HS256)
        if (clinicId != null) {
            builder.claim("clinic_id", clinicId.toString())
        }
        return builder.compact()
    }

    fun validateToken(token: String): Boolean {
        return try {
            parseClaims(token)
            true
        } catch (ex: Exception) {
            false
        }
    }

    fun parseClaims(token: String): Claims {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .body
    }
}
