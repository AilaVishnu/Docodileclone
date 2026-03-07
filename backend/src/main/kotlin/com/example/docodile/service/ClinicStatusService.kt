package com.example.docodile.service

import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.security.CurrentUser
import org.springframework.stereotype.Service

@Service
class ClinicStatusService(
    private val clinicEntityRepository: ClinicEntityRepository,
    private val clinicStaffRepository: ClinicStaffRepository,
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
}
