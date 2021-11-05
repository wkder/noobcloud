/**
 * Created by hale on 2017/7/12.
 */

var keeperTask = function () {
    var loginUser = {}, appointFileId = {}, dataTable = {}, contentDataTable = {}, revisitDataTable = {}, obj = {};
    var keeperTask_Constant = {
        taskType: {
            EXP_BIRTHDAY_TASK_RULE: 1,  // 生日 维系规则
            EXP_TWO2FOUR_RULE: 2,       // 2转4 维系规则
            EXP_SCENE_CARE_RULE: 3,     // 场景关怀 维系规则
            EXP_DISCOUNT_EXPIRY_RULE: 4,// 优惠到期 维系规则
            EXP_GENERALTASK_RULE: 6  // 通用任务 维系规则
        },
        configType: {
            SMS: 1,
            PHONE: 2,
            SOCIAL: 3
        },
        openDialog: {
            DETAIL: 1,
            ONLINE: 2,
            PRODUCT: 3,
            CONTENT: 4,
            USER: 5,
            AUDIT: 6,
            RECORD: 7
        }
    }

    obj.initData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "taskName", title: "任务名称", className: "dataTableFirstColumns", width: "20%"},
                {data: "typeName", title: "业务类型"},
                {data: "areaName", title: "来源"},
                {data: "effDate", title: "开始时间"},
                {data: "expDate", title: "结束时间"},
                {data: "ruleName", title: "维系规则"},
                {data: "welfareName", title: "维系福利", defaultContent: "", width: "15%"},
                {
                    data: "state", title: "状态",
                    render: function (data, type, row) {
                        if (data === 2) {
                            return "<i class='fa' style='color: red;' onmouseover='keeperTask.hoverDecisionDesc(this, " + row.taskId + ")'>审核拒绝</i>";
                        } else {
                            return obj.getTaskState(data);
                        }
                    }
                },
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var buttons = "", editBtnHtml = "", deleteBtnHtml = "", viewBtnHtml = "", stopHtml = "",
                            qryRevisitBtnHtml = "";
                        viewBtnHtml = "<a title='预览' class='btn btn-primary btn-preview btn-sm' href='javascript:void(0)' onclick='keeperTask.viewItem(\"{0}\")'>预览</a>".autoFormat(row.taskId);
                        editBtnHtml = "<a title='编辑' class='btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='keeperTask.editItem(\"{0}\")' >编辑</a>".autoFormat(row.taskId);
                        deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete btn-sm' href='javascript:void(0)' onclick='keeperTask.deleteItem(\"{0}\")'>删除</a>".autoFormat(row.taskId);
                        stopHtml = "<a title='一键终止任务' class='btn btn-warning btn-edit btn-sm ' href='javascript:void(0)' onclick='keeperTask.stopTask(\"{0}\",\"{1}\")' >终止</a>".autoFormat(row.taskId, row.taskName);
                        qryRevisitBtnHtml = "<a title='回访记录' class='btn btn-primary btn-preview btn-sm' href='javascript:void(0)' onclick='keeperTask.qryDetailByPhone()'>回访</a>";
                        // 创建人是自己 并且是地市管理员 才能编辑、删除
                        if (row.createUserId == globalConfigConstant.loginUser.id && loginUser.identity === "cityManager") {
                            if (row.state === 0 || row.state === 2 || row.state === 4) {   // 待审核 、审核拒绝、显示 编辑删除按钮
                                buttons += editBtnHtml + deleteBtnHtml;
                            } else if (row.state === 1) { // 审核通过 显示终止按钮
                                buttons += stopHtml;
                            }
                        }
                        return buttons += viewBtnHtml + qryRevisitBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function () {
        /**
         * 查询事件
         */
        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })

        /**
         * 新增事件
         */
        $(".addBtn").click(function () {
            obj.initElement($("#addOrEdit_task_dialog"));
            obj.initElementValue($("#addOrEdit_task_dialog"), {operateType: "create"});

            $plugin.iModal({
                title: '新增维系任务',
                content: $("#addOrEdit_task_dialog"),
                area: '750px',
                btn: []
            }, null, null, function (layero, index) {
                layero.find('.layui-layer-btn').remove();
                layero.find("input.data").attr("index", index).attr("operate", "create");
            })
        })
    }

    /**
     * 预览 事件
     * @param task
     */
    obj.viewItem = function (id) {
        obj.initDialog($("#preview_dialog"), keeperTask_Constant.openDialog.DETAIL);
        obj.initDetailValue(id, "preview");
        $plugin.iModal({
            title: '预览任务',
            content: $("#preview_dialog"),
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
        globalRequest.iKeeper.queryKeeperTaskById(true, {taskId: id}, function (data) {
            if (!data) {
                layer.alert("根据ID查询维系任务失败", {icon: 6});
                return;
            }

            var domain = data;
            domain["operateType"] = "update";
            obj.initElement($("#addOrEdit_task_dialog"), domain);
            obj.initElementValue($("#addOrEdit_task_dialog"), domain);

            $plugin.iModal({
                title: '修改任务',
                content: $("#addOrEdit_task_dialog"),
                area: '750px',
                btn: []
            }, null, null, function (layero, index) {
                layero.find('.layui-layer-btn').remove();
                layero.find("input.data").attr("index", index).attr("operate", "update");
            })
        }, function () {
            layer.alert("根据ID查询任务数据失败", {icon: 6});
        })
    }

    /**
     * 删除 事件
     * @param id
     * @param name
     */
    obj.deleteItem = function (id) {
        layer.confirm('确认删除任务?', {icon: 3, title: '提示'}, function (index) {
            globalRequest.iKeeper.deleteKeeperTask(true, {taskId: id}, function (data) {
                if (data.retValue == 0) {
                    dataTable.ajax.reload()
                    layer.msg(data.desc, {time: 1000});
                } else {
                    layer.alert("删除失败", {icon: 6});
                }
                layer.close(index);
            }, function () {
                layer.alert('操作数据库失败', {icon: 6});
            })
        })
    }

    /**
     * 查看回访记录 事件
     * @param task
     */
    obj.qryDetailByPhone = function () {
        obj.initDialog($("#query_revisit_dialog"), keeperTask_Constant.openDialog.RECORD);//初始化模板
        var $dialog = $("#query_revisit_dialog");
        var $qryDetailByPhoneBtn = $dialog.find(".qryDetailByPhoneBtn");
        var $qryDetailByPhone = $dialog.find(".qryDetailByPhone");

        initRevisit();
        initEvent()

        // 初始化页面内容
        function initEvent() {
            /**
             查看回访记录 事件
             */
            $qryDetailByPhoneBtn.click(function () {
                $plugin.iCompaignTableRefresh(revisitDataTable, getAjaxUrl())
            })
        }

        function initRevisit() {
            var options = {
                ele: $("#query_revisit_dialog .revisitTable "),
                ajax: {url: getAjaxUrl(), type: "POST"},
                columns: [
                    {data: "taskName", title: "任务名称", width: "30%", className: "centerColumns"},
                    {
                        data: "smsResult", title: "短信执行",
                        render: function (data, type, row) {
                            if (data === 0) {
                                return "未执行";
                            } else if (data === 1) {
                                return "已执行";
                            } else if (data === 2) {
                                return "无短信渠道维系方式";
                            }
                        }
                    },
                    {
                        data: "callResult", title: "外呼执行",
                        render: function (data, type, row) {
                            if (data === 0) {
                                return "未执行外呼或失败";
                            } else if (data === 1) {
                                return "呼叫完成";
                            } else if (data === 2) {
                                return "无话+渠道维系方式";
                            }
                        }
                    }
                ],
            };
            revisitDataTable = $plugin.iCompaignTable(options);
        }

        function getAjaxUrl() {
            var phone = encodeURIComponent($.trim($("#query_revisit_dialog .qryDetailByPhone").val()));
            return "queryKeeperTaskDetailByPhone.view?phone=" + phone;
        }

        $plugin.iModal({  //弹窗
            title: '回访记录',
            content: $("#query_revisit_dialog"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "update");
        })
    }

    /**
     * 显示审核拒绝原因浮动窗口
     * @param element
     * @param id
     */
    obj.hoverDecisionDesc = function (element, id) {
        if (id <= 0) {
            return;
        }

        globalRequest.iKeeper.queryAuditFailureReason(true, {taskId: id}, function (data) {
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
            globalRequest.iKeeper.terminateKeeperTask(true, {taskId: id}, function (data) {
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
        var $all = $("div.iMarket_Content").find("div.taskFramework").clone();
        $dialog.empty().append($all);

        initAll();

        function initAll() {
            /**
             * 维系任务
             */
            var $taskName = $all.find(".taskName"),     // 任务名称
                $taskType = $all.find(".taskType"),     // 任务类型
                $effDate = $all.find(".effDate"),       // 开始时间
                $expDate = $all.find(".expDate"),       // 结束时间
                $orgNames = $all.find(".orgNames"),     // 归属小组名称
                $orgIds = $all.find(".orgIds"),         // 归属小组ID
                $comments = $all.find(".comments"),     // 任务描述

                /**
                 * 客群选择
                 */
                $appointUser = $all.find(".txtAppointUser"),             // 指定用户 文本框
                $appointUserBtn = $all.find(".btnAppointUser"),          // 指定用户 导入按钮
                $appointUserIds = $all.find(".appointUserIds"),          // 指定用户 隐藏域 存放批次ID

                /**
                 * 维系策略
                 */
                $taskRemind = $all.find(".taskRemind"),                          // 维系提醒规则
                $taskRemindProductNames = $all.find(".taskRemindProductNames"),  // 维系福利名称
                $taskRemindProductIds = $all.find(".taskRemindProductIds"),      // 维系福利Id

                $pkgFlowRule = $all.find(".pkgFlowRule"),                        // 场景关怀-场景失效规则行
                $loseEfficacy = $all.find(".pkgFlowRule_loseEfficacy"),          // 场景失效规则
                $discountExpiryRule = $all.find(".discountExpiryRule"),          // 优惠到期-时间参数行
                $timeParams = $all.find(".discountExpiryRule_time"),             // 时间参数

                /**
                 * 接触渠道
                 */
                $configInfoCheckboxes = $all.find(".configInfo label :checkbox"),    // 3个渠道的勾选框
                $smsCheckbox = $all.find(".smsCheckbox"),            // 短信渠道 勾选框
                $phoneCheckbox = $all.find(".phoneCheckbox"),        // 话+外呼渠道 勾选框
                $socialCheckbox = $all.find(".socialCheckbox"),      // 互联网社交 勾选框
                $smsContent = $all.find(".smsContent"),              // 营销内容
                $smsContentIds = $all.find(".smsContentIds"),        // 营销内容Id
                $smsBtn = $all.find(".smsBtn"),                      // 营销内容 按钮
                $externalPhone = $all.find(".externalPhone"),        // 外呼号码
                $callCount = $all.find(".callCount"),                // 外呼频次
                $phoneContent = $all.find(".phoneContent"),          // 话术脚本内容
                $phoneContentIds = $all.find(".phoneContentIds"),    // 话术脚本Id
                $phoneBtn = $all.find(".phoneBtn"),                  // 话术脚本 按钮

                $taskInfo = $all.find(".taskInfo"),         // 维系任务容器
                $userInfo = $all.find(".userInfo"),         // 客群选择容器
                $taskTypeInfo = $all.find(".taskTypeInfo"), // 维系策略容器
                $configInfo = $all.find(".configInfo"),     // 接触渠道容器
                $auditInfo = $all.find(".auditInfo"),       // 预览容器
                $preStep = $all.find("span.pre"),           // 上一步
                $nextStep = $all.find("span.next"),         // 下一步
                $auditStep = $all.find("span.audit"),       // 提交审核
                $confirmStep = $all.find("span.confirm"),   // 确定
                $closeBtn = $all.find("span.closeBtn"),     // 关闭
                $operateData = $all.find("input.data"),     // 记录状态

                $flowStepA = $all.find("div.flowStepContainer div.flowStep div.flowStepA"),
                $flowStepB = $all.find("div.flowStepContainer div.flowStep div.flowStepB"),
                $flowStepC = $all.find("div.flowStepContainer div.flowStep div.flowStepC"),
                $flowStepD = $all.find("div.flowStepContainer div.flowStep div.flowStepD"),
                $flowStepE = $all.find("div.flowStepContainer div.flowStep div.flowStepE");

            initTaskType();         // 初始化任务类型 下拉框
            initStartEndTime();     // 初始化 开始、结束时间
            initTaskRemind();       // 初始化 提醒规则
            initTimeParams();       // 初始化 时间参数
            initExternalPhone();    // 初始化 外呼号码
            //initExternalCount();    // 初始化 外呼频次 外呼频次设置为可输入模式，该初始化步骤取消
            initEvents();           // 初始化事件

            /**
             * 初始化任务类型
             */
            function initTaskType() {
                globalRequest.iKeeper.queryKeeperTaskType(false, {}, function (data) {
                    $taskType.empty();
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            $taskType.append("<option value='{0}'>{1}</option>".autoFormat(data[i].typeId, data[i].typeName));
                        }
                    }
                }, function () {
                    layer.alert("系统异常，获取任务类型失败", {icon: 6});
                });
            }

            /**
             * 初始化 开始、结束时间
             */
            function initStartEndTime() {
                var currentDate = new Date();
                var startDate = new Date(currentDate.setHours(currentDate.getHours() + 1)),
                    year = startDate.getFullYear(),
                    month = startDate.getMonth() + 1,    //js从0开始取
                    day = startDate.getDate() + 1,
                    finishDate = new Date(currentDate.setDate(currentDate.getDate() + 30)),
                    endYear = finishDate.getFullYear(),
                    endMonth = finishDate.getMonth() + 1,    //js从0开始取
                    endDay = finishDate.getDate() + 1;
                $effDate.val(year + "-" + setStandardData(month) + "-" + setStandardData(day));
                $expDate.val(endYear + "-" + setStandardData(endMonth) + "-" + setStandardData(endDay));

                function setStandardData(data) {
                    if (data < 10) {
                        return "0" + data;
                    }
                    return data;
                }
            }

            /**
             * 初始化 提醒规则、失效规则
             */
            function initTaskRemind() {
                var typeId = $.trim($taskType.val());
                globalRequest.iKeeper.queryKeeperRuleByTypeId(false, {typeId: typeId}, function (data) {
                    $taskRemind.empty();
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].ruleType === 1) {  // 提醒规则
                                $taskRemind.append("<option value='{0}'>{1}</option>".autoFormat(data[i].ruleId, data[i].ruleName));
                            } else {    // 失效规则
                                if (typeId == keeperTask_Constant.taskType.EXP_SCENE_CARE_RULE) {
                                    $loseEfficacy.append("<option value='{0}'>{1}</option>".autoFormat(data[i].ruleId, data[i].ruleName));
                                }
                            }
                        }
                    }
                }, function () {
                    layer.alert("系统异常，获取提醒规则失败", {icon: 6});
                });
            }

            /**
             * 初始化 时间参数
             */
            function initTimeParams() {
                $timeParams.val(obj.getLoseEfficacyText($taskRemind.val()));
            }

            /**
             * 初始化 外呼号码
             */
            function initExternalPhone() {
                globalRequest.iKeeper.queryOutbandPhone(false, {}, function (data) {
                    $externalPhone.empty();
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            $externalPhone.append("<option value='{0}'>{1}</option>".autoFormat(data[i].phone, data[i].phone));
                        }
                    }
                })
            }

            /**
             * 初始化 外呼频次（外呼频次设置为可输入模式，该初始化步骤不会被调用）
             */
            function initExternalCount() {
                $callCount.empty();
                for (var i = 1; i <= 3; i++) {
                    $callCount.append("<option value='{0}'>{1}</option>".autoFormat(i, i + "次"));
                }
            }

            /**
             * 初始化 事件
             */
            function initEvents() {
                /**
                 * 业务归属 点击事件
                 */
                $orgNames.click(function () {
                    var setting = {
                        view: {
                            dblClickExpand: true
                        },
                        edit: {
                            enable: true,
                            showRemoveBtn: false,
                            showRenameBtn: false
                        },
                        data: {
                            simpleData: {
                                enable: true
                            },
                            keep: {
                                leaf: true,
                                parent: true
                            }
                        },
                        check: {
                            enable: true,
                            chkStyle: "checkbox",
                            radioType: "all"
                        }
                    };
                    globalRequest.iKeeper.queryBusinessOrg(true, {}, function (data) {
                        if (data && data.length > 0) {
                            var selectIdsArray = $orgIds.val().split(",");
                            if (selectIdsArray) {
                                for (var i = 0; i < selectIdsArray.length; i++) {
                                    for (var j = 0; j < data.length; j++) {
                                        if (data[j].id == selectIdsArray[i]) {
                                            data[j].checked = true;
                                            break
                                        }
                                    }
                                }
                            }

                            $.fn.zTree.init($("#treePrimary"), setting, data);
                            $plugin.iModal({
                                title: "业务归属",
                                content: $("#dialogTreePrimary"),
                                area: ['500px', '565px'],
                                btn: ['确定', '取消']
                            }, function (index) {
                                var orgNames = "", orgIds = "";
                                var zTree = $.fn.zTree.getZTreeObj("treePrimary"),
                                    nodes = zTree.getCheckedNodes(),
                                    nodesLength = nodes.length;
                                if (nodesLength <= 0) {
                                    $orgNames.val("");
                                    $orgIds.val("");
                                } else {
                                    for (var i = 0; i < nodes.length; i++) {
                                        if (!nodes[i].isParent) {
                                            orgNames += nodes[i].name + ",";
                                            orgIds += nodes[i].id + ","
                                        }
                                    }
                                    $orgNames.val(orgNames.substring(0, orgNames.length - 1));
                                    $orgIds.val(orgIds.substring(0, orgIds.length - 1));
                                }
                                layer.close(index);
                            })
                        }
                    }, function () {
                        layer.alert("系统异常：查询业务归属失败");
                    });
                })

                /**
                 * 指定维系用户 点击事件
                 */
                $appointUserBtn.click(function () {
                    if ($appointUser.val()) {
                        layer.confirm("重新导入指定维系用户文件会覆盖当前数据", function (index) {
                            layer.close(index);
                            appointUsers();
                        });
                    } else {
                        appointUsers()
                    }

                    function appointUsers() {
                        appointFileId = null;
                        var $dialog = $("#import_appoint_dialog");
                        obj.initDialog($dialog, keeperTask_Constant.openDialog.USER);
                        var $all = $dialog.find(".importAppointInfo"),
                            $form = $all.find(".importForm"),
                            $fileUploadName = $all.find(".fileUploadName"),
                            $fileUploadBtn = $all.find(".importForm .btnUpload"),
                            $files = $all.find("input[type=file]");
                        $plugin.iModal({
                            title: '导入指定维系用户',
                            content: $dialog,
                            area: '750px'
                        }, function (index) {
                            saveImport(index);
                        }, null, function (layero, index) {
                            layero.find("input.dialogIndex").attr("index", index);
                        })

                        function saveImport(index) {
                            if (appointFileId == null) {
                                layer.alert("请先上传导入文件", {icon: 6});
                                return;
                            }
                            globalRequest.iKeeper.saveKeeperTaskCustomer(true, {fileId: appointFileId}, function (data) {
                                if (data.retValue == 0) {
                                    $appointUserIds.val(appointFileId);
                                    $appointUser.val("成功导入用户数:" + data.num);
                                    layer.close(index);
                                    layer.msg("指定维系用户文件导入成功", {time: 1000});
                                } else {
                                    layer.alert("指定维系用户文件导入失败，" + data.desc, {icon: 6});
                                }
                            }, function () {
                                layer.alert("指定维系用户文件导入失败", {icon: 6});
                            })
                        }

                        $files.click(function (e) {
                            $(this).val("");
                            $fileUploadName.val("");
                        }).change(function (e) {
                            try {
                                $fileUploadName.val("");
                                var src = e.target.value;
                                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                                var fileExt = fileName.replace(/.+\./, "");
                                if (fileExt !== "txt") {
                                    layer.msg("请使用txt格式的文件!");
                                    return;
                                }
                                $fileUploadName.val(fileName);
                            } catch (e) {
                                console.log("file selected error");
                            }
                        })

                        // 上传
                        $fileUploadBtn.click(function () {
                            submitFile();
                        });

                        // 文件上传
                        function submitFile() {
                            var $file = $form.find("input[type=file]");
                            if ($file.val() == "") {
                                layer.msg("请选择文件!");
                                return;
                            } else if ($file.val().indexOf(".txt") < 0) {
                                layer.msg("请使用txt格式的文件!");
                                return;
                            }
                            var options = {
                                type: 'POST',
                                url: 'importKeeperTaskCustomerFile.view',
                                dataType: 'json',
                                beforeSubmit: function () {
                                    $html.loading(true)
                                },
                                success: function (data) {
                                    $html.loading(false)
                                    if (data.retValue == "0") {
                                        layer.msg("上传成功", {time: 2000});
                                        appointFileId = data.fileId;
                                        $("#import_appoint_dialog .importAppointInfo").find(".phoneInfo .uploadMessage").text(data.desc);
                                    } else {
                                        layer.alert("创建失败:" + data.desc);
                                    }
                                }
                            }
                            $form.ajaxSubmit(options);
                        }
                    }
                })

                /**
                 *  业务类型修改，清空福利
                 */
                $taskType.change(function () {
                    $taskRemindProductNames.val("");
                })

                /**
                 * 维系福利 点击事件
                 */
                $taskRemindProductNames.click(function () {
                    var $dialog = $("#select_product_dialog");

                    initProduct();

                    function initProduct() {
                        obj.initDialog($dialog, keeperTask_Constant.openDialog.PRODUCT);
                        var $productTable = $dialog.find("table.dataTableProduct");
                        var options = {
                            ele: $productTable,
                            ajax: {
                                url: "queryWelfareOfShopKeeper.view?typeId=" + $taskType.val() + "&welfareName",
                                type: "POST"
                            },
                            columns: [
                                {data: "welfareId", title: "福利Id", className: "dataTableFirstColumns", width: "16%"},
                                {data: "welfareName", title: "福利名称",},
                                {
                                    data: "typeId", title: "福利类型",
                                    render: function (data, type, row) {
                                        return obj.getTaskType(data);
                                    }
                                }
                            ],
                            createdRow: function (row, data, index) {
                                var productIdArray = $taskRemindProductIds.val().split(",");
                                for (var i = 0; i < productIdArray.length; i++) {
                                    if (productIdArray[i] == data.productId) {
                                        $(row).addClass('selected');
                                        break;
                                    }
                                }
                            }
                        };
                        $plugin.iCompaignTable(options);
                    }

                    initEvent();

                    function initEvent() {
                        $dialog.find('table.dataTableProduct tbody').on('click', 'tr', function () {
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected");
                            } else {
                                $(this).addClass("selected");
                            }
                        })
                    }

                    $plugin.iModal({
                        title: '选择维系福利',
                        content: $dialog,
                        area: '750px'
                    }, function (index, layero) {
                        var $selectTr = layero.find('table.dataTableProduct').find("tr.selected"),
                            selectTrLength = $selectTr.length;
                        if (selectTrLength > 0) {
                            var productNames = "", productIds = "";
                            for (var i = 0; i < selectTrLength; i++) {
                                var $tds = $($selectTr[i]).find("td");
                                productIds += $tds.eq(0).text() + ",";
                                productNames += $tds.eq(1).text() + ",";
                            }
                            $taskRemindProductIds.val(productIds.substring(0, productIds.length - 1));
                            $taskRemindProductNames.val(productNames.substring(0, productNames.length - 1));
                        } else {
                            $taskRemindProductIds.val("");
                            $taskRemindProductNames.val("");
                        }
                        layer.close(index);
                    })
                })

                /**
                 * 营销内容 点击事件
                 */
                $smsBtn.click(function () {
                    var $dialog = $("#select_content_dialog");

                    initContent();

                    function initContent() {
                        obj.initDialog($dialog, keeperTask_Constant.openDialog.CONTENT);
                        var $contentTable = $dialog.find("table.contentTable");
                        var options = {
                            ele: $contentTable,
                            ajax: {url: getAjaxUrl(), type: "POST"},
                            columns: [
                                {data: "id", width: "8%", className: "hidden"},
                                {data: "content", title: "内容名称", width: "42%", className: "centerColumns"},
                                {data: "keywords", title: "关键词", width: "30%", className: "centerColumns"},
                                {data: "url", title: "内容地址", width: "20%", className: "centerColumns"}
                            ],
                            createdRow: function (row, data, index) {
                                if (data.id == $smsContentIds.val()) {
                                    $(row).addClass('selected');
                                }
                            }
                        };
                        contentDataTable = $plugin.iCompaignTable(options);
                    }

                    initEvent();

                    function initEvent() {
                        /**
                         * 搜索事件
                         */
                        $dialog.find(".contentInfo .contentInfoBtn").click(function () {
                            $plugin.iCompaignTableRefresh(contentDataTable, getAjaxUrl())
                        })

                        $dialog.find('table.contentTable tbody').on('click', 'tr', function () {
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
                        var $selectTr = layero.find('table.contentTable').find("tr.selected");
                        if ($selectTr.length > 0) {
                            var $tds = $selectTr.find("td");
                            var content = $tds.eq(1).text(),
                                contentId = $tds.eq(0).text(),
                                contentUrl = $tds.eq(3).text();
                            content = content.replace(/\{0}/g, contentUrl);
                            $smsContentIds.val(contentId);
                            $smsContent.val(content);
                        } else {
                            $smsContentIds.val("");
                            $smsContent.val("");
                        }
                        layer.close(index);
                    })

                    function getAjaxUrl() {
                        var smsContent = encodeURIComponent($.trim($("#select_content_dialog .qryContentInfo").val())),
                            key = encodeURIComponent($.trim($("#select_content_dialog .qryKeyInfo").val()));
                        return "queryContentByBusinessType.view" + "?businessType=2&searchContent=" + smsContent + "&key=" + key + "";
                    }
                })

                /**
                 * 话术脚本 点击事件
                 */
                $phoneBtn.click(function () {
                    var $dialog = $("#select_content_dialog");

                    initContent();

                    function initContent() {
                        obj.initDialog($dialog, keeperTask_Constant.openDialog.CONTENT);
                        var $contentTable = $dialog.find("table.contentTable");
                        var options = {
                            ele: $contentTable,
                            ajax: {url: getAjaxUrl(), type: "POST"},
                            columns: [
                                {data: "id", width: "8%", className: "hidden"},
                                {data: "content", title: "内容名称", width: "42%", className: "centerColumns"},
                                {data: "keywords", title: "关键词", width: "30%", className: "centerColumns"},
                                {data: "url", title: "内容地址", width: "20%", className: "centerColumns"}
                            ],
                            createdRow: function (row, data, index) {
                                if (data.id == $phoneContentIds.val()) {
                                    $(row).addClass('selected');
                                }
                            }
                        };
                        contentDataTable = $plugin.iCompaignTable(options);
                    }

                    initEvent();

                    function initEvent() {
                        /**
                         * 搜索事件
                         */
                        $dialog.find(".contentInfo .contentInfoBtn").click(function () {
                            $plugin.iCompaignTableRefresh(contentDataTable, getAjaxUrl())
                        })

                        $dialog.find('table.contentTable tbody').on('click', 'tr', function () {
                            if ($(this).hasClass("selected")) {
                                $(this).removeClass("selected").siblings("tr").removeClass("selected");
                            }
                            else {
                                $(this).addClass("selected").siblings("tr").removeClass("selected");
                            }
                        })
                    }

                    $plugin.iModal({
                        title: '选择话术脚本',
                        content: $dialog,
                        area: '750px'
                    }, function (index, layero) {
                        var $selectTr = layero.find('table.contentTable').find("tr.selected");
                        if ($selectTr.length > 0) {
                            var $tds = $selectTr.find("td");
                            var content = $tds.eq(1).text(),
                                contentId = $tds.eq(0).text(),
                                contentUrl = $tds.eq(3).text();
                            content = content.replace(/\{0}/g, contentUrl);
                            $phoneContentIds.val(contentId);
                            $phoneContent.val(content);
                        } else {
                            $phoneContentIds.val("");
                            $phoneContent.val("");
                        }
                        layer.close(index);
                    })

                    function getAjaxUrl() {
                        var smsContent = encodeURIComponent($.trim($("#select_content_dialog .qryContentInfo").val())),
                            key = encodeURIComponent($.trim($("#select_content_dialog .qryKeyInfo").val()));
                        return "queryContentByBusinessType.view" + "?businessType=3&searchContent=" + smsContent + "&key=" + key + "";
                    }
                })

                /**
                 * 维系提醒规则 下拉框改变事件
                 */
                $taskRemind.change(function () {
                    var typeId = parseInt($taskType.val());
                    if (typeId === keeperTask_Constant.taskType.EXP_DISCOUNT_EXPIRY_RULE) {
                        initTimeParams();
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
                    if ($userInfo.hasClass("active")) {//
                        $flowStepB.find("span").removeClass("active");
                        $flowStepA.find("span").addClass("active");
                        $taskInfo.siblings("div.row").removeClass("active");
                        $taskInfo.addClass("active");
                        $this.parent().find("span").removeClass("pageB");
                        $preStep.removeClass("active");
                    } else if ($taskTypeInfo.hasClass("active")) {//
                        $flowStepC.find("span").removeClass("active");
                        $flowStepB.find("span").addClass("active");
                        $userInfo.siblings("div.row").removeClass("active");
                        $userInfo.addClass("active");
                        $this.parent().find("span").removeClass("pageC").addClass("pageB");
                        $nextStep.addClass("active");
                        $confirmStep.removeClass("active");
                    } else if ($configInfo.hasClass("active")) { //接触渠道返回
                        if ($taskType.val() === "6") {
                            $flowStepD.find("span").removeClass("active");
                            $flowStepB.find("span").addClass("active");
                            $userInfo.siblings("div.row").removeClass("active");
                            $userInfo.addClass("active");
                            $this.parent().find("span").removeClass("pageC").addClass("pageB");
                            $nextStep.addClass("active");
                            $confirmStep.removeClass("active");
                        } else {
                            $flowStepD.find("span").removeClass("active");
                            $flowStepC.find("span").addClass("active");
                            $taskTypeInfo.siblings("div.row").removeClass("active");
                            $taskTypeInfo.addClass("active");
                            $this.parent().find("span").removeClass("pageC").addClass("pageB");
                            $nextStep.addClass("active");
                            $confirmStep.removeClass("active");
                        }
                    } else if ($auditInfo.hasClass("active")) { //任务预览返回
                        $flowStepE.find("span").removeClass("active");
                        $flowStepD.find("span").addClass("active");
                        $configInfo.siblings("div.row").removeClass("active");
                        $configInfo.addClass("active");
                        $this.parent().find("span").removeClass("pageC").addClass("pageB");
                        $nextStep.addClass("active");
                        $confirmStep.removeClass("active");
                        $auditStep.removeClass("active");
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
                    if ($taskInfo.hasClass("active")) {    // 维系任务
                        if (!stepOne()) return;
                    } else if ($userInfo.hasClass("active")) {   // 客群选择
                        if (!stepTwo()) return;
                    } else if ($taskTypeInfo.hasClass("active")) {  // 维系策略
                        if (!stepThree()) return;
                    } else if ($configInfo.hasClass("active")) {    // 接触渠道
                        if (!stepFour()) return;
                    }

                    /**
                     * 验证 维系任务
                     * @returns {boolean}
                     */
                    function stepOne() {
                        if (utils.valid($taskName, utils.is_EnglishChineseNumber, domain, "taskName")
                            && utils.valid($taskType, utils.notEmpty, domain, "typeId")
                            && utils.valid($effDate, utils.isDateForYMD, domain, "effDate")
                            && utils.valid($expDate, utils.isDateForYMD, domain, "expDate")
                            && utils.valid($orgNames, utils.notEmpty, domain, "orgNames")
                            && utils.valid($orgIds, utils.notEmpty, domain, "orgIds")
                            && utils.valid($orgNames, utils.notEmpty, domain, "orgNames")
                            && utils.valid($comments, utils.any, domain, "comments")) {
                            // 开始、结束时间判断

                            var currentDate = new Date().format("YYYY-MM-dd");
                            if ($effDate.val() <= currentDate) {
                                layer.tips("开始时间最少从次日开始", $effDate);
                                $effDate.focus();
                                return false;
                            }

                            if ($effDate.val() > $expDate.val()) {
                                layer.tips("开始时间不能大于结束时间", $expDate);
                                $expDate.focus();
                                return false;
                            }
                            // 流程步骤二图片点亮
                            $flowStepA.find("span").removeClass("active");
                            $flowStepB.find("span").addClass("active");
                            // 第二页面显示
                            $userInfo.siblings("div.row").removeClass("active");
                            $userInfo.addClass("active");
                            // 给所有按钮添加pageB
                            $this.parent().find("span").addClass("pageB");
                            $preStep.addClass("active");
                            return true;
                        } else {
                            return false;
                        }
                    }

                    /**
                     * 验证 客群选择
                     * @returns {boolean}
                     */
                    function stepTwo() {
                        if (utils.valid($appointUserIds, utils.any, domain, "filedId")
                            && utils.valid($appointUser, utils.any, domain, "filedDesc")) {
                            initTaskRemind();
                            // 根据任务类型 展示不同的维系规则
                            var innerValue = $taskType.val();
                            if (innerValue == keeperTask_Constant.taskType.EXP_SCENE_CARE_RULE) {
                                $discountExpiryRule.hide();
                                $pkgFlowRule.show();
                                if (domain.rules) {
                                    var ruleObj = domain.rules
                                    for (var i = 0; i < ruleObj.length; i++) {
                                        if (ruleObj[i].ruleType === 1) {
                                            $taskRemind.val(ruleObj[i].ruleId);
                                        } else {
                                            $loseEfficacy.val(ruleObj[i].ruleId);
                                        }
                                    }
                                }
                            } else if (innerValue == keeperTask_Constant.taskType.EXP_DISCOUNT_EXPIRY_RULE) {
                                $pkgFlowRule.hide();
                                $discountExpiryRule.show();
                                if (domain.rules) {
                                    var ruleObj = domain.rules
                                    for (var i = 0; i < ruleObj.length; i++) {
                                        if (ruleObj[i].ruleType === 1) {
                                            $taskRemind.val(ruleObj[i].ruleId);
                                        } else {
                                            $loseEfficacy.val(ruleObj[i].ruleId);
                                        }
                                    }
                                }
                                initTimeParams();
                            } else {
                                $discountExpiryRule.hide();
                                $pkgFlowRule.hide();
                            }

                            if ($taskType.val() === "6") {
                                // 流程步骤三图片点亮
                                $flowStepB.find("span").removeClass("active");
                                $flowStepD.find("span").addClass("active");
                                // 显示第三页面
                                $configInfo.siblings("div.row").removeClass("active");
                                $configInfo.addClass("active");
                                // 给所有按钮添加pageC
                                $this.parent().find("span").removeClass("pageB").addClass("pageC");
                            } else {
                                // 流程步骤三图片点亮
                                $flowStepB.find("span").removeClass("active");
                                $flowStepC.find("span").addClass("active");
                                // 显示第三页面
                                $taskTypeInfo.siblings("div.row").removeClass("active");
                                $taskTypeInfo.addClass("active");
                                // 给所有按钮添加pageC
                                $this.parent().find("span").removeClass("pageB").addClass("pageC");

                            }
                            return true;

                        }
                        else {
                            return false;
                        }
                    }

                    /**
                     * 验证 维系策略
                     * @returns {boolean}
                     */
                    function stepThree() {
                        if (utils.valid($taskRemind, utils.notEmpty, domain, "remindRuleId")
                            && utils.valid($taskRemindProductNames, utils.notEmpty, domain, "welfareProductNames")
                            && utils.valid($taskRemindProductIds, utils.notEmpty, domain, "welfareProductIds")) {

                            // 维系提醒规则
                            domain.remindRuleName = $taskRemind.find("option:selected").text();
                            domain.failureRuleId = $loseEfficacy.val();
                            domain.failureRuleName = $loseEfficacy.find("option:selected").text();
                            // 流程步骤四图片点亮
                            $flowStepC.find("span").removeClass("active");
                            $flowStepD.find("span").addClass("active");
                            // 显示第四页面
                            $configInfo.siblings("div.row").removeClass("active");
                            $configInfo.addClass("active");
                            // 给所有按钮添加pageD
                            $this.parent().find("span").removeClass("pageC").addClass("pageD");
                            return true;
                        }
                        else {
                            return false;
                        }
                    }

                    /**
                     * 接触渠道
                     * @returns {boolean}
                     */
                    function stepFour() {
                        var checkObj = {
                            checked: false,
                            smsChecked: false,
                            outbandChecked: false,
                            pass: true,
                            checkedCount: 0
                        }
                        for (var i = 0; i < $configInfoCheckboxes.length; i++) {
                            var $this = $($configInfoCheckboxes[i]);
                            if ($this.is(":checked")) {
                                checkObj.checked = true;
                                var type = parseInt($this.val());
                                // 短信渠道推送
                                if (type === keeperTask_Constant.configType.SMS) {
                                    if (!$smsContent.val()) {
                                        layer.tips($smsContent.attr("title"), $smsContent);
                                        $smsContent.focus();
                                        checkObj.pass = false;
                                        break;
                                    }
                                    checkObj.checkedCount++;
                                    checkObj.smsChecked = true;
                                    domain.smsContent = encodeURIComponent($smsContent.val());
                                }
                                // 话+ 外呼渠道推送
                                if (type === keeperTask_Constant.configType.PHONE) {
                                    if (!$callCount.val() || $callCount.val() > 20) {
                                        layer.tips($callCount.attr("title"), $callCount);
                                        $callCount.focus();
                                        checkObj.pass = false;
                                        break;
                                    }

                                    if (!$phoneContent.val()) {
                                        layer.tips($phoneContent.attr("title"), $phoneContent);
                                        $phoneContent.focus();
                                        checkObj.pass = false;
                                        break;
                                    }
                                    checkObj.checkedCount++;
                                    checkObj.outbandChecked = true;
                                    domain.outbandContent = encodeURIComponent($phoneContent.val());
                                    domain.outbandPhone = $externalPhone.val();
                                    domain.outbandCount = $callCount.val();
                                }
                            }
                        }

                        if (!checkObj.checked) {
                            layer.alert("请勾选一种接触渠道", {icon: 6});
                            return false;
                        }
                        if (!checkObj.pass) {
                            return false;
                        }
                        if (checkObj.checkedCount === 2) { // 2种渠道都勾选
                            domain.channelType = "0";
                        } else {
                            if (checkObj.smsChecked) {
                                domain.outbandContent = "";
                                domain.outbandPhone = "";
                                domain.outbandCount = "";
                                domain.channelType = "1";
                            } else {
                                domain.smsContent = "";
                                domain.channelType = "2";
                            }
                        }

                        obj.initDialog($auditInfo, keeperTask_Constant.openDialog.DETAIL);
                        obj.setDetailElementValue(domain, $auditInfo, "");
                        // 流程步骤五图片点亮
                        $nextStep.removeClass("active");
                        $auditStep.addClass("active");
                        $flowStepD.find("span").removeClass("active");
                        $flowStepE.find("span").addClass("active");
                        // 第五页面显示
                        $configInfo.removeClass("active");
                        $auditInfo.addClass("active");
                        return true;
                    }
                })

                /**
                 * 提交审核 事件
                 */
                $auditStep.click(function () {
                    var $dialog = $("#audit_dialog");
                    obj.initDialog($dialog, keeperTask_Constant.openDialog.AUDIT);
                    var $content = $dialog.find("div.auditUserInfo div.auditItem");

                    globalRequest.iKeeper.queryKeeperTaskAudits(false, {}, function (data) {
                        if (!data) {
                            layer.alert("数据异常,请刷新重试", {icon: 6});
                            return false;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var $radio = "<div class='col-md-12'><label><input type='radio' name='optionsRadios' value=\"{0}\"> {1}</label></div>"
                                .autoFormat(data[i].id, data[i].name);
                            $content.append($radio);
                        }
                    })

                    $plugin.iModal({
                        title: "选择任务审核人",
                        content: $("#audit_dialog"),
                        area: '500px',
                        btn: ['确定', '取消']
                    }, function (index) {
                        var userId = $.trim($content.find(":radio:checked").val());
                        var userName = $.trim($content.find("label").text());
                        if (!userId) {
                            layer.alert("请选择审核人", {icon: 6});
                            return false;
                        }
                        domain.auditUserId = parseInt(userId);
                        domain.auditUserName = userName;
                        $auditStep.removeClass("active");
                        $confirmStep.addClass("active");
                        layer.close(index);
                    })
                })

                /**
                 * 确定 事件
                 */
                $confirmStep.click(function () {
                    var type = $operateData.attr("operate");
                    var dialogIndex = $operateData.attr("index");
                    delete domain.operateType;
                    console.log("submit domain:", JSON.stringify(domain));
                    if (type === "create") {
                        create();
                    } else if (type === "update") {
                        update();
                    } else {
                        layer.alert("系统异常", {icon: 6});
                    }

                    function create() {
                        globalRequest.iKeeper.createKeeperTask(true, domain, function (data) {
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
                        globalRequest.iKeeper.updateKeeperTask(true, domain, function (data) {
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
     * @param domain
     */
    obj.initElementValue = function ($dialog, domain) {
        if (!$dialog || !domain) {
            return;
        }

        /**
         * 维系任务
         */
        var $taskName = $dialog.find(".taskName"),     // 任务名称
            $taskType = $dialog.find(".taskType"),     // 任务类型
            $effDate = $dialog.find(".effDate"),       // 开始时间
            $expDate = $dialog.find(".expDate"),       // 结束时间
            $orgNames = $dialog.find(".orgNames"),     // 归属小组名称
            $orgIds = $dialog.find(".orgIds"),         // 归属小组ID
            $comments = $dialog.find(".comments"),     // 任务描述

            /**
             * 客群选择
             */
            $appointUser = $dialog.find(".txtAppointUser"),             // 指定用户 文本框
            $appointUserBtn = $dialog.find(".btnAppointUser"),          // 指定用户 导入按钮
            $appointUserIds = $dialog.find(".appointUsersIds"),         // 指定用户 隐藏域 存放批次ID
            /**
             * 维系策略
             */
            $taskRemind = $dialog.find(".taskRemind"),                          // 维系提醒规则
            $taskRemindProductNames = $dialog.find(".taskRemindProductNames"),  // 维系福利名称
            $taskRemindProductIds = $dialog.find(".taskRemindProductIds"),      // 维系福利Id

            $pkgFlowRule = $dialog.find(".pkgFlowRule"),                        // 场景关怀-场景失效规则行
            $loseEfficacy = $dialog.find(".pkgFlowRule_loseEfficacy"),          // 场景失效规则
            $discountExpiryRule = $dialog.find(".discountExpiryRule"),          // 优惠到期-时间参数行
            $timeParams = $dialog.find(".discountExpiryRule_time"),             // 时间参数

            /**
             * 接触渠道
             */
            $configInfoCheckboxes = $dialog.find(".configInfo label :checkbox"),    // 3个渠道的勾选框
            $smsCheckbox = $dialog.find(".smsCheckbox"),            // 短信渠道 勾选框
            $phoneCheckbox = $dialog.find(".phoneCheckbox"),        // 话+外呼渠道 勾选框
            $socialCheckbox = $dialog.find(".socialCheckbox"),      // 互联网社交 勾选框
            $smsContent = $dialog.find(".smsContent"),              // 营销内容
            $smsContentIds = $dialog.find(".smsContentIds"),        // 营销内容Id
            $smsBtn = $dialog.find(".smsBtn"),                      // 营销内容 按钮
            $externalPhone = $dialog.find(".externalPhone"),        // 外呼号码
            $callCount = $dialog.find(".callCount"),                // 外呼频次
            $phoneContent = $dialog.find(".phoneContent"),          // 话术脚本内容
            $phoneContentIds = $dialog.find(".phoneContentIds"),    // 话术脚本Id
            $phoneBtn = $dialog.find(".phoneBtn"),                  // 话术脚本 按钮

            /**
             回访记录
             */
            $qryDetailByPhone = $dialog.find(".qryDetailByPhone"),       //查看用户回访记录时输入的用户号码
            $qryDetailByPhoneBtn = $dialog.find(".qryDetailByPhoneBtn"), //查看用户回访记录 搜索按钮

            $taskInfo = $dialog.find(".taskInfo"),         // 维系任务容器
            $userInfo = $dialog.find(".userInfo"),         // 客群选择容器
            $taskTypeInfo = $dialog.find(".taskTypeInfo"), // 维系策略容器
            $configInfo = $dialog.find(".configInfo"),     // 接触渠道容器
            $auditInfo = $dialog.find(".auditInfo"),       // 预览容器
            $infoConfigBody = $dialog.find("div.infoConfigBody"),
            $preStep = $dialog.find("span.pre"),           // 上一步
            $nextStep = $dialog.find("span.next"),         // 下一步
            $auditStep = $dialog.find("span.audit"),       // 提交审核
            $confirmStep = $dialog.find("span.confirm"),   // 确定
            $closeBtn = $dialog.find("span.closeBtn"),     // 关闭
            $operateData = $dialog.find("input.data"),     // 记录状态
            $flowStepA = $dialog.find("div.flowStepContainer div.flowStep div.flowStepA"),
            $flowStepB = $dialog.find("div.flowStepContainer div.flowStep div.flowStepB"),
            $flowStepC = $dialog.find("div.flowStepContainer div.flowStep div.flowStepC"),
            $flowStepD = $dialog.find("div.flowStepContainer div.flowStep div.flowStepD"),
            $flowStepE = $dialog.find("div.flowStepContainer div.flowStep div.flowStepE");

        if (domain.operateType == "create") {
            $flowStepA.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.taskInfo").addClass("active");
            $closeBtn.css("display", "inline-block");
            return;
        } else if (domain.operateType == "update") { // 编辑时，默认选中完成状态
            $flowStepA.find("span").addClass("active");
            $infoConfigBody.find("div.row").removeClass("active");
            $infoConfigBody.find("div.taskInfo").addClass("active");
            $nextStep.siblings().removeClass("active");
            $nextStep.addClass("active");
            $closeBtn.css("display", "inline-block");
        }
        // 维系任务
        $taskName.val(domain.taskName || "");
        $taskType.val(domain.typeId || "");
        $effDate.val(domain.effDate || "");
        $expDate.val(domain.expDate || "");
        $comments.val(domain.comments || "");

        // 归属小组
        var orgObj = domain.businessOrgs, orgNames = "", orgIds = "";
        if (orgObj && orgObj.length > 0) {
            for (var i = 0; i < orgObj.length; i++) {
                orgNames += orgObj[i].orgName + ",";
                orgIds += orgObj[i].orgId + ",";
            }
        }
        domain.orgNames = orgNames.substring(0, orgNames.length - 1);
        domain.orgIds = orgIds.substring(0, orgIds.length - 1);
        $orgNames.val(domain.orgNames || "");
        $orgIds.val(domain.orgIds || "");

        // 客群选择
        $appointUserIds.val(domain.filedId || "");
        $appointUser.val(domain.importFileDesc || "");

        // 维系策略
        var ruleObj = domain.rules;
        if (ruleObj && ruleObj.length > 0) {
            for (var i = 0; i < ruleObj.length; i++) {
                if (ruleObj[i].ruleType === 1) {
                    $taskRemind.val(ruleObj[i].ruleId);
                } else if (ruleObj[i].ruleType === 2) {
                    $loseEfficacy.val(ruleObj[i].ruleId);
                }
            }
        }

        // 福利产品
        var welfareObj = domain.welfares, welfareNames = "", welfareIds = "";
        if (welfareObj && welfareObj.length > 0) {
            for (var i = 0; i < welfareObj.length; i++) {
                welfareNames += welfareObj[i].welfareName + ",";
                welfareIds += welfareObj[i].welfareId + ",";
            }
        }
        domain.welfareProductNames = welfareNames.substring(0, welfareNames.length - 1);
        domain.welfareProductIds = welfareIds.substring(0, welfareIds.length - 1);
        $taskRemindProductNames.val(domain.welfareProductNames || "");
        $taskRemindProductIds.val(domain.welfareProductIds || "");

        // 接触渠道
        var channelsObj = domain.channels;
        if (channelsObj && channelsObj.length > 0) {
            for (var i = 0; i < channelsObj.length; i++) {
                if (channelsObj[i].channelType === 1) { // 短信渠道
                    $smsCheckbox.attr("checked", true);
                    $smsContent.val(channelsObj[i].channelContent || "");
                } else if (channelsObj[i].channelType === 2) {
                    $phoneCheckbox.attr("checked", true);
                    $phoneContent.val(channelsObj[i].channelContent || "");
                    $externalPhone.val(channelsObj[i].channelPhone);
                    $callCount.val(channelsObj[i].triggerLimit);
                }
            }
        }
    }

    /**
     * 初始化对话框
     */
    obj.initDialog = function ($dialog, type) {
        switch (parseInt(type)) {
            case keeperTask_Constant.openDialog.DETAIL:
                var $panel = $(".iMarket_Content").find("div.taskDetailInfo").clone();
                $dialog.find("div.taskDetailInfo").remove();
                $dialog.append($panel);
                break;
            case keeperTask_Constant.openDialog.ONLINE:

                break;
            case keeperTask_Constant.openDialog.PRODUCT:
                var $panel = $(".iMarket_Content").find("div.productInfo").clone();
                $dialog.find("div.productInfo").remove();
                $dialog.append($panel);
                break;
            case keeperTask_Constant.openDialog.CONTENT:
                var $panel = $(".iMarket_Content").find("div.contentInfo").clone();
                $dialog.find("div.contentInfo").remove();
                $dialog.append($panel);
                break;
            case keeperTask_Constant.openDialog.USER:
                var $panel = $(".iMarket_Content").find("div.importAppointInfo").clone();
                $dialog.find("div.importAppointInfo").remove();
                $dialog.append($panel);
                break;
            case keeperTask_Constant.openDialog.AUDIT:
                var $panel = $(".iMarket_Content").find("div.auditUserInfo").clone();
                $dialog.find("div.auditUserInfo").remove();
                $dialog.append($panel);
                break;

            case keeperTask_Constant.openDialog.RECORD:
                var $panel = $(".iMarket_Content").find("div.qryRevisitInfo").clone();
                $dialog.find("div.qryRevisitInfo").remove();
                $dialog.append($panel);
                break;
        }
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param status
     */
    obj.initDetailValue = function (id, type) {
        if (type == "preview" || type == "execute") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.iKeeper.queryKeeperTaskById(true, {taskId: id}, function (data) {
                if (!data) {
                    layer.alert("根据ID查询任务数据失败", {icon: 6});
                    return;
                }
                obj.setDetailElementValue(data, $("#preview_dialog div.taskDetailInfo"), "preview");
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
    obj.setDetailElementValue = function (domain, $element, type) {
        console.log("domain:", domain);
        $element.find(".detail_taskName").text(domain.taskName || "空");
        $element.find(".detail_taskType").text(obj.getTaskType(domain.typeId) || "空");
        $element.find(".detail_startTime").text(domain.effDate || "空");
        $element.find(".detail_endTime").text(domain.expDate || "空");
        if (type === "preview") {
            // 维系任务
            $element.find(".detail_appointUser").text(domain.importFileDesc || "空");
            // 归属小组
            var orgObj = domain.businessOrgs, orgNames = "";
            if (orgObj && orgObj.length > 0) {
                obj.setOrgInfo(orgObj, $element);
            }
            // 维系策略
            var ruleObj = domain.rules;
            if (!ruleObj || ruleObj.length <= 0) {
                $element.find(".detail_taskRemind").text("空");
            }
            for (var i = 0; i < ruleObj.length; i++) {
                if (ruleObj[i].ruleType === 1) {
                    $element.find(".detail_taskRemind").text(ruleObj[i].ruleName || "空");
                    break;
                }
            }
            // 福利产品
            var welfareObj = domain.welfares;
            if (!welfareObj || welfareObj.length <= 0) {
                $element.find(".detail_productName").text("空");
            }
            obj.setWelfareInfo(welfareObj, $element)
            // 接触渠道
            var channelsObj = domain.channels;
            if (channelsObj && channelsObj.length > 0) {
                obj.setChannelInfo(channelsObj, $element);
            }
        } else {
            $element.find(".detail_orgNames").text(domain.orgNames || "空");
            $element.find(".detail_appointUser").text(domain.filedDesc || "空");
            // 维系策略
            $element.find(".detail_taskRemind").text(domain.remindRuleName || "空");
            $element.find(".detail_productName").text(domain.welfareProductNames || "空");
            $element.find(".detail_action").text(obj.getChannelType(domain.channelType));
            $element.find(".detail_content").text(decodeURIComponent(domain.smsContent) || "空");
            $element.find(".detail_phoneContent").text(decodeURIComponent(domain.outbandContent) || "空");
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
            case 6:
                return "通用任务"
            default:
                return "未知"
        }
    }

    /**
     * 获取接触渠道类型
     */
    obj.getChannelType = function (type) {
        switch (parseInt(type)) {
            case 1:
                return "短信"
            case 2:
                return "话+ 外呼"
            case 3:
                return "互联网社交"
            case 0:
                return "短信,话+ 外呼"
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
        $element.find(".sms_content_column").hide();
        $element.find(".phone_content_column").hide();
        for (var i = 0; i < channels.length; i++) {
            switch (parseInt(channels[i].channelType)) {
                case 1:
                    $element.find(".sms_content_column").show().find(".detail_content").text(channels[i].channelContent || "空");
                    channelNameArray.push("短信");
                    break;
                case 2:
                    $element.find(".phone_content_column").show().find(".detail_phoneContent").show().text(channels[i].channelContent || "空");
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

    /**
     * 获取优惠到期提醒规则的时间参数
     * @param type
     * @returns {*}
     */
    obj.getLoseEfficacyText = function (type) {
        switch (parseInt(type)) {
            case 6:
                return "入网0-6个月"
            case 7:
                return "入网6-12个月"
            case 8:
                return "合约到期小于2个月"
            default:
                return "";
        }
    }

    // 加载查询条件
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $(".queryBaseAreas");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == areaCode) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }

            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var url = "queryKeeperTaskByPage.view",
            name = $.trim($(".queryTaskName").val()),
            areaCode = $.trim($(".queryBaseAreas").val()),
            param = '?taskName=' + encodeURIComponent(name) + "&areaCode=" + areaCode;
        return url + param;
    }

    /**
     * 判断当前人员身份
     */
    obj.initLoginUser = function () {
        loginUser = globalConfigConstant.loginUser;
        if (!loginUser) {
            loginUser.identity = "otherManager";
            $(".addBtn").hide();
            console.log("get loginUser error: loginUser is null");
            return;
        }

        if (loginUser.areaCode !== 99999 && loginUser.keeperUser.isCanManage) { // 地市管理员 可以增删改
            loginUser.identity = "cityManager";
            $(".addBtn").show();
        } else {
            loginUser.identity = "otherManager";    // 省级管理员及末梢人员只能查看页面
            $(".addBtn").hide();
        }
    }

    return obj;

}()

function onLoadBody() {
    keeperTask.initLoginUser();
    keeperTask.initAreaSelect();
    keeperTask.initData();
    keeperTask.initEvent();
}
