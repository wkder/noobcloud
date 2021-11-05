package com.cmcc.noobcloud.goodservice.config;

import com.cmcc.noobcloud.goodservice.inteceptor.TestInteceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 拦截器配置类
 * 首先使用@Autowired将新建拦截器注入进来
 * 再在registry.addInterceptor中进行注册
 * Created by Frank on 2018/8/13.
 */
//@Configuration
//@ComponentScan("com.cmcc.noobcloud.goodservice.inteceptor")
public class InteceptorConfig implements WebMvcConfigurer {

    @Autowired
    private TestInteceptor testInteceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(testInteceptor).addPathPatterns("/**");
    }

    /*@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String[] excludes = {"/static/**"};
        registry.addResourceHandler(excludes);
    }*/
}
