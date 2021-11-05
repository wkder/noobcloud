var positionReport = function () {
    var getUrl = "queryPositionReportByPage.view", province = "", dataTable, obj = {};
    //
    obj.initDate = function () {
        $('.startTime').val(new Date().format('yyyy-MM-dd'));
    }
    // 主页table初始化
    obj.dataTableInit = function () {
        var taskName = $.trim($("#qrtaskName").val()),
            baseName = $.trim($("#qrbaseName").val()),
            baseCode = $.trim($("#qrbaseCode").val()),
            locationType = $.trim($("#qryLocationType").val()),
            baseArea = $.trim($("#qryBaseAreas").val()),
            dateTime = $.trim($("#dateTime").val());
        var param = "taskName=" + encodeURIComponent(taskName) + "&baseName=" + baseName + "&baseCode=" + baseCode + "&locationType=" + locationType + "&baseArea=" + baseArea + "&dateTime=" + dateTime;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {data: "cdate", title: "日期", width: 80, className: "dataTableFirstColumns"},
                {data: "taskName", title: "任务名称", width: 100},
                {
                    data: "businessType", title: "业务类型", width: 80,
                    render: function (data, type, row) {
                        switch (data) {
                            case "2":
                                return "临时摊点（校园）";
                            case "3":
                                return "临时摊点（集客）";
                            case "4":
                                return "临时摊点（公众）";
                        }
                        return data;
                    }
                },
                {data: "baseName", title: "营业厅名称", width: 120},
                {data: "baseCode", title: "营业厅编码", width: 100},
                {data: "locationType", title: "营业厅类型", width: 100},
                {data: "areaName", title: province === $system.PROVINCE_ENUM.SH ? "区县" : "地市", width: 40},
                {data: "sendNum", title: "短信发送人数", className: "centerColumns", width: 120},
                {data: "receiveNum", title: "短信到达人数", className: "centerColumns", width: 120},
                {data: "flag", title: "短信到达率", className: "centerColumns", width: 120}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    // 触发事件
    obj.initEvent = function () {
        //查询
        $("#positonBaseButton").click(function () {
            obj.queryPositionReport();
        });
        //导出
        $("#exportPositionBaseButton").click(function () {
            obj.exportData("getPositionReportDown.view", obj.getParams());
        });
        $("#btnDescription").click(obj.evtOnDescription);
    }
    // 加载查询条件
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $("#qryBaseAreas");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == areaCode) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }

            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    }
    // 显示 指标说明
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
    obj.queryPositionReport = function () {
        var taskName = $.trim($("#qrtaskName").val()),
            baseName = $.trim($("#qrbaseName").val()),
            baseCode = $.trim($("#qrbaseCode").val()),
            locationType = $.trim($("#qryLocationType").val()),
            baseArea = $.trim($("#qryBaseAreas").val()),
            dateTime = $.trim($("#dateTime").val());
        var param = "taskName=" + encodeURIComponent(taskName) + "&baseName=" + baseName + "&baseCode=" + baseCode + "&locationType=" + locationType + "&baseArea=" + baseArea + "&dateTime=" + dateTime;
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + param);
    }
    // 导出数据
    obj.exportData = function (url, params) {
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm";
        tempForm.method = "POST";
        tempForm.action = url;

        $.each(params, function (idx, value) {
            var input = document.createElement("input");
            input.type = "hidden";
            input.name = value[0];
            input.value = value[1];
            tempForm.appendChild(input);
        });
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    };
    // 获取请求参数
    obj.getParams = function () {
        var paramList = [
            ["taskName", $.trim($("#qrtaskName").val())],
            ["baseName", $.trim($("#qrbaseName").val())],
            ["baseCode", $.trim($("#qrbaseCode").val())],
            ["locationType", $.trim($("#qryLocationType").val())],
            ["baseArea", $.trim($("#qryBaseAreas").val())],
            ["areaName", $.trim($("#qryBaseAreas").find("option:selected").text())],
            ["dateTime", $.trim($("#dateTime").val().replace(/-/g, ""))]
        ];
        return paramList;
    }
    //
    obj.initProvince = function () {
        province = $system.getProvince();
    }

    return obj;
}();

function onLoadBody() {
    positionReport.initProvince();
    positionReport.initAreaSelect();
    positionReport.initDate();
    positionReport.dataTableInit();
    positionReport.initEvent();
}