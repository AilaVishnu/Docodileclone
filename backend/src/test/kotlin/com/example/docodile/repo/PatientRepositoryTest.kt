package com.example.docodile.repo

import com.example.docodile.domain.Patient
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.test.context.ActiveProfiles

@DataJpaTest
@ActiveProfiles("test")
class PatientRepositoryTest @Autowired constructor(
    private val entityManager: TestEntityManager,
    private val patientRepository: PatientRepository
) {

    @Test
    fun `should find all active patients`() {
        entityManager.persist(Patient(name = "Patient 1"))
        entityManager.persist(Patient(name = "Patient 2"))
        entityManager.flush()

        val found = patientRepository.findAllByDeletedAtIsNull()
        assertEquals(2, found.size)
    }
}
