package com.example.docodile.tenancy

import org.flywaydb.core.Flyway
import org.springframework.stereotype.Component
import javax.sql.DataSource

/**
 * Runs Flyway migrations programmatically (the Java API), because we need
 * per-schema control over the target. Spring Boot's single-schema Flyway
 * autoconfig (classpath:db/migration → public) is left untouched and unrelated.
 *
 * - migrateControlPlane(): applies db/control to the `platform` schema.
 * - migrateTenant(schema): applies db/tenant to one clinic schema, with that
 *   schema owning its own flyway_schema_history.
 */
@Component
class TenantMigrator(private val dataSource: DataSource) {

    fun migrateControlPlane() {
        Flyway.configure()
            .dataSource(dataSource)
            .schemas("platform")
            .defaultSchema("platform")
            .locations("classpath:db/control")
            .table("flyway_schema_history")
            .load()
            .migrate()
    }

    fun migrateTenant(schema: String) {
        Flyway.configure()
            .dataSource(dataSource)
            .schemas(schema)
            .defaultSchema(schema)
            .locations("classpath:db/tenant")
            .table("flyway_schema_history")
            // Tolerate a schema that already has tables but no flyway history (e.g. a
            // dev-seeded schema, or one whose provisioning was interrupted): baseline it at
            // V1 instead of failing the whole boot. A fresh empty schema still migrates normally.
            .baselineOnMigrate(true)
            .load()
            .migrate()
    }
}
