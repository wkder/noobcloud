package com.cmcc.noobcloud.networkservice.task;

import com.cmcc.noobcloud.networkservice.mapper.firstDataSourse.NetworkMapper;
import com.cmcc.noobcloud.networkservice.threads.NetworkConfigInfo;
import com.cmcc.noobcloud.networkservice.utils.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.logging.Logger;

/**
 * 功能描述：采集在维设备的配置信息
 *
 * @return 返回值
 * @throw 异常描述
 */
@Configuration      //1.主要用于标记配置类，兼备Component的效果。
@EnableScheduling   // 2.开启定时任务
public class NetworkConfigInfoSchedule {

    private Logger logger = Logger.getLogger(NetworkConfigInfoSchedule.class.getName());

    private int limit = 1000;
    private int maxThreads = 6;

    @Autowired
    NetworkMapper networkMapper;

    //3.添加定时任务
    @Scheduled(cron = "0 42 11 * * ?")
    //或直接指定时间间隔，例如：5秒
    //@Scheduled(fixedRate=5000)
    private void configureTasks() {
        System.out.println("hasKey" + RedisUtil.hasKey("ConfigInfoLock"));
        System.out.println("getLock" + RedisUtil.get("ConfigInfoLock"));
        if(!RedisUtil.hasKey("ConfigInfoLock") || (boolean) RedisUtil.get("ConfigInfoLock") == false ){
            RedisUtil.set("ConfigInfoLock", true, 60);
            //执行任务
            System.out.println(this.getClass().getName() + "开始定时更新,现在的时间是:" + new Date().toString());
            logger.info(this.getClass().getName() + "开始定时更新,现在的时间是:" + new Date().toString());
            Map<String, Object> param = new HashMap<>();
            int counts = networkMapper.countAllNetworks(param);
            int tasks = counts / limit + 1;
            logger.info(this.getClass().getName() + "maxThreads:" + maxThreads);
            int times = tasks % maxThreads == 0 ? tasks / maxThreads : tasks / maxThreads + 1;
            for (int i = 0; i < times; i++) {
                int threads = maxThreads;
                if(tasks - (i + 1) * maxThreads < 0){
                    threads = tasks % maxThreads;
                }
                ExecutorService es = Executors.newFixedThreadPool(threads);
                Future<Boolean>[] futureThreads = new Future[threads];
                for (int j = 0; j < threads; j++) {
                    Map<String, Object> pms = new HashMap<>();
                    pms.put("limit", limit);
                    pms.put("i", i);
                    pms.put("j", j);
                    pms.put("maxThreads", maxThreads);
                    int offset = (i * maxThreads + j) * limit;
                    pms.put("offset", offset);
                    logger.info(this.getClass().getName() + "从" + (offset+ 1) + " 到" + (offset + limit));
                    NetworkConfigInfo networkConfigInfos = new NetworkConfigInfo(pms);
                    futureThreads[j] = es.submit(networkConfigInfos);
                }
                boolean[] flagThreads = new boolean[threads];
                try {
                    for (int j = 0; j < threads; j++) {
                        flagThreads[j] = futureThreads[j].get();
                    }
                } catch (Exception e) {
                    logger.info(this.getClass().getName() + "第" + times + "批次从执行异常" + e);
                }
            }
            logger.info(this.getClass().getName() + "结束定时更新,现在的时间是:" + new Date().toString());
            System.out.println(this.getClass().getName() + "结束定时更新,现在的时间是:" + new Date().toString());
            RedisUtil.set("ConfigInfoLock", false);
        }
    }
}
