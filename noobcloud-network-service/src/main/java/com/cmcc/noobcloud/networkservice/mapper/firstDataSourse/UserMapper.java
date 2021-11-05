package com.cmcc.noobcloud.networkservice.mapper.firstDataSourse;

import com.cmcc.noobcloud.networkservice.pojo.UserInfo;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper {

    List<UserInfo> findUserByName(UserInfo userInfo);
}
