package com.cmcc.noobcloud.goodservice.aspect;

import com.alibaba.fastjson.JSONObject;
import com.cmcc.noobcloud.goodservice.common.ResultMsg;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Aspect
public class TestAspect {

    /**
     * 这句话是方法切入点
     * 1 execution (* io.mykit.annotation.spring.aop.service.impl..*.*(..))
     * 2 execution ： 表示执行
     * 3 第一个*号 : 表示返回值类型， *可以是任意类型
     * 4 io.mykit.annotation.spring.aop.service.impl : 代表扫描的包
     * 5 .. : 代表其底下的子包也进行拦截
     * 6 第二个*号 : 代表对哪个类进行拦截，*代表所有类
     * 7 第三个*号 : 代表D方法  *代表任意方法
     * 8 (..) : 代表方法的参数有无都可以
     */
    //配置切入点,该方法无方法体,主要为方便同类中其他方法使用此处配置的切入点
    @Pointcut("execution (* com.cloud.provider.controller..*.*(..))")
    private void pointcut() {
        System.out.println("============进入切入点pointcut()方法==============");
    }

    //配置环绕通知,使用在方法pointcut()上注册的切入点
    //环绕通知需要有返回值ResultMsg，否则前端只能拿到空数据
    @Around("execution(* com.cloud.provider.controller..*.*(..))")
    public ResultMsg around(JoinPoint joinPoint){
        ResultMsg resultMsg = ResultMsg.buildSuccessMsg();
        try {
            resultMsg = (ResultMsg) ((ProceedingJoinPoint) joinPoint).proceed();
            System.out.println("============进入环绕通知around()==============");
            Object[] args = joinPoint.getArgs(); // 参数值
            for(Object arg : args){
                System.out.println(arg);
            }
        } catch (Throwable e) {
            System.out.println("Throwable:"+ e);
        }
        return resultMsg;
    }
    //前置通知等可以没有JoinPoint参数
    //@Before("execution(* HelloController.hello(..)")
    @Before("pointcut()")
    public void doBefore(JoinPoint jp) {
        System.out.println("==========执行前置通知doBefore()===============");
        System.out.println("前置通知ProceedingJoinPoint:" + jp);
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String method = request.getMethod();
        System.out.println(request);
        if("POST".equals(method)){
            System.out.println("POST请求参数");
            Object[] objects = jp.getArgs();
            for (Object object : objects){
                if(object instanceof LinkedHashMap) {
                    Map<String,Object> param = new LinkedHashMap<>();
                    param = (LinkedHashMap) object;
                    JSONObject json = new JSONObject(param);
                    System.out.println("切面里doBeforeJson 对象是：" + json);
                    json.put("userId",456);
                }
            }
        }
        if("GET".equals(method)){
            System.out.println("GET请求参数");
            Enumeration enumeration = request.getParameterNames();
            while (enumeration.hasMoreElements()){
                String paraName = (String) enumeration.nextElement();
                System.out.println("参数名：" + paraName + "====================" + "参数值：" + request.getParameter(paraName));
            }
        }
    }
    //配置后置通知,使用在方法pointcut()上注册的切入点
    @After("pointcut()")
    public void doAfter(JoinPoint joinPoint) {
        System.out.println("===========执行后置通知doAfter()==============");
        System.out.println("后置通知JoinPoint:" + joinPoint);
    }
    //配置后置返回通知,使用在方法pointcut()上注册的切入点
    @AfterReturning("pointcut()")
    public void afterReturn(JoinPoint joinPoint){
        System.out.println("===========执行后置返回通知==============");
        System.out.println("后置返回通知JoinPoint:" + joinPoint);
    }
    //配置抛出异常后通知,使用在方法pointcut()上注册的切入点
    @AfterThrowing(pointcut="pointcut()", throwing="ex")
    public void afterThrow(JoinPoint joinPoint, Exception ex){
        System.out.println("抛出异常后通知JoinPoint:" + joinPoint + "afterThrow "  + ex.getMessage());
    }


}
