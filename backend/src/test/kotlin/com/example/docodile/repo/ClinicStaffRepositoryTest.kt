package com.example.docodile.repo

import com.example.docodile.domain.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.util.*

@DataJpaTest
@ActiveProfiles("test")
class ClinicStaffRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val clinicStaffRepository: ClinicStaffRepository
) {

    private lateinit var tenant: Tenant
    private lateinit var clinic: ClinicEntity
    private lateinit var staff: AppUser

    @BeforeEach
    fun setup() {
        tenant = Tenant(name = "Test Tenant")
        entityManager.persist(tenant)

        clinic = ClinicEntity(name = "Test Clinic", tenant = tenant)
        entityManager.persist(clinic)

        staff = AppUser(email = "staff@example.com", role = Role.PHARMACY, tenant = tenant)
        entityManager.persist(staff)

        entityManager.flush()
    }

    @Test
    fun `should check if staff exists in clinic`() {
        val clinicStaff = ClinicStaff(
            id = ClinicStaffId(clinicId = clinic.id, staffId = staff.id),
            clinic = clinic,
            staff = staff
        )
        entityManager.persist(clinicStaff)
        entityManager.flush()

        assertTrue(clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, staff.id))
        assertFalse(clinicStaffRepository.existsByIdClinicIdAndIdStaffId(clinic.id, UUID.randomUUID()))
    }

    @Test
    fun `should count staff by clinic id`() {
        val clinicStaff = ClinicStaff(
            id = ClinicStaffId(clinicId = clinic.id, staffId = staff.id),
            clinic = clinic,
            staff = staff
        )
        entityManager.persist(clinicStaff)
        entityManager.flush()

        assertEquals(1, clinicStaffRepository.countByIdClinicId(clinic.id))
    }

    @Test
    fun `should find all staff in clinic`() {
        val clinicStaff = ClinicStaff(
            id = ClinicStaffId(clinicId = clinic.id, staffId = staff.id),
            clinic = clinic,
            staff = staff
        )
        entityManager.persist(clinicStaff)
        entityManager.flush()

        val found = clinicStaffRepository.findByClinicId(clinic.id)
        assertEquals(1, found.size)
        assertEquals(staff.id, found[0].staff?.id)
    }
}
