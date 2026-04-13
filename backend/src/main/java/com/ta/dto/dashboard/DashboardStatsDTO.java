package com.ta.dto.dashboard;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsDTO {
    private Long totalBatches;
    private Long totalStudents;
    private Double overallAttendancePercentage;
    private Double averageMarks;

    private List<AttendanceTrend> attendanceTrends;
    private List<MarksDistribution> marksDistribution;
    private List<TopPerformer> topPerformers;
    private List<LowAttendanceStudent> lowAttendanceStudents;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AttendanceTrend {
        private String date;
        private Double percentage;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MarksDistribution {
        private String range;
        private Long count;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopPerformer {
        private String studentName;
        private String rollNumber;
        private String batchName;
        private Double averageMarks;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LowAttendanceStudent {
        private String studentName;
        private String rollNumber;
        private String batchName;
        private Double attendancePercentage;
    }
}
