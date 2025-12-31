package com.studyplanner.backend.controller;

import com.studyplanner.backend.dto.DashboardStatsDTO;
import com.studyplanner.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse; // Não esqueça deste import
import io.swagger.v3.oas.annotations.responses.ApiResponses; // E deste
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    @Operation(summary = "Obter estatísticas do dashboard", description = "Retorna os dados consolidados (total de horas, sessões, metas ativas) para o usuário especificado pelo ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso"),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @GetMapping("/stats/{userId}")
    public ResponseEntity<DashboardStatsDTO> getStats(@PathVariable Long userId) {
        DashboardStatsDTO stats = dashboardService.getStats(userId);
        return ResponseEntity.ok(stats);
    }
}