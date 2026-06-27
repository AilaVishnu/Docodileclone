package com.example.docodile.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "app_user")
class AppUser(
    @Id
    var id: UUID = UUID.randomUUID(),

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

    @Column(columnDefinition = "TEXT")
    var department: String? = null,

    @Column(columnDefinition = "TEXT")
    var specialty: String? = null,

    @Column(name = "registration_no")
    var registrationNo: String? = null,

    @Column(columnDefinition = "TEXT")
    var qualification: String? = null,

    @Column(name = "medical_council", columnDefinition = "TEXT")
    var medicalCouncil: String? = null,

    @Column(name = "experience_years")
    var experienceYears: Int? = null,

    @Column(name = "custom_role")
    var customRole: String? = null,

    @Column(name = "account_status", nullable = false)
    var accountStatus: String = "ACTIVE",

    @Column(name = "created_at")
    var createdAt: Instant? = null,

    @Column(name = "updated_at")
    var updatedAt: Instant? = null,

    @Column(name = "failed_login_attempts", nullable = false)
    var failedLoginAttempts: Int = 0,

    @Column(name = "locked_until")
    var lockedUntil: Instant? = null,

    @Column(name = "totp_secret")
    var totpSecret: String? = null,

    @Column(name = "mfa_enabled", nullable = false)
    var mfaEnabled: Boolean = false,

    @Column(name = "mfa_backup_codes", columnDefinition = "text")
    var mfaBackupCodes: String? = null,
)
