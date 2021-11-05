package com.cmcc.noobcloud.networkservice.controller;

import com.cmcc.noobcloud.networkservice.common.ResultMsg;
import com.cmcc.noobcloud.networkservice.service.UserService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    private UserService userService;

    /**
     * 入参公司编码，测试数据源1（本地数据源用），通用mapper
     * @param param
     * @return
     */
    @RequestMapping(value = "/loginByName",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public ResultMsg loginByName(@RequestBody Map<String,Object> param){
        logger.info("info execute loginByName method");
        logger.info("info execute loginByName method");
        return userService.loginByName(param);
    }

}
