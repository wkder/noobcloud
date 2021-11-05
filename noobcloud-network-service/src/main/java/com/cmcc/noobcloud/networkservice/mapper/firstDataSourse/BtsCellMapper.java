package com.cmcc.noobcloud.networkservice.mapper.firstDataSourse;

import com.cmcc.noobcloud.networkservice.pojo.BtsCell;
import com.cmcc.noobcloud.networkservice.pojo.Network;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface BtsCellMapper {

    List<BtsCell> queryAllBtsCellsByPage(Map<String, Object> param);

    Integer countAllBtsCells(Map<String, Object> param);

    List<BtsCell> queryBtsCellsByCellId(Map<String, Object> param);

    List<BtsCell> query5GBtsCellsByLonAndLatRange(Map<String, Object> param);

    Integer batchUpdateBtsCell(@Param("list") List<BtsCell> btsCellList);

    List<Map<String, Object>> queryAllBtsCells(Map<String, Object> param);

}
