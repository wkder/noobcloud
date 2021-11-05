package com.cmcc.noobcloud.consumer.controller;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import com.cmcc.noobcloud.consumer.pojo.Good;
import com.cmcc.noobcloud.consumer.service.GoodService;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 功能描述： 商品
 *
 * @author 作者 Frank
 */
@Slf4j
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
        logger.warn("warn execute queryGoodsByCompany method");
        logger.error("error execute queryGoodsByCompany method");
        ResultMsg resultMsg = null;
        try {
            resultMsg = goodService.queryGoodsByCompany(param);
        } catch (Exception e) {
            System.out.println(e);
        }
        return resultMsg;
    }


}
