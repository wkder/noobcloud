package com.cmcc.noobcloud.consumer.service;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import com.cmcc.noobcloud.consumer.fallback.GoodServiceFallbackImpl;
import com.cmcc.noobcloud.consumer.pojo.Good;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;

/**
 * 功能描述： 商品服务契约
 *
 * @author 作者 Frank
 */

@FeignClient(name = "good-service", fallback = GoodServiceFallbackImpl.class)
public interface GoodService {

    @RequestMapping(value = "/goodService/queryGoodsByCompany",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    ResultMsg queryGoodsByCompany(@RequestBody Map<String, Object> param);

}
