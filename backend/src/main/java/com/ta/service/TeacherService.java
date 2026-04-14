package com.ta.service;

import com.ta.dto.teacher.TeacherProfileDTO;
import com.ta.exception.DuplicateResourceException;
import com.ta.exception.ResourceNotFoundException;
import com.ta.model.Subject;
import com.ta.model.Teacher;
import com.ta.repository.SubjectRepository;
import com.ta.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;

    public Teacher getTeacherByEmail(String email) {
        return teacherRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }

    public TeacherProfileDTO getProfile(String email) {
        Teacher teacher = getTeacherByEmail(email);
        List<Subject> subjects = subjectRepository.findByTeacherIdAndIsDeletedFalse(teacher.getId());

        return TeacherProfileDTO.builder()
                .id(teacher.getId())
                .name(teacher.getName())
                .email(teacher.getEmail())
                .collegeName(teacher.getCollegeName())
                .department(teacher.getDepartment())
                .profileCompleted(teacher.getProfileCompleted())
                .subjects(subjects.stream().map(s -> TeacherProfileDTO.SubjectDTO.builder()
                        .id(s.getId())
                        .subjectName(s.getSubjectName())
                        .subjectCode(s.getSubjectCode())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public TeacherProfileDTO updateProfile(String email, TeacherProfileDTO dto) {
        Teacher teacher = getTeacherByEmail(email);
        teacher.setCollegeName(dto.getCollegeName());
        teacher.setDepartment(dto.getDepartment());
        teacher.setProfileCompleted(true);

        // Handle subjects
        if (dto.getSubjects() != null) {
            java.util.List<Subject> existingSubjects = subjectRepository.findByTeacherIdAndIsDeletedFalse(teacher.getId());
            java.util.List<Long> incomingSubjectIds = dto.getSubjects().stream()
                    .map(TeacherProfileDTO.SubjectDTO::getId)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());

            // Delete removed subjects
            for (Subject existing : existingSubjects) {
                if (!incomingSubjectIds.contains(existing.getId())) {
                    existing.setIsDeleted(true);
                    subjectRepository.save(existing);
                }
            }

            for (TeacherProfileDTO.SubjectDTO subjectDTO : dto.getSubjects()) {
                if (subjectDTO.getId() != null) {
                    // Update existing
                    Subject subject = subjectRepository.findById(subjectDTO.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
                    subject.setSubjectName(subjectDTO.getSubjectName());
                    subject.setSubjectCode(subjectDTO.getSubjectCode());
                    subjectRepository.save(subject);
                } else {
                    // Create new or restore deleted
                    java.util.Optional<Subject> existingOpt = subjectRepository.findBySubjectCode(subjectDTO.getSubjectCode());
                    if (existingOpt.isPresent()) {
                        Subject existing = existingOpt.get();
                        if (existing.getTeacher().getId().equals(teacher.getId())) {
                            // Restore the subject
                            existing.setSubjectName(subjectDTO.getSubjectName());
                            existing.setIsDeleted(false);
                            subjectRepository.save(existing);
                        } else {
                            throw new DuplicateResourceException("Subject code '" + subjectDTO.getSubjectCode() + "' is already used by another teacher");
                        }
                    } else {
                        Subject subject = Subject.builder()
                                .subjectName(subjectDTO.getSubjectName())
                                .subjectCode(subjectDTO.getSubjectCode())
                                .teacher(teacher)
                                .build();
                        subjectRepository.save(subject);
                    }
                }
            }
        }

        teacherRepository.save(teacher);
        return getProfile(email);
    }

    public List<TeacherProfileDTO.SubjectDTO> getSubjects(String email) {
        Teacher teacher = getTeacherByEmail(email);
        return subjectRepository.findByTeacherIdAndIsDeletedFalse(teacher.getId()).stream()
                .map(s -> TeacherProfileDTO.SubjectDTO.builder()
                        .id(s.getId())
                        .subjectName(s.getSubjectName())
                        .subjectCode(s.getSubjectCode())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public TeacherProfileDTO.SubjectDTO addSubject(String email, TeacherProfileDTO.SubjectDTO dto) {
        Teacher teacher = getTeacherByEmail(email);
        Subject subject;
        java.util.Optional<Subject> existingOpt = subjectRepository.findBySubjectCode(dto.getSubjectCode());
        if (existingOpt.isPresent()) {
            subject = existingOpt.get();
            if (subject.getTeacher().getId().equals(teacher.getId())) {
                subject.setSubjectName(dto.getSubjectName());
                subject.setIsDeleted(false);
            } else {
                throw new DuplicateResourceException("Subject code '" + dto.getSubjectCode() + "' is already used by another teacher");
            }
        } else {
            subject = Subject.builder()
                    .subjectName(dto.getSubjectName())
                    .subjectCode(dto.getSubjectCode())
                    .teacher(teacher)
                    .build();
        }
        subject = subjectRepository.save(subject);
        return TeacherProfileDTO.SubjectDTO.builder()
                .id(subject.getId())
                .subjectName(subject.getSubjectName())
                .subjectCode(subject.getSubjectCode())
                .build();
    }

    @Transactional
    public void deleteSubject(String email, Long subjectId) {
        Teacher teacher = getTeacherByEmail(email);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        if (!subject.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Subject does not belong to this teacher");
        }
        subject.setIsDeleted(true);
        subjectRepository.save(subject);
    }
}
