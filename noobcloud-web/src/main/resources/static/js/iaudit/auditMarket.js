/**
 * Created by Administrator on 2016/11/30.
 */
var auditMarket = function () {
    var getUrl = "queryNeedMeAuditMarketingTasks.view",
        dataTable, obj = {};
    var taskMgr_enum = {
        schedule_type: {
            single: "single",
            single_text: "自动调度",
            manu: "manu",
            manu_text: "手动调度"
        },
        isboidSale: {
            yes: "",
            no: ""
        }
    }

    obj.initData = function () {
        obj.dataTableInit();
        obj.cmTableInit();
    }

    // 触发事件
    obj.initEvent = function () {
        // 查询
        $("#auditShopTaskButton").click(obj.evtOnQuery);
    }

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl, type: "POST"},
            columns: [
                {data: "name", title: "任务名称", className: "dataTableFirstColumns"},
                {
                    data: "marketType", title: "来源",
                    render: function (data, type, row) {
                        return obj.getMarketType(data);
                    }
                },
                {
                    data: "businessType", title: "业务类别",
                    render: function (data, type, row) {
                        return obj.getBusinessType(data);
                    }
                },
                {data: "startTime", title: "开始时间"},
                {data: "stopTime", title: "结束时间"},
                {data: "createTime", title: "配置时间"},
                {data: "marketSegmentNames", title: "目标用户", width: "10%"},
                {
                    data: "status", title: "状态", className: "centerColumns", width: "6%",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa'>草稿</i>";
                        } else if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>待审核</i>";
                        } else if (row.status == 2) {
                            return "<i class='fa' style='color: green;'>审核成功</i>";
                        } else if (row.status == 3) {
                            return "<i class='fa' style='color: red;'>审核拒绝</i>";
                        } else if (row.status == 4) {
                            return "<i class='fa' style='color: blue;'>已暂停</i>";
                        } else if (row.status == 5) {
                            return "<i class='fa' style='color: blue;'>已失效</i>";
                        } else if (row.status == 6) {
                            return "<i class='fa' style='color: red;'>已终止</i>";
                        } else if (row.status == 20 || row.status == 30) {
                            return "<i class='fa' style='color: blue;'>营销处理中</i>";
                        } else if (row.status == 35) {
                            return "<i class='fa' style='color: green;'>营销成功</i>";
                        } else if (row.status == 36) {
                            return "<i class='fa' style='color: red;'>营销失败</i>";
                        } else if (row.status == -1) {
                            return "<i class='fa' style='color: red;'>已删除</i>";
                        } else {
                            return "<i class='fa'>未知</i>";
                        }
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-primary btn-preview btn-sm\" style='background-color:#00B38B;border-color:#00B38B;color:#fff' title='审批' onclick=\"auditMarket.evtOnShow('" + row.name + "','" + row.id + "')\">审批</a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.cmTableInit = function () {
        $('#auditDialog').cmTable({
            columns: [
                {
                    id: "auditDecision", desc: "审批决定", client: true, type: "select",
                    options: [
                        {id: 0, value: "通过"},
                        {id: 1, value: "拒绝"}
                    ]
                },
                {
                    id: "reason", desc: "原因", rows: 1,
                    type: "textarea"
                }
            ]
        });
    };

    obj.evtOnQuery = function () {
        $plugin.iCompaignTableRefresh(dataTable, getUrl);
        // $plugin.iCompaignTableRefresh(dataTable, getUrl + "?name=" + $.trim($("#shopTaskName").val()));
    }

    obj.evtOnShow = function (name, id) {
        initShopTaskDetailDialog();
        initShopTaskDetailValue(id);
        $("#shopTaskDetailDialog").hide();
        $("#taskMgrDetailDialog").show();
        $('.iMarket_audit_Dialog').show();
        $("#taskName").val(name);
        layer.open({
            type: 1,
            title: "审批营销任务",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('.iMarket_audit_Dialog'),
            yes: function (index, layero) {
                obj.evtOnSave(index, id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        $("#reason").val("");
        $("#auditDecision option")[0].selected = true;
        $(".layui-layer-content").css("overflow-y", "hidden");
        $("#auditDialog").find(".td-title strong").css("color", "red");
    };

    obj.evtOnSave = function (index, id) {
        var reason = $("#reason").val();//原因
        var decision = $("#auditDecision").val();//审核

        if (decision === "1") {
            if (!reason) {
                layer.alert("请填写审核拒绝原因", {icon: 5});
                return;
            }
        }

        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }

        globalRequest.iScheduling.auditMarketingTask(true, {
            id: id,
            operate: decision,
            reason: reason
        }, function (res) {
            if (res.retValue != 0) {
                layer.alert(res.desc, {icon: 6});
            }
            dataTable.ajax.reload();
            layer.close(index);
            layer.msg(res.desc, {time: 1000});
        }, function () {
            layer.alert('操作数据库失败');
        })
    };

    /**
     * 获取营销方式
     * @param type
     * @returns {*}
     */
    obj.getMarketType = function (type) {
        switch (type) {
            case "sms":
                return "短信";
            case "scenesms":
                return "场景规则短信";
            case "jxhscene":
                return "精细化实时任务";
            case "jxhsms":
                return "精细化周期任务";
            default:
                return "未知";
        }
    }

    /**
     * 获取业务类型
     * @param type
     * @returns {*}
     */
    obj.getBusinessType = function (_type) {
        var type = parseInt(_type)
        switch (type) {
            case 1:
                return "互联网综合业务";
            case 2:
                return "内容营销";
            case 3:
                return "流量经营";
            case 4:
                return "APP场景营销";
            default:
                return "未知";
        }
    }

    // 初始化对话框-预览
    function initShopTaskDetailDialog() {
        var $dialog = $("#viewDialog");
        var $panel = $(".iMarket_preview").find("div.taskMgrDetailInfo").clone();
        $dialog.find("div.taskMgrDetailInfo").remove();
        $dialog.append($panel);
    }

    // 预览页面赋值
    function initShopTaskDetailValue(id) {
        if (!id || id <= 0) {
            layer.alert("未找到该数据，请稍后重试", {icon: 6});
            return;
        }
        globalRequest.iScheduling.queryMarketingTaskDetail(true, {id: id}, function (data) {
            var shopTaskDomainObj = data;
            var $shopTaskDetailInfo = $("#viewDialog div.taskMgrDetailInfo");

            // 任务基本信息
            $shopTaskDetailInfo.find(".detail_id").text(shopTaskDomainObj.id);
            $shopTaskDetailInfo.find(".detail_taskName").text(shopTaskDomainObj.name);
            $shopTaskDetailInfo.find(".detail_businessTypeSelect").text(obj.getBusinessType(shopTaskDomainObj.businessType));
            var type = shopTaskDomainObj.scheduleType;
            var scheduleType = "空";
            if (type == taskMgr_enum.schedule_type.single) {
                scheduleType = taskMgr_enum.schedule_type.single_text;
                $shopTaskDetailInfo.find(".detail_monitoringStartTime").text(shopTaskDomainObj.beginTime || "09:00");
                $shopTaskDetailInfo.find(".detail_monitoringEndTime").text(shopTaskDomainObj.endTime || "18:00");
                $shopTaskDetailInfo.find(".monitoring_row").show();
            } else if (type == taskMgr_enum.schedule_type.manu) {
                scheduleType = taskMgr_enum.schedule_type.manu_text;
            }
            $shopTaskDetailInfo.find(".detail_timerSelect").text(scheduleType);
            $shopTaskDetailInfo.find(".detail_startTime").text(shopTaskDomainObj.startTime || "空");
            $shopTaskDetailInfo.find(".detail_endTime").text(shopTaskDomainObj.stopTime || "空");
            $shopTaskDetailInfo.find(".detail_boidSale").text(shopTaskDomainObj.isBoidSale == 1 ? "是" : "否");
            $shopTaskDetailInfo.find(".detail_intervalInSeconds_title").text(shopTaskDomainObj.isBoidSale == 1 ? "分组间隔：" : "时间间隔：");
            $shopTaskDetailInfo.find(".detail_intervalInSeconds").text(shopTaskDomainObj.sendInterval ? shopTaskDomainObj.sendInterval + "天" : "空");
            // $shopTaskDetailInfo.find(".detail_repeatStrategy").text(!shopTaskDomainObj.repeatStrategy ? "空" : "营销频次剔重（" + shopTaskDomainObj.repeatStrategy + "）天");
            $shopTaskDetailInfo.find(".detail_areaNames").text(shopTaskDomainObj.areaNames || "空");
            $shopTaskDetailInfo.find(".detail_filterBlack").text(shopTaskDomainObj.filterBlack == null ? "空" : (shopTaskDomainObj.filterBlack == 0 ? "是" : "否" ));
            $shopTaskDetailInfo.find(".detail_remarks").text(shopTaskDomainObj.remarks || "空");

            //
            $shopTaskDetailInfo.find(".detail_segmentNames").text(shopTaskDomainObj.marketSegmentNames || "空");
            $shopTaskDetailInfo.find(".detail_segmentCounts").text(shopTaskDomainObj.marketSegmentUserCounts || "空");
            // $shopTaskDetailInfo.find(".detail_number").text(shopTaskDomainObj.marketUserCountLimit || "空");

            $shopTaskDetailInfo.find(".marketTypeValue").hide();

            var marketTypeValue = shopTaskDomainObj.marketType;
            if (marketTypeValue == "scenesms") {
                // 场景规则显示
                $shopTaskDetailInfo.find(".marketTypeValue").show();
                $shopTaskDetailInfo.find(".detail_marketTypeValue").text(shopTaskDomainObj.sceneSmsName || "空");
            }
            $shopTaskDetailInfo.find(".detail_marketType").text(obj.getMarketType(marketTypeValue));
            $shopTaskDetailInfo.find(".detail_AccessNumber").text(shopTaskDomainObj.accessNumber || "空");
            $shopTaskDetailInfo.find(".detail_Content").text(shopTaskDomainObj.marketContent || "空");
            $shopTaskDetailInfo.find(".detail_TestPhones").text(shopTaskDomainObj.testPhones || "空");
        }, function () {
            layer.alert("根据ID查询炒店数据失败", {icon: 6});
        });

    }

    return obj;
}();

function onLoadAuditMarket() {
    $("#taskTypeFilter").hide();
    $("#shopTaskName").hide();
    $("#auditShopTaskButton").hide();
    auditMarket.initData();
    auditMarket.initEvent();
}

