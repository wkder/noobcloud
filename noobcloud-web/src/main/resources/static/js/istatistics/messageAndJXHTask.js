/**
 * Created by Chris on 2017/12/11.
 */

var messageAndJXHTask = function () {
    var obj = {}, dataTable,
        getUrl = "queryMessageAndJXHTask.view";

    obj.initData = function () {
        $('.startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().getDelayDay(0).format('yyyy-MM-dd'));
        $("#taskName").val("");
        $("#marketType").val("all");
        $("#businessType").val("-1")
    };

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl,
                data: function (d) {
                    var param = {
                        startTime: $.trim($("#startTime").val().replace(/-/g, "")),
                        endTime: $.trim($("#endTime").val().replace(/-/g, "")),
                        taskName: $.trim($("#taskName").val()),
                        marketType: $("#marketType").val(),
                        businessType: $("#businessType").val()
                    };
                    var data = $.extend({}, d, param);
                    return data;
                },
                type: "POST"
            },
            columns: [
                {data: "timest", title: "日期", width: 200, className: "dataTableFirstColumns"},
                {data: "taskname", title: "任务名称", width: 200},
                {
                    data: "markettype", title: "来源", width: 200,
                    render: function (data, type, row) {
                        switch (data) {
                            case 'sms' :
                                return "自建群发任务";
                            case 'scenesms' :
                                return "自建场景任务";
                            case 'jxhsms' :
                                return "精细化群发任务";
                            case 'jxhscene' :
                                return "精细化场景任务";
                            default :
                                return ""
                        }
                    }
                },
                {
                    data: "businesstype", title: "业务类型", width: 200,
                    render: function (data, type, row) {
                        switch (data) {
                            case 1 :
                                return "互联网综合任务";
                            case 2 :
                                return "内容营销";
                            case 3 :
                                return "流量经营";
                            case 4 :
                                return "APP场景营销";
                            default :
                                return ""
                        }
                    }
                },
                {data: "marketnames", title: "目标用户群", width: 200},
                {data: "marketcounts", title: "目标用户数", width: 200},
                {
                    data: "marketcontent", title: "短信内容", width: 400,
                    render: function (data, type, row) {
                        return '<div class="h-Text">' + data + '</div>';
                    }
                },
                {data: "smssenduser", title: "短信发送人数", width: 200, defaultContent: "-"},
                {data: "smsarrvuser", title: "短信到达人数", width: 200, defaultContent: "-"},
                {data: "smsrate", title: "短信到达率", width: 200, defaultContent: "-"},
                {data: "clickuser", title: "反馈人数", width: 200, defaultContent: "-"},
                {data: "clickrate", title: "反馈率", width: 200, defaultContent: "-"},
                {data: "prodcutorderuser", title: "订购人数", width: 200, defaultContent: "-"},
                {data: "orderrate", title: "订购成功率", width: 200, defaultContent: "-"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.initEvent = function () {
        $("#queryButton").click(function () {
            var startTime = $.trim($("#startTime").val().replace(/-/g, "")),
                endTime = $.trim($("#endTime").val().replace(/-/g, ""));
            if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
                layer.alert("开始时间请勿大于结束时间", {icon: 6});
                return;
            }
            dataTable.ajax.reload();
        });

        $("#exportBaseButton").click(function () {
            obj.exportData("downloadMessageAndJXHTask.view", obj.getParams());
        });
    };

    obj.getParams = function () {
        var paramList = [
            ["startTime", $("#startTime").val().replace(/-/g, "")],
            ["endTime", $("#endTime").val().replace(/-/g, "")],
            ["taskName", $.trim($("#taskName").val())],
            ["marketType", $("#marketType").val()],
            ["businessType", $("#businessType").val()]
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
    messageAndJXHTask.initData();
    messageAndJXHTask.dataTableInit();
    messageAndJXHTask.initEvent();
}
