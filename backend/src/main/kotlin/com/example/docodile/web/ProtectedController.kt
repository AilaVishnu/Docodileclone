package com.example.docodile.web

import com.example.docodile.security.CurrentUser
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api")
class ProtectedController(private val currentUser: CurrentUser) {
    @GetMapping("/me/clinic")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    fun clinicId(): Map<String, UUID> = mapOf("clinic_id" to currentUser.clinicId())
}
