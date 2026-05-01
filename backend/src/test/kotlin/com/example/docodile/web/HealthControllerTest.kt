package com.example.docodile.web

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(HealthController::class)
@org.springframework.context.annotation.Import(com.example.docodile.security.JwtAuthenticationFilter::class)
class HealthControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private lateinit var tokenService: com.example.docodile.security.TokenService


    @Test
    fun `health endpoint should return ok`() {
        mockMvc.perform(get("/api/health"))
            .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print()).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ok"))
    }
}
