package com.cmcc.noobcloud.networkservice.controller;

import com.cmcc.noobcloud.networkservice.common.Table;
import com.cmcc.noobcloud.networkservice.service.BtsCellService;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@Slf4j
@RestController
public class BtsCellController {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    private BtsCellService btsCellService;

    @RequestMapping(value = "/queryAllBtsCellsByPage",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table queryAllBtsCellsByPage(@RequestBody Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "queryAllBtsCellsByPage");
        return btsCellService.queryAllBtsCellsByPage(paras);
    }

    @RequestMapping(value = "/queryBtsCellsByCellId",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table queryBtsCellsByCellId(@RequestBody Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "queryBtsCellsByCellId");
        return btsCellService.queryBtsCellsByCellId(paras);
    }

    @RequestMapping(value = "/exportBtsCellCoverRanking",method = RequestMethod.POST, produces="application/json;charset=UTF-8")
    public Table exportBtsCellCoverRanking(@RequestBody Map<String, Object> paras) {
        logger.info(this.getClass().getName() + "exportBtsCellCoverRanking");
        return btsCellService.exportBtsCellCoverRanking(paras);
    }

}
