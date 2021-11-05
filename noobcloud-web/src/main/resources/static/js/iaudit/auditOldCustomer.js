/**
 * 老用户活动审批
 * hale
 */
var auditOldCustomer = function () {
    var getUrl = "queryNeedMeAuditOldCustomer.view",
        saveUrl = "auditShopTask.view", dataTable, obj = {};
    var oldCustomer_Constant = {
        targetUser: {
            province: "1",
            city: "2"
        },
        channel: {
            online: "1",
            offline: "2"
        },
        offlineType: {
            ziYing: "1",
            heZuo: "2",
            huangPu: "7"
        },
        loginUserType: {
            province: 1,
            city: 2,
            business: 3
        }
    }

    obj.initData = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?taskName=" + $.trim($("#shopTaskName").val()),
                type: "POST"
            },
            columns: [
                {data: "id", title: "任务ID", width: 60, className: "dataTableFirstColumns", visible: false},
                {data: "taskName", title: "任务名称", className: "dataTableFirstColumns", width: "20%"},
                {
                    data: "createTime", title: "创建时间",
                    render: function (data) {
                        return data.split(' ')[0] + "</br>" + data.split(' ')[1];
                    }
                },
                {
                    data: "taskSource", title: "来源",
                    render: function (data) {
                        return obj.getMarketType(data);
                    }
                },
                {data: "startTime", title: "开始时间"},
                {data: "endTime", title: "结束时间"},
                {
                    data: "status", title: "状态", width: 60,
                    render: function (data, type, row) {
                        if (row.status == 1) {
                            return "<i class='fa' style='color: orange;'>待审批</i>";
                        } else {
                            return "<i class='fa' style='color: green;'>审批完成</i>";
                        }
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-primary btn-preview btn-sm\" title='审批' style='background-color:#00B38B;border-color:#00B38B;color:#fff'  onclick=\"auditOldCustomer.examineItem('" + row.id + "','" + row.taskName + "')\">审批</a>";
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
            var taskName= encodeURIComponent($("#oldCustomerTaskName").val());
            $plugin.iCompaignTableRefresh(dataTable, getUrl + "?taskName=" +taskName);
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
        $("#auditDecision").val("0");
        $(".layui-layer-content").css("overflow-y", "hidden");
        $("#auditDialog").find(".td-title strong").css("color", "red");

        function examineItemSave(index, id) {
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

            globalRequest.iOldCustomer.auditOldCustomer(true, oData, function (data) {
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
        var $panel = $(".iMarket_OldCustomer_Preview").find("div.oldCustomerDetailInfo").clone();
        $dialog.find("div.oldCustomerDetailInfo").remove();
        $dialog.append($panel);
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param status
     */
    obj.initDetailValue = function (id, type, status) {
        if (type == "examine") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.iOldCustomer.previewOldCustomer(true, {id: id}, function (data) {
                if (!data) {
                    layer.alert("根据ID查询炒店数据失败", {icon: 6});
                    return;
                }
                if(data.retValue == -1){
                    layer.alert(data.desc, {icon: 6});
                    return;
                }else if(data.retValue == 0){
                    obj.setDetailElementValue(data.domain, $("#viewDialog div.oldCustomerDetailInfo"));
                }
            }, function () {
                layer.alert("根据ID查询炒店数据失败", {icon: 6});
            })
        }
    }

    /**
     * 页面元素赋值-预览
     * @param domain
     * @param $element
     */
    obj.setDetailElementValue = function (domain, $element) {
        // 活动基本信息
        $element.find(".detail_taskName").text(domain.taskName || "空");
        $element.find(".detail_taskType").text("自建任务");
        $element.find(".detail_startTime").text(domain.startTime || "空");
        $element.find(".detail_endTime").text(domain.endTime || "空");
        $element.find(".detail_marketName").text(domain.marketName || "空");
        $element.find(".detail_marketContent").text(domain.marketContent || "空");
        $element.find(".detail_marketDesc").text(domain.remarks || "空");

        // 活动用户信息
        $element.find(".detail_targetUser").text(domain.areaDesc || "空");
        $element.find(".detail_appiontUser").text(domain.appointUsersDesc || "空");
        $element.find(".detail_blockUser").text(domain.blackUsersDesc || "空");

        // 营销渠道信息
        $element.find(".detail_online").text(domain.marketContentLink || "空");
        $element.find(".detail_offline").text(domain.appointBusinessHallDesc || "空");
        $element.find(".detail_businessType").text(obj.getBusinessType(domain.baseType) || "空");
    }

    /**
     * 获取营销方式
     * @param type
     * @returns {*}
     */
    obj.getMarketType = function (type) {
        switch (type) {
            case "sms":
                return "自建任务";
            case "jxhscene":
                return "精细化实时任务";
            default:
                return "未知";
        }
    }

    /**
     * 获取营业厅类型
     * @param ids
     * @returns {string}
     */
    obj.getBusinessType = function (ids) {
        if (!ids) {
            return "";
        }
        var idsArray = ids.split(",");
        var result = "";
        for (var i = 0; i < idsArray.length; i++) {
            if (idsArray[i] == oldCustomer_Constant.offlineType.ziYing) {
                result += "自营" + ",";
            } else if (idsArray[i] == oldCustomer_Constant.offlineType.heZuo) {
                result += "合作" + ",";
            } else if (idsArray[i] == oldCustomer_Constant.offlineType.huangPu) {
                result += "黄埔" + ",";
            } else {
                result += "未知" + ",";
            }
        }
        return result.substring(0, result.length - 1);
    }

    /**
     * 老用户优惠活动鉴权
     */
    obj.initAudit = function(){
        var userId = globalConfigConstant.loginUser.id;
        globalRequest.iOldCustomer.queryOldCustomerAudit(false,{"userId":userId}, function (data) {
            if(data.retValue == -1){
                // 用户没有权限
                var html = "<div><span class='noPower' style='font-size: large'>抱歉，您暂无老用户优惠活动专题权限，如有疑问请联系管理员</span></div>";
                $("#page-wrapper #coreFrame").empty().append(html);
            }
        },function(){
            var html = "<div><span class='noPower' style='font-size: large'>抱歉，暂时无法获取您的权限信息，如有疑问请联系管理员</span></div>";
            $("#page-wrapper #coreFrame").empty().append(html);
            $html.warning("查询用户权限失败")
        })
    };

    return obj;
}();


function onLoadAuditOldCustomer() {
    $("#taskTypeFilter").hide();
    $("#shopTaskName").hide();
    $("#oldCustomerTaskName").show();
    $("#auditShopTaskButton").show();
    auditOldCustomer.initAudit();
    auditOldCustomer.initData();
    auditOldCustomer.initEvent();
}

