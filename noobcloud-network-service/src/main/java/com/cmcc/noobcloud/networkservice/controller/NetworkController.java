package com.cmcc.noobcloud.networkservice.controller;

import com.cmcc.noobcloud.networkservice.common.Table;
import com.cmcc.noobcloud.networkservice.service.NetworkService;
import com.cmcc.noobcloud.networkservice.utils.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
public class NetworkController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    private NetworkService networkService;

    @RequestMapping(value = "/queryAllNetworksByPage",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table queryAllNetworksByPage(@RequestBody Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "queryAllNetworksByPage");
        return networkService.queryAllNetworksByPage(paras);
    }
}
