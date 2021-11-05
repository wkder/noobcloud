var taskMgr = function () {
    var dialogHeight = 0, dataTable = {}, obj = {}, dbFileId = "",lian_tong_yun_ying = "1000048";
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
    };
    var modelShowItem = "<div class='model-item' data-value='AAA' data-rules='' data-count='0' last-refresh-time='' data-model-type=''><span>BBB</span></div>";
    var modelShowDetail = "<div class=\"row-item\"><div class=\"detail-label\">客群名称：</div><div class=\"model-name\" style=\"display: inline-block;\"></div></div>"
        +"<div class=\"row-item\"><div class=\"detail-label\">客群人数：</div><div class=\"model-count\" style=\"display: inline-block;width:100px;\">0</div>" +
        "<div class=\"detail-label\">刷新时间：</div><div class=\"model-refresh-time\" style=\"display: inline-block;\">-</div></div>"
        +"<div class=\"row-item\"><div style=\"text-align: center;margin-top: 10px;\">模型规则详情</div><div><div class=\"model-rule-detail\"></div></div></div>";

    obj.getDatableOptions = function (status) {
        var options = {
            ele: $('table.taskTab'),
            ajax: {url: obj.getAjaxUrl(status), type: "POST"},
            lengthChange:true,
            columns: [
                {title: "<label><input type='checkbox'></label>", width: 50, className: "centerColumns checkBox", visible: false,
                    render: function () {
                        return "<label><input type='checkbox'></label>"
                    }
                },
                {data: "id", title: "任务id", className: "dataTableFirstColumns", width: 60},
                {data: "name", title: "任务名称", className: "centerColumns"},
                {
                    data: "marketType", title: "来源", width: 40, className: "centerColumns",
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
                {data: "marketContent", title: "短信内容", width: '16%',
                    render: function (data, type, row) {
                        return data.replace('#$$#', '')
                    }
                },
                {data: "accessNumber", title: "接入号", width: 80, className: "centerColumns"},
                {data: "marketSegmentNames", title: "目标用户", width: 80},
                {data: "startTime", title: "开始时间", width: 80},
                {
                    data: "stopTime", title: "结束时间", width: 110,
                    render: function (data, type, row) {

                        if(status == "0") {
                            var stopTime = row.stopTime;
                            var date = new Date();
                            var mon = date.getMonth() + 1;
                            var day = date.getDate();
                            var now = date.getFullYear() + "-" + (mon<10?"0"+mon:mon) + "-" +(day<10?"0"+day:day);
                            if ((row.marketType != 'jxhsms') && (globalConfigConstant.loginUser.id == row.createUser || globalConfigConstant.loginUser.roleIds.toString().indexOf(lian_tong_yun_ying) != -1) && (row.status == 2) && (stopTime < now)) {
                                console.log(data+"+++"+row.id+"+++"+row.stopTime);
                                console.log(row);
                                return obj.getStopTime(data, row);
                            } else {
                                return data;
                            }
                        } else if(status == "2"){
                            return data;
                        }
                    }
                },
                {
                    data: "status", title: "状态", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa'>草稿</i>";
                        } else if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>待审核</i>";
                        } else if (row.status == 2 || row.status == 40) {
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
                            return "<i class='fa' style='color: green;'>营销触发成功</i>";
                        } else if (row.status == 36) {
                            return "<i class='fa' style='color: red;'>营销失败</i>";
                        }
                        else if (row.status == -1) {
                            return "<i class='fa' style='color: red;'>已删除</i>";
                        } else {
                            return "<i class='fa'>未知</i>";
                        }
                    }
                },
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var rowId = row.id;
                        var rowStatus = row.status;
                        var buttons = "";
                        var editBtnHtml = "", deleteBtnHtml = "", stopHtml = "", executeHtml = "",editJXHSMSContentHtml = "", splitSegmentUsersBtn = "",
                            firstExecuteHtml = "", delayBtnHtml = "",
                            viewBtnHtml = "<a  title='预览' class='viewBtn btn btn-primary btn-preview btn-sm' href='javascript:void(0)' onclick='taskMgr.viewItem(" + JSON.stringify(row) + "," + status + " )'>预览</a>";
                        /**
                         * 限定联通运营角色也可以执行
                         * 只局限于自建任务
                         */
                        if (globalConfigConstant.loginUser.id == row.createUser || globalConfigConstant.loginUser.roleIds.toString().indexOf(lian_tong_yun_ying) != -1) {
                            if(row.marketType != 'jxhsms')
                            {
                                editBtnHtml = "<a title='编辑'  class='editBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.editItem(" + JSON.stringify(row) + ")' >编辑</a>";
                                deleteBtnHtml = "<a title='删除' class='deleteBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.deleteItem(" + row.id + ",\"" + row.name + "\")'>删除</a>";
                                stopHtml = "<a title='一键终止任务' class='status btn btn-warning btn-edit btn-sm ' href='javascript:void(0)' onclick='taskMgr.stopTask(" + row.id + ",\"" + row.name + "\"," + row.status + ")' >终止</a>";
                                executeHtml = "<a title='执行' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.executeTask(" + row.id + ",\"" + row.name + "\")' >执行</a>";
                                firstExecuteHtml = "<a title='首次执行确认' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.executeTask(" + row.id + ",\"" + row.name + "\")' >首次执行确认</a>";
                                delayBtnHtml = "<a  title='延期' class='editBtn btn btn-info btn-edit btn-split btn-sm' href='javascript:void(0)' onclick='save("+rowId+","+rowStatus+")'>延期</a>";
                            }
                        }
                        /**
                         * 精细化周期任务提供修改短信内容操作按钮
                         * 只提供任务页面的修改，隔日生效
                         * 精细化周期任务提供号池拆分功能，只有最后更新时间为当天并且marketsegmentcount大于0的任务才能拆分
                         */
                        if(row.marketType == 'jxhsms'){
                            editJXHSMSContentHtml = "<a title='修改短信内容'  class='editBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.editJXHSMSContent(" + JSON.stringify(row) + ")' >修改</a>";
                            splitSegmentUsersBtn = "<a title='拆分任务'  class='editBtn btn btn-info btn-edit btn-split btn-sm' href='javascript:void(0)' onclick='taskMgr.editItem(" + JSON.stringify(row) + ")' >复制</a>";
                        }
                        var viewAuditHtml = "<a title='查看审批进度' class='viewAuditBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.viewAudit(" + row.id + ")' >审批进度</a>";
                        var resubmitHtml = "<a title='重新提交' class='resubmitBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.resubmit(" + JSON.stringify(row) + ")' >重新提交</a>";

                        if (status == "0") {    // 任务配置页面
                            buttons += viewBtnHtml;
                            buttons += editJXHSMSContentHtml + splitSegmentUsersBtn;
                            if (row.status == 0 || row.status == 1 || row.status == 3) {  // 审批通过前的状态 显示删除按钮
                                buttons += deleteBtnHtml + editBtnHtml;
                            } else {  // 审批通过后的状态 显示终止按钮
                                if (row.status != 6) {
                                    var stopTime = row.stopTime;
                                    var date = new Date();
                                    var mon = date.getMonth() + 1;
                                    var day = date.getDate();
                                    var now = date.getFullYear() + "-" + (mon<10?"0"+mon:mon) + "-" +(day<10?"0"+day:day);
                                    if(row.status == 2 && stopTime < now) {
                                        buttons += stopHtml + delayBtnHtml;
                                    }else {
                                        buttons += stopHtml;
                                    }
                                }
                            }
                        } else if (status == "2") { // 任务池页面
                            buttons = viewBtnHtml;
                            if (row.scheduleType == 'manu') {
                                if (row.status == 2) {
                                    buttons += executeHtml;
                                }
                            }
                            if (row.scheduleType == 'single') {
                                if (row.isFistStatus == 2 && row.status == 2) {
                                    buttons += firstExecuteHtml;
                                }
                            }
                        }
                        return buttons;
                    }
                },
                {data: "id", visible: false}
            ]
        };
        return options
    }

    obj.initialize = function (status) {
        status != 0 ? $("div.iMarket_Body .addBtn").hide() : $("div.iMarket_Body .addBtn").show();
        status != 0 ? $("div.iMarket_Body .stats").hide() : $("div.iMarket_Body .stats").show();
        status != 2 ? $("button.batchExecute, button.execute").hide() : $("button.batchExecute").show().next("button.execute").hide();
        if (status == 0) {
            $("div.iMarket_Body .poolStats").hide();
        } else if (status == 2) {
            $("div.iMarket_Body .addBtn").hide();
            $("div.iMarket_Body .stats").hide();
            $("div.iMarket_Body .poolStats").show();
        }

        dialogHeight = localStorage.getItem("winHeight");
        if (!dialogHeight) {
            dialogHeight = $(window).height();
            localStorage.setItem("winHeight", dialogHeight);
        }
    }

    obj.initData = function (status) {
        var options = obj.getDatableOptions(status)
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function (status) {
        /**
         * 查询事件
         */
        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl(status));
        })

        /**
         * 新增事件
         */
        $(".addBtn").click(function (event, params) {
            // 涉及客户群跳转到营销任务功能
            var initValue = {
                marketSegmentIds: params ? params.segmentId : "",
                marketSegmentNames: params ? params.segmentName : "",
                marketSegmentUserCounts: params ? params.lastRefreshCount : 0,
                operateType: params ? params.operateType : "create"
            };
            obj.handleTaskInitCreateHtml($("#dialogPrimary"));
            obj.handleTaskSetings($("#dialogPrimary"), initValue);

            $plugin.iModal({
                title: '新增营销任务',
                content: $("#dialogPrimary"),
                area: '750px',
                btn: []
            }, null, null, function (layero, index) {
                layero.find('.layui-layer-btn').remove();
                layero.find("div.data").attr("index", index).attr("operate", initValue.operateType);
            })
        })

        /**
         * 任务池页面选中多个执行任务事件
         */
        $(".batchExecute").click(function () {

            $(this).toggleClass('active');
            var $table = $('table.taskTab');
            if ($(this).hasClass('active')) {
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl(status) + '&batchFlag=1');
                $("button.execute").hide();
                $table.off("click");
                $table.find("tr").removeClass("selected");
                $table.find("tr input[type='checkbox']").removeProp("checked");
                dataTable.column(0).visible(false);
            } else {
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl(status) + '&batchFlag=1');
                $("button.execute").show();
                dataTable.column(0).visible(true);    // 第一列展示复选框
                bindEvents()
            }
            function bindEvents () {
                // 选中行
                $table.on("click", "tr", function () {
                    $(this).toggleClass('selected').find(".checkBox input").prop("checked", "checked");

                    if (!$(this).hasClass('selected')) {
                        $(this).find(".checkBox input").removeProp("checked")
                    }

                    var hasSelected = 0, allTrs = $table.find('tbody tr').length;
                    $.each($table.find('tbody tr'), function (index, ele) {
                        if($(ele).hasClass('selected')) {
                            hasSelected++
                        }
                    })
                    if (allTrs == hasSelected) {
                        $table.find("tr th.checkBox input").prop("checked", "checked")
                    } else {
                        $table.find("tr th.checkBox input").removeProp("checked")
                    }
                });
                // 全选反选
                $table.on("click", "tr th.checkBox", function () {
                    var selectedArr = [];
                    $.each($table.find('tbody tr'), function (index, ele) {
                        if($(ele).hasClass('selected') && ele.hasAttribute('role')) {
                            selectedArr.push($(ele).find("td.dataTableFirstColumns").text())
                        }
                    })
                    if (selectedArr.length == 0) {
                        chooseAll()
                    } else {
                        if (selectedArr.length == $table.find('tbody tr').length) {
                            noChoose()
                        } else {
                            chooseAll()
                        }
                    }
                    function chooseAll () {
                        $.each($table.find('tbody tr'), function (index, ele) {
                            if (ele.hasAttribute('role')) {
                                $(ele).addClass('selected').find(".checkBox input").prop("checked", "checked");
                            }
                        })
                    }
                    function noChoose() {
                        $.each($table.find('tbody tr'), function (index, ele) {
                            $(ele).removeClass('selected').find(".checkBox input").removeProp("checked");
                        })
                    }
                })


            }
        })
        /**
         * 批量执行事件
         */
        $(".execute").click(function() {
            var selectedArr = [];
            var $table = $('table.taskTab');
            $.each($table.find('tbody tr'), function (index, ele) {
                if($(ele).hasClass('selected') && ele.hasAttribute('role')) {
                    selectedArr.push($(ele).find("td.dataTableFirstColumns").text())
                }
            })
            var ids = {
                "ids": selectedArr.join(',')
            }
            if (selectedArr.length == 0) {
                layer.msg("请选择可执行的任务！")
                return
            }
            $html.confirm("确定执行所有选中任务吗？", function (index) {
                globalRequest.iScheduling.batchExecuteMarketingTask(true, ids, function (res) {
                    if (res.retValue == 0) {
                        dataTable.draw(false)
                        layer.close(index)
                        layer.msg("执行成功")
                    }
                }, function (err) {
                    console.log(err);
                })
            }, function () {})
        })
    }

    /**
     * 预览 事件
     * @param task
     */
    obj.viewItem = function (task, status) {
        task["operateType"] = "show";
        obj.initShopTaskDetailDialog();
        obj.initShopTaskDetailValue(task["id"], "preview", status);
        $("#taskMgrDetailDialog").show();
        $("#shopTaskDetailDialog").hide();
        $plugin.iModal({
            title: '预览任务',
            content: $("#commonPage"),
            area: '750px',
            offset: '40px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param status
     */
    obj.initShopTaskDetailValue = function (id, type, status) {
        if (type == "preview" || type == "execute") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }

            if (status == 0) {
                globalRequest.iScheduling.queryMarketingTaskDetail(true, {id: id}, successFunc, function () {
                    layer.alert("根据ID查询炒店数据失败", {icon: 6});
                })
            } else if (status == 2) {
                globalRequest.iScheduling.viewMarketingPoolTaskDetail(true, {id: id}, successFunc, function () {
                    layer.alert("根据ID查询炒店数据失败", {icon: 6});
                })
            }
        }

        function successFunc(data) {
            var shopTaskDomainObj = data;
            var $shopTaskDetailInfo = $("#taskMgrDetailDialog div.taskMgrDetailInfo");
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

            if (shopTaskDomainObj.saleId) {
                $shopTaskDetailInfo.find(".saleId").text(shopTaskDomainObj.saleId)
                $shopTaskDetailInfo.find(".saleBoidId").text(shopTaskDomainObj.saleBoidId)
                $shopTaskDetailInfo.find(".aimSubId").text(shopTaskDomainObj.aimSubId)
            } else {
                $shopTaskDetailInfo.find(".targetGroup").hide();
                $shopTaskDetailInfo.find(".taskFrequency").hide();
                $shopTaskDetailInfo.find(".taskCode").hide();
            }

            $shopTaskDetailInfo.find(".detail_timerSelect").text(scheduleType);
            $shopTaskDetailInfo.find(".detail_startTime").text(shopTaskDomainObj.startTime || "空");
            $shopTaskDetailInfo.find(".detail_endTime").text(shopTaskDomainObj.stopTime || "空");
            $shopTaskDetailInfo.find(".detail_boidSale").text(shopTaskDomainObj.isBoidSale == 1 ? "是" : "否");
            $shopTaskDetailInfo.find(".detail_intervalInSeconds_title").text(shopTaskDomainObj.isBoidSale == 1 ? "分组间隔：" : "时间间隔：");
            $shopTaskDetailInfo.find(".detail_intervalInSeconds").text(shopTaskDomainObj.sendInterval ? shopTaskDomainObj.sendInterval + "天" : "空");
            $shopTaskDetailInfo.find(".detail_repeatStrategy").text(!shopTaskDomainObj.repeatStrategy ? "空" : "营销频次剔重（" + shopTaskDomainObj.repeatStrategy + "）天");
            $shopTaskDetailInfo.find(".detail_areaNames").text(shopTaskDomainObj.areaNames || "空");
            $shopTaskDetailInfo.find(".detail_remarks").text(shopTaskDomainObj.remarks || "空");
            $shopTaskDetailInfo.find(".detail_filterBlack").text(shopTaskDomainObj.filterBlack == null ? "空" : (shopTaskDomainObj.filterBlack == 0 ? "是" : "否"));
            $shopTaskDetailInfo.find(".detail_filterEmployee").text(shopTaskDomainObj.filterEmployee == null ? "空" : (shopTaskDomainObj.filterEmployee == 0 ? "是" : "否"));

            //
            $shopTaskDetailInfo.find(".detail_segmentNames").text(shopTaskDomainObj.marketSegmentNames || "空");
            $shopTaskDetailInfo.find(".detail_segmentCounts").text(typeof(shopTaskDomainObj.marketSegmentUserCounts) == "number"? shopTaskDomainObj.marketSegmentUserCounts : "空");
            $shopTaskDetailInfo.find(".detail_marketSegmentIds").text(shopTaskDomainObj.marketSegmentIds? shopTaskDomainObj.marketSegmentIds : "空");
            $shopTaskDetailInfo.find(".detail_lastUpdateTime").text(shopTaskDomainObj.lastUpdateTime ? shopTaskDomainObj.lastUpdateTime : "空");
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
            $shopTaskDetailInfo.find(".detail_Content").text(shopTaskDomainObj.marketContent.split('#$$#')[0] || "空");
            $shopTaskDetailInfo.find(".detail_ContentUrl").text(shopTaskDomainObj.marketContent.split('#$$#')[1] || "空");
            $shopTaskDetailInfo.find(".detail_TestPhones").text(shopTaskDomainObj.testPhones || "空");

            // 创建人、创建时间 审核人、审核时间
            $shopTaskDetailInfo.find(".detail_createUserName").text(shopTaskDomainObj.createUserName || "空");
            $shopTaskDetailInfo.find(".detail_createTime").text(shopTaskDomainObj.createTime || "空");
            $shopTaskDetailInfo.find(".detail_auditor").text(shopTaskDomainObj.marketingAuditUsers || "空");
            $shopTaskDetailInfo.find('.hidden').each(function () {
                $(this).removeClass('hidden');
            })
        }
    }

    /**
     * 初始化对话框-预览
     */
    obj.initShopTaskDetailDialog = function () {
        var $dialog = $("#taskMgrDetailDialog");
        var $panel = $(".iMarket_preview").find("div.taskMgrDetailInfo").clone();
        $dialog.find("div.taskMgrDetailInfo").remove();
        $dialog.append($panel);
    }

    /**
     * 修改 事件
     * @param task
     */
    obj.editItem = function (task) {
        task["operateType"] = "update";
        var lastUpdateTime = task.lastUpdateTime ? task.lastUpdateTime.substr(0,10) : null, date = new Date();
        var today = date.getFullYear() + "-" + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + ( date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
        if (task.marketType == "jxhsms") {
            if (lastUpdateTime != today) {
                layer.alert("该任务当天号池文件未生成，请稍后再试!")
                return
            }
            if (task.marketSegmentUserCounts < 1) {
                layer.alert("号池数量为0，无法生成新任务！")
                return
            }
            var addRemarks = task["remarks"];
            task["remarks"] = "号池拷贝自精细化任务：" + addRemarks;
        }
        var title = task.marketType == "jxhsms" ? "克隆任务" : "修改营销任务";
        obj.handleTaskInitCreateHtml($("#dialogPrimary"), task);
        obj.handleTaskSetings($("#dialogPrimary"), task);
        $plugin.iModal({
            title: title,
            content: $("#dialogPrimary"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    }

    /**
     * 修改精细化周期任务的短信内容
     *
     */
    obj.editJXHSMSContent = function(task)
    {
        var $dialog = $("#dialogPrimary"),
            $jxhsmsMessage = $("div.iMarket_Content").find("div.jxhContent").find("div.jxhsmsMessage").clone();
        $dialog.empty().append($jxhsmsMessage);
        var jxhsmsMessageSelectButton = $dialog.find(".jxhsmsMessageSelectButton"),
            $smsContentId  = $dialog.find(".jxhSmsContentId"),
        $smsMessageContent  = $dialog.find(".jxhsmsMessageContent");

        $smsMessageContent.val(task.marketContent || "");
        $smsContentId.val(task.marketContentId || "");
        $smsMessageContent.on('change',function(){
            $smsContentId.val("");
        });


        $plugin.iModal({
            title: '修改短信内容',
            content: $dialog,
            area: '750px',
            btn: ['保存','取消']
        },function (index) {
            saveJXHEditMessage(index);
        });

        // 保存修改内容
        function saveJXHEditMessage(index){
            var dataObj = {};
            dataObj["taskId"] = task.id;
            dataObj["messageContent"] = $smsMessageContent.val();
            dataObj["messageContentId"] = $smsContentId.val();
            globalRequest.iScheduling.editJXHSmsMessage(true,dataObj,function(data){
                layer.close(index);
                if (data.retValue === 0) {
                    dataTable.draw(false);
                    layer.msg("修改成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            },function(){
                layer.alert("修改失败", {icon: 6});
            });

        }

        // 短信选择按钮点击事件
        jxhsmsMessageSelectButton.click(function () {
            var $dialog = $("#dialogMiddle"),
                $all = $(".iMarket_Content").find("div.selectSmsContentInfo").clone(),
                selectedSmsContent = $smsContentId.val();
            $dialog.empty().append($all);
            var dataTable, url = "querySmsContentsByPage.view",param = "?type=4";
            initData();

            function initData() {
                var options = {
                    ele: $dialog.find('table.smsContentTab'),
                    ajax: {url: url+param, type: "POST"},
                    columns: [
                        {data: "id", width: "8%", className: "hideRadio"},
                        {data: "content", title: "内容名称", width: "42%", className: "centerColumns"},
                        {data: "keywords", title: "关键词", width: "30%", className: "centerColumns"},
                        {data: "url", title: "内容地址", width: "20%", className: "centerColumns"}
                    ],
                    createdRow: function (row, data, dataIndex) {
                        if (data.id == selectedSmsContent) {
                            $(row).addClass('selected');
                        }
                    }
                };
                dataTable = $plugin.iCompaignTable(options);
            }

            initEvent();

            function initEvent() {
                $dialog.find(" div.selectSmsContentInfo div.col-md-12 button.smsContentSearchBtn").click(function () {
                    var params = "searchContent=" + $.trim($dialog.find(".selectSmsContentInfo .qryContentInfo").val()) + "&key=" + $.trim($dialog.find(".selectSmsContentInfo .qryKeyInfo").val())+"&type=4";
                    $plugin.iCompaignTableRefresh(dataTable, "querySmsContentsByPage.view" + "?" + params);
                })

                $dialog.find('table.smsContentTab tbody').on('click', 'tr', function () {
                    if ($(this).hasClass("selected")) {
                        $(this).removeClass("selected").siblings("tr").removeClass("selected");
                    }
                    else {
                        $(this).addClass("selected").siblings("tr").removeClass("selected");
                    }
                })
            }

            $plugin.iModal({
                title: '选择短信内容',
                content: $dialog,
                area: '750px'
            }, function (index, layero) {
                var $selectTr = layero.find('table.smsContentTab').find("tr.selected");
                if ($selectTr.length > 0) {
                    var $tds = $selectTr.find("td");
                    var content = $tds.eq(1).text(),
                        contentId = $tds.eq(0).text(),
                        contentUrl = $tds.eq(3).text();
                    // 替换标记位，展现所有的地址
                    //content = content.replace(/\{0}/g, contentUrl);
                    $smsContentId.val(contentId);
                    $smsMessageContent.val(content);
                } else {
                    $smsContentId.val("");
                    $smsMessageContent.val("");
                }
                layer.close(index);
            })
        });

    }

    /**
     * 重新提交 事件
     * @param task
     */
    obj.resubmit = function (task) {
        task["operateType"] = "resubmit";
        obj.handleTaskInitCreateHtml($("#dialogPrimary"), task);
        obj.handleTaskSetings($("#dialogPrimary"), task);
        $plugin.iModal({
            title: '营销任务重新提交',
            content: $("#dialogPrimary"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    }

    /**
     * 删除 事件
     * @param id
     * @param name
     */
    obj.deleteItem = function (id, name) {
        layer.confirm('确认删除营销任务:' + name + "?", {icon: 3, title: '提示'}, function (index) {
            globalRequest.iScheduling.deleteMarketingTask(true, {id: id}, function () {
                layer.close(index);
                dataTable.draw(false);
                layer.msg("删除成功", {time: 1000});
            }, function () {
                layer.alert('操作数据库失败', {icon: 6});
            })
        })
    }

    /**
     * 执行 事件
     * @param id
     * @param name
     * @param status
     */
    obj.executeTask = function (id, name) {
        layer.confirm("确认启动营销任务:" + name, function (index) {
            globalRequest.iScheduling.executeTask(true, {id: id}, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    dataTable.draw(false);
                    layer.msg("启动成功", {time: 1000});
                } else {
                    layer.alert("启动失败", {icon: 6});
                }
            }), function () {
                layer.alert('操作数据库失败');
            }
        })
    }

    /**
     * 终止 事件
     * @param id
     * @param name
     */
    obj.stopTask = function (id, name) {
        layer.confirm('确认终止营销任务:' + name + "?", function (index) {
            layer.close(index);
            globalRequest.iScheduling.stopTask(true, {id: id}, function (data) {
                if (data.retValue === 0) {
                    dataTable.draw(false);
                    layer.msg("终止营销成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                layer.alert('操作数据库失败');
            })
        })
    }

    /**
     * 查看审批进度 事件
     * @param id
     */
    obj.viewAudit = function (id) {
        var $dialog = $("#dialogPrimary").empty();
        $dialog.append("<table class='processTab table' style='width:100%;'></table>");

        var options = {
            ele: $dialog.find('table.processTab'),
            ajax: {url: "queryMarketingTaskAuditProgress.view?id=" + id, type: "POST"},
            paging: false,
            columns: [
                {data: "auditUserName", title: "审批人", width: "12%"},
                {
                    data: "auditResult", title: "审批结果", width: "13%",
                    render: function (data, type, row) {
                        if (data == null) {
                            return '未审批';
                        }
                        else if (data == 'approve') {
                            return '<span style=color:green>同意</span>';
                        }
                        else {
                            return '<span style=color:red>拒绝</span>'
                        }
                    }
                },
                {data: "auditTime", title: "审批时间", width: "20%"},
                {
                    data: "remarks", title: "审批说明", width: "45%",
                    render: function (data, type, row) {
                        return "<span id='remark' style='word-break:break-all; width:auto;display:block;white-space:pre-wrap;word-wrap : break-word;overflow:hidden;' title='" + row.remarks + "'>" + row.remarks + "</span>";
                    }
                }
            ]
        };
        $plugin.iCompaignTable(options);

        $plugin.iModal({
            title: '审批进度详情',
            content: $dialog,
            area: '750px',
            btn: ['关闭']
        }, function (index) {
            layer.close(index);
        })
    }

    obj.handleTaskInitCreateHtml = function ($dialog, savaValue) {
        var $all = $("div.iMarket_Content").find("div.marketJobEditInfo").clone();
        var $modelDetail = $(".o-modelDetail .o-modelDetail-content").empty();
        $dialog.empty().append($all);

        initAll();

        function initAll() {
            /**
             * 任务基本信息
             */
            var $marketJobName = $all.find(".marketName input.name"),           // 任务名称
                $marketBusinessTypeSelect = $all.find("select.marketBusinessTypeSelect"),   // 业务类别
                $marketTimerSelect = $all.find("select.timerSelect"),           // 调度类型
                $startTimeInput = $all.find("input.startTime"),                 // 开始时间
                $endTimeInput = $all.find("input.endTime"),                     // 结束时间
                $marketMonitoringTimeRow = $all.find(".marketMonitoringTime"),      // 监控行
                $monitoringStartTimeInput = $all.find("input.monitoringStartTime"), // 监控开始时间
                $monitoringEndTimeInput = $all.find("input.monitoringEndTime"),     // 监控结束时间
                $waveCount = $all.find("label.checkbox-waveCountGroup :radio"),         // 分组营销
                $singleValueTitle = $all.find("strong.singleValueTitle"),       // 时间间隔标题
                $singleValue = $all.find("input.singleValue"),                  // 时间间隔
                $marketLimitSelect = $all.find(".marketLimitSelect"),  // 剔除策略
                $marketAreaNames = $all.find("textarea.areaNames"),             // 营销地区
                $marketAreaIds = $all.find("input.areaIds"),                    // 营销地区Id
                $marketRemarks = $all.find("textarea.remarks"),                 // 任务描述
                $marketWaveCountInfo = $all.find("div.marketDescription"),      // 分组营销提示语
                /**
                 * 目标用户选择
                 */
                $marketSegmentNames = $all.find(".segmentNames"),       // 客户群
                $marketSegmentIds = $all.find(".marketSegments .segmentIds"),   // 客户群Id
                $segmentCounts = $all.find(".marketSegments .segmentCounts"),   // 客户群人数
                $numberLimitInput = $all.find("input.numberLimit"),             // 限制人数
                $splitBtn = $all.find("#splitBtn"),                             // 分拆按钮
                $splitSelect = $all.find("input.split-input"),                 // 分拆下拉框
                $splitBox = $all.find(".splitBox"),
                $filterEmployeeBox = $all.find(".filterEmployeeBox"),              //是否过滤员工
            // todo
                $batchRow = $all.find("div.batch-row"),                         // 导入白名单模块
                $modelUser = $all.find("div.modelUser"),                        // 模型取数模块
                $appointUserFileName = $all.find("input.file-name"),            // 导入文件名
                $appointUserFile = $all.find(".batch-row input[type=file]"),    // 导入文件
                $appointUserUploadBtn = $all.find("input.file-upload-btn"),     // 白名单上传按钮
                $userType = $all.find("input.userType"),                        // 用户类型
                $appointUserCounts = $all.find("input.appointUserCounts"),      // 导入用户数

                /**
                 * 客户接触渠道
                 */
                $marketTypeSelect = $all.find("select.marketTypeSelect"),                   // 营销方式
                // 短信
                $smsAccessNumberSelect = $all.find(".sms select.smsAccessNumberSelect"),    // 接入号
                $smsMessageContent = $all.find(".sms textarea.smsMessageContent"),          // 短息内容
                $smsMessageUrl = $all.find(".sms textarea.smsMessageUrl"),                  // 短息地址
                $smsContentId = $all.find("input.smsContentId"),                            // 短信内容Id
                $smsMessageSelectButton = $all.find(".smsMessageSelectButton"),             // 选择按钮
                // 场景短信
                $sceneSmsAccessNumberSelect = $all.find(".sceneSms select.sceneSmsAccessNumberSelect"),  // 接入号
                $sceneSmsMessageContent = $all.find(".sceneSms textarea.sceneSmsMessageContent"),        // 场景短信内容
                $sceneMessageUrl = $all.find(".sceneSms textarea.sceneMessageUrl"),                      // 场景短信地址
                $sceneSmsContentId = $all.find("input.sceneSmsContentId"),                               // 场景短信内容Id
                $sceneSmsMessageSelectButton = $all.find(".sceneSmsMessageSelectButton"),                // 场景选择按钮

                $sceneRuleSmsSelectTr = $all.find("div.sceneRule"),                                      // 场景规则行
                $sceneRuleSmsSelect = $all.find("select.sceneRuleSmsSelect"),                            // 场景规则
                $testPhones = $dialog.find("textarea.marketTestPhones"),        // 测试号
                $testNumbersSelectBtn = $dialog.find(".testNumbersSelectBtn"),  // 测试号 选择按钮
                $testNumbersSendBtn = $dialog.find(".testNumbersSendBtn"),      // 测试号 发送按钮
                $warnMessage = $all.find("div.warnMessage"),                    // 友情提醒

                $userGroupInfo = $all.find("div.userGroupInfo"),        // 任务基本信息
                $jobConfigureInfo = $all.find("div.jobConfigureInfo"),  // 客户接触渠道
                $channelInfo = $all.find("div.channelInfo"),            // 目标用户选择
                $jobAuditInfo = $all.find("div.auditInfo"),             // 预览

                $preStep = $all.find("span.pre"),           // 上一步
                $nextStep = $all.find("span.next"),         // 下一步
                $confirmStep = $all.find("span.confirm"),   // 确定
                $closeBtn = $all.find("span.closeBtn"),     // 关闭
                $editStep = $all.find("span.edit"),         // 返回修改
                $operateData = $all.find("div.data"),       // 记录状态
                $flowStepA = $all.find("div.flowStepContainer div.flowStep div.flowStepA"),
                $flowStepB = $all.find("div.flowStepContainer div.flowStep div.flowStepB"),
                $flowStepC = $all.find("div.flowStepContainer div.flowStep div.flowStepC"),
                $flowStepD = $all.find("div.flowStepContainer div.flowStep div.flowStepD");
            // var $flowStepE = $all.find("div.flowStepContainer div.flowStep div.flowStepE");

            var isJxhSms =  savaValue ? savaValue.marketType == "jxhsms" : false;
            if (isJxhSms) {
                // $flowStepB.find(".stepDesc").text("拆分号池");
                // 第二页展示号池拆分
                $splitBox.css("display", "flex")
            }

            initSmsAccessNumberSelect();
            checkedFilter();
            initStartEndTime();
            initEvents();

            /**
             * 初始化 接入号下拉框
             */
            function initSmsAccessNumberSelect() {
                $smsAccessNumberSelect.empty();
                $sceneSmsAccessNumberSelect.empty();
                var accessNumbers = globalConfigConstant.smsAccessNumber;
                for (var i = 0; i < accessNumbers.length; i++) {
                    $smsAccessNumberSelect.append("<option value='" + accessNumbers[i].accessNumber + "' selected>" + accessNumbers[i].accessNumber + "</option>")
                    $sceneSmsAccessNumberSelect.append("<option value='" + accessNumbers[i].accessNumber + "' selected>" + accessNumbers[i].accessNumber + "</option>")
                    /**
                     * 场景短信任务专用接入号，目前暂时直接在js中配置
                     * 接入号需要添加使用类型，场景短信和短信群发的接入号是不一样的
                     * addTime：2017-12-13
                     * addUser：wtt
                     */
                    //$sceneSmsAccessNumberSelect.append("<option value='" + "100108866" + "' selected>" + "100108866" + "</option>")
                }
            }

            /**
             * 初始化 开始、结束时间、监控开始、结束时间
             */
            function initStartEndTime() {
                var currentDate = new Date();
                var startDate = new Date(currentDate.setHours(currentDate.getHours() + 1)),
                    year = startDate.getFullYear(),
                    month = startDate.getMonth() + 1,    //js从0开始取
                    day = startDate.getDate(),
                    finishDate = new Date(currentDate.setDate(currentDate.getDate() + 30)),
                    endYear = finishDate.getFullYear(),
                    endMonth = finishDate.getMonth() + 1,    //js从0开始取
                    endDay = finishDate.getDate();
                $startTimeInput.val(year + "-" + setStandardData(month) + "-" + setStandardData(day));
                $endTimeInput.val(endYear + "-" + setStandardData(endMonth) + "-" + setStandardData(endDay));

                $monitoringStartTimeInput.val("09:00"); // 监控开始时间
                $monitoringEndTimeInput.val("18:00");   // 监控结束时间
            }

            function setStandardData(data) {
                if (data < 10) {
                    return "0" + data;
                }
                return data;
            }

            /**
             * 初始化 场景规则下拉框
             */
            function initSceneRuleSmsSelect() {
                globalRequest.iScheduling.querySenceRuleSmsType(false, {}, function (data) {
                    $sceneRuleSmsSelect.empty();
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (i === 0) {
                                $sceneRuleSmsSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                            } else {
                                $sceneRuleSmsSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                            }
                        }
                    }
                }, function () {
                    layer.alert("系统异常，获取场景短信失败", {icon: 6});
                })
            }

            /**
             * 初始化过滤黑名单、过滤员工等radio默认选中
             */
            function checkedFilter () {
                var  $filterBlack = $all.find("label.checkbox-filterBlack :radio:eq(0)");        // 过滤黑名单
                $filterBlack.prop('checked', true);

                if ($system.PROVINCE_ENUM.JS != $system.getProvince()) {
                    $filterEmployeeBox.hide()
                }

                // 默认不过滤员工
                var $filterEmployee = $filterEmployeeBox.find('input[name="filterEmployee"]:eq(1)');
                $filterEmployee.prop('checked', true);
            }

            /**
             * 初始化 事件
             */
            function initEvents() {
                /**
                 * 号池拆分
                 */
                $splitBtn.click(function () {
                    var payload = {
                        "taskId": marketJobDomain.id,
                        "saleId": marketJobDomain.saleId,
                        "saleboId": marketJobDomain.saleBoidId,
                        "aimId": marketJobDomain.aimSubId
                    }
                    var numTask = $splitSelect.val() ? $splitSelect.val() : 1;
                    if ($splitBox.find("input[name='ifSplit']:checked").val() == '1') {
                        payload.numTask = '1'
                    } else {
                        if (utils.isNumber(numTask) && (parseInt($splitSelect.val()) > 1 && parseInt($splitSelect.val()) <= 10)) {
                            payload.numTask = numTask;
                        } else {
                            layer.tips('请输入2-10的正整数!', $splitSelect, {time: 2000, tips: [2, "#FF9800"]})
                            return
                        }
                    }

                    globalRequest.iScheduling.pickupPhonePool(true, payload, function (res) {
                        $splitBox.find("input.numCount").val(res.numCount);
                        $splitBox.find("input.poolName").val(res.poolName);
                        if (payload.numTask == 1) {
                            layer.msg("号池目前未拆分！")
                        } else {
                            layer.msg("拆分成功！")
                        }
                    }, function (err) {
                        console.log(err);
                    })
                })

                /**
                 * 精细化任务，是否分拆单选框事件
                 */
                $splitBox.find("input[name='ifSplit']").change(function (e) {
                    if ($(this).val() == '1') {
                        $splitBox.find('.split-input').val('').attr('disabled', 'disabled')
                    } else {
                        $splitBox.find('.split-input').removeAttr('disabled')
                    }
                })

                /**
                 * 浏览按钮点击事件
                 */
                obj.evtOnFileClick = function () {
                    $(this).val("");
                    $appointUserFileName.val("");
                };


                /**
                 * 浏览改变事件
                 * @param e
                 */
                obj.evtOnFileChange = function (e) {
                    try {
                        $appointUserFileName.val("");
                        var src = e.target.value;
                        var fileName = src.substring(src.lastIndexOf('\\') + 1);
                        var fileExt = fileName.replace(/.+\./, "");
                        if (fileExt !== "txt") {
                            layer.msg("请选择规定的txt文件!");
                            return;
                        }
                        $appointUserFileName.val(fileName);

                    } catch (e) {
                        console.log("file selected error");
                    }
                };

                $("input[type=file]").unbind('click').unbind('change')
                    .click(obj.evtOnFileClick).change(obj.evtOnFileChange);

                // todo 点击时间开放置灰输入框
                /**
                 * 营销客户按钮点击事件
                 */
                $channelInfo.find("input[type='radio'][name='userType']").click(function () {

                    var type = $(this).val();
                    if (type == 1) {// 模型取数
                        // radio选中的，输入框解除置灰
                        // radio未选中的，输入框置灰
                        $batchRow.find(".col-md-11 input.file-name").val("");
                        $batchRow.find(".col-md-11 input.file-upload-btn").attr("disabled", true);
                        $batchRow.find(".col-md-11 input[type='file']").attr("disabled", true).val("");
                        $batchRow.find(".col-md-11 input.appointUserCounts").val("");
                        $modelUser.find(".segmentNames")[0].disabled = false;
                    } else if (type == 2) {// 导入白名单
                        $modelUser.find(".segmentNames")[0].disabled = true;
                        $modelUser.children().each(function () {
                            $(this).val("")
                        });
                        $batchRow.find(".col-md-11 input").removeAttr("disabled");
                        $batchRow.find(".col-md-11 input.file-name").attr("disabled", true);
                    }

                });

                /**
                 * 调度类型 下拉框 事件
                 */
                //$marketTimerSelect.change(function () {
                //    $.trim($(this).val()) == taskMgr_enum.schedule_type.single ? $marketMonitoringTimeRow.show() : $marketMonitoringTimeRow.hide();
                //})

                /**
                 * 选择分组营销 事件
                 */
                $waveCount.change(function () {
                    if ($(this).val() != 1) {
                        $marketWaveCountInfo.hide();
                        $singleValueTitle.text("时间间隔：");
                        return;
                    }

                    $singleValueTitle.text("分组间隔：");
                    if (isNaN($singleValue.val()) || !$singleValue.val()) {
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    var timeInterval = dateUtil.getDifferenceDay($startTimeInput.val(), $endTimeInput.val());
                    if (timeInterval > 90) {
                        layer.tips("开始时间与结束时间最多相隔90天", $endTimeInput);
                        $endTimeInput.focus();
                        return;
                    }
                    if (($singleValue.val() > 1) && $singleValue.val() >= timeInterval + 1) {
                        layer.tips("触发营销间隔不能大于等于任务开始时间与结束时间的间隔", $singleValue);
                        $singleValue.focus();
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    var diffDay = Math.floor(timeInterval / $singleValue.val()) + 1;
                    if (isNaN(diffDay)) {
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    $all.find("span.waveCountBatch").text(diffDay);
                    $all.find("span.waveCountDay").text($singleValue.val())
                    $marketWaveCountInfo.show();
                })

                /**
                 * 分组间隔/时间间隔 鼠标失去焦点事件
                 */
                $singleValue.blur(function () {
                    var $boidSave = $all.find("label.checkbox-inline :radio:checked");
                    var boidSaveValue = $.trim($boidSave.val());
                    if (boidSaveValue != 1) {
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    if (isNaN($(this).val()) || !$(this).val()) {
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    var timeInterval = dateUtil.getDifferenceDay($startTimeInput.val(), $endTimeInput.val());
                    if (timeInterval > 90) {
                        layer.tips("开始时间与结束时间最多相隔90天", $endTimeInput);
                        $endTimeInput.focus();
                        return;
                    }
                    if (($singleValue.val() > 1) && $singleValue.val() >= timeInterval + 1) {
                        layer.tips("触发营销间隔不能大于等于任务开始时间与结束时间的间隔", $singleValue);
                        $singleValue.focus();
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    var diffDay = Math.floor(timeInterval / $singleValue.val()) + 1;
                    if (isNaN(diffDay)) {
                        $marketWaveCountInfo.hide();
                        return;
                    }
                    $all.find("span.waveCountBatch").text(diffDay);
                    $all.find("span.waveCountDay").text($singleValue.val())
                    $marketWaveCountInfo.show();
                })

                /**
                 * 选择营销地区 事件
                 */
                $marketAreaNames.click(function () {
                    var setting = {
                        view: {
                            dblClickExpand: false,
                            selectedMulti: true,
                            txtSelectedEnable: true,
                            showLine: false
                        },
                        data: {
                            simpleData: {
                                enable: true
                            },
                            keep: {
                                parent: true,
                                leaf: true
                            }
                        },
                        check: {
                            enable: true,
                            chkStyle: "checkbox"
                        },
                        callback: {}
                    }
                    globalRequest.iScheduling.queryUserAreas(true, {}, function (data) {
                        if (data && data.length > 0) {
                            //选中的地域弹框时勾选
                            var selectIds = $marketAreaIds.val() ? $marketAreaIds.val().split(",") : [];
                            for (var i = 0; i < data.length; i++) {
                                if ((data.length == selectIds.length + 1) || selectIds.indexOf(data[i].id + "") >= 0) {
                                    data[i].checked = true;
                                }
                            }
                        }

                        $.fn.zTree.init($("#treePrimary"), setting, data);

                        $plugin.iModal({
                            title: '选择营销地区',
                            content: $("#dialogTreePrimary"),
                            area: '750px'
                        }, function (index) {
                            var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                            var nodes = zTree.getCheckedNodes();
                            var areaNames = [], areaIds = [];
                            for (var i = 0; i < nodes.length; i++) {
                                if (nodes[i].id != 99999) {
                                    areaNames.push(nodes[i].name);
                                    areaIds.push(nodes[i].id);
                                }
                            }
                            $marketAreaIds.val(areaIds.join(","));
                            $marketAreaNames.val(areaNames.join(","));
                            layer.close(index);
                        })
                    }, function () {
                        layer.alert("系统异常：查询用户目录失败");
                    })
                })
                /**
                 * 营销方式 下拉框 事件
                 */
                $marketTypeSelect.change(function (event, showPage) {
                    var value = $marketTypeSelect.val();
                    if ("sms" === value) {
                        // 隐藏白名单导入按钮
                        $userType.hide();
                        $batchRow.hide();
                        // 设置模型取数按钮展示并选中
                        $channelInfo.find("input:radio[value='1']").removeAttr("disabled");
                        //$channelInfo.find("input:radio[value='1']").prop("checked",true);
                        $channelInfo.find("input:radio[value='1']").trigger("click");


                        $all.find(".jobConfigureInfo .sceneSms").hide();
                        $all.find(".jobConfigureInfo .sms").show();
                        initSmsAccessNumberSelect();
                        $sceneRuleSmsSelectTr.hide();
                        $marketTimerSelect.removeAttr("disabled");
                        $marketTimerSelect.val("manu").change();
                        $all.find("label.checkbox-inline :radio[value='0']").removeAttr("disabled")
                        $all.find("label.checkbox-inline :radio[value='1']").removeAttr("disabled")
                        $testPhones.attr("warn", "true");
                        $modelUser.removeClass("c-scene-sms");
                    } else if ("scenesms" === value) {
                        // todo 展示营销客户选项

                        $userType.show();
                        $batchRow.show();
                        //$all.find(".batch-row form").attr("disabled", "disabled");
                        //$all.find(".modelUser").attr("disabled", "disabled");

                        $all.find(".jobConfigureInfo .sms").hide();
                        $all.find(".jobConfigureInfo .sceneSms").show();
                        initSceneRuleSmsSelect();
                        $sceneRuleSmsSelectTr.show();
                        // 场景营销---调度类别改成自动调度并置灰，分组营销改为否并置灰
                        $marketTimerSelect.val("single").change();
                        $marketTimerSelect.attr("disabled", "disabled");
                        $testPhones.attr("warn", "true");
                        $all.find("label.checkbox-inline :radio[value='0']").attr("disabled", "disabled")
                        $all.find("label.checkbox-inline :radio[value='1']").attr("disabled", "disabled")
                        $all.find("label.checkbox-inline :radio[value='1']").click();
                        $modelUser.addClass("c-scene-sms");
                    } else {
                        $all.find("label.checkbox-inline :radio[value='0']").removeAttr("disabled")
                        $all.find("label.checkbox-inline :radio[value='1']").removeAttr("disabled")
                        $marketTimerSelect.removeAttr("disabled");
                        $testPhones.attr("warn", "true");
                        $modelUser.removeClass("c-scene-sms");
                    }
                    $warnMessage.hide();

                    if (showPage) {
                        $testPhones.attr("warn", "false");
                        // $marketTimerSelect.attr("disabled", "disabled");
                    }
                })
                /**
                 * 选择测试号 事件
                 */
                $testNumbersSelectBtn.click(function () {
                    var $selectDialog = $("#dialogMiddle");
                    var $testNumberAll = $(".iMarket_Content").find("div.selectTestNumberInfo").clone();
                    $selectDialog.empty().append($testNumberAll);

                    var selectedTestNumbers = $testPhones.val() ? $testPhones.val().split(",") : [];

                    initData();
                    initEvent();

                    function initData() {
                        var options = {
                            ele: $testNumberAll.find('table.testNumberTab'),
                            ajax: {url: "queryTestPhoneNumbersByPage.view", type: "POST"},
                            columns: [
                                {
                                    data: "id", width: "10%", className: "centerColumns",
                                    render: function (data, type, row) {
                                        if (selectedTestNumbers.indexOf(row.testPhoneNumber + "") >= 0) {
                                            return '<input type="checkbox" name="id" checked value="' + row.testPhoneNumber + '"/>';
                                        }
                                        return '<input type="checkbox" name="id" value="' + row.testPhoneNumber + '"/>';
                                    }
                                },
                                {data: "testPhoneNumber", title: "号码", width: "45%", className: "centerColumns"},
                                {data: "userName", title: "号码所属用户", width: "45%", className: "centerColumns"},
                            ]
                        };
                        $plugin.iCompaignTable(options);
                    }

                    function initEvent() {
                        $testNumberAll.on("click", "input[name = id]", function () {
                            var $this = $(this);
                            if ($this.is(":checked")) {
                                selectedTestNumbers.push($this.val());
                            } else {
                                var index = selectedTestNumbers.indexOf($this.val());
                                selectedTestNumbers.splice(index, 1);
                            }
                        })
                    }

                    $plugin.iModal({
                        title: '选择测试号',
                        content: $selectDialog,
                        area: '750px'
                    }, function (index) {
                        $testPhones.val(selectedTestNumbers.join(","));
                        layer.close(index);
                    })
                })
                /**
                 * 发送测试号 事件
                 */
                $testNumbersSendBtn.click(function () {
                    var value = $marketTypeSelect.val();
                    var content = "", accessNumber = "";
                    var contentId = "";
                    if ("sms" === value) {
                        if (!$smsMessageContent.val()) {
                            layer.tips($smsMessageContent.attr("title"), $smsMessageContent);
                            $smsMessageContent.focus();
                            return;
                        }
                        content = $smsMessageContent.val();
                        accessNumber = $smsAccessNumberSelect.val();
                        contentId = $smsContentId.val();
                    }
                    else if ("scenesms" === value) {
                        if (!$sceneSmsMessageContent.val()) {
                            layer.tips($sceneSmsMessageContent.attr("title"), $sceneSmsMessageContent);
                            $sceneSmsMessageContent.focus();
                            return;
                        }
                        content = $sceneSmsMessageContent.val();
                        accessNumber = $sceneSmsAccessNumberSelect.val();
                        contentId = $sceneSmsContentId.val();
                    }

                    if (!$testPhones.val()) {
                        layer.tips($testPhones.attr("title"), $testPhones);
                        $testPhones.focus();
                        return;
                    }
                    var data = obj.verifyMob($testPhones.val());
                    if (!data.ret) {
                        layer.tips(data.desc, $testPhones);
                        $testPhones.focus();
                        return;
                    }

                    //测试号短信发送提醒
                    $warnMessage.hide();
                    $testPhones.attr("warn", "false");
                    //短信发送
                    var params = {
                        testNumbers: $testPhones.val(),
                        contentId: contentId,
                        content: content,
                        accessNumber: accessNumber
                    };
                    globalRequest.iScheduling.sendMarketingTaskTestSms(true, params, function (data) {
                        if (data.retValue === 0) {
                            layer.msg("测试短信发送成功", {time: 1000})
                        } else {
                            layer.alert("发送失败，" + data.desc, {icon: 6});
                        }
                    }, function () {
                        layer.alert("系统异常", {icon: 6});
                    })
                })
                /**
                 * 短信 营销方式 选择短信内容 事件
                 */
                $smsMessageSelectButton.click(function () {
                    var $dialog = $("#dialogMiddle"),
                        $all = $(".iMarket_Content").find("div.selectSmsContentInfo").clone(),
                        selectedSmsContent = $smsContentId.val();
                    $dialog.empty().append($all);
                    var dataTable, url = "querySmsContentsByPage.view", param = "?type=4";
                    initData();

                    function initData() {
                        var options = {
                            ele: $dialog.find('table.smsContentTab'),
                            ajax: {url: url + param, type: "POST"},
                            columns: [
                                {data: "id", width: "8%", className: "hideRadio"},
                                {data: "content", title: "内容名称", width: "42%", className: "centerColumns"},
                                {data: "keywords", title: "关键词", width: "30%", className: "centerColumns"},
                                {data: "url", title: "内容地址", width: "20%", className: "centerColumns"}
                            ],
                            createdRow: function (row, data, dataIndex) {
                                if (data.id == selectedSmsContent) {
                                    $(row).addClass('selected');
                                }
                            }
                        };
                        dataTable = $plugin.iCompaignTable(options);
                    }

                    initEvent();

                    function initEvent() {
                        $dialog.find(" div.selectSmsContentInfo div.col-md-12 button.smsContentSearchBtn").click(function () {
                            var params = "searchContent=" + $.trim($dialog.find(".selectSmsContentInfo .qryContentInfo").val()) + "&key=" + $.trim($dialog.find(".selectSmsContentInfo .qryKeyInfo").val()) + "&type=4";
                            $plugin.iCompaignTableRefresh(dataTable, "querySmsContentsByPage.view" + "?" + params);
                        })

                        $dialog.find('table.smsContentTab tbody').on('click', 'tr', function () {
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected").siblings("tr").removeClass("selected");
                            }
                            else {
                                $(this).addClass("selected").siblings("tr").removeClass("selected");
                            }
                        })
                    }

                    $plugin.iModal({
                        title: '选择短信内容',
                        content: $dialog,
                        area: '750px'
                    }, function (index, layero) {
                        var $selectTr = layero.find('table.smsContentTab').find("tr.selected");
                        if ($selectTr.length > 0) {
                            var $tds = $selectTr.find("td");
                            var content = $tds.eq(1).text(),
                                contentId = $tds.eq(0).text(),
                                contentUrl = $tds.eq(3).text();
                            // 替换标记位，展现所有的地址
                            //content = content.replace(/\{0}/g, contentUrl);
                            $smsContentId.val(contentId);
                            $smsMessageUrl.val(contentUrl);
                            $smsMessageContent.val(content);
                        } else {
                            $smsContentId.val("");
                            $smsMessageContent.val("");
                        }
                        layer.close(index);
                    })
                })
                /**
                 * 场景短信 营销方式 选择短信内容 事件
                 */
                $sceneSmsMessageSelectButton.click(function () {
                    var $dialog = $("#dialogMiddle"),
                        $all = $(".iMarket_Content").find("div.selectSmsContentInfo").clone(),
                        selectedSmsContent = $sceneSmsContentId.val();
                    $dialog.empty().append($all);
                    var dataTable, url = "querySmsContentsByPage.view", param = "?type=1";
                    initData();

                    function initData() {
                        var options = {
                            ele: $dialog.find('table.smsContentTab'),
                            ajax: {url: url + param, type: "POST"},
                            columns: [
                                {data: "id", width: "8%", className: "hideRadio"},
                                {data: "content", title: "内容名称", width: "42%", className: "centerColumns"},
                                {data: "keywords", title: "关键词", width: "30%", className: "centerColumns"},
                                {data: "url", title: "内容地址", width: "20%", className: "centerColumns"}
                            ],
                            createdRow: function (row, data, dataIndex) {
                                if (data.id == selectedSmsContent) {
                                    $(row).addClass('selected');
                                }
                            }
                        };
                        dataTable = $plugin.iCompaignTable(options);
                    }

                    initEvent();

                    function initEvent() {
                        $dialog.find(" div.selectSmsContentInfo div.col-md-12 button.smsContentSearchBtn").click(function () {
                            var params = "searchContent=" + $.trim($dialog.find(".selectSmsContentInfo .qryContentInfo").val()) + "&key=" + $.trim($dialog.find(".selectSmsContentInfo .qryKeyInfo").val()) + "&type=1";
                            $plugin.iCompaignTableRefresh(dataTable, "querySmsContentsByPage.view" + "?" + params);
                        })

                        $dialog.find('table.smsContentTab tbody').on('click', 'tr', function () {
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected").siblings("tr").removeClass("selected");
                            }
                            else {
                                $(this).addClass("selected").siblings("tr").removeClass("selected");
                            }
                        })
                    }

                    $plugin.iModal({
                        title: '选择短信内容',
                        content: $dialog,
                        area: '750px'
                    }, function (index, layero) {
                        var $selectTr = layero.find('table.smsContentTab').find("tr.selected");
                        if ($selectTr.length > 0) {
                            var $tds = $selectTr.find("td");
                            var content = $tds.eq(1).text(),
                                contentId = $tds.eq(0).text(),
                                contentUrl = $tds.eq(3).text();
                            // 替换标记位展现完整短信
                            //content = content.replace(/\{0}/g, contentUrl);
                            $sceneSmsContentId.val(contentId);
                            $sceneSmsMessageContent.val(content);
                            $sceneMessageUrl.val(contentUrl)
                        } else {
                            $sceneSmsContentId.val("");
                            $sceneSmsMessageContent.val("");
                        }
                        layer.close(index);
                    })
                })
                /**
                 *  选择营销用户事件
                 */
                $marketSegmentNames.click(function () {
                    var setting = {
                        check: {
                            enable: true,
                            chkStyle: 'checkbox',
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
                        },
                        callback: {
                            beforeCheck: function (treeId, treeNode, clickFlag) {

                                var checkedNodes = $.fn.zTree.getZTreeObj("treePrimary").getCheckedNodes(true);
                                if (!verifyTreeNodeCheck(checkedNodes, treeNode)) {
                                    layer.msg("最多选择3个客户群")
                                    return false;
                                }
                            }
                        }
                    };

                    globalRequest.iScheduling.queryAllModelsUnderCatalog(true, {}, function (data) {
                        var ids = $marketSegmentIds.val().split(",");
                        var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
                        for(var i=0;i<data.length;i++){
                            if (data[i].isParent) {
                                data[i]["nocheck"] = true;
                            }
                        }
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
                                var names = [], ids = [], counts = 0, hasSegment = false, moreNodes = 0;
                                for (var i = 0; i < checkedNodesLength; i++) {
                                    if (!checkedNodes[i].isParent) {
                                        moreNodes++;
                                        ids.push(checkedNodes[i].id);
                                        names.push(modelShowItem.replace(/AAA/g,checkedNodes[i].id).replace(/BBB/g,checkedNodes[i].name));
                                        counts += checkedNodes[i].element.lastRefreshCount;
                                        hasSegment = true;
                                    }
                                }
                                if (!hasSegment) {
                                    layer.msg("请选择客户群")
                                    return;
                                }
                                if (moreNodes > 3) {
                                    layer.msg("最多选择3个客户群")
                                    return;
                                }
                                $marketSegmentNames.empty().append(names.join(""));
                                $marketSegmentIds.val(ids.join(","));
                                $segmentCounts.val(counts);
                                layer.close(index);
                            } else {
                                layer.alert("没有选择任何客户群");
                            }
                        })
                    }, function (data) {
                        layer.alert("查询客户群失败", {icon: 6});
                    })
                })

                /**
                 * 营销模型详情显示
                 */
                $marketSegmentNames.on("mouseover",".model-item span",function(){
                    var $this = $(this), $item = $this.parent(), offset = $this.offset(),userCount = $item.attr("data-count"),
                        lastRefreshTime = $item.attr("last-refresh-time"),dialogZIndex = $this.closest(".layui-layer.layui-layer-page").css("z-index"),
                        ruleDetail = $item.attr("data-rules"),id = $item.data("value"),modelType = $item.attr("data-model-type");
                    if (/^\d+$/.test(id)) {
                        if (modelType == "localImport") {
                            showNoRuleTips(offset, "本地导入模型", dialogZIndex);
                        } else {
                            if (ruleDetail){
                                setModelDetail($item,offset,{"createType":modelType,"rule":ruleDetail,"lastRefreshCount":userCount,"lastRefreshTime":lastRefreshTime},dialogZIndex);
                            } else {
                                globalRequest.queryModelById(true, {id: id}, function (data) {
                                    setModelDetail($item, offset, data, dialogZIndex);
                                });
                            }
                        }
                    } else if (id.toString().startsWith("jingxihuagp_") || id.toString().startsWith("AU")) {
                        showNoRuleTips(offset, "精细化来源客群", dialogZIndex);
                    } else {
                        showNoRuleTips(offset, "非规则任务模型", dialogZIndex);
                    }


                }).on("mouseout",".model-item span",function(){
                    $modelDetail.closest(".o-modelDetail").hide();
                });

                function showNoRuleTips(offset,text,dialogZIndex) {
                    $modelDetail.empty().append(text);
                    //显示
                    $modelDetail.closest(".o-modelDetail").css("z-index",parseInt(dialogZIndex) + 1).show().css({"left":(offset.left - 260)+ "px","top": (offset.top - 25) + "px"});
                }

                //设置模型信息
                function setModelDetail($target,offset,data,dialogZIndex) {
                    if (data.createType == "localImport") {
                        $modelDetail.empty().append("本地导入模型");
                    } else {
                        new modelRule($modelDetail.empty().append($(modelShowDetail)).find(".model-rule-detail")).init(JSON.parse(data.rule));
                        //设置显示信息
                        $modelDetail.find(".model-count").text(data.lastRefreshCount);
                        $modelDetail.find(".model-refresh-time").text(data.lastRefreshTime);
                        $modelDetail.find(".model-name").text($target.text());
                    }
                    //显示
                    $modelDetail.closest(".o-modelDetail").css("z-index",parseInt(dialogZIndex) + 1).show().css({"left":(offset.left - 260)+ "px","top": (offset.top - 25) + "px"});
                    //缓存模型信息
                    $target.attr({"data-rules":data.rule,"data-count":data.lastRefreshCount,"last-refresh-time":data.lastRefreshTime,"data-model-type":data.createType});
                }

                /**
                 * 关闭 事件
                 */
                $closeBtn.click(function () {
                    var dialogIndex = $operateData.attr("index");
                    layer.close(dialogIndex);
                    if ($operateData.attr("operate") === "modelToCreate") {
                        $("#menuTree").find("a.model_content").trigger("click");
                    }
                })

                /**
                 * 上传白名单事件
                 *
                 */
                $appointUserUploadBtn.click(function () {
                    var $form = $all.find(".batch-row form");
                    //$appointUserFile
                    //$appointUserFileName
                    if ($appointUserFile.val() == "") {
                        layer.msg("请选择文件!");
                        return;
                    } else if ($appointUserFile.val().indexOf(".txt") < 0) {
                        layer.msg("请上传txt格式的文件！");
                        return;
                    }
                    var options = {
                        type: 'POST',
                        url: 'importMarketTaskAppointUser.view',
                        dataType: 'json',
                        beforeSubmit: function () {
                            $html.loading(true)
                        },
                        success: function (data) {
                            $html.loading(false);
                            if (!data || data.retValue != 0) {
                                layer.alert("创建失败:" + data.desc);
                            } else {
                                layer.msg(data.desc);
                                $appointUserCounts.val(data.count ? data.count : 0);
                                dbFileId = data.fileId;
                            }

                        }
                    };
                    $form.ajaxSubmit(options);
                });

                /**
                 * 上一步 事件
                 */
                $preStep.click(function () {
                    var $this = $(this);
                    if ($channelInfo.hasClass("active")) {
                        $flowStepB.find("span").removeClass("active");
                        $flowStepA.find("span").addClass("active");
                        $userGroupInfo.siblings("div.row").removeClass("active");
                        $userGroupInfo.addClass("active");

                        $this.parent().find("span").removeClass("pageB");
                        $preStep.removeClass("active");
                    } else if ($jobConfigureInfo.hasClass("active")) {
                        $flowStepC.find("span").removeClass("active");
                        $flowStepB.find("span").addClass("active");
                        $channelInfo.siblings("div.row").removeClass("active");
                        $channelInfo.addClass("active");

                        $this.parent().find("span").removeClass("pageC").addClass("pageB");
                        $nextStep.addClass("active");
                        $confirmStep.removeClass("active");
                    } else if ($jobAuditInfo.hasClass("active")) {
                        $flowStepD.find("span").removeClass("active");
                        $flowStepC.find("span").addClass("active");
                        $jobConfigureInfo.siblings("div.row").removeClass("active");
                        $jobConfigureInfo.addClass("active");
                        $this.parent().find("span").removeClass("pageC").addClass("pageB");
                        $nextStep.addClass("active");
                        $confirmStep.removeClass("active");
                    }
                })

                /**
                 * 返回修改 事件
                 */
                $editStep.click(function () {
                    $userGroupInfo.siblings("div.row").removeClass("active");
                    $userGroupInfo.addClass("active");
                    $editStep.removeClass("active");
                    $nextStep.addClass("active");
                    $flowStepA.find("span").addClass("active");
                })
                var marketJobDomain = {};
                if (savaValue) {
                    marketJobDomain = savaValue;
                }
                //营销方式


                /**
                 * 下一步 事件
                 */
                $nextStep.click(function () {
                    var $this = $(this);

                    // 检查营销客群类型
                    function checkMarketUserType() {
                        var retVal = false;
                        /**
                         * start
                         * 判断营销客户选择类型是模型取数还是导入白名单
                         *
                         */
                        var userChoiceType = $channelInfo.find("[name='userType']:checked").val();
                        if (userChoiceType == 1) {
                            if (utils.valid($marketSegmentIds, utils.notEmpty, marketJobDomain, "marketSegmentIds")
                                && utils.valid($segmentCounts, utils.isNumber, marketJobDomain, "marketSegmentUserCounts")) {
                                var marketSegmentNames = [];
                                $marketSegmentNames.find("div.model-item").each(function(){
                                    marketSegmentNames.push($(this).text())
                                });
                                marketJobDomain["marketSegmentNames"] = marketSegmentNames.join(",")
                                retVal = true;
                            }
                        }
                        else if (userChoiceType == 2) {
                            if (dbFileId) {
                                marketJobDomain["marketSegmentIds"] = dbFileId;
                            } else {
                                $html.warning("请导入白名单客群文件");
                                return false;
                            }
                            if (utils.valid($appointUserCounts, utils.isNumber, marketJobDomain, "marketSegmentUserCounts")) {
                                var fileName = $appointUserFileName.val();
                                if (fileName) {
                                    marketJobDomain["marketSegmentNames"] = fileName.substring(0, fileName.lastIndexOf(".") == -1 ? fileName.length + 1 : fileName.lastIndexOf("."));
                                } else {
                                    $html.warning("请导入白名单客群文件");
                                    return false;
                                }
                                retVal = true;
                            }
                        }
                        /**
                         * 记录营销客群的类型
                         * 1：模型取数
                         * 2：导入白名单
                         */
                        marketJobDomain["marketUserType"] = userChoiceType;
                        return retVal;
                        /**end */
                    }

                    //如果没有nextB说明下一页的按钮是第一页面的
                    //如果有nextB说明是从第二页面的
                    if ($userGroupInfo.hasClass("active")) {    // 任务基本信息
                        globalRequest.iScheduling.checkMarketingTaskName(true, {
                            id: savaValue ? savaValue.id : "",
                            name: $marketJobName.val()
                        }, function (data) {
                            if (data.retValue == 0) {
                                if (utils.valid($marketJobName, utils.is_EnglishChineseNumber, marketJobDomain, "name")
                                    && utils.valid($marketTimerSelect, utils.notEmpty, marketJobDomain, "scheduleType")
                                    && utils.valid($marketBusinessTypeSelect, utils.notEmpty, marketJobDomain, "businessType")
                                    && utils.valid($startTimeInput, utils.isDateForYMD, marketJobDomain, "startTime")
                                    && utils.valid($endTimeInput, utils.isDateForYMD, marketJobDomain, "stopTime")
                                    //&& utils.valid($marketLimitSelect, utils.notEmpty, marketJobDomain, "repeatStrategy")
                                    && checkMarketLimit()
                                    && utils.valid($singleValue, utils.isPostiveNumber, marketJobDomain, "sendInterval")
                                    && utils.valid($marketTypeSelect, utils.notEmpty, marketJobDomain, "marketType")
                                    && utils.valid($marketRemarks, utils.any, marketJobDomain, "remarks")) {
                                    // 判断营销类型
                                    if ("sms" == marketJobDomain["marketType"]) {
                                        // 如果为短信类型设为选中
                                        $channelInfo.find("input:radio[value='1']").prop("checked", true);
                                    }

                                    // 开始、结束时间判断
                                    if ($startTimeInput.val() > $endTimeInput.val()) {
                                        layer.tips("开始时间不能大于结束时间", $endTimeInput);
                                        $endTimeInput.focus();
                                        return;
                                    }
                                    // 时间间隔判断
                                    var timeInterval = dateUtil.getDifferenceDay($startTimeInput.val(), $endTimeInput.val());
                                    if (timeInterval > 90) {
                                        layer.tips("开始时间与结束时间最多相隔90天", $endTimeInput);
                                        $endTimeInput.focus();
                                        return;
                                    }
                                    if (($singleValue.val() > 1) && $singleValue.val() >= timeInterval + 1) {
                                        layer.tips("触发营销间隔不能大于等于任务开始时间与结束时间的间隔", $singleValue);
                                        $singleValue.focus();
                                        return;
                                    }

                                    // 监控开始、结束时间判断
                                    if ($marketTimerSelect.val() == taskMgr_enum.schedule_type.single || $marketTimerSelect.val() == taskMgr_enum.schedule_type.manu) {
                                        if ($monitoringStartTimeInput.val() > $monitoringEndTimeInput.val()) {
                                            layer.tips("监控开始时间不能大于监控结束时间", $monitoringEndTimeInput);
                                            $monitoringEndTimeInput.focus();
                                            return;
                                        }
                                        marketJobDomain["beginTime"] = $.trim($monitoringStartTimeInput.val());
                                        marketJobDomain["endTime"] = $.trim($monitoringEndTimeInput.val());
                                    }

                                    // 分组营销
                                    var $boidSave = $all.find("label.checkbox-waveCountGroup :radio:checked");
                                    var boidSaveValue = $.trim($boidSave.val());
                                    if (boidSaveValue != 0 && boidSaveValue != 1) {
                                        layer.tips("分组营销数据异常，请关闭重试", $boidSave);
                                        $boidSave.focus();
                                    }
                                    marketJobDomain["isBoidSale"] = boidSaveValue;
                                    var $filterBlack = $all.find("label.checkbox-filterBlack :radio:checked");
                                    var filterBlackValue = $.trim($filterBlack.val())
                                    marketJobDomain["filterBlack"] = filterBlackValue;

                                    var $filterEmployee = $filterEmployeeBox.find("input[name='filterEmployee']:checked");
                                    var filterEmployeeValue = $.trim($filterEmployee.val())
                                    marketJobDomain["filterEmployee"] = filterEmployeeValue;

                                    //流程步骤二图片点亮
                                    $flowStepA.find("span").removeClass("active");
                                    $flowStepB.find("span").addClass("active");
                                    //第二页面显示
                                    $channelInfo.siblings("div.row").removeClass("active");
                                    $channelInfo.addClass("active");
                                    //给所有按钮添加pageB
                                    $this.parent().find("span").addClass("pageB");
                                    $preStep.addClass("active");
                                } else {
                                    return;
                                }
                            } else {
                                layer.tips(data.desc, $marketJobName);
                                $marketJobName.focus();
                            }
                        })
                    } else if ($channelInfo.hasClass("active")) {   // 目标用户选择 如果是精细化任务，则此处是拆分号池

                        if (utils.valid($marketJobName, utils.is_EnglishChineseNumber, marketJobDomain, "name")
                            && utils.valid($marketTimerSelect, utils.notEmpty, marketJobDomain, "scheduleType")
                            && utils.valid($marketBusinessTypeSelect, utils.notEmpty, marketJobDomain, "businessType")
                            && utils.valid($startTimeInput, utils.isDateForYMD, marketJobDomain, "startTime")
                            && utils.valid($endTimeInput, utils.isDateForYMD, marketJobDomain, "stopTime")
                            //&& utils.valid($marketLimitSelect, utils.notEmpty, marketJobDomain, "repeatStrategy")
                            && checkMarketLimit()
                            && utils.valid($singleValue, utils.isPostiveNumber, marketJobDomain, "sendInterval")
                            && utils.valid($marketRemarks, utils.any, marketJobDomain, "remarks")

                            //&& utils.valid($marketSegmentNames, utils.notEmpty, marketJobDomain, "marketSegmentNames")
                            //&& utils.valid($marketSegmentIds, utils.notEmpty, marketJobDomain, "marketSegmentIds")
                            //&& utils.valid($segmentCounts, utils.isNumber, marketJobDomain, "marketSegmentUserCounts")
                            && (utils.valid($numberLimitInput, utils.any, marketJobDomain, "marketUserCountLimit") || utils.valid($numberLimitInput, utils.isPostiveNumberNotZero, marketJobDomain, "marketUserCountLimit"))
                            && utils.valid($marketAreaIds, utils.any, marketJobDomain, "areaCodes")
                            && utils.valid($marketAreaNames, utils.any, marketJobDomain, "areaNames")
                        ) {
                            /**
                             * 2018-06-15新增
                             * updateReason:当选择短信群发的时候，测试号不在配置的时候发送，而是在执行的时候发送
                             *              隐藏发送按钮的同时，禁止提示“友情提醒的内容”
                             * updateUser:wtt
                             */
                            if ("sms" == marketJobDomain["marketType"]){
                                $testNumbersSendBtn.hide();
                                $testPhones.attr("warn", "false");
                            }else{
                                $testNumbersSendBtn.show();
                            }

                            if (!isJxhSms) {
                                //检查营销客群的类型
                                if (!checkMarketUserType()) {
                                    return;
                                }

                                if ($numberLimitInput.val() && $numberLimitInput.val() <= 0) {
                                    layer.tips("限制人数必须输入大于0的正整数", $numberLimitInput);
                                    $numberLimitInput.focus();
                                    return;
                                }
                            } else {
                                if (!$splitBox.find("input.numCount").val() || !$splitBox.find("input.poolName").val()) {
                                    layer.tips("请先确认号池", $splitBtn, {time: 2000, tips: [2, "#FF9800"]})
                                    return
                                }
                            }

                            //流程步骤三图片点亮
                            $flowStepB.find("span").removeClass("active");
                            $flowStepC.find("span").addClass("active");
                            //显示第三页面
                            $jobConfigureInfo.siblings("div.row").removeClass("active");
                            $jobConfigureInfo.addClass("active");
                            //给所有按钮添加pageC
                            $this.parent().find("span").removeClass("pageB").addClass("pageC");
                            //$nextStep.removeClass("active");
                            //$confirmStep.addClass("active");
                        }
                        else {
                            return;
                        }
                    } else if ($jobConfigureInfo.hasClass("active")) {  // 客户接触渠道
                        if (utils.valid($marketJobName, utils.is_EnglishChineseNumber, marketJobDomain, "name")
                            && utils.valid($marketTimerSelect, utils.notEmpty, marketJobDomain, "scheduleType")
                            && utils.valid($marketBusinessTypeSelect, utils.notEmpty, marketJobDomain, "businessType")
                            && utils.valid($startTimeInput, utils.isDateForYMD, marketJobDomain, "startTime")
                            && utils.valid($endTimeInput, utils.isDateForYMD, marketJobDomain, "stopTime")
                            //&& utils.valid($marketLimitSelect, utils.notEmpty, marketJobDomain, "repeatStrategy")
                            && checkMarketLimit()
                            && utils.valid($singleValue, utils.isPostiveNumber, marketJobDomain, "sendInterval")
                            && utils.valid($marketRemarks, utils.any, marketJobDomain, "remarks")

                            //&& utils.valid($marketSegmentNames, utils.notEmpty, marketJobDomain, "marketSegmentNames")
                            ////&& utils.valid($marketSegmentIds, utils.notEmpty, marketJobDomain, "marketContent")
                            //&& utils.valid($marketSegmentIds, utils.notEmpty, marketJobDomain, "marketSegmentIds")
                            //&& utils.valid($segmentCounts, utils.isNumber, marketJobDomain, "marketSegmentUserCounts")
                            && (utils.valid($numberLimitInput, utils.any, marketJobDomain, "marketUserCountLimit") || utils.valid($numberLimitInput, utils.isPostiveNumberNotZero, marketJobDomain, "marketUserCountLimit"))
                            && checkMarketTypeParas()
                            && utils.valid($marketAreaIds, utils.any, marketJobDomain, "areaCodes")
                            && utils.valid($marketAreaNames, utils.any, marketJobDomain, "areaNames")

                            // && utils.valid($marketTypeSelect, utils.notEmpty, marketJobDomain, "marketType")
                            // && checkMarketTypeParas()
                            && utils.valid($testPhones, utils.any, marketJobDomain, "testPhones")
                        ) {
                            if (!isJxhSms) {
                                // 检查营销客群类型
                                if (!checkMarketUserType()) {
                                    return;
                                }
                            }

                            var data = obj.verifyMob($testPhones.val());
                            if (!data.ret) {
                                layer.tips(data.desc, $testPhones);
                                $testPhones.focus();
                                return;
                            }

                            if ($testPhones.attr("warn") == "true") {
                                $warnMessage.show();
                                $testPhones.attr("warn", "false");
                                return;
                            }
                            if (marketJobDomain["marketType"] === "sms") {
                                marketJobDomain['marketContent'] = $smsMessageContent.val();
                                marketJobDomain['marketLongUrl'] = $smsMessageUrl.val();
                            } else if (marketJobDomain["marketType"] === "scenesms") {
                                marketJobDomain['marketContent'] = $sceneSmsMessageContent.val()
                                marketJobDomain['marketLongUrl'] = $sceneMessageUrl.val();
                            }
                            $confirmStep.addClass("active");
                            // 预览
                            var $dialog = $(".previewDiv");
                            // 加载静态页面
                            var $panel = $(".iMarket_preview").find("div.taskMgrDetailInfo").clone();
                            $dialog.find("div.taskMgrDetailInfo").remove();
                            $dialog.append($panel);

                            $nextStep.removeClass("active");
                            $flowStepC.find("span").removeClass("active");
                            $flowStepD.find("span").addClass("active");
                            // 第二页面显示
                            $dialog.siblings("div.jobConfigureInfo").removeClass("active");
                            $dialog.addClass("active");

                            var $shopTaskDetailInfo = $(".previewDiv div.taskMgrDetailInfo");

                            // 任务基本信息
                            $shopTaskDetailInfo.find(".detail_taskName").text(marketJobDomain.name || "空");
                            $shopTaskDetailInfo.find(".detail_businessTypeSelect").text(obj.getBusinessType(marketJobDomain.businessType));

                            var type = marketJobDomain.scheduleType;
                            var scheduleType = "空";
                            if (type == taskMgr_enum.schedule_type.single) {
                                scheduleType = taskMgr_enum.schedule_type.single_text;
                                $shopTaskDetailInfo.find(".detail_monitoringStartTime").text(marketJobDomain.beginTime || "09:00");
                                $shopTaskDetailInfo.find(".detail_monitoringEndTime").text(marketJobDomain.endTime || "18:00");
                                $shopTaskDetailInfo.find(".monitoring_row").show();
                            } else if (type == taskMgr_enum.schedule_type.manu) {
                                scheduleType = taskMgr_enum.schedule_type.manu_text;
                            }
                            $shopTaskDetailInfo.find(".detail_timerSelect").text(scheduleType);
                            $shopTaskDetailInfo.find(".detail_startTime").text(marketJobDomain.startTime || "空");
                            $shopTaskDetailInfo.find(".detail_endTime").text(marketJobDomain.stopTime || "空");
                            $shopTaskDetailInfo.find(".detail_boidSale").text(marketJobDomain.isBoidSale == 1 ? "是" : "否");
                            $shopTaskDetailInfo.find(".detail_intervalInSeconds_title").text(marketJobDomain.isBoidSale == 1 ? "分组间隔：" : "时间间隔：");
                            $shopTaskDetailInfo.find(".detail_repeatStrategy").text(!marketJobDomain.repeatStrategy ? "空" : "营销频次剔重（" + marketJobDomain.repeatStrategy + "）天");
                            $shopTaskDetailInfo.find(".detail_intervalInSeconds").text(marketJobDomain.sendInterval ? marketJobDomain.sendInterval + "天" : "空");
                            $shopTaskDetailInfo.find(".detail_areaNames").text(marketJobDomain.areaNames || "空");
                            $shopTaskDetailInfo.find(".detail_remarks").text(marketJobDomain.remarks || "空");

                            $shopTaskDetailInfo.find(".detail_filterBlack").text(marketJobDomain.filterBlack == 0 ? "是" : "否");
                            $shopTaskDetailInfo.find(".detail_filterEmployee").text(marketJobDomain.filterEmployee ? ( marketJobDomain.filterEmployee == 0 ? "是" : "否") : "空");

                            //隐藏任务波次和任务编码
                            $shopTaskDetailInfo.find(".taskFrequency").hide()
                            $shopTaskDetailInfo.find(".taskCode").hide()

                            // 目标用户选择
                            $shopTaskDetailInfo.find(".detail_segmentNames").text(marketJobDomain.marketSegmentNames || "空");
                            $shopTaskDetailInfo.find(".detail_segmentCounts").text(marketJobDomain.marketSegmentUserCounts || "空");
                            $shopTaskDetailInfo.find(".detail_marketSegmentIds").text(marketJobDomain.marketSegmentIds || "空");
                            $shopTaskDetailInfo.find(".detail_lastUpdateTime").text(marketJobDomain.lastUpdateTime || "空");
                            if (isJxhSms) {
                                $shopTaskDetailInfo.find(".detail_segmentCounts").text(parseInt($splitBox.find("input.numCount").val()));
                                $shopTaskDetailInfo.find(".detail_marketSegmentIds").text($splitBox.find("input.poolName").val());
                            }
                            // $shopTaskDetailInfo.find(".detail_number").text(parseInt(marketJobDomain.marketUserCountLimit) || "空");

                            // 客户接触渠道
                            $shopTaskDetailInfo.find(".marketTypeValue").hide();
                            var marketType = "空";
                            var marketTypeValue = marketJobDomain.marketType;
                            if (marketTypeValue == "sms") {
                                marketType = "短信";
                            } else if (marketTypeValue == "scenesms") {
                                marketType = "场景短信";
                                // 场景规则显示
                                $shopTaskDetailInfo.find(".marketTypeValue").show();
                                $shopTaskDetailInfo.find(".detail_marketTypeValue").text($(".sceneRuleSmsSelect").find("option:selected").text());
                            }

                            $shopTaskDetailInfo.find(".detail_marketType").text(marketType);
                            $shopTaskDetailInfo.find(".detail_AccessNumber").text(marketJobDomain.accessNumber || "空");
                            $shopTaskDetailInfo.find(".detail_Content").text(marketJobDomain.marketContent || "空");
                            $shopTaskDetailInfo.find(".detail_ContentUrl").text(marketJobDomain.marketLongUrl ? marketJobDomain.marketLongUrl : "空");
                            $shopTaskDetailInfo.find(".detail_TestPhones").text(marketJobDomain.testPhones || "空");
                        } else {
                            return;
                        }
                    }
                })
                /**
                 * 确定 事件
                 */
                $confirmStep.click(function () {
                    var type = $operateData.attr("operate");
                    var dialogIndex = $operateData.attr("index");
                    if (utils.valid($marketJobName, utils.is_EnglishChineseNumber, marketJobDomain, "name")
                        && utils.valid($marketTimerSelect, utils.notEmpty, marketJobDomain, "scheduleType")
                        && utils.valid($marketBusinessTypeSelect, utils.notEmpty, marketJobDomain, "businessType")
                        && utils.valid($startTimeInput, utils.isDateForYMD, marketJobDomain, "startTime")
                        && utils.valid($endTimeInput, utils.isDateForYMD, marketJobDomain, "stopTime")
                        //&& utils.valid($marketLimitSelect, utils.notEmpty, marketJobDomain, "repeatStrategy")
                        && checkMarketLimit()
                        && utils.valid($singleValue, utils.isPostiveNumber, marketJobDomain, "sendInterval")
                        && utils.valid($marketAreaIds, utils.any, marketJobDomain, "areaCodes")
                        && utils.valid($marketAreaNames, utils.any, marketJobDomain, "areaNames")
                        && utils.valid($marketRemarks, utils.any, marketJobDomain, "remarks")

                        //&& utils.valid($marketSegmentNames, utils.notEmpty, marketJobDomain, "marketSegmentNames")
                        //&& utils.valid($marketSegmentIds, utils.notEmpty, marketJobDomain, "marketSegmentIds")
                        && (utils.valid($numberLimitInput, utils.any, marketJobDomain, "marketUserCountLimit") || utils.valid($numberLimitInput, utils.isPostiveNumberNotZero, marketJobDomain, "marketUserCountLimit"))

                        && utils.valid($marketTypeSelect, utils.notEmpty, marketJobDomain, "marketType")
                        && checkMarketTypeParas()
                        && utils.valid($testPhones, utils.any, marketJobDomain, "testPhones")
                    ) {
                        //if(!checkMarketUserType){return;}

                        // 监控开始、结束时间
                        //if ($marketTimerSelect.val() == taskMgr_enum.schedule_type.single) {
                        //    marketJobDomain["beginTime"] = $.trim($monitoringStartTimeInput.val());
                        //    marketJobDomain["endTime"] = $.trim($monitoringEndTimeInput.val());
                        //} else {
                        //    marketJobDomain["beginTime"] = "09:00";
                        //    marketJobDomain["endTime"] = "18:00";
                        //}
                        marketJobDomain["beginTime"] = $.trim($monitoringStartTimeInput.val());
                        marketJobDomain["endTime"] = $.trim($monitoringEndTimeInput.val());

                        marketJobDomain["marketUserCountLimit"] = parseInt(marketJobDomain["marketUserCountLimit"]) || "";
                        delete marketJobDomain.operateType;

                        if (type === "create" || type === "modelToCreate") {
                            globalRequest.iScheduling.createMarketingTask(true, marketJobDomain, function (data) {
                                if (data.retValue === 0) {
                                    dataTable.ajax.reload();
                                    layer.close(dialogIndex);
                                    layer.msg("创建成功", {time: 1000});
                                    if (type === "modelToCreate") {
                                        $("#menuTree").find("a.model_content").trigger("click");
                                    }
                                } else {
                                    layer.alert(data.desc, {icon: 6});
                                }
                            })
                        } else if (type === "update" || type === "resubmit") {
                            marketJobDomain["id"] = savaValue.id;
                            if (isJxhSms) {
                                var splitNum = parseInt($splitSelect.val() )|| 1;     //任务分拆份数
                                var allCount = parseInt($splitBox.find("input.numCount").val()) || marketJobDomain.marketSegmentUserCounts;
                                var poolName = $splitBox.find("input.poolName").val();
                                var subTaskSegments = (allCount - allCount % splitNum) / splitNum;        // 子任务号池数量
                                var list = []  // 任务分拆后的所有子任务构成， 每个子任务除了name和用户数量，其他都相同
                                if (splitNum > 1) {
                                    for (var i = 0; i < splitNum; i++) {
                                        var subMarketJobDomain = JSON.parse(JSON.stringify(marketJobDomain))
                                        subMarketJobDomain["name"] = marketJobDomain["name"] + "_" + i;
                                        subMarketJobDomain["marketSegmentIds"] = poolName + "_" + splitNum + "_" + i;
                                        subMarketJobDomain["marketSegmentUserCounts"] = subTaskSegments;
                                        if (i < allCount % splitNum) {
                                            subMarketJobDomain["marketSegmentUserCounts"] += 1;
                                        }
                                        list.push(subMarketJobDomain)
                                    }
                                } else {
                                    // 未拆分（拆分为1份）
                                    marketJobDomain["marketSegmentUserCounts"] = allCount;
                                    marketJobDomain["marketSegmentIds"] = poolName;
                                    list.push(marketJobDomain)
                                }
                                globalRequest.iScheduling.autoCreateMarketingTask(true, list, function (res) {
                                     if (res.retValue === 0) {
                                         dataTable.ajax.reload();
                                         layer.close(dialogIndex);
                                         layer.msg("任务拆分成功", {time: 1000});
                                     } else {
                                         layer.alert(res.desc, {icon: 6});
                                     }
                                 }, function (err) {
                                     layer.alert(err, {icon: 6});
                                 })
                            } else {
                                globalRequest.iScheduling.updateMarketingTask(true, marketJobDomain, function (data) {
                                    if (data.retValue === 0) {
                                        dataTable.draw(false);
                                        layer.close(dialogIndex);
                                        layer.msg("更新成功", {time: 1000});
                                    } else {
                                        layer.alert(data.desc, {icon: 6});
                                    }
                                })
                            }
                        } else if (type === "show") {
                            layer.close(dialogIndex);
                        } else {
                            layer.alert("系统异常", {icon: 6});
                        }
                    }
                })

                function checkMarketTypeParas() {
                    if (marketJobDomain["marketType"] == "sms") {
                        return utils.valid($smsAccessNumberSelect, utils.is_EnglishChineseNumber, marketJobDomain, "accessNumber")
                            && utils.valid($smsMessageContent, utils.notEmpty, marketJobDomain, "marketContent")
                            && utils.valid($smsContentId, utils.any, marketJobDomain, "marketContentId")
                    } else if (marketJobDomain["marketType"] == "scenesms") {
                        return utils.valid($sceneSmsAccessNumberSelect, utils.is_EnglishChineseNumber, marketJobDomain, "accessNumber")
                            && utils.valid($sceneSmsMessageContent, utils.notEmpty, marketJobDomain, "marketContent")
                            && utils.valid($sceneSmsContentId, utils.any, marketJobDomain, "marketContentId")
                            && utils.valid($sceneRuleSmsSelect, utils.notEmpty, marketJobDomain, "marketTypeValue")
                    } else {
                        return true;
                    }
                }

                function verifyTreeNodeCheck(treeNodes,treeNode) {
                    if (treeNodes) {
                        var treeLength = treeNodes.length,selectedNodesLength = treeLength + (treeNode.checked? - 1 :  + 1)
                        if (treeLength > 0 && selectedNodesLength > 3) {
                            return false;
                        }
                    }
                    return true;
                }

                /**
                 * 校验剔除策略是否小于等于7
                 * @returns {boolean}
                 */
                function checkMarketLimit() {
                    if (utils.valid($marketLimitSelect, utils.isPostiveNumberNotZero, marketJobDomain, "repeatStrategy")
                        && $marketLimitSelect.val() <= 7) {
                        marketJobDomain["repeatStrategy"] = $.trim($marketLimitSelect.val());
                        return true;
                    } else {
                        layer.tips($marketLimitSelect.attr("title"), $marketLimitSelect);
                        $marketLimitSelect.focus();
                        return false;
                    }
                }
            }
        }
    }

    obj.handleTaskSetings = function ($dialog, initValue) {
        if (!$dialog || !initValue) {
            return;
        }
        /**
         * 任务基本信息
         */
        var isJxhSms = initValue ? initValue.marketType == "jxhsms" : false;
        var $marketJobId = $dialog.find("input.id"),                        // 任务Id
            $marketJobName = $dialog.find("input.name"),                    // 任务名称
            $marketTypeSelect = $dialog.find("select.marketTypeSelect"),     // 营销方式
            $marketBusinessTypeSelect = $dialog.find("select.marketBusinessTypeSelect"),   // 业务类别
            $marketTimerSelect = $dialog.find("select.timerSelect"),        // 调度类型
            $startTimeInput = $dialog.find("input.startTime"),              // 开始时间
            $endTimeInput = $dialog.find("input.endTime"),                  // 结束时间
            $marketMonitoringTimeRow = $dialog.find(".marketMonitoringTime"),      // 监控行
            $monitoringStartTimeInput = $dialog.find("input.monitoringStartTime"), // 监控开始时间
            $monitoringEndTimeInput = $dialog.find("input.monitoringEndTime"),     // 监控结束时间
            $singleValueInput = $dialog.find("input.singleValue"),          // 时间间隔
            $marketLimitSelect = $dialog.find(".marketLimitSelect"),  // 剔除策略
            $marketAreaNames = $dialog.find("textarea.areaNames"),          // 营销地区
            $marketAreaIds = $dialog.find("input.areaIds"),                 // 营销地区Id
            $mark = $dialog.find("textarea.remarks"),                       // 任务描述
            /**
             * 目标用户选择
             */
            $marketSegmentNames = $dialog.find(".marketSegments .segmentNames"),    // 客户群
            $marketSegmentCounts = $dialog.find(".marketSegments .segmentCounts"),                // 客户群人数
            $marketSegmentIds = $dialog.find(".marketSegments .segmentIds"),                // 客户群Id
            $numberLimitInput = $dialog.find("input.numberLimit"),                          // 限制人数
            /**
             * 客户接触渠道
             */
            $marketTypeSelect = $dialog.find("select.marketTypeSelect"),            // 营销方式
            // 短信
            $smsAccessNumberSelect = $dialog.find("select.smsAccessNumberSelect"),  // 接入号
            $smsContent = $dialog.find("textarea.smsMessageContent"),               // 短息内容
            $smsUrl = $dialog.find("textarea.smsMessageUrl"),                       // 短息地址
            $smsContentId = $dialog.find(".marketType input.smsContentId"),         // 短信内容Id

            $batchRow = $dialog.find("div.batch-row"),                         // 导入白名单模块
            $modelUser = $dialog.find("div.modelUser"),                        // 模型取数模块
            $appointUserFileName = $dialog.find("input.file-name"),            // 导入文件名
            $appointUserFile = $dialog.find(".batch-row input[type=file]"),    // 导入文件
            $appointUserUploadBtn = $dialog.find("input.file-upload-btn"),     // 白名单上传按钮
            $userType = $dialog.find("input.userType"),                        // 用户类型
            $appointUserCounts = $dialog.find("input.appointUserCounts"),      // 导入用户数

            // 场景短信
            $sceneSmsAccessNumberSelect = $dialog.find(".sceneSms select.sceneSmsAccessNumberSelect"),  // 接入号
            $sceneSmsMessageContent = $dialog.find(".sceneSms textarea.sceneSmsMessageContent"),        // 短信内容
            $sceneSmsMessageUrl = $dialog.find(".sceneSms textarea.sceneMessageUrl"),                    // 短信地址
            $sceneSmsContentId = $dialog.find("input.sceneSmsContentId"),                               // 短信内容Id
            $sceneRuleSmsSelect = $dialog.find("select.sceneRuleSmsSelect"),                            // 场景规则
            $testPhones = $dialog.find("textarea.marketTestPhones"),    // 测试号

            $infoConfigBody = $dialog.find("div.infoConfigBody"),
            $editStep = $dialog.find("div.step").find("span.edit"),
            $nextStep = $dialog.find("div.step").find("span.next"),
            $closeBtn = $dialog.find("div.step").find("span.closeBtn"),
            $confirmStep = $dialog.find("div.step").find("span.confirm"),
            $preStep = $dialog.find("div.step").find("span.pre"),
            $flowStepA = $dialog.find("div.flowStep").find("div.flowStepA"),
            $flowStepC = $dialog.find("div.flowStep").find("div.flowStepC"),
            $flowStepD = $dialog.find("div.flowStep").find("div.flowStepD");
        if (initValue.operateType != "create" && initValue.operateType != "modelToCreate") {
            /**
             * 任务基本信息
             */
            $marketJobId.val(initValue.id);
            $marketJobName.val(initValue.name);
            $marketBusinessTypeSelect.val(initValue.businessType);
            $marketTimerSelect.val(initValue.scheduleType);
            if (initValue.scheduleType == taskMgr_enum.schedule_type.single || initValue.scheduleType == taskMgr_enum.schedule_type.manu) {
                $monitoringStartTimeInput.val(initValue.beginTime);
                $monitoringEndTimeInput.val(initValue.endTime);
                $marketMonitoringTimeRow.show();
            }
            $startTimeInput.val(initValue.startTime);
            $endTimeInput.val(initValue.stopTime);
            $singleValueInput.val(initValue.sendInterval);
            $marketLimitSelect.val(initValue.repeatStrategy);
            $marketAreaNames.val(initValue.areaNames);
            $marketAreaIds.val(initValue.areaCodes);
            $mark.val(initValue.remarks);
            // 分组营销,剔除黑名单选中
            $dialog.find("label.checkbox-inline :radio[value='" + initValue.isBoidSale + "']").click();
            $dialog.find("label.checkbox-filterBlack :radio[value='" + initValue.filterBlack + "']").click();
            $dialog.find(".filterEmployeeBox :radio[value='" + initValue.filterEmployee + "']").click();

            /**
             * 目标用户选择
             * todo
             */
            // 禁止修改
            $modelUser.find(".segmentNames")[0].disabled = true;
            $batchRow.find(".col-md-11 input").attr("disabled", true);
            $userType.prop("disabled", true);
            $dialog.find(".marketSegments input:radio[value='" + initValue.marketUserType + "']").prop("checked", true);

            if (initValue.marketUserType == 1) {
                $dialog.find(".marketSegments input:radio[value='1']").prop("checked", true);
                obj.setModelItemShow(initValue.marketSegmentIds,initValue.marketSegmentNames, $marketSegmentNames);
                $marketSegmentCounts.val(initValue.marketSegmentUserCounts);
                $marketSegmentIds.val(initValue.marketSegmentIds);
            } else if (initValue.marketUserType == 2) {
                // wtt todo
                $appointUserFileName.val(initValue.marketSegmentNames);
                $appointUserCounts.val(initValue.marketSegmentUserCounts);
                dbFileId = initValue.marketSegmentIds;
            }
            //$marketSegmentNames.val(initValue.marketSegmentNames);
            //$marketSegmentCounts.val(initValue.marketSegmentUserCounts);
            //$marketSegmentIds.val(initValue.marketSegmentIds);
            initMarketUserCountLimit();
            /**
             * 客户接触渠道
             */
            $marketTypeSelect.val(initValue.marketType);
            initTypeBody();
            $testPhones.val(initValue.testPhones);

            /**
             * 营销方式 下拉框
             */
            function initTypeBody() {
                $marketTypeSelect.trigger("change", [true]);
                switch (initValue.marketType) {
                    case "sms":
                        $smsAccessNumberSelect.val(initValue.accessNumber);
                        $smsContentId.val(initValue.marketSmsContentId);
                        $smsContent.val(initValue.marketContent.split('#$$#')[0]);
                        $smsUrl.val(initValue.marketContent.split('#$$#')[1]);
                        break;
                    case "scenesms":
                        $sceneSmsAccessNumberSelect.val(initValue.accessNumber);
                        $sceneRuleSmsSelect.val(initValue.marketTypeValue);
                        $sceneSmsContentId.val(initValue.marketSmsContentId);
                        $sceneSmsMessageContent.val(initValue.marketContent.split('#$$#')[0]);
                        $sceneSmsMessageUrl.val(initValue.marketContent.split('#$$#')[1])
                        $sceneRuleSmsSelect.trigger('chosen:updated');
                        break;
                }
            }

            function initMarketUserCountLimit() {
                if (parseInt(initValue.marketUserCountLimit) > 0) {
                    $numberLimitInput.val(initValue.marketUserCountLimit);
                }
            }
        }


        if (initValue.operateType == "create" || initValue.operateType == "modelToCreate") {
            $dialog.find("label.checkbox-inline :radio[value='0']").click();
            $flowStepA.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.userGroupInfo").addClass("active");
            obj.setModelItemShow(initValue.marketSegmentIds,initValue.marketSegmentNames, $marketSegmentNames);
            $marketSegmentCounts.val(initValue.marketSegmentUserCounts);
            $closeBtn.css("display", "inline-block");
            $dialog.find(".marketSegments input:radio[value='1']").prop("checked", true);
            return;
        }
        else if (initValue.operateType == "update") { // 编辑时，默认选中完成状态
            $marketJobName.attr("disabled", "disabled");
            $flowStepA.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.userGroupInfo").addClass("active");
            $nextStep.siblings().removeClass("active");
            $nextStep.addClass("active");
            $closeBtn.css("display", "inline-block");
            $dialog.find("label.checkbox-inline :radio[value='0']").attr("disabled", "disabled")
            $dialog.find("label.checkbox-inline :radio[value='1']").attr("disabled", "disabled")
            $marketTypeSelect.attr("disabled", "disabled");
            /**
             * 以下为精细化周期任务拆分后子任务编辑功能新增（对其他功能是否影响未知） start
             */
            $marketTimerSelect.val(initValue.scheduleType);
            if (initValue.scheduleType == taskMgr_enum.schedule_type.single) {
                $monitoringStartTimeInput.val(initValue.beginTime);
                $monitoringEndTimeInput.val(initValue.endTime);
                $marketMonitoringTimeRow.show();
            }
            if (isJxhSms) {
                $marketTypeSelect.val("sms");
                $marketJobName.removeAttr("disabled").val('');
                //$marketSegmentNames.val(initValue.marketSegmentNames)
                obj.setModelItemShow(initValue.marketSegmentIds,initValue.marketSegmentNames, $marketSegmentNames);
            }
        } else if (initValue.operateType == "resubmit") {
            $flowStepC.siblings().find("span").removeClass("active");
            $flowStepC.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.jobConfigureInfo").addClass("active");
            $confirmStep.siblings().removeClass("active");
            $confirmStep.addClass("active");
            $confirmStep.text("重新提交");
            $preStep.addClass("active");
            $preStep.parent().find("span").addClass("pageB");
            $closeBtn.css("display", "inline-block");
        } else if (initValue.operateType == "show") {// 查看信息时
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.finishInfo").addClass("active");
            $editStep.siblings().removeClass("active");
            $editStep.addClass("active");
            $editStep.text("查看详情");
            $confirmStep.remove();
            $testPhones.attr("warn", "false");
            $closeBtn.css("display", "inline-block");
            $infoConfigBody.find(".numberLimit").unbind("click");
            $infoConfigBody.find("button.btn").remove();
            $infoConfigBody.find("input").attr("disabled", "disabled");
            $infoConfigBody.find("textarea").attr("disabled", "disabled");
            $infoConfigBody.find("select").attr("disabled", "disabled");
            $infoConfigBody.find(".buttons").remove();
            $infoConfigBody.find("#level").css("background-color", "#eee");
        } else if (initValue.operateType == "audit") {
            $flowStepD.siblings().find("span").removeClass("active");
            $flowStepD.find("span").addClass("active");
            $infoConfigBody.find("div.auditInfo").addClass("active").siblings().removeClass("active");
            $confirmStep.addClass("active").siblings().removeClass("active");
            $testPhones.attr("warn", "false");
            $closeBtn.css("display", "inline-block");
        }

    }

    /**
     * 设置展现模型
     * @param marketSegmentNames
     * @param $marketSegmentNames
     */
    obj.setModelItemShow = function(marketSegmentIds,marketSegmentNames,$marketSegmentNames) {
        var names = [];
        if (marketSegmentIds && marketSegmentNames) {
            var segmentIds = marketSegmentIds.split(",");
            var segmentNames = marketSegmentIds.split(",");
            if (segmentIds.length == segmentNames.length) {
                for (var i=0;i<segmentIds.length;i++) {
                    names.push(modelShowItem.replace(/AAA/g,segmentIds[i]).replace(/BBB/g,segmentNames[i]));
                }
            }
        } else {
            return;
        }
        $marketSegmentNames.empty().append(names.join(""));
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

    /**
     * 获取营销方式
     * @param type
     * @returns {*}
     */
    obj.getMarketType = function (type) {
        switch (type) {
            case "sms":
                return "周期任务";
            case "scenesms":
                return "场景任务";
            case "jxhscene":
                return "精细化实时任务";
            case "jxhsms":
                return "精细化周期任务";
            default:
                return "未知";
        }
    }

    /**
     *
     * 获取截止时间
     */
    obj.getStopTime = function (data,row) {
        var rowId = row.id;
        var rowStopTime = row.stopTime;
        var stopTimeStamp = Date.parse(rowStopTime);
        return "<input type='text' class='form-control' id='queryDate" + row.id + "' style='width:90px;padding:2px 5px 2px 5px;cursor:pointer' value='" + data + "' onclick='save("+rowId+","+stopTimeStamp+")' readonly/>";
    }

    /**
     * 获取dataTable请求地址
     * @param status
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function (status) {
        var taskUrl = "queryMarketingTasksByPage.view",
            taskPoolUrl = "queryMarketingTaskPoolByPage.view",
            name = $.trim($(".queryName").val()),
            stats = status == 0 ? $.trim($(".stats").val()) : $.trim($(".poolStats").val()),
            marketType = $.trim($(".queryMarketType").val()),
            businessType = $.trim($(".queryMarketBusinessType").val()),
            param = '?name=' + encodeURIComponent(name) + '&status=' + stats + '&marketType=' + marketType + '&businessType=' + businessType;
        return (status == 0) ? (taskUrl + param) : (taskPoolUrl + param);
    }

    /**
     * 验证手机号格式
     * @param array 手机号数组
     * @returns {{ret: boolean, desc: string}}
     */
    obj.verifyMob = function (_array) {
        var result = {ret: true, desc: ''}
        if (_array) {
            var array = _array.split(',');
            for (var i = 0; i < array.length; i++) {
                if (!$.trim(array[i])) {
                    result.ret = false;
                    result.desc = "手机号不能为空";
                    break
                }
                if (!/^1[3|4|5|6|7|8|9]\d{9}$/.test($.trim(array[i]))) {
                    result.ret = false;
                    result.desc = "[" + array[i] + "] 手机号格式不正确";
                    break
                }
            }
        }
        return result;
    }

    return obj;

}()

function onLoadBody(status) {
    taskMgr.initialize(status);
    taskMgr.initData(status);
    taskMgr.initEvent(status);
}

function save(rowId,stopTimeStamp){
    var endTime;
    var date = new Date();
    var mon = date.getMonth() + 1;
    var day = date.getDate();
    var now = date.getFullYear() + "-" + (mon<10?"0"+mon:mon) + "-" +(day<10?"0"+day:day);
    var stopTime = new Date();
    stopTime.setTime(stopTimeStamp);
    var stopMon = stopTime.getMonth() + 1;
    var stopDay = stopTime.getDate();
    var stopDate = stopTime.getFullYear() + "-" + (stopMon<10?"0"+stopMon:stopMon) + "-" +(stopDay<10?"0"+stopDay:stopDay);
    laydate({
        elem: '#queryDate' + rowId,
        type: 'datetime',
        isclear: true,
        format: 'YYYY-MM-DD',
        choose: function (dates) { //选择好日期的回调
            endTime = dates;
            if(now <= endTime) {
                $.ajax({
                    type: 'POST',
                    url: 'updateNewEndTimeForTask.view',
                    data: {"taskId": rowId, "endTime": endTime},
                    success: function (obj) {
                        layer.msg("延期成功", {time: 1000});
                    },
                    error: function (obj) {
                        layer.alert("延期失败", {icon: 6});
                    }
                });
            } else {
                layer.msg("延期时间需大于等于当日", {time: 1000});
                $('#stopDate'+rowId).val(stopDate);
            }
        }
    });

}
