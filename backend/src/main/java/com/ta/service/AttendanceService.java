package com.ta.service;

import com.ta.dto.attendance.AttendanceMarkDTO;
import com.ta.dto.attendance.AttendanceRecordDTO;
import com.ta.dto.attendance.AttendanceSessionDTO;
import com.ta.exception.ResourceNotFoundException;
import com.ta.model.*;
import com.ta.model.enums.AttendanceStatus;
import com.ta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final BatchRepository batchRepository;
    private final TeacherService teacherService;

    @Transactional
    public AttendanceSessionDTO createSession(String email, AttendanceMarkDTO dto) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Batch batch = batchRepository.findByIdAndIsDeletedFalse(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        AttendanceSession session = AttendanceSession.builder()
                .date(LocalDate.parse(dto.getDate()))
                .hours(dto.getHours())
                .topic(dto.getTopic())
                .subject(subject)
                .batch(batch)
                .teacher(teacher)
                .build();
        session = sessionRepository.save(session);

        for (AttendanceMarkDTO.StudentAttendance sa : dto.getRecords()) {
            Student student = studentRepository.findByIdAndIsDeletedFalse(sa.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + sa.getStudentId()));
            AttendanceRecord record = AttendanceRecord.builder()
                    .session(session)
                    .student(student)
                    .status(AttendanceStatus.valueOf(sa.getStatus()))
                    .build();
            recordRepository.save(record);
        }

        return getSession(session.getId());
    }

    @Transactional
    public AttendanceSessionDTO updateSession(String email, Long sessionId, AttendanceMarkDTO dto) {
        teacherService.getTeacherByEmail(email);
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        session.setDate(LocalDate.parse(dto.getDate()));
        session.setHours(dto.getHours());
        session.setTopic(dto.getTopic());
        sessionRepository.save(session);

        // Update records
        recordRepository.deleteBySessionId(sessionId);
        for (AttendanceMarkDTO.StudentAttendance sa : dto.getRecords()) {
            Student student = studentRepository.findByIdAndIsDeletedFalse(sa.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            AttendanceRecord record = AttendanceRecord.builder()
                    .session(session)
                    .student(student)
                    .status(AttendanceStatus.valueOf(sa.getStatus()))
                    .build();
            recordRepository.save(record);
        }

        return getSession(sessionId);
    }

    public AttendanceSessionDTO getSession(Long id) {
        AttendanceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
        return toDTO(session);
    }

    public List<AttendanceSessionDTO> getSessions(String email, Long batchId, Long subjectId, String startDate, String endDate) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;

        return sessionRepository.findFiltered(teacher.getId(), batchId, subjectId, start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AttendanceSessionDTO toDTO(AttendanceSession session) {
        List<AttendanceRecord> records = recordRepository.findBySessionId(session.getId());
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();

        return AttendanceSessionDTO.builder()
                .id(session.getId())
                .date(session.getDate().toString())
                .hours(session.getHours())
                .topic(session.getTopic())
                .subjectId(session.getSubject().getId())
                .subjectName(session.getSubject().getSubjectName())
                .subjectCode(session.getSubject().getSubjectCode())
                .batchId(session.getBatch().getId())
                .batchName(session.getBatch().getBatchName())
                .presentCount((int) presentCount)
                .absentCount(records.size() - (int) presentCount)
                .totalStudents(records.size())
                .records(records.stream().map(r -> AttendanceRecordDTO.builder()
                        .id(r.getId())
                        .studentId(r.getStudent().getId())
                        .studentName(r.getStudent().getName())
                        .rollNumber(r.getStudent().getRollNumber())
                        .status(r.getStatus().name())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
