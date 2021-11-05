var shopTask = function () {
    var action, status, dataTable, obj = {},
        appointFileId, blackFileId, province = "", loginUser = {};

    /**
     * 主页table初始化
     * @param data
     */
    obj.dataTableInit = function (data) {
        status = data;
        var loginUserId = $("#loginUser").val();
        var visible = false;
        if (status === "2" && loginUser.businessHallIds !== "") {
            visible = true;
        }
        var option = {
            ele: $("#dataTable"),
            ajax: {url: obj.methods.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "id", title: "任务ID", className: "dataTableFirstColumns", visible: false},
                {data: "taskName", width: 80, title: "任务名称"},
                {
                    data: "taskType", width: 80, title: "来源", className: "centerColumns",
                    render: function (data, type, row) {
                        return obj.methods.getTaskType(data, row.id);
                    }
                },
                {data: "businessName", width: 80, title: "业务类型", className: "centerColumns"},
                {data: "startTime", width: 80, title: "开始时间", className: "centerColumns"},
                {data: "stopTime", width: 80, title: "结束时间", className: "centerColumns"},
                {data: "createTimeStr", width: 80, title: "配置时间", className: "centerColumns"},
                {data: "baseId", title: "炒店ID", visible: false},
                {data: "baseName", width: 100, title: "监控炒店", className: "centerColumns", visible: visible},
                {
                    data: "marketUser", width: 100, title: "目标用户", className: "centerColumns",
                    render: function (data) {
                        return obj.methods.getMarketUser(data);
                    }
                },
                {
                    data: "status", width: 80, title: "状态", className: "centerColumns",
                    render: function (data, type, row) {
                        return obj.methods.getTaskStatus(data, row.id);
                    }
                },
                {
                    width: 160, className: "centerColumns", title: "操作",
                    render: function (data, type, row) {
                        return obj.methods.getTaskAction(row, loginUserId);
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };
    /**
     * 触发事件
     */
    obj.initEvent = function () {
        // 查询
        $("#shopTaskButton").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
        });
        // 新建
        $("#createShopTaskButton").click(function () {
            obj.createShopTask();
        });
        // 导出
        $("#exportShopTaskButton").click(function () {
            var shopTaskId = $.trim($("#shopTaskId").val()),
                shopTaskName = $.trim($("#shopTaskName").val()),
                shopTaskStatus = $.trim($("#shopTaskStatus").val()),
                shopTaskBaseCode = $.trim($("#shopTaskBaseCode").val()),
                shopTaskBaseName = $.trim($("#shopTaskBaseName").val()),
                dateTime = $.trim($("#dateTime").val()),
                taskType = $.trim($("#taskType").val()),
                businessId = $.trim($("#businessId").val());
            var oData = [
                ["shopTaskId", shopTaskId],
                ["shopTaskName", shopTaskName],
                ["shopTaskStatus", shopTaskStatus],
                ["taskType", taskType],
                ["businessId", businessId],
                ["shopTaskBaseCode", shopTaskBaseCode],
                ["shopTaskBaseName", shopTaskBaseName],
                ["dateTime", dateTime]
            ];
            obj.exportData("exportShopTask.view", oData);
        });
    };
    /**
     * 新建炒店任务
     */
    obj.createShopTask = function () {
        action = "create";
        obj.methods.initDialog(1);
        obj.initShopTaskElement("create");
        $plugin.iModal({
            title: '新建炒店任务',
            content: $("#createShopTaskDialog"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "create");
        })
    };
    /**
     * 编辑炒店任务
     * @param id
     * @param tstatus
     */
    obj.editShopTask = function (id, tstatus) {
        if (parseInt(tstatus) === 2) {
            layer.alert("审核成功的任务无法编辑", {icon: 6});
            return;
        }
        if (parseInt(tstatus) === 6) {
            layer.alert("营销中的任务无法编辑", {icon: 6});
            return;
        }
        obj.methods.initDialog(1);
        obj.initShopTaskElement("update");
        obj.initShopTaskValue(id);
        $plugin.iModal({
            title: '编辑炒店任务',
            content: $("#createShopTaskDialog"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    };
    /**
     * 预览任务
     * @param id
     */
    obj.viewShopTask = function (id) {
        obj.methods.initDialog(2);
        obj.initShopTaskDetailValue(id, "preview", null, null);
        $("#taskMgrDetailDialog").hide();
        $("#shopTaskDetailDialog").show();
        $plugin.iModal({
            title: '预览炒店任务',
            content: $("#commonPage"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    };
    /**
     * 删除炒店任务
     * @param id
     * @param tstatus
     */
    obj.deleteShopTask = function (id, tstatus) {
        if (parseInt(tstatus) === 2) {
            layer.alert("审核成功的任务无法删除", {icon: 6});
            return;
        }
        layer.confirm("确定删除？", {icon: 3, title: '提示'}, function () {
            globalRequest.deleteShopTaskById(true, {"id": id}, function (data) {
                if (data.retValue === 0) {
                    $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                    layer.msg("删除成功", {timeout: 800});
                } else {
                    layer.alert("系统异常", {icon: 6});
                }
            });
        });
    };

    /**
     * 完善短信内容（上海版本适用）
     * @param id
     * @param taskStatus
     * @author wtt
     */
    obj.completeSmsContent = function (id, taskStatus) {

        var shopTaskDomainObj = {};
        if (parseInt(taskStatus) === 2) {
            layer.alert("审核成功的任务无法修改短信内容", {icon: 6});
            return;
        }
        if (parseInt(taskStatus) === 6) {
            layer.alert("营销中的任务无法编辑", {icon: 6});
            return;
        }
        // region 初始化弹窗
        initDialog();
        // endregion

        //  region 初始化弹窗内容
        initDialogData();
        // endregion

        $plugin.iModal({
            title: "炒店短信内容",
            content: $("#createShopTaskDialog"),
            area: '750px',
            btn: ['提交', '取消']
        }, function (index) {
            submit(index)
        });

        function submit(index) {
            $html.loading(true);
            var $obj = $("#createShopTaskDialog"),
                $marketContentExtend = $obj.find(".marketContentExtend"),
                $replaceTexts = $obj.find(".replaceText");
            if (province === $system.PROVINCE_ENUM.SH && $marketContentExtend.find(".setReplaceText").is(":checked")) {
                var replaceTextValues = [];
                $replaceTexts.each(function () {
                    replaceTextValues.push($(this).val());
                });
                shopTaskDomainObj["marketContentExtend"] = replaceTextValues.join("&");
            }

            // 更新
            globalRequest.updateShopTaskContentExtend(true, shopTaskDomainObj, function (data) {
                if (data.retValue === 0) {
                    $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                    layer.close(index);
                    layer.msg("提交成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
                $html.loading(false);
            });
        }

        // 初始化弹窗内容
        function initDialogData() {
            var $obj = $("#createShopTaskDialog");
            // 隐藏模板选择按钮
            $obj.find("button.marketContentButton").hide();

            globalRequest.queryShopTaskById(true, {id: id}, function (data) {
                shopTaskDomainObj = data.shopTaskDomain;

                $obj.find(".marketContentText").val(shopTaskDomainObj.marketContentText);
                $obj.find(".marketUrl").val(shopTaskDomainObj.marketUrl);
                $obj.find(".marketContentId").val(shopTaskDomainObj.marketContentId);

                var marketContentExtend = shopTaskDomainObj.marketContentExtend;
                var $replaceTexts = $obj.find(".marketContentExtend .replaceTextBox");
                if (marketContentExtend) {
                    $obj.find(".setReplaceText")[0].checked = true;
                    var textExtends = marketContentExtend.split("&");
                    for (var i = 0; i < textExtends.length; i++) {
                        $replaceTexts.find(".replaceText.replaceText-" + (i + 1)).val(textExtends[i])
                    }
                }

                // 短信内容置灰不给修改
                $obj.find(".marketContentText")[0].disabled = true;

            }, function () {
                layer.alert("根据ID查询炒店数据失败", {icon: 6});
            });
        }


        // 初始化弹窗
        function initDialog() {
            var $dialog = $("#createShopTaskDialog");
            var $var1 = $(".iMarket_shopTask_Content").find("div.shopTaskInfo").find("div.marketChannelInfo").find(".marketContentTextPanel").clone();
            var $var2 = $(".iMarket_shopTask_Content").find("div.shopTaskInfo").find("div.marketChannelInfo").find(".marketContentExtend").clone();
            $dialog.empty();
            $dialog.append($var1);
            $dialog.append($var2);
            // 控制样式
            $dialog.find(".row").css("margin", "16px");
        }


    }
    /**
     * 执行炒店任务
     * @param id
     * @param baseId
     * @param baseName
     * @param status
     */
    obj.manualItem = function (id, baseId, baseName, status) {
        obj.methods.initDialog(2);
        obj.initShopTaskDetailValue(id, "execute", baseId, baseName);
        $("#shopTaskDetailDialog").show();
        $plugin.iModal({
            title: "执行炒店任务，执行炒店：<span style='font-size: 16px;opacity: 0.5'>" + baseName + "</span>",
            content: $("#commonPage"),
            area: '750px',
            btn: ['执行', '取消']
        }, function (index) {
            obj.manualItemSave(id, baseId, status, index);
        })
    };
    /**
     * 执行炒店任务 保存事件
     * @param id
     * @param baseId
     * @param status
     * @param index
     */
    obj.manualItemSave = function (id, baseId, status, index) {
        globalRequest.manualShopTask(true, {id: id, baseIds: baseId, status: status}, function (data) {
            if (data.retValue === 0) {
                $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                layer.msg("发送营销请求成功", {time: 1000});
                layer.close(index);
            } else {
                layer.alert(data.desc, {icon: 6});
                layer.close(index);
            }
        }, function () {
            layer.alert('网络连接失败，请重试');
        })
    };
    /**
     * 暂停事件
     * @param id
     * @param baseId
     * @param taskName
     */
    obj.stopItem = function (id, baseId, taskName) {
        layer.confirm('确认暂停炒店任务:' + taskName + "?", function () {
            globalRequest.stopShopTask(true, {id: id, baseId: baseId}, function (data) {
                if (data.retValue == 0) {
                    $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                    layer.msg("暂停营销任务成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }), function () {
                layer.alert('操作数据库失败');
            };
        });
    };
    /**
     * 催单事件
     * @param id
     * @param taskName
     */
    obj.reminderItem = function (id, taskName) {
        layer.confirm('确认提醒审批人审批任务:' + taskName + "?", function () {
            globalRequest.reminderItem(true, {id: id, taskName: taskName}, function (data) {
                if (data.retValue == 0) {
                    $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                    layer.msg("提醒审批任务成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }), function () {
                layer.alert('提醒审批失败');
            };
        });
    };
    /**
     * 一键终止事件
     * @param id
     * @param taskName
     */
    obj.pauseItem = function (id, taskName) {
        layer.confirm('确认暂停所有营业厅该任务：' + taskName + "? 该操作不可恢复！！", function () {
            globalRequest.pauseItem(true, {id: id, taskName: taskName}, function (data) {
                if (data.retValue == 0) {
                    $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                    layer.msg("终止任务成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }), function () {
                layer.alert('终止任务失败');
            };
        });
    };
    /**
     * 下载模板
     * @param fileId
     * @param fileName
     */
    obj.downFileModel = function (fileId, fileName) {
        var paramList = [
            ["fileId", fileId],
            ["fileName", fileName]
        ];
        obj.exportData("getShopTaskNumFileDown.view", paramList);
    };
    /**
     * 导出数据
     * @param url
     * @param params
     */
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
    /**
     * 显示任务池来源字段浮动窗口
     * @param element
     * @param id
     */
    obj.hoverBaseNames = function (element, id) {
        if (id <= 0) {
            return;
        }
        globalRequest.queryShopTaskByIdForHover(true, {id: id}, function (data) {
            if (data && data.shopTaskDomain) {
                var baseNamsArray = data.shopTaskDomain.baseNames.split(",");
                var baseCodesArray = data.shopTaskDomain.baseCodes.split(",");
                var $tips = baseNamsArray[0] + "[" + baseCodesArray[0] + "]"
                for (var i = 1; i < baseNamsArray.length; i++) {
                    $tips += ("," + baseNamsArray[i] + "[" + baseCodesArray[i] + "]");
                }
                layer.tips($tips, $(element), {
                    tips: [1, '#00B38B'],
                    time: 2500
                });
            }
        })
    };
    /**
     * 显示审核拒绝原因浮动窗口
     * @param element
     * @param id
     */
    obj.hoverDecisionDesc = function (element, id) {
        if (id <= 0) {
            return;
        }
        globalRequest.iShop.queryShopTaskAuditReject(true, {taskId: id}, function (data) {
            if (data && data.reason) {
                layer.tips(data.reason, $(element), {
                    tips: [1, '#00B38B'],
                    time: 1500
                });
            }
        })
    };
    /**
     * 初始化对话框元素
     * @param action
     */
    obj.initShopTaskElement = function (action) {
        var shopTaskDomain = {};
        var $dialog = $("#createShopTaskDialog");
        var $panel = $dialog.find("div.shopTaskInfo");
        // 第一页元素
        var $taskBaseInfo = $panel.find("div.taskBaseInfo");
        var $id = $panel.find(".id");
        var $taskName = $panel.find(".taskName");
        var $startTime = $panel.find(".startTime");
        var $stopTime = $panel.find(".stopTime");
        var $baseAreaIdSelect = $panel.find(".baseAreaId");
        // var $baseAreaTypeSelect = $panel.find(".baseAreaType");
        var $baseName = $panel.find(".baseName");
        var $baseId = $panel.find(".baseId");
        var $locationTypeId = $panel.find(".locationTypeId");
        var $taskDesc = $panel.find(".taskDesc ");
        var $baseMessage = $panel.find(".baseMessage");
        var $businessId = $panel.find(".businessId");
        // 第二页元素
        var $marketUserInfo = $panel.find("div.marketUserInfo");
        var $segmentPanel = $panel.find(".segmentPanel");
        var $monitorTypePanel = $panel.find(".monitorTypePanel");
        var $marketUserPanel = $panel.find(".marketUserPanel");
        var $segmentBtn = $panel.find(".segmentBtn");
        var $segmentNames = $panel.find(".segmentNames");
        var $segmentIds = $panel.find(".segmentIds");
        var $marketUser = $panel.find("div.marketUser");
        var $appointUsers = $panel.find(".appointUsers");
        var $appointUserNum = $panel.find(".appointUserNum");
        var $blackUsers = $panel.find(".blackUsers");
        var $blackUserNum = $panel.find(".blackUserNum");
        var $appointUsersPanel = $panel.find(".appointUsersPanel");
        var $blackUsersPanel = $panel.find(".blackUsersPanel");
        // 第三个页面
        var $marketChannelInfo = $panel.find("div.marketChannelInfo");
        var $userSelect = $panel.find(".user-select");
        var $accessNumber = $panel.find(".accessNumber");
        var $marketContentTextPanel = $panel.find(".marketContentTextPanel");
        var $marketContentText = $panel.find(".marketContentText");
        var $marketContentButton = $panel.find(".marketContentButton");
        var $marketUrl = $panel.find(".marketUrl");
        var $marketContentId = $panel.find(".marketContentId");
        var $numberSmsContentPanel = $panel.find(".numberSmsContentPanel");
        var $numberSmsContentText = $panel.find(".numberSmsContentText");
        var $numberSmsContentBtn = $panel.find(".numberSmsContentBtn");
        var $numberSmsContentId = $panel.find(".numberSmsContentId");
        var $smsSignaturePanel = $panel.find('.smsSignaturePanel');
        var $autographRadio = $panel.find("[name='radioAutograph']");
        $($autographRadio[0]).get(0).checked = true;
        var $sendInterval = $panel.find(".sendInterval");
        var $marketLimit = $panel.find(".marketLimit");
        var $isSendReport = $panel.find(".isSendReport");
        var $reportPhone = $panel.find(".reportPhone");
        var $marketContentExtend = $panel.find(".marketContentExtend");
        var $replaceTexts = $panel.find(".replaceText");
        // 第四个页面
        obj.methods.initDialog(2);
        var $marketViewInfo = $panel.find("div.marketViewInfo");
        var $marketDetailInfo = $("#shopTaskDetailDialog").find("div.shopTaskDetailInfo");
        var $nextStep = $panel.find("span.next");
        var $preStep = $panel.find("span.pre");
        var $confirmStep = $panel.find("span.confirm");
        var $flowStepA = $panel.find("div.flowStepContainer div.flowStep div.flowStepA");
        var $flowStepB = $panel.find("div.flowStepContainer div.flowStep div.flowStepB");
        var $flowStepC = $panel.find("div.flowStepContainer div.flowStep div.flowStepC");
        var $flowStepD = $panel.find("div.flowStepContainer div.flowStep div.flowStepD");
        var $operateData = $panel.find("div.data");

        initProvince();
        // 初始化监控的炒店
        initBaseAreas(action);
        // 初始化业务类型
        initBusinessType();
        // 初始化指定用户文件
        initAppointUsers();
        // 初始化免打扰用户文件
        initBlackUsers();
        // 初始化接收发送任务报告
        initReportElement();
        // 初始化接入号选择
        initSmsAccessNumberSelect(action);
        // 初始化接触渠道
        initChannel();
        // 加载营销内容
        initMarketContent();
        // 加载数字短信内容
        initNumberSmsContent();
        // 初始化短信签名
        // initAutograph();
        // 初始化上一步下一步事件
        initEvent(action);

        function initProvince() {
            if (province === $system.PROVINCE_ENUM.SH) {
                $segmentPanel.show();
                $monitorTypePanel.show();
                $marketUserPanel.hide();
                $appointUsersPanel.hide();  // 指定用户
                $blackUsersPanel.hide();    // 免打扰用户
                initSegments();
                $userSelect.hide();
                $marketLimit.val("100000");
                $marketDetailInfo.find(".detail_segment_row").show();
                $marketDetailInfo.find(".detail_marketUserText").text("监控类型");
                $baseAreaIdSelect.attr("disabled", true);
            } else {
                $marketContentExtend.remove();
            }
        }

        // 初始化业务类型
        function initBusinessType() {
            globalRequest.queryShopBusinessType(false, {}, function (data) {
                $businessId.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            $businessId.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            $businessId.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                }
            }, function () {
                layer.alert("系统异常，获取营销接入号失败", {icon: 6});
            });
        }

        function initSegments() {
            $segmentBtn.click(function () {
                var setting = {
                    check: {
                        enable: true,
                        chkStyle: 'radio',
                        radioType: "all"
                    },
                    view: {
                        dblClickExpand: true,
                        selectedMulti: true
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    }
                };

                globalRequest.iScheduling.queryAllModels(true, {}, function (data) {
                    var ids = $segmentIds.val().split(",");
                    var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
                    setParentChecked(ids, data);

                    function setParentChecked(modelIds, data) {
                        if (modelIds && modelIds.length > 0) {
                            for (var i = 0; i < modelIds.length; i++) {
                                for (var j = 0; j < data.length; j++) {
                                    if (data[j].id == modelIds[i]) {
                                        data[j]["checked"] = true;
                                        data[j]["open"] = true;
                                        setParentChecked([data[j].pId], data);
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    result = data;

                    $.fn.zTree.init($("#treePrimary"), setting, result);

                    $plugin.iModal({
                        title: '选择客户群',
                        content: $("#dialogTreePrimary"),
                        area: '750px'
                    }, function (index) {
                        var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                        var checkedNodes = zTree.getCheckedNodes(true);
                        var checkedNodesLength = checkedNodes.length;
                        if (checkedNodesLength > 0) {
                            var names = [], ids = [], moreNodes = 0;
                            for (var i = 0; i < checkedNodesLength; i++) {
                                if (!checkedNodes[i].isParent) {
                                    moreNodes++;
                                    ids.push(checkedNodes[i].id);
                                    names.push(checkedNodes[i].name);
                                }
                            }
                            if (moreNodes > 1) {
                                layer.msg("最多选择1个客户群")
                                return;
                            }
                            $segmentNames.val(names.join(","));
                            $segmentIds.val(ids.join(","));
                            layer.close(index);
                        } else {
                            $segmentNames.val("");
                            $segmentIds.val("");
                            layer.close(index);
                        }
                    }, function (index) {
                        layer.close(index);
                    })
                }, function (data) {
                    layer.alert("查询客户群失败", {icon: 6});
                })
            })
        }

        function initReportElement() {
            $reportPhone.val(loginUser.telephone);
            $isSendReport.change(function () {
                if ($(this).val() == "1") {
                    $reportPhone.parent().removeClass("hide");
                } else {
                    $reportPhone.parent().addClass("hide");
                }
            })
        }

        function initSmsAccessNumberSelect(type) {
            var paras = {};
            if (province === $system.PROVINCE_ENUM.SH) {
                paras = {actionType: type, areaCode: 99999};
            } else {
                paras = {actionType: type, areaCode: loginUser.areaCode};
            }
            globalRequest.querFixedAccessNum(false, paras, function (data) {
                $accessNumber.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            $accessNumber.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            $accessNumber.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                }
            }, function () {
                layer.alert("系统异常，获取营销接入号失败", {icon: 6});
            });
        }

        function initChannel() {
            $marketChannelInfo.on('click', '.user-select span', function () {
                var type = $(this).data("type");
                if (!type) {
                    layer.alert("加载客户接触渠道数据异常", {icon: 6});
                    return
                }

                if (type === "phoneCall") {
                    return "";
                }
                $(this).addClass("active").siblings("span").removeClass("active");
                switch (type) {
                    case "sms": // 短信渠道
                        $accessNumber.val('106557392');
                        $numberSmsContentPanel.hide();
                        $smsSignaturePanel.show();
                        $marketContentTextPanel.show();
                        break;
                    case "numberSms":   // 数字短信渠道
                        $accessNumber.val('106557392');
                        $smsSignaturePanel.hide();
                        $marketContentTextPanel.hide();
                        $numberSmsContentPanel.show();
                        break;
                    case "phoneCall":   // 话+渠道
                        break;
                }
            })
        }

        function initMarketContent() {
            $dialog.find(".marketContentButton").click(function () {
                initContentElement();
                onLoadContentBody();
                $plugin.iModal({
                    title: '选择短信内容',
                    content: $("#marketContentDialog"),
                    area: '750px'
                }, function (index) {
                    var $selected = $("#marketContentDialog .contentInfoSegment .contentInfo tbody tr").filter(".silver");
                    $marketContentText.val($selected.find(".content").text());
                    $marketUrl.val($selected.find(".url").text());
                    $marketContentId.val($selected.find(".id").text());
                    layer.close(index);
                })
            });

            function initContentElement() {
                var $contentDialog = $("#marketContentDialog");
                var $contentPanel = $(".iMarket_shopTask_Content .contentInfoSegment").clone();
                $contentDialog.find("div.contentInfoSegment").remove();
                $contentDialog.append($contentPanel);

                // 搜索事件
                $("#marketContentDialog .contentInfoSegment").find("#contentInfoButton").click(function () {
                    onLoadContentBody();
                })
            }

            function onLoadContentBody() {
                var qryContentInfo = $("#marketContentDialog .contentInfoSegment").find(".qryContentInfo").val();
                var qryKeyInfo = $("#marketContentDialog  .contentInfoSegment").find(".qryKeyInfo").val();
                var pageInfo = {
                    itemCounts: 0,
                    items: {}
                };

                var paras = {
                    curPage: 1,
                    countsPerPage: 10,
                    qryContentInfo: qryContentInfo,
                    qryKeyInfo: qryKeyInfo
                };

                globalRequest.queryContentByPage(true, paras, function (data) {
                    pageInfo.itemCounts = data.itemCounts;
                    pageInfo.items = data.items;
                    createPageBody();
                    initPagination();
                }, function () {
                    layer.alert("加载营销内容数据异常", {icon: 6});
                });

                function initPagination() {
                    $("#marketContentDialog .contentInfoSegment .contentInfo .pagination").pagination({
                        items: pageInfo.itemCounts,
                        itemsOnPage: 10,
                        displayedPages: 4,
                        cssStyle: 'light-theme',
                        prevText: "<上一页",
                        nextText: "下一页>",
                        onPageClick: function (pageNumber) {
                            paras.curPage = pageNumber;
                            globalRequest.queryContentByPage(true, paras, function (data) {
                                pageInfo.itemCounts = data.itemCounts;
                                pageInfo.items = data.items;
                                createPageBody();
                            });
                        }
                    });
                }

                function createPageBody() {
                    var html = "<tr><td colspan='3'><div class='noData'>暂无相关数据</div></td></tr></li>";
                    if (pageInfo.items.length > 0) {
                        var html = template('contentInfo', {list: pageInfo.items});
                    }
                    $("#marketContentDialog .contentInfoSegment .contentInfo tbody tr").remove();
                    $("#marketContentDialog .contentInfoSegment .contentInfo tbody").append(html);
                    $("#marketContentDialog .contentInfoSegment .contentInfo tbody tr").click(function () {
                        $(this).siblings().removeClass("silver");
                        $(this).toggleClass("silver");
                    })
                };
            }
        }

        function initNumberSmsContent() {
            $dialog.find(".numberSmsContentBtn").click(function () {
                initContentElement();
                onLoadContentBody();
                $plugin.iModal({
                    title: '选择短信内容',
                    content: $("#numberSmsContentDialog"),
                    area: '750px'
                }, function (index) {
                    var $selected = $("#numberSmsContentDialog .numberSmsContentInfoSegment .contentInfo tbody tr").filter(".silver");
                    $numberSmsContentText.val($selected.find(".content").text());
                    $numberSmsContentId.val($selected.find(".id").text());
                    layer.close(index);
                })
            });

            function initContentElement() {
                var $contentDialog = $("#numberSmsContentDialog");
                var $contentPanel = $(".iMarket_shopTask_Content .numberSmsContentInfoSegment").clone();
                $contentDialog.find("div.numberSmsContentInfoSegment").remove();
                $contentDialog.append($contentPanel);

                // 搜索事件
                $("#numberSmsContentDialog .numberSmsContentInfoSegment").find("#numberSmsContentInfoBtn").click(function () {
                    onLoadContentBody();
                })
            }

            function onLoadContentBody() {
                var qryContentInfo = $("#numberSmsContentDialog .numberSmsContentInfoSegment").find(".qryContentInfo").val();
                var pageInfo = {
                    itemCounts: 0,
                    items: {}
                };

                var paras = {
                    curPage: 1,
                    countsPerPage: 10,
                    woXunName: qryContentInfo
                };

                globalRequest.queryWoXunContentOfShopTaskByPage(true, paras, function (data) {
                    pageInfo.itemCounts = data.itemCounts;
                    pageInfo.items = data.items;
                    createPageBody();
                    initPagination();
                }, function () {
                    layer.alert("加载营销内容数据异常", {icon: 6});
                });

                function initPagination() {
                    $("#numberSmsContentDialog .numberSmsContentInfoSegment .contentInfo .pagination").pagination({
                        items: pageInfo.itemCounts,
                        itemsOnPage: 10,
                        displayedPages: 4,
                        cssStyle: 'light-theme',
                        prevText: "<上一页",
                        nextText: "下一页>",
                        onPageClick: function (pageNumber) {
                            paras.curPage = pageNumber;
                            globalRequest.queryWoXunContentOfShopTaskByPage(true, paras, function (data) {
                                pageInfo.itemCounts = data.itemCounts;
                                pageInfo.items = data.items;
                                createPageBody();
                            });
                        }
                    });
                }

                function createPageBody() {
                    var html = "<tr><td colspan='3'><div class='noData'>暂无相关数据</div></td></tr></li>";
                    if (pageInfo.items.length > 0) {
                        var html = template('numberSmsContentInfo', {list: pageInfo.items});
                    }
                    $("#numberSmsContentDialog .numberSmsContentInfoSegment .contentInfo tbody tr").remove();
                    $("#numberSmsContentDialog .numberSmsContentInfoSegment .contentInfo tbody").append(html);
                    $("#numberSmsContentDialog .numberSmsContentInfoSegment .contentInfo tbody tr").click(function () {
                        $(this).siblings().removeClass("silver");
                        $(this).toggleClass("silver");
                    })
                };
            }
        }

        function initAutograph() {
            $autographRadio.change(function (e) {
                if ($(e).val() == "1") {
                    var param = {
                        areaId: loginUser.areaId,
                        businessIds: loginUser.businessHallIds,
                        locationType: $locationTypeId.val()
                    }
                    globalRequest.iShop.queryAutograph(false, param, function (data) {
                        if (data) {
                            $marketContentText.val($selected.find(".content").text() + "[" + data.autoGraph + "]");
                        }
                    }, function () {
                        layer.alert("加载营销内容数据异常", {icon: 6});
                    })
                    var autographText = "icompaign";
                    $marketContentText.val($marketContentText.val() + "[" + autographText + "]");
                } else {
                    var marketContentTextValue = $marketContentText.val();
                    var substringValue = marketContentTextValue.substring(0, marketContentTextValue.indexOf('['));
                    $marketContentText.val(substringValue);
                }
            })
        }

        // 初始化炒店选择事件
        function initBaseAreas(type) {
            var baseAreaIdSelect = $dialog.find("select.baseAreaId");
            var isSearch = false, searchType = -1;
            globalRequest.queryBaseAreas(false, {actionType: type}, function (data) {
                baseAreaIdSelect.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            baseAreaIdSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            baseAreaIdSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                }
                if (baseAreaIdSelect.val() == 99999) {
                    // 省级地区或者营业厅
                    $dialog.find(".baseName").attr("disabled", true);
                    $baseMessage.hide();
                }
                if (loginUser.businessHallIds != '') {
                    $baseMessage.hide();
                }

            }, function () {
                layer.alert("系统异常，获取炒店的地区失败", {icon: 6});
            });

            // 炒店点点击事件
            $dialog.find(".baseName").click(function () {
                initBaseElement();
                onLoadBaseBody();
                $plugin.iModal({
                    title: '选择炒店',
                    content: $("#shopBaseInfoDialog"),
                    area: '750px'
                }, function (index, layero) {
                    var $selectBaseId = '', $selectBaseName = '', $selectLocationTypeId = '';
                    $("#shopBaseInfoDialog .shopBaseInfoSegment #multiselectRight").find("option").each(function (index, element) {
                        $selectBaseId += $(element).val() + ",";
                        $selectBaseName += $(element).text() + ",";

                        if ($selectLocationTypeId.indexOf($(element).attr("data-locationTypeId")) === -1) {
                            $selectLocationTypeId += $(element).attr("data-locationTypeId") + ",";
                        }
                    })
                    $dialog.find(".baseName").val($selectBaseName.substring(0, $selectBaseName.length - 1));
                    $dialog.find(".baseId").val($selectBaseId.substring(0, $selectBaseId.length - 1));
                    $dialog.find(".locationTypeId").val($selectLocationTypeId.substring(0, $selectLocationTypeId.length - 1));
                    isSearch = false;
                    searchType = -1;
                    layer.close(index);
                }, function (index) {
                    isSearch = false;
                    layer.close(index);
                }, null, function (index) {
                    isSearch = false;
                    searchType = -1;
                    layer.close(index);
                })
            })

            function initBaseElement() {
                var $baseDialog = $("#shopBaseInfoDialog");
                var $basePanel = $(".iMarket_shopTask_Content .shopBaseInfoSegment").clone();
                $baseDialog.find("div.shopBaseInfoSegment").remove();
                $baseDialog.append($basePanel);

                // 基站站点搜索事件
                $baseDialog.find(".searchButton").click(function () {
                    isSearch = true;
                    initMultiSelect();
                });

                $('.js-multiselect').multiselect({
                    right: '#multiselectRight',
                    rightAll: '#btnRightAll',
                    rightSelected: '#btnRightSign',
                    leftSelected: '#btnLeftSign',
                    leftAll: '#btnLeftAll',
                    beforeMoveToLeft: function ($left, $right, $options) {
                        var isSame = true;
                        var $selectLeft = $("#shopBaseInfoDialog .shopBaseInfoSegment .selectLeft select.js-multiselect option");
                        if ($selectLeft && $selectLeft.length > 0) {
                            for (var i = 0; i < $selectLeft.length; i++) {
                                var locationTypeId = $($selectLeft[i]).attr("data-locationtypeid");
                                for (var j = 0; j < $options.length; j++) {
                                    if (locationTypeId && ($($options[j]).attr("data-locationtypeid") != locationTypeId)) {
                                        layer.msg("请选择相同的营业厅类型");
                                        isSame = false;
                                        break;
                                    }
                                }
                                if (!isSame) {
                                    break;
                                }
                            }
                        } else {
                            var currentOption = "";
                            if ($options.length == 1) {
                                var $selectRight = $("#shopBaseInfoDialog .shopBaseInfoSegment select.baseAreaType");
                                if ($($selectRight).val() != $options.attr("data-locationtypeid")) {
                                    layer.msg("请选择相同的营业厅类型");
                                    isSame = false;
                                }
                            } else {
                                for (var i = 0; i < $options.length; i++) {
                                    if (i == 0) {
                                        currentOption = $($options[i]).attr("data-locationtypeid");
                                        continue;
                                    }
                                    if (currentOption != $($options[i]).attr("data-locationtypeid")) {
                                        layer.msg("请选择相同的营业厅类型");
                                        isSame = false;
                                        break;
                                    } else {
                                        currentOption = $($options[i]).attr("data-locationtypeid");
                                        continue;
                                    }
                                }
                            }
                        }
                        if (!isSame) {
                            return false;
                        }
                        return true;
                    }
                });
            }

            function onLoadBaseBody() {
                // 加载查询列 营业厅类型 下拉框
                globalRequest.queryBaseAreaType(true, {}, function (data) {
                    var businessHallTypesArray = "";
                    if (loginUser.businessHallTypes) {
                        businessHallTypesArray = loginUser.businessHallTypes.splitWithoutBlank(',');
                    }
                    var $baseAreaTypeSelect = $("#shopBaseInfoDialog").find("select.baseAreaType");
                    $baseAreaTypeSelect.empty();
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (businessHallTypesArray && businessHallTypesArray.length > 0) {
                                for (var j = 0; j < businessHallTypesArray.length; j++) {
                                    if (businessHallTypesArray[j] == data[i].id) {  // 只加载当前用户拥有的营业厅类型的营业厅
                                        $baseAreaTypeSelect.append(
                                            "<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                                    }
                                }
                            } else {
                                $baseAreaTypeSelect.append(
                                    "<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                            }
                        }
                        initMultiSelect();
                    }
                }, function () {
                    layer.alert("系统异常，获取炒店的类型失败", {icon: 6});
                });
            }

            function initMultiSelect() {
                var paras = {
                    baseAreaId: $.trim($dialog.find(".baseAreaId").val()),
                    baseTypeId: $.trim($("#shopBaseInfoDialog").find("select.baseAreaType").val()),
                    baseId: $.trim($("#d-baseId").val()),
                    baseName: $.trim($("#d-baseName").val())
                };

                globalRequest.queryBases(true, paras, function (data) {
                    var $baseAreaTypeSelect = $("#shopBaseInfoDialog .shopBaseInfoSegment").find("select.baseAreaType");
                    var $leftSelect = $("#shopBaseInfoDialog .shopBaseInfoSegment").find(".js-multiselect");
                    var $rightSelect = $("#shopBaseInfoDialog .shopBaseInfoSegment").find("#multiselectRight");
                    var baseAreaType = $baseAreaTypeSelect.val();
                    var baseNameArray = $baseName.val().splitWithoutBlank(',');
                    var baseIdArray = $baseId.val().splitWithoutBlank(',');
                    var locationTypeId = $locationTypeId.val().splitWithoutBlank(',');
                    $leftSelect.empty();
                    searchType = paras.baseTypeId;

                    // 将已选营业厅加入 左边的下拉框
                    if (!isSearch) {
                        for (var i = 0; i < baseIdArray.length; i++) {
                            globalRequest.queryBaseInfoById(false, {baseId: baseIdArray[i]}, function (data) {
                                if (data) {
                                    $rightSelect.append("<option value='" + baseIdArray[i] + "' data-locationTypeId='" + data.locationTypeId + "' title='" + baseNameArray[i] + "'>" + baseNameArray[i] + "</option>");
                                }
                            }, function () {
                                layer.alert("加载基站数据异常", {icon: 6});
                            })
                        }
                    }

                    // 将未选营业厅加入 右边的下拉框
                    var $rightSelectOptions = $rightSelect.find("option");
                    var rightSelectOptionsBaseIdArray = "";
                    if (action == "create" && baseIdArray.length <= 0 && isSearch && $rightSelectOptions && $rightSelectOptions.length > 0) {
                        $rightSelectOptions.each(function (index, element) {
                            rightSelectOptionsBaseIdArray += $(element).val() + ",";
                        })
                        rightSelectOptionsBaseIdArray = rightSelectOptionsBaseIdArray.splitWithoutBlank(',');
                        var newData = arraySame(rightSelectOptionsBaseIdArray, data.items);
                        var tempArray = arrayDiff(newData, data.items);
                        for (var i = 0; i < tempArray.length; i++) {
                            $leftSelect.append("<option value='" + tempArray[i].id + "' data-locationTypeId='" + tempArray[i].locationTypeId + "' title='" + tempArray[i].name + "'>" + tempArray[i].name + "</option>");
                        }
                    } else {
                        var newData = arraySame(baseIdArray, data.items);
                        var tempArray = arrayDiff(newData, data.items);
                        for (var i = 0; i < tempArray.length; i++) {
                            $leftSelect.append("<option value='" + tempArray[i].id + "' data-locationTypeId='" + tempArray[i].locationTypeId + "' title='" + tempArray[i].name + "'>" + tempArray[i].name + "</option>");
                        }
                    }
                }, function () {
                    layer.alert("加载基站数据异常", {icon: 6});
                })
            }
        }

        function validateTaskName(taskName) {
            var flag = false;
            var paras = {taskName: taskName};
            globalRequest.validateTaskName(false, paras, function (data) {
                flag = data.isExists;
            }, function () {
                flag = false
            });
            return flag;
        }

        // 初始化上一步下一步事件选择事件
        function initEvent(action) {
            // 点击返回
            $preStep.click(function (e) {
                var $this = $(this);
                if ($marketViewInfo.hasClass("active")) {
                    $flowStepD.find("span").removeClass("active");
                    $flowStepC.find("span").addClass("active");
                    $marketChannelInfo.siblings("div.config").removeClass("active");
                    $marketChannelInfo.addClass("active");
                    $this.parent().find("span").removeClass("pageD").addClass("pageC");
                    $nextStep.addClass("active");
                    $confirmStep.removeClass("active");
                } else if ($marketChannelInfo.hasClass("active")) {
                    $flowStepC.find("span").removeClass("active");
                    $flowStepB.find("span").addClass("active");
                    $marketUserInfo.siblings("div.config").removeClass("active");
                    $marketUserInfo.addClass("active");
                    $this.parent().find("span").removeClass("pageC").addClass("pageB");
                    $nextStep.addClass("active");
                    $confirmStep.removeClass("active");
                } else if ($marketUserInfo.hasClass("active")) {
                    $flowStepB.find("span").removeClass("active");
                    $flowStepA.find("span").addClass("active");
                    $taskBaseInfo.siblings("div.config").removeClass("active");
                    $taskBaseInfo.addClass("active");
                    $this.parent().find("span").removeClass("pageB").addClass("pageA");
                    $nextStep.addClass("active");
                    $preStep.removeClass("active");
                }
            });
            // 点击下一步
            $nextStep.click(function (e) {
                var $this = $(this);
                if ($taskBaseInfo.hasClass("active")) {
                    if (utils.valid($taskName, utils.is_EnglishChineseNumber, shopTaskDomain, "taskName")
                        && utils.valid($businessId, utils.notEmpty, shopTaskDomain, "businessId")
                        && utils.valid($startTime, utils.notEmpty, shopTaskDomain, "startTime")
                        && utils.valid($stopTime, utils.notEmpty, shopTaskDomain, "stopTime")
                        && utils.valid($baseAreaIdSelect, utils.notEmpty, shopTaskDomain, "baseAreaId")
                        && utils.valid($baseName, utils.any, shopTaskDomain, "baseNames")
                        && utils.valid($taskDesc, utils.any, shopTaskDomain, "taskDesc")) {

                        // 省级管理员、地市管理员默认 营业厅类型为1,7(自营厅,黄埔厅)

                        if (loginUser.businessHallIds == "") {
                            if ($baseName.val() == "") {
                                if (province === $system.PROVINCE_ENUM.SH) {
                                    shopTaskDomain["baseAreaTypes"] = "1,2";
                                    $locationTypeId.val("1,2");
                                } else if (province === $system.PROVINCE_ENUM.JS) {
                                    shopTaskDomain["baseAreaTypes"] = "1,7";
                                    $locationTypeId.val("1,7");
                                }
                            }
                        }
                        if (loginUser.areaId == "99999") {
                            if (province === $system.PROVINCE_ENUM.SH) {
                                shopTaskDomain["baseAreaTypes"] = "1,2";
                                $locationTypeId.val("1,2");
                            } else if (province === $system.PROVINCE_ENUM.JS) {
                                shopTaskDomain["baseAreaTypes"] = "1,7";
                                $locationTypeId.val("1,7");
                            }
                        }

                        // 营业厅管理员 需要判断是否选择了营业厅
                        if (loginUser.areaId != "99999" && loginUser.businessHallIds != "") {
                            if ($baseName.val() == "") {
                                layer.tips("请选择要监控的营业厅！", $baseName);
                                return;
                            } else if ($baseId.val() == "") {
                                layer.tips("选择营业厅有误，请重新创建！", $baseName);
                                return;
                            }
                            else {
                                shopTaskDomain["baseAreaTypes"] = $locationTypeId.val();
                            }
                        }

                        if (action == "create") {
                            if (validateTaskName($.trim($taskName.val()))) {
                                layer.alert("任务名称不能重复，请重建！", {icon: 6});
                                return;
                            }
                        }

                        if ($startTime.val().replace(/-/g, "") > $stopTime.val().replace(/-/g, "")) {
                            layer.alert("任务开始时间不能大于结束时间", {icon: 6});
                            return;
                        } else if (dateDiff($stopTime.val(), $startTime.val()) > 90) {
                            layer.alert("任务有效期不能超过3个月", {icon: 6});
                            return;
                        }

                        shopTaskDomain.baseAreaTypes = $locationTypeId.val();
                        shopTaskDomain.baseIds = $baseId.val();
                        // 流程步骤二图片点亮
                        $flowStepA.find("span").removeClass("active");
                        $flowStepB.find("span").addClass("active");
                        // 第二页面显示
                        $marketUserInfo.siblings("div.config").removeClass("active");
                        $marketUserInfo.addClass("active");
                        // 给所有按钮添加pageB
                        $this.parent().find("span").addClass("pageB");
                        $preStep.addClass("active");
                    } else {
                        return;
                    }
                } else if ($marketUserInfo.hasClass("active")) {
                    if (utils.valid($appointUsers, utils.any, shopTaskDomain, "appointUsers")
                        && utils.valid($appointUserNum, utils.any, shopTaskDomain, "appointUserDesc")
                        && utils.valid($blackUsers, utils.any, shopTaskDomain, "blackUsers")
                        && utils.valid($blackUserNum, utils.any, shopTaskDomain, "blackUserDesc")) {

                        // 判断优先目标用户
                        var $checkboxs = {};
                        if (province === $system.PROVINCE_ENUM.SH) {
                            $checkboxs = $("#createShopTaskDialog div.monitorTypePanel .col-sm-9 .checkbox:not(.disabled)").find("label [type='checkbox']");
                            shopTaskDomain.marketSegmentIds = $segmentIds.val();
                            shopTaskDomain.marketSegmentNames = $segmentNames.val();
                            $marketContentText.attr("disabled", true);
                        } else {
                            $checkboxs = $("#createShopTaskDialog div.marketUserPanel .col-sm-9 .checkbox:not(.disabled)").find("label [type='checkbox']");
                        }

                        var marketUserVal = obj.methods.getMarketUserValue($checkboxs);
                        if (marketUserVal == 0) {
                            layer.alert("常驻用户，流动拜访用户和本店老客户用户必须选择一种！", {icon: 6});
                            return;
                        }

                        // 是否导入号码判断
                        if ($.trim($appointUserNum.val()) == "") {
                            shopTaskDomain.appointUsers = "";
                            shopTaskDomain.appointUserDesc = "";
                        }
                        if ($.trim($blackUserNum.val()) == "") {
                            shopTaskDomain.blackUsers = "";
                            shopTaskDomain.blackUserDesc = ""
                        }

                        // 流程步骤三图片点亮
                        $flowStepB.find("span").removeClass("active");
                        $flowStepC.find("span").addClass("active");
                        // 显示第三页面
                        $marketChannelInfo.siblings("div.config").removeClass("active");
                        $marketChannelInfo.addClass("active");
                        shopTaskDomain.marketUser = marketUserVal;
                        // 给所有按钮添加pageC
                        $this.parent().find("span").removeClass("pageB").addClass("pageC");
                        $preStep.addClass("active");
                    } else {
                        return;
                    }
                } else if ($marketChannelInfo.hasClass("active")) {
                    if (utils.valid($accessNumber, utils.notEmpty, shopTaskDomain, "accessNumber")
                        && utils.valid($sendInterval, utils.isPostiveNumberNotZero, shopTaskDomain, "sendInterval")
                        && utils.valid($marketLimit, utils.notEmpty, shopTaskDomain, "marketLimit")
                        && utils.valid($isSendReport, utils.notEmpty, shopTaskDomain, "isSendReport")) {

                        // 上海系统，如果选用了替换元素信息，进行替换操作
                        if (province === $system.PROVINCE_ENUM.SH && $marketContentExtend.find(".setReplaceText").is(":checked")) {
                            var replaceTextValues = [];
                            $replaceTexts.each(function () {
                                replaceTextValues.push($(this).val());
                            });
                            shopTaskDomain["marketContentExtend"] = replaceTextValues.join("&");
                        }

                        var type = $marketChannelInfo.find(".user-select span.active").data("type");
                        if (type === "sms") {
                            if (province === $system.PROVINCE_ENUM.JS) {
                                if (!$marketContentText.val()) {
                                    layer.alert("营销内容不能为空！", {icon: 6});
                                    return;
                                }
                            } else if (province === $system.PROVINCE_ENUM.SH) {
                                if (!$marketContentId.val()) {
                                    layer.alert("营销内容不能为空！", {icon: 6});
                                    return;
                                }
                            }
                            shopTaskDomain["marketContentText"] = $.trim($marketContentText.val());
                            shopTaskDomain["marketContentId"] = $.trim($marketContentId.val());
                        } else if (type === "numberSms") {
                            if (!$numberSmsContentText.val() || !$numberSmsContentId.val()) {
                                layer.alert("营销内容不能为空！", {icon: 6});
                                return;
                            }
                            // 江苏系统，如果选用了数字短信，短信内容进行替换操作
                            if (province === $system.PROVINCE_ENUM.JS) {
                                shopTaskDomain["woxunTitle"] = $.trim($numberSmsContentText.val());
                                shopTaskDomain["woxunId"] = $.trim($numberSmsContentId.val());
                            }
                        }

                        if ($isSendReport.val() == 1) {
                            if (!utils.valid($reportPhone, utils.isPhone, shopTaskDomain, "reportPhone")) {
                                return;
                            }
                        }

                        var timeInterval = dateUtil.getDifferenceDay($startTime.val(), $stopTime.val());
                        if (($sendInterval.val() > 1) && $sendInterval.val() > timeInterval) {
                            layer.alert("触发营销间隔不能大于任务开始时间与结束时间的间隔！", {icon: 6});
                            return;
                        }

                        shopTaskDomain.marketUrl = $marketUrl.val();
                        // 流程步骤四图片点亮
                        $flowStepC.find("span").removeClass("active");
                        $flowStepD.find("span").addClass("active");
                        // 显示第四页面
                        $marketViewInfo.siblings("div.config").removeClass("active");
                        $marketViewInfo.append($marketDetailInfo);
                        $marketViewInfo.addClass("active");
                        obj.initShopTaskDetailValue(0, "create", null, null);
                        // 给所有按钮添加pageD
                        $this.parent().find("span").removeClass("pageC").addClass("pageD");
                        $nextStep.removeClass("active");
                        $confirmStep.addClass("active");
                    } else {
                        return;
                    }
                }
            });
            // 点击确定
            $confirmStep.click(function (e) {
                $html.loading(true);
                var type = $operateData.attr("operate");
                var dialogIndex = $operateData.attr("index");
                if (type === "create") {
                    globalRequest.createShopTask(true, shopTaskDomain, function (data) {
                        if (data.retValue === 0) {
                            $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                            layer.close(dialogIndex);
                            layer.msg("创建成功", {time: 1000})
                        } else {
                            layer.alert(data.desc, {icon: 6});
                        }
                        $html.loading(false);
                    });
                } else if (type === "update") {
                    shopTaskDomain.id = $id.val();
                    globalRequest.updateShopTask(true, shopTaskDomain, function (data) {
                        if (data.retValue === 0) {
                            $plugin.iCompaignTableRefresh(dataTable, obj.methods.getAjaxUrl());
                            layer.close(dialogIndex);
                            layer.msg("更新成功", {time: 1000});
                        } else {
                            layer.alert(data.desc, {icon: 6});
                        }
                        $html.loading(false);
                    });
                } else {
                    $html.loading(false);
                    return;
                }
            })
        }

        function dateDiff(sDate1, sDate2) {
            var aDate, oDate1, oDate2, iDays;
            aDate = sDate1.split("-");
            oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
            aDate = sDate2.split("-");
            oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
            iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
            return iDays;
        }

        function arraySame(dataOne, dataTwo) {
            var newData = [];
            for (var i = 0; i < dataTwo.length; i++) {
                for (var j = 0; j < dataOne.length; j++) {
                    if (dataOne[j] == dataTwo[i].id) {
                        newData.push(dataTwo[i]);
                        break;
                    }
                }
            }
            return newData;
        }

        function arrayDiff(dataOne, dataTwo) {
            var temp = [], tempArray = [];
            for (var i = 0; i < dataOne.length; i++) {
                temp[dataOne[i].id] = true;
            }
            for (var i = 0; i < dataTwo.length; i++) {
                if (!temp[dataTwo[i].id]) {
                    tempArray.push(dataTwo[i]);
                }
            }
            return tempArray;
        }

        function initAppointUsers() {
            $dialog.find(".appointButton").click(function () {
                if ($appointUserNum.val()) {
                    layer.confirm("重新导入指定用户文件会覆盖当前数据", function (index) {
                        layer.close(index);
                        appointUsers();
                    });
                } else {
                    appointUsers()
                }

                function appointUsers() {
                    appointFileId = null;
                    var $appointDialog = $("#importAppointDialog");
                    // 加载静态页面
                    var $appointPanel = $(".iMarket_shopTask_Content").find("div.importPhoneSegment").clone();
                    $appointDialog.find("div.importPhoneSegment").remove();
                    $appointDialog.append($appointPanel);
                    initHistoryFile($("#importAppointDialog .importPhoneSegment .historyInfo"), "shoptask_appointUsers");
                    $plugin.iModal({
                        title: '导入指定营销用户',
                        content: $("#importAppointDialog"),
                        area: '750px'
                    }, function (index) {
                        saveAppointPhoneImport(index);
                    })

                    function saveAppointPhoneImport(index) {
                        if (appointFileId == null) {
                            layer.alert("请先上传导入文件", {icon: 6});
                            return;
                        }
                        globalRequest.saveAppointUsersImport(true, {fileId: appointFileId}, function (data) {
                            if (data.retValue == 0) {
                                $appointUsers.val(appointFileId);
                                $appointUserNum.val("成功导入用户数:" + data.num);
                                layer.close(index);
                                layer.msg("指定用户文件导入成功", {time: 1000});
                            } else {
                                layer.alert("指定用户文件导入失败，" + data.desc, {icon: 6});
                            }
                        }, function () {
                            layer.alert("指定用户文件导入失败", {icon: 6});
                        });
                    }

                    $("#importAppointDialog .importPhoneSegment").find(".importForm").find("input[type=file]").click(function (e) {
                        $(this).val("");
                        $("#importAppointDialog #fileUploadName").val("");
                    })

                    $("#importAppointDialog .importPhoneSegment").find(".importForm").find("input[type=file]").change(function (e) {
                        try {
                            $("#importAppointDialog #fileUploadName").val("");
                            var src = e.target.value;
                            var fileName = src.substring(src.lastIndexOf('\\') + 1);
                            var fileExt = fileName.replace(/.+\./, "");
                            if (fileExt !== "xlsx" && fileExt !== "xls") {
                                layer.msg("请选择模板规定的.xlsx或.xls文件!");
                                return;
                            }
                            $("#importAppointDialog #fileUploadName").val(fileName);
                        } catch (e) {
                            console.log("file selected error");
                        }
                    })

                    // 上传
                    $("#importAppointDialog .importPhoneSegment .importForm .execlInit").click(function () {
                        submitFile();
                    });

                    // 文件上传
                    function submitFile() {
                        var $form = $("#importAppointDialog .importPhoneSegment").find(".importForm");
                        var $file = $form.find("input[type=file]");
                        if ($file.val() == "") {
                            layer.msg("请选择文件!");
                            return;
                        } else if ($file.val().indexOf(".xlsx") < 0 && $file.val().indexOf(".xls") < 0) {
                            layer.msg("请选择模板规定的.xlsx或.xls文件!");
                            return;
                        }
                        var options = {
                            type: 'POST',
                            url: 'importAppointFile.view',
                            dataType: 'json',
                            beforeSubmit: function () {
                                $html.loading(true)
                            },
                            success: function (data) {
                                $html.loading(false)
                                if (data.retValue == "0") {
                                    // layer.msg(data.desc);
                                    appointFileId = data.fileId;
                                    initTable(data.fileId, data.desc);
                                } else {
                                    layer.alert("创建失败:" + data.desc);
                                }
                            }
                        }
                        $form.ajaxSubmit(options);

                        function initTable(fileId, desc) {
                            var pageInfo = {
                                itemCounts: 0,
                                items: {}
                            };

                            var paras = {
                                curPage: 1,
                                countsPerPage: 40,
                                fileId: fileId
                            };

                            globalRequest.queryShopTaskPhoneImport(true, paras, function (data) {
                                pageInfo.itemCounts = data.itemCounts;
                                pageInfo.items = data.items;
                                createPageBody(desc);
                                initPagination();
                            }, function () {
                                layer.alert("系统异常", {icon: 6});
                            });

                            function initPagination() {
                                $("#importAppointDialog .importPhoneSegment .phoneInfo .pagination").pagination({
                                    items: pageInfo.itemCounts,
                                    itemsOnPage: 40,
                                    cssStyle: 'light-theme',
                                    prevText: "<上一页",
                                    nextText: "下一页>",
                                    onPageClick: function (pageNumber) {
                                        paras.curPage = pageNumber;
                                        globalRequest.queryShopTaskPhoneImport(true, paras, function (data) {
                                            pageInfo.itemCounts = data.itemCounts;
                                            pageInfo.items = data.items;
                                            createPageBody();
                                        });
                                    }
                                });
                            }

                            function createPageBody(desc) {
                                var $html = "<tr><td colspan='4'><div class='noData'>暂无相关数据</div></td></tr></li>";
                                $("#importAppointDialog .importPhoneSegment .phoneInfo tbody tr").remove();
                                var $tbody = $("#importAppointDialog .importPhoneSegment .phoneInfo tbody");
                                if (pageInfo.items.length > 0) {
                                    var array = [];
                                    $.each(pageInfo.items, function (idx, val) {
                                        var num = idx % 4;
                                        if (num == 0) {
                                            array.push("<tr>")
                                        }
                                        array.push("<td>" + val.data + "</td>");
                                        if (num == 3) {
                                            array.push("</tr>")
                                        }
                                    });
                                    $tbody.append(array.join(""));
                                } else {
                                    $tbody.append($html);
                                }
                                layer.msg(desc ? desc : "共导入有效用户：" + pageInfo.itemCounts);
                            };
                        }
                    };
                }
            });
        }

        function initBlackUsers() {
            $dialog.find(".blackButton").click(function () {
                if ($blackUserNum.val()) {
                    layer.confirm("重新导入免打扰用户文件会覆盖当前数据", function (index) {
                        layer.close(index);
                        blackUsers();
                    });
                } else {
                    blackUsers()
                }

                function blackUsers() {
                    blackFileId = null;
                    var $blackDialog = $("#importBlackDialog");
                    // 加载静态页面
                    var $blackPanel = $(".iMarket_shopTask_Content").find("div.importPhoneSegment").clone();
                    $blackDialog.find("div.importPhoneSegment").remove();
                    $blackDialog.append($blackPanel);
                    initHistoryFile($("#importBlackDialog .importPhoneSegment .historyInfo"), "shoptask_blackUsers");
                    $plugin.iModal({
                        title: '导入免打扰营销用户',
                        content: $("#importBlackDialog"),
                        area: '750px'
                    }, function (index) {
                        saveBlackPhoneImport(index);
                    })

                    function saveBlackPhoneImport(index) {
                        if (blackFileId == null) {
                            layer.alert("请先上传导入文件", {icon: 6});
                            return;
                        }
                        globalRequest.saveBlackUsersImport(true, {fileId: blackFileId}, function (data) {
                            if (data.retValue == 0) {
                                $blackUserNum.val("成功导入用户数:" + data.num);
                                $blackUsers.val(blackFileId);
                                layer.close(index);
                                layer.msg("免打扰用户文件导入成功", {time: 1000});
                            } else {
                                layer.alert("免打扰用户文件导入失败，" + data.desc, {icon: 6});
                            }
                        }, function () {
                            layer.alert("免打扰用户文件导入失败", {icon: 6});
                        });
                    }


                    $("#importBlackDialog .importPhoneSegment").find(".importForm").find("input[type=file]").click(function (e) {
                        $(this).val("");
                        $("#importBlackDialog #fileUploadName").val("");
                    });

                    $("#importBlackDialog .importPhoneSegment").find(".importForm").find("input[type=file]").change(function (e) {
                        try {
                            $("#importBlackDialog #fileUploadName").val("");
                            var src = e.target.value;
                            var fileName = src.substring(src.lastIndexOf('\\') + 1);
                            var fileExt = fileName.replace(/.+\./, "");
                            if (fileExt !== "xlsx" && fileExt !== "xls") {
                                layer.msg("请选择模板规定的.xlsx或.xls文件!");
                                return;
                            }
                            $("#importBlackDialog #fileUploadName").val(fileName);
                        } catch (e) {
                            console.log("file selected error");
                        }
                    })

                    // 上传
                    $("#importBlackDialog .importPhoneSegment .importForm .execlInit").click(function () {
                        submitBlackFile();
                    });

                    // 文件上传
                    function submitBlackFile() {
                        var $form = $("#importBlackDialog .importPhoneSegment").find(".importForm");
                        var $file = $form.find("input[type=file]");
                        if ($file.val() == "") {
                            layer.msg("请选择文件!");
                            return;
                        } else if ($file.val().indexOf(".xlsx") < 0 && $file.val().indexOf(".xls") < 0) {
                            layer.msg("请选择模板规定的.xlsx或.xls文件!");
                            return;
                        }
                        var options = {
                            type: 'POST',
                            url: 'importBlackFile.view',
                            dataType: 'json',
                            beforeSubmit: function () {
                                $html.loading(true)
                            },
                            success: function (data) {
                                $html.loading(false)
                                if (data.retValue == "0") {
                                    layer.msg(data.desc);
                                    blackFileId = data.fileId;
                                    initTable(data.fileId);
                                } else {
                                    layer.alert("创建失败:" + data.desc);
                                }
                            }
                        }
                        $form.ajaxSubmit(options);

                        function initTable(fileId) {
                            var pageInfo = {
                                itemCounts: 0,
                                items: {}
                            };

                            var paras = {
                                curPage: 1,
                                countsPerPage: 40,
                                fileId: fileId
                            };

                            globalRequest.queryShopTaskPhoneImport(true, paras, function (data) {
                                pageInfo.itemCounts = data.itemCounts;
                                pageInfo.items = data.items;
                                createPageBody();
                                initPagination();
                            }, function () {
                                layer.alert("系统异常", {icon: 6});
                            });

                            function initPagination() {
                                $("#importBlackDialog .importPhoneSegment .phoneInfo .pagination").pagination({
                                    items: pageInfo.itemCounts,
                                    itemsOnPage: 40,
                                    cssStyle: 'light-theme',
                                    prevText: "<上一页",
                                    nextText: "下一页>",
                                    onPageClick: function (pageNumber) {
                                        paras.curPage = pageNumber;
                                        globalRequest.queryShopTaskPhoneImport(true, paras, function (data) {
                                            pageInfo.itemCounts = data.itemCounts;
                                            pageInfo.items = data.items;
                                            createPageBody();
                                        });
                                    }
                                });
                            }

                            function createPageBody() {
                                var $html = "<tr><td colspan='4'><div class='noData'>暂无相关数据</div></td></tr></li>";
                                $("#importBlackDialog .importPhoneSegment .phoneInfo tbody tr").remove();
                                var $tbody = $("#importBlackDialog .importPhoneSegment .phoneInfo tbody");
                                if (pageInfo.items.length > 0) {
                                    var array = [];
                                    $.each(pageInfo.items, function (idx, val) {
                                        var num = idx % 4;
                                        if (num == 0) {
                                            array.push("<tr>");
                                        }
                                        array.push("<td>" + val.data + "</td>");
                                        if (num == 3) {
                                            array.push("</tr>");
                                        }
                                    });
                                    $tbody.append(array.join(""));
                                } else {
                                    $tbody.append($html);
                                }
                                layer.msg("共导入有效用户" + pageInfo.itemCounts);
                            };
                        }
                    };
                }
            });
        }

        // 加载历史文件
        function initHistoryFile(dom, fileType) {
            globalRequest.queryHistoryFileById(true, {fileType: fileType}, function (data) {
                var fileList = data.data;
                if (fileList) {
                    $.each(fileList, function (idx, element) {
                        var $row = $("<div class='row'></div>");
                        var $row_name = $("<div class='col-sm-6 text-left'></div>");
                        var $row_name_val = $("<a class='bold' onclick='shopTask.downFileModel(" + element.fileId + ",\"" + element.fileName + "\")'></a>");
                        $row_name_val.text(element.fileName);
                        $row_name.append($row_name_val);
                        var $row_time = $("<div class='col-sm-6 text-left'></div>");
                        var $row_time_val = $("<span></span>");
                        $row_time_val.text(element.createDate);
                        $row_time.append($row_time_val);
                        $row.append($row_name).append($row_time);
                        dom.append($row);
                    });
                }
            }, function () {
            });
        }

    };
    /**
     * 初始化对话框元素内容
     * @param id
     */
    obj.initShopTaskValue = function (id) {
        globalRequest.queryShopTaskById(true, {id: id}, function (data) {
            var shopTaskDomainObj = data.shopTaskDomain;
            var $obj = $("#createShopTaskDialog .shopTaskInfo");
            $obj.find(".id").val(shopTaskDomainObj.id);
            $obj.find(".taskName").val(shopTaskDomainObj.taskName);
            $obj.find(".taskName").attr("disabled", true);
            $obj.find(".businessId").val(shopTaskDomainObj.businessId);
            $obj.find(".startTime").val(shopTaskDomainObj.startTime);
            $obj.find(".stopTime").val(shopTaskDomainObj.stopTime);
            $obj.find(".baseAreaId").val(shopTaskDomainObj.baseAreaId);
            $obj.find(".locationTypeId").val(shopTaskDomainObj.baseAreaTypes);
            $obj.find(".baseName").val(shopTaskDomainObj.baseNames);
            $obj.find(".baseId").val(shopTaskDomainObj.baseIds);
            $obj.find(".taskDesc").val(shopTaskDomainObj.taskDesc);

            var $checkboxs = {};
            if (province === $system.PROVINCE_ENUM.SH) {
                $obj.find(".segmentNames").val(shopTaskDomainObj.marketSegmentNames);
                $obj.find(".segmentIds").val(shopTaskDomainObj.marketSegmentIds);
                $checkboxs = $("#createShopTaskDialog div.monitorTypePanel .col-sm-9 .checkbox:not(.disabled)").find("label [type='checkbox']");
                $checkboxs.prop("checked", false);

                var marketContentExtend = shopTaskDomainObj.marketContentExtend;
                var $replaceTexts = $obj.find(".marketContentExtend .replaceTextBox");
                if (marketContentExtend) {
                    $obj.find(".setReplaceText")[0].checked = true;
                    var textExtends = marketContentExtend.split("&");
                    for (var i = 0; i < textExtends.length; i++) {
                        $replaceTexts.find(".replaceText.replaceText-" + (i + 1)).val(textExtends[i])
                    }
                }
            } else {
                $checkboxs = $("#createShopTaskDialog div.marketUserPanel .col-sm-9 .checkbox:not(.disabled)").find("label [type='checkbox']");
                $checkboxs.prop("checked", false).prop("disabled", true);
            }
            if ([1, 2, 5].indexOf(shopTaskDomainObj.marketUser) < 0) {
                $checkboxs.prop("checked", true);
            } else {
                $checkboxs.filter("input[value=" + shopTaskDomainObj.marketUser + "]").prop("checked", true);
                //$checkboxs.eq(shopTaskDomainObj.marketUser - 1).prop("checked", true);
            }

            //$obj.find(".marketUserPanel .perUserNum").text(shopTaskDomainObj.marketUserMum == null ? "0" : shopTaskDomainObj.marketUserMum);
            $obj.find(".accessNumber").val(shopTaskDomainObj.accessNumber);
            $obj.find(".appointUserNum").val(shopTaskDomainObj.appointUserDesc);
            $obj.find(".appointUsers").val(shopTaskDomainObj.appointUsers);
            $obj.find(".blackUsers").val(shopTaskDomainObj.blackUsers);
            $obj.find(".blackUserNum").val(shopTaskDomainObj.blackUserDesc);

            // 江苏系统 如果woxunId有值 说明 客户接触渠道选择的是数字短信 那么营销内容就对应woxunTitle、woxunId
            if (province === $system.PROVINCE_ENUM.JS && shopTaskDomainObj.woxunId) {
                $obj.find("[data-type='numberSms']").click();
                $obj.find(".numberSmsContentText").val(shopTaskDomainObj.woxunTitle);
                $obj.find(".numberSmsContentId").val(shopTaskDomainObj.woxunId);
            } else {
                $obj.find("[data-type='sms']").click();
                $obj.find(".marketContentText").val(shopTaskDomainObj.marketContentText);
                $obj.find(".marketUrl").val(shopTaskDomainObj.marketUrl);
                $obj.find(".marketContentId").val(shopTaskDomainObj.marketContentId);
            }
            $obj.find(".sendInterval").val(shopTaskDomainObj.sendInterval);
            $obj.find(".marketLimit").val(shopTaskDomainObj.marketLimit);
            $obj.find(".isSendReport").val(shopTaskDomainObj.isSendReport);
            if ($obj.find(".isSendReport").val() == "1") {
                $obj.find(".reportPhonelabel").removeClass("hide");
                $obj.find(".reportPhone").val(shopTaskDomainObj.reportPhone);
            } else {
                $obj.find(".reportPhonelabel").addClass("hide");
            }
        }, function () {
            layer.alert("根据ID查询炒店数据失败", {icon: 6});
        });
    };
    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param baseId
     * @param baseName
     */
    obj.initShopTaskDetailValue = function (id, type, baseId, baseName) {
        if (type === "create") {
            var $dialog = $("#createShopTaskDialog");
            var $taskBaseInfo = $dialog.find(".taskBaseInfo");
            var $marketUserInfo = $dialog.find(".marketUserInfo");
            var marketChannelInfo = $dialog.find(".marketChannelInfo");
            var $taskName = $.trim($taskBaseInfo.find(".taskName").val());
            var $businessName = $.trim($taskBaseInfo.find(".businessId").find("option:selected").text())
            var $startTime = $.trim($taskBaseInfo.find(".startTime").val());
            var $stopTime = $.trim($taskBaseInfo.find(".stopTime").val());
            var $baseAreaId = $.trim($taskBaseInfo.find(".baseAreaId").text());
            var $baseAreaType = $.trim($taskBaseInfo.find(".locationTypeId").val());
            var $baseAreaTypeArray = $baseAreaType.splitWithoutBlank(',');
            var $baseAreaTypeValue = "";
            for (var i = 0; i < $baseAreaTypeArray.length; i++) {
                switch ($baseAreaTypeArray[i]) {
                    case "1":
                        $baseAreaTypeValue += "自营厅" + ",";
                        break;
                    case "2":
                        $baseAreaTypeValue += "合作厅" + ",";
                        break;
                    case "7":
                        $baseAreaTypeValue += "黄埔厅" + ",";
                        break;
                    case "3":
                        $baseAreaTypeValue += "临时摊点" + ",";
                        break;
                    case "4":
                        $baseAreaTypeValue += "社区店" + ",";
                        break;
                    case "5":
                        $baseAreaTypeValue += "校园厅" + ",";
                        break;
                    case "6":
                        $baseAreaTypeValue += "集团渠道" + ",";
                        break;
                    case "8":
                        $baseAreaTypeValue += "连锁渠道" + ",";
                        break;
                    case "9":
                        $baseAreaTypeValue += "代理渠道" + ",";
                        break;
                    case "10":
                        $baseAreaTypeValue += "其他渠道" + ",";
                        break;
                    default:
                        $baseAreaTypeValue = "";
                        break;
                }
            }
            if ($baseAreaTypeValue != "") {
                $baseAreaTypeValue = $baseAreaTypeValue.substring(0, $baseAreaTypeValue.length - 1);
            }

            var $baseName = $.trim($taskBaseInfo.find(".baseName").val());
            var $taskDesc = $.trim($taskBaseInfo.find(".taskDesc").val());

            // 判断优先目标用户
            var $checkboxs = {}, contentText = "";
            var type = marketChannelInfo.find(".user-select span.active").data("type");
            if (type === "sms") {
                contentText = marketChannelInfo.find(".marketContentText").val();
            } else if (type === "numberSms") {
                contentText = marketChannelInfo.find(".numberSmsContentText").val();
            }
            if (province === $system.PROVINCE_ENUM.SH) {
                $checkboxs = $("#createShopTaskDialog div.monitorTypePanel .col-sm-9 .checkbox:not(.disabled)").find("label [type='checkbox']");
                var $segmentNames = $.trim($marketUserInfo.find(".segmentNames").val());
                $("#createShopTaskDialog div.shopTaskInfo .shopTaskDetailInfo").find(".detail_segmentNames").text($segmentNames || "空");

                // 使用替换元素替换营销内容的值
                if (marketChannelInfo.find(".setReplaceText").is(":checked")) {
                    marketChannelInfo.find(".replaceText").each(function (i) {
                        contentText = contentText.replace("{Reserve" + (i + 1) + "}", $(this).val());
                    });
                }
            } else {
                $checkboxs = $("#createShopTaskDialog div.marketUserPanel .col-sm-9 .checkbox:not(.disabled)").find("label [type='checkbox']");
            }

            var $targetUser = obj.methods.getMarketUserValue($checkboxs);
            var $appointUserNum = $.trim($marketUserInfo.find(".appointUserNum").val());
            var $blackUserNum = $.trim($marketUserInfo.find(".blackUserNum").val());
            var $accessNumber = $.trim(marketChannelInfo.find(".accessNumber").val());
            var $marketContentText = $.trim(contentText.replace(/[\r\n]/g, ""));

            var $sendInterval = $.trim(marketChannelInfo.find(".sendInterval").val());
            var $marketLimit = $.trim(marketChannelInfo.find(".marketLimit").val());
            var $isSendReport = $.trim(marketChannelInfo.find(".isSendReport").val());
            var $reportPhone = $.trim(marketChannelInfo.find(".reportPhone").val());

            var $shopTaskDetailInfo = $("#createShopTaskDialog div.shopTaskInfo .shopTaskDetailInfo");

            $shopTaskDetailInfo.find(".detail_taskName").text($taskName);
            $shopTaskDetailInfo.find(".detail_businessName").text($businessName);
            $shopTaskDetailInfo.find(".detail_startTime").text($startTime);
            $shopTaskDetailInfo.find(".detail_stopTime").text($stopTime);
            $shopTaskDetailInfo.find(".detail_baseAreaId").text($baseAreaId ? $baseAreaId : "空");
            $shopTaskDetailInfo.find(".detail_baseAreaType").text($baseAreaTypeValue ? $baseAreaTypeValue : "空");
            $shopTaskDetailInfo.find(".detail_baseName").text($baseName ? $baseName : "空");
            $shopTaskDetailInfo.find(".detail_taskDesc").text($taskDesc ? $taskDesc : "空");
            var val = obj.methods.getMarketUserName($targetUser);
            $shopTaskDetailInfo.find(".detail_targetUser").text(val);
            if (province === $system.PROVINCE_ENUM.SH) {
                $shopTaskDetailInfo.find(".detail_appointUser_row").hide();
                $shopTaskDetailInfo.find(".detail_blackUser_row").hide();
                $shopTaskDetailInfo.find(".detail_appointUser").hide();
                $shopTaskDetailInfo.find(".detail_blackUser").hide();
            } else {
                $shopTaskDetailInfo.find(".detail_appointUser").text($appointUserNum ? $appointUserNum : "空");
                $shopTaskDetailInfo.find(".detail_blackUser").text($blackUserNum ? $blackUserNum : "空");
            }
            $shopTaskDetailInfo.find(".detail_accessNumber").text($accessNumber ? $accessNumber : "空");
            $shopTaskDetailInfo.find(".detail_marketContent").text("营销内容示例：");
            $shopTaskDetailInfo.find(".detail_marketContentText").text($marketContentText + (type === "sms" ? "[营业厅短信签名]" : ""));
            $shopTaskDetailInfo.find(".detail_sendInterval").text($sendInterval + " 天");
            $shopTaskDetailInfo.find(".detail_marketLimit").text($marketLimit);
            $shopTaskDetailInfo.find(".detail_isSendReport").text($isSendReport == "1" ? "是" : "否");
            if ($isSendReport == "1") {
                $shopTaskDetailInfo.find(".row_detail_report").show();
                $shopTaskDetailInfo.find(".detail_reportPhone").text($reportPhone);
            } else {
                $shopTaskDetailInfo.find(".row_detail_report").hide();
            }

        } else if (type === "preview" || type === "execute") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.queryShopTaskById(true, {id: id}, function (data) {
                var shopTaskDomainObj = data.shopTaskDomain, marketContentText = shopTaskDomainObj.marketContentText;
                var $shopTaskDetailInfo = $("#shopTaskDetailDialog div.shopTaskDetailInfo");
                if (province === $system.PROVINCE_ENUM.SH) {
                    $shopTaskDetailInfo.find(".detail_segment_row").show();
                    $shopTaskDetailInfo.find(".detail_segmentNames").text(shopTaskDomainObj.marketSegmentNames || "空");
                    $shopTaskDetailInfo.find(".detail_marketUserText").text("监控类型");
                }
                $shopTaskDetailInfo.find(".detail_id").val(shopTaskDomainObj.id);
                $shopTaskDetailInfo.find(".detail_taskName").text(shopTaskDomainObj.taskName);
                $shopTaskDetailInfo.find(".detail_businessName").text(shopTaskDomainObj.businessName);
                $shopTaskDetailInfo.find(".detail_startTime").text(shopTaskDomainObj.startTime);
                $shopTaskDetailInfo.find(".detail_stopTime").text(shopTaskDomainObj.stopTime);
                $shopTaskDetailInfo.find(".detail_baseAreaId").text(shopTaskDomainObj.baseAreaName);
                $shopTaskDetailInfo.find(".detail_baseAreaType").text(shopTaskDomainObj.baseAreaTypeNames);
                $shopTaskDetailInfo.find(".detail_baseName").text(shopTaskDomainObj.baseNames ? shopTaskDomainObj.baseNames : "空");
                $shopTaskDetailInfo.find(".detail_baseId").text(shopTaskDomainObj.baseIds);
                $shopTaskDetailInfo.find(".detail_taskDesc").text(shopTaskDomainObj.taskDesc ? shopTaskDomainObj.taskDesc : "空");
                var val = obj.methods.getMarketUserName(shopTaskDomainObj.marketUser);
                $shopTaskDetailInfo.find(".detail_targetUser").text(val);
                if (shopTaskDomainObj.marketUser == 1 || shopTaskDomainObj.marketUser == 3) {
                    $shopTaskDetailInfo.find(".detail_targetUserNum").text("").show();
                }
                $shopTaskDetailInfo.find(".detail_accessNumber").text(shopTaskDomainObj.accessNumber ? shopTaskDomainObj.accessNumber : "空");
                if (province === $system.PROVINCE_ENUM.SH) {
                    $shopTaskDetailInfo.find(".detail_appointUser_row").hide();
                    $shopTaskDetailInfo.find(".detail_blackUser_row").hide();
                    $shopTaskDetailInfo.find(".detail_appointUser").hide();
                    $shopTaskDetailInfo.find(".detail_blackUser").hide();

                    // 获取需要替换营销内容的的元素信息
                    var marketContentExtend = shopTaskDomainObj.marketContentExtend;
                    if (marketContentExtend) {
                        var textExtends = marketContentExtend.split("&");
                        for (var i = 0; i < textExtends.length; i++) {
                            // 使用替换元素替换营销内容的值
                            marketContentText = marketContentText.replace("{Reserve" + (i + 1) + "}", textExtends[i]);
                        }
                    }
                } else {
                    $shopTaskDetailInfo.find(".detail_appointUser").text(shopTaskDomainObj.appointUserDesc ? shopTaskDomainObj.appointUserDesc : "空");
                    $shopTaskDetailInfo.find(".detail_blackUser").text(shopTaskDomainObj.blackUserDesc ? shopTaskDomainObj.blackUserDesc : "空");
                }

                if (type === "execute") {
                    var messageAutograph;
                    if (baseName) {
                        globalRequest.queryShopMsgDesc(false, {baseId: baseId}, function (data) {
                            messageAutograph = data.shopPhone;
                        }, function () {
                            layer.alert("查询短信签名失败", {icon: 6});
                        });
                    }
                    marketContentText = !messageAutograph ? marketContentText : marketContentText + messageAutograph;
                } else if (type === "preview") {
                    $shopTaskDetailInfo.find(".detail_marketContent").text("营销内容示例：");
                    marketContentText = marketContentText + "[营业厅短信签名]";
                }
                // 江苏系统 如果woxunId有值 说明 客户接触渠道选择的是数字短信 那么营销内容就对应woxunTitle、woxunId
                if (province === $system.PROVINCE_ENUM.JS && shopTaskDomainObj.woxunId) {
                    $shopTaskDetailInfo.find(".detail_marketContentText").text(shopTaskDomainObj.woxunTitle);
                } else {
                    $shopTaskDetailInfo.find(".detail_marketContentText").text(marketContentText);
                }
                $shopTaskDetailInfo.find(".detail_sendInterval").text(shopTaskDomainObj.sendInterval + " 天");
                $shopTaskDetailInfo.find(".detail_marketLimit").text(shopTaskDomainObj.marketLimit);
                $shopTaskDetailInfo.find(".detail_isSendReport").text(shopTaskDomainObj.isSendReport == "1" ? "是" : "否");
                if (shopTaskDomainObj.isSendReport == "1") {
                    $shopTaskDetailInfo.find(".row_detail_report").show();
                    $shopTaskDetailInfo.find(".detail_reportPhone").text(shopTaskDomainObj.reportPhone);
                } else {
                    $shopTaskDetailInfo.find(".row_detail_report").hide();
                }
            }, function () {
                layer.alert("根据ID查询炒店数据失败", {icon: 6});
            });
        }
    };

    /**
     * 所有非事件方法对象集合
     * @type {{}}
     */
    obj.methods = {
        /**
         * 获取任务类型
         * @param type
         * @returns {*}
         */
        getTaskType: function (type, id) {
            var provinceStr = "省级", cityStr = "地市级";
            if (province === $system.PROVINCE_ENUM.SH) {
                provinceStr = "市级";
                cityStr = "区域级";
            }
            switch (type) {
                case 1:
                    return "<i class='fa'>" + provinceStr + "</i>";
                case 2:
                    return "<i class='fa'>" + cityStr + "</i>";
                case 3:
                    return "<i class='fa' onmouseover='shopTask.hoverBaseNames(this,{0})'>营业厅级</i>".autoFormat(id);
            }
        },
        /**
         * 获取目标用户类型
         * @param type
         * @returns {*}
         */
        getMarketUser: function (type) {
            switch (type) {
                case 1:
                    return "<i class='fa'>常驻</i>";
                case 2:
                    return "<i class='fa'>流动拜访</i>";
                case 3:
                    return "<i class='fa' style='color: green;'>常驻+流动拜访</i>";
                case 4:
                    return "<i class='fa' style='color: red;'>个性化推荐</i>";
                case 5:
                    return "<i class='fa'>老客户</i>";
                case 6:
                    return "<i class='fa' style='color: green;'>常驻+老客户</i>";
                case 7:
                    return "<i class='fa' style='color: green;'>流动拜访+老客户</i>";
                case 8:
                    return "<i class='fa' style='color: #f0ad4e;'>常驻+流动拜访+老客户</i>";
            }
        },
        /**
         * 从元素中获取目标用户类型
         * @param $element
         * @returns {number}
         */
        getMarketUserValue: function ($element) {
            var marketUserVal = 0;
            $element.each(function (index, item) {
                if ($(item).prop("checked")) {
                    marketUserVal += parseInt($(item).attr("data"));
                }
            })
            return marketUserVal;
        },
        /**
         * 获取目前用户类型名称
         * @param $element
         * @returns {string}
         */
        getMarketUserName: function (type) {
            switch (type) {
                case 1:
                    return "常驻";
                case 2:
                    return "流动拜访";
                case 3:
                    return "常驻+流动拜访";
                case 4:
                    return "个性化推荐";
                case 5:
                    return "老客户";
                case 6:
                    return "常驻+老客户";
                case 7:
                    return "流动拜访+老客户";
                case 8:
                    return "常驻+流动拜访+老客户";
            }
        },
        /**
         * 获取任务状态
         * @param status
         * @param id
         */
        getTaskStatus: function (status, id) {
            if (status == 0) {
                return "<i class='fa'>草稿</i>";
            } else if (status == 1) {
                return "<i class='fa' style='color: green;'>待审核</i>";
            } else if (status == 2) {
                return "<i class='fa' style='color: green;'>审核成功</i>";
            } else if (status == 3) {
                return "<i class='fa' style='color: red;' onmouseover='shopTask.hoverDecisionDesc(this, " + id + ")'>审核拒绝</i>";
            } else if (status == 4) {
                return "<i class='fa' style='color: blue;'>已暂停</i>";
            } else if (status == 5) {
                return "<i class='fa' style='color: blue;'>已失效</i>";
            } else if (status == 6) {
                return "<i class='fa' style='color: red;'>已终止</i>";
            } else if (status == 30 || status == 20 || (/^[1-9]{4}$/ig.test(status) && /^\d*[16]\d*$/ig.test(status))) {
                return "<i class='fa' style='color: blue;'>营销处理中</i>";
            } else if (/^[1-9]{4}$/ig.test(status) && /^[23]{4}$/ig.test(status)) {
                return "<i class='fa' style='color: blue;'>营销成功</i>";
            } else if (/^[1-9]{4}$/ig.test(status) && /^\d*[4]\d*$/ig.test(status)) {
                return "<i class='fa' style='color: red;'>营销失败</i>";
            } else {
                return "<i class='fa'>未知</i>";
            }
        },
        /**
         * 获取任务按钮操作
         * @param row
         * @param loginUserId
         * @returns {string}
         */
        getTaskAction: function (row, loginUserId) {
            var $buttons = "";
            var $editBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='编辑' onclick='shopTask.editShopTask(\"" + row.id + "\",\"" + row.status + "\")'>编辑</a>";
            var $deleteBtnHtml = "<a id='btndel' class='btn btn-danger btn-delete btn-sm' title='删除' onclick='shopTask.deleteShopTask(\"" + row.id + "\",\"" + row.status + "\")'>删除</a>";
            var $viewBtnHtml = "<a id='btnView' class='btn btn-primary btn-preview btn-sm' title='预览' onclick='shopTask.viewShopTask(\"" + row.id + "\")'>预览</a>";
            var $startHtml = "<a id='btnSuccess' class='btn btn-info btn-execute btn-sm' title='执行' onclick='shopTask.manualItem(\"" + row.id + "\",\"" + row.baseId + "\",\"" + row.baseName + "\",\"" + row.status + "\")'>执行</a>";
            var $stopHtml = "<a id='btnStop' class='btn btn-primary btn-pause btn-sm' title='暂停' onclick='shopTask.stopItem(\"" + row.id + "\",\"" + row.baseId + "\",\"" + row.taskName + "\")'>暂停</a>";
            var $reminderHtml = "<a id='btnReminder' class='btn btn-warning btn-edit btn-sm' title='催单提醒' onclick='shopTask.reminderItem(\"" + row.id + "\",\"" + row.taskName + "\")'>催单</a>";
            var $pauseHtml = "<a id='btnPause' class='btn btn-warning btn-edit btn-sm' title='一键终止任务' onclick='shopTask.pauseItem(\"" + row.id + "\",\"" + row.taskName + "\")'>终止</a>";
            // 上海版本添加草稿状态对应的短信模板替换内容修改按钮
            var $completSmsHtml = "<a id='btnSubmit' class='btn btn-primary btn-preview btn-sm' title='提交' onclick='shopTask.completeSmsContent(\"" + row.id + "\",\"" + row.status + "\")'>编辑</a>";

            var taskStatus = row.status;
            if (status == 2) {
                if (taskStatus == 4 || taskStatus == 2) {
                    if (loginUser.businessHallIds) {
                        // 地市级营业员
                        if (loginUserId == row.createUser || row.taskType == 1 || row.taskType == 2) {
                            // 本人创建的任务或者省级或者地市级任务有执行权限
                            $buttons = $startHtml;
                        }
                    } else {
                        $buttons = $viewBtnHtml;
                    }
                } else if (row.status == 20) {
                    $buttons = $viewBtnHtml;
                } else if (row.status == 30) {
                    if (loginUserId == row.createUser) {
                        $buttons = $stopHtml;
                    }
                } else if (/^[1-9]{4}$/ig.test(taskStatus) && /^[23]{4}$/ig.test(taskStatus)) {//成功的
                    $buttons = $viewBtnHtml;
                }
            } else {
                if (loginUserId == row.createUser && (taskStatus == 1 || taskStatus == 3)) {
                    $buttons = $editBtnHtml + $deleteBtnHtml;
                }
                // 上海版本精细化推送的任务且任务为{草稿|待审核|审核失败}状态的时候提供按钮完善短信内容
                if (province === $system.PROVINCE_ENUM.SH && row.marketSegmentIds.toString().startsWith("sale") && (taskStatus == 0 || taskStatus == 1 || taskStatus == 3 )) {
                    $buttons = $completSmsHtml + $deleteBtnHtml;
                }

                $buttons += $viewBtnHtml;
                // 省级或地市级管理员有一键终止的权限
                if (loginUser.businessHallIds == '' && taskStatus != 6) {
                    $buttons += $pauseHtml;
                }
            }
            // 审批中，有催单功能
            if (taskStatus == 1 && loginUserId == row.createUser) {
                $buttons += $reminderHtml;
            }
            return $buttons;
        },
        /**
         * 获取dataTable请求地址
         * @returns {string} AjaxUrl
         */
        getAjaxUrl: function () {
            var queryUrl = "queryShopTaskByPage.view",
                executeUrl = "queryShopTaskExecute.view",
                getUrl = (status == 2) ? executeUrl : queryUrl,
                shopTaskId = $.trim($("#shopTaskId").val()),
                shopTaskName = $.trim($("#shopTaskName").val()),
                shopTaskStatus = $.trim($("#shopTaskStatus").val()),
                shopTaskBaseCode = $.trim($("#shopTaskBaseCode").val()),
                shopTaskBaseName = $.trim($("#shopTaskBaseName").val()),
                dateTime = $.trim($("#dateTime").val()),
                taskType = $.trim($("#taskType").val()),
                businessId = $.trim($("#businessId").val());
            return getUrl + "?shopTaskId=" + shopTaskId + "&shopTaskName=" + shopTaskName + "&shopTaskStatus=" + shopTaskStatus + "&taskType=" + taskType + "&businessId=" + businessId + "&shopTaskBaseCode=" + shopTaskBaseCode + "&shopTaskBaseName=" + shopTaskBaseName + "&dateTime=" + dateTime
        },
        /**
         *
         * @param type
         */
        initDialog: function (type) {
            switch (type) {
                case 1: // 新增、修改炒店任务弹窗
                    var $all = $(".iMarket_shopTask_Content").find("div.shopTaskInfo").clone();
                    //$("#createShopTaskDialog").find("div.shopTaskInfo").empty();
                    $("#createShopTaskDialog").empty();
                    $("#createShopTaskDialog").append($all);
                    break;
                case 2: // 预览 弹窗
                    var $all = $(".iMarket_shopTaskDetail_Content").find("div.shopTaskDetailInfo").clone();
                    $("#shopTaskDetailDialog").find("div.shopTaskDetailInfo").empty();
                    $("#shopTaskDetailDialog").append($all);
                    break;
                case 3: // 短信模板弹窗
                    var $all = $(".iMarket_shopTask_Content").find("div.contentInfoSegment").clone();
                    $("#marketContentDialog").find("div.contentInfoSegment").empty();
                    $("#marketContentDialog").append($all);
                    break;
            }
        },
        /**
         * 获取登录人信息
         */
        getLoginUser: function () {
            globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
                $("#loginUser").val(data.loginUser.id);
                loginUser = data.loginUser;
            }, function () {
                layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
            });
        },
        /**
         * 初始化下拉框
         */
        initSelect: function () {
            var $queryBusinessIdSelect = $("#businessId");
            globalRequest.queryShopBusinessType(false, {}, function (data) {
                $queryBusinessIdSelect.empty();
                if (data) {
                    $queryBusinessIdSelect.append("<option value='A' selected>B</option>".replace(/A/g, '').replace(/B/g, "请选择业务类型"));
                    for (var i = 0; i < data.length; i++) {
                        $queryBusinessIdSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }, function () {
                layer.alert("系统异常，获取营销接入号失败", {icon: 6});
            });
        },
        /**
         * 获取省市信息
         */
        initProvince: function () {
            province = $system.getProvince();
            if (province === $system.PROVINCE_ENUM.SH) {
                $("#taskType").find("option[value='1']").text("市级");
                $("#taskType").find("option[value='2']").text("区域级");
                $("#taskType").find("option[value='3']").text("营业厅级");
            }
        }
    };

    return obj;
}();

function onLoadBody(status) {
    // 控制搜索框元素
    if (status === "2") {
        $("#shopTaskStatus").hide();
        $("#createShopTaskButton").hide();
        $("#dateTime").hide();
        $("#shopTaskBaseName").hide();
        $("#exportShopTaskButton").hide();
        $("#shopTaskBaseCode").show();
        $("#taskType").show();
        shopTask.methods.initSelect();
        $("#businessId").show();
    } else {
        $("#taskType").hide();
        $("#businessId").hide();
        $("#shopTaskStatus").show();
        $("#createShopTaskButton").show();
        $("#shopTaskBaseCode").show();
        $("#shopTaskBaseName").show();
    }

    shopTask.methods.initProvince();
    shopTask.methods.getLoginUser();
    shopTask.dataTableInit(status);
    shopTask.initEvent();
}