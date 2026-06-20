package com.example.docodile.service

/**
 * Thrown when patient data access is attempted without an active consent record
 * and consent enforcement is enabled. Mapped to HTTP 403 in GlobalExceptionHandler.
 */
class ConsentRequiredException(message: String) : RuntimeException(message)
