package com.gt.notification_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.rabbitmq.listener.simple.auto-startup=false")
class NotificationServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
