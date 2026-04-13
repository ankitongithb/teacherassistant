package com.ta.dto.batch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class BatchCreateDTO {
    @NotBlank(message = "Batch name is required")
    private String batchName;

    @NotNull(message = "Subject IDs are required")
    private List<Long> subjectIds;
}
