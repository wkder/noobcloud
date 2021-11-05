package com.cmcc.noobcloud.eurekaa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class NoobcloudEurekaAApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoobcloudEurekaAApplication.class, args);
	}

}
