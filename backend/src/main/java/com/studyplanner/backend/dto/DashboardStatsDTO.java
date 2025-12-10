package com.studyplanner.backend.dto;

import java.util.List;

public class DashboardStatsDTO {
    
    private Integer totalHours;
    private Integer weeklyHours;
    private Long completedSessions;
    private Long activeGoals;
    private List<ChartDataDTO> chartData;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(Integer totalHours, Integer weeklyHours, Long completedSessions, Long activeGoals, List<ChartDataDTO> chartData) {
        this.totalHours = totalHours;
        this.weeklyHours = weeklyHours;
        this.completedSessions = completedSessions;
        this.activeGoals = activeGoals;
        this.chartData = chartData; 
    }
    public Integer getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(Integer totalHours) {
        this.totalHours = totalHours;
    }

    public Integer getWeeklyHours() {
        return weeklyHours;
    }

    public void setWeeklyHours(Integer weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    public Long getCompletedSessions() {
        return completedSessions;
    }

    public void setCompletedSessions(Long completedSessions) {
        this.completedSessions = completedSessions;
    }

    public Long getActiveGoals() {
        return activeGoals;
    }

    public void setActiveGoals(Long activeGoals) {
        this.activeGoals = activeGoals;
    }

    public List<ChartDataDTO> getChartData() {
        return chartData;
    }

    public void setChartData(List<ChartDataDTO> chartData) {
        this.chartData = chartData;
    }

    public static class ChartDataDTO {
    private String day;
    private Double hours;

    public ChartDataDTO(String day, Double hours) {
        this.day = day;
        this.hours = hours;
    }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }
    public Double getHours() { return hours; }
    public void setHours(Double hours) { this.hours = hours; }

    }
}
