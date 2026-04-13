package com.ta.service;

import com.ta.dto.attendance.SubjectAttendanceSummaryDTO;
import com.ta.exception.ResourceNotFoundException;
import com.ta.model.*;
import com.ta.model.enums.AttendanceStatus;
import com.ta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceAnalyticsService {

    private final SubjectRepository subjectRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final BatchSubjectRepository batchSubjectRepository;
    private final StudentRepository studentRepository;

    public SubjectAttendanceSummaryDTO getSubjectAttendanceSummary(Long subjectId, Long batchId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));

        // Get all sessions for this subject (optionally filtered by batch)
        List<AttendanceSession> sessions;
        if (batchId != null) {
            sessions = sessionRepository.findByBatchIdAndSubjectIdOrderByDateDesc(batchId, subjectId);
        } else {
            sessions = sessionRepository.findBySubjectIdOrderByDateDesc(subjectId);
        }

        // Calculate total hours across all sessions
        int totalHours = sessions.stream().mapToInt(AttendanceSession::getHours).sum();

        // Build a map: studentId -> total attended hours
        // For each session, get PRESENT records and add session.hours to their total
        Map<Long, Integer> studentAttendedHours = new HashMap<>();
        Map<Long, Student> studentMap = new HashMap<>();

        for (AttendanceSession session : sessions) {
            List<AttendanceRecord> records = recordRepository.findBySessionId(session.getId());
            for (AttendanceRecord record : records) {
                Student student = record.getStudent();
                studentMap.putIfAbsent(student.getId(), student);

                if (record.getStatus() == AttendanceStatus.PRESENT) {
                    studentAttendedHours.merge(student.getId(), session.getHours(), Integer::sum);
                } else {
                    // Ensure student appears in the map even if always absent
                    studentAttendedHours.putIfAbsent(student.getId(), 0);
                }
            }
        }

        // Build per-student summary
        List<SubjectAttendanceSummaryDTO.StudentHoursSummary> studentSummaries = studentMap.entrySet().stream()
                .map(entry -> {
                    Long studentId = entry.getKey();
                    Student student = entry.getValue();
                    int attended = studentAttendedHours.getOrDefault(studentId, 0);
                    double percentage = totalHours > 0
                            ? Math.round((double) attended / totalHours * 10000.0) / 100.0
                            : 0.0;

                    return SubjectAttendanceSummaryDTO.StudentHoursSummary.builder()
                            .studentId(studentId)
                            .name(student.getName())
                            .rollNumber(student.getRollNumber())
                            .batchName(student.getBatch().getBatchName())
                            .attendedHours(attended)
                            .totalHours(totalHours)
                            .attendancePercentage(percentage)
                            .build();
                })
                .sorted(Comparator.comparing(SubjectAttendanceSummaryDTO.StudentHoursSummary::getAttendancePercentage).reversed())
                .collect(Collectors.toList());

        // Class average
        double classAverage = studentSummaries.isEmpty() ? 0.0
                : Math.round(studentSummaries.stream()
                    .mapToDouble(SubjectAttendanceSummaryDTO.StudentHoursSummary::getAttendancePercentage)
                    .average().orElse(0) * 100.0) / 100.0;

        return SubjectAttendanceSummaryDTO.builder()
                .subjectId(subject.getId())
                .subjectName(subject.getSubjectName())
                .subjectCode(subject.getSubjectCode())
                .totalHours(totalHours)
                .totalSessions(sessions.size())
                .classAveragePercentage(classAverage)
                .students(studentSummaries)
                .build();
    }

    /**
     * Get a summary of all subjects for a teacher (overview).
     */
    public List<SubjectAttendanceSummaryDTO> getAllSubjectsSummary(String email, TeacherService teacherService) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        List<Subject> subjects = subjectRepository.findByTeacherIdAndIsDeletedFalse(teacher.getId());

        return subjects.stream()
                .map(subject -> getSubjectAttendanceSummary(subject.getId(), null))
                .sorted(Comparator.comparing(SubjectAttendanceSummaryDTO::getSubjectCode))
                .collect(Collectors.toList());
    }

    /**
     * Generate PDF bytes for subject attendance summary.
     */
    public byte[] generateSummaryPdf(Long subjectId, Long batchId) {
        SubjectAttendanceSummaryDTO summary = getSubjectAttendanceSummary(subjectId, batchId);

        com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();

        try {
            com.lowagie.text.pdf.PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 18, com.lowagie.text.Font.BOLD, new java.awt.Color(55, 48, 163));
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Subject Attendance Analytics", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Subject info
            com.lowagie.text.Font infoFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.NORMAL);
            com.lowagie.text.Font boldFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.BOLD);
            document.add(new com.lowagie.text.Paragraph("Subject: " + summary.getSubjectName() + " (" + summary.getSubjectCode() + ")", boldFont));
            document.add(new com.lowagie.text.Paragraph("Total Hours Taught: " + summary.getTotalHours(), infoFont));
            document.add(new com.lowagie.text.Paragraph("Total Sessions: " + summary.getTotalSessions(), infoFont));
            document.add(new com.lowagie.text.Paragraph("Class Average: " + summary.getClassAveragePercentage() + "%", infoFont));
            document.add(new com.lowagie.text.Paragraph(" "));

            // Table
            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2, 3, 2, 2, 2});

            // Headers
            com.lowagie.text.Font headerFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.BOLD, java.awt.Color.WHITE);
            String[] headers = {"Roll No.", "Student Name", "Attended Hrs", "Total Hrs", "Attendance %"};
            for (String h : headers) {
                com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(h, headerFont));
                cell.setBackgroundColor(new java.awt.Color(79, 70, 229));
                cell.setPadding(8);
                cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Data rows
            com.lowagie.text.Font cellFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9, com.lowagie.text.Font.NORMAL);
            for (SubjectAttendanceSummaryDTO.StudentHoursSummary s : summary.getStudents()) {
                table.addCell(createCell(s.getRollNumber(), cellFont));
                table.addCell(createCell(s.getName(), cellFont));
                table.addCell(createCell(String.valueOf(s.getAttendedHours()), cellFont));
                table.addCell(createCell(String.valueOf(s.getTotalHours()), cellFont));

                com.lowagie.text.pdf.PdfPCell pctCell = createCell(s.getAttendancePercentage() + "%", cellFont);
                if (s.getAttendancePercentage() >= 75) {
                    pctCell.setBackgroundColor(new java.awt.Color(220, 252, 231));
                } else if (s.getAttendancePercentage() >= 50) {
                    pctCell.setBackgroundColor(new java.awt.Color(254, 249, 195));
                } else {
                    pctCell.setBackgroundColor(new java.awt.Color(254, 226, 226));
                }
                table.addCell(pctCell);
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating subject analytics PDF", e);
        }

        return baos.toByteArray();
    }

    private com.lowagie.text.pdf.PdfPCell createCell(String text, com.lowagie.text.Font font) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(new com.lowagie.text.Phrase(text, font));
        cell.setPadding(6);
        cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
        return cell;
    }
}
