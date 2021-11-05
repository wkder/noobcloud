package com.cmcc.noobcloud.consumer.interceptor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Created by Frank on 2018/8/13.
 */
@Component
public class SessionInterceptor implements HandlerInterceptor {

    private static final List<String> whiteList = Arrays.asList(
            "/consumer/getVerifyCode",
            "/consumer/index.html",
            "/consumer/loginByName.html",
            "/consumer/queryMainInfo.html"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String uri = request.getRequestURI();
        if(whiteList.contains(uri)){
            return true;
        }
        request.getSession().setMaxInactiveInterval(3600);
        //支持跨域请求，支持cookie跨域
        response.setHeader("Access-Control-Allow-Origin",request.getHeader("Origin"));//支持跨域请求
        response.setHeader("Access-Control-Allow-Methods", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");//是否支持cookie跨域
        response.setHeader("Access-Control-Allow-Headers", "Authorization,Origin, X-Requested-With, Content-Type, Accept,Access-Token");//Origin, X-Requested-With, Content-Type, Accept,Access-Token
        if(request.getSession().getAttribute("UserInfo") == null) {
            response.sendRedirect(
                    request.getContextPath() + "/index.html");
            return false;
        } else {
            return true;
        }

    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}
