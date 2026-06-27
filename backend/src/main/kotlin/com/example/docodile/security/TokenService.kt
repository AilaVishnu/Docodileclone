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

    val expirationMs: Long get() = props.expirationMs

    fun generateToken(userId: UUID, schema: String, role: String, email: String): String {
        val now = Date()
        val expiry = Date(now.time + props.expirationMs)
        val jti = UUID.randomUUID()

        return Jwts.builder()
            .setId(jti.toString())
            .setSubject(userId.toString())
            .setIssuedAt(now)
            .setExpiration(expiry)
            .claim("user_id", userId.toString())
            .claim("schema", schema)
            .claim("role", role)
            .claim("email", email)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
    }

    fun generateMfaPendingToken(userId: UUID): String {
        val now = Date()
        val expiry = Date(now.time + 5 * 60 * 1000L) // 5-minute window
        return Jwts.builder()
            .setId(UUID.randomUUID().toString())
            .setSubject(userId.toString())
            .setIssuedAt(now)
            .setExpiration(expiry)
            .claim("mfa_pending", true)
            .claim("user_id", userId.toString())
            .signWith(key, SignatureAlgorithm.HS256)
            .compact()
    }

    fun isMfaPendingToken(token: String): Boolean = runCatching {
        val claims = parseClaims(token)
        claims["mfa_pending"] as? Boolean == true
    }.getOrDefault(false)

    fun extractUserId(token: String): UUID? = runCatching {
        UUID.fromString(parseClaims(token)["user_id"] as? String ?: return@runCatching null)
    }.getOrNull()

    fun extractJti(token: String): UUID? =
        runCatching {
            UUID.fromString(parseClaims(token).id)
        }.getOrNull()

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
