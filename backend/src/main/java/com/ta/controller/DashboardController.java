package com.ta.controller;

import com.ta.dto.dashboard.DashboardStatsDTO;
import com.ta.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getStats(auth.getName()));
    }
}
