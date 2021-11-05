function onLoadBody() {
    var date = new Date(), currentDay = date.getFullYear() + "-" + (date.getMonth() + 1 < 10?"0"+(date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + date.getDate();
    var url = "queryDealShopTask.view", finishUrl = "queryPositionReportByPage.view?dateTime=" + currentDay, dataTable,
        finishDataTable;
    initData();
    initFinishData();
    initEvent();
    function initData() {
        var type = 1;

        //只有营业厅用户才能进行执行操作
        if (!globalConfigConstant.loginUser.businessHallIds) {
            type = 2;
            $("div.taskBtnGroup").find("div.executeWaitingBtn").remove();
            $("div.taskBtnGroup").find("div.executingBtn").addClass("active");
        }

        getShopTaskTypeCount();

        var options = {
            ele: $('table.consoleTaskTab'),
            ajax: {url: url + "?status=" + type, type: "POST"},
            columns: [
                {data: "id", visible: false},
                {data: "baseId", visible: false},
                {data: "taskName", title: "任务名称", width: "15%"},
                {data: "createTime", title: "创建时间", width: "10%"},
                {data: "businessTypeName", title: "业务类型", width: "10%"},
                {
                    data: "taskType", title: "来源", width: "8%",
                    render: function (data, type, row) {
                        switch (data) {
                            case 1:
                                return "省级";
                            case 2:
                                return "地市";
                            case 3:
                                return "营业厅";
                        }
                    }
                },
                {data: "marketContent", title: "内容", width: "18%",
                    render: function (data, type, row) {
                        var content = data;
                        if ($system.getProvince() == $system.PROVINCE_ENUM.SH && row.marketContentExtend != "-") {
                            var marketContentExtend = row.marketContentExtend;
                            var textExtends = marketContentExtend.split("&");
                            for (var i = 0;i < textExtends.length; i++) {
                                content = content.replace("{Reserve"+(i+1)+"}",textExtends[i]);
                            }
                        }
                        return content;
                    }
                },
                {data: "baseName", title: "监控炒店", width: "16%"},
                {
                    data: "marketUser", title: "目标用户", width: "15%",
                    render: function (data, type, row) {
                        switch (data) {
                            case 1: return "常驻用户";
                            case 2: return "流动用户";
                            case 3: return "<span style='color: green;'>常驻用户 + 流动用户</span>";
                            case 4: return "<span style='color: red;'>个性化推荐</span>";
                            case 5: return "<span style='color: green;'>老客户</span>";
                            case 6: return "<span style='color: green;'>常驻用户 + 老客户</span>";
                            case 7: return "<span style='color: green;'>流动用户 + 老客户</span>";
                            case 8: return "<span style='color: green;'>常驻用户 + 流动用户 + 老客户</span>";
                        }
                    }
                },
                {
                    title: "操作", width: "8%",
                    render: function (data, type, row) {
                        var operate = "";
                        if ($("div.taskBtnGroup div.active").attr("type") == 'executeWaiting') {
                            operate += "<a type='' class='btn btn-primary btn-sm btn-execute' href='#' onclick='execBtn(" + row.id + ",\"" + row.baseId + "\",\"" + row.baseName + "\")' >执行</a>";
                        } else {
                            operate += "<a type='' class='btn btn-primary btn-sm btn-preview' href='#' onclick=showDetail(" + row.id + ") >详情</a>";
                        }
                        return operate;
                    }
                },
                {data: "marketContentExtend",visible: false}
            ]
        };
        dataTable = $plugin.iCompaignTable(options);


    }

    function initFinishData() {
        var option = {
            ele: $('table.consoleFinishTaskTab'),
            ajax: {
                url: finishUrl,
                type: "POST"
            },
            columns: [
                {data: "areaName", title: "地市", className: "dataTableFirstColumns"},
                {data: "county", title: "区县"},
                {data: "cdate", title: "日期"},
                {data: "taskId", title: "任务序号"},
                {data: "taskName", title: "任务名称"},
                {data: "locationType", title: "营业厅类型"},
                {data: "sendNum", title: "短信发送人数"},
                {data: "receiveNum", title: "短信到达人数"},
                {data: "flag", title: "短信到达率"}
            ]
        };
        finishDataTable = $plugin.iCompaignTable(option);
    }

    function initEvent() {
        $("div.forecastButton >div").click(function () {
            var $showBtn = $(this).find("span.showBtn");
            var $otherRows = $("div.forecastItems").find(">div.row:not(:first)");
            if ($showBtn.hasClass("down")) {
                $showBtn.removeClass("down").addClass("up");
                $otherRows.slideDown();
            } else {
                $showBtn.removeClass("up").addClass("down");
                $otherRows.slideUp();
            }
        });

        //待执行，执行中，已完成内容显示
        $("div.taskBtnGroup").on("click", "a", function () {
            $(this).closest("div").addClass("active").siblings("div").removeClass("active");
            var $taskExecuteTable = $("div.taskExecuteTable");
            var $taskFinishTable = $("div.taskFinishTable");
            if ($(this).closest("div").hasClass("executeFinishBtn")) {
                globalLocalRefresh.refreshConsoleFinishTaskList();
                $taskExecuteTable.hide();
                $taskFinishTable.show();
            } else {
                var condition = "?status=" + $(this).attr("status");
                globalLocalRefresh.refreshConsoleTaskList(condition);
                $taskExecuteTable.show();
                $taskFinishTable.hide();
            }
        });

        $("div.consoleTaskRefreshBtn").click(function (e, condition) {
            dataTable.ajax.url(url + (condition ? condition : ""));
            dataTable.ajax.reload();
            getShopTaskTypeCount();
        });

        $("div.consoleFinishTaskRefreshBtn").click(function () {
            finishDataTable.ajax.url(finishUrl);
            finishDataTable.ajax.reload();
            getShopTaskTypeCount();
        });
    }

    function getShopTaskTypeCount() {
        globalRequest.queryShopTaskTypeCount(true, {}, function (data) {
            $("div.taskBtnGroup").find("div").each(function () {
                var $this = $(this);
                $this.find("span").text(data[$this.attr("type")]);
            });
        });
    }
}

function execBtn(id, baseId, baseName) {
    initDetail(id, baseId, baseName);
    layer.open({
        type: 1,
        shade: 0.3,
        title: "炒店任务执行",
        offset: '70px',
        area: ['750px', '595px'],
        content: $("#dialogPrimary"),
        btn: ["执行", "取消"],
        yes: function (index, layero) {
            globalRequest.manualShopTask(true, {id: id, baseIds: baseId}, function (data) {
                if (data.retValue === 0) {
                    layer.msg("执行成功", {time: 1000});
                    globalLocalRefresh.refreshConsoleTaskList("?status=1");
                    layer.close(index);
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                layer.alert('操作数据库失败');
            });
        },
        cancel: function (index, layero) {
            layer.close(index);
        }
    });
}
function showDetail(id) {
    initDetail(id);
    layer.open({
        type: 1,
        shade: 0.3,
        title: "预览炒店任务",
        offset: '70px',
        area: ['750px', '595px'],
        content: $("#dialogPrimary"),
        btn: ["关闭"],
        yes: function (index, layero) {
            layer.close(index);
        }
    });
}

function getMarketUserName (type) {
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
}

function initDetail(id, baseId, baseName) {
    if (!id || id <= 0) {
        layer.alert("未找到该数据，请稍后重试", {icon: 6});
        return;
    }
    globalRequest.queryShopTaskById(true, {id: id}, function (data) {
        var shopTaskDomainObj = data.shopTaskDomain;
        var $shopTaskDetailInfo = $("div.iMarket_ConsoleContent div.shopTaskDetailInfo").clone();
        $("#dialogPrimary").empty().append($shopTaskDetailInfo);

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
        var val = getMarketUserName(shopTaskDomainObj.marketUser);


        $shopTaskDetailInfo.find(".detail_targetUser").text(val);
        if (shopTaskDomainObj.marketUser == 1 || shopTaskDomainObj.marketUser == 3) {
            $shopTaskDetailInfo.find(".detail_targetUserNum").text("").show();
        }
        $shopTaskDetailInfo.find(".detail_accessNumber").text(shopTaskDomainObj.accessNumber ? shopTaskDomainObj.accessNumber : "空");
        $shopTaskDetailInfo.find(".detail_appointUser").text(shopTaskDomainObj.appointUserDesc ? shopTaskDomainObj.appointUserDesc : "空");
        $shopTaskDetailInfo.find(".detail_blackUser").text(shopTaskDomainObj.blackUserDesc ? shopTaskDomainObj.blackUserDesc : "空");
        var messageAutograph,marketContentText = shopTaskDomainObj.marketContentText,marketContentExtend = shopTaskDomainObj.marketContentExtend;
        if (baseName != null) {
            globalRequest.queryShopMsgDesc(false, {baseId: baseId}, function (data) {
                messageAutograph = data.shopPhone;
            }, function () {
                layer.alert("查询短信签名失败", {icon: 6});
            });
        }
        if ($system.getProvince() == $system.PROVINCE_ENUM.SH && marketContentExtend) {
            var textExtends = marketContentExtend.split("&");
            for (var i = 0;i < textExtends.length; i++) {
                marketContentText = marketContentText.replace("{Reserve"+(i+1)+"}",textExtends[i]);
            }
        }
        marketContentText = (messageAutograph == null) ? marketContentText : marketContentText + messageAutograph;

        $shopTaskDetailInfo.find(".detail_marketContentText").text(marketContentText);
        $shopTaskDetailInfo.find(".detail_sendInterval").text(shopTaskDomainObj.sendInterval + " 天");
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