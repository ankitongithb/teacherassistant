package com.ta.dto.attendance;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubjectAttendanceSummaryDTO {
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Integer totalHours;
    private Integer totalSessions;
    private Double classAveragePercentage;
    private List<StudentHoursSummary> students;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StudentHoursSummary {
        private Long studentId;
        private String name;
        private String rollNumber;
        private String batchName;
        private Integer attendedHours;
        private Integer totalHours;
        private Double attendancePercentage;
    }
}
