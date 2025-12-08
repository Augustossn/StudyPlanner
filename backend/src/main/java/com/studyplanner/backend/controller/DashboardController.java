package com.studyplanner.backend.controller;

import com.studyplanner.backend.dto.DashboardStatsDTO;
import com.studyplanner.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;

    // CONSTRUTOR MANUAL (Sem Lombok)
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @GetMapping("/stats/{userId}")
    public ResponseEntity<DashboardStatsDTO> getStats(@PathVariable Long userId) {
        DashboardStatsDTO stats = dashboardService.getStats(userId);
        return ResponseEntity.ok(stats);
    }
}