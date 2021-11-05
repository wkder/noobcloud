package com.cmcc.noobcloud.networkservice.mapper.firstDataSourse;

import com.cmcc.noobcloud.networkservice.pojo.MenuInfo;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

/**
 * 系统菜单数据库交互类
 */
@Mapper
public interface MenuMapper {

    /**
     * 获取菜单
     *
     * @param conditionMap conditionMap
     * @return List
     */
    List<MenuInfo> getMenuList(Map<String, Object> conditionMap);

    /**
     * 获取所有菜单
     *
     * @return List
     */
    List<MenuInfo> getAllMenuList();
    /**
     * 获取用户的所有菜单
     *
     * @param userId 用户id
     * @return List
     */
    List<MenuInfo> getTopMenuList(Long userId);
    /**
     * 获取指定父菜单下的所有子菜单
     *
     * @param conditionMap conditionMap
     * @return List
     */
    List<MenuInfo> getMenuByParentId(Map<String, Object> conditionMap);

    /**
     * 获取指定菜单
     *
     * @param menuId menuId
     * @return MenuInfo
     */
    MenuInfo queryMenuById(long menuId);

}
