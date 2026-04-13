package com.ta.dto.batch;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BatchDTO {
    private Long id;
    private String batchName;
    private Integer studentCount;
    private List<SubjectInfo> subjects;
    private String createdAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SubjectInfo {
        private Long id;
        private String subjectName;
        private String subjectCode;
    }
}
