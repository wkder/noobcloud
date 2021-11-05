var marketRecord = function () {
    var getUrl = "queryMarketRecordByPage.view", dataTable = {}, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
    }

    obj.initDate = function () {
        $('#startTime').val(new Date().format('yyyy-MM-dd'));
        $('#endTime').val(new Date().format('yyyy-MM-dd'));
    }

    // 表格初始化
    obj.dataTableInit = function () {
        var phone = $.trim($("#txtQuery").val()),
            baseCode = $.trim($("#txtBaseCode").val()),
            startTime = $.trim($("#startTime").val());

        var param = "phone=" + phone  + "&baseCode=" + baseCode + "&startTime=" + startTime;
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?" + param, type: "POST"},
            columns: [
                {data: "phone", title: "手机号", width: 5, className: "dataTableFirstColumns"},
                {data: "baseId", title: "营业厅编码", width: 20},
                {data: "baseName", title: "所属营业厅", width: 40},
                {data: "taskName", title: "任务名称", width: 40},
                {data: "content", title: "发送内容", width: 100},
                {
                    data: "sendTime", title: "发送时间", width: 20,
                    render: function (data, type, row) {
                        var array = row.sendTime.split(' ');
                        return array[0] + "<br/>" + array[1];
                    }
                }
                // {data: "createUserName", title: "执行人"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        var phone = $.trim($("#txtQuery").val()),
            baseCode = $.trim($("#txtBaseCode").val()),
            startTime = $.trim($("#startTime").val());

        var param = "phone=" + encodeURIComponent(phone) + "&baseCode=" + baseCode + "&startTime=" + startTime;
        dataTable.ajax.url(getUrl + "?" + param);
        dataTable.ajax.reload();
    }

    return obj;
}()

function onLoadBody() {
    marketRecord.initDate();
    marketRecord.initData();
    marketRecord.initEvent();
}


