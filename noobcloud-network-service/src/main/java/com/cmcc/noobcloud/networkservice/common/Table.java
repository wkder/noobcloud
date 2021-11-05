package com.cmcc.noobcloud.networkservice.common;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by hale on 2016/12/6.
 */
@Data
public class Table<T>
{
    /**
     * 查询结果列表数据
     */
    public List<T> data;

    /**
     * 查询结果说明
     */
    public String message;

    /**
     * 查询结果数据综合
     */
    public Integer total;

    public Integer recordsTotal;

    public Integer recordsFiltered;

    public Table()
    {
        this.data = new ArrayList<T>();
        this.total = 0;
        this.recordsTotal = 0;
        this.recordsFiltered = 0;
    }

    public Table(List<T> data, Integer total)
    {
        this.data = data;
        this.total = total;
        this.recordsTotal = total;
        this.recordsFiltered = total;
    }
}
