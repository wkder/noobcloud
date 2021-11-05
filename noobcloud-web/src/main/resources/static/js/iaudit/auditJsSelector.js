/**
 * Created by wtt on 2017/2/6.
 */
/**
 * 这里作为审批中心js加载的选择器中转站
 * 使用同一html模板，加载所有审批类型的js，由这里选择运行渲染的js方法。
 * 具体运行哪个js需要在数据库里面配置 example.requestHtml?status=str
 * 所有审批中心的页面url都需要配置，否则会提示 数据库配置异常
 * @param status
 */
function onLoadBody(status) {
    if (status != null && status != undefined && status != '') {
        if ($.trim(status) === 'model') {
            onLoadAuditSegment();
        }
        if ($.trim(status) === 'tag') {
            onLoadAuditTag();
        }
        if ($.trim(status) === 'market') {
            onLoadAuditMarket();
        }
        if ($.trim(status) === 'shop') {
            onLoadAuditShop();
        }
        if ($.trim(status) === 'oldCustomer') {
            onLoadAuditOldCustomer();
        }
        if ($.trim(status) === 'keeperTask') {
            onLoadAuditKeeperTask();
        }
        if ($.trim(status) === 'smsSignature') {
            onLoadAuditSmsSignature();
        }
        if ($.trim(status) === 'iptv') {
            onLoadAuditIptvTask();
        }
        if ($.trim(status) === 'offNetSms') {
            onLoadAuditoffNetSmsTask();
        }
        if ($.trim(status) === 'iptvTemp') {
            onLoadAuditIptvTemplate();
        }
    } else {
        $html.warning("数据库配置异常");
    }
}



