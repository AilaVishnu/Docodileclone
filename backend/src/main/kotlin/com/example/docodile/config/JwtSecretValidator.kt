package com.example.docodile.config

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.core.env.Environment
import org.springframework.stereotype.Component

/**
 * Fail-fast guard against shipping the hardcoded JWT signing key. The
 * `security.jwt.secret` property has an insecure default ("change-me…") so
 * local dev works without setup — but if that default (or a blank value)
 * reaches a NON-dev deployment, anyone could forge admin tokens. This
 * component refuses to start the app in that case, forcing JWT_SECRET to be
 * set in production. Dev/local/test profiles only get a loud warning.
 */
@Component
class JwtSecretValidator(
    private val jwtProperties: JwtProperties,
    private val environment: Environment,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // Known insecure defaults shipped in code / application.yml.
    private val insecureDefaults = setOf(
        "change-me",
        "change-me-change-me-change-me-change-me",
    )

    private val devProfiles = setOf("local", "dev", "test")

    @PostConstruct
    fun validate() {
        val secret = jwtProperties.secret.trim()
        val isInsecure = secret.isBlank() || secret in insecureDefaults
        if (!isInsecure) return

        val isDev = environment.activeProfiles.any { it.lowercase() in devProfiles }
        if (isDev) {
            log.warn(
                "JWT secret is the INSECURE default. Fine for local/dev, but you MUST set a strong " +
                    "JWT_SECRET (>= 32 random chars) before any real deployment."
            )
        } else {
            throw IllegalStateException(
                "Refusing to start: JWT secret is unset or the built-in default. Set the JWT_SECRET " +
                    "environment variable to a strong random value (>= 32 chars). Tokens signed with a " +
                    "guessable key let anyone forge authenticated requests."
            )
        }
    }
}
