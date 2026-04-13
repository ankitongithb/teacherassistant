package com.ta.controller;

import com.ta.dto.attendance.SubjectAttendanceSummaryDTO;
import com.ta.service.AttendanceAnalyticsService;
import com.ta.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class AttendanceAnalyticsController {

    private final AttendanceAnalyticsService analyticsService;
    private final TeacherService teacherService;

    /**
     * Get attendance summary for a specific subject, hours-based.
     * Optionally filter by batchId.
     */
    @GetMapping("/{subjectId}/attendance-summary")
    public ResponseEntity<SubjectAttendanceSummaryDTO> getSubjectAttendanceSummary(
            @PathVariable Long subjectId,
            @RequestParam(required = false) Long batchId) {
        return ResponseEntity.ok(analyticsService.getSubjectAttendanceSummary(subjectId, batchId));
    }

    /**
     * Get attendance summaries for all subjects owned by the authenticated teacher.
     */
    @GetMapping("/attendance-summary")
    public ResponseEntity<List<SubjectAttendanceSummaryDTO>> getAllSubjectsSummary(Authentication auth) {
        return ResponseEntity.ok(analyticsService.getAllSubjectsSummary(auth.getName(), teacherService));
    }

    /**
     * Export a subject attendance summary as PDF.
     */
    @GetMapping("/{subjectId}/attendance-summary/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long subjectId,
            @RequestParam(required = false) Long batchId) {
        byte[] pdf = analyticsService.generateSummaryPdf(subjectId, batchId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=subject_attendance_analytics.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
