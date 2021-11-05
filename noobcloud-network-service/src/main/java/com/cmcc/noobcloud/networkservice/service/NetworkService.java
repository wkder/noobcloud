package com.cmcc.noobcloud.networkservice.service;


import com.cmcc.noobcloud.networkservice.common.Table;

import java.util.Map;

public interface NetworkService {

    Table queryAllNetworksByPage(Map<String, Object> param);

}
