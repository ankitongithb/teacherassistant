package com.ta.controller;

import com.ta.dto.student.StudentCreateDTO;
import com.ta.dto.student.StudentDTO;
import com.ta.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStudents(
            Authentication auth,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(studentService.getStudents(auth.getName(), batchId, search, page, size));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<StudentDTO>> getStudentsByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(studentService.getStudentsByBatch(batchId));
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(Authentication auth, @Valid @RequestBody StudentCreateDTO dto) {
        return ResponseEntity.ok(studentService.createStudent(auth.getName(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(Authentication auth, @PathVariable Long id, @Valid @RequestBody StudentCreateDTO dto) {
        return ResponseEntity.ok(studentService.updateStudent(auth.getName(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(Authentication auth, @PathVariable Long id) {
        studentService.deleteStudent(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
