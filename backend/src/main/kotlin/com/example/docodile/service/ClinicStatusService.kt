package com.example.docodile.service

import com.example.docodile.domain.AuditAction
import com.example.docodile.domain.AppUser
import com.example.docodile.domain.ClinicSettings
import com.example.docodile.domain.Role
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicSettingsRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.ClinicDetailsRequest
import com.example.docodile.web.StaffRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class ClinicStatusService(
    private val clinicSettingsRepository: ClinicSettingsRepository,
    private val appUserRepository: AppUserRepository,
    private val currentUser: CurrentUser,
    private val passwordTokenService: PasswordTokenService,
    private val emailService: EmailService,
    private val auditService: AuditService,
) {
    fun isClinicComplete(): Boolean {
        val settings = clinicSettingsRepository.findAll().firstOrNull() ?: return false
        val hasCoreDetails = settings.name.isNotBlank() && !settings.address.isNullOrBlank()
        val hasStaff = appUserRepository.findAll().any { it.active }
        return hasCoreDetails && hasStaff
    }

    fun getClinicSettings(): ClinicSettings? {
        return clinicSettingsRepository.findAll().firstOrNull()
    }

    @Transactional
    fun saveClinicDetails(request: ClinicDetailsRequest): ClinicSettings {
        val settings = clinicSettingsRepository.findAll().firstOrNull()
            ?: ClinicSettings()

        settings.apply {
            name      = request.name
            address   = request.address
            speciality = request.speciality
            updatedAt  = Instant.now()
        }

        val saved = clinicSettingsRepository.save(settings)
        auditService.log(
            action     = AuditAction.CONFIG_CHANGED,
            entityType = "ClinicSettings",
            entityId   = saved.id,
            metadata   = mapOf("clinicName" to saved.name),
        )
        return saved
    }

    fun getStaff(): List<AppUser> {
        return appUserRepository.findAll()
    }

    @Transactional
    fun saveStaff(request: StaffRequest): AppUser {
        // Server-side validation
        if (!request.email.contains("@") || !request.email.contains(".")) {
            throw IllegalArgumentException("Invalid email format")
        }
        if (request.phone.replace("\\D".toRegex(), "").length < 10) {
            throw IllegalArgumentException("Phone number must have at least 10 digits")
        }

        // Department + specialty rules tied to role:
        //   Doctor                              → department + specialty both required
        //   Nurse                               → department required, specialty ignored
        //   Pharmacy / Lab / Front Desk / Other → both optional (clinic-wide roles)
        val deptRequiredRoles = setOf("DOCTOR", "NURSE")
        val normalizedRole = request.role.uppercase().replace(" ", "_")
        if (normalizedRole in deptRequiredRoles && request.department.isNullOrBlank()) {
            throw IllegalArgumentException("Department is required for ${request.role}")
        }
        if (normalizedRole == "DOCTOR" && request.specialty.isNullOrBlank()) {
            throw IllegalArgumentException("Specialty is required for Doctor")
        }
        if (!request.department.isNullOrBlank()) {
            val clinicDepartments = clinicSettingsRepository.findAll().firstOrNull()
                ?.speciality
                ?.split(",")
                ?.map { it.trim() }
                ?.filter { it.isNotEmpty() }
                .orEmpty()
            if (request.department !in clinicDepartments) {
                throw IllegalArgumentException("Department '${request.department}' is not configured for this clinic")
            }
        }

        val normalizedEmail = request.email.trim().lowercase()
        val existingByEmail = appUserRepository.findByEmail(normalizedEmail)

        // Resolve the target staff row:
        //   - Editing (id present) → load that row.
        //   - Adding with an email that already exists → reuse that row (reactivation).
        //   - Otherwise → a brand-new account.
        val staff = when {
            request.id != null ->
                appUserRepository.findById(request.id)
                    .orElseThrow { IllegalArgumentException("Staff member not found") }
            existingByEmail.isPresent -> existingByEmail.get()
            else -> AppUser(createdAt = Instant.now())
        }

        // Email must be unique to this staff row.
        if (existingByEmail.isPresent && existingByEmail.get().id != staff.id) {
            throw IllegalArgumentException("Email already exists for another staff member")
        }

        // Phone must be unique to this staff row (allow keeping their own).
        if (appUserRepository.existsByPhone(request.phone) && request.phone != staff.phone) {
            throw IllegalArgumentException("Phone number already exists for another staff member")
        }

        val isNew = request.id == null && existingByEmail.isEmpty

        staff.apply {
            name = request.name
            email = request.email.trim().lowercase()
            phone = request.phone
            gender = request.gender
            val resolved = runCatching {
                Role.valueOf(request.role.uppercase().replace(" ", "_"))
            }.getOrNull()
            role = resolved ?: Role.OTHER
            customRole = if (resolved == null) request.role.trim() else null
            department = request.department
            specialty = request.specialty
            registrationNo = request.registrationNo
            qualification = request.qualification
            medicalCouncil = request.medicalCouncil
            experienceYears = request.experienceYears
            // Adding or editing a staff member (re)activates them — covers
            // the case where a previously-removed doctor rejoins the clinic.
            active = true
            if (isNew) {
                passwordHash = null
                accountStatus = "PENDING_ACTIVATION"
            }
        }

        val savedStaff = appUserRepository.save(staff)

        if (isNew) {
            val clinicName = clinicSettingsRepository.findAll().firstOrNull()?.name ?: "your clinic"
            val rawToken = passwordTokenService.generateToken(savedStaff.id)
            val setupLink = passwordTokenService.buildSetupLink(rawToken)
            emailService.sendWelcomeEmail(savedStaff.email, savedStaff.name ?: "", clinicName, setupLink)
        }

        auditService.log(
            action     = if (isNew) AuditAction.USER_CREATED else AuditAction.USER_UPDATED,
            entityType = "AppUser",
            entityId   = savedStaff.id,
            metadata   = mapOf("email" to savedStaff.email),
        )

        return savedStaff
    }

    @Transactional
    fun deactivateStaff(staffId: UUID) {
        val staff = appUserRepository.findById(staffId)
            .orElseThrow { IllegalArgumentException("Staff member not found") }

        // Soft deactivation — never hard-delete a staff member who may own
        // historical records. Flip active=false hides them from booking lists
        // and blocks login while preserving past appointments (medical-legal
        // requirement). Hard-deleting would violate NOT NULL FK on appointment.doctor_id.
        staff.active = false
        appUserRepository.save(staff)
        auditService.log(
            action     = AuditAction.USER_DEACTIVATED,
            entityType = "AppUser",
            entityId   = staffId,
        )
    }

    @Transactional
    fun reactivateStaff(staffId: UUID) {
        val staff = appUserRepository.findById(staffId)
            .orElseThrow { IllegalArgumentException("Staff member not found") }

        staff.active = true
        appUserRepository.save(staff)
        auditService.log(
            action     = AuditAction.USER_REACTIVATED,
            entityType = "AppUser",
            entityId   = staffId,
        )
    }
}
