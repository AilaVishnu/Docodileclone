package com.example.docodile.service

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.ClinicStaff
import com.example.docodile.domain.Role
import com.example.docodile.repo.ClinicStaffRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class DoctorServiceTest {

    @Mock
    private lateinit var clinicStaffRepository: ClinicStaffRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @InjectMocks
    private lateinit var doctorService: DoctorService

    private val clinicId: UUID = UUID.randomUUID()

    private fun staff(user: AppUser?): ClinicStaff =
        ClinicStaff(staff = user)

    private fun user(
        name: String? = "Doc",
        role: Role = Role.DOCTOR,
        active: Boolean = true,
        department: String? = "Cardiology",
        specialty: String? = "Heart",
    ): AppUser = AppUser(
        id = UUID.randomUUID(),
        name = name,
        email = "${name ?: "x"}@example.com",
        role = role,
        active = active,
        department = department,
        specialty = specialty,
    )

    @Test
    fun `listDoctorsForClinic returns empty list when clinic has no staff`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId)).thenReturn(emptyList())

        val result = doctorService.listDoctorsForClinic()

        assertTrue(result.isEmpty())
    }

    @Test
    fun `listDoctorsForClinic maps doctor entity fields to DTO`() {
        val doc = user(name = "Alice", department = "Derm", specialty = "Skin")
        doc.registrationNo = "REG123"
        doc.qualification = "MBBS"
        doc.medicalCouncil = "MCI"
        doc.experienceYears = 7

        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId)).thenReturn(listOf(staff(doc)))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        val dto = result.first()
        assertEquals(doc.id, dto.id)
        assertEquals("Alice", dto.name)
        assertEquals("Derm", dto.department)
        assertEquals("Skin", dto.specialty)
        assertEquals("REG123", dto.registrationNo)
        assertEquals("MBBS", dto.qualification)
        assertEquals("MCI", dto.medicalCouncil)
        assertEquals(7, dto.experienceYears)
    }

    @Test
    fun `listDoctorsForClinic excludes non-doctor roles`() {
        val doc = user(name = "Doc", role = Role.DOCTOR)
        val receptionist = user(name = "Front", role = Role.RECEPTIONIST)
        val admin = user(name = "Boss", role = Role.ADMIN)

        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId))
            .thenReturn(listOf(staff(doc), staff(receptionist), staff(admin)))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals(doc.id, result.first().id)
    }

    @Test
    fun `listDoctorsForClinic excludes inactive doctors`() {
        val active = user(name = "Active", active = true)
        val inactive = user(name = "Inactive", active = false)

        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId))
            .thenReturn(listOf(staff(active), staff(inactive)))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals(active.id, result.first().id)
    }

    @Test
    fun `listDoctorsForClinic skips staff rows with null staff`() {
        val doc = user(name = "Doc")

        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId))
            .thenReturn(listOf(staff(null), staff(doc)))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals(doc.id, result.first().id)
    }

    @Test
    fun `listDoctorsForClinic sorts doctors by name case-insensitively`() {
        val zoe = user(name = "zoe")
        val abe = user(name = "Abe")
        val mike = user(name = "Mike")

        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId))
            .thenReturn(listOf(staff(zoe), staff(abe), staff(mike)))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(listOf("Abe", "Mike", "zoe"), result.map { it.name })
    }

    @Test
    fun `listDoctorsForClinic maps null name to empty string`() {
        val doc = user(name = null)

        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId))
            .thenReturn(listOf(staff(doc)))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals("", result.first().name)
    }

    @Test
    fun `listDoctorsForClinic scopes lookup to current user clinic`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicStaffRepository.findByClinicId(clinicId)).thenReturn(emptyList())

        doctorService.listDoctorsForClinic()

        org.mockito.kotlin.verify(clinicStaffRepository).findByClinicId(clinicId)
    }
}
