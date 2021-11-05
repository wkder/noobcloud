package com.cmcc.noobcloud.eurekab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class NoobcloudEurekaBApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoobcloudEurekaBApplication.class, args);
	}

}
