package com.cmcc.noobcloud.goodservice.controller;

import com.cmcc.noobcloud.goodservice.common.ResultMsg;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class HelloController {

    //@RequestMapping(value = "/hello",method = RequestMethod.GET)
    @GetMapping(value = "/hello")
    public ResultMsg hello(){
        log.info("Slf4j log test mark");
        return ResultMsg.buildSuccessMsg("success","hello boot");
    }
}
