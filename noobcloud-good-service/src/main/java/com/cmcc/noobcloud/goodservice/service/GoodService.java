package com.cmcc.noobcloud.goodservice.service;

import com.cmcc.noobcloud.goodservice.common.ResultMsg;
import com.cmcc.noobcloud.goodservice.pojo.Good;

import java.util.List;
import java.util.Map;

public interface GoodService {

    ResultMsg findGoodsByCompanyCode(Map<String, Object> param);

}
