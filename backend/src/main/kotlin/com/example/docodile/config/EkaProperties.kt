package com.example.docodile.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "eka")
class EkaProperties {
    var clientId: String = ""
    var clientSecret: String = ""
}
