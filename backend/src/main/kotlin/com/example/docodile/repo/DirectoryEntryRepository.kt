package com.example.docodile.repo

import com.example.docodile.domain.DirectoryEntry
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface DirectoryEntryRepository : JpaRepository<DirectoryEntry, UUID> {
    fun findAllByCategoryOrderByCreatedAtAsc(category: String): List<DirectoryEntry>
}
