package com.example.docodile.web

import com.example.docodile.service.SuggestionService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/suggestions")
class SuggestionController(private val suggestionService: SuggestionService) {

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun list(
        @RequestParam field: String,
        @RequestParam(required = false, defaultValue = "") q: String,
        @RequestParam(required = false, defaultValue = "10") limit: Int
    ): List<SuggestionDTO> = suggestionService.list(field, q, limit)

    // Returns one row per clinic-specialty (the same value is upserted into
    // each of the caller's specialty pools); frontend can ignore the array
    // shape and just treat success as "saved".
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','FRONT_DESK','NURSE','PHARMACY','OTHER')")
    fun record(@RequestBody request: RecordSuggestionRequest): ResponseEntity<Any> = try {
        ResponseEntity.ok(suggestionService.record(request.field, request.value))
    } catch (e: IllegalArgumentException) {
        ResponseEntity.badRequest().body(mapOf("error" to (e.message ?: "Invalid request")))
    }
}
