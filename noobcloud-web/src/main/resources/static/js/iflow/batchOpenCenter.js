/**
 * Created by Chris on 2017/9/29.
 */
var batchOpenCenter = function () {
    var getBatchOpenCenterUrl = "queryBatchOpenCenter.view";
    var dataTable = {};
    var obj = {};

    //初始化dataTable
    obj.dataTableInit = function () {
        $('#dateTime').val(new Date().format('yyyy-MM'));
        var params = "dateTime=" + $("#dateTime").val() + "&status=" + $(".querySelectType").val()+"&executeTime="+$("#executeTime").val()+"&taskName="+$(".queryTaskName").val();
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getBatchOpenCenterUrl + "?" + params,
                type: "POST"
            },
            columns: [
                {data: "taskId", title: "任务编号", width: 400, className: "dataTableFirstColumns"},
                {data: "taskName", title: "活动名称", width: 400, className: "centerColumns"},
                {data: "productDesc", title: "叠加产品", width: 800, className: "centerColumns"},
                {
                    data: "status", title: "执行状态", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 2) {//审核成功
                            return "<span>待执行</span>";
                        } else if (row.status == 20) {
                            return "<span>执行中</span>";
                        } else if (row.status == 21) {
                            return "<span>已执行</span>"
                        }else if(row.status == 22){// 执行失败
                            return "<span>执行失败</span>";
                        }
                    }
                },
                {data: "userCount", title: "用户数", width: 600, className: "centerColumns"},
                {
                    title: "成功数", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 21) {
                            return row.successNumber;
                        } else {
                            return "";
                        }
                    }
                },
                {data: "executeTime", title: "执行时间", width: 600, className: "centerColumns"},
                {data: "executeSuccessTime", title: "完成时间", width: 600, className: "centerColumns"},
                {
                    title: "短信下发", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.isSmsSend == 0) {
                            if (row.smsSendStatus == 2) {
                                return "<span>发送中</span>";
                            } else if (row.smsSendStatus == 3) {
                                return "<span>发送完成</span>";
                            } else if (row.smsSendStatus == 0 || row.smsSendStatus == -1) {
                                return "<span>发送失败</span>";
                            } else {
                                return "<span>待下发</span>";
                            }
                        } else if (row.isSmsSend == 1) {
                            return "<span>无下发</span>";
                        }
                    }
                },
                {
                    title: "短信到达", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.smsSendStatus == 3) {
                            return row.smsSendNumber;
                        } else {
                            return "";
                        }
                    }
                },
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var buttons = "";
                        var startBtnHtml = "<a title='启动'  class='startBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='batchOpenCenter.startItem(" + row.id + ",\"" + row.status + "\")' >启动</a>";
                        var suspendBtnHtml = "<a title='中断'  class='suspendBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='batchOpenCenter.suspendItem(" + row.id + ",\"" + row.status + "\")' >中断</a>";
                        var exportBtnHtml = "<a title='导出结果'  class='exportBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='batchOpenCenter.exportItem(" + row.taskId + ")' >导出结果</a>";
                        if (row.status == 2) {//待执行
                            // 中断功能暂未开放
                        } else if (row.status == 20) {//执行中
                            // 中断功能暂未开放
                        } else if (row.status == 21) {//已执行
                            buttons += exportBtnHtml;
                        }else if(row.status == 22){// 执行失败

                        }
                        return buttons;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 初始化按钮
    obj.initBtn = function () {
        $(".searchBtn").click(obj.evtOnRefresh);
    };

    obj.evtOnRefresh = function () {
        //var params = "dateTime=" + $("#dateTime").val() + "&status=" + $(".querySelectType").val();
        var params = "dateTime=" + $("#dateTime").val() + "&status=" + $(".querySelectType").val()+"&executeTime="+$("#executeTime").val()+"&taskName="+$(".queryTaskName").val();
        dataTable.ajax.url(getBatchOpenCenterUrl + "?" + params);
        dataTable.ajax.reload();
    };

    //启动操作
    obj.startItem = function (ids, status) {
        globalRequest.updatebalabala(true, {"id": id, "status": status}, function (data) {
            layer.msg("任务启动成功", {time: 1000});

        }, function () {
            layer.alert("任务启动失败");
        })
    };

    //中断操作
    obj.suspendItem = function (ids, status) {
        globalRequest.updatebalabala(true, {"id": id, "status": status}, function (data) {
            layer.msg("任务中断成功", {time: 1000});

        }, function () {
            layer.alert("任务中断失败");
        })
    };

    //导出结果
    obj.exportItem = function (id) {
        var paramList = [
            ["id", id]
        ];
        obj.exportData("exportBatchOpenResult.view",paramList);
    };

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

    return obj;
}();

function onLoadBody() {
    batchOpenCenter.dataTableInit();
    batchOpenCenter.initBtn();
}