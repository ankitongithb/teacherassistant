package com.ta.repository;

import com.ta.model.AttendanceRecord;
import com.ta.model.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySessionId(Long sessionId);
    void deleteBySessionId(Long sessionId);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.student.id = :studentId AND r.status = :status")
    long countByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.student.id = :studentId")
    long countByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.session.teacher.id = :teacherId AND r.status = 'PRESENT'")
    long countPresentByTeacherId(@Param("teacherId") Long teacherId);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.session.teacher.id = :teacherId")
    long countTotalByTeacherId(@Param("teacherId") Long teacherId);
}
