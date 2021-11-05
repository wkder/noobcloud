package com.cmcc.noobcloud.consumer.fallback;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import com.cmcc.noobcloud.consumer.pojo.Good;
import com.cmcc.noobcloud.consumer.service.GoodService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 功能描述： 商品服务熔断后处理
 *
 * @author 作者 Frank
 */

@Component
public class GoodServiceFallbackImpl implements GoodService {

    @Override
    public ResultMsg queryGoodsByCompany(Map<String, Object> param) {
        return ResultMsg.buildSuccessMsg("熔断机制启用，服務器繁忙");
    }

}
