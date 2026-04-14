package com.ta.repository;

import com.ta.model.BatchSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchSubjectRepository extends JpaRepository<BatchSubject, Long> {
    List<BatchSubject> findByBatchId(Long batchId);
    void deleteByBatchId(Long batchId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM BatchSubject b WHERE b.subject.id = :subjectId")
    void deleteBySubjectId(@org.springframework.data.repository.query.Param("subjectId") Long subjectId);
}
