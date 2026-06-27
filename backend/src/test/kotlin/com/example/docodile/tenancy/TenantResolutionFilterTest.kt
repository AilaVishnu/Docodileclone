package com.example.docodile.tenancy

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import java.io.PrintWriter
import java.io.StringWriter

class TenantResolutionFilterTest {
    private val registry = mock(ClinicRegistryDao::class.java)
    private val filter = TenantResolutionFilter(registry)

    @AfterEach fun clear() = TenantContext.clear()

    private data class Result(val seen: String?, val chainCalled: Boolean)

    private fun run(host: String, xTenant: String? = null, path: String = "/api/patients"): Result {
        val req = mock(HttpServletRequest::class.java)
        val res = mock(HttpServletResponse::class.java)
        `when`(req.serverName).thenReturn(host)
        `when`(req.getHeader("X-Tenant")).thenReturn(xTenant)
        `when`(req.requestURI).thenReturn(path)
        `when`(res.writer).thenReturn(PrintWriter(StringWriter()))
        var seen: String? = null
        var called = false
        val chain = FilterChain { _, _ -> called = true; seen = TenantContext.get() }
        filter.doFilter(req, res, chain)
        return Result(seen, called)
    }

    private fun active(sub: String) =
        ClinicRecord(java.util.UUID.randomUUID(), sub, sub, sub, ProvisioningStatus.ACTIVE)

    @Test
    fun `resolves active clinic subdomain to its schema`() {
        `when`(registry.findBySubdomain("tskin")).thenReturn(active("tskin"))
        assertEquals("tskin", run("tskin.docodile.app").seen)
    }

    @Test
    fun `lvh_me subdomain works for dev`() {
        `when`(registry.findBySubdomain("acme")).thenReturn(active("acme"))
        assertEquals("acme", run("acme.lvh.me").seen)
    }

    @Test
    fun `X-Tenant header overrides host`() {
        `when`(registry.findBySubdomain("acme")).thenReturn(active("acme"))
        assertEquals("acme", run("localhost", xTenant = "acme").seen)
    }

    @Test
    fun `bare host with no subdomain is rejected for a tenant-scoped path`() {
        assertFalse(run("docodile.app").chainCalled)
        assertFalse(run("localhost").chainCalled)
    }

    @Test
    fun `reserved www label is rejected`() {
        assertFalse(run("www.docodile.app").chainCalled)
    }

    @Test
    fun `unknown subdomain is rejected`() {
        `when`(registry.findBySubdomain("ghost")).thenReturn(null)
        assertFalse(run("ghost.docodile.app").chainCalled)
    }

    @Test
    fun `inactive (provisioning) clinic is not routed and is rejected`() {
        `when`(registry.findBySubdomain("half")).thenReturn(
            ClinicRecord(java.util.UUID.randomUUID(), "half", "half", "half", ProvisioningStatus.PROVISIONING))
        assertFalse(run("half.docodile.app").chainCalled)
    }

    @Test
    fun `allowlisted health path is not rejected without a tenant`() {
        assertTrue(run("docodile.app", path = "/api/health").chainCalled)
    }

    @Test
    fun `context is cleared after the chain runs`() {
        `when`(registry.findBySubdomain("tskin")).thenReturn(active("tskin"))
        run("tskin.docodile.app")
        assertNull(TenantContext.get())
    }
}
