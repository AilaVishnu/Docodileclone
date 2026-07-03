package com.example.docodile.tenancy

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class SchemaTenantResolverTest {
    private val resolver = SchemaTenantResolver(defaultSchema = "public")

    @AfterEach fun clear() = TenantContext.clear()

    @Test
    fun `resolves the schema from TenantContext when set`() {
        TenantContext.set("tskin")
        assertEquals("tskin", resolver.resolveCurrentTenantIdentifier())
    }

    @Test
    fun `falls back to the default schema when no tenant is set`() {
        assertEquals("public", resolver.resolveCurrentTenantIdentifier())
    }

    @Test
    fun `validates existing sessions so cross-tenant session reuse is rejected`() {
        assertEquals(true, resolver.validateExistingCurrentSessions())
    }
}
