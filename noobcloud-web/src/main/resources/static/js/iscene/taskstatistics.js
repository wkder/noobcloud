/**
 * Created by xuan on 2017/4/6.
 */
var taskstatistics = function () {
    var dataTable,
        getTaskStatistics = "getTaskStatisticsList.view",
        obj = {};
    obj.initData = function () {
        obj.dataTableInit();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnAdd").click(obj.evtOnShowScene);                 //新增场景
        $("#btnQuery").click(obj.evtOnQuery);                   //查询
    }
    //绑定列表
    obj.dataTableInit = function () {
        var nowTime=obj.getNowFormatDate();
        $(".startTime").val(nowTime)
        $(".stopTime").val(nowTime)
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getTaskStatistics + "?taskName=" + $("#txtQuery").val()+"&startTime="+$(".startTime").val()+"&endTime="+$(".stopTime").val()+"&type=2", type: "POST"},
            columns: [
                {
                    data: "updateDatetime", title: "日期", width: 80, orderable: false, className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        var id = row._id;
                        var ele = "<span style='display:none;'>" + id + "</span>";

                        if (row.updateDatetime == null || row.updateDatetime == "") {
                            return "";
                        }
                        return row.updateDatetime.split(" ")[0] + ele;
                    }
                },
                {
                    data: "name", title: "ID-场景", width: 80, orderable: false,
                    render: function (data, type, row) {
                        if (row.name == null || row.name == "") {
                            return "";
                        }
                        if (row.taskId == null || row.taskId == "") {
                            return "";
                        }
                        return row.taskId + "-" + row.name;
                    }
                },
                { data: "countUser", title: "场景用户" },
                { data: "pilotShowUV", title: "展示用户", style: "cursor:pointer", },
                { data: "pilotShowPV", title: "曝光量" },
                { data: "pilotClickUV", title: "点击用户" },
                { data: "pilotClickPV", title: "点击量" },
                {
                    title: "展示转化率",
                    render: function (data, type, row) {
                        if (row.pilotClickPV == "0" || row.pilotShowPV == "0") {
                            return "0%";
                        }
                        else {
                            return ((row.pilotClickPV / row.pilotShowPV) * 100).toFixed(2).toString() + "%";
                        }
                    }
                },
                { data: "pilotCloseUV", title: "关闭用户" },
                { data: "pilotClosePV", title: "关闭数" },
                {
                    title: "关闭率",
                    render: function (data, type, row) {
                        if (row.pilotClosePV == "0" || row.apiInvokePV == "0") {
                            return "0%";
                        }
                        else {
                            return ((row.pilotClosePV / row.apiInvokePV) * 100).toFixed(2).toString() + "%";
                        }
                    }
                },
                { data: "apiInvokePV", title: "触发次数" },
                {
                    title: "导航成功率",
                    render: function (data, type, row) {
                        if (row.pilotShowPV == "0" || row.apiInvokePV == "0") {
                            return "0%";
                        }
                        else {
                            return ((row.pilotShowPV / row.apiInvokePV) * 100).toFixed(2).toString() + "%";
                        }
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    // 查询
    obj.evtOnQuery=function() {
        dataTable.ajax.url(getTaskStatistics + "?taskName=" + $("#txtQuery").val()+"&startTime="+$(".startTime").val()+"&endTime="+$(".stopTime").val()+"&type=2");
        dataTable.ajax.reload();
    }
    //获取当前时间，格式YYYY-MM-DD
    obj.getNowFormatDate=function() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    }
    return obj;
}()

function onLoadBody() {
    taskstatistics.initData();
    taskstatistics.initEvent();
}

