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
    private val currentUser: CurrentUser
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
        val associations = clinicStaffRepository.findByClinicId(clinicId)
        return associations.mapNotNull { it.staff }
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

        val staff = if (request.id != null) {
            appUserRepository.findById(request.id)
                .filter { it.tenant?.id == tenantId }
                .orElseThrow { IllegalArgumentException("Staff member not found") }
        } else {
            val tenant = tenantRepository.findById(tenantId)
                .orElseThrow { IllegalStateException("Tenant not found") }
            AppUser(tenant = tenant, createdAt = Instant.now())
        }

        staff.apply {
            name = request.name
            email = request.email.trim().lowercase()
            phone = request.phone
            gender = request.gender
            role = Role.valueOf(request.role.uppercase().replace(" ", "_"))
            speciality = request.speciality
            registrationNo = request.registrationNo
            passwordHash = null // As requested
        }

        val savedStaff = appUserRepository.save(staff)

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

        // Delete clinic-staff association first, then the user
        val compositeKey = ClinicStaffId(clinicId = clinicId, staffId = staffId)
        clinicStaffRepository.deleteById(compositeKey)
        clinicStaffRepository.flush()
        appUserRepository.delete(staff)
    }
}
