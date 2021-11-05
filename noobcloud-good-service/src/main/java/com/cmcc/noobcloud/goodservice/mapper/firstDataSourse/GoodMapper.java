package com.cmcc.noobcloud.goodservice.mapper.firstDataSourse;

import com.cmcc.noobcloud.goodservice.pojo.Good;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface GoodMapper {
    //@Select("select * from t_syt_recommend_testgoods where company_code = #{company_code}")
    List<Good> findGoodsByCompanyCode(Map<String, Object> param);

}
