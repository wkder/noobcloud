package com.cmcc.noobcloud.consumer.config;

import com.cmcc.noobcloud.consumer.interceptor.SessionInterceptor;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.annotation.Resource;

/**
 * Created by Frank on 2018/8/13.
 */
@Configuration
@ComponentScan(basePackages = "com.cmcc.noobcloud.consumer.interceptor")
public class InteceptorConfig implements WebMvcConfigurer {

    @Resource
    private SessionInterceptor sessionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //registry.addInterceptor(sessionInterceptor).addPathPatterns("/**");
    }
}
