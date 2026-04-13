package com.ta.service;

import com.ta.dto.student.StudentCreateDTO;
import com.ta.dto.student.StudentDTO;
import com.ta.exception.ResourceNotFoundException;
import com.ta.model.*;
import com.ta.model.enums.AttendanceStatus;
import com.ta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final TeacherService teacherService;

    public Map<String, Object> getStudents(String email, Long batchId, String search, int page, int size) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<Student> studentPage;
        if (batchId != null) {
            studentPage = studentRepository.findByBatchIdAndIsDeletedFalse(batchId, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            studentPage = studentRepository.searchByTeacherId(teacher.getId(), search.trim(), pageable);
        } else {
            studentPage = studentRepository.findAllByTeacherId(teacher.getId(), pageable);
        }

        List<StudentDTO> students = studentPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("students", students);
        response.put("currentPage", studentPage.getNumber());
        response.put("totalItems", studentPage.getTotalElements());
        response.put("totalPages", studentPage.getTotalPages());

        return response;
    }

    public List<StudentDTO> getStudentsByBatch(Long batchId) {
        return studentRepository.findByBatchIdAndIsDeletedFalse(batchId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentDTO createStudent(String email, StudentCreateDTO dto) {
        teacherService.getTeacherByEmail(email);
        Batch batch = batchRepository.findByIdAndIsDeletedFalse(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        Student student = Student.builder()
                .name(dto.getName())
                .rollNumber(dto.getRollNumber())
                .email(dto.getEmail())
                .batch(batch)
                .build();
        student = studentRepository.save(student);
        return toDTO(student);
    }

    @Transactional
    public StudentDTO updateStudent(String email, Long id, StudentCreateDTO dto) {
        teacherService.getTeacherByEmail(email);
        Student student = studentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        student.setName(dto.getName());
        student.setRollNumber(dto.getRollNumber());
        student.setEmail(dto.getEmail());

        if (dto.getBatchId() != null && !dto.getBatchId().equals(student.getBatch().getId())) {
            Batch batch = batchRepository.findByIdAndIsDeletedFalse(dto.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
            student.setBatch(batch);
        }

        student = studentRepository.save(student);
        return toDTO(student);
    }

    @Transactional
    public void deleteStudent(String email, Long id) {
        teacherService.getTeacherByEmail(email);
        Student student = studentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setIsDeleted(true);
        studentRepository.save(student);
    }

    private StudentDTO toDTO(Student student) {
        long total = attendanceRecordRepository.countByStudentId(student.getId());
        long present = attendanceRecordRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        Double attendancePct = total > 0 ? Math.round((double) present / total * 10000.0) / 100.0 : null;

        return StudentDTO.builder()
                .id(student.getId())
                .name(student.getName())
                .rollNumber(student.getRollNumber())
                .email(student.getEmail())
                .batchId(student.getBatch().getId())
                .batchName(student.getBatch().getBatchName())
                .attendancePercentage(attendancePct)
                .build();
    }
}
