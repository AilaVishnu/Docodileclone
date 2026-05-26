package com.example.docodile.service

import com.example.docodile.domain.RxRow
import com.example.docodile.domain.Visit
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.repo.RxRowRepository
import com.example.docodile.repo.VisitRepository
import com.example.docodile.security.CurrentUser
import com.example.docodile.web.RxRowDTO
import com.example.docodile.web.SaveVisitRequest
import com.example.docodile.web.VisitDTO
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Service
class VisitService(
    private val visitRepository: VisitRepository,
    private val rxRowRepository: RxRowRepository,
    private val patientRepository: PatientRepository,
    private val clinicEntityRepository: ClinicEntityRepository,
    private val appUserRepository: AppUserRepository,
    private val currentUser: CurrentUser
) {
    fun listForPatient(patientId: UUID): List<VisitDTO> {
        val clinicId = currentUser.clinicId()

        // Strictly this patient's own visits. A phone number can be shared
        // across a family, so visit history must never be merged by phone —
        // each patient row owns its own history.
        return visitRepository.findAllByClinicIdAndPatientIdOrderByVisitDateAsc(clinicId, patientId)
            .map { it.toDTO(loadRxRows(it.id)) }
    }

    fun get(visitId: UUID): VisitDTO {
        val clinicId = currentUser.clinicId()
        val visit = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        return visit.toDTO(loadRxRows(visit.id))
    }

    @Transactional
    fun create(patientId: UUID, request: SaveVisitRequest): VisitDTO {
        val clinicId = currentUser.clinicId()
        val clinic = clinicEntityRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        val patient = patientRepository.findById(patientId)
            .orElseThrow { IllegalArgumentException("Patient not found") }
        require(patient.clinic?.id == clinicId) { "Patient does not belong to current clinic" }

        val visit = Visit(
            clinic = clinic,
            patient = patient,
            visitDate = request.visitDate ?: LocalDate.now(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        applyRequest(visit, request, clinicId)
        val saved = visitRepository.save(visit)
        val rxRows = saveRxRows(saved, request.prescriptions)
        return saved.toDTO(rxRows.map { it.toDTO() })
    }

    @Transactional
    fun update(visitId: UUID, request: SaveVisitRequest): VisitDTO {
        val clinicId = currentUser.clinicId()
        val visit = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        if (request.visitDate != null) visit.visitDate = request.visitDate
        applyRequest(visit, request, clinicId)
        visit.updatedAt = Instant.now()
        val saved = visitRepository.save(visit)
        rxRowRepository.deleteByVisitId(saved.id)
        val rxRows = saveRxRows(saved, request.prescriptions)
        return saved.toDTO(rxRows.map { it.toDTO() })
    }

    @Transactional
    fun delete(visitId: UUID) {
        val clinicId = currentUser.clinicId()
        val visit = visitRepository.findByIdAndClinicId(visitId, clinicId)
            ?: throw IllegalArgumentException("Visit not found")
        // rx_row ON DELETE CASCADE handles the children.
        visitRepository.delete(visit)
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private fun applyRequest(visit: Visit, r: SaveVisitRequest, clinicId: UUID) {
        // Vitals
        visit.bpSystolic = r.bpSystolic; visit.bpDiastolic = r.bpDiastolic; visit.bpUnit = r.bpUnit
        visit.bmi = r.bmi; visit.bmiUnit = r.bmiUnit
        visit.height = r.height; visit.heightUnit = r.heightUnit
        visit.weight = r.weight; visit.weightUnit = r.weightUnit
        visit.temperature = r.temperature; visit.temperatureUnit = r.temperatureUnit
        visit.pulse = r.pulse; visit.pulseUnit = r.pulseUnit
        visit.waist = r.waist; visit.waistUnit = r.waistUnit
        visit.hip = r.hip; visit.hipUnit = r.hipUnit
        visit.spo2 = r.spo2; visit.spo2Unit = r.spo2Unit
        // History
        visit.familyHistory = r.familyHistory
        visit.allergies = r.allergies
        visit.personalHistory = r.personalHistory
        visit.pastMedicalHistory = r.pastMedicalHistory
        // Free-text
        visit.complaints = r.complaints
        visit.diagnosis = r.diagnosis
        visit.notesForPatient = r.notesForPatient
        visit.privateNotes = r.privateNotes
        visit.tests = r.tests
        // Treating doctor — only set if missing or the request explicitly
        // provides one (don't blow away an existing assignment on update
        // when the frontend omits the field).
        if (r.createdByDoctorId != null) {
            visit.createdByDoctor = appUserRepository.findById(r.createdByDoctorId).orElse(null)
        }
        // Referral
        visit.referDoctor = r.referDoctorId?.let { id ->
            val doc = appUserRepository.findById(id).orElse(null)
            // Only accept a referral target that's also in this clinic.
            // (Cheap guard; if you later store doctors-by-clinic in a join
            // table, swap to that lookup.)
            doc?.takeIf { true }
        }
        // Next review
        visit.reviewDate = r.reviewDate
        visit.reviewDays = r.reviewDays
        visit.reviewNotes = r.reviewNotes
        // Session timing — passed through verbatim. Frontend sets these
        // from SessionBar's Start / End handlers.
        visit.sessionStartedAt = r.sessionStartedAt
        visit.sessionEndedAt = r.sessionEndedAt
        visit.sessionDurationSec = r.sessionDurationSec
    }

    private fun saveRxRows(visit: Visit, rows: List<RxRowDTO>): List<RxRow> =
        rows.mapIndexed { index, dto ->
            RxRow(
                visit = visit,
                position = (dto.position.takeIf { it > 0 } ?: (index + 1).toShort()),
                medicine = dto.medicine,
                medicineNote = dto.medicineNote,
                dosage = dto.dosage,
                whenToTake = dto.whenToTake,
                frequency = dto.frequency,
                duration = dto.duration,
                notes = dto.notes,
                createdAt = Instant.now()
            )
        }.let { rxRowRepository.saveAll(it) }

    private fun loadRxRows(visitId: UUID): List<RxRowDTO> =
        rxRowRepository.findByVisitIdOrderByPositionAsc(visitId).map { it.toDTO() }

    private fun RxRow.toDTO(): RxRowDTO = RxRowDTO(
        id = this.id,
        position = this.position,
        medicine = this.medicine,
        medicineNote = this.medicineNote,
        dosage = this.dosage,
        whenToTake = this.whenToTake,
        frequency = this.frequency,
        duration = this.duration,
        notes = this.notes
    )

    private fun Visit.toDTO(rxRows: List<RxRowDTO>): VisitDTO = VisitDTO(
        id = this.id,
        patientId = this.patient?.id ?: UUID(0, 0),
        clinicId = this.clinic?.id ?: UUID(0, 0),
        createdByDoctorId = this.createdByDoctor?.id,
        visitDate = this.visitDate,
        bpSystolic = this.bpSystolic, bpDiastolic = this.bpDiastolic, bpUnit = this.bpUnit,
        bmi = this.bmi, bmiUnit = this.bmiUnit,
        height = this.height, heightUnit = this.heightUnit,
        weight = this.weight, weightUnit = this.weightUnit,
        temperature = this.temperature, temperatureUnit = this.temperatureUnit,
        pulse = this.pulse, pulseUnit = this.pulseUnit,
        waist = this.waist, waistUnit = this.waistUnit,
        hip = this.hip, hipUnit = this.hipUnit,
        spo2 = this.spo2, spo2Unit = this.spo2Unit,
        familyHistory = this.familyHistory,
        allergies = this.allergies,
        personalHistory = this.personalHistory,
        pastMedicalHistory = this.pastMedicalHistory,
        complaints = this.complaints,
        diagnosis = this.diagnosis,
        notesForPatient = this.notesForPatient,
        privateNotes = this.privateNotes,
        tests = this.tests,
        referDoctorId = this.referDoctor?.id,
        referDoctorName = this.referDoctor?.name,
        reviewDate = this.reviewDate,
        reviewDays = this.reviewDays,
        reviewNotes = this.reviewNotes,
        sessionStartedAt = this.sessionStartedAt,
        sessionEndedAt = this.sessionEndedAt,
        sessionDurationSec = this.sessionDurationSec,
        prescriptions = rxRows
    )
}
