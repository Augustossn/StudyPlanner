package com.studyplanner.backend.event;

import java.time.LocalDateTime;

/** Event contract shared through RabbitMQ. It contains no password or token data. */
public record StudySessionCreatedEvent(
        Long sessionId,
        Long userId,
        String userEmail,
        String subjectName,
        Integer durationMinutes,
        LocalDateTime occurredAt) { }
