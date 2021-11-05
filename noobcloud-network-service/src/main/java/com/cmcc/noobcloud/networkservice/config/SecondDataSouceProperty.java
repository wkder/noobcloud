package com.cmcc.noobcloud.networkservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Created by Frank on 2018/8/11.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "spring.datasource.second")
public class SecondDataSouceProperty {

    private String driverClassName;

    private String jdbcUrl;

    private String username;

    private String password;

    private int minPoolSize;

    private int maxPoolSize;

    private int maxLifetime;

    private int borrowConnectionTimeout;

    private int loginTimeout;

    private int maintenanceInterval;

    private int maxIdleTime;

}