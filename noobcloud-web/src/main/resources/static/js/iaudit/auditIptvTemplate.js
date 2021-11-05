/**
 * Created by xuan on 2018/5/24.
 */
var auditIptvTemplate = function () {
    var getUrl = "queryNeedMeAuditMessageContents.view", dataTable, obj = {};

    obj.initData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: getUrl, type: "POST"},
            columns: [
                {data: "id", visible: false},
                {data: "name", title: "模版名称", className: "dataTableFirstColumns", width: 100},
                {data: "content", title: "模版内容", width: "20%"},
                {data: "createTime", title: "创建时间", width: 100},
                {data: "remarks", title: "备注", width: 100},
                {
                    data: "status", title: "状态", width: 100,
                    render: function (data, type, row) {
                        return obj.getTaskStatus(data)
                    }
                },
                {
                    title: "操作", width: 150,
                    render: function (data, type, row) {
                        var $examineHtml = "<a title='审批' class='btn btn-warning btn-preview' href='javascript:void(0)' onclick='auditIptvTemplate.examine(\"{0}\",\"{1}\")'><i class='fa fa-user-circle'></i></a>".autoFormat(row.id, row.name);
                        return $examineHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    // 触发事件
    obj.initEvent = function () {
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
                        {id: 0, value: "通过"},
                        {id: 1, value: "拒绝"}
                    ]
                },
                {id: "reason", desc: "原因", rows: 1, type: "textarea"}
            ]
        })
    }

    /**
     * 审批 事件
     */
    obj.examine = function (id, name) {
        obj.cmTableInit();
        obj.initDetailDialog();
        obj.initDetailValue(id, "examine");
        $plugin.iModal({
            title: '审批任务',
            content: $(".iMarket_audit_Dialog"),
            area: '750px',
            btn: ['确定', '取消'],
        }, function (index) {
            examineSave(index, id);
        })
        $("#reason").val("");
        $("#auditDecision option")[0].selected = true;
        $(".layui-layer-content").css("overflow-y", "hidden");
        $("#auditDialog").find(".td-title strong").css("color", "red");

        function examineSave(index, id) {
            var currentIndex = index;
            var reason = $.trim($("#reason").val());    // 原因
            var decision = $.trim($("#auditDecision").val());   // 审核

            if (decision === "1") {
                if (!reason) {
                    layer.alert("请填写审核拒绝原因", {icon: 5});
                    return;
                }
            }
            var oData = {};
            oData["id"] = $.trim(id);
            oData["operate"] = $.trim(decision);
            oData["reason"] = $.trim(reason);

            globalRequest.iPtv.auditMessageContent(true, oData, function (data) {
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
    obj.initDetailDialog = function () {
        var $examine = $("div.iMarket_iptv_template_Preview").find("div.templateDetailInfo").clone();
        $("#viewDialog").empty().append($examine);
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     */
    obj.initDetailValue = function (id, type) {
        if (type == "examine") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }

            globalRequest.iPtv.queryMessagePushContentDetail(true, {contentId: id, showDivHeight: 190}, function (data) {
                if (!data) {
                    layer.alert("根据ID查询任务数据失败", {icon: 6});
                    return;
                }
                var $all = $("#viewDialog div.templateDetailInfo");
                $all.find(".detail_templateName").text(data.name || "空");
                $all.find(".detail_templateContent").text(data.content || "空");
                $all.find(".detail_templateCreateTime").text(data.createTime || "空");
                $all.find(".detail_templateRemarks").text(data.remarks || "空");
                $all.find('.preHtml').html(data.backHtmlContent || '')
            }, function () {
                layer.alert("根据ID查询任务数据失败", {icon: 6});
            })
        }
    }

    /**
     * 获取任务状态
     * @param status
     */
    obj.getTaskStatus = function (status) {
        if (status == -1) {
            return "<i class='fa'>无效</i>";
        } else if (status == 0) {
            return "<i class='fa' style='color: green;'>已暂停</i>";
        } else if (status == 1) {
            return "<i class='fa' style='color: green;'>生效中</i>";
        } else if (status == 2) {
            return "<i class='fa' style='color: green;'>审批通过</i>";
        } else if (status == 3) {
            return "<i class='fa' style='color: red;'>审批中</i>";
        } else if (status == 4) {
            return "<i class='fa' style='color: blue;'>审批拒绝</i>";
        } else if (status == 5) {
            return "<i class='fa' style='color: blue;'>草稿</i>";
        } else if (status == 6) {
            return "<i class='fa' style='color: red;'>终止</i>";
        } else {
            return "<i class='fa'>未知</i>";
        }
    }

    /**
     * 获取任务类型
     */
    obj.getTaskType = function (type) {
        switch (type) {
            case "manual":
                return "手工自建"
            case "jxh":
                return "精细化"
            default:
                return "未知"
        }
    }

    return obj;
}();

function onLoadAuditIptvTemplate() {
    $(".taskType").remove();
    auditIptvTemplate.initData();
    auditIptvTemplate.initEvent();
}