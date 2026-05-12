package com.example.docodile.web

import java.util.UUID

data class SuggestionDTO(
    val id: UUID,
    val field: String,
    val value: String,
    val useCount: Int
)

data class RecordSuggestionRequest(
    val field: String,
    val value: String
)
