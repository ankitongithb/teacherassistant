package com.ta.repository;

import com.ta.model.Marks;
import com.ta.model.enums.ExamType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentIdAndIsDeletedFalse(Long studentId);
    List<Marks> findBySubjectIdAndIsDeletedFalse(Long subjectId);

    @Query("SELECT m FROM Marks m WHERE m.isDeleted = false " +
           "AND m.subject.teacher.id = :teacherId " +
           "AND (:subjectId IS NULL OR m.subject.id = :subjectId) " +
           "AND (:examType IS NULL OR m.examType = :examType) " +
           "AND (:examName IS NULL OR m.examName = :examName) " +
           "ORDER BY m.marksObtained DESC")
    List<Marks> findFiltered(@Param("teacherId") Long teacherId,
                             @Param("subjectId") Long subjectId,
                             @Param("examType") ExamType examType,
                             @Param("examName") String examName);

    @Query("SELECT AVG(m.marksObtained / m.totalMarks * 100) FROM Marks m WHERE m.isDeleted = false AND m.subject.teacher.id = :teacherId")
    Double findAverageMarksByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT m FROM Marks m WHERE m.isDeleted = false AND m.student.batch.id = :batchId AND m.subject.id = :subjectId ORDER BY m.marksObtained DESC")
    List<Marks> findByBatchAndSubject(@Param("batchId") Long batchId, @Param("subjectId") Long subjectId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Marks m WHERE m.subject.id = :subjectId")
    void deleteBySubjectId(@Param("subjectId") Long subjectId);
}
