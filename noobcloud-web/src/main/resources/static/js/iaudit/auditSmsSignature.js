/**
 * Created by hale on 2017年8月22日18:00:30
 */

var auditSmsSignature = function () {
    var getUrl = "queryAuditingSmsSignature.view", dataTable, obj = {};

    obj.initData = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl, type: "POST"},
            columns: [
                {data: "currentSmsSignature", title: "当前短信签名", className: "dataTableFirstColumns", width: "20%"},
                {data: "auditingSmsSignature", title: "审核短信签名"},
                {data: "createTime", title: "创建时间"},
                {
                    data: "state", title: "状态", width: 60,
                    render: function (data, type, row) {
                        return obj.getTaskState(data);
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-primary btn-preview btn-sm\" title='审批' style='background-color:#00B38B;border-color:#00B38B;color:#fff'  onclick='auditSmsSignature.examineItem(\"{0}\",\"{1}\",\"{2}\",\"{3}\")'>审批</a>".autoFormat(row.id, row.currentSmsSignature, row.auditingSmsSignature, row.createTime);
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 触发事件
    obj.initEvent = function () {
        // 查询
        $("#auditShopTaskButton").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, getUrl);
        })
    }

    obj.cmTableInit = function () {
        $("#auditDialog").empty();
        $('#auditDialog').cmTable({
            columns: [
                {
                    id: "auditDecision", desc: "审批决定", client: true, type: "select",
                    options: [
                        {id: "approve", value: "通过"},
                        {id: "reject", value: "拒绝"}
                    ]
                },
                {id: "reason", desc: "原因", rows: 1, type: "textarea"}
            ]
        })
    }

    /**
     * 审批 事件
     */
    obj.examineItem = function (id, currentSmsSignature, auditingSmsSignature, createTime) {
        obj.cmTableInit();
        obj.initDetailDialog($("#viewDialog"));
        var domain = {
            id: id,
            currentSmsSignature: currentSmsSignature,
            auditingSmsSignature: auditingSmsSignature,
            createTime: createTime
        }
        obj.setDetailElementValue(domain, $("#viewDialog div.smsSignatureDetailInfo"));
        $plugin.iModal({
            title: '审批活动',
            content: $(".iMarket_audit_Dialog"),
            area: '750px',
            btn: ['确定', '取消'],
        }, function (index) {
            examineItemSave(index, id);
        })
        $("#reason").val("");
        $("#auditDecision option")[0].selected = true;
        $(".layui-layer-content").css("overflow-y", "hidden");
        $("#auditDialog").find(".td-title strong").css("color", "red");

        function examineItemSave(index, id) {
            var currentIndex = index;
            var reason = $.trim($("#reason").val());    // 原因
            var decision = $.trim($("#auditDecision").val());   // 审核

            if (decision === "reject") {
                if (!reason) {
                    layer.alert("请填写审核拒绝原因", {icon: 5});
                    return;
                }
            }
            var oData = {};
            oData["auditId"] = $.trim(id);
            oData["auditResult"] = $.trim(decision);
            oData["auditDesc"] = $.trim(reason);

            globalRequest.iKeeper.auditSmsSignature(true, oData, function (data) {
                if (data.retValue == 0) {
                    layer.close(currentIndex);
                    dataTable.ajax.reload();
                    layer.msg("审批成功", {time: 1000});
                } else {
                    layer.alert("审批失败", {icon: 6});
                }
            })
        }
    }

    /**
     * 初始化对话框-预览
     */
    obj.initDetailDialog = function ($dialog) {
        var $panel = $(".iMarket_SmsSignature_Preview").find("div.smsSignatureDetailInfo").clone();
        $dialog.find("div.smsSignatureDetailInfo").remove();
        $dialog.append($panel);
    }

    /**
     * 页面元素赋值-预览
     * @param domain
     * @param $element
     */
    obj.setDetailElementValue = function (domain, $element) {
        $element.find(".detail_currentSmsSignature").text(domain.currentSmsSignature || "空");
        $element.find(".detail_auditingSmsSignature").text(domain.auditingSmsSignature || "空");
        $element.find(".detail_createTime").text(domain.createTime || "空");
    }

    /**
     * 获取任务状态
     * @param type
     * @returns {*}
     */
    obj.getTaskState = function (type) {
        var $element = "<span style='color:{0};'>{1}</span>";
        switch (parseInt(type)) {
            case 1:
                return $element.autoFormat("green", "待审核");
            case 2:
                return $element.autoFormat("green", "审核通过");
            case 3:
                return $element.autoFormat("red", "审核拒绝");
            default:
                return $element.autoFormat("blue", "未知");
        }
    }

    return obj;
}();

function onLoadAuditSmsSignature() {
    $("#taskTypeFilter").hide();
    $("#shopTaskName").hide();
    $("#auditShopTaskButton").hide();
    auditSmsSignature.initData();
    auditSmsSignature.initEvent();
}