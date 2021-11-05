package com.cmcc.noobcloud.consumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringCloudApplication
public class NoobcloudConsumerApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoobcloudConsumerApplication.class, args);
	}

}
