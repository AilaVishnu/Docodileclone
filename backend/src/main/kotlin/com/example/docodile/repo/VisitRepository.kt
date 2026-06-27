package com.example.docodile.repo

import com.example.docodile.domain.Visit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.util.UUID

interface VisitRepository : JpaRepository<Visit, UUID> {
    fun findAllByVisitDateBetween(start: LocalDate, end: LocalDate): List<Visit>

    @Query("""
        SELECT v FROM Visit v
        WHERE (
            LOWER(v.complaints) LIKE :q
            OR LOWER(v.diagnosis) LIKE :q
            OR LOWER(v.notesForPatient) LIKE :q
            OR LOWER(v.privateNotes) LIKE :q
            OR LOWER(v.tests) LIKE :q
            OR LOWER(v.reviewNotes) LIKE :q
          )
        ORDER BY v.visitDate DESC
    """)
    fun searchNotes(@Param("q") q: String): List<Visit>

    @Query("""
        SELECT v FROM Visit v
        WHERE v.reviewDate IS NOT NULL
          AND v.reviewDate < :today
        ORDER BY v.reviewDate ASC
    """)
    fun findOverdueReviews(@Param("today") today: LocalDate): List<Visit>

    fun findAllByPatientIdOrderByVisitDateAscCreatedAtAsc(patientId: UUID): List<Visit>

    @Query("""
        SELECT v FROM Visit v
        WHERE v.sessionStartedAt IS NOT NULL
          AND v.sessionEndedAt IS NULL
          AND (
            v.appointmentId IS NULL
            OR NOT EXISTS (
              SELECT 1 FROM Appointment a
              WHERE a.id = v.appointmentId
                AND UPPER(a.status) IN ('COMPLETED', 'CANCELLED', 'NO_SHOW')
            )
          )
    """)
    fun findActiveSessions(): List<Visit>

    @Query("SELECT v FROM Visit v WHERE v.patient.id IN :patientIds ORDER BY v.visitDate ASC")
    fun findAllByPatientIdInOrderByVisitDateAsc(@Param("patientIds") patientIds: List<UUID>): List<Visit>

    fun findAllByExternalRefIsNotNull(): List<Visit>

    @Query("""
        SELECT v.patient.id AS patientId, MAX(v.visitDate) AS lastVisitDate
        FROM Visit v
        GROUP BY v.patient.id
    """)
    fun findLastVisitDates(): List<LastVisitProjection>

    @Query("""
        SELECT DISTINCT v.patient.id AS patientId, v.createdByDoctor.id AS doctorId
        FROM Visit v
        WHERE v.createdByDoctor IS NOT NULL
    """)
    fun findPatientDoctorPairs(): List<PatientDoctorProjection>
}

interface LastVisitProjection {
    fun getPatientId(): UUID
    fun getLastVisitDate(): LocalDate?
}

interface PatientDoctorProjection {
    fun getPatientId(): UUID
    fun getDoctorId(): UUID?
}
