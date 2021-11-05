/**
 * Created by FRANK on 2017/6/3.
 */

var marketingRecordSearching = function () {
    var obj = {}, dataTable;
    var getUrl = "queryMarketingRecordByPage.view";

    obj.initDate = function () {
        $('#phoneNum').val('');
        $('.startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().format('yyyy-MM-dd'));
    };

    obj.dataTableInit = function () {
        var phoneNum = $.trim($("#phoneNum").val()),
            startTime = $.trim($("#startTime").val()),
            endTime = $.trim($("#endTime").val());
        var param = "phoneNum=" + phoneNum +"&startTime=" + startTime + "&endTime=" + endTime;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {data: "timest", title: "日期", width: 25 , className:"dataTableFirstColumns"},
                {data: "taskid", title: "任务ID", width: 25},
                {data: "phone", title: "用户号码", width: 50},
                {data: "message", title: "营销内容", width: 150},
                {data: "sendtime", title: "发送时间", width: 80},
                {data: "spnum", title: "接入号码", width: 50},
                {data: "sendflag", title: "发送结果", width: 30,
                    render: function (data,row) {
                        if (data == 0) {
                            return "已发出";
                        }else{
                            return "未发出";
                        }
                    }
                },
                {
                    data: "recvflag", title: "接收结果", width: 30,
                    render: function (data,row) {
                        if (data == 0) {
                            return "已收到";
                        }else{
                            return "未收到";
                        }
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 触发事件
    obj.initEvent = function () {
        // 查询
        $("#queryButton").click(function () {
            obj.marketingRecordSearching();
        });
    };

    obj.marketingRecordSearching = function () {
        var phoneNum = $.trim($("#phoneNum").val()),
            startTime = $.trim($("#startTime").val()),
            endTime = $.trim($("#endTime").val());

        if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("开始时间请勿大于结束时间", {icon: 6});
            return;
        }
        var param = "phoneNum=" + phoneNum +"&startTime=" + startTime + "&endTime=" + endTime;
        dataTable.ajax.url(getUrl + "?" + param);
        dataTable.ajax.reload();
        //dataTable.draw(false);
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
    marketingRecordSearching.initDate();
    marketingRecordSearching.dataTableInit();
    marketingRecordSearching.initEvent();
}
