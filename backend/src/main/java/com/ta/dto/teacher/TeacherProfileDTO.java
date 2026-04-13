package com.ta.dto.teacher;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeacherProfileDTO {
    private Long id;
    private String name;
    private String email;

    @NotBlank(message = "College name is required")
    private String collegeName;

    @NotBlank(message = "Department is required")
    private String department;

    private Boolean profileCompleted;
    private List<SubjectDTO> subjects;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubjectDTO {
        private Long id;
        @NotBlank(message = "Subject name is required")
        private String subjectName;
        @NotBlank(message = "Subject code is required")
        private String subjectCode;
    }
}
