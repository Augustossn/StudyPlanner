package com.studyplanner.backend.event;

import com.studyplanner.backend.model.StudySession;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@ConditionalOnProperty(name = "app.messaging.enabled", havingValue = "true")
public class StudySessionEventPublisher {
    public static final String EXCHANGE = "study.events";
    public static final String ROUTING_KEY = "study.session.created";

    private final RabbitTemplate rabbitTemplate;

    public StudySessionEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishSessionCreated(StudySession session) {
        String subjectName = session.getSubject() == null ? "Estudo" : session.getSubject().getName();
        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, new StudySessionCreatedEvent(
                session.getId(), session.getUser().getId(), session.getUser().getEmail(),
                subjectName, session.getDurationMinutes(), LocalDateTime.now()));
    }
}
