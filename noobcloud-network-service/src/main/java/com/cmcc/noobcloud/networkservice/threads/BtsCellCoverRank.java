package com.cmcc.noobcloud.networkservice.threads;

import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.BtsCellMapper;
import com.cmcc.noobcloud.networkservice.pojo.BtsCell;
import com.cmcc.noobcloud.networkservice.task.BtsCellCoverRankSchedule;
import com.cmcc.noobcloud.networkservice.utils.GeometryUtil;
import com.cmcc.noobcloud.networkservice.utils.SpringUtil;
import org.apache.commons.collections4.CollectionUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.logging.Logger;

public class BtsCellCoverRank implements Callable<Boolean> {

    private Logger log = Logger.getLogger(BtsCellCoverRankSchedule.class.getName());

    private BtsCellMapper btsCellMapper = SpringUtil.getBean(BtsCellMapper.class);

    private Map<String, Object> params;

    //覆盖率更新任务搜索范围
    private Double lonRange = 0.002;
    private Double latRange = 0.002;

    public BtsCellCoverRank(Map<String, Object> params) {
        this.params = params;
    }

    @Override
    public Boolean call() {
        int i = Integer.valueOf(String.valueOf(params.get("i")));
        int j = Integer.valueOf(String.valueOf(params.get("j")));
        int maxThreads = Integer.valueOf(String.valueOf(params.get("maxThreads")));
        int offset = Integer.valueOf(String.valueOf(params.get("offset")));
        int limit = Integer.valueOf(String.valueOf(params.get("limit")));
        try {
            List<BtsCell> btsCell4GList = btsCellMapper.queryAllBtsCellsByPage(params);
            if(CollectionUtils.isEmpty(btsCell4GList)) return true;
            btsCell4GList.forEach(bts4GCell -> {
                Map<String, Object> paras = new HashMap<>();
                paras.put("lonBefore", new BigDecimal(bts4GCell.getLongitude()).subtract(new BigDecimal(lonRange)));
                paras.put("lonAfter", new BigDecimal(bts4GCell.getLongitude()).add(new BigDecimal(lonRange)));
                paras.put("latBefore",new BigDecimal(bts4GCell.getLatitude()).subtract(new BigDecimal(latRange)));
                paras.put("latAfter",new BigDecimal(bts4GCell.getLatitude()).add(new BigDecimal(latRange)));
                List<BtsCell> btsCell5GList = btsCellMapper.query5GBtsCellsByLonAndLatRange(paras);
                if(!CollectionUtils.isEmpty(btsCell5GList)){
                    List<Double> distanList = new ArrayList<>();
                    for (int k = 0; k <btsCell5GList.size() ; k++) {
                        Double distance = GeometryUtil.getDistance(bts4GCell.getLongitude(), bts4GCell.getLatitude(), btsCell5GList.get(k).getLongitude(), btsCell5GList.get(k).getLatitude());
                        distanList.add(k, distance);
                    }
                    int index = distanList.indexOf(Collections.min(distanList));
                    BtsCell minBts5GCell = btsCell5GList.get(index);
                    double area = GeometryUtil.areaOfIntersectionOfCircles(0, 0, bts4GCell.getRadius(), distanList.get(index), 0, minBts5GCell.getRadius());
                    if((Math.PI * Math.pow(minBts5GCell.getRadius(),2)) != area){
                        Double coverRate = area * 100 / (Math.PI * Math.pow(bts4GCell.getRadius(),2));
                        bts4GCell.setCoverRate(new BigDecimal(coverRate).setScale(2,   BigDecimal.ROUND_HALF_UP).doubleValue());
                    } else  {
                        bts4GCell.setCoverRate(100.00);
                    }
                } else {
                    bts4GCell.setCoverRate(0.00);
                }
            });
            //批量更新
            btsCellMapper.batchUpdateBtsCell(btsCell4GList);
            log.info(this.getClass().getName() + "第" + (i * maxThreads + j) + "批次从" + offset + "至" + (offset + limit) + "执行完毕");
        } catch (Exception e) {
            log.info(this.getClass().getName() + "第" + (i * maxThreads + j) + "批次从" + offset + "至" + (offset + limit) + "执行异常" + e);
            return false;
        }
        return true;
    }

}
