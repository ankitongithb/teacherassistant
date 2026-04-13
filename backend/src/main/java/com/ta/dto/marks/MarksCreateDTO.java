package com.ta.dto.marks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MarksCreateDTO {
    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Exam name is required")
    private String examName;

    @NotBlank(message = "Exam type is required")
    private String examType;

    @NotNull(message = "Total marks is required")
    private Double totalMarks;

    @NotNull(message = "Student marks are required")
    private List<StudentMark> studentMarks;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class StudentMark {
        private Long studentId;
        private Double marksObtained;
    }
}
