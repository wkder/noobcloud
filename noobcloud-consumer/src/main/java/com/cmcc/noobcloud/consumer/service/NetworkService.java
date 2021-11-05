package com.cmcc.noobcloud.consumer.service;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import com.cmcc.noobcloud.consumer.common.Table;
import com.cmcc.noobcloud.consumer.fallback.NetworkServiceFallbackImpl;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Map;

/**
 * 功能描述： 用户服务契约
 *
 * @author 作者 Frank
 */

@FeignClient(name = "network-service", fallback = NetworkServiceFallbackImpl.class)
public interface NetworkService {

    @RequestMapping(value = "/networkService/loginByName",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    ResultMsg loginByName(@RequestBody Map<String, Object> param);

    @RequestMapping(value = "/networkService/queryAllNetworksByPage",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    Table queryAllNetworksByPage(@RequestBody Map<String, Object> param);

    @RequestMapping(value = "/networkService/queryAllBtsCellsByPage",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    Table queryAllBtsCellsByPage(@RequestBody Map<String, Object> param);

    @RequestMapping(value = "/networkService/queryBtsCellsByCellId",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    Table queryBtsCellsByCellId(@RequestBody Map<String, Object> param);

    @RequestMapping(value = "/networkService/exportBtsCellCoverRanking",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    Table exportBtsCellCoverRanking(@RequestBody Map<String, Object> param);

}
