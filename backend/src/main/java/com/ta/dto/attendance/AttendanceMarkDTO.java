package com.ta.dto.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AttendanceMarkDTO {
    @NotNull(message = "Date is required")
    private String date;

    @NotNull(message = "Hours is required")
    private Integer hours;

    private String topic;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Records are required")
    private List<StudentAttendance> records;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StudentAttendance {
        private Long studentId;
        private String status; // PRESENT or ABSENT
    }
}
