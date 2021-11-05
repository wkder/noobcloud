package com.cmcc.noobcloud.goodservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.cloud.client.SpringCloudApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication(exclude= {DataSourceAutoConfiguration.class})
public class NoobcloudGoodServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NoobcloudGoodServiceApplication.class, args);
	}

}
