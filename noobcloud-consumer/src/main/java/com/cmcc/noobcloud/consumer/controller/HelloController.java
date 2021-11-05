package com.cmcc.noobcloud.consumer.controller;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * 功能描述： 测试
 *
 * @author 作者 Frank
 */

@Slf4j
@RestController
public class HelloController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @RequestMapping(value = "/hello",method = RequestMethod.GET)
    public ResultMsg hello(){
        logger.info("Slf4j log test mark");
        return ResultMsg.buildSuccessMsg("success","hello boot");
    }
}
