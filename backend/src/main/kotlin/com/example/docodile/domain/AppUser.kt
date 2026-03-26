package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "app_user")
class AppUser(
    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    var tenant: Tenant? = null,

    var name: String? = null,

    @Column(nullable = false, unique = true)
    var email: String = "",

    var phone: String? = null,

    @Column(name = "password_hash")
    var passwordHash: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: Role = Role.RECEPTIONIST,

    @Column(nullable = false)
    var active: Boolean = true,

    var gender: String? = null,

    var speciality: String? = null,

    @Column(name = "registration_no")
    var registrationNo: String? = null,

    @Column(name = "created_at")
    var createdAt: Instant? = null
)
