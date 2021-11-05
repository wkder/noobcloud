var messageMarketingResult = function () {
    var getUrl = "queryMessageMarketingResult.view", dataTable, obj = {};
    //加载查询条件
    //obj.initAreaSelect = function () {
    //    var $baseAreaTypeSelect = $("#qryBaseAreas");
    //    globalRequest.queryPositionBaseAreas(false, {}, function (data) {
    //        $baseAreaTypeSelect.empty();
    //        if (data) {
    //            var areaCode = globalConfigConstant.loginUser.areaCode;
    //            for (var i = 0; i < data.length; i++) {
    //                if (data[i].id == areaCode) {
    //                    $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
    //                } else {
    //                    $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
    //                }
    //            }
    //
    //        }
    //    }, function () {
    //        layer.alert("系统异常，获取地市失败", {icon: 6});
    //    });
    //};
    obj.initDate = function () {
        $('.startTime').val(new Date().getDelayDay(-11).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    };

    //主页table初始化
    obj.dataTableInit = function () {
        var marketingName = $.trim($("#marketingName").val()),
        //modelName = $.trim($("#modelName").val()),
        //baseArea = $.trim($("#qryBaseAreas").val()),
            dateTime = $.trim($("#dateTime").val()).replace(/[\-]/g,''),
            endTime = $.trim($("#endTime").val()).replace(/[\-]/g,'');
        var param = "marketName=" + encodeURIComponent(marketingName) + "&dateTime=" + dateTime + "&endTime=" + endTime;

        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            lengthChange:true,
            columns: [
                {data: "timest", title: "统计时间", width: 60},
                {data: "activiteName", title: "营销活动名称", width: 80, className: "marketActivity"},
                {data: "target_usernum", title: "任务目标人数", width: 40},
                {data: "send_num", title: "发送人数", width: 40},
                {
                    title: "发送成功率", width: 60, render: function (data, type, row) {
                    if(row.send_num == 0){
                        return "0.00%";
                    }else{
                        return (row.send_succ_usernum * 100 / row.send_num ).toFixed(2) + "%";
                    }
                }
                },

                {data: "recv_succ_usernum", title: "到达人数", width: 40},
                //到达率
                {
                    title: "到达率", width: 40, render: function (data, type, row) {
                    if(row.send_succ_usernum == 0){
                        return "0.00%";
                    }else{
                        return (row.recv_succ_usernum * 100 / row.send_succ_usernum ).toFixed(2) + "%";
                    }
                }
                },
                { title: "反馈数(人数/次数)", width: 60,render:function(data, type, row){
                    return row.feedback_usernum +"/"+ row.feedback_usercnt;
                }},
                {
                    title: "反馈率", width: 40, render: function (data, type, row) {
                    if(row.send_succ_usernum == 0){
                        return "0.00%";
                    }else{
                        return (row.feedback_usernum * 100 / row.send_succ_usernum ).toFixed(2) + "%";
                    }
                }
                },
                {
                    title: "订购数(笔数/人数)", width: 60, render: function (data, type, row) {
                    return row.product_order_cnt + "/" + row.product_order_user;
                }
                },
                {
                    title: "订购成功率", width: 40, render: function (data, type, row) {
                    if(row.product_order_user == 0){
                        return "0.00%";
                    }else{
                        return (row.product_ordersucc_user * 100 / row.product_order_user ).toFixed(2) + "%";
                    }

                }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };
    //触发事件
    obj.initEvent = function () {
        //查询
        $("#queryButton").click(function () {
            obj.queryMessageMarketingReport();
        });
        //导出
        $("#exportBaseButton").click(function () {
            obj.exportData("downloadMessageMarketingResult.view", obj.getParams());
        });
    };
    // 查询
    obj.queryMessageMarketingReport = function () {
        var marketingName = $.trim($("#marketingName").val()),
        //modelName = $.trim($("#modelName").val()),
        //baseArea = $.trim($("#qryBaseAreas").val()),
            dateTime = $.trim($("#dateTime").val()).replace(/[\-]/g,''),
            endTime = $.trim($("#endTime").val()).replace(/[\-]/g,'');
        // endTime = $.trim($("#endTime").val());

        if (dateTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("开始时间不能大于结束时间", {icon: 6});
            return;
        }
        var param = "marketName=" + encodeURIComponent(marketingName) + "&dateTime=" + dateTime + "&endTime=" + endTime;
        dataTable.ajax.url(getUrl + "?" + param);
        dataTable.ajax.reload();
    };

    //导出数据
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

    obj.getParams = function () {
        var paramList = [
            ["marketingName",$("#marketingName").val()],
            ["dateTime", $("#dateTime").val().replace(/[\-]/g,'')],
            ["endTime", $("#endTime").val().replace(/[\-]/g,'')]
        ];
        return paramList;
    };

    return obj;
}();

function onLoadBody() {
    //messageMarketingResult.initAreaSelect();
    messageMarketingResult.initDate();
    messageMarketingResult.dataTableInit();
    messageMarketingResult.initEvent();

}