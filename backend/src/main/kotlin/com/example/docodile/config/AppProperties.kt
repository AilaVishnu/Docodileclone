package com.example.docodile.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
class AppProperties {
    var frontendUrl: String = "http://localhost:3000"
    var tokenExpiryHours: Long = 24
}
