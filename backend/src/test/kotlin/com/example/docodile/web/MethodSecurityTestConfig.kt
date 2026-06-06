package com.example.docodile.web

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity

/**
 * Enables @PreAuthorize method security inside a @WebMvcTest slice (the bare slice
 * does not activate it). Import this in controller slice tests that assert
 * role-based 403 behaviour.
 */
@TestConfiguration
@EnableMethodSecurity
class MethodSecurityTestConfig
