package com.cmcc.noobcloud.networkservice.service;

import com.cmcc.noobcloud.networkservice.pojo.MenuInfo;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 菜单管理接口
 */
@Service
public interface MenuService {

    /**
     * 根据用户id查询菜单集合
     * @param userId 用户id
     * @return 查询的菜单结果集
     */
    List<MenuInfo> getMenuList(long userId);

    /**
     * 获取所有菜单集合
     * @return 所有菜单结果集
     */
    List<MenuInfo> getAllmenuList();

    /**
     * 根据用户id递归查询菜单集合
     * @param userId 用户id
     * @return 菜单集合
     */
    List<MenuInfo> recursiveGetMenu(Long userId);

    /**
     * 根据菜单id查询菜单信息
     * @param parseLong 菜单id
     * @return 菜单详情
     */
    MenuInfo queryMenuById(long parseLong);
}


