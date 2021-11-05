/**
 * Created by xuan on 2017/4/19.
 */
var monitorStatistics = function () {
    var getMgr = "queryMonitorStatistics.view",
        dataTable, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    //事件绑定
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
    }

    //列表加载
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr+"?status=-1", type: "POST"},
            columns: [
                {data: "monitorConfigId", title: "序号", visible: false},
                {data: "serverIp", title: "目标服务地址", className: "dataTableFirstColumns"},
                {
                    data: "status", title: "状态",
                    render: function (data, type, row) {
                        if (data== "0") {
                            return "失败";
                        } else {
                            return "成功";
                        }
                    }
                },
                {data: "remark", title: "说明"},
                {data:'createTime',title:'日期'}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getMgr + "?serverIp="+encodeURIComponent($("#txtQuery").val())+"&status="+$("#selStatus").val());
        dataTable.ajax.reload();
    }
    return obj;
}();

function onLoadBody() {
    monitorStatistics.initData();
    monitorStatistics.initEvent();
}