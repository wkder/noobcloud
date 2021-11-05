/**
 * Created by Chris on 2017/11/13.
 */
var maintainStatistics = function () {
    var getMaintainStatistics = "queryMaintainStatistics.view";
    var dataTable;
    var obj = {};

    // 初始化时间
    obj.initData = function () {
        $('.executeTime').val(new Date().format('yyyy-MM-dd'));
    };

    // 初始化查询按钮
    obj.initBtn = function () {
        $('.queryMaintainStatistics').click(obj.evtOnRefresh);
        /**
         * 导出报表
         */
        $('.downloadMaintainStatistics').click(function () {
            var param = getParams();
            $util.exportFile("downloadMaintainStatisticsList.view", param);
        });
    };

    // 按钮操作实现
    obj.evtOnRefresh = function () {
        var param = getParams();
        var data = "executeTime=" + param.executeTime + "&maintainNumber=" + param.maintainNumber;
        dataTable.ajax.url(getMaintainStatistics + "?" + data);
        dataTable.ajax.reload();
    };

    // 初始化dataTable
    obj.dataTableInit = function () {
        var param = getParams();
        var data = "executeTime=" + param.executeTime + "&maintainNumber=" + param.maintainNumber;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getMaintainStatistics + "?" + data,
                type: "POST"
            },
            columns: [
                {data: "execDate", title: "执行日期", width: 400, className: "dataTableFirstColumns"},
                {data: "areaCode", title: "地市编码", width: 800, className: "centerColumns"},
                {data: "codeName", title: "地市名称", width: 800, className: "centerColumns"},
                {data: "taskName", title: "任务名称", width: 800, className: "centerColumns"},
                {data: "typeName", title: "任务类型", width: 800, className: "centerColumns"},
                {data: "userName", title: "维系人员名称", width: 800, className: "centerColumns"},
                {data: "userPhone", title: "维系人员号码", width: 600, className: "centerColumns"},
                {data: "totalNum", title: "待维系客户的条数", width: 600, className: "centerColumns"},
                {data: "execNum", title: "执行维系客户条数", width: 600, className: "centerColumns"},
                {data: "execRate", title: "任务执行率", width: 600, className: "centerColumns"},
                {data: "channelName", title: "执行维系客户的渠道", width: 1200, className: "centerColumns"},
                {data: "cDate", title: "更新时间", width: 600, className: "centerColumns"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    function getParams() {
        return {
            executeTime: $('.executeTime').val().replace(/-/g, ""),
            maintainNumber: $.trim($('.maintainNumber').val())
        }
    }

    return obj;
}();
function onLoadBody() {
    maintainStatistics.initData();
    maintainStatistics.dataTableInit();
    maintainStatistics.initBtn();
}