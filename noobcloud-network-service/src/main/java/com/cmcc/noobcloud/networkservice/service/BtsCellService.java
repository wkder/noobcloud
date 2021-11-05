package com.cmcc.noobcloud.networkservice.service;


import com.cmcc.noobcloud.networkservice.common.Table;

import java.util.Map;

public interface BtsCellService {

    Table queryAllBtsCellsByPage(Map<String, Object> param);

    Table queryBtsCellsByCellId(Map<String, Object> param);

    Table exportBtsCellCoverRanking(Map<String, Object> param);

}
