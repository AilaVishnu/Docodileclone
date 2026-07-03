package com.example.docodile.service

import com.example.docodile.domain.AppUser
import com.example.docodile.domain.Role
import com.example.docodile.repo.AppUserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

@ExtendWith(MockitoExtension::class)
class DoctorServiceTest {

    @Mock
    private lateinit var appUserRepository: AppUserRepository

    @InjectMocks
    private lateinit var doctorService: DoctorService

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
    fun `listDoctorsForClinic returns empty list when no users`() {
        whenever(appUserRepository.findAll()).thenReturn(emptyList())

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

        whenever(appUserRepository.findAll()).thenReturn(listOf(doc))

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

        whenever(appUserRepository.findAll()).thenReturn(listOf(doc, receptionist, admin))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals(doc.id, result.first().id)
    }

    @Test
    fun `listDoctorsForClinic excludes inactive doctors`() {
        val active = user(name = "Active", active = true)
        val inactive = user(name = "Inactive", active = false)

        whenever(appUserRepository.findAll()).thenReturn(listOf(active, inactive))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals(active.id, result.first().id)
    }

    @Test
    fun `listDoctorsForClinic sorts doctors by name case-insensitively`() {
        val zoe = user(name = "zoe")
        val abe = user(name = "Abe")
        val mike = user(name = "Mike")

        whenever(appUserRepository.findAll()).thenReturn(listOf(zoe, abe, mike))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(listOf("Abe", "Mike", "zoe"), result.map { it.name })
    }

    @Test
    fun `listDoctorsForClinic maps null name to empty string`() {
        val doc = user(name = null)

        whenever(appUserRepository.findAll()).thenReturn(listOf(doc))

        val result = doctorService.listDoctorsForClinic()

        assertEquals(1, result.size)
        assertEquals("", result.first().name)
    }

    @Test
    fun `listDoctorsForClinic delegates to appUserRepository findAll`() {
        whenever(appUserRepository.findAll()).thenReturn(emptyList())

        doctorService.listDoctorsForClinic()

        verify(appUserRepository).findAll()
    }
}
