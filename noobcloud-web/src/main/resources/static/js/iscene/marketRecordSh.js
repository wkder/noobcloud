/**
 * Created by Chris on 2017/11/29.
 */
var marketRecord = function () {
    var getUrl = "queryMarketRecordSh.view", dataTable = {}, obj = {};

    //初始化查询事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
    };

    // 初始化时间
    obj.initDate = function () {
        $('#startTime').val(new Date().format('yyyy-MM-dd'));
    };

    // 表格初始化
    obj.dataTableInit = function () {
        var phone = $.trim($("#txtQuery").val()),
            baseCode = $.trim($("#txtBaseCode").val()),
            startTime = $.trim($("#startTime").val().replace(/-/g, ""));

        var param = "phone=" + phone + "&baseCode=" + baseCode + "&startTime=" + startTime;
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?" + param, type: "POST"},
            columns: [
                {data: "phone", title: "手机号", width: 400, className: "dataTableFirstColumns"},
                {data: "chnlcode", title: "营业厅编码", width: 400},
                {data: "basename", title: "所属营业厅", width: 400},
                {data: "taskname", title: "任务名称", width: 400},
                {data: "sms", title: "发送内容", width: 400},
                {
                    data: "sendtime", title: "发送时间", width: 400
                    // render: function (data, type, row) {
                    //     var array = row.sendTime.split(' ');
                    //     return array[0] + "<br/>" + array[1];
                    // }
                },
                {
                    title: "是否免打扰", width: 400,
                    render: function (data, type, row) {
                        if (row.isnotrouble == 0) {
                            return "<i class='fa'>是</i>";
                        }
                        else {
                            return "<i class='fa'>否</i>";
                        }
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询
    obj.evtOnQuery = function () {
        var phone = $.trim($("#txtQuery").val()),
            baseCode = $.trim($("#txtBaseCode").val()),
            startTime = $.trim($("#startTime").val().replace(/-/g, ""));

        var param = "phone=" + encodeURIComponent(phone) + "&baseCode=" + baseCode + "&startTime=" + startTime;
        dataTable.ajax.url(getUrl + "?" + param);
        dataTable.ajax.reload();
    };

    return obj;
}();

function onLoadBody() {
    marketRecord.initDate();
    marketRecord.dataTableInit();
    marketRecord.initEvent();
}


