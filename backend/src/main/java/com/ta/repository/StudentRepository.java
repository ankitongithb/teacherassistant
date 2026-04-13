package com.ta.repository;

import com.ta.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByBatchIdAndIsDeletedFalse(Long batchId);
    Page<Student> findByBatchIdAndIsDeletedFalse(Long batchId, Pageable pageable);
    Optional<Student> findByIdAndIsDeletedFalse(Long id);
    long countByBatchIdAndIsDeletedFalse(Long batchId);

    @Query("SELECT s FROM Student s WHERE s.isDeleted = false AND s.batch.teacher.id = :teacherId")
    List<Student> findAllByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.isDeleted = false AND s.batch.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT s FROM Student s WHERE s.isDeleted = false AND s.batch.teacher.id = :teacherId " +
           "AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> searchByTeacherId(@Param("teacherId") Long teacherId, @Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.isDeleted = false AND s.batch.teacher.id = :teacherId")
    Page<Student> findAllByTeacherId(@Param("teacherId") Long teacherId, Pageable pageable);
}
