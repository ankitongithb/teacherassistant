package com.ta.controller;

import com.ta.dto.teacher.TeacherProfileDTO;
import com.ta.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping("/profile")
    public ResponseEntity<TeacherProfileDTO> getProfile(Authentication auth) {
        return ResponseEntity.ok(teacherService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<TeacherProfileDTO> updateProfile(Authentication auth, @Valid @RequestBody TeacherProfileDTO dto) {
        return ResponseEntity.ok(teacherService.updateProfile(auth.getName(), dto));
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<TeacherProfileDTO.SubjectDTO>> getSubjects(Authentication auth) {
        return ResponseEntity.ok(teacherService.getSubjects(auth.getName()));
    }

    @PostMapping("/subjects")
    public ResponseEntity<TeacherProfileDTO.SubjectDTO> addSubject(Authentication auth, @Valid @RequestBody TeacherProfileDTO.SubjectDTO dto) {
        return ResponseEntity.ok(teacherService.addSubject(auth.getName(), dto));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<Void> deleteSubject(Authentication auth, @PathVariable Long id) {
        teacherService.deleteSubject(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
