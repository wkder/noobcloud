/**
 * Created by hale on 2017/7/12.
 */

var oldCustomer = function () {
    var appointFileId = {}, blackFileId = {}, businessFileId = {}, loginUser = {}, loginUserDignity = {},
        dataTable = {}, obj = {};
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
            huangPu: "4",
            sheQu: "5",
            xiaoYuan: "6",
            qiTa: "7"
        },
        loginUserType: {
            province: 1,
            city: 2,
            business: 3
        }
    };

    obj.initTaskStatus = function(status){
        var $querySelectStatus = $(".querySelectStatus");
        $querySelectStatus.empty();
        $querySelectStatus.append("<option value=''>请选择状态</option>");
        $querySelectStatus.append("<option value='1'>待审核</option>");
        $querySelectStatus.append("<option value='2'>审核成功</option>");
        $querySelectStatus.append("<option value='3'>审核拒绝</option>");
        $querySelectStatus.append("<option value='6'>已终止</option>");
        $querySelectStatus.append("<option value='20'>已上线</option>");
        status != 0 ? $querySelectStatus.append("<option value='7'>已下线</option>"):"";
    };

    obj.initialize = function (status) {
        status != 0 ? $("div.iMarket_Body .addBtn").hide() : $("div.iMarket_Body .addBtn").show();
        obj.initTaskStatus(status);
    }

    obj.initData = function (status) {
        var options = {
            ele: $('table.taskTab'),
            ajax: {url: obj.getAjaxUrl(status), type: "POST"},
            columns: [
                {data: "id", title: "任务ID", className: "dataTableFirstColumns", width: "10%"},
                {data: "taskName", title: "任务名称", width: "20%"},
                {
                    data: "", title: "地市", visable: status != 0,
                    render: function (data, type, row) {
                        if (row.taskType == 0) {
                            return "江苏省";
                        } else if (row.taskType == 1) {
                            return row.areaDesc;
                        } else {
                            return "未知";
                        }
                    }
                },
                {data: "areaDesc", title: "营销范围"},
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
                    data: "status", title: "状态", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa'>草稿</i>";
                        } else if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>待审核</i>";
                        } else if (row.status == 2) {
                            return "<i class='fa' style='color: green;'>审核成功</i>";
                        } else if (row.status == 3) {
                            return "<i class='fa' style='color: red;' onmouseover='oldCustomer.hoverDecisionDesc(this, " + row.id + ")'>审核拒绝</i>";
                        } else if (row.status == 4) {
                            return "<i class='fa' style='color: blue;'>已暂停</i>";
                        } else if (row.status == 7) {
                            return "<i class='fa' style='color: blue;'>已下线</i>";
                        } else if (row.status == 6) {
                            return "<i class='fa' style='color: red;'>已终止</i>";
                        } else if (row.status == 20) {
                            return "<i class='fa' style='color: blue;'>已上线</i>";
                        } else if (row.status == -1) {
                            return "<i class='fa' style='color: red;'>已删除</i>";
                        } else {
                            return "<i class='fa'>未知</i>";
                        }
                    }
                },
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var buttons = "",
                            editBtnHtml = "", deleteBtnHtml = "", stopHtml = "", executeHtml = "";
                        var viewBtnHtml = "<a title='预览' class='viewBtn btn btn-primary btn-preview btn-sm' href='javascript:void(0)' onclick='oldCustomer.viewItem(" + row.id + ")'>预览</a>";
                        if (globalConfigConstant.loginUser.id == row.createUser || row.taskSource == 'jxhscene') {
                            editBtnHtml = "<a title='编辑'  class='editBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='oldCustomer.editItem(" + row.id + ")' >编辑</a>";
                            deleteBtnHtml = "<a title='删除' class='deleteBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='oldCustomer.deleteItem(" + row.id + ",\"" + row.taskName + "\")'>删除</a>";
                            stopHtml = "<a title='一键终止任务' class='status btn btn-warning btn-edit btn-sm ' href='javascript:void(0)' onclick='oldCustomer.stopTask(" + row.id + ",\"" + row.taskName + "\"," + row.status + ")' >终止</a>";
                            executeHtml = "<a title='上线' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='oldCustomer.executeTask(" + row.id + ",\"" + row.taskName + "\")' >上线</a>";
                        }
                        if (status == "0") {    // 老用户任务中心
                            buttons += viewBtnHtml;
                            if (row.status == 0 || row.status == 1 || row.status == 3 || row.status == 6) {  // 待审核、审核拒绝、已终止状态 显示编辑、删除按钮
                                buttons += deleteBtnHtml + editBtnHtml;
                            } else if (row.status == 2) {   // 审核成功 显示 上限按钮
                                buttons += executeHtml;
                                if(row.taskSource == 'jxhscene'){
                                    buttons += deleteBtnHtml + editBtnHtml;
                                }
                            } else if (row.status == 20) {  // 上线状态 显示终止按钮
                                buttons += stopHtml;
                            }
                        } else if (status == "1") { // 老用户查询
                            buttons = viewBtnHtml;
                        }
                        return buttons;
                    }
                }
            ]
        };
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
        $(".addBtn").click(function () {
            obj.initElement($("#dialogPrimary"));
            obj.initElementValue($("#dialogPrimary"), {operateType: "create"});

            $plugin.iModal({
                title: '新增任务',
                content: $("#dialogPrimary"),
                area: '750px',
                btn: []
            }, null, null, function (layero, index) {
                layero.find('.layui-layer-btn').remove();
                layero.find("div.data").attr("index", index).attr("operate", "create");
            })
        })
    }

    /**
     * 预览 事件
     * @param task
     */
    obj.viewItem = function (id) {
        obj.initDetailDialog($("#taskMgrDetailDialog"));
        obj.initDetailValue(id, "preview");
        $("#taskMgrDetailDialog").show();
        $("#shopTaskDetailDialog").hide();
        $plugin.iModal({
            title: '预览任务',
            content: $("#commonPage"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    }

    /**
     * 修改 事件
     * @param task
     */
    obj.editItem = function (id) {
        globalRequest.iOldCustomer.previewOldCustomer(true, {id: id}, function (data) {
            if (!data) {
                layer.alert("根据ID查询炒店数据失败", {icon: 6});
                return;
            }
            var task = data.domain;
            task["operateType"] = "update";
            obj.initElement($("#dialogPrimary"), task);
            obj.initElementValue($("#dialogPrimary"), task);

            $plugin.iModal({
                title: '修改任务',
                content: $("#dialogPrimary"),
                area: '750px',
                btn: []
            }, null, null, function (layero, index) {
                layero.find('.layui-layer-btn').remove();
                layero.find("div.data").attr("index", index).attr("operate", "update");
            })
        }, function () {
            layer.alert("根据ID查询炒店数据失败", {icon: 6});
        })
    }

    /**
     * 删除 事件
     * @param id
     * @param name
     */
    obj.deleteItem = function (id, name) {
        layer.confirm('确认删除任务:' + name + "?", {icon: 3, title: '提示'}, function (index) {
            globalRequest.iOldCustomer.deleteOldCustomer(true, {id: id}, function () {
                layer.close(index);
                dataTable.ajax.reload()
                layer.msg("删除成功", {time: 1000});
            }, function () {
                layer.alert('操作数据库失败', {icon: 6});
            })
        })
    }

    /**
     * 上线 事件
     * @param id
     * @param name
     */
    obj.executeTask = function (id, name) {
        obj.initDetailDialog($("#taskMgrDetailDialog"));
        obj.initDetailValue(id, "execute");
        $("#taskMgrDetailDialog").show();
        $("#shopTaskDetailDialog").hide();
        $plugin.iModal({
            title: '上线任务',
            content: $("#commonPage"),
            area: '750px',
            btn: ['确定', '取消']
        }, function (index, layero) {
            globalRequest.iOldCustomer.executeOldCustomerTask(true, {id: id}, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    dataTable.ajax.reload();
                    layer.msg("上线成功", {time: 1000});
                } else {
                    layer.alert("上线失败, "+data.desc, {icon: 6});
                }
            }), function () {
                layer.alert('操作数据库失败');
            }
        })
    }

    // 显示审核拒绝原因浮动窗口
    obj.hoverDecisionDesc = function (element, id) {
        if (id <= 0) {
            return;
        }
        globalRequest.iOldCustomer.getOldCustomerTaskAuditReason(true, {taskId: id}, function (data) {
            if (data && data.reason) {
                layer.tips(data.reason, $(element), {
                    tips: [1, '#00B38B'],
                    time: 1500
                });
            }
        })
    }

    /**
     * 终止 事件
     * @param id
     * @param name
     */
    obj.stopTask = function (id, name) {
        layer.confirm('确认终止任务:' + name + "?", function (index) {
            layer.close(index);
            globalRequest.iOldCustomer.stopTask(true, {id: id}, function (data) {
                if (data.retValue === 0) {
                    dataTable.ajax.reload();
                    layer.msg("终止任务成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                layer.alert('操作数据库失败');
            })
        })
    }

    /**
     * 初始化对话框元素内容-新增/修改
     * @param $dialog
     * @param saveValue
     */
    obj.initElement = function ($dialog, saveValue) {
        var $all = $("div.iMarket_Content").find("div.marketJobEditInfo").clone();
        $dialog.empty().append($all);

        initAll();

        function initAll() {
            /**
             * 任务基本信息
             */
            var $taskName = $all.find("input.taskName"),                // 任务名称
                $startTimeInput = $all.find("input.startTime"),         // 开始时间
                $endTimeInput = $all.find("input.endTime"),             // 结束时间
                $remark = $all.find(".remark"),                         // 任务描述
                /**
                 * 任务用户信息
                 */
                $targetContainer = $all.find(".targetUser"),                // 目标用户容器
                $provinceRadio = $all.find(".radiosProvince"),              // 全省 radio
                $provinceLabel = $all.find(".targetUser-province label"),   // 全省 名称
                $cityRadio = $all.find(".radiosCity"),                      // 地市 radio
                $cityLabel = $all.find(".targetUser-city .targetUser-city-text"),     // 地市 名称
                $cityItemLabel = $all.find(".targetUser-city div label"),   // 地市 checkbox名称
                $cityItemChecks = $all.find(".targetUser-city :checkbox"),  // 地市 checkbox
                $appointUserInput = $all.find(".txtAppointUser"),           // 指定用户 文本框
                $appointUserIds = $all.find(".appointUsersIds"),            // 指定用户 隐藏域 存放批次ID
                $appointUserBtn = $all.find(".btnAppointUser"),             // 指定用户 导入按钮
                $blockUserInput = $all.find(".txtBlockUser"),               // 免打扰用户 文本框
                $blockUserIds = $all.find(".blockUsersIds"),                // 免打扰用户 隐藏域 存放批次ID
                $blockUserBtn = $all.find(".btnBlockUser"),                 // 免打扰用户 导入按钮
                /**
                 * 营销渠道信息
                 */
                $channelContainer = $all.find(".channel"),                  // 接触渠道容器
                $marketName = $all.find("input.marketName"),                // 营销名称
                $marketContent = $all.find("textarea.marketContent"),       // 营销用语
                $onlineChk = $all.find(".radiosOnline"),                    // 线上 radio
                $onlineLabel = $all.find(".channel-online .channel-online-text"),               // 线上 radio名称
                $onlineUrlInput = $all.find(".txtOnLineUrl"),               // 线上 办理链接 文本框
                $offlineChk = $all.find(".radiosOffline"),                  // 线下 radio
                $offlineLabel = $all.find(".channel-offline .channel-offline-text"),            // 线下 radio名称
                $offlineBusinessType = $all.find(".offlineBusinessType"),
                $offlineBusinessLabel = $all.find(".channel-offline .checkbox-inline"),         // 线下 label
                $offlineChecks = $all.find(".channel-offline .checkbox-inline :checkbox"),      // 线下 checkbox
                $offlineBusinessInput = $all.find(".txtOffline"),           // 线下 导入 文本框
                $offlineBusinessIds = $all.find(".offlineBusinessIds"),     // 线下 导入 隐藏域 存放批次ID
                $offlineBtn = $all.find(".btnOffline"),                     // 线下 导入 按钮
                taskBaseInfo = $all.find("div.taskBaseInfo"),               // 任务基本信息
                $userInfoInfo = $all.find("div.userInfo"),                  // 任务用户信息
                $channelInfo = $all.find("div.channelInfo"),                // 营销渠道信息
                $auditInfo = $all.find("div.auditInfo"),                    // 预览

                $preStep = $all.find("span.pre"),           // 上一步
                $nextStep = $all.find("span.next"),         // 下一步
                $confirmStep = $all.find("span.confirm"),   // 确定
                $closeBtn = $all.find("span.closeBtn"),     // 关闭
                $operateData = $all.find("div.data"),       // 记录状态
                $flowStepA = $all.find("div.flowStepContainer div.flowStep div.flowStepA"),
                $flowStepB = $all.find("div.flowStepContainer div.flowStep div.flowStepB"),
                $flowStepC = $all.find("div.flowStepContainer div.flowStep div.flowStepC"),
                $flowStepD = $all.find("div.flowStepContainer div.flowStep div.flowStepD");

            initStartEndTime();
            // 初始化指定用户文件
            initAppointUsers();
            // 初始化免打扰用户文件
            initBlackUsers();
            // 初始化营业文件
            initBusiness();
            // 初始化事件
            initEvents();

            /**
             * 初始化 开始、结束时间
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

                function setStandardData(data) {
                    if (data < 10) {
                        return "0" + data;
                    }
                    return data;
                }
            }

            function initAppointUsers() {
                $appointUserBtn.click(function () {
                    if ($appointUserInput.val()) {
                        layer.confirm("重新导入指定用户文件会覆盖当前数据", function (index) {
                            layer.close(index);
                            appointUsers();
                        });
                    } else {
                        appointUsers()
                    }

                    function appointUsers() {
                        appointFileId = null;
                        // 加载静态页面
                        var $appointDialog = $("#importAppointDialog");
                        var $appointPanel = $(".iMarket_Content").find("div.importAppointInfo").clone();
                        $appointDialog.find("div.importAppointInfo").remove();
                        $appointDialog.append($appointPanel);
                        // initHistoryFile($("#importAppointDialog .importSegmentInfo .historyInfo"), "shoptask_appointUsers");
                        $plugin.iModal({
                            title: '导入指定用户',
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
                            globalRequest.iOldCustomer.saveOldCustomerAppointUsers(true, {fileId: appointFileId}, function (data) {
                                if (data.retValue == 0) {
                                    $appointUserIds.val(appointFileId);
                                    $appointUserInput.val("成功导入用户数:" + data.num);
                                    layer.close(index);
                                    layer.msg("指定用户文件导入成功", {time: 1000});
                                } else {
                                    layer.alert("指定用户文件导入失败，" + data.desc, {icon: 6});
                                }
                            }, function () {
                                layer.alert("指定用户文件导入失败", {icon: 6});
                            });
                        }

                        $("#importAppointDialog .importAppointInfo").find(".importForm").find("input[type=file]").click(function (e) {
                            $(this).val("");
                            $("#importAppointDialog .fileUploadName").val("");
                        }).change(function (e) {
                            try {
                                $("#importAppointDialog .fileUploadName").val("");
                                var src = e.target.value;
                                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                                var fileExt = fileName.replace(/.+\./, "");
                                if (fileExt !== "txt") {
                                    layer.msg("请使用txt格式的文件!");
                                    return;
                                }
                                $("#importAppointDialog .fileUploadName").val(fileName);
                            } catch (e) {
                                console.log("file selected error");
                            }
                        })

                        // 上传
                        $("#importAppointDialog .importAppointInfo .importForm .btnUpload").click(function () {
                            submitFile();
                        });

                        // 文件上传
                        function submitFile() {
                            var $form = $("#importAppointDialog .importAppointInfo").find(".importForm");
                            var $file = $form.find("input[type=file]");
                            if ($file.val() == "") {
                                layer.msg("请选择文件!");
                                return;
                            }
                            else if ($file.val().indexOf(".txt") < 0) {
                                layer.msg("请使用txt格式的文件!");
                                return;
                            }
                            var options = {
                                type: 'POST',
                                url: 'importTheOldCustomerAppointFile.view',
                                dataType: 'json',
                                beforeSubmit: function () {
                                    $html.loading(true)
                                },
                                success: function (data) {
                                    $html.loading(false)
                                    if (data.retValue == "0") {
                                        appointFileId = data.fileId;
                                        //initTable(data.fileId, data.desc);
                                        initUploadMessage(data);
                                    } else {
                                        layer.alert("创建失败:" + data.desc);
                                    }
                                }
                            }
                            $form.ajaxSubmit(options);
                            function initUploadMessage(data){
                                var $uploadMessage = $("#importAppointDialog .importAppointInfo").find(".phoneInfo");
                                if(data.retValue == 0){
                                    $uploadMessage.text("success "+ data.desc)
                                }else if(data.retValue != 0){
                                    $uploadMessage.text("fail " + data.desc)
                                }
                            }
                            function initTable(fileId, desc) {
                                var pageInfo = {
                                    itemCounts: 0,
                                    items: {}
                                }
                                var paras = {
                                    curPage: 1,
                                    countsPerPage: 40,
                                    fileId: fileId
                                }
                                globalRequest.queryShopTaskPhoneImport(true, paras, function (data) {
                                    pageInfo.itemCounts = data.itemCounts;
                                    pageInfo.items = data.items;
                                    createPageBody(desc);
                                    initPagination();
                                }, function () {
                                    layer.alert("系统异常", {icon: 6});
                                })

                                function initPagination() {
                                    $("#importAppointDialog .importSegmentInfo .phoneInfo .pagination").pagination({
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
                                            })
                                        }
                                    })
                                }

                                function createPageBody() {
                                    var $html = "<tr><td colspan='4'><div class='noData'>暂无相关数据</div></td></tr></li>";
                                    $("#importAppointDialog .importSegmentInfo .phoneInfo tbody tr").remove();
                                    var $tbody = $("#importAppointDialog .importSegmentInfo .phoneInfo tbody");
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
                                    layer.msg("共导入有效用户：" + pageInfo.itemCounts);
                                }
                            }
                        }
                    }
                })
            }

            function initBlackUsers() {
                $blockUserBtn.click(function () {
                    if ($blockUserInput.val()) {
                        layer.confirm("重新导入免打扰用户文件会覆盖当前数据", function (index) {
                            layer.close(index);
                            blackUsers();
                        });
                    } else {
                        blackUsers()
                    }

                    function blackUsers() {
                        blackFileId = null;
                        var $blackDialog = $("#importBlockDialog");
                        // 加载静态页面
                        var $blackPanel = $(".iMarket_Content").find("div.importSegmentInfo").clone();
                        $blackDialog.find("div.importSegmentInfo").remove();
                        $blackDialog.append($blackPanel);
                        // initHistoryFile($("#importBlockDialog .importSegmentInfo .historyInfo"), "shoptask_blackUsers");
                        $plugin.iModal({
                            title: '导入免打扰用户',
                            content: $("#importBlockDialog"),
                            area: '750px'
                        }, function (index) {
                            saveBlackPhoneImport(index);
                        })

                        function saveBlackPhoneImport(index) {
                            if (blackFileId == null) {
                                layer.alert("请先上传导入文件", {icon: 6});
                                return;
                            }
                            globalRequest.iOldCustomer.saveOldCustomerBlackUsersImport(true, {fileId: blackFileId}, function (data) {
                                if (data.retValue == 0) {
                                    $blockUserIds.val(blackFileId);
                                    $blockUserInput.val("成功导入用户数:" + data.num);
                                    layer.close(index);
                                    layer.msg("免打扰用户文件导入成功", {time: 1000});
                                } else {
                                    layer.alert("免打扰用户文件导入失败，" + data.desc, {icon: 6});
                                }
                            }, function () {
                                layer.alert("免打扰用户文件导入失败", {icon: 6});
                            })
                        }


                        $("#importBlockDialog .importSegmentInfo").find(".importForm").find("input[type=file]").click(function (e) {
                            $(this).val("");
                            $("#importBlockDialog .fileUploadName").val("");
                        }).change(function (e) {
                            try {
                                $("#importBlockDialog .fileUploadName").val("");
                                var src = e.target.value;
                                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                                var fileExt = fileName.replace(/.+\./, "");
                                if (fileExt !== "xlsx" && fileExt !== "xls") {
                                    layer.msg("请选择模板规定的.xlsx或.xls文件!");
                                    return;
                                }
                                $("#importBlockDialog .fileUploadName").val(fileName);
                            } catch (e) {
                                console.log("file selected error");
                            }
                        })

                        // 上传
                        $("#importBlockDialog .importSegmentInfo .importForm .btnUpload").click(function () {
                            submitBlackFile();
                        })

                        // 文件上传
                        function submitBlackFile() {
                            var $form = $("#importBlockDialog .importSegmentInfo").find(".importForm");
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
                                url: 'importOldCustomerBlackFile.view',
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
                                    $("#importBlockDialog .importSegmentInfo .phoneInfo .pagination").pagination({
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
                                    $("#importBlockDialog .importSegmentInfo .phoneInfo tbody tr").remove();
                                    var $tbody = $("#importBlockDialog .importSegmentInfo .phoneInfo tbody");
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
                                    layer.msg("共导入有效用户：" + pageInfo.itemCounts);
                                };
                            }
                        }
                    }
                });
            }

            function initBusiness() {
                $offlineBtn.click(function () {
                    if ($offlineBusinessInput.val()) {
                        layer.confirm("重新导入营业厅文件会覆盖当前数据", function (index) {
                            layer.close(index);
                            business();
                        });
                    } else {
                        business()
                    }

                    function business() {
                        businessFileId = null;
                        var $businessDialog = $("#importBusinessDialog");
                        // 加载静态页面
                        var $blackPanel = $(".iMarket_Content").find("div.importBusinessInfo").clone();
                        $businessDialog.find("div.importBusinessInfo").remove();
                        $businessDialog.append($blackPanel);

                        // initHistoryFile($("#importBusinessDialog .importBusinessInfo .historyInfo"), "oldCustomer_baseInfo");
                        $plugin.iModal({
                            title: '导入营业厅',
                            content: $("#importBusinessDialog"),
                            area: '750px'
                        }, function (index) {
                            saveBusinessImport(index);
                        })

                        function saveBusinessImport(index) {
                            if (businessFileId == null) {
                                layer.alert("请先上传导入文件", {icon: 6});
                                return;
                            }
                            globalRequest.iOldCustomer.saveOldCustomerBaseInfoImport(true, {fileId: businessFileId}, function (data) {
                                if (data.retValue == 0) {
                                    $offlineBusinessIds.val(businessFileId);
                                    $offlineBusinessInput.val("成功导入营业厅数:" + data.num)
                                    layer.close(index);
                                    layer.msg("营业厅文件导入成功", {time: 1000});
                                } else {
                                    layer.alert("营业厅文件导入失败，" + data.desc, {icon: 6});
                                }
                            }, function () {
                                layer.alert("营业厅文件导入失败", {icon: 6});
                            })
                        }


                        $("#importBusinessDialog .importBusinessInfo").find(".importForm").find("input[type=file]").click(function (e) {
                            $(this).val("");
                            $("#importBusinessDialog .fileUploadName").val("");
                        }).change(function (e) {
                            try {
                                $("#importBusinessDialog .fileUploadName").val("");
                                var src = e.target.value;
                                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                                var fileExt = fileName.replace(/.+\./, "");
                                if (fileExt !== "xlsx" && fileExt !== "xls") {
                                    layer.msg("请选择模板规定的.xlsx或.xls文件!");
                                    return;
                                }
                                $("#importBusinessDialog .fileUploadName").val(fileName);
                            } catch (e) {
                                console.log("file selected error");
                            }
                        })

                        // 上传
                        $("#importBusinessDialog .importBusinessInfo .importForm .btnUpload").click(function () {
                            submitBusinessFile();
                        })

                        // 文件上传
                        function submitBusinessFile() {
                            var $form = $("#importBusinessDialog .importBusinessInfo").find(".importForm");
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
                                url: 'importAppointBaseInfo.view',
                                dataType: 'json',
                                beforeSubmit: function () {
                                    $html.loading(true)
                                },
                                success: function (data) {
                                    $html.loading(false)
                                    if (data.retValue == "0") {
                                        layer.msg(data.desc);
                                        businessFileId = data.fileId;
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
                                    $("#importBusinessDialog .importBusinessInfo .businessInfo .pagination").pagination({
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
                                    $("#importBusinessDialog .importBusinessInfo .businessInfo tbody tr").remove();
                                    var $tbody = $("#importBusinessDialog .importBusinessInfo .businessInfo tbody");
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
                                    layer.msg("共导入有效营业厅" + pageInfo.itemCounts);
                                };
                            }
                        }
                    }
                });
            }

            /**
             * 加载历史文件
             * @param dom
             * @param fileType
             */
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

                })
            }

            /**
             * 初始化 事件
             */
            function initEvents() {
                /**
                 * 目标用户 radio选择事件
                 */
                $targetContainer.on('click', ':radio', function () {
                    var type = $(this).attr("data-targetUser")
                    switch (type) {
                        case oldCustomer_Constant.targetUser.province:
                            $cityItemChecks.each(function () {
                                $(this).attr("disabled", true).attr("checked",false);
                            })
                            break;
                        case oldCustomer_Constant.targetUser.city:
                            $cityItemChecks.each(function () {
                                $(this).attr("disabled", false);
                            })
                            break;
                    }
                })
                /**
                 * 接触渠道 radio选择事件
                 */
                $channelContainer.on('click', ':checkbox', function () {
                    var type = $(this).attr("data-channel")
                    switch (type) {
                        case oldCustomer_Constant.channel.online:
                            var checkFlag = $onlineChk.is(':checked');
                            $onlineUrlInput.attr("disabled", !checkFlag);
                            $onlineChk.attr("checked", checkFlag);
                            if (!checkFlag) {
                                $onlineUrlInput.val("");
                            }
                            break;
                        case oldCustomer_Constant.channel.offline:
                            var checkFlag = $offlineChk.is(':checked');
                            $offlineChecks.each(function () {
                                $(this).attr("disabled", !checkFlag);
                                $(this).attr("checked", checkFlag);
                            })
                            $offlineBusinessInput.attr("disabled", !checkFlag);
                            $offlineBtn.attr("disabled", !checkFlag);
                            $offlineChk.attr("checked", checkFlag);
                            if (!checkFlag) {
                                $offlineBusinessIds.val("");
                                $offlineBusinessInput.val("");
                            }
                            break;
                    }
                })
                /**
                 * 关闭 事件
                 */
                $closeBtn.click(function () {
                    var dialogIndex = $operateData.attr("index");
                    layer.close(dialogIndex);
                })
                /**
                 * 上一步 事件
                 */
                $preStep.click(function () {
                    var $this = $(this);
                    if ($userInfoInfo.hasClass("active")) {
                        $flowStepB.find("span").removeClass("active");
                        $flowStepA.find("span").addClass("active");
                        taskBaseInfo.siblings("div.row").removeClass("active");
                        taskBaseInfo.addClass("active");

                        $this.parent().find("span").removeClass("pageB");
                        $preStep.removeClass("active");
                    } else if ($channelInfo.hasClass("active")) {
                        $flowStepC.find("span").removeClass("active");
                        $flowStepB.find("span").addClass("active");
                        $userInfoInfo.siblings("div.row").removeClass("active");
                        $userInfoInfo.addClass("active");

                        $this.parent().find("span").removeClass("pageC").addClass("pageB");
                        $nextStep.addClass("active");
                        $confirmStep.removeClass("active");
                    } else if ($auditInfo.hasClass("active")) {
                        $flowStepD.find("span").removeClass("active");
                        $flowStepC.find("span").addClass("active");
                        $channelInfo.siblings("div.row").removeClass("active");
                        $channelInfo.addClass("active");
                        $this.parent().find("span").removeClass("pageC").addClass("pageB");
                        $nextStep.addClass("active");
                        $confirmStep.removeClass("active");
                    }
                })

                var domain = {};
                if (saveValue) {
                    domain = saveValue;
                }
                /**
                 * 下一步 事件
                 */
                $nextStep.click(function () {
                    var $this = $(this);
                    // 如果没有nextB说明下一页的按钮是第一页面的
                    // 如果有nextB说明是从第二页面的
                    if (taskBaseInfo.hasClass("active")) {    // 任务基本信息
                        if (!stepOne()) return;
                    } else if ($userInfoInfo.hasClass("active")) {   // 任务用户信息
                        if (!stepTwo()) return;
                    } else if ($channelInfo.hasClass("active")) {  // 营销渠道信息
                        if (!stepThree()) return;
                    }

                    /**
                     * 验证 任务基本信息
                     * @returns {boolean}
                     */
                    function stepOne() {
                        if (utils.valid($taskName, utils.notEmpty, domain, "taskName")
                            && utils.valid($startTimeInput, utils.isDateForYMD, domain, "startTime")
                            && utils.valid($endTimeInput, utils.isDateForYMD, domain, "endTime")
                            && utils.valid($remark, utils.notEmpty, domain, "remarks")) {
                            // 开始、结束时间判断
                            if ($startTimeInput.val() > $endTimeInput.val()) {
                                layer.tips("开始时间不能大于结束时间", $endTimeInput);
                                $endTimeInput.focus();
                                return false;
                            }
                            // 流程步骤二图片点亮
                            $flowStepA.find("span").removeClass("active");
                            $flowStepB.find("span").addClass("active");
                            // 第二页面显示
                            $userInfoInfo.siblings("div.row").removeClass("active");
                            $userInfoInfo.addClass("active");
                            // 给所有按钮添加pageB
                            $this.parent().find("span").addClass("pageB");
                            $preStep.addClass("active");
                            return true;
                        } else {
                            return false;
                        }
                    }

                    /**
                     * 验证 任务用户信息
                     * @returns {boolean}
                     */
                    function stepTwo() {
                        if (utils.valid($appointUserIds, utils.any, domain, "appointUsers")
                            && utils.valid($appointUserInput, utils.any, domain, "appointUsersDesc")
                            && utils.valid($blockUserIds, utils.any, domain, "blackUsers")
                            && utils.valid($blockUserInput, utils.any, domain, "blackUsersDesc")) {
                            // 选择 全省
                            if (loginUserDignity == oldCustomer_Constant.loginUserType.province) {
                                if (!$provinceRadio.is(":checked") && !$cityRadio.is(":checked")) {
                                    layer.tips("全省或地市必须选择一项", $provinceLabel);
                                    $provinceLabel.focus();
                                    return false;
                                }
                                if ($provinceRadio.is(":checked")) {
                                    domain["marketAreaCode"] = $.trim($provinceRadio.val());
                                    domain["areaDesc"] = $.trim($provinceLabel.text());
                                } else if ($cityRadio.is(":checked")) {
                                    var result = obj.getCheckboxInfo($cityItemChecks, $cityItemLabel);
                                    if (!result.checked) {
                                        layer.tips("必须选择一个地市", $cityLabel);
                                        $cityLabel.focus();
                                        return false;
                                    }
                                    domain["marketAreaCode"] = result.codes;
                                    domain["areaDesc"] = result.names;
                                }
                            } else {
                                if (!$cityRadio.is(":checked")) {
                                    layer.tips("地区必须选择", $cityLabel);
                                    $cityLabel.focus();
                                    return false;
                                }
                                var result = obj.getCheckboxInfo($cityItemChecks, $cityItemLabel);
                                if (!result.checked) {
                                    layer.tips("必须选择一个地市", $cityLabel);
                                    $cityLabel.focus();
                                    return false;
                                }
                                domain["marketAreaCode"] = result.codes;
                                domain["areaDesc"] = result.names;
                            }

                            // 流程步骤三图片点亮
                            $flowStepB.find("span").removeClass("active");
                            $flowStepC.find("span").addClass("active");
                            // 显示第三页面
                            $channelInfo.siblings("div.row").removeClass("active");
                            $channelInfo.addClass("active");
                            // 给所有按钮添加pageC
                            $this.parent().find("span").removeClass("pageB").addClass("pageC");
                            return true;
                        }
                        else {
                            return false;
                        }
                    }

                    /**
                     * 验证 营销渠道信息
                     * @returns {boolean}
                     */
                    function stepThree() {
                        if (utils.valid($marketName, utils.notEmpty, domain, "marketName")
                            && utils.valid($marketContent, utils.notEmpty, domain, "marketContent")
                            && utils.valid($onlineUrlInput, utils.any, domain, "marketContentLink")
                            && utils.valid($offlineBusinessIds, utils.any, domain, "appointBusinessHall")
                            && utils.valid($offlineBusinessInput, utils.any, domain, "appointBusinessHallDesc")) {
                            // 线上渠道 判断
                            if (!$onlineChk.is(":checked") && !$offlineChk.is(":checked")) {
                                layer.tips("必须选择线上或线下", $onlineLabel);
                                $onlineLabel.focus();
                                return false;
                            }
                            if ($onlineChk.is(":checked")) {
                                if (!$onlineUrlInput.val()) {
                                    layer.tips("办理链接必须填写", $onlineUrlInput);
                                    $onlineUrlInput.focus();
                                    return false;
                                }
                                if (!/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test($onlineUrlInput.val())) {
                                    layer.tips("办理链接格式错误", $onlineUrlInput);
                                    $onlineUrlInput.focus();
                                    return false;
                                }
                                domain["marketContentLink"] = $.trim($onlineUrlInput.val());
                            }

                            // 线下渠道 判断
                            if ($offlineChk.is(":checked")) {
                                var result = obj.getCheckboxInfo($offlineChecks, $offlineBusinessLabel);
                                if (!result.checked && $offlineBusinessIds.val() == "") {
                                    layer.tips("文件或类型必须选择一种", $offlineBtn);
                                    $offlineBtn.focus();
                                    return false;
                                }
                                $offlineBusinessType.val(result.names);
                                domain["baseType"] = result.codes;
                                domain["appointBusinessHall"] = $.trim($offlineBusinessIds.val());
                                domain["appointBusinessHallDesc"] = $.trim($offlineBusinessInput.val());
                            } else {
                                domain["baseType"] = "";
                            }
                            if(!domain["taskSource"]){// 如果taskSource为空则为sms
                                domain["taskSource"] = "sms";
                            }
                            obj.initDetailDialog($auditInfo);
                            obj.setDetailElementValue(domain, $(".previewDiv div.oldCustomerDetailInfo"));
                            // 流程步骤四图片点亮
                            $nextStep.removeClass("active");
                            $confirmStep.addClass("active");
                            $flowStepC.find("span").removeClass("active");
                            $flowStepD.find("span").addClass("active");
                            // 第二页面显示
                            $channelInfo.removeClass("active");
                            $auditInfo.addClass("active");
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                })
                /**
                 * 确定 事件
                 */
                $confirmStep.click(function () {
                    var type = $operateData.attr("operate");
                    var dialogIndex = $operateData.attr("index");
                    delete domain.operateType;
                    if (type === "create") {
                        create();
                    } else if (type === "update") {
                        update();
                    } else {
                        layer.alert("系统异常", {icon: 6});
                    }

                    function create() {
                        domain["taskType"] = loginUserDignity == oldCustomer_Constant.loginUserType.province ? 0 : 1;
                        globalRequest.iOldCustomer.createOldCustomerTask(true, domain, function (data) {
                            if (data.retValue === 0) {
                                dataTable.ajax.reload();
                                layer.close(dialogIndex);
                                layer.msg("创建成功", {time: 1000});
                            } else {
                                layer.alert(data.desc, {icon: 6});
                            }
                        })
                    }

                    function update() {
                        domain["taskType"] = loginUserDignity == oldCustomer_Constant.loginUserType.province ? 0 : 1;
                        delete domain["createUser"]
                        globalRequest.iOldCustomer.updateOldCustomer(true, domain, function (data) {
                            if (data.retValue === 0) {
                                dataTable.ajax.reload();
                                layer.close(dialogIndex);
                                layer.msg("更新成功", {time: 1000});
                            } else {
                                layer.alert(data.desc, {icon: 6});
                            }
                        })
                    }
                })
            }
        }
    }

    /**
     * 页面元素赋值-新增/修改
     * @param $dialog
     * @param initValue
     */
    obj.initElementValue = function ($dialog, initValue) {
        if (!$dialog || !initValue) {
            return;
        }
        /**
         * 任务基本信息
         */
        var $taskName = $dialog.find("input.taskName"),                 // 任务名称
            $startTimeInput = $dialog.find("input.startTime"),          // 开始时间
            $endTimeInput = $dialog.find("input.endTime"),              // 结束时间
            $remark = $dialog.find(".remark"),                          // 任务描述
            /**
             * 任务用户信息
             */
            $provinceRadio = $dialog.find(".radiosProvince"),           // 全省 radio
            $cityRadio = $dialog.find(".radiosCity"),                   // 地市 radio
            $cityItemChecks = $dialog.find(".targetUser-city :checkbox"), // 地市 checkbox
            $appointUserInput = $dialog.find(".txtAppointUser"),        // 指定用户 文本框
            $appointUserBtn = $dialog.find(".btnAppointUser"),          // 指定用户 导入按钮
            $appointUserIds = $dialog.find(".appointUsersIds"),         // 指定用户 隐藏域 存放批次ID
            $blockUserInput = $dialog.find(".txtBlockUser"),            // 免打扰用户 文本框
            $blockUserBtn = $dialog.find(".btnBlockUser"),              // 免打扰用户 导入按钮
            $blockUserIds = $dialog.find(".blockUsersIds"),             // 免打扰用户 隐藏域 存放批次ID

            /**
             * 营销渠道信息
             */
            $marketName = $dialog.find("input.marketName"),             // 营销名称
            $marketContent = $dialog.find("textarea.marketContent"),    // 营销用语
            $onlineChk = $dialog.find(".radiosOnline"),                 // 线上 radio
            $onlineUrlInput = $dialog.find(".txtOnLineUrl"),            // 线上 办理链接 文本框
            $offlineChk = $dialog.find(".radiosOffline"),               // 线下 radio
            $offlineChecks = $dialog.find(".channel-offline .checkbox-inline :checkbox"), // 线下 checkbox
            $offlineBusinessInput = $dialog.find(".txtOffline"),        // 线下 导入 文本框
            $offlineBusinessIds = $dialog.find(".offlineBusinessIds"),  // 线下 导入 隐藏域 存放批次ID
            $offlineBtn = $dialog.find(".btnOffline"),                  // 线下 导入 按钮

            $targetContainer = $dialog.find(".targetUser"),             // 目标用户容器
            $provinceContainer = $dialog.find(".targetUser-province"),  // 全省容器
            $cityContainer = $dialog.find(".targetUser-city"),          // 地市容器
            $appointContainer = $dialog.find(".targetUser-appoint"),    // 指定用户容器
            $blockContainer = $dialog.find(".targetUser-block"),        // 免打扰用户容器

            $infoConfigBody = $dialog.find("div.infoConfigBody"),
            $nextStep = $dialog.find("div.step").find("span.next"),
            $closeBtn = $dialog.find("div.step").find("span.closeBtn"),
            $confirmStep = $dialog.find("div.step").find("span.confirm"),
            $preStep = $dialog.find("div.step").find("span.pre"),
            $flowStepA = $dialog.find("div.flowStep").find("div.flowStepA"),
            $flowStepC = $dialog.find("div.flowStep").find("div.flowStepC"),
            $flowStepD = $dialog.find("div.flowStep").find("div.flowStepD");

        $cityItemChecks.each(function () {
            $(this).attr("disabled", true);
        })
        $offlineChecks.each(function () {
            $(this).attr("disabled", true);
        })
        $onlineUrlInput.attr("disabled", "disabled");
        $offlineBusinessInput.attr("disabled", "disabled");
        $offlineBtn.attr("disabled", "disabled");

        if (loginUserDignity === oldCustomer_Constant.loginUserType.province) {
            $provinceContainer.show();
            $cityContainer.find(":checkbox").each(function () {
                $(this).parent("label").show();
            })
            $cityContainer.show();
        } else if (loginUserDignity === oldCustomer_Constant.loginUserType.city) {
            $provinceContainer.hide();
            $cityContainer.find(":checkbox").each(function () {
                if ($(this).val() == loginUser.areaCode) {
                    $(this).parent("label").show();
                }
            })
            $cityContainer.show();
        } else {
            $provinceContainer.hide();
            $cityContainer.hide();
        }

        if (initValue.operateType == "create") {
            $flowStepA.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.taskBaseInfo").addClass("active");
            $closeBtn.css("display", "inline-block");
            return;
        } else if (initValue.operateType == "update") { // 编辑时，默认选中完成状态
            $taskName.attr("disabled", "disabled");
            $flowStepA.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.taskBaseInfo").addClass("active");
            $nextStep.siblings().removeClass("active");
            $nextStep.addClass("active");
            $closeBtn.css("display", "inline-block");
            changeForJXH();
        }

        /**
         * 精细化任务修改部分窗体禁止修改
         */
        function changeForJXH(){
            var taskDomain = initValue;
            if(taskDomain && taskDomain["taskSource"] === 'jxhscene'){
                // 任务基本信息全部可以修改
                $taskName.attr("disabled",false);
                // 任务用户信息 全部不可以修改
                $provinceRadio.attr("disabled",true);
                $cityRadio.attr("disabled",true);
                $appointUserInput.attr("disabled",true);
                $appointUserBtn.attr("disabled",true);
                $blockUserInput.attr("disabled",true);
                $blockUserBtn.attr("disabled",true);
                // 营销渠道信息
                $offlineChk.attr("disabled",true);
            }
        }

        /**
         * 任务基本信息
         */
        $taskName.val(initValue.taskName);
        $startTimeInput.val(initValue.startTime);
        $endTimeInput.val(initValue.endTime);
        $remark.val(initValue.remarks);
        /**
         * 目标用户选择
         */
        if (initValue.marketAreaCode == "99999") {
            $provinceRadio.attr("checked", true);
            $cityRadio.attr("checked", false);
        } else {
            $cityRadio.attr("checked", true);
            var areaCodeArray = initValue.marketAreaCode.split(',');
            var $checkbox = $cityContainer.find(":checkbox");
            for (var i = 0; i < areaCodeArray.length; i++) {
                for (var j = 0; j < $checkbox.length; j++) {
                    if (areaCodeArray[i] == $($checkbox[j]).val()) {
                        $($checkbox[j]).attr("checked", true);
                        $($checkbox[j]).parent("label").show();
                        break;
                    }
                }
            }
        }
        $appointUserIds.val(initValue.appointUsers);
        $appointUserInput.val(initValue.appointUsersDesc);
        $blockUserIds.val(initValue.blackUsers);
        $blockUserInput.val(initValue.blackUsersDesc);
        /**
         * 客户接触渠道
         */
        $marketName.val(initValue.marketName);
        $marketContent.val(initValue.marketContent);
        // 线上
        if (initValue.marketContentLink) {
            $onlineChk.attr("checked", true);
            $onlineUrlInput.val(initValue.marketContentLink);
            $onlineUrlInput.attr("disabled", false);
        }
        // 线下
        if (initValue.appointBusinessHall || initValue.baseType) {
            $offlineChk.attr("checked", true);
            var baseTypeArray = initValue.baseType.split(",");
            for (var i = 0; i < baseTypeArray.length; i++) {
                for (var j = 0; j < $offlineChecks.length; j++) {
                    if (baseTypeArray[i] == $($offlineChecks[j]).val()) {
                        $($offlineChecks[j]).attr("checked", true);
                        break;
                    }
                }
            }
            $offlineBusinessIds.val(initValue.appointBusinessHall);
            $offlineBusinessInput.val(initValue.appointBusinessHallDesc);
            $offlineChecks.each(function () {
                $(this).attr("disabled", false);
            })
            $offlineBusinessInput.attr("disabled", false);
            $offlineBtn.attr("disabled", false);
        }
    }

    /**
     * 初始化对话框-预览
     */
    obj.initDetailDialog = function ($dialog) {
        var $panel = $(".iMarket_Content").find("div.oldCustomerDetailInfo").clone();
        $dialog.find("div.oldCustomerDetailInfo").remove();
        $dialog.append($panel);
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param status
     */
    obj.initDetailValue = function (id, type) {
        if (type == "preview" || type == "execute" || type == "examine") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.iOldCustomer.previewOldCustomer(true, {id: id}, function (data) {
                if (!data) {
                    layer.alert("根据ID查询炒店数据失败", {icon: 6});
                    return;
                }
                obj.setDetailElementValue(data.domain, $("#taskMgrDetailDialog div.oldCustomerDetailInfo"));
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
        // 任务基本信息
        $element.find(".detail_taskName").text(domain.taskName || "空");
        $element.find(".detail_taskType").text(domain.taskSource == 'jxhscene'?'精细化实时任务':'自建任务');
        $element.find(".detail_startTime").text(domain.startTime || "空");
        $element.find(".detail_endTime").text(domain.endTime || "空");
        $element.find(".detail_remark").text(domain.remarks || "空");

        // 任务用户信息
        $element.find(".detail_targetUser").text(domain.areaDesc || "空");
        $element.find(".detail_appiontUser").text(domain.appointUsersDesc || "空");
        $element.find(".detail_blockUser").text(domain.blackUsersDesc || "空");

        // 营销渠道信息
        $element.find(".detail_marketName").text(domain.marketName || "空");
        $element.find(".detail_marketContent").text(domain.marketContent || "空");
        $element.find(".detail_online").text(domain.marketContentLink || "空");
        $element.find(".detail_offline").text(domain.appointBusinessHallDesc || "空");
        $element.find(".detail_businessType").text(obj.getBusinessType(domain.baseType) || "空");
    }

    /**
     * 加载查询条件
     */
    obj.initAreaSelect = function (status) {
        var $baseAreaTypeSelect = $(".querySelectArea");
        var $targetUserCityContainer = $(".marketJobEditInfo .infoConfigBody .userInfo .targetUser-city .col-md-12");
        var $radiosProvince = $(".marketJobEditInfo .infoConfigBody .userInfo .targetUser-province .radiosProvince");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    if (status == 0 && data[i].id == areaCode ) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                    if (status == 1 && areaCode != 99999 && data[i].id == areaCode){
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }else if(status == 1 && areaCode == 99999){
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }

                    if (data[i].id != "99999") {
                        $targetUserCityContainer.append("<label class='checkbox-inline' style='display: none;'><input type='checkbox' value='A' disabled='disabled'>B</label>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $radiosProvince.val(data[i].id)
                    }
                }
                $baseAreaTypeSelect.val(areaCode);
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
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
            } else if(idsArray[i] == oldCustomer_Constant.offlineType.sheQu){
                result += "社区" + ",";
            } else if(idsArray[i] == oldCustomer_Constant.offlineType.xiaoYuan){
                result += "校园" + ",";
            }else if(idsArray[i] == oldCustomer_Constant.offlineType.qiTa){
                result += "其他" + ",";
            } else {
                result += "未知" + ",";
            }
        }
        return result.substring(0, result.length - 1);
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
     * 获取复选框信息
     * @param $checkbox
     * @param $label
     * @returns {{checked: boolean, codes: string, names: string}}
     */
    obj.getCheckboxInfo = function ($checkbox, $label) {
        var result = {checked: false, codes: "", names: ""}
        for (var i = 0; i < $checkbox.length; i++) {
            if ($($checkbox[i]).is(":checked")) {
                result.checked = true;
                result.codes += $.trim($($checkbox[i]).val()) + ",";
                result.names += $.trim($($label[i]).text()) + ",";
            }
        }
        if (result.codes.length > 0) {
            result.codes = result.codes.substring(0, result.codes.length - 1);
        }
        if (result.names.length > 0) {
            result.names = result.names.substring(0, result.names.length - 1);
        }
        return result
    }

    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
            if (loginUser.businessHallIds === '') {
                if (loginUser.areaCode === 99999) { // 省级管理员
                    loginUserDignity = oldCustomer_Constant.loginUserType.province;
                } else {    // 地市管理员
                    loginUserDignity = oldCustomer_Constant.loginUserType.city;
                }
            } else {    // 营业厅管理员
                loginUserDignity = oldCustomer_Constant.loginUserType.business;
            }
            console.log("loginUserDignity:" + loginUserDignity);
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 5});
        });
    }

    /**
     * 获取dataTable请求地址
     * @param status
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function (status) {
        var onlineUrl = "queryAllOldCustomerByPage.view",
            offlineUrl = "queryOldCustomerByPage.view",
            name = $.trim($(".queryTaskName").val()),
            stats = $.trim($(".querySelectStatus").val()),
            taskSource = $.trim($(".querySelectType").val()),
            areaCode = $.trim($(".querySelectArea").val()),
            taskType = loginUserDignity == oldCustomer_Constant.loginUserType.province ? 0 : 1,
            param = '?taskName=' + encodeURIComponent(name) + '&status=' + stats + '&taskSource=' + taskSource + '&areaCode=' + areaCode + '&taskType=' + taskType;
        return status == 0 ? offlineUrl + param : onlineUrl + param;
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

}()

function onLoadBody(status) {
    oldCustomer.initAudit();
    oldCustomer.initialize(status);
    oldCustomer.getLoginUser();
    oldCustomer.initAreaSelect(status);
    oldCustomer.initData(status);
    oldCustomer.initEvent(status);
}
