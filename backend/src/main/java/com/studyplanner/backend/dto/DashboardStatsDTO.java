package com.studyplanner.backend.dto;

public class DashboardStatsDTO {
    
    private Integer totalHours;
    private Integer weeklyHours;
    private Long completedSessions;
    private Long activeGoals;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(Integer totalHours, Integer weeklyHours, Long completedSessions, Long activeGoals) {
        this.totalHours = totalHours;
        this.weeklyHours = weeklyHours;
        this.completedSessions = completedSessions;
        this.activeGoals = activeGoals;
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
}