package com.ta.service;

import com.ta.dto.batch.BatchCreateDTO;
import com.ta.dto.batch.BatchDTO;
import com.ta.exception.ResourceNotFoundException;
import com.ta.model.*;
import com.ta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final BatchSubjectRepository batchSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final TeacherService teacherService;

    public List<BatchDTO> getBatches(String email) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        return batchRepository.findByTeacherIdAndIsDeletedFalse(teacher.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BatchDTO getBatch(Long id) {
        Batch batch = batchRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        return toDTO(batch);
    }

    @Transactional
    public BatchDTO createBatch(String email, BatchCreateDTO dto) {
        Teacher teacher = teacherService.getTeacherByEmail(email);

        Batch batch = Batch.builder()
                .batchName(dto.getBatchName())
                .teacher(teacher)
                .build();
        batch = batchRepository.save(batch);

        if (dto.getSubjectIds() != null && !dto.getSubjectIds().isEmpty()) {
            List<Subject> subjects = subjectRepository.findByIdInAndIsDeletedFalse(dto.getSubjectIds());
            for (Subject subject : subjects) {
                BatchSubject bs = BatchSubject.builder()
                        .batch(batch)
                        .subject(subject)
                        .build();
                batchSubjectRepository.save(bs);
            }
        }

        return toDTO(batchRepository.findByIdAndIsDeletedFalse(batch.getId()).get());
    }

    @Transactional
    public BatchDTO updateBatch(String email, Long id, BatchCreateDTO dto) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        Batch batch = batchRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        if (!batch.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Batch does not belong to this teacher");
        }

        batch.setBatchName(dto.getBatchName());
        batchRepository.save(batch);

        // Update subjects
        batchSubjectRepository.deleteByBatchId(id);
        if (dto.getSubjectIds() != null && !dto.getSubjectIds().isEmpty()) {
            List<Subject> subjects = subjectRepository.findByIdInAndIsDeletedFalse(dto.getSubjectIds());
            for (Subject subject : subjects) {
                BatchSubject bs = BatchSubject.builder()
                        .batch(batch)
                        .subject(subject)
                        .build();
                batchSubjectRepository.save(bs);
            }
        }

        return toDTO(batchRepository.findByIdAndIsDeletedFalse(id).get());
    }

    @Transactional
    public void deleteBatch(String email, Long id) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        Batch batch = batchRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        if (!batch.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Batch does not belong to this teacher");
        }
        batch.setIsDeleted(true);
        batchRepository.save(batch);
    }

    private BatchDTO toDTO(Batch batch) {
        List<BatchSubject> batchSubjects = batchSubjectRepository.findByBatchId(batch.getId());
        long studentCount = studentRepository.countByBatchIdAndIsDeletedFalse(batch.getId());

        return BatchDTO.builder()
                .id(batch.getId())
                .batchName(batch.getBatchName())
                .studentCount((int) studentCount)
                .subjects(batchSubjects.stream().map(bs -> BatchDTO.SubjectInfo.builder()
                        .id(bs.getSubject().getId())
                        .subjectName(bs.getSubject().getSubjectName())
                        .subjectCode(bs.getSubject().getSubjectCode())
                        .build()).collect(Collectors.toList()))
                .createdAt(batch.getCreatedAt() != null ? batch.getCreatedAt().toString() : null)
                .build();
    }
}
