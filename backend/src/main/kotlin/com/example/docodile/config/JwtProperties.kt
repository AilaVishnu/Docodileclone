package com.example.docodile.config

import jakarta.annotation.PostConstruct
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "security.jwt")
class JwtProperties {
    var secret: String = ""
    var expirationMs: Long = 3600000

    @PostConstruct
    fun validate() {
        check(secret.isNotBlank()) {
            "JWT_SECRET environment variable is required but not set. " +
            "Set a strong random secret (min 32 chars) before starting the application."
        }
        check(secret.length >= 32) {
            "JWT_SECRET must be at least 32 characters long for HS256 security."
        }
    }
}
