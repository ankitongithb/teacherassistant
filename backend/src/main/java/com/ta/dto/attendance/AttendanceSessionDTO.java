package com.ta.dto.attendance;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttendanceSessionDTO {
    private Long id;
    private String date;
    private Integer hours;
    private String topic;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Long batchId;
    private String batchName;
    private Integer presentCount;
    private Integer absentCount;
    private Integer totalStudents;
    private List<AttendanceRecordDTO> records;
}
