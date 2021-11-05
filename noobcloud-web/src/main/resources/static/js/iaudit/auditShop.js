/**
 * 炒店任务审批
 * zengcr
 */
var auditShop = function () {
    var getUrl = "queryNeedMeAuditShopTasks.view",
        saveUrl = "auditShopTask.view", province = "", dataTable, obj = {};

    obj.initData = function () {
        obj.initDate();
        obj.dataTableInit();
    };
    obj.dataTableInit = function () {
        var shopTaskName = $.trim($("#shopTaskName").val()),
            shopTaskBaseCode = $.trim($("#shopTaskBaseCode").val()),
            shopTaskBaseName = $.trim($("#shopTaskBaseName").val()),
            dateTime = $.trim($("#dateTime").val()),
            taskClassifyId = $('#taskTypeFilter').val()
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?shopTaskName=" + shopTaskName + "&shopTaskBaseCode=" + shopTaskBaseCode + "&shopTaskBaseName=" + shopTaskBaseName + "&dateTime=" + dateTime + "&taskClassifyId=" + taskClassifyId,
                type: "POST"
            },
            columns: [
                {data: "id", title: "任务ID", width: 60, className: "dataTableFirstColumns", visible: false},
                {
                    data: "taskClassifyId", width: 120, title: "任务类型", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.taskClassifyId == 1) {
                            return "<i class='fa'>炒店业务</i>";
                        } else if (row.taskClassifyId == 2) {
                            return "<i class='fa'>临时摊点（校园）</i>";
                        }
                        else if (row.taskClassifyId == 3) {
                            return "<i class='fa'>临时摊点（集客）</i>";
                        }
                        else if (row.taskClassifyId == 4) {
                            return "<i class='fa'>临时摊点（公众）</i>";
                        }
                    }
                },
                {data: "taskName", title: "任务名称", className: "dataTableFirstColumns", width: 80},
                {
                    data: "taskType", width: 80, title: "来源", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.taskType == 1) {
                            return "<i class='fa'>省级</i>";
                        } else if (row.taskType == 2) {
                            return "<i class='fa'>地市级</i>";
                        } else if (row.taskType == 3) {
                            return "<i class='fa' onmouseover='auditShop.hoverBaseNames(this, " + row.id + ")'>营业厅级</i>";
                        }
                    }
                },
                {
                    data: "businessName", title: "类型", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return row.businessName ? row.businessName : "临时摊点";
                    }
                },
                {
                    data: "startTime", title: "开始时间", width: 80,
                    render: function (data, type, row) {
                        var str = row.startTime;
                        var date = new Date(str);
                        return date.format("yyyy-MM-dd");
                    }
                },
                {
                    data: "stopTime", title: "结束时间", width: 80,
                    render: function (data, type, row) {
                        var str = row.stopTime;
                        var date = new Date(str);
                        return date.format("yyyy-MM-dd");
                    }
                },
                {data: "createTimeStr", title: "配置时间", width: 80, className: "centerColumns"},
                {
                    data: "marketUser", width: 100, title: "目标用户", className: "centerColumns",
                    render: function (data, type, row) {
                        switch (data) {
                            case 1: return "<i class='fa'>常驻</i>";
                            case 2: return "<i class='fa'>流动拜访</i>";
                            case 3: return "<i class='fa' style='color: green;'>常驻+流动拜访</i>";
                            case 4: return "<i class='fa' style='color: red;'>个性化推荐</i>";
                            case 5: return "<i class='fa''>老客户</i>";
                            case 6: return "<i class='fa' style='color: green;'>常驻+老客户</i>";
                            case 7: return "<i class='fa' style='color: green;'>流动拜访+老客户</i>";
                            case 8: return "<i class='fa' style='color: green;'>常驻+流动拜访+老客户</i>";
                        }
                    }
                },
                {
                    data: "status", title: "状态", width: 60,
                    render: function (data, type, row) {
                        return row.status == 1 ? "待审批" : "审批完成";
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-primary btn-preview btn-sm\" title='审批' style='background-color:#00B38B;border-color:#00B38B;color:#fff'  onclick=\"auditShop.evtOnShow('" + row.taskName + "','" + row.id + "','" + row.taskClassifyId + "')\">审批</a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.cmTableInit = function () {
        $('#auditDialog').cmTable({
            columns: [
                //{
                //    id: "taskName", desc: "炒店任务名称", disabled: true
                //},
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

    obj.initDate = function () {
        // $('#dateTime').val(new Date().format('yyyy-MM-dd'));
    }

    obj.evtOnShow = function (name, id, typeId) {
        obj.cmTableInit();
        obj.initShopTaskDetailDialog(typeId);
        if (typeId && parseInt(typeId) === 1) {
            obj.initShopTaskDetailValue(id, typeId);
        } else {
            obj.viewShopTempTask(id, typeId)
        }
        $(".iMarket_audit_Dialog").show();
        var title = "审批炒店任务";
        $("#taskName").val(name);
        layer.open({
            type: 1,
            title: title,
            closeBtn: 0,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('.iMarket_audit_Dialog'),
            yes: function (index, layero) {
                obj.evtOnSave(index, id, typeId);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        $("#reason").val("");
        $("#auditDecision").val("0");
        $(".layui-layer-content").css("overflow-y", "hidden");
        $("#auditDialog").find(".td-title strong").css("color", "red");
    };

    obj.evtOnSave = function (index, id, typeId) {
        var currentIndex = index;
        var reason = $.trim($("#reason").val());    // 原因
        var decision = $.trim($("#auditDecision").val());   // 审核

        if (decision === "1") {
            if (!reason) {
                layer.alert("请填写审核拒绝原因", {icon: 5});
                return;
            }
        }

        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }
        setTimeout(function () {
            $html.loading(true);
            var oData = {};
            oData["id"] = $.trim(id);
            oData["operate"] = $.trim(decision);
            oData["reason"] = $.trim(reason);
            $util.ajaxPost(saveUrl, JSON.stringify(oData), function (res) {
                    if (res.retValue == 0) {
                        layer.msg(res.desc);
                        dataTable.ajax.reload();
                        layer.close(currentIndex);
                    } else {
                        layer.alert(res.desc, {icon: 5})
                    }
                    $html.loading(false);
                },
                function () {
                    $html.loading(false);
                    layer.alert("操作失败", {icon: 5})
                });
        }, 200);
    };

    // 初始化对话框-预览
    obj.initShopTaskDetailDialog = function (typeId) {
        var $dialog = $("#viewDialog");
        var $panel = '';
        $dialog.find("div.shopTaskDetailInfo").remove();
        $dialog.find("div.layerTempTaskPreview").remove();
        if (parseInt(typeId) === 1) {
            // 加载静态页面
            $panel = $(".iMarket_shopTaskDetail_Content").find("div.shopTaskDetailInfo").clone();
        } else if (parseInt(typeId) === 2 || parseInt(typeId) === 3 || parseInt(typeId) === 4) {
            $panel = $(".layerTempTaskPreview").clone();
        }

        $dialog.append($panel);
    }

    // 初始化对话框元素内容-预览
    obj.initShopTaskDetailValue = function (id, typeId) {
        if (!id || id <= 0) {
            layer.alert("未找到该数据，请稍后重试", {icon: 6});
            return;
        }
        globalRequest.queryShopTaskById(true, {id: id, taskClassifyId: typeId}, function (data) {
            var shopTaskDomainObj = data.shopTaskDomain,marketContentText = shopTaskDomainObj.marketContentText;
            var $shopTaskDetailInfo = $("#viewDialog div.shopTaskDetailInfo");

            // 上海炒店系统，是否有设置营销内容替换元素，如果有替换元素，进行替换
            if ($system.getProvince() === $system.PROVINCE_ENUM.SH) {
                $shopTaskDetailInfo.find(".detail_segment_row").show();
                $shopTaskDetailInfo.find(".detail_segmentNames").text(shopTaskDomainObj.marketSegmentNames || "空");
                $shopTaskDetailInfo.find(".detail_marketUserText").text("监控类型");

                $shopTaskDetailInfo.find(".detail_appointUser_row").hide();
                $shopTaskDetailInfo.find(".detail_blackUser_row").hide();
                $shopTaskDetailInfo.find(".detail_appointUser").hide();
                $shopTaskDetailInfo.find(".detail_blackUser").hide();

                var marketContentExtend = shopTaskDomainObj.marketContentExtend;
                if (marketContentExtend) {
                    var textExtends = marketContentExtend.split("&");
                    for (var i = 0;i < textExtends.length; i++) {
                        marketContentText = marketContentText.replace("{Reserve"+(i+1)+"}",textExtends[i]);
                    }
                }
            }
            $shopTaskDetailInfo.find(".detail_id").val(shopTaskDomainObj.id);
            $shopTaskDetailInfo.find(".detail_taskName").text(shopTaskDomainObj.taskName);
            $shopTaskDetailInfo.find(".detail_taskClassfyId").text(typeId);
            $shopTaskDetailInfo.find(".detail_businessName").text(shopTaskDomainObj.businessName || '临时摊点');
            $shopTaskDetailInfo.find(".detail_startTime").text(shopTaskDomainObj.startTime);
            $shopTaskDetailInfo.find(".detail_stopTime").text(shopTaskDomainObj.stopTime);
            $shopTaskDetailInfo.find(".detail_baseAreaId").text(shopTaskDomainObj.baseAreaName);
            $shopTaskDetailInfo.find(".detail_baseAreaType").text(shopTaskDomainObj.baseAreaTypeNames || '临时摊点');
            $shopTaskDetailInfo.find(".detail_baseName").text(shopTaskDomainObj.baseNames ? shopTaskDomainObj.baseNames : "空");
            $shopTaskDetailInfo.find(".detail_baseId").text(shopTaskDomainObj.baseIds);
            $shopTaskDetailInfo.find(".detail_taskDesc").text(shopTaskDomainObj.taskDesc ? shopTaskDomainObj.taskDesc : "空");
            var val = obj.getMarketUserName(shopTaskDomainObj.marketUser);


            $shopTaskDetailInfo.find(".detail_targetUser").text(val);
            if (shopTaskDomainObj.marketUser == 1 || shopTaskDomainObj.marketUser == 3) {
                $shopTaskDetailInfo.find(".detail_targetUserNum").text("").show();
            }
            $shopTaskDetailInfo.find(".detail_accessNumber").text(shopTaskDomainObj.accessNumber ? shopTaskDomainObj.accessNumber : "空");
            $shopTaskDetailInfo.find(".detail_appointUser").text(shopTaskDomainObj.appointUserDesc ? shopTaskDomainObj.appointUserDesc : "空");
            $shopTaskDetailInfo.find(".detail_blackUser").text(shopTaskDomainObj.blackUserDesc ? shopTaskDomainObj.blackUserDesc : "空");
            $shopTaskDetailInfo.find(".detail_marketContent").text("营销内容示例：");
            $shopTaskDetailInfo.find(".detail_marketContentText").text(marketContentText + "[营业厅短信签名]");
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

    obj.getMarketUserName = function (type) {
        switch (type) {
            case 1: return "常驻";
            case 2: return "流动拜访";
            case 3: return "常驻+流动拜访";
            case 4: return "个性化推荐";
            case 5: return "老客户";
            case 6: return "常驻+老客户";
            case 7: return "流动拜访+老客户";
            case 8: return "常驻+流动拜访+老客户";
        }
    },

    // 绑定炒店临时任务预览弹窗内容
    obj.viewShopTempTask = function (id, typeId) {
        if (!id || id <= 0) {
            layer.alert("未找到该数据，请稍后重试", {icon: 6});
            return;
        }
        globalRequest.queryShopTaskById(true, {id: id, taskClassifyId: typeId}, function (data) {
            var model = data.shopTaskDomain;
            var $objElement = $("#viewDialog").find('.layerTempTaskPreview');
            $objElement.show()
            $objElement.find('[name="baseName"]').text(model.taskName || '') // 名称
            $objElement.find('[name="beginDate"]').text(model.startTime || '') // 开始时间
            $objElement.find('[name="endDate"]').text(model.stopTime || '') // 开始时间
            $objElement.find('[name="address"]').text(model.addressDetail) // 详细地址
            $objElement.find('[name="cityDistrict"]').text(model.baseAreaName + ' ' + model.monitorArea) //区县
            $objElement.find('[name="lng"]').text(model.longitude) //经度
            $objElement.find('[name="lat"]').text(model.latitude) // 纬度
            $objElement.find('[name="radius"]').text(model.radius + '米') // 半径
            $objElement.find('[name="sendInterval"]').text(model.sendInterval + '天') // 半径
            var marketUserText = ''

            switch (model.marketUser) {
                case 1: marketUserText =  "常驻";break;
                case 2: marketUserText =  "流动拜访";break;
                case 3: marketUserText =  "常驻+流动拜访";break;
                case 4: marketUserText =  "个性化推荐";break;
                case 5: marketUserText =  "老客户";break;
                case 6: marketUserText =  "常驻+老客户";break;
                case 7: marketUserText =  "流动拜访+老客户";break;
                case 8: marketUserText =  "常驻+流动拜访+老客户";break;
            }

            $objElement.find('[name="marketUser"]').text(marketUserText) //
            var marketArea = '暂无'
            if (model.marketUser === 2 || model.marketUser === 3) {
                switch (model.manruRange) {
                    case '111':
                        marketArea = '国内漫入+本省跨地市漫入+本市用户'
                        break
                    case '101':
                        marketArea = '国内漫入+本市用户'
                        break
                    case '100':
                        marketArea = '国内漫入'
                        break
                    case '011':
                        marketArea = '本省跨地市漫入+本市用户'
                        break
                    case '001':
                        marketArea = '本市用户'
                        break
                    case '010':
                        marketArea = '本省跨地市漫入'
                        break
                    case '110':
                        marketArea = '国内漫入+本省跨地市漫入'
                        break
                    default:
                        marketArea = '暂无'

                }
            }
            $objElement.find('[name="marketArea"]').text(marketArea) //
            $objElement.find('[name="phone"]').text(model.accessNumber) // 接入号
            $objElement.find('[name="smsContent"]').text(model.marketContentText) // 营销内容
            $objElement.find('[name="quotaNumber"]').text(model.marketLimit) // 发送配额
            var classifyName = '炒店业务'
            switch (model.taskClassifyId) {
                case 2:
                    classifyName = '临时摊点（校园）'
                    break;
                case 3:
                    classifyName = '临时摊点（集客）'
                    break;
                case 4:
                    classifyName = '临时摊点（公众）'
                    break;

            }
            $objElement.find('[name="businessHallCode"]').text(classifyName) //类型
        }, function () {
            layer.alert("根据ID查询炒店数据失败", {icon: 6});
        })
    }

    // 显示任务池来源字段浮动窗口
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
    }

    // 查询
    obj.queryAuditShopTask = function () {
        var shopTaskName = $.trim($("#shopTaskName").val()),
            shopTaskBaseCode = $.trim($("#shopTaskBaseCode").val()),
            shopTaskBaseName = $.trim($("#shopTaskBaseName").val()),
            dateTime = $.trim($("#dateTime").val()),
            taskClassifyId = $("#taskTypeFilter").val()
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?shopTaskName=" + shopTaskName + "&shopTaskBaseCode=" + shopTaskBaseCode + "&shopTaskBaseName=" + shopTaskBaseName + "&dateTime=" + dateTime + "&taskClassifyId=" + taskClassifyId);
    }

    // 触发事件
    obj.initEvent = function () {
        // 查询
        $("#auditShopTaskButton").click(function () {
            obj.queryAuditShopTask();
        });
        // 导出
        $("#exportAuditShopButton").click(function () {
            var shopTaskName = $.trim($("#shopTaskName").val()),
                shopTaskBaseCode = $.trim($("#shopTaskBaseCode").val()),
                shopTaskBaseName = $.trim($("#shopTaskBaseName").val()),
                dateTime = $.trim($("#dateTime").val());
            var oData = {};
            oData["shopTaskName"] = shopTaskName;
            oData["shopTaskBaseCode"] = shopTaskBaseCode;
            oData["shopTaskBaseName"] = shopTaskBaseName;
            oData["dateTime"] = dateTime;
            $util.exportFile("exportAuditShop.view", oData);
        });
    }

    //
    obj.initProvince = function () {
        province = $system.getProvince();
        if (province === $system.PROVINCE_ENUM.SH) {
            $("#taskTypeFilter").hide();
        }
    }

    return obj;
}();


function onLoadAuditShop() {
    $("#shopTaskName").show();
    $("#shopTaskBaseCode").show();
    $("#shopTaskBaseName").show();
    $("#auditShopTaskButton").show();
    $("#dateTime").show();
    $("#exportAuditShopButton").show();
    auditShop.initProvince();
    auditShop.initData();
    auditShop.initEvent();
}

