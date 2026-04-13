package com.ta.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.ta.dto.attendance.AttendanceRecordDTO;
import com.ta.dto.attendance.AttendanceSessionDTO;
import com.ta.dto.marks.MarksDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AttendanceService attendanceService;
    private final MarksService marksService;

    public byte[] generateAttendanceReport(String email, Long batchId, Long subjectId) {
        List<AttendanceSessionDTO> sessions = attendanceService.getSessions(email, batchId, subjectId, null, null);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(55, 48, 163));
            Paragraph title = new Paragraph("Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            if (sessions.isEmpty()) {
                document.add(new Paragraph("No attendance sessions found."));
            } else {
                // Info
                AttendanceSessionDTO first = sessions.get(0);
                Font infoFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
                document.add(new Paragraph("Batch: " + first.getBatchName(), infoFont));
                document.add(new Paragraph("Subject: " + first.getSubjectName() + " (" + first.getSubjectCode() + ")", infoFont));
                document.add(new Paragraph(" "));

                for (AttendanceSessionDTO session : sessions) {
                    // Session header
                    Font sessionFont = new Font(Font.HELVETICA, 12, Font.BOLD);
                    document.add(new Paragraph("Date: " + session.getDate() + " | Hours: " + session.getHours() +
                            " | Topic: " + (session.getTopic() != null ? session.getTopic() : "N/A"), sessionFont));

                    // Table
                    PdfPTable table = new PdfPTable(3);
                    table.setWidthPercentage(100);
                    table.setSpacingBefore(5);
                    table.setSpacingAfter(15);
                    table.setWidths(new float[]{2, 3, 2});

                    addHeaderCell(table, "Roll No.");
                    addHeaderCell(table, "Student Name");
                    addHeaderCell(table, "Status");

                    for (AttendanceRecordDTO record : session.getRecords()) {
                        table.addCell(createCell(record.getRollNumber()));
                        table.addCell(createCell(record.getStudentName()));
                        PdfPCell statusCell = createCell(record.getStatus());
                        if ("PRESENT".equals(record.getStatus())) {
                            statusCell.setBackgroundColor(new Color(220, 252, 231));
                        } else {
                            statusCell.setBackgroundColor(new Color(254, 226, 226));
                        }
                        table.addCell(statusCell);
                    }

                    document.add(table);
                    document.add(new Paragraph("Present: " + session.getPresentCount() + " | Absent: " + session.getAbsentCount(), infoFont));
                    document.add(new Paragraph(" "));
                }
            }

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating attendance PDF", e);
        }

        return baos.toByteArray();
    }

    public byte[] generateMarksReport(String email, Long batchId, Long subjectId, String examType) {
        List<MarksDTO> marks;
        if (batchId != null && subjectId != null) {
            marks = marksService.getMarksByBatchAndSubject(batchId, subjectId);
        } else {
            marks = marksService.getMarks(email, subjectId, examType, null);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(55, 48, 163));
            Paragraph title = new Paragraph("Marks Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            if (marks.isEmpty()) {
                document.add(new Paragraph("No marks data found."));
            } else {
                MarksDTO first = marks.get(0);
                Font infoFont = new Font(Font.HELVETICA, 11, Font.NORMAL);
                document.add(new Paragraph("Subject: " + first.getSubjectName() + " (" + first.getSubjectCode() + ")", infoFont));
                document.add(new Paragraph("Exam: " + first.getExamName() + " | Type: " + first.getExamType(), infoFont));
                document.add(new Paragraph(" "));

                PdfPTable table = new PdfPTable(6);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{1, 2, 3, 2, 2, 2});

                addHeaderCell(table, "Rank");
                addHeaderCell(table, "Roll No.");
                addHeaderCell(table, "Student Name");
                addHeaderCell(table, "Marks");
                addHeaderCell(table, "Total");
                addHeaderCell(table, "Percentage");

                for (MarksDTO m : marks) {
                    table.addCell(createCell(String.valueOf(m.getRank())));
                    table.addCell(createCell(m.getRollNumber()));
                    table.addCell(createCell(m.getStudentName()));
                    table.addCell(createCell(String.valueOf(m.getMarksObtained())));
                    table.addCell(createCell(String.valueOf(m.getTotalMarks())));
                    PdfPCell pctCell = createCell(m.getPercentage() + "%");
                    if (m.getPercentage() < 40) {
                        pctCell.setBackgroundColor(new Color(254, 226, 226));
                    } else if (m.getPercentage() >= 80) {
                        pctCell.setBackgroundColor(new Color(220, 252, 231));
                    }
                    table.addCell(pctCell);
                }

                document.add(table);

                // Average
                double avg = marks.stream().mapToDouble(MarksDTO::getPercentage).average().orElse(0);
                document.add(new Paragraph(" "));
                document.add(new Paragraph("Class Average: " + Math.round(avg * 100.0) / 100.0 + "%",
                        new Font(Font.HELVETICA, 12, Font.BOLD)));
            }

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating marks PDF", e);
        }

        return baos.toByteArray();
    }

    private void addHeaderCell(PdfPTable table, String text) {
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setBackgroundColor(new Color(79, 70, 229));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private PdfPCell createCell(String text) {
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
        PdfPCell cell = new PdfPCell(new Phrase(text, cellFont));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }
}
