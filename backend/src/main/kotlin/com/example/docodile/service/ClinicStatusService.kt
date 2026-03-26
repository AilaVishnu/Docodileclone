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
            val tenant = tenantRepository.findById(tenantId)
                .orElseThrow { IllegalStateException("Tenant not found") }
            ClinicEntity(tenant = tenant, createdAt = Instant.now())
        }

        if (!request.domain.isNullOrBlank()) {
            if (clinic.domain != null) {
                if (clinic.domain != request.domain) {
                    throw IllegalArgumentException("Domain cannot be changed once saved")
                }
            } else {
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
            email = request.email
            phone = request.phone
            gender = request.gender
            role = Role.valueOf(request.role.uppercase().replace(" ", "_"))
            speciality = request.speciality
            registrationNo = request.registrationNo
            passwordHash = null
        }

        val savedStaff = appUserRepository.save(staff)

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
}
