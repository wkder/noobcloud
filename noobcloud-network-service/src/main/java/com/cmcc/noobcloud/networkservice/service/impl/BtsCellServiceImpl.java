package com.cmcc.noobcloud.networkservice.service.impl;

import com.cmcc.noobcloud.networkservice.common.Table;
import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.BtsCellMapper;
import com.cmcc.noobcloud.networkservice.pojo.BtsCell;
import com.cmcc.noobcloud.networkservice.service.BtsCellService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BtsCellServiceImpl implements BtsCellService{

    private final Logger logger = LogManager.getLogger(this.getClass());

    //地图展现搜索范围
    private Double lonMark = 0.009;
    private Double latMark = 0.009;

    @Autowired
    BtsCellMapper btsCellMapper;

    @Override
    public Table queryAllBtsCellsByPage(Map<String, Object> param) {
        try {
            Integer counts = btsCellMapper.countAllBtsCells(param);
            List<BtsCell> btsCellList = btsCellMapper.queryAllBtsCellsByPage(param);
            btsCellList.forEach(btsCell -> {
                if("1".equals(btsCell.getType())){
                    btsCell.setType("宏站");
                } else if("2".equals(btsCell.getType())){
                    btsCell.setType("室分");
                } else {
                    btsCell.setType("其他");
                }
            });
            return new Table(btsCellList, counts);
        } catch (Exception e) {
            logger.info(e);
            return new Table(null, 0);
        }
    }

    @Override
    public Table queryBtsCellsByCellId(Map<String, Object> param) {
        try {
            List<BtsCell> btsCellList = btsCellMapper.queryBtsCellsByCellId(param);
            BtsCell centerBts = btsCellList.get(0);
            Map<String, Object> paras = new HashMap<>();
            paras.put("lonBefore", new BigDecimal(centerBts.getLongitude()).subtract(new BigDecimal(lonMark)));
            paras.put("lonAfter", new BigDecimal(centerBts.getLongitude()).add(new BigDecimal(lonMark)));
            paras.put("latBefore",new BigDecimal(centerBts.getLatitude()).subtract(new BigDecimal(latMark)));
            paras.put("latAfter",new BigDecimal(centerBts.getLatitude()).add(new BigDecimal(latMark)));
            List<BtsCell> btsCellList5G = btsCellMapper.query5GBtsCellsByLonAndLatRange(paras);
            btsCellList.addAll(btsCellList5G);
            return new Table(btsCellList, btsCellList.size());
        } catch (Exception e) {
            logger.info(e);
            return new Table(null, 0);
        }
    }

    @Override
    public Table exportBtsCellCoverRanking(Map<String, Object> param) {
        try {
            List<Map<String, Object>> excelList = btsCellMapper.queryAllBtsCells(param);
            return new Table(excelList, excelList.size());
        } catch (Exception e) {
            e.printStackTrace();
            logger.info(e);
            return new Table(null, 0);
        }
    }
}
