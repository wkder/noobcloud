package com.cmcc.noobcloud.networkservice.threads;

import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.NetworkMapper;
import com.cmcc.noobcloud.networkservice.pojo.*;
import com.cmcc.noobcloud.networkservice.task.BtsCellCoverRankSchedule;
import com.cmcc.noobcloud.networkservice.utils.SecureCrtUtil;
import com.cmcc.noobcloud.networkservice.utils.SpringUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class NetworkConfigInfo implements Callable<Boolean> {

    private Logger log = Logger.getLogger(NetworkConfigInfo.class.getName());

    private NetworkMapper networkMapper = SpringUtil.getBean(NetworkMapper.class);

    private Map<String, Object> params;

    private String manageIp = "10.40.115.126";

    private int managePort = 22;

    private String collectUri = "F:/";

    public NetworkConfigInfo(Map<String, Object> params) {
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
            List<Network> networkList = networkMapper.queryAllNetworksByPage(params);
            if(CollectionUtils.isEmpty(networkList)) return true;
            for (int m = 0; m <networkList.size() ; m++) {
                Network network = networkList.get(m);
                Map<String, Object> paras = new HashMap<>();
                paras.put("networkId", network.getNetworkId());
                paras.put("commandCode", 1);
                Map<String, Object> networkInfo = networkMapper.queryNetworkInfoByNetworkId(paras);
                String username = String.valueOf(networkInfo.get("account4a"));
                String password = String.valueOf(networkInfo.get("password4a"));
                String loginCode = String.valueOf(networkInfo.get("loginCode4a"));
                String[] codes = loginCode.split("/");
                String showCmd = String.valueOf(networkInfo.get("command"));
                List<String> cmdList = new ArrayList<>();
                cmdList.add(0, username);
                cmdList.add(1, password);
                for (int k = 0; k <codes.length ; k++) {
                    cmdList.add(k+2,codes[k]);
                }
                cmdList.add(codes.length + 2, showCmd);
                String[] cmds = cmdList.toArray(new String[cmdList.size()]);
                SecureCrtUtil secureCrt = new SecureCrtUtil(manageIp, managePort, null, null);
                String executive = secureCrt.executive(cmds, null);
                if(StringUtils.isEmpty(executive)){ //可能断网无法采集
                    continue;
                } else {
                    networkMapper.deleteNetworkVpnByNetworkId(network.getNetworkId());
                    networkMapper.deleteNetworkRouteByNetworkId(network.getNetworkId());
                    networkMapper.deleteNetworkPrefixByNetworkId(network.getNetworkId());
                    networkMapper.deleteNetworkIntefaceByNetworkId(network.getNetworkId());
                    networkMapper.deleteNetworkBfdByNetworkId(network.getNetworkId());
                }
                try {
                    System.out.println("文件名：" + collectUri + "NetworkConfigInfo-" + String.valueOf(networkInfo.get("networkName")).trim() + DateFormatUtils.format(new Date(), "yyyyMMddHHmmSS") + ".txt");
                    File file = new File(collectUri + "NetworkConfigInfo-" + String.valueOf(networkInfo.get("networkName")).trim() + DateFormatUtils.format(new Date(), "yyyyMMddHHmmSS") + ".txt");
                    FileUtils.writeStringToFile(file,executive,"utf-8",true);
                    System.out.println(file.getAbsolutePath());
                    List<String> lines = FileUtils.readLines(file,"utf-8");
                    int start = 0;
                    int last = 0;
                    for (int k = 0; k <lines.size() ; k++) {
                        if(("<" + String.valueOf(networkInfo.get("networkName")).trim() + ">" + showCmd).equals(lines.get(k))) start = k+ 1;
                        if("return".equals(lines.get(k))) last = k;
                    }
                    List<String> linConfig = new ArrayList<>();
                    List<Integer> index = new ArrayList<>();
                    for (int k = start; k <last; k++) {
                        linConfig.add(lines.get(k));
                        if("#".equals(lines.get(k).trim())){
                            index.add(linConfig.lastIndexOf(lines.get(k)));
                        }
                    }
                    System.out.println("size:" + index.size() + index);
                    List<String> data = new ArrayList<>();
                    for (int k = 0; k <index.size() - 1 ; k++) {
                        int begin = index.get(k);
                        int end = index.get(k+1);
                        String group = "";
                        for (int l = begin + 1; l < end; l++) {
                            String line = linConfig.get(l);
                            if(linConfig.get(l).startsWith(" ")){
                                line = "%tab%" + linConfig.get(l).trim();
                            }
                            if(!(linConfig.get(l).startsWith("ip ip-prefix") || linConfig.get(l).startsWith("ip route-static"))){
                                group += line;
                            }
                            if(linConfig.get(l).startsWith("ip ip-prefix") || linConfig.get(l).startsWith("ip route-static")){
                                group = line;
                                data.add(group);
                            }
                        }
                        if(group.startsWith("sysname") || group.startsWith("ip vpn-instance") || group.startsWith("interface") || group.startsWith("bfd")){
                            data.add(group);
                        }
                    }
                    List<NetworkVpn> networkVpnList = new ArrayList<>();
                    List<NetworkInteface> networkIntefaceList = new ArrayList<>();
                    List<NetworkBfd> networkBfdList = new ArrayList<>();
                    List<NetworkPrefix> networkPrefixList = new ArrayList<>();
                    List<NetworkRoute> networkRouteList = new ArrayList<>();
                    data.forEach(group->{
                        if(group.startsWith("ip vpn-instance")){
                            NetworkVpn networkVpn = new NetworkVpn();
                            networkVpn.setNetworkId(network.getNetworkId());
                            networkVpn.setSysname(network.getNetworkName());
                            networkVpn.setVpn(group);
                            networkVpnList.add(networkVpn);
                        }
                        if(group.startsWith("interface")){
                            NetworkInteface networkInteface = new NetworkInteface();
                            networkInteface.setNetworkId(network.getNetworkId());
                            networkInteface.setSysname(network.getNetworkName());
                            networkInteface.setInteface(group);
                            networkIntefaceList.add(networkInteface);
                        }
                        if(group.startsWith("bfd")){
                            NetworkBfd networkBfd = new NetworkBfd();
                            networkBfd.setNetworkId(network.getNetworkId());
                            networkBfd.setSysname(network.getNetworkName());
                            networkBfd.setBfd(group);
                            networkBfdList.add(networkBfd);
                        }
                        if(group.startsWith("ip ip-prefix")){
                            NetworkPrefix networkPrefix = new NetworkPrefix();
                            networkPrefix.setNetworkId(network.getNetworkId());
                            networkPrefix.setSysname(network.getNetworkName());
                            networkPrefix.setPrefix(group);
                            networkPrefixList.add(networkPrefix);
                        }
                        if(group.startsWith("ip route-static")){
                            NetworkRoute networkRoute = new NetworkRoute();
                            networkRoute.setNetworkId(network.getNetworkId());
                            networkRoute.setSysname(network.getNetworkName());
                            networkRoute.setRoute(group);
                            networkRouteList.add(networkRoute);
                        }
                    });
                    networkMapper.batchInsertNetworkVpn(networkVpnList);
                    networkMapper.batchInsertNetworkInteface(networkIntefaceList);
                    networkMapper.batchInsertNetworkBfd(networkBfdList);
                    networkMapper.batchInsertNetworkPrefix(networkPrefixList);
                    networkMapper.batchInsertNetworkRoute(networkRouteList);
                } catch (Exception e) {
                    log.info(this.getClass().getName() + networkInfo.get("networkName") + new Date().toString() + ".txt配置采集异常" + e);
                }
            }
            log.info(this.getClass().getName() + "第" + (i * maxThreads + j) + "批次从" + offset + "至" + (offset + limit) + "执行完毕");
        } catch (Exception e) {
            log.info(this.getClass().getName() + "第" + (i * maxThreads + j) + "批次从" + offset + "至" + (offset + limit) + "执行异常" + e);
            return false;
        }
        return true;
    }

}
