package com.example.docodile.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "security.jwt")
class JwtProperties {
    var secret: String = "change-me"
    var expirationMs: Long = 3600000
}
