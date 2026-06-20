package com.example.docodile.tenancy

import org.springframework.stereotype.Repository
import java.util.UUID
import javax.sql.DataSource

enum class ProvisioningStatus { PROVISIONING, ACTIVE, SUSPENDED }

data class ClinicRecord(
    val id: UUID,
    val name: String,
    val subdomain: String,
    val schemaName: String,
    val status: ProvisioningStatus,
)

/** Plain-JDBC access to platform.clinic. No JPA — the registry lives outside any tenant. */
@Repository
class ClinicRegistryDao(private val dataSource: DataSource) {

    fun insert(rec: ClinicRecord) {
        dataSource.connection.use { c ->
            c.prepareStatement(
                "INSERT INTO platform.clinic (id, name, subdomain, schema_name, status) VALUES (?,?,?,?,?)"
            ).use { ps ->
                ps.setObject(1, rec.id); ps.setString(2, rec.name)
                ps.setString(3, rec.subdomain); ps.setString(4, rec.schemaName)
                ps.setString(5, rec.status.name)
                ps.executeUpdate()
            }
        }
    }

    fun updateStatus(id: UUID, status: ProvisioningStatus) {
        dataSource.connection.use { c ->
            c.prepareStatement("UPDATE platform.clinic SET status = ? WHERE id = ?").use { ps ->
                ps.setString(1, status.name); ps.setObject(2, id)
                ps.executeUpdate()
            }
        }
    }

    fun delete(id: UUID) {
        dataSource.connection.use { c ->
            c.prepareStatement("DELETE FROM platform.clinic WHERE id = ?").use { ps ->
                ps.setObject(1, id); ps.executeUpdate()
            }
        }
    }

    fun findBySubdomain(subdomain: String): ClinicRecord? =
        dataSource.connection.use { c ->
            c.prepareStatement(
                "SELECT id, name, subdomain, schema_name, status FROM platform.clinic WHERE subdomain = ?"
            ).use { ps ->
                ps.setString(1, subdomain)
                ps.executeQuery().use { rs ->
                    if (!rs.next()) null else ClinicRecord(
                        id = rs.getObject("id", UUID::class.java),
                        name = rs.getString("name"),
                        subdomain = rs.getString("subdomain"),
                        schemaName = rs.getString("schema_name"),
                        status = ProvisioningStatus.valueOf(rs.getString("status")),
                    )
                }
            }
        }

    fun listActiveSchemas(): List<String> =
        dataSource.connection.use { c ->
            c.prepareStatement("SELECT schema_name FROM platform.clinic WHERE status = 'ACTIVE'").use { ps ->
                ps.executeQuery().use { rs ->
                    buildList { while (rs.next()) add(rs.getString(1)) }
                }
            }
        }
}
