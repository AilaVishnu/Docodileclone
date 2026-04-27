package com.example.docodile.service

import com.example.docodile.domain.Suggestion
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.SuggestionRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.SuggestionDTO
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class SuggestionService(
    private val suggestionRepository: SuggestionRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val currentUser: CurrentUser
) {
    /**
     * Top-N suggestions for `field`, scoped to the caller's clinic
     * specialties (union across all of them). Empty `q` returns the top
     * suggestions ranked by use_count so the dropdown can show on focus.
     *
     * For multi-specialty clinics (e.g. a dermatology + gynecology clinic),
     * results from all specialty pools are merged. Duplicates by `value`
     * are deduped and the row with the highest use_count wins.
     */
    fun list(field: String, q: String, limit: Int = DEFAULT_LIMIT): List<SuggestionDTO> {
        val specialities = resolveSpecialities()
        if (specialities.isEmpty()) return emptyList()
        val cap = limit.coerceIn(1, MAX_LIMIT)
        val rows = suggestionRepository.searchBySpecialitiesAndField(
            specialities,
            field,
            q.trim(),
            // Over-fetch by `specialities.size` so dedup-by-value can still
            // surface `cap` distinct rows even if the same value appears in
            // every specialty pool.
            PageRequest.of(0, cap * specialities.size.coerceAtLeast(1))
        )

        // Dedup by value (case-insensitive), keeping the row with the highest
        // use_count. Preserves the existing use_count desc ordering since the
        // first occurrence in `rows` already has the highest count.
        val seen = HashSet<String>()
        val out = ArrayList<SuggestionDTO>(cap)
        for (row in rows) {
            val key = row.value.lowercase()
            if (seen.add(key)) {
                out += row.toDTO()
                if (out.size >= cap) break
            }
        }
        return out
    }

    /**
     * Upsert the suggestion under each of the caller clinic's specialties
     * and bump every matching row's use_count. A multi-specialty clinic
     * contributes the new word to all its pools — every other clinic that
     * shares any of those specialties will see the word on next keystroke.
     */
    @Transactional
    fun record(field: String, value: String): List<SuggestionDTO> {
        val trimmed = value.trim()
        require(trimmed.isNotEmpty()) { "value must not be blank" }
        require(field.isNotBlank()) { "field must not be blank" }

        val specialities = resolveSpecialities()
        if (specialities.isEmpty()) return emptyList()

        return specialities.map { speciality ->
            val existing = suggestionRepository.findBySpecialityAndFieldAndValue(speciality, field, trimmed)
            val suggestion = if (existing != null) {
                existing.useCount += 1
                existing
            } else {
                Suggestion(
                    speciality = speciality,
                    field = field,
                    value = trimmed,
                    useCount = 1,
                    createdAt = Instant.now()
                )
            }
            suggestionRepository.save(suggestion).toDTO()
        }
    }

    // Server-side lookup of the caller clinic's specialties. Splits the
    // comma-separated `clinic.speciality` column (set via the BuildYourClinic
    // multi-tag picker) and normalizes each entry to lowercase + trimmed so
    // case/whitespace differences ("Dermatology" vs "dermatology" vs
    // "Dermatology ") all map to the same pool. Clients never send the
    // specialty directly.
    private fun resolveSpecialities(): List<String> {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalStateException("Clinic not found for current user") }
        val raw = clinic.speciality?.trim().orEmpty()
        if (raw.isEmpty()) return emptyList()
        return raw.split(",")
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }
            .distinct()
    }

    private fun Suggestion.toDTO(): SuggestionDTO = SuggestionDTO(
        id = this.id,
        field = this.field,
        value = this.value,
        useCount = this.useCount
    )

    companion object {
        private const val DEFAULT_LIMIT = 10
        private const val MAX_LIMIT = 50
    }
}
