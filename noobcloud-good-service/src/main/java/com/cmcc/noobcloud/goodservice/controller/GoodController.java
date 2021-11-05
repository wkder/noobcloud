package com.cmcc.noobcloud.goodservice.controller;

import com.cmcc.noobcloud.goodservice.common.ResultMsg;
import com.cmcc.noobcloud.goodservice.pojo.Good;
import com.cmcc.noobcloud.goodservice.service.GoodService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class GoodController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    private GoodService goodService;

    /**
     * 入参公司编码，测试数据源1（本地数据源用），通用mapper
     * @param param
     * @return
     */
    @RequestMapping(value = "/queryGoodsByCompany",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public ResultMsg queryGoodsByCompany(@RequestBody Map<String,Object> param){
        logger.info("info execute queryGoodsByCompany method");
        return goodService.findGoodsByCompanyCode(param);
    }

}
