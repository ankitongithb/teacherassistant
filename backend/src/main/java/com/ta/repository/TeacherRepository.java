package com.ta.repository;

import com.ta.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmailAndIsDeletedFalse(String email);
    boolean existsByEmail(String email);
}
