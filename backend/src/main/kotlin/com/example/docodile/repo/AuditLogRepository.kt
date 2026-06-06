package com.example.docodile.repo

import com.example.docodile.domain.AuditLog
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AuditLogRepository : JpaRepository<AuditLog, UUID>
