package com.ta.service;

import com.ta.dto.marks.MarksCreateDTO;
import com.ta.dto.marks.MarksDTO;
import com.ta.exception.ResourceNotFoundException;
import com.ta.model.*;
import com.ta.model.enums.ExamType;
import com.ta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarksService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherService teacherService;

    @Transactional
    public List<MarksDTO> createMarks(String email, MarksCreateDTO dto) {
        teacherService.getTeacherByEmail(email);
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        List<Marks> marksList = new ArrayList<>();
        for (MarksCreateDTO.StudentMark sm : dto.getStudentMarks()) {
            Student student = studentRepository.findByIdAndIsDeletedFalse(sm.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + sm.getStudentId()));

            Marks marks = Marks.builder()
                    .student(student)
                    .subject(subject)
                    .examName(dto.getExamName())
                    .examType(ExamType.valueOf(dto.getExamType()))
                    .marksObtained(sm.getMarksObtained())
                    .totalMarks(dto.getTotalMarks())
                    .build();
            marksList.add(marksRepository.save(marks));
        }

        return marksList.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public MarksDTO updateMarks(String email, Long id, Double marksObtained) {
        teacherService.getTeacherByEmail(email);
        Marks marks = marksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marks not found"));
        marks.setMarksObtained(marksObtained);
        marks = marksRepository.save(marks);
        return toDTO(marks);
    }

    @Transactional
    public void deleteMarks(String email, Long id) {
        teacherService.getTeacherByEmail(email);
        Marks marks = marksRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marks not found"));
        marks.setIsDeleted(true);
        marksRepository.save(marks);
    }

    public List<MarksDTO> getMarks(String email, Long subjectId, String examType, String examName) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        ExamType type = examType != null ? ExamType.valueOf(examType) : null;
        String name = (examName != null && !examName.trim().isEmpty()) ? examName : null;

        List<Marks> marks = marksRepository.findFiltered(teacher.getId(), subjectId, type, name);

        return computeRankAndSortByName(marks);
    }

    public List<MarksDTO> getMarksByBatchAndSubject(Long batchId, Long subjectId) {
        List<Marks> marks = marksRepository.findByBatchAndSubject(batchId, subjectId);
        return computeRankAndSortByName(marks);
    }

    private List<MarksDTO> computeRankAndSortByName(List<Marks> marks) {
        // First convert to DTO and sort by marks to assign rank
        List<MarksDTO> dtos = marks.stream()
                .map(this::toDTO)
                .sorted(Comparator.comparingDouble(MarksDTO::getPercentage).reversed())
                .collect(Collectors.toList());

        int currentRank = 1;
        for (MarksDTO dto : dtos) {
            dto.setRank(currentRank++);
        }

        // Return sorted alphabetically by student name instead of by marks
        return dtos.stream()
                .sorted(Comparator.comparing(MarksDTO::getStudentName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private MarksDTO toDTO(Marks marks) {
        double percentage = marks.getTotalMarks() > 0 ?
                Math.round(marks.getMarksObtained() / marks.getTotalMarks() * 10000.0) / 100.0 : 0;

        return MarksDTO.builder()
                .id(marks.getId())
                .studentId(marks.getStudent().getId())
                .studentName(marks.getStudent().getName())
                .rollNumber(marks.getStudent().getRollNumber())
                .subjectId(marks.getSubject().getId())
                .subjectName(marks.getSubject().getSubjectName())
                .subjectCode(marks.getSubject().getSubjectCode())
                .examName(marks.getExamName())
                .examType(marks.getExamType().name())
                .marksObtained(marks.getMarksObtained())
                .totalMarks(marks.getTotalMarks())
                .percentage(percentage)
                .build();
    }
}
