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

    // construtor
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    // get para obter o dashboard do usuário já cadastrado
    @GetMapping("/stats/{userId}")
    public ResponseEntity<DashboardStatsDTO> getStats(@PathVariable Long userId) {
        // busca os dados no service e armazena no DTO
        DashboardStatsDTO stats = dashboardService.getStats(userId);
        // retorna 200 com os stats configurados
        return ResponseEntity.ok(stats);
    }
}