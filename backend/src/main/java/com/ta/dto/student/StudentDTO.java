package com.ta.dto.student;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentDTO {
    private Long id;
    private String name;
    private String rollNumber;
    private String email;
    private Long batchId;
    private String batchName;
    private Double attendancePercentage;
}
