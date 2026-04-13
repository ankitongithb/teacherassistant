package com.ta.dto.attendance;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceRecordDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String status;
}
