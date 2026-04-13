package com.ta.controller;

import com.ta.dto.attendance.AttendanceMarkDTO;
import com.ta.dto.attendance.AttendanceSessionDTO;
import com.ta.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/sessions")
    public ResponseEntity<AttendanceSessionDTO> createSession(Authentication auth, @Valid @RequestBody AttendanceMarkDTO dto) {
        return ResponseEntity.ok(attendanceService.createSession(auth.getName(), dto));
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<AttendanceSessionDTO> updateSession(Authentication auth, @PathVariable Long id, @Valid @RequestBody AttendanceMarkDTO dto) {
        return ResponseEntity.ok(attendanceService.updateSession(auth.getName(), id, dto));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<AttendanceSessionDTO> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getSession(id));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<AttendanceSessionDTO>> getSessions(
            Authentication auth,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(attendanceService.getSessions(auth.getName(), batchId, subjectId, startDate, endDate));
    }
}
