package com.cmcc.noobcloud.networkservice.threads;

import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.NetworkMapper;
import com.cmcc.noobcloud.networkservice.pojo.*;
import com.cmcc.noobcloud.networkservice.utils.SecureCrtUtil;
import com.cmcc.noobcloud.networkservice.utils.SpringUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.logging.Logger;

public class NetworkLogInfo implements Callable<Boolean> {

    private Logger log = Logger.getLogger(NetworkLogInfo.class.getName());

    private NetworkMapper networkMapper = SpringUtil.getBean(NetworkMapper.class);

    private Map<String, Object> params;

    private String manageIp = "10.40.115.126";

    private int managePort = 22;

    private String collectUri = "F:/";

    public NetworkLogInfo(Map<String, Object> params) {
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
                paras.put("commandCode", 2);
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
                    networkMapper.deleteNetworkLogByNetworkId(network.getNetworkId());
                }
                try {
                    System.out.println("文件名：" + collectUri + "NetworkLogInfo-" + String.valueOf(networkInfo.get("networkName")).trim() + DateFormatUtils.format(new Date(), "yyyyMMddHHmmSS") + ".txt");
                    File file = new File(collectUri + "NetworkLogInfo-" + String.valueOf(networkInfo.get("networkName")).trim() + DateFormatUtils.format(new Date(), "yyyyMMddHHmmSS") + ".txt");
                    FileUtils.writeStringToFile(file,executive,"utf-8",true);
                    System.out.println(file.getAbsolutePath());
                    List<String> lines = FileUtils.readLines(file,"utf-8");
                    int start = 0;
                    int last = 0;
                    for (int k = 0; k <lines.size() ; k++) {
                        if(("<" + String.valueOf(networkInfo.get("networkName")).trim() + ">" + showCmd).equals(lines.get(k))) start = k+ 1;
                        if(!("<" + String.valueOf(networkInfo.get("networkName")).trim() + ">" + showCmd).equals(lines.get(k)) && lines.get(k).startsWith("<" + String.valueOf(networkInfo.get("networkName")).trim() + ">")) last = k;
                    }
                    if("HWNE40EX8".equals(networkInfo.get("catogory"))){
                        List<NetworkLog> networkLogs = new ArrayList<>();
                        for (int k = start; k <last; k++) {
                            if(lines.get(k).contains("/Independent/")){
                                NetworkLog networkLog = new NetworkLog();
                                networkLog.setNetworkId(network.getNetworkId());
                                networkLog.setSysname(network.getNetworkName());
                                networkLog.setLog(lines.get(k).trim());
                                networkLogs.add(networkLog);
                            }
                        }
                        networkMapper.batchInsertNetworkLog(networkLogs);
                    }
                } catch (Exception e) {
                    log.info(this.getClass().getName() + networkInfo.get("networkName") + new Date().toString() + ".txt日志采集异常" + e);
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
