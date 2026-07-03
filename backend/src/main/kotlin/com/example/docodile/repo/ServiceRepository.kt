package com.example.docodile.repo

import com.example.docodile.domain.Service
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ServiceRepository : JpaRepository<Service, UUID> {
    fun findAllByOrderByCreatedAtAsc(): List<Service>
}
