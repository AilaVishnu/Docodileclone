package com.example.docodile.tenancy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class TenantContextTest {
    @Test
    fun `set then get returns the schema, clear removes it`() {
        assertNull(TenantContext.get())
        TenantContext.set("tskin")
        assertEquals("tskin", TenantContext.get())
        TenantContext.clear()
        assertNull(TenantContext.get())
    }

    @Test
    fun `withTenant runs the block scoped and clears after`() {
        val seen = TenantContext.withTenant("acme") { TenantContext.get() }
        assertEquals("acme", seen)
        assertNull(TenantContext.get())
    }
}
