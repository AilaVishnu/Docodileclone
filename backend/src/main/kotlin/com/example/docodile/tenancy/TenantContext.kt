package com.example.docodile.tenancy

/**
 * Request-scoped holder for the current tenant's Postgres schema name.
 * Populated per request by TenantResolutionFilter (wired in Plan 2b) and read
 * by SchemaTenantResolver. ThreadLocal because each request is one thread under
 * the servlet model; must be cleared in a finally to avoid leaking across pooled threads.
 */
object TenantContext {
    private val current = ThreadLocal<String?>()

    fun set(schema: String?) = current.set(schema)
    fun get(): String? = current.get()
    fun clear() = current.remove()

    inline fun <T> withTenant(schema: String, block: () -> T): T {
        set(schema)
        try {
            return block()
        } finally {
            clear()
        }
    }
}
