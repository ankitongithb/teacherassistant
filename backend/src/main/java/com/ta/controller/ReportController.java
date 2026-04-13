package com.ta.controller;

import com.ta.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/attendance")
    public ResponseEntity<byte[]> getAttendanceReport(
            Authentication auth,
            @RequestParam Long batchId,
            @RequestParam(required = false) Long subjectId) {
        byte[] pdf = reportService.generateAttendanceReport(auth.getName(), batchId, subjectId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/marks")
    public ResponseEntity<byte[]> getMarksReport(
            Authentication auth,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String examType) {
        byte[] pdf = reportService.generateMarksReport(auth.getName(), batchId, subjectId, examType);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=marks_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
