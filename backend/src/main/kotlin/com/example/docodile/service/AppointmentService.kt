package com.example.docodile.service

import com.example.docodile.domain.Appointment
import com.example.docodile.domain.Patient
import com.example.docodile.repo.AppUserRepository
import com.example.docodile.repo.AppointmentRepository
import com.example.docodile.repo.ClinicEntityRepository
import com.example.docodile.repo.PatientRepository
import com.example.docodile.web.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Period
import java.util.UUID

@Service
class AppointmentService(
    private val appointmentRepository: AppointmentRepository,
    private val patientRepository: PatientRepository,
    private val clinicRepository: ClinicEntityRepository,
    private val userRepository: AppUserRepository
) {
    
    // ============ Patient Methods ============
    
    fun searchPatients(clinicId: UUID, query: String): List<PatientSearchResult> {
        return patientRepository.findAllByClinicId(clinicId)
            .filter { patient ->
                patient.phone?.contains(query, ignoreCase = true) == true ||
                patient.name.contains(query, ignoreCase = true)
            }
            .take(10)
            .map { it.toSearchResult() }
    }
    
    @Transactional
    fun createPatient(clinicId: UUID, request: CreatePatientRequest): PatientDto {
        val clinic = clinicRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        
        val patient = Patient(
            clinic = clinic,
            name = request.name,
            phone = request.phone,
            gender = request.gender,
            dob = request.dob ?: request.age?.let { calculateDobFromAge(it) },
            createdAt = Instant.now()
        )
        
        return patientRepository.save(patient).toDto()
    }
    
    fun getPatient(patientId: UUID): PatientDto {
        return patientRepository.findById(patientId)
            .orElseThrow { IllegalArgumentException("Patient not found") }
            .toDto()
    }
    
    // ============ Appointment Methods ============
    
    fun getTodayQueue(clinicId: UUID, doctorId: UUID?): TodayQueueResponse {
        val today = LocalDate.now()
        val appointments = appointmentRepository.findAllByClinicId(clinicId)
            .filter { appt ->
                val apptDate = appt.scheduledTime?.toLocalDate() ?: appt.createdAt?.let { 
                    LocalDateTime.ofInstant(it, java.time.ZoneId.systemDefault()).toLocalDate() 
                }
                apptDate == today && (doctorId == null || appt.doctor?.id == doctorId)
            }
            .sortedBy { it.createdAt }
            .mapIndexed { index, appt -> appt.toDto(tokenNumber = index + 1) }
        
        val summary = QueueSummary(
            waiting = appointments.count { it.status == AppointmentStatus.WAITING },
            inConsultation = appointments.count { it.status == AppointmentStatus.IN_CONSULTATION },
            done = appointments.count { it.status == AppointmentStatus.DONE },
            total = appointments.size
        )
        
        return TodayQueueResponse(appointments, summary)
    }
    
    @Transactional
    fun createAppointment(clinicId: UUID, request: CreateAppointmentRequest): AppointmentDto {
        val clinic = clinicRepository.findById(clinicId)
            .orElseThrow { IllegalArgumentException("Clinic not found") }
        
        val doctor = userRepository.findById(request.doctorId)
            .orElseThrow { IllegalArgumentException("Doctor not found") }
        
        // Get or create patient
        val patient = if (request.patientId != null) {
            patientRepository.findById(request.patientId)
                .orElseThrow { IllegalArgumentException("Patient not found") }
        } else if (request.newPatient != null) {
            val newPatient = Patient(
                clinic = clinic,
                name = request.newPatient.name,
                phone = request.newPatient.phone,
                gender = request.newPatient.gender,
                dob = request.newPatient.dob ?: request.newPatient.age?.let { calculateDobFromAge(it) },
                createdAt = Instant.now()
            )
            patientRepository.save(newPatient)
        } else {
            throw IllegalArgumentException("Either patientId or newPatient must be provided")
        }
        
        val appointment = Appointment(
            clinic = clinic,
            patient = patient,
            doctor = doctor,
            scheduledTime = request.scheduledTime ?: LocalDateTime.now(),
            status = AppointmentStatus.WAITING.name,
            type = request.type.name,
            fee = request.fee,
            notes = request.notes,
            createdAt = Instant.now()
        )
        
        val saved = appointmentRepository.save(appointment)
        
        // Calculate token number for today
        val todayCount = appointmentRepository.findAllByClinicId(clinicId)
            .count { appt ->
                val apptDate = appt.createdAt?.let { 
                    LocalDateTime.ofInstant(it, java.time.ZoneId.systemDefault()).toLocalDate() 
                }
                apptDate == LocalDate.now()
            }
        
        return saved.toDto(tokenNumber = todayCount)
    }
    
    @Transactional
    fun updateAppointmentStatus(appointmentId: UUID, request: UpdateAppointmentStatusRequest): AppointmentDto {
        val appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow { IllegalArgumentException("Appointment not found") }
        
        appointment.status = request.status.name
        return appointmentRepository.save(appointment).toDto()
    }
    
    // ============ Helper Methods ============
    
    private fun calculateDobFromAge(age: Int): LocalDate {
        return LocalDate.now().minusYears(age.toLong())
    }
    
    private fun Patient.toDto(): PatientDto {
        val age = this.dob?.let { Period.between(it, LocalDate.now()).years }
        return PatientDto(
            id = this.id,
            name = this.name,
            phone = this.phone,
            gender = this.gender,
            dob = this.dob,
            age = age
        )
    }
    
    private fun Patient.toSearchResult(): PatientSearchResult {
        val age = this.dob?.let { Period.between(it, LocalDate.now()).years }
        return PatientSearchResult(
            id = this.id,
            name = this.name,
            phone = this.phone,
            gender = this.gender,
            age = age
        )
    }
    
    private fun Appointment.toDto(tokenNumber: Int? = null): AppointmentDto {
        val patientEntity = this.patient!!
        val age = patientEntity.dob?.let { Period.between(it, LocalDate.now()).years }
        
        return AppointmentDto(
            id = this.id,
            patient = PatientDto(
                id = patientEntity.id,
                name = patientEntity.name,
                phone = patientEntity.phone,
                gender = patientEntity.gender,
                dob = patientEntity.dob,
                age = age
            ),
            doctorId = this.doctor?.id ?: UUID.randomUUID(),
            doctorName = this.doctor?.email, // Using email as name placeholder
            scheduledTime = this.scheduledTime,
            status = try { AppointmentStatus.valueOf(this.status ?: "WAITING") } catch (e: Exception) { AppointmentStatus.WAITING },
            type = try { AppointmentType.valueOf(this.type ?: "CONSULTATION") } catch (e: Exception) { AppointmentType.CONSULTATION },
            fee = this.fee,
            paymentStatus = PaymentStatus.PENDING, // TODO: Add to domain model
            paymentMode = null,
            notes = this.notes,
            tokenNumber = tokenNumber
        )
    }
}
