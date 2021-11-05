package com.cmcc.noobcloud.networkservice.service;

import com.cmcc.noobcloud.networkservice.common.ResultMsg;

import java.util.Map;

public interface UserService {

    ResultMsg loginByName(Map<String, Object> param);

}
