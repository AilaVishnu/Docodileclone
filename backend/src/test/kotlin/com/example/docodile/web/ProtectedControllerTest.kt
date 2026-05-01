package com.example.docodile.web

import com.example.docodile.security.CurrentUser
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.*

@WebMvcTest(ProtectedController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class ProtectedControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService


    @MockitoBean
    private lateinit var currentUser: CurrentUser

    @Test
    @WithMockUser(roles = ["DOCTOR"])
    fun `me-clinic should return current clinic id`() {
        val clinicId = UUID.randomUUID()
        `when`(currentUser.clinicIdOrNull()).thenReturn(clinicId)

        mockMvc.perform(get("/api/me/clinic"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.clinic_id").value(clinicId.toString()))
    }
}
