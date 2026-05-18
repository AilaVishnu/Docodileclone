package com.example.docodile

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class DocodileApplication

fun main(args: Array<String>) {
    java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Kolkata"))
    runApplication<DocodileApplication>(*args)
}
