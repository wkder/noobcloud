var auditOffNetSms = function () {
    var getUrl = "queryNeedMeAuditOffnetSmsTasks.view",
        dataTable, obj = {}, urlParams = "?taksName=" + "&status=" + "&taskId=" + "&auditResult=" + "&remarks=";

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
            ajax: {url: getUrl+urlParams, type: "POST"},
            columns: [

                {data: "taskName", title: "任务名称", className: "dataTableFirstColumns",width:150},
                {data: "createUserName", title: "创建者", className: "centerColumns", width: 150},
                {data: "createTime", title: "创建时间", className: "centerColumns", width: 150},
                {data: "content", title: "短信内容", className: "centerColumns"},
                {data: "phoneCount", title: "号池数量", className: "centerColumns", width: 150},
                {data: "status", title: "任务状态", className: "centerColumns", width: 150,
                    render: function(data) {
                        return "<i class='fa' style='color: green;'>待审核</i>";
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-primary btn-preview btn-sm\" style='background-color:#00B38B;border-color:#00B38B;color:#fff' title='审批' onclick=\"auditOffNetSms.evtOnShow('" + row.taskName + "','" + row.id + "')\">审批</a>"
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
            title: "审批异网短信任务",
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

        var $offNetSmsDetailInfo = $("#viewDialog div.offNetSmsDetailInfo");
        var taskName = $offNetSmsDetailInfo.find('.pre_taskName').text();
        var page = $('.pagination').find('li.active a').text()
        globalRequest.iScheduling.auditOffnetSmsTask(true, {
            taskId: id,
            auditResult: decision,
            remarks: reason,
            taskName: taskName,
            start: (parseInt(page) - 1) * 10,
            length: 10
        }, function (res) {
            if (res.retValue != 0) {
                layer.alert(res.desc, {icon: 6});
            }
            dataTable.ajax.reload();
            layer.close(index);
            layer.msg('异网短信任务审核成功', {time: 1000});
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
        var $panel = $(".iMarket_offNetSms_Preview").find("div.offNetSmsDetailInfo").clone();
        $dialog.find("div.offNetSmsDetailInfo").remove();
        $dialog.append($panel);
    }

    // 预览页面赋值
    function initShopTaskDetailValue(id) {
        if (!id || id <= 0) {
            layer.alert("未找到该数据，请稍后重试", {icon: 6});
            return;
        }
        globalRequest.iScheduling.queryOffnetSmsTaskByID(true, {id: id}, function (data) {
            var $offNetSmsDetailInfo = $("#viewDialog div.offNetSmsDetailInfo");
            $offNetSmsDetailInfo.find('.pre_taskName').text(data.taskName)
            $offNetSmsDetailInfo.find('.pre_smsContent').text(data.content)
            $offNetSmsDetailInfo.find('.pre_createTime').text(data.createTime)
            $offNetSmsDetailInfo.find('.pre_createUserName').text(data.createUserName)
            $offNetSmsDetailInfo.find('.detail_appintUser_tableName').text(data.tableName)
            $offNetSmsDetailInfo.find('.detail_phoneCount').text(data.phoneCount)
        },function () {
            layer.alert("根据ID查询异网短信数据失败", {icon: 6});
        });

    }

    return obj;
}();

function onLoadAuditoffNetSmsTask() {
    $("#taskTypeFilter").hide();
    $("#shopTaskName").hide();
    $("#auditShopTaskButton").hide();
    auditOffNetSms.initData();
    auditOffNetSms.initEvent();
}

