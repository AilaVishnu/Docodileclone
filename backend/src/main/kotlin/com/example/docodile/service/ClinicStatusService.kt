package com.example.docodile.service

import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.TenantRepository
import com.example.docodile.domain.ClinicEntity
import com.example.docodile.web.ClinicDetailsRequest
import com.example.docodile.security.CurrentUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

import com.example.docodile.repo.AppUserRepository
import com.example.docodile.domain.Role
import com.example.docodile.web.StaffRequest
import com.example.docodile.domain.AppUser
import com.example.docodile.domain.ClinicStaff
import com.example.docodile.domain.ClinicStaffId

@Service
class ClinicStatusService(
    private val clinicEntityRepository: ClinicEntityRepository,
    private val clinicStaffRepository: ClinicStaffRepository,
    private val appUserRepository: AppUserRepository,
    private val tenantRepository: TenantRepository,
    private val currentUser: CurrentUser,
    private val passwordTokenService: PasswordTokenService,
    private val emailService: EmailService,
) {
    fun isClinicComplete(): Boolean {
        val tenantId = currentUser.tenantId()
        val clinics = clinicEntityRepository.findAllByTenantId(tenantId)
        if (clinics.isEmpty()) return false

        return clinics.any { clinic ->
            val hasCoreDetails = !clinic.name.isNullOrBlank()
                && !clinic.address.isNullOrBlank()
                && !clinic.phone.isNullOrBlank()

            val staffCount = clinicStaffRepository.countByIdClinicId(clinic.id)
            hasCoreDetails && staffCount > 0
        }
    }

    fun getClinicsForTenant(): List<ClinicEntity> {
        return clinicEntityRepository.findAllByTenantId(currentUser.tenantId())
    }

    @Transactional
    fun saveClinicDetails(request: ClinicDetailsRequest): ClinicEntity {
        val tenantId = currentUser.tenantId()
        
        val clinic = if (request.id != null) {
            clinicEntityRepository.findById(request.id)
                .filter { it.tenant?.id == tenantId }
                .orElseThrow { IllegalArgumentException("Clinic not found") }
        } else {
            // Count clinics for this tenant
            val currentCount = clinicEntityRepository.countByTenantId(tenantId)
            if (currentCount >= 5) {
                throw IllegalArgumentException("You can only have up to 5 clinics")
            }

            val tenant = tenantRepository.findById(tenantId)
                .orElseThrow { IllegalStateException("Tenant not found") }
            ClinicEntity(tenant = tenant, createdAt = Instant.now())
        }

        // Domain Immutability and Uniqueness Logic
        if (!request.domain.isNullOrBlank()) {
            if (clinic.domain != null) {
                // Domain once saved, cannot be updated
                if (clinic.domain != request.domain) {
                    throw IllegalArgumentException("Domain cannot be changed once saved")
                }
            } else {
                // Setting domain for the first time
                // Application-wide uniqueness check
                if (clinicEntityRepository.existsByDomainIgnoreCase(request.domain)) {
                    throw IllegalArgumentException("Domain name already exists in application")
                }
                clinic.domain = request.domain
            }
        }

        clinic.apply {
            name = request.name
            address = request.address
            phone = request.phone
            speciality = request.speciality
        }

        return clinicEntityRepository.save(clinic)
    }

    fun isDomainAvailable(domain: String): Boolean {
        return !clinicEntityRepository.existsByDomainIgnoreCase(domain)
    }

    fun getStaffForClinic(clinicId: UUID): List<AppUser> {
        // Strictly clinic-scoped — only members of THIS clinic, so a staff
        // member never leaks into another clinic's list. Deactivated staff
        // keep their membership (see deleteStaff), so they still appear here
        // (with active=false) for the clinic's "Deactivated" list.
        return clinicStaffRepository.findByClinicId(clinicId).mapNotNull { it.staff }
    }

    @Transactional
    fun saveStaff(clinicId: UUID, request: StaffRequest): AppUser {
        val tenantId = currentUser.tenantId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .filter { it.tenant?.id == tenantId }
            .orElseThrow { IllegalArgumentException("Clinic not found") }

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
        // Department, when set, must belong to the clinic's configured list.
        val deptRequiredRoles = setOf("DOCTOR", "NURSE")
        val normalizedRole = request.role.uppercase().replace(" ", "_")
        if (normalizedRole in deptRequiredRoles && request.department.isNullOrBlank()) {
            throw IllegalArgumentException("Department is required for ${request.role}")
        }
        if (normalizedRole == "DOCTOR" && request.specialty.isNullOrBlank()) {
            throw IllegalArgumentException("Specialty is required for Doctor")
        }
        if (!request.department.isNullOrBlank()) {
            val clinicDepartments = clinic.speciality
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
            .filter { it.tenant?.id == tenantId }

        // Resolve the target staff row:
        //   - Editing (id present) → load that row.
        //   - Adding with an email that already belongs to a tenant user →
        //     reuse that row. This recovers a staff member who was removed
        //     earlier (or rejoins the clinic) instead of erroring on the
        //     unique email, keeping all their historical records intact.
        //   - Otherwise → a brand-new account.
        val staff = when {
            request.id != null ->
                appUserRepository.findById(request.id)
                    .filter { it.tenant?.id == tenantId }
                    .orElseThrow { IllegalArgumentException("Staff member not found") }
            existingByEmail.isPresent -> existingByEmail.get()
            else -> {
                val tenant = tenantRepository.findById(tenantId)
                    .orElseThrow { IllegalStateException("Tenant not found") }
                AppUser(tenant = tenant, createdAt = Instant.now())
            }
        }

        // Email must be unique to this staff row.
        if (existingByEmail.isPresent && existingByEmail.get().id != staff.id) {
            throw IllegalArgumentException("Email already exists for another staff member")
        }

        // Phone must be unique to this staff row (allow keeping their own).
        if (appUserRepository.existsByPhone(request.phone) && request.phone != staff.phone) {
            throw IllegalArgumentException("Phone number already exists for another staff member")
        }

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
            passwordHash = null // As requested
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
            val rawToken = passwordTokenService.generateToken(savedStaff.id)
            val setupLink = passwordTokenService.buildSetupLink(rawToken)
            emailService.sendWelcomeEmail(savedStaff.email, savedStaff.name ?: "", setupLink)
        }

        // Ensure linked to clinic
        if (!clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinicId, savedStaff.id)) {
            val association = ClinicStaff(
                id = ClinicStaffId(clinicId = clinicId, staffId = savedStaff.id),
                clinic = clinic,
                staff = savedStaff,
                createdAt = Instant.now()
            )
            clinicStaffRepository.save(association)
        }

        return savedStaff
    }

    @Transactional
    fun deleteStaff(clinicId: UUID, staffId: UUID) {
        val tenantId = currentUser.tenantId()
        clinicEntityRepository.findById(clinicId)
            .filter { it.tenant?.id == tenantId }
            .orElseThrow { IllegalArgumentException("Clinic not found") }

        val staff = appUserRepository.findById(staffId)
            .filter { it.tenant?.id == tenantId }
            .orElseThrow { IllegalArgumentException("Staff member not found") }

        // Soft deactivation — never hard-delete a staff member who may own
        // historical records. Keep the AppUser row AND the clinic membership
        // (so they remain visible in this clinic's "Deactivated" list and can
        // be reactivated) and just flip active=false. That hides them from the
        // booking doctor list and blocks login, while past appointments and
        // visits still show their name (a medical-legal requirement). Hard-
        // deleting would also violate the NOT NULL FK on appointment.doctor_id.
        staff.active = false
        appUserRepository.save(staff)
    }

    @Transactional
    fun reactivateStaff(clinicId: UUID, staffId: UUID) {
        val tenantId = currentUser.tenantId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .filter { it.tenant?.id == tenantId }
            .orElseThrow { IllegalArgumentException("Clinic not found") }

        val staff = appUserRepository.findById(staffId)
            .filter { it.tenant?.id == tenantId }
            .orElseThrow { IllegalArgumentException("Staff member not found") }

        // Re-link to the clinic if the membership was ever dropped (covers
        // accounts removed by an older hard-removal path), then reactivate.
        if (!clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinicId, staffId)) {
            clinicStaffRepository.save(
                ClinicStaff(
                    id = ClinicStaffId(clinicId = clinicId, staffId = staffId),
                    clinic = clinic,
                    staff = staff,
                    createdAt = Instant.now()
                )
            )
        }
        staff.active = true
        appUserRepository.save(staff)
    }
}
