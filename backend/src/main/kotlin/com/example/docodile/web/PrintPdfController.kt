package com.example.docodile.web

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder
import org.jsoup.Jsoup
import org.jsoup.helper.W3CDom
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.io.ByteArrayOutputStream

/**
 * Server-side HTML → PDF renderer for the prescription download flow.
 * The browser's print-preview "Save as PDF" was flaky on some setups
 * (blank page, race with iframe removal); this gives the frontend a
 * deterministic one-click .pdf download.
 *
 * The frontend hands us the same HTML it would have printed; we feed it
 * through openhtmltopdf and stream back the PDF bytes. Nothing patient-
 * specific is logged or persisted here.
 */
@RestController
@RequestMapping("/api/print")
class PrintPdfController {

    @PostMapping("/pdf")
    @PreAuthorize("isAuthenticated()")
    fun renderPdf(@RequestBody body: RenderPdfRequest): ResponseEntity<ByteArray> {
        // openhtmltopdf demands strict XHTML; jsoup's W3C bridge cleans up
        // unclosed tags, malformed attributes, etc. without us hand-writing
        // a tag whitelist.
        val jsoupDoc = Jsoup.parse(body.html)
        jsoupDoc.outputSettings().syntax(org.jsoup.nodes.Document.OutputSettings.Syntax.xml)
        val w3cDoc = W3CDom().fromJsoup(jsoupDoc)

        val out = ByteArrayOutputStream()
        PdfRendererBuilder()
            .useFastMode()
            .withW3cDocument(w3cDoc, "")
            .toStream(out)
            .run()

        val safeName = body.filename
            .ifBlank { "prescription" }
            .replace(Regex("[^A-Za-z0-9._-]"), "_")
            .take(80)

        val headers = HttpHeaders().apply {
            contentType = MediaType.APPLICATION_PDF
            setContentDispositionFormData("attachment", "$safeName.pdf")
        }
        return ResponseEntity(out.toByteArray(), headers, org.springframework.http.HttpStatus.OK)
    }
}

data class RenderPdfRequest(
    val html: String = "",
    val filename: String = "prescription",
)
