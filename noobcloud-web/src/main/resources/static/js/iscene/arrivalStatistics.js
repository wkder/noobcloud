/**
 * Created by Chris on 2018/1/23.
 */
var arrivalStatistics = function () {
    var getUrl = "queryArrivalStatistics.view", dataTable, obj = {};

    //初始化时间
    obj.initDate = function () {
        $('#startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('#endTime').val(new Date().getDelayDay(0).format('yyyy-MM-dd'));
    };

    // 主页table初始化
    obj.dataTableInit = function () {
        var baseCode = $.trim($("#qrbaseCode").val()),
            baseArea = $.trim($("#qryBaseAreas").val()),
            startTime = $.trim($("#startTime").val().replace(/-/g, "")),
            endTime = $.trim($("#endTime").val().replace(/-/g, ""));

        var param = "chnlCode=" + baseCode + "&cityCode=" + baseArea + "&startTime=" + startTime + "&endTime=" + endTime;

        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {data: "basename", title: "营业厅名称", width: 100, className: "centerColumns"},
                {data: "businesshallcoding", title: "营业厅编码", width: 100, className: "centerColumns"},
                {data: "country", title: "所属行政区", width: 100, className: "centerColumns"},
                {data: "receivenum", title: "当日短信触达总量", width: 100, className: "centerColumns"},
                {data: "daodiannum", title: "当日上机接待用户总量", width: 100, className: "centerColumns"},
                {data: "daodianrate", title: "引流到店率", width: 100, className: "centerColumns"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 触发事件
    obj.initEvent = function () {
        //查询
        $("#qryButton").click(function () {
            obj.queryArrivalStatisticsReport();
        });

        //导出
        $("#exportButton").click(function () {
            var param = getParam();
            $util.exportFile("downloadArrivalStatistics.view", param);
        });

    };

    // 查询
    obj.queryArrivalStatisticsReport = function () {
        var baseCode = $.trim($("#qrbaseCode").val()),
            baseArea = $.trim($("#qryBaseAreas").val()),
            startTime = $.trim($("#startTime").val().replace(/-/g, "")),
            endTime = $.trim($("#endTime").val().replace(/-/g, ""));

        var param = "chnlCode=" + baseCode + "&cityCode=" + baseArea + "&startTime=" + startTime + "&endTime=" + endTime;

        if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("起始日期请勿大于截止日期", {icon: 6});
            return;
        }
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + param);
    };

    // 获取请求参数
    function getParam() {
        return {
            chnlCode: $.trim($("#qrbaseCode").val()),
            cityCode: $.trim($("#qryBaseAreas").val()),
            areaName: $.trim($("#qryBaseAreas").find("option:selected").text()),
            startTime: $.trim($("#startTime").val().replace(/-/g, "")),
            endTime: $.trim($("#endTime").val().replace(/-/g, ""))
        };
    }

    return obj;
}();

function onLoadBody() {
    arrivalStatistics.initDate();
    arrivalStatistics.dataTableInit();
    arrivalStatistics.initEvent();
}

