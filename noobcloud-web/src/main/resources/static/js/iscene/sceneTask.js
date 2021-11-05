/**
 * Created by Chris on 2017/11/24.
 */
var positionReport = function () {
    var getUrl = "querySceneTask.view", dataTable, obj = {};

    //初始化时间
    obj.initDate = function () {
        $('#startTime').val(new Date().getDelayDay(-8).format('yyyy-MM-dd'));
        $('#endTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    };

    // 主页table初始化
    obj.dataTableInit = function () {
        var taskName = $.trim($("#qrtaskName").val()),
            baseCode = $.trim($("#qrbaseCode").val()),
            baseArea = $.trim($("#qryBaseAreas").val()),
            startTime = $.trim($("#startTime").val().replace(/-/g, "")),
            endTime = $.trim($("#endTime").val().replace(/-/g, ""));

        var param = "taskName=" + encodeURIComponent(taskName) + "&chnlCode=" + baseCode + "&cityCode=" + baseArea + "&startTime=" + startTime + "&endTime=" + endTime;

        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {data: "time", title: "日期", width: 80, className: "centerColumns"},
                {data: "taskname", title: "任务名称", width: 100, className: "centerColumns"},
                {data: "basename", title: "营业厅名称", width: 120, className: "centerColumns"},
                {data: "chnlcode", title: "营业厅编码", width: 100, className: "centerColumns"},
                {data: "type", title: "营业厅类型", width: 100, className: "centerColumns"},
                {data: "county", title: "地市", width: 40, className: "centerColumns"},
                {data: "senduser", title: "场景人数", className: "centerColumns", width: 120},
                {data: "sucuser", title: "触达人数", className: "centerColumns", width: 120},
                {data: "sucrate", title: "到达率", className: "centerColumns", width: 120},
                {data: "smscontent", title: "发送内容", className: "centerColumns", width: 120}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 触发事件
    obj.initEvent = function () {
        //查询
        $("#sceneTaskButton").click(function () {
            obj.querySceneTaskReport();
        });

        //导出
        $("#exportSceneTaskButton").click(function () {
            var param = getParam();
            $util.exportFile("downloadSceneTask.view", param);
        });

        //说明
        $("#btnDescription").click(obj.evtOnDescription);
    };

    // 加载查询条件
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $("#qryBaseAreas");
        var areaCode = globalConfigConstant.loginUser.areaCode;
        var areaName = globalConfigConstant.loginUser.areaName;
        if (areaCode != 99999) {
            $baseAreaTypeSelect.empty();
            $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, areaCode).replace(/B/g, areaName));
        }

    };

    obj.evtOnDescription = function () {
        $plugin.iModal({
            title: '说明',
            content: $("#dialogDescription"),
            offset: '200px',
            area: ["400px", "200px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };

    // 查询
    obj.querySceneTaskReport = function () {
        var taskName = $.trim($("#qrtaskName").val()),
            baseCode = $.trim($("#qrbaseCode").val()),
            baseArea = $.trim($("#qryBaseAreas").val()),
            startTime = $.trim($("#startTime").val().replace(/-/g, "")),
            endTime = $.trim($("#endTime").val().replace(/-/g, ""));

        var param = "taskName=" + encodeURIComponent(taskName) + "&chnlCode=" + baseCode + "&cityCode=" + baseArea + "&startTime=" + startTime + "&endTime=" + endTime;

        if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("起始日期请勿大于截止日期", {icon: 6});
            return;
        }
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + param);
    };

    // 获取请求参数
    function getParam() {
        return {
            taskName: $("#qrtaskName").val(),
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
    positionReport.initDate();
    positionReport.initAreaSelect();
    positionReport.dataTableInit();
    positionReport.initEvent();
}