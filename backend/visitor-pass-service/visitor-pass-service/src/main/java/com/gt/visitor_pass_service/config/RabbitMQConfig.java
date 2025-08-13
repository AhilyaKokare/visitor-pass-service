package com.gt.visitor_pass_service.config;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "visitor_pass_exchange";
    public static final String QUEUE_APPROVED_NAME = "pass.approved.queue";
    public static final String ROUTING_KEY_APPROVED = "pass.event.approved";
    public static final String QUEUE_REJECTED_NAME = "pass.rejected.queue";
    public static final String ROUTING_KEY_REJECTED = "pass.event.rejected";
    public static final String QUEUE_EXPIRED_NAME = "pass.expired.queue";
    public static final String ROUTING_KEY_EXPIRED = "pass.event.expired";

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean(name = "approvedQueue") // Explicitly name the bean
    public Queue approvedQueue() {
        return new Queue(QUEUE_APPROVED_NAME, true);
    }

    @Bean(name = "rejectedQueue") // Explicitly name the bean
    public Queue rejectedQueue() {
        return new Queue(QUEUE_REJECTED_NAME, true);
    }

    @Bean(name = "expiredQueue") // Explicitly name the bean
    public Queue expiredQueue() {
        return new Queue(QUEUE_EXPIRED_NAME, true);
    }

    @Bean
    public Binding approvedBinding(Queue approvedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(approvedQueue).to(exchange).with(ROUTING_KEY_APPROVED);
    }

    @Bean
    public Binding rejectedBinding(Queue rejectedQueue, TopicExchange exchange) {
        return BindingBuilder.bind(rejectedQueue).to(exchange).with(ROUTING_KEY_REJECTED);
    }

    @Bean
    public Binding expiredBinding(Queue expiredQueue, TopicExchange exchange) {
        return BindingBuilder.bind(expiredQueue).to(exchange).with(ROUTING_KEY_EXPIRED);
    }

    /**
     * Creates a message converter that serializes/deserializes objects to/from JSON.
     * This allows us to send custom DTOs (like PassApprovedEvent) as messages.
     * @return The Jackson2JsonMessageConverter bean.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}