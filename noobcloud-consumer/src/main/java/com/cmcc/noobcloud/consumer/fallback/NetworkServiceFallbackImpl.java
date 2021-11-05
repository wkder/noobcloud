package com.cmcc.noobcloud.consumer.fallback;

import com.cmcc.noobcloud.consumer.common.ResultMsg;
import com.cmcc.noobcloud.consumer.common.Table;
import com.cmcc.noobcloud.consumer.service.NetworkService;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 功能描述： network服务熔断后处理
 *
 * @author 作者 Frank
 */

@Component
public class NetworkServiceFallbackImpl implements NetworkService {

    @Override
    public ResultMsg loginByName(Map<String, Object> param) {
        return ResultMsg.buildSuccessMsg("熔断机制启用，登录失败，服務器繁忙");
    }

    @Override
    public Table queryAllNetworksByPage(Map<String, Object> param) {
        Table msg = new Table();
        msg.setMessage("熔断机制启用，查询网元列表失败，服務器繁忙");
        return msg;
    }

    @Override
    public Table queryAllBtsCellsByPage(Map<String, Object> param) {
        Table msg = new Table();
        msg.setMessage("熔断机制启用，查询基站小区列表失败，服務器繁忙");
        return msg;
    }

    @Override
    public Table queryBtsCellsByCellId(Map<String, Object> param) {
        Table msg = new Table();
        msg.setMessage("熔断机制启用，查询基站小区详情失败，服務器繁忙");
        return msg;
    }

    @Override
    public Table exportBtsCellCoverRanking(Map<String, Object> param) {
        Table msg = new Table();
        msg.setMessage("熔断机制启用，导出基站小区覆盖率失败，服務器繁忙");
        return msg;
    }

}
