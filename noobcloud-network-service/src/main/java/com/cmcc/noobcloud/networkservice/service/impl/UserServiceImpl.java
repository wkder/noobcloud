package com.cmcc.noobcloud.networkservice.service.impl;

import com.cmcc.noobcloud.networkservice.common.ResultMsg;
import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.UserMapper;
import com.cmcc.noobcloud.networkservice.pojo.MenuInfo;
import com.cmcc.noobcloud.networkservice.pojo.UserInfo;
import com.cmcc.noobcloud.networkservice.service.MenuService;
import com.cmcc.noobcloud.networkservice.service.UserService;
import com.cmcc.noobcloud.networkservice.utils.MapUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserMapper userMapper;

    @Autowired
    MenuService menuService;

    @Transactional
    public ResultMsg loginByName(Map<String,Object> param){
        ResultMsg resultMsg;
        try{
            UserInfo userInfo = new UserInfo();
            userInfo.setUserName(String.valueOf(param.get("userName")));
            userInfo.setPassword(String.valueOf(param.get("password")));
            List<UserInfo> userInfos = userMapper.findUserByName(userInfo);
            if(CollectionUtils.isNotEmpty(userInfos) && userInfos.size() > 1){
                resultMsg = ResultMsg.buildErrorMsg("failure","用户名无效，请联系系统管理员：63064");
            } else if(CollectionUtils.isNotEmpty(userInfos) && userInfos.size() == 1){
                UserInfo userData = userInfos.get(0);
                if(userInfo.getPassword().equals(userData.getPassword())){
                    List<MenuInfo> allMenuList = menuService.recursiveGetMenu(userData.getUserId());
                    userData.setMenuList(allMenuList);
                    resultMsg = ResultMsg.buildSuccessMsg("success", userData);
                } else {
                    resultMsg = ResultMsg.buildErrorMsg("failure","密码不正确，请再次输入");
                }
            } else {
                resultMsg = ResultMsg.buildErrorMsg("failure","用户名不存在，请联系系统管理员：63064");
            }
        }catch (Exception e){
            System.out.println(e);
            resultMsg = ResultMsg.buildErrorMsg("failure","系统异常，请稍后重试");
        }
        return resultMsg;
    }

}
