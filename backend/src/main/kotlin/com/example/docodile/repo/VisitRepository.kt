package com.example.docodile.repo

import com.example.docodile.domain.Visit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.util.UUID

interface VisitRepository : JpaRepository<Visit, UUID> {
    fun findAllByClinicIdAndVisitDateBetween(clinicId: UUID, start: LocalDate, end: LocalDate): List<Visit>

    @Query("""
        SELECT v FROM Visit v
        WHERE v.clinic.id = :clinicId
          AND v.reviewDate IS NOT NULL
          AND v.reviewDate < :today
        ORDER BY v.reviewDate ASC
    """)
    fun findOverdueReviews(@Param("clinicId") clinicId: UUID, @Param("today") today: LocalDate): List<Visit>

    fun findAllByClinicIdAndPatientIdOrderByVisitDateAsc(clinicId: UUID, patientId: UUID): List<Visit>

    @Query("SELECT v FROM Visit v WHERE v.clinic.id = :clinicId AND v.patient.id IN :patientIds ORDER BY v.visitDate ASC")
    fun findAllByClinicIdAndPatientIdInOrderByVisitDateAsc(
        @Param("clinicId") clinicId: UUID,
        @Param("patientIds") patientIds: List<UUID>
    ): List<Visit>

    // Cross-clinic guard: even if a caller knows a visitId, they can only
    // load it if it belongs to their clinic. Mirrors the pattern used by
    // PatientRepository.findAllByClinicId.
    fun findByIdAndClinicId(id: UUID, clinicId: UUID): Visit?

    /**
     * Most-recent visit_date per patient, scoped to one clinic. Used by the
     * patient list endpoint to render "last visit DD MMM" without N+1
     * fetches. Returns rows of `[patientId, lastVisitDate]`.
     */
    @Query(
        """
        SELECT v.patient.id AS patientId, MAX(v.visitDate) AS lastVisitDate
        FROM Visit v
        WHERE v.clinic.id = :clinicId
        GROUP BY v.patient.id
        """
    )
    fun findLastVisitDatesByClinic(@Param("clinicId") clinicId: UUID): List<LastVisitProjection>
}

interface LastVisitProjection {
    fun getPatientId(): UUID
    fun getLastVisitDate(): LocalDate?
}
