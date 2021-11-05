/**
 * Created by Chris on 2017/9/28.
 */
var auditBranchOpen = function () {
    var getAuditBranchOpenUrl = "queryNeedMeAuditBatchOpenTask.view";
    var dataTable;
    var obj = {};
    var $iMarket = $(".iMarket_body"),
        $taskStatus = $iMarket.find("#taskStatus");
    // 初始化查询栏
    obj.initQueryRow = function () {
        // 任务状态默认为待审核
        $taskStatus.val(1);
        // 初始化日期为当前月
        $('#dateTime').val(new Date().format('yyyy-MM'));
    };
    //初始化dataTable
    obj.dataTableInit = function () {
        var params = "dateTime=" + $("#dateTime").val() + "&status=" + $(".querySelectType").val();
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getAuditBranchOpenUrl + "?" + params,
                type: "POST"
            },
            columns: [
                {data: "id", title: "任务编号", width: 400, className: "dataTableFirstColumns"},
                {data: "taskName", title: "活动名称", width: 300, className: "centerColumns"},
                {data: "productsDesc", title: "叠加产品", width: 800, className: "centerColumns"},
                {data: "appointUsersCount", title: "用户数", width: 600, className: "centerColumns"},
                {data: "executeTime", title: "执行时间", width: 600, className: "centerColumns"},
                {data: "createUserName", title: "提交人", width: 600, className: "centerColumns"},
                {
                    data: "status", title: "任务状态", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 1) {
                            return "<span>待审批</span>";
                        } else if (row.status == 2) {
                            return "<span>已通过</span>";
                        } else if (row.status == 3) {
                            return "<span>未通过</span>";
                        }
                    }
                },
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var buttons = "";
                        var confirmBtnHtml = "<a title='通过'  class='confirmBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='auditBranchOpen.confirmItem(" + row.id + ",0 )' >通过</a>";
                        var cancelBtnHtml = "<a title='拒绝'  class='cancelBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='auditBranchOpen.confirmItem(" + row.id + ",-1)' >拒绝</a>";
                        if (row.status == 1) {//状态为待审批，显示通过和拒绝
                            buttons += confirmBtnHtml + cancelBtnHtml;
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
        var params = "dateTime=" + $("#dateTime").val() + "&status=" + $(".querySelectType").val();
        dataTable.ajax.url(getAuditBranchOpenUrl + "?" + params);
        dataTable.ajax.reload();
    };

    //通过操作
    obj.confirmItem = function (id, result) {
        var rest = '';
        if(result === 0){
            rest = "确认通过么？"
        }else if(result === -1){
            rest = "确认拒绝么？"
        }else{
            return;
        }
        layer.confirm(rest, function (index) {
            layer.close(index);
            globalRequest.iBatchOpen.auditBatchOpenTask(true, {"id": id, "result": result}, function (data) {
                if (data.retValue === 0) {
                    dataTable.ajax.reload();
                    layer.msg("任务审批成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                $html.warning("任务审批异常");
            })
        })

    };

    return obj;
}();

function onLoadBody() {
    auditBranchOpen.initQueryRow();
    auditBranchOpen.dataTableInit();
    auditBranchOpen.initBtn();
}