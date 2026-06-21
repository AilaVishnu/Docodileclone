package com.example.docodile.tenancy

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*

class TenantResolutionFilterTest {
    private val registry = mock(ClinicRegistryDao::class.java)
    private val filter = TenantResolutionFilter(registry)

    @AfterEach fun clear() = TenantContext.clear()

    private fun run(host: String, xTenant: String? = null): String? {
        val req = mock(HttpServletRequest::class.java)
        val res = mock(HttpServletResponse::class.java)
        `when`(req.serverName).thenReturn(host)
        `when`(req.getHeader("X-Tenant")).thenReturn(xTenant)
        var seenInsideChain: String? = null
        val chain = FilterChain { _, _ -> seenInsideChain = TenantContext.get() }
        filter.doFilter(req, res, chain)
        return seenInsideChain
    }

    private fun active(sub: String) =
        ClinicRecord(java.util.UUID.randomUUID(), sub, sub, sub, ProvisioningStatus.ACTIVE)

    @Test
    fun `resolves active clinic subdomain to its schema`() {
        `when`(registry.findBySubdomain("tskin")).thenReturn(active("tskin"))
        assertEquals("tskin", run("tskin.docodile.app"))
    }

    @Test
    fun `lvh_me subdomain works for dev`() {
        `when`(registry.findBySubdomain("acme")).thenReturn(active("acme"))
        assertEquals("acme", run("acme.lvh.me"))
    }

    @Test
    fun `X-Tenant header overrides host`() {
        `when`(registry.findBySubdomain("acme")).thenReturn(active("acme"))
        assertEquals("acme", run("localhost", xTenant = "acme"))
    }

    @Test
    fun `bare host with no subdomain leaves context unset`() {
        assertNull(run("docodile.app"))
        assertNull(run("localhost"))
    }

    @Test
    fun `reserved www label is not a tenant`() {
        assertNull(run("www.docodile.app"))
    }

    @Test
    fun `unknown or inactive subdomain leaves context unset (lenient in 2a)`() {
        `when`(registry.findBySubdomain("ghost")).thenReturn(null)
        assertNull(run("ghost.docodile.app"))
    }

    @Test
    fun `inactive (provisioning) clinic is not routed`() {
        `when`(registry.findBySubdomain("half")).thenReturn(
            ClinicRecord(java.util.UUID.randomUUID(), "half", "half", "half", ProvisioningStatus.PROVISIONING))
        assertNull(run("half.docodile.app"))
    }

    @Test
    fun `context is cleared after the chain runs`() {
        `when`(registry.findBySubdomain("tskin")).thenReturn(active("tskin"))
        run("tskin.docodile.app")
        assertNull(TenantContext.get())
    }
}
