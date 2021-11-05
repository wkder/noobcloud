package com.cmcc.noobcloud.networkservice.service.impl;

import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.MenuMapper;
import com.cmcc.noobcloud.networkservice.pojo.MenuInfo;
import com.cmcc.noobcloud.networkservice.service.MenuService;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 菜单管理接口实现层
 */
@Service
public class MenuServiceImpl implements MenuService {

    @Autowired
    private MenuMapper menuMapper;

    /**
     * 根据用户id查询菜单集合
     * @param userId 用户工号
     * @return 该用户的菜单集合
     */
    @Override
    public List<MenuInfo> getMenuList(long userId) {
        Map<String, Object> condition = new HashMap<>();
        condition.put("userId", userId);
        //获取列表
        return menuMapper.getMenuList(condition);
    }

    /**
     * 查询所有菜单集合
     * @return 所有菜单
     */
    @Override
    public List<MenuInfo> getAllmenuList() {
        return menuMapper.getAllMenuList();
    }

    /**
     * 递归查询用户拥有的菜单权限
     * @param userId 用户id
     * @return 查询用户的菜单集合
     */
    @Override
    public List<MenuInfo> recursiveGetMenu(Long userId) {
        List<MenuInfo> topMenuList = menuMapper.getTopMenuList(userId);
        if(CollectionUtils.isNotEmpty(topMenuList)) {
            for (MenuInfo menuInfo : topMenuList) {
                List<MenuInfo> childMenuList = recursiveGetMenu(menuInfo,userId);
                menuInfo.setChildMenu(childMenuList);
            }
        }
        return topMenuList;
    }

    /**
     * 根据菜单id查询菜单信息
     * @param menuId 菜单id
     * @return 菜单详情
     */
    @Override
    public MenuInfo queryMenuById(long menuId) {
         return menuMapper.queryMenuById(menuId);
    }

    /**
     * 递归查询菜单集合
     * @param menuInfo 查询传参
     * @param userId 用户id
     * @return 菜单集合
     */
    private List<MenuInfo> recursiveGetMenu(MenuInfo menuInfo,Long userId) {
        Map<String, Object> conditionMap = new HashMap<>();
        conditionMap.put("parentId", menuInfo.getMenu_id());
        conditionMap.put("userId", userId);
        List<MenuInfo> childMenuList = menuMapper.getMenuByParentId(conditionMap);
        if (CollectionUtils.isNotEmpty(childMenuList)) {
            for (MenuInfo childMenu : childMenuList) {
                childMenu.setChildMenu(recursiveGetMenu(childMenu,userId));
            }
        }
        return childMenuList;
    }

}
