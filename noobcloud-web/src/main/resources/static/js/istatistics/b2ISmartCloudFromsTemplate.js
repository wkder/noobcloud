/**
 * Created by DELL on 2018/4/26.
 * 智能云b2i报表模板js
 * 1 : 低余额提醒（日）
 * 2 : 低余额提醒（月）
 * 3 : 王卡助手绑定提升（日）
 * 4 : 王卡助手绑定提升（月）
 * 5 : 蚂蚁大宝卡套餐升级（日）
 * 6 : 蚂蚁大宝卡套餐升级（月）
 * 7 ：腾讯大王卡升级赠送语言或流量（日）
 * 8 ：腾讯大王卡升级赠送语言或流量（月）
 * 9 ：哔哩哔哩卡日租宝升级（日）
 * 10 ：哔哩哔哩卡日租宝升级（月）
 * 11 ：工行e卡升级赠送语音（日）
 * 12 ：工行e卡升级赠送语音（月）
 */
function onLoadBody(status) {
    var daily = 1,
        monthly = 2;
    switch (status) {
        case "1" :
            return loadLowBalanceWarning(daily);
        case "2" :
            return loadLowBalanceWarning(monthly);
        case "3" :
            return loadWangCardAssistant(daily);
        case "4" :
            return loadWangCardAssistant(monthly);
        case "5" :
            return loadMaYiDaBaoPackageUpgrade(daily);
        case "6" :
            return loadMaYiDaBaoPackageUpgrade(monthly);
        case "7" :
            return loadTencentWangCardPresented(daily);
        case "8" :
            return loadTencentWangCardPresented(monthly);
        case "9" :
            return loadBilibiliCardUpgrade(daily);
        case "10" :
            return loadBilibiliCardUpgrade(monthly);
        case "11" :
            return loadICBCCardUpgrade(daily);
        case "12" :
            return loadICBCCardUpgrade(monthly);
        default :
            return;
    }

}
