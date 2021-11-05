package com.cmcc.noobcloud.networkservice.service.impl;

import com.cmcc.noobcloud.networkservice.common.Table;
import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.NetworkMapper;
import com.cmcc.noobcloud.networkservice.pojo.Network;
import com.cmcc.noobcloud.networkservice.pojo.NetworkVpn;
import com.cmcc.noobcloud.networkservice.service.NetworkService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class NetworkServiceImpl implements NetworkService {

    private final Logger logger = LogManager.getLogger(this.getClass());

    @Autowired
    NetworkMapper networkMapper;

    @Transactional
    public Table queryAllNetworksByPage(Map<String, Object> param) {
        try {
            Integer counts = networkMapper.countAllNetworks(param);
            List<Network> networkList = networkMapper.queryAllNetworksByPage(param);
            return new Table(networkList, counts);
        } catch (Exception e) {
            logger.info(e);
            return new Table(null, 0);
        }
    }
}
