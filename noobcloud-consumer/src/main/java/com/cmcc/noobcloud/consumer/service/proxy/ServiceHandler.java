package com.cmcc.noobcloud.consumer.service.proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * 暂时保留代理
 */
public class ServiceHandler implements InvocationHandler {
    private Object target;

    public ServiceHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        return method.invoke(target,args);
    }
}
