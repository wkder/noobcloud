package com.cmcc.noobcloud.networkservice.mapper.firstDataSourse;

import com.cmcc.noobcloud.networkservice.pojo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface NetworkMapper {

    List<Network> queryAllNetworksByPage(Map<String,Object> param);

    Integer countAllNetworks(Map<String,Object> param);

    Map<String, Object> queryNetworkInfoByNetworkId(Map<String,Object> param);

    Integer batchInsertNetworkVpn(@Param("list") List<NetworkVpn> networkVpnList);

    Integer batchInsertNetworkBfd(@Param("list") List<NetworkBfd> networkBfdList);

    Integer batchInsertNetworkRoute(@Param("list") List<NetworkRoute> networkRouteList);

    Integer batchInsertNetworkPrefix(@Param("list") List<NetworkPrefix> networkPrefixList);

    Integer batchInsertNetworkInteface(@Param("list") List<NetworkInteface> networkIntefaceList);

    Integer deleteNetworkVpnByNetworkId(@Param("networkId") Long networkId);

    Integer deleteNetworkRouteByNetworkId(@Param("networkId") Long networkId);

    Integer deleteNetworkPrefixByNetworkId(@Param("networkId") Long networkId);

    Integer deleteNetworkIntefaceByNetworkId(@Param("networkId") Long networkId);

    Integer deleteNetworkBfdByNetworkId(@Param("networkId") Long networkId);

    Integer batchInsertNetworkLog(@Param("list") List<NetworkLog> networkLogList);

    Integer deleteNetworkLogByNetworkId(@Param("networkId") Long networkId);

}
