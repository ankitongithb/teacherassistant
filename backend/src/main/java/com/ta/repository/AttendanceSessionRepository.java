package com.ta.repository;

import com.ta.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByBatchIdAndSubjectIdOrderByDateDesc(Long batchId, Long subjectId);
    List<AttendanceSession> findBySubjectIdOrderByDateDesc(Long subjectId);
    List<AttendanceSession> findByBatchIdOrderByDateDesc(Long batchId);
    List<AttendanceSession> findByTeacherIdOrderByDateDesc(Long teacherId);

    @Query("SELECT a FROM AttendanceSession a WHERE a.teacher.id = :teacherId " +
           "AND (:batchId IS NULL OR a.batch.id = :batchId) " +
           "AND (:subjectId IS NULL OR a.subject.id = :subjectId) " +
           "AND (:startDate IS NULL OR a.date >= :startDate) " +
           "AND (:endDate IS NULL OR a.date <= :endDate) " +
           "ORDER BY a.date DESC")
    List<AttendanceSession> findFiltered(@Param("teacherId") Long teacherId,
                                         @Param("batchId") Long batchId,
                                         @Param("subjectId") Long subjectId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM AttendanceSession a WHERE a.teacher.id = :teacherId AND a.date >= :since ORDER BY a.date ASC")
    List<AttendanceSession> findRecentByTeacherId(@Param("teacherId") Long teacherId, @Param("since") LocalDate since);
}
