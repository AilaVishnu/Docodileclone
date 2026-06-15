package com.example.docodile.service

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.Suggestion
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.SuggestionRepository
import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID

@ExtendWith(MockitoExtension::class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class SuggestionServiceTest {

    @Mock
    private lateinit var suggestionRepository: SuggestionRepository

    @Mock
    private lateinit var clinicEntityRepository: ClinicEntityRepository

    @Mock
    private lateinit var currentUser: CurrentUser

    @InjectMocks
    private lateinit var suggestionService: SuggestionService

    private val clinicId: UUID = UUID.randomUUID()

    private fun clinicWithSpeciality(speciality: String?): ClinicEntity =
        ClinicEntity(id = clinicId, name = "Clinic", speciality = speciality)

    private fun suggestion(value: String, useCount: Int = 1, speciality: String = "derm"): Suggestion =
        Suggestion(speciality = speciality, field = "diagnosis", value = value, useCount = useCount)

    // ---------------------------------------------------------------------
    // list()
    // ---------------------------------------------------------------------

    @Test
    fun `list returns empty when clinic has no specialities`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality(null)))

        val result = suggestionService.list("diagnosis", "ac")

        assertTrue(result.isEmpty())
    }

    @Test
    fun `list returns mapped suggestions for the resolved specialities`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("Dermatology")))
        whenever(suggestionRepository.searchBySpecialitiesAndField(any(), any(), any(), any()))
            .thenReturn(listOf(suggestion("Acne", useCount = 5), suggestion("Eczema", useCount = 2)))

        val result = suggestionService.list("diagnosis", "")

        assertEquals(listOf("Acne", "Eczema"), result.map { it.value })
        assertEquals(5, result.first().useCount)
    }

    @Test
    fun `list passes specialities normalized to lowercase and trimmed`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality(" Dermatology , Gynecology ")))
        whenever(suggestionRepository.searchBySpecialitiesAndField(any(), any(), any(), any()))
            .thenReturn(emptyList())

        suggestionService.list("diagnosis", "ac")

        val captor = argumentCaptor<List<String>>()
        verify(suggestionRepository).searchBySpecialitiesAndField(
            captor.capture(), eq("diagnosis"), eq("ac"), any()
        )
        assertEquals(listOf("dermatology", "gynecology"), captor.firstValue)
    }

    @Test
    fun `list trims the query string before searching`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("derm")))
        whenever(suggestionRepository.searchBySpecialitiesAndField(any(), any(), any(), any()))
            .thenReturn(emptyList())

        suggestionService.list("diagnosis", "  acne  ")

        verify(suggestionRepository).searchBySpecialitiesAndField(any(), eq("diagnosis"), eq("acne"), any())
    }

    @Test
    fun `list dedupes by value case-insensitively keeping first occurrence`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("derm,gyn")))
        // First row has highest count and wins; later duplicate (different case) dropped.
        whenever(suggestionRepository.searchBySpecialitiesAndField(any(), any(), any(), any()))
            .thenReturn(
                listOf(
                    suggestion("Acne", useCount = 9, speciality = "derm"),
                    suggestion("acne", useCount = 3, speciality = "gyn"),
                    suggestion("Eczema", useCount = 1, speciality = "derm"),
                )
            )

        val result = suggestionService.list("diagnosis", "")

        assertEquals(listOf("Acne", "Eczema"), result.map { it.value })
        assertEquals(9, result.first().useCount)
    }

    @Test
    fun `list honors the limit cap after dedup`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("derm")))
        whenever(suggestionRepository.searchBySpecialitiesAndField(any(), any(), any(), any()))
            .thenReturn(listOf(suggestion("A"), suggestion("B"), suggestion("C")))

        val result = suggestionService.list("diagnosis", "", limit = 2)

        assertEquals(2, result.size)
        assertEquals(listOf("A", "B"), result.map { it.value })
    }

    @Test
    fun `list throws when current clinic cannot be found`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId)).thenReturn(Optional.empty())

        assertThrows(IllegalStateException::class.java) {
            suggestionService.list("diagnosis", "ac")
        }
    }

    // ---------------------------------------------------------------------
    // record()
    // ---------------------------------------------------------------------

    @Test
    fun `record rejects blank value`() {
        assertThrows(IllegalArgumentException::class.java) {
            suggestionService.record("diagnosis", "   ")
        }
    }

    @Test
    fun `record rejects blank field`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        assertThrows(IllegalArgumentException::class.java) {
            suggestionService.record("  ", "Acne")
        }
    }

    @Test
    fun `record returns empty when clinic has no specialities`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality(null)))

        val result = suggestionService.record("diagnosis", "Acne")

        assertTrue(result.isEmpty())
    }

    @Test
    fun `record creates a new suggestion with trimmed value and use count 1`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("derm")))
        whenever(suggestionRepository.findBySpecialityAndFieldAndValue("derm", "diagnosis", "Acne"))
            .thenReturn(null)
        whenever(suggestionRepository.save(any<Suggestion>())).thenAnswer { it.arguments[0] }

        val result = suggestionService.record("diagnosis", "  Acne  ")

        val captor = argumentCaptor<Suggestion>()
        verify(suggestionRepository).save(captor.capture())
        val saved = captor.firstValue
        assertEquals("derm", saved.speciality)
        assertEquals("diagnosis", saved.field)
        assertEquals("Acne", saved.value)
        assertEquals(1, saved.useCount)
        assertEquals(1, result.size)
    }

    @Test
    fun `record increments use count of an existing suggestion`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("derm")))
        val existing = suggestion("Acne", useCount = 4, speciality = "derm")
        whenever(suggestionRepository.findBySpecialityAndFieldAndValue("derm", "diagnosis", "Acne"))
            .thenReturn(existing)
        whenever(suggestionRepository.save(any<Suggestion>())).thenAnswer { it.arguments[0] }

        val result = suggestionService.record("diagnosis", "Acne")

        assertEquals(5, existing.useCount)
        assertEquals(5, result.first().useCount)
    }

    @Test
    fun `record upserts across every specialty of a multi-specialty clinic`() {
        whenever(currentUser.clinicId()).thenReturn(clinicId)
        whenever(clinicEntityRepository.findById(clinicId))
            .thenReturn(Optional.of(clinicWithSpeciality("derm,gyn")))
        whenever(suggestionRepository.findBySpecialityAndFieldAndValue(any(), any(), any()))
            .thenReturn(null)
        whenever(suggestionRepository.save(any<Suggestion>())).thenAnswer { it.arguments[0] }

        val result = suggestionService.record("diagnosis", "Acne")

        assertEquals(2, result.size)
        verify(suggestionRepository, org.mockito.Mockito.times(2)).save(any<Suggestion>())
    }
}
