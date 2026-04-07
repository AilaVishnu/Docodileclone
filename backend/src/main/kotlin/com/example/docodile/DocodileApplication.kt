package com.example.docodile

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class DocodileApplication

fun main(args: Array<String>) {
    java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Kolkata"))
    runApplication<DocodileApplication>(*args)
}
