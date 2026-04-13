package com.ta.service;

import com.ta.dto.dashboard.DashboardStatsDTO;
import com.ta.model.*;
import com.ta.model.enums.AttendanceStatus;
import com.ta.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final MarksRepository marksRepository;
    private final TeacherService teacherService;

    public DashboardStatsDTO getStats(String email) {
        Teacher teacher = teacherService.getTeacherByEmail(email);
        Long teacherId = teacher.getId();

        long totalBatches = batchRepository.countByTeacherIdAndIsDeletedFalse(teacherId);
        long totalStudents = studentRepository.countByTeacherId(teacherId);

        long totalRecords = recordRepository.countTotalByTeacherId(teacherId);
        long presentRecords = recordRepository.countPresentByTeacherId(teacherId);
        double attendancePct = totalRecords > 0 ? Math.round((double) presentRecords / totalRecords * 10000.0) / 100.0 : 0;

        Double avgMarks = marksRepository.findAverageMarksByTeacherId(teacherId);
        if (avgMarks == null) avgMarks = 0.0;
        avgMarks = Math.round(avgMarks * 100.0) / 100.0;

        // Attendance trends (last 30 days)
        List<AttendanceSession> recentSessions = sessionRepository.findRecentByTeacherId(teacherId, LocalDate.now().minusDays(30));
        Map<String, long[]> dailyAttendance = new LinkedHashMap<>();
        for (AttendanceSession session : recentSessions) {
            String dateStr = session.getDate().toString();
            List<AttendanceRecord> records = recordRepository.findBySessionId(session.getId());
            long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long total = records.size();
            dailyAttendance.merge(dateStr, new long[]{present, total}, (a, b) -> new long[]{a[0] + b[0], a[1] + b[1]});
        }
        List<DashboardStatsDTO.AttendanceTrend> trends = dailyAttendance.entrySet().stream()
                .map(e -> DashboardStatsDTO.AttendanceTrend.builder()
                        .date(e.getKey())
                        .percentage(e.getValue()[1] > 0 ? Math.round((double) e.getValue()[0] / e.getValue()[1] * 10000.0) / 100.0 : 0)
                        .build())
                .collect(Collectors.toList());

        // Marks distribution
        List<Marks> allMarks = marksRepository.findFiltered(teacherId, null, null, null);
        long range0_40 = allMarks.stream().filter(m -> (m.getMarksObtained() / m.getTotalMarks() * 100) < 40).count();
        long range40_60 = allMarks.stream().filter(m -> {
            double pct = m.getMarksObtained() / m.getTotalMarks() * 100;
            return pct >= 40 && pct < 60;
        }).count();
        long range60_80 = allMarks.stream().filter(m -> {
            double pct = m.getMarksObtained() / m.getTotalMarks() * 100;
            return pct >= 60 && pct < 80;
        }).count();
        long range80_100 = allMarks.stream().filter(m -> (m.getMarksObtained() / m.getTotalMarks() * 100) >= 80).count();

        List<DashboardStatsDTO.MarksDistribution> distribution = List.of(
                DashboardStatsDTO.MarksDistribution.builder().range("0-40%").count(range0_40).build(),
                DashboardStatsDTO.MarksDistribution.builder().range("40-60%").count(range40_60).build(),
                DashboardStatsDTO.MarksDistribution.builder().range("60-80%").count(range60_80).build(),
                DashboardStatsDTO.MarksDistribution.builder().range("80-100%").count(range80_100).build()
        );

        // Top performers (by average marks)
        List<Student> allStudents = studentRepository.findAllByTeacherId(teacherId);
        List<DashboardStatsDTO.TopPerformer> topPerformers = allStudents.stream()
                .map(s -> {
                    List<Marks> studentMarks = marksRepository.findByStudentIdAndIsDeletedFalse(s.getId());
                    if (studentMarks.isEmpty()) return null;
                    double avg = studentMarks.stream()
                            .mapToDouble(m -> m.getMarksObtained() / m.getTotalMarks() * 100)
                            .average().orElse(0);
                    return DashboardStatsDTO.TopPerformer.builder()
                            .studentName(s.getName())
                            .rollNumber(s.getRollNumber())
                            .batchName(s.getBatch().getBatchName())
                            .averageMarks(Math.round(avg * 100.0) / 100.0)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(DashboardStatsDTO.TopPerformer::getAverageMarks).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // Low attendance students (<75%)
        List<DashboardStatsDTO.LowAttendanceStudent> lowAttendance = allStudents.stream()
                .map(s -> {
                    long total = recordRepository.countByStudentId(s.getId());
                    if (total == 0) return null;
                    long present = recordRepository.countByStudentIdAndStatus(s.getId(), AttendanceStatus.PRESENT);
                    double pct = Math.round((double) present / total * 10000.0) / 100.0;
                    if (pct >= 75) return null;
                    return DashboardStatsDTO.LowAttendanceStudent.builder()
                            .studentName(s.getName())
                            .rollNumber(s.getRollNumber())
                            .batchName(s.getBatch().getBatchName())
                            .attendancePercentage(pct)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(DashboardStatsDTO.LowAttendanceStudent::getAttendancePercentage))
                .limit(10)
                .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
                .totalBatches(totalBatches)
                .totalStudents(totalStudents)
                .overallAttendancePercentage(attendancePct)
                .averageMarks(avgMarks)
                .attendanceTrends(trends)
                .marksDistribution(distribution)
                .topPerformers(topPerformers)
                .lowAttendanceStudents(lowAttendance)
                .build();
    }
}
