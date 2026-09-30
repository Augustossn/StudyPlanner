package com.studyplanner.notification;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Boundary for email, push, or WhatsApp providers; logging is a safe local default. */
@Component
class StudySessionNotificationListener {
    private static final Logger log = LoggerFactory.getLogger(StudySessionNotificationListener.class);

    @RabbitListener(queues = MessagingConfig.QUEUE)
    void onStudySessionCreated(StudySessionCreatedEvent event) {
        log.info("Study session {} processed for user {}: {} minutes of {}",
                event.sessionId(), event.userId(), event.durationMinutes(), event.subjectName());
    }
}
