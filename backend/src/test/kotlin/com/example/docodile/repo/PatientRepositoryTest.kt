package com.example.docodile.repo

import com.example.docodile.domain.ClinicEntity
import com.example.docodile.domain.Patient
import com.example.docodile.domain.Tenant
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import java.util.*

@DataJpaTest
@ActiveProfiles("test")
class PatientRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val patientRepository: PatientRepository
) {

    private lateinit var tenant: Tenant
    private lateinit var clinic: ClinicEntity

    @BeforeEach
    fun setup() {
        tenant = Tenant(name = "Test Tenant")
        entityManager.persist(tenant)

        clinic = ClinicEntity(name = "Test Clinic", tenant = tenant)
        entityManager.persist(clinic)

        entityManager.flush()
    }

    @Test
    fun `should find patients by clinic id`() {
        val patient1 = Patient(name = "Patient 1", clinic = clinic)
        val patient2 = Patient(name = "Patient 2", clinic = clinic)
        entityManager.persist(patient1)
        entityManager.persist(patient2)
        entityManager.flush()

        val found = patientRepository.findAllByClinicId(clinic.id)
        assertEquals(2, found.size)
    }
}
