package com.studyplanner.notification;

import java.time.LocalDateTime;

public record StudySessionCreatedEvent(Long sessionId, Long userId, String userEmail,
                                       String subjectName, Integer durationMinutes, LocalDateTime occurredAt) { }
