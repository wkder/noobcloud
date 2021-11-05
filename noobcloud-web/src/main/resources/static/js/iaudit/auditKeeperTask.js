/**
 * Created by hale on 2017年8月17日15:39:02
 */

var auditKeeperTask = function () {
    var getUrl = "queryNeedMeAuditKeeperTask.view", dataTable, obj = {};

    obj.initData = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?taskName=" + $.trim($("#shopTaskName").val()),
                type: "POST"
            },
            columns: [
                {data: "taskId", title: "任务ID", width: 60, className: "dataTableFirstColumns", visible: false},
                {data: "taskName", title: "任务名称", className: "dataTableFirstColumns", width: "20%"},
                {data: "typeName", title: "业务类型"},
                {data: "areaName", title: "来源"},
                {data: "effDate", title: "开始时间"},
                {data: "expDate", title: "结束时间"},
                {data: "ruleName", title: "维系规则"},
                //{data: "welfareName", title: "维系福利"},//当掌柜任务类型为“通用任务”时，无维系福利内容
                {title:"维系福利",
                render:function(data,type,row){
                    if(row.typeName =="通用任务"){
                        return "";
                    }else{
                        return row.welfareName;
                    }
                }},
                {
                    data: "state", title: "状态", width: 60,
                    render: function (data, type, row) {
                        return obj.getTaskState(data);
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-primary btn-preview btn-sm\" title='审批' style='background-color:#00B38B;border-color:#00B38B;color:#fff'  onclick=\"auditKeeperTask.examineItem('" + row.taskId + "','" + row.taskName + "')\">审批</a>";
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
            var taskName = encodeURIComponent($("#shopTaskName").val());
            $plugin.iCompaignTableRefresh(dataTable, getUrl + "?taskName=" + taskName);
        })
    }

    obj.cmTableInit = function () {
        $("#auditDialog").empty();
        $('#auditDialog').cmTable({
            columns: [
                {
                    id: "auditDecision", desc: "审批决定", client: true, type: "select",
                    options: [
                        {id: 1, value: "通过"},
                        {id: 2, value: "拒绝"}
                    ]
                },
                {id: "reason", desc: "原因", rows: 1, type: "textarea"}
            ]
        })
    }

    /**
     * 审批 事件
     */
    obj.examineItem = function (id, name) {
        obj.cmTableInit();
        obj.initDetailDialog($("#viewDialog"));
        obj.initDetailValue(id, "examine", status);
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

            if (decision === "2") {
                if (!reason) {
                    layer.alert("请填写审核拒绝原因", {icon: 5});
                    return;
                }
            }
            var oData = {};
            oData["id"] = $.trim(id);
            oData["operate"] = $.trim(decision);
            oData["reason"] = $.trim(reason);

            globalRequest.iKeeper.auditKeeperTask(true, oData, function (data) {
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
        var $panel = $(".iMarket_keeperTask_Preview").find("div.keeperTaskDetailInfo").clone();
        $dialog.find("div.keeperTaskDetailInfo").remove();
        $dialog.append($panel);
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
            globalRequest.iKeeper.queryKeeperTaskById(true, {taskId: id}, function (data) {
                if (!data) {
                    layer.alert("根据ID查询任务数据失败", {icon: 6});
                    return;
                }
                obj.setDetailElementValue(data, $("#viewDialog div.keeperTaskDetailInfo"));
            }, function () {
                layer.alert("根据ID查询任务数据失败", {icon: 6});
            })
        }
    }

    /**
     * 页面元素赋值-预览
     * @param domain
     * @param $element
     */
    obj.setDetailElementValue = function (domain, $element) {
        $element.find(".detail_taskName").text(domain.taskName || "空");
        $element.find(".detail_taskType").text(obj.getTaskType(domain.typeId) || "空");
        $element.find(".detail_startTime").text(domain.effDate || "空");
        $element.find(".detail_endTime").text(domain.expDate || "空");
        // 维系任务
        $element.find(".detail_appointUser").text(domain.importFileDesc || "空");
        // 归属小组
        var orgObj = domain.businessOrgs, orgNames = "";
        if (orgObj && orgObj.length > 0) {
            obj.setOrgInfo(orgObj, $element);
        }
        // 维系策略
        var ruleObj = domain.rules;
        if (ruleObj && ruleObj.length > 0) {
            for (var i = 0; i < ruleObj.length; i++) {
                if (ruleObj[i].ruleType === 1) {
                    $element.find(".detail_taskRemind").text(ruleObj[i].ruleName || "空");
                    break;
                }
            }
        }
        // 福利产品
        var welfareObj = domain.welfares;
        if (welfareObj && welfareObj.length > 0) {
            obj.setWelfareInfo(welfareObj, $element)
        }
        // 接触渠道
        var channelsObj = domain.channels;
        if (channelsObj && channelsObj.length > 0) {
            obj.setChannelInfo(channelsObj, $element);
        }
    }

    /**
     * 获取任务状态
     * @param type
     * @returns {*}
     */
    obj.getTaskState = function (type) {
        var $element = "<span style='color:{0};'>{1}</span>";
        switch (parseInt(type)) {
            case 0:
                return $element.autoFormat("green", "待审核");
            case 1:
                return $element.autoFormat("green", "审核通过");
            case 2:
                return $element.autoFormat("red", "审核拒绝");
            case 3:
                return $element.autoFormat("red", "已删除");
            case 4:
                return $element.autoFormat("red", "已终止");
            default:
                return $element.autoFormat("blue", "未知");
        }
    }

    /**
     * 获取业务类型
     */
    obj.getTaskType = function (type) {
        switch (parseInt(type)) {
            case 1:
                return "生日维系"
            case 2:
                return "2转4维系"
            case 3:
                return "场景关怀"
            case 4:
                return "优惠到期"
            default:
                return "未知"
        }
    }

    /**
     * 设置归属小组
     */
    obj.setOrgInfo = function (businessOrgs, $element) {
        var orgNames = "";
        for (var i = 0; i < businessOrgs.length; i++) {
            orgNames += businessOrgs[i].orgName + ",";
        }
        $element.find(".detail_orgNames").text(orgNames || "空");
    }

    /**
     * 设置接触渠道
     */
    obj.setChannelInfo = function (channels, $element) {
        var channelNameArray = [];
        $element.find(".detail_content").text("空");
        for (var i = 0; i < channels.length; i++) {
            switch (parseInt(channels[i].channelType)) {
                case 1:
                    $element.find(".detail_content").text(channels[i].channelContent || "空");
                    channelNameArray.push("短信");
                    break;
                case 2:
                    $element.find(".detail_phoneContent").text(channels[i].channelContent || "空");
                    channelNameArray.push("话+ 外呼");
                    break;
                case 3:
                    channelNameArray.push("互联网社交");
                    break;
                case 0:
                    channelNameArray.push("短信,话+ 外呼");
                    break;
            }
        }
        $element.find(".detail_action").text(channelNameArray.join(","))
    }

    /**
     * 设置福利
     * @param welfares
     * @param $element
     */
    obj.setWelfareInfo = function (welfares, $element) {
        // 福利产品
        var welfareNames = "";
        for (var i = 0; i < welfares.length; i++) {
            welfareNames += welfares[i].welfareName + ",";
        }
        $element.find(".detail_productName").text(welfareNames || "空");
    }

    return obj;
}();

function onLoadAuditKeeperTask() {
    $("#taskTypeFilter").hide();
    $("#shopTaskName").show();
    $("#auditShopTaskButton").show();
    auditKeeperTask.initData();
    auditKeeperTask.initEvent();
}