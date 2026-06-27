package com.example.docodile.tenancy

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate

/**
 * Runs a unit of background work once per ACTIVE clinic schema. Scheduled jobs run
 * on a scheduler thread with no request and therefore no TenantContext, so without
 * this they default to the (empty) `public` schema. This sets the tenant per clinic
 * and runs the work in its own tenant-scoped transaction (the connection routes to
 * the schema set in TenantContext when the transaction acquires it). A failure in
 * one clinic is logged and never stops the others.
 */
@Component
class TenantTaskExecutor(
    private val registry: ClinicRegistryDao,
    txManager: PlatformTransactionManager,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val tx = TransactionTemplate(txManager)

    fun forEachActiveClinic(taskName: String, work: () -> Unit) {
        for (schema in registry.listActiveSchemas()) {
            try {
                TenantContext.withTenant(schema) {
                    tx.executeWithoutResult { work() }
                }
            } catch (e: Exception) {
                log.warn("Scheduled task '{}' failed for clinic '{}'", taskName, schema, e)
            }
        }
    }
}
