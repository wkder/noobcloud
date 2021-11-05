package com.cmcc.noobcloud.goodservice.service.impl;

import com.cmcc.noobcloud.goodservice.common.ResultMsg;
import com.cmcc.noobcloud.goodservice.mapper.firstDataSourse.GoodMapper;
import com.cmcc.noobcloud.goodservice.pojo.Good;
import com.cmcc.noobcloud.goodservice.service.GoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GoodServiceImpl implements GoodService {

    @Autowired
    GoodMapper goodMapper;

    @Transactional
    public ResultMsg findGoodsByCompanyCode(Map<String,Object> param){
        List<Good> goods = new ArrayList<>();
        try{
            goods = goodMapper.findGoodsByCompanyCode(param);
            goods.forEach(good -> {
                good.setGOODS_CODE("0000000000000000");
            });
        }catch (Exception e){
            e.printStackTrace();
            System.out.println(e);
            //TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
        return ResultMsg.buildSuccessMsg(goods);
    }

}
