package com.ta.dto.marks;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarksDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private String examName;
    private String examType;
    private Double marksObtained;
    private Double totalMarks;
    private Double percentage;
    private Integer rank;
}
