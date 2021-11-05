/**
 * Created by dtt on 2017/7/26.
 */

var taskAssessment = function () {
    var getUrl = "queryMarketAssessmentByPage.view",
        dataTable = {}, obj = {};

    /**
     * 数据初始化
     */
    obj.initData = function () {
        var params = "startExeTime=" + $("#startExeTime").val() +
            "&endExeTime=" + $("#endExeTime").val() + "&taskName=" + $("#taskName").val();
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + params,
                type: "POST"
            },
            "aoColumnDefs": [ { "bSortable": false, "aTargets": [ 0 , 1, 3] }],
            columns: [
                {data: "taskName", title: "营销活动名称", width: "10%","orderable": false},
                {data: "marketContent", title: "营销内容", "orderable": false, width: "15%",
                    render: function (data, type, row) {
                        return '<div class="h-Text">'+data+'</div>';
                    }
                },
                {data: "exeTime", title: "上次营销时间", width: "10%"},
                {data: "marketSubmitter", title: "任务提交人", width: "8%"},
                {data: "marketUserTargetNumbers", title: "发送人数", width: "8%"},

                {
                    title: "成功/失败", width: "12%", render: function (data, type, row) {
                    return "<span style='color: blue;'>"+row.marketUserSendSuccessNumbers + "</span>/<span style='color: red;'>" + row.marketUserSendFailNumbers+"</span>";
                }
                },
                {data: "marketUserArriveNumbers", title: "到达人数", width: "8%"},

                {
                    title: "反馈人数/次数", width: "13%", render: function (data, type, row) {
                    return row.marketUserFeedbackPhoneNumbers + "/" + row.marketUserFeedbackCounts;
                }
                },
                {data: "marketUserFeedbackRate", title: "反馈率", width: "8%"},
                {
                    title: "操作", width: "8%",
                    render: function (data, type, row) {
                        var viewUserBtnHtml = "<a  title='查看用户' style='cursor:pointer' onclick='taskAssessment.viewItem(" + JSON.stringify(row.taskId) + " )'>查看用户</a>";
                        return viewUserBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    /**
     * 初始化 事件
     */
    obj.initEvents = function () {
        $("#queryBtn").click(function () {
                verifyDate();
                obj.evtOnQuery();
            }
        );
    }

    /**
     * 查询 事件
     */
    obj.evtOnQuery = function () {
        var startTime = $("#startExeTime").val();
        var endTime = $("#endExeTime").val();
        var taskName = $("#taskName").val();

        var params = "startExeTime=" + startTime + "&endExeTime=" + endTime + "&taskName=" + taskName;
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + params);
    }


    /**
     * 查看用户 事件
     * @param taskId
     */
    obj.viewItem = function (taskId) {
        var $dialog = $("#dialogPrimary").empty();
        $dialog.append("<table class='processTab table' style='width:100%;'></table>");

        var options = {
            ele: $dialog.find('table.processTab'),
            ajax: {url: "queryMarketUserDetailsByPage.view?taskId=" + taskId, type: "POST"},
            columns: [
                {data: "phone", title: "用户号码", width: "15%"},
                {data: "send_time", title: "发送时间", width: "15%"},
                {data: "feed_time", title: "反馈时间", width: "15%"},
                {data: "feed_content", title: "反馈内容", width: "25%"},
                {data: "message", title: "短信内容", width: "30%"}
            ]
        };
        $plugin.iCompaignTable(options);

        layer.open({
            type: 1,
            shade: 0.3,
            title: "查看用户",
            offset: '70px',
            area: ['700px', '500px'],
            content: $dialog,
            closeBtn: 0,
            btn: ["关闭"],
            yes: function (index, layero) {
                layer.close(index);
            }
        });
    }

    /**
     * 时间校验
     */
    function verifyDate() {
        var startTime = $.trim($("#startExeTime").val()),
            endTime = $.trim($("#endExeTime").val());
        if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("起始日期请勿大于截止日期", {icon: 6});
            return;
        }
    }

    return obj;

}()

function onLoadBody() {
    taskAssessment.initData();
    taskAssessment.initEvents();
}





