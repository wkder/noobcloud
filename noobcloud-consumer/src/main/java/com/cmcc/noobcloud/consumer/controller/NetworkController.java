package com.cmcc.noobcloud.consumer.controller;

import com.cmcc.noobcloud.consumer.common.Table;
import com.cmcc.noobcloud.consumer.service.NetworkService;
import com.cmcc.noobcloud.consumer.utils.ExcelUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
public class NetworkController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    private NetworkService networkService;

    @RequestMapping(value = "/queryAllNetworksByPage.html",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table queryAllNetworksByPage(@RequestParam Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "queryAllNetworksByPage");
        paras.put("offset",Integer.valueOf((String) paras.get("start")));
        paras.put("limit",Integer.valueOf((String) paras.get("length")));
        return networkService.queryAllNetworksByPage(paras);
    }

    @RequestMapping(value = "/queryAllBtsCellsByPage.html",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table queryAllBtsCellsByPage(@RequestParam Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "queryAllBtsCellsByPage");
        paras.put("offset",Integer.valueOf((String) paras.get("start")));
        paras.put("limit",Integer.valueOf((String) paras.get("length")));
        return networkService.queryAllBtsCellsByPage(paras);
    }

    @RequestMapping(value = "/queryBtsCellsByCellId.html",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table queryBtsCellsByCellId(@RequestBody Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "queryBtsCellsByCellId");
        paras.put("cellId",paras.get("cellId"));
        return networkService.queryBtsCellsByCellId(paras);
    }

    @RequestMapping(value = "/exportBtsCellCoverRanking.html",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public void exportBtsCellCoverRanking(@RequestParam Map<String, Object> paras, HttpServletResponse response) {
        logger.info(this.getClass().getName() + "exportBtsCellCoverRanking");
        Map<String, Object> param = new HashMap<>();
        param.put("cellId",paras.get("btsCellId"));
        param.put("ncgi",paras.get("btsNcgi"));
        param.put("btsName",paras.get("btsName"));
        param.put("cellName",paras.get("btsCellName"));
        param.put("type",paras.get("btsType"));
        param.put("apart",paras.get("btsApart"));
        Table table  = networkService.exportBtsCellCoverRanking(paras);
        ExcelUtil.excelExport("5G基站弱覆盖分析" + DateFormatUtils.format(new Date(), "yyyyMMddHHmmSS"), table.data, response);
    }
}
