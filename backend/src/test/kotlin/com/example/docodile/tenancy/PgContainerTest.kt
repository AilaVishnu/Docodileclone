package com.example.docodile.tenancy

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.testcontainers.containers.PostgreSQLContainer

/**
 * Base for tenancy integration tests. Spins up a real Postgres 16 (matching
 * docker-compose.yml) once per test class and exposes a HikariDataSource.
 * These tests operate on the DataSource directly — no Spring context — so the
 * provisioning/migration code is verified against real Postgres schema semantics.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
abstract class PgContainerTest {

    private lateinit var container: PostgreSQLContainer<*>
    protected lateinit var dataSource: HikariDataSource

    @BeforeAll
    fun startPg() {
        container = PostgreSQLContainer("postgres:16")
            .withDatabaseName("docodile")
            .withUsername("docodile")
            .withPassword("docodile")
        container.start()
        dataSource = HikariDataSource(HikariConfig().apply {
            jdbcUrl = container.jdbcUrl
            username = container.username
            password = container.password
            maximumPoolSize = 4
        })
    }

    @AfterAll
    fun stopPg() {
        dataSource.close()
        container.stop()
    }
}

class PgContainerSmokeTest : PgContainerTest() {
    @Test
    fun `container answers select 1`() {
        dataSource.connection.use { c ->
            c.createStatement().use { stmt ->
                stmt.executeQuery("SELECT 1").use { rs ->
                    rs.next()
                    assertEquals(1, rs.getInt(1))
                }
            }
        }
    }
}
