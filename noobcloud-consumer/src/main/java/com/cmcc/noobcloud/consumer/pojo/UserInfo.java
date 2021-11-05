package com.cmcc.noobcloud.consumer.pojo;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 用户对象
 */
@Getter
@Setter
@ToString
public class UserInfo implements Serializable {

    private static final long serialVersionUID = 6849386438593922879L;
    /**
     * 用户id
     */
    private long userId;
    /**
     * 用户名称
     */
    private String userName;
    /**
     * 用户名称
     */
    private String password;
    /**
     * 用户类型 0：管理员
     */
    private int type;
    /**
     * 号码
     */
    private String status;
    /**
     * 号码
     */
    private String telephone;
    /**
     * 邮编
     */
    private String zipCode;
    /**
     * 地址
     */
    private String address;
    /**
     * 邮箱
     */
    private String mail;
    /**
     * 是否重复密码
     */
    private int isrepeatPassword;
    /**
     * 创建时间
     */
    private Date createDate;
    /**
     * 修改时间
     */
    private Date updateDate;
    /**
     * 修改时间
     */
    private int inWhiteList;
    /**
     * 修改时间
     */
    private int identityType;
    /**
     * 用户菜单权限集合
     */
    private List<MenuInfo> menuList;
    /**
     * 权限编码
     */
    private Map<String,String> authorityCodeMap;

}
