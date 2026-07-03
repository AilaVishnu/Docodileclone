package com.example.docodile.repo

import com.example.docodile.domain.PharmacyStock
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PharmacyStockRepository : JpaRepository<PharmacyStock, UUID> {
    fun findAllByOrderByNameAsc(): List<PharmacyStock>
}
