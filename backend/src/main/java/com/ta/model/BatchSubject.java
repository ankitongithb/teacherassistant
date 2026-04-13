package com.ta.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "batch_subject", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"batch_id", "subject_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BatchSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;
}
