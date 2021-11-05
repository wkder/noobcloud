/**
 * SUNING APPLIANCE CHAINS.
 * Copyright (c) 2013-2013 All Rights Reserved.
 */
package com.cmcc.noobcloud.consumer.pojo;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 功能描述：用户权限查询记录
 *
 * @author 作者 Frank
 * @version 1.0.0
 */

public class MenuInfo implements Serializable {

    /**
     * 序列
     */
    private static final long serialVersionUID = 6334694315809421623L;

    /**
     * 菜单id
     */
    private long menu_id;
    /**
     * 菜单名称
     */
    private String name;
    /**
     * 菜单图标
     */
    private String icon;
    /**
     * 菜单级别
     */
    private int level;
    /**
     * 状态
     */
    private int status;
    /**
     * 上级菜单id
     */
    private long parent_id;
    /**
     * 菜单url
     */
    private String url;
    /**
     * 菜单编码
     */
    private String code;
    /**
     * 创建时间
     */
    private Date create_date;
    /**
     * 菜单排序
     */
    private int sort;
    private int is_category;
    /**
     * 修改时间
     */
    private Date update_date;

    /**
     * 子菜单集合
     */
    private List<MenuInfo> childMenu;

    public long getMenu_id() {
        return menu_id;
    }

    public void setMenu_id(long menu_id) {
        this.menu_id = menu_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public long getParent_id() {
        return parent_id;
    }

    public void setParent_id(long parent_id) {
        this.parent_id = parent_id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Date getCreate_date() {return null == create_date ? null : (Date) create_date.clone();}

    public void setCreate_date(Date create_date) { this.create_date = null == create_date ? null : (Date) create_date.clone();}

    public int getSort() {
        return sort;
    }

    public void setSort(int sort) {
        this.sort = sort;
    }

    public Date getUpdate_date() {
        return null == update_date ? null :(Date) update_date.clone();
    }

    public void setUpdate_date(Date update_date) {this.update_date = null == create_date ? null : (Date) update_date.clone();}

    public int getIs_category() {
        return is_category;
    }

    public void setIs_category(int is_category) {
        this.is_category = is_category;
    }

    public List<MenuInfo> getChildMenu() {
        return childMenu;
    }

    public void setChildMenu(List<MenuInfo> childMenu) {
        this.childMenu = childMenu;
    }

    public String getCode() {
        return code;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("MenuInfo{");
        sb.append("menu_id=").append(menu_id);
        sb.append(", name='").append(name).append('\'');
        sb.append(", icon='").append(icon).append('\'');
        sb.append(", level=").append(level);
        sb.append(", status=").append(status);
        sb.append(", parent_id=").append(parent_id);
        sb.append(", url='").append(url).append('\'');
        sb.append(", create_date=").append(create_date);
        sb.append(", sort=").append(sort);
        sb.append(", is_category=").append(is_category);
        sb.append(", update_date=").append(update_date);
        sb.append(", childMenu=").append(childMenu);
        sb.append(", code=").append(code);
        sb.append('}');
        return sb.toString();
    }
}
