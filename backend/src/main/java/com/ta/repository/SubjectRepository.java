package com.ta.repository;

import com.ta.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByTeacherIdAndIsDeletedFalse(Long teacherId);
    Optional<Subject> findBySubjectCodeAndIsDeletedFalse(String subjectCode);
    boolean existsBySubjectCode(String subjectCode);
    List<Subject> findByIdInAndIsDeletedFalse(List<Long> ids);
}
