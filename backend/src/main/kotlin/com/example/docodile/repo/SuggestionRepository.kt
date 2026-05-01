package com.example.docodile.repo

import com.example.docodile.domain.Suggestion
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SuggestionRepository : JpaRepository<Suggestion, UUID> {
    // Top-N suggestions for a (specialty, field) pool, optionally filtered
    // by a case-insensitive prefix on `value`. The IN clause supports
    // multi-specialty clinics — caller passes the list of the clinic's
    // specialties and gets a union of all matching rows. Service-layer
    // dedup picks the row with the highest use_count for each value.
    @Query(
        """
        SELECT s FROM Suggestion s
        WHERE s.speciality IN :specialities
          AND s.field = :field
          AND (:q = '' OR LOWER(s.value) LIKE LOWER(CONCAT(:q, '%')))
        ORDER BY s.useCount DESC, s.value ASC
        """
    )
    fun searchBySpecialitiesAndField(
        @Param("specialities") specialities: List<String>,
        @Param("field") field: String,
        @Param("q") q: String,
        pageable: Pageable
    ): List<Suggestion>

    fun findBySpecialityAndFieldAndValue(speciality: String, field: String, value: String): Suggestion?
}
