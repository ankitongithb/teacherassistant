package com.ta.repository;

import com.ta.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByTeacherIdAndIsDeletedFalse(Long teacherId);
    Optional<Batch> findByIdAndIsDeletedFalse(Long id);
    long countByTeacherIdAndIsDeletedFalse(Long teacherId);
}
