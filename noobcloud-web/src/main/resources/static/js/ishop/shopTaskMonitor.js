/**
 * Created by DELL on 2017/6/3.
 */

var shopTaskMonitor = function () {
    var obj = {}, dataTable;
    var getUrl = "queryShopTaskMonitor.view";

    obj.initDate = function () {
        $('.startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().format('yyyy-MM-dd'));
    };

    obj.dataTableInit = function () {
        var startTime = $.trim($("#startTime").val()),
            endTime = $.trim($("#endTime").val());
        var param = "startTime=" + startTime + "&endTime=" + endTime;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {data: "timeUnit", title: "日期", width: 40 , className:"dataTableFirstColumns"},
                {data: "taskFileNum", title: "活动文件", width: 40},
                //{data: "userFileNum", title: "用户文件", width: 40,className:"userFile"},
                {data: "personalTaskNum", title: "个性化任务", width: 50},
                {data: "shopOnlineNum", title: "在线营业厅", width: 50},
                {data: "provincialTaskNum", title: "省级任务", width: 40},
                {data: "cityTaskNum", title: "地市任务", width: 40},
                {data: "shopNum", title: "营业厅", width: 40},
                {data: "taskNum", title: "有效任务", width: 40},
                {data: "shouldTaskNum", title: "应生产任务数", width: 60},
                {data: "actualTaskNum", title: "实际任务数", width: 50}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 触发事件
    obj.initEvent = function () {
        // 查询
        $("#queryButton").click(function () {
            obj.queryShopTaskMonitor();
        });
        // 导出
        $("#exportBaseButton").click(function () {
            obj.exportData("downloadShopTaskMonitor.view", obj.getParams());
        });
    };

    obj.queryShopTaskMonitor = function () {
        var startTime = $.trim($("#startTime").val()),
            endTime = $.trim($("#endTime").val());

        if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("开始时间请勿大于结束时间", {icon: 6});
            return;
        }
        var param = "startTime=" + startTime + "&endTime=" + endTime;
        dataTable.ajax.url(getUrl + "?" + param);
        dataTable.ajax.reload();
    };

    obj.getParams = function(){
        var paramList = [
            ["startTime", $("#startTime").val()],
            ["endTime", $("#endTime").val()]
        ];
        return paramList;

    };

    // 导出数据
    obj.exportData = function (url, params) {
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm";
        tempForm.method = "POST";
        tempForm.action = url;

        $.each(params, function (idx, value) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = value[0];
            input.value = value[1];
            tempForm.appendChild(input);
        });
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    };

    return obj;
}();

function onLoadBody() {
    shopTaskMonitor.initDate();
    shopTaskMonitor.dataTableInit();
    shopTaskMonitor.initEvent();
}