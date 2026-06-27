package com.example.docodile.tenancy

import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider
import org.springframework.stereotype.Component
import java.sql.Connection
import javax.sql.DataSource

/**
 * SCHEMA multi-tenancy: one shared DataSource, switch Postgres search_path per tenant.
 * On checkout set search_path to the tenant schema; on release reset it before the
 * connection returns to the Hikari pool (critical: otherwise a later borrower inherits
 * this tenant's scope). Registered with Hibernate via MultiTenancyConfig.
 */
@Component
class SchemaMultiTenantConnectionProvider(
    private val dataSource: DataSource,
) : MultiTenantConnectionProvider<String> {

    override fun getAnyConnection(): Connection = dataSource.connection
    override fun releaseAnyConnection(connection: Connection) = connection.close()

    override fun getConnection(tenantIdentifier: String): Connection {
        val c = dataSource.connection
        try {
            // Parameterized set_config avoids interpolating an identifier into DDL — the
            // tenant value is passed as a bound string, so there is no injection sink even
            // if an unvalidated schema name ever reached here. (false = session-level.)
            c.prepareStatement("SELECT set_config('search_path', ?, false)").use { ps ->
                ps.setString(1, tenantIdentifier)
                ps.execute()
            }
        } catch (e: Throwable) {
            // SET failed — close the borrowed connection so the Hikari slot is not leaked.
            runCatching { c.close() }
            throw e
        }
        return c
    }

    override fun releaseConnection(tenantIdentifier: String, connection: Connection) {
        try {
            connection.createStatement().use { it.execute("RESET search_path") }
        } catch (e: Exception) {
            // Reset failed: the connection may still be scoped to this tenant. Abort it so
            // the pool discards rather than hands a mis-scoped connection to the next borrower.
            runCatching { connection.abort(Runnable::run) }
        } finally {
            connection.close()
        }
    }

    override fun handlesConnectionSchema(): Boolean = true
    override fun supportsAggressiveRelease(): Boolean = false
    override fun isUnwrappableAs(unwrapType: Class<*>): Boolean = false
    override fun <T : Any?> unwrap(unwrapType: Class<T>): T =
        throw UnsupportedOperationException("Cannot unwrap to $unwrapType")
}
