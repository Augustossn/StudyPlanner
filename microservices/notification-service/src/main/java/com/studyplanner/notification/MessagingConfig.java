package com.studyplanner.notification;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class MessagingConfig {
    static final String EXCHANGE = "study.events";
    static final String QUEUE = "notification.study-session-created";
    static final String ROUTING_KEY = "study.session.created";

    @Bean DirectExchange studyEventsExchange() { return new DirectExchange(EXCHANGE, true, false); }
    @Bean Queue notificationQueue() { return new Queue(QUEUE, true); }
    @Bean Binding studySessionCreatedBinding(Queue notificationQueue, DirectExchange studyEventsExchange) {
        return BindingBuilder.bind(notificationQueue).to(studyEventsExchange).with(ROUTING_KEY);
    }
    @Bean Jackson2JsonMessageConverter messageConverter() { return new Jackson2JsonMessageConverter(); }
}
