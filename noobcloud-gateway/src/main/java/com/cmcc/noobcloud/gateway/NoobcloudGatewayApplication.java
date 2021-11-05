package com.cmcc.noobcloud.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringCloudApplication
public class NoobcloudGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoobcloudGatewayApplication.class, args);
	}

}
