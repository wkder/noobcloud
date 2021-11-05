/**
 * Created by atong on 2018/5/12.
 */
var taskMgr = function () {
    var dialogHeight = 0, dataTable = {}, obj = {}, dbFileId = "";
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

    obj.initialize = function (status) {
        status != 0 ? $("div.iMarket_Body .addBtn").hide() : $("div.iMarket_Body .addBtn").show();
        status != 0 ? $("div.iMarket_Body .stats").hide() : $("div.iMarket_Body .stats").show();

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
        var options = {
            ele: $('table.taskTab'),
            ajax: {url: "queryOffnetSmsTaskByPage.view?taskName=&status=", type: "POST"},
            columns: [
                {data: "id", visible: false},
                {data: "taskName", title: "任务名称", className: "dataTableFirstColumns", width: 150},
                {data: "createTime", title: "创建时间", className: "centerColumns", width: 150},
                {data: "createUserName", title: "创建者", className: "centerColumns", width: 120},
                {data: "content", title: "短信内容", className: "centerColumns"},
                {data: "phoneCount", title: "号池数量", className: "centerColumns", width: 150},
                {
                    data: "status", title: "状态", className: "centerColumns", width: 120,
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa' style='color: blue;'>待审批</i>";
                        } else if (row.status == 1 ) {
                            return "<i class='fa' style='color: red;'>审批拒绝</i>";
                        } else if (row.status == 2) {
                            return "<i class='fa' style='color: green;'>审批通过</i>";
                        } else if (row.status == 3) {
                            return "<i class='fa' style='color: darkorange;'>执行中</i>";
                        } else if (row.status == 4) {
                            return "<i class='fa' style='color: darkslategray;'>执行完毕</i>";
                        }else {
                            return "<i class='fa'>未知</i>";
                        }
                    }
                },
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var buttons = "";
                        var editBtnHtml = "", deleteBtnHtml = "", stopHtml = "", executeHtml = "",
                            executeHtml = "<a title='执行任务' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.executeTask(" + row.id + ",\"" + row.taskName + "\")' >执行</a>",
                            viewBtnHtml = "<a  title='预览' class='viewBtn btn btn-primary btn-preview btn-sm' href='javascript:void(0)' onclick='taskMgr.viewItem(" + JSON.stringify(row) + "," + status + " )'>预览</a>";

                        if (globalConfigConstant.loginUser.id == row.createUser && (row.status ==0 || row.status == 1)) {

                            editBtnHtml = "<a title='编辑'  class='editBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.editItem(" + JSON.stringify(row) + ")' >编辑</a>";
                            deleteBtnHtml = "<a title='删除' class='deleteBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.deleteItem(" + row.id + ",\"" + row.taskName + "\")'>删除</a>";
                            buttons += editBtnHtml  + viewBtnHtml;
                        } else if (row.status == 2) {
                            stopHtml = "<a title='终止任务' class='status btn btn-warning btn-edit btn-sm ' href='javascript:void(0)' onclick='taskMgr.stopTask(" + row.id + ",\"" + row.taskName + "\"," + row.status + ")' >终止</a>";
                            executeHtml = "<a title='执行任务' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.executeTask(" + row.id + ",\"" + row.taskName + "\")' >执行</a>";
                            buttons += viewBtnHtml + executeHtml;
                        } else {
                            buttons += viewBtnHtml
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
                title: '新增任务',
                content: $("#dialogPrimary"),
                area: '750px',
                btn: []
            }, null, null, function (layero, index) {
                layero.find('.layui-layer-btn').remove();
                layero.find("div.data").attr("index", index).attr("operate", initValue.operateType);
            })
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
        if (type == "preview") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.iScheduling.queryOffnetSmsTaskByID(true, {id: id + ''}, successFunc, function () {
                layer.alert("根据ID查询异网短信失败", {icon: 6});
            })
        }

        function successFunc(data) {
            var $preview = $('#taskMgrDetailDialog').find('.taskMgrDetailInfo')
            $preview.find('.detail_taskName').text(data.taskName)
            $preview.find('.detail_createUserName').text(data.createUserName)
            $preview.find('.detail_content').text(data.content)
            $preview.find('.detail_createTime').text(data.createTime)
            $preview.find('.detail_talbleName').text(data.tableName)
            $preview.find('.detail_segmentCounts').text(data.phoneCount)
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
     * 编辑 事件
     * @param task
     */
    obj.editItem = function (task) {
        task["operateType"] = "update";
        obj.handleTaskInitCreateHtml($("#dialogPrimary"), task);
        obj.handleTaskSetings($("#dialogPrimary"), task);
        $plugin.iModal({
            title: '重新编辑任务',
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
     *
     *
     *
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
                    dataTable.ajax.reload();
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
     * 删除 事件
     * @param id
     * @param name
     */
    obj.deleteItem = function (id, name) {
        layer.confirm('确认删除营销任务:' + name + "?", {icon: 3, title: '提示'}, function (index) {
            globalRequest.iScheduling.deleteMarketingTask(true, {id: id}, function () {
                layer.close(index);
                dataTable.ajax.reload()
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
        layer.confirm("确认执行任务:" + name, function (index) {
            var taskObj = null;
            // 执行任务调用的是更新任务接口,改变其状态码status为2
            globalRequest.iScheduling.queryOffnetSmsTaskByID(true, {id: id + ''}, function(res) {
                taskObj = JSON.parse(JSON.stringify(res))
                //console.log(taskObj);
                changeStatus(taskObj, index)
            }, function () {
                layer.alert("根据ID查询异网短信失败", {icon: 6});
            })

        },function () {
            // layer.alert('操作数据库失败');
        })
        function changeStatus (taskObj, index) {
            taskObj.status = 3;

            globalRequest.iScheduling.updateOffnetSmsTask(true, taskObj, function(data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    dataTable.ajax.reload();
                    layer.msg("启动成功", {time: 1000});
                } else {
                    layer.alert("启动失败", {icon: 6});
                }
            }, function (err) {
                layer.alert('请求异常，请重试。')
            })

        }
    }

    obj.handleTaskInitCreateHtml = function ($dialog, savaValue) {
        var $all = $("div.iMarket_Content").find("div.marketJobEditInfo").clone();
        $dialog.empty().append($all);

        initAll();

        function initAll() {
            /**
             * 任务基本信息
             */
            var $userGroupInfo = $all.find("div.userGroupInfo"),        // 任务基本信息
                $jobAuditInfo = $all.find("div.auditInfo"),             // 预览
                $smsMessageContent = $all.find(".sms textarea.smsMessageContent"),          // 短息内容
                $smsMessageSelectButton = $all.find(".smsMessageSelectButton"),             // 选择按钮
            // 场景短信
                $sceneSmsMessageSelectButton = $all.find(".sceneSmsMessageSelectButton"),                // 选择按钮
                $sceneSmsMessageContent = $all.find(".sceneSms textarea.sceneSmsMessageContent"),        // 短信内容
                $smsContentId = $all.find("input.smsContentId"),                            // 短信内容Id

                $preStep = $all.find("span.pre"),           // 上一步
                $nextStep = $all.find("span.next"),         // 下一步
                $confirmStep = $all.find("span.confirm"),   // 确定
                $closeBtn = $all.find("span.closeBtn"),     // 关闭
                $editStep = $all.find("span.edit"),         // 返回修改
                $operateData = $all.find("div.data"),       // 记录状态
                $flowStepA = $all.find("div.flowStepContainer div.flowStep div.flowStepA"),

            // 弹框导入客群
                $userGroupBtn = $all.find('.userGroup button.userGroupBtn'),
                $phoneCount = $all.find(".userGroup input[name='phoneCount']"),
                $modelCode = $all.find(".userGroup input[name='tableName']");
            // 表单
            var $form = $userGroupInfo.find('form')


            // 弹框查看基本信息

            initEvents();

            /**
             * 初始化 事件
             */
            function initEvents() {
                var $form_taskName = $userGroupInfo.find("input[name='taskName']"),
                    $form_smsContent = $userGroupInfo.find("textarea");
                /**
                 *  点击导入客群，弹框导入客群窗口
                 */
                $userGroupBtn.click(function () {
                    var $uploadUsrDialog = $('#import_userGroup_dialog'),
                        $uploadContent = $(".iMarket_Content").find("div.importUserGroupInfo").clone();
                    $uploadUsrDialog.empty().append($uploadContent)

                    var $dialogContent = $uploadUsrDialog.find('.importUserGroupInfo'),
                        $form = $dialogContent.find('form'),
                        $dialogFileName = $dialogContent.find('.fileUploadName'),
                        $fileInput = $dialogContent.find('input[type=file]'),
                        $btnUpload = $dialogContent.find('.btnUpload'),
                        $uploadMessage = $dialogContent.find('.uploadMessage'),
                        appointFileId = null,
                        successCount = null;

                    // 选择txt文件
                    $fileInput.click(function (e) {
                        console.log('step1');
                        $dialogFileName.val("");
                    }).change(function (e) {
                        try {
                            console.log('step2');
                            var src = e.target.value;
                            var fileName = src.substring(src.lastIndexOf('\\') + 1);
                            var fileExt = fileName.replace(/.+\./, "");
                            if (fileExt !== "txt") {
                                layer.msg("请使用txt格式的文件!");
                                return;
                            }
                            $dialogFileName.val(fileName);

                        } catch (e) {
                            console.log("file selected error");
                        }
                    })

                    // 提交
                    $btnUpload.click(function () {
                        if ($fileInput.val() == "") {
                            layer.msg("请先选择文件！");
                            return
                        } else if ($fileInput.val().indexOf(".txt") < 0) {
                            layer.msg('只能上传txt文件！');
                            return
                        }
                        var options = {
                            url: 'importOffnetSmsTaskAppointUser.view',
                            type: 'POST',
                            dataType: 'json',
                            beforeSubmit: function () {
                                $html.loading(true)
                            },
                            success: function (data) {
                                $html.loading(false)
                                if (data.retValue == '0') {
                                    layer.msg('上传成功', {time: 2000});
                                    appointFileId = data.fileId;
                                    successCount = data.count;
                                    $uploadMessage.text(data.desc)
                                } else {
                                    layer.alert('创建失败:' + data.desc);
                                }
                            }
                        }
                        $form.ajaxSubmit(options)
                    })

                    // 上传文件弹框
                    $plugin.iModal({
                        title: '上传文件',
                        content: $('#import_userGroup_dialog'),
                        area: ['750px', '530px']
                    }, function (index) {
                        if (!appointFileId) {
                            layer.msg('您还未上传文件！')
                            return
                        } else {
                            if (successCount === 0) {
                                layer.alert('您成功导入0个用户，查看导入数据是否符合要求！')
                                return
                            } else {
                                $phoneCount.val(successCount)
                                $modelCode.val(appointFileId)
                            }
                        }
                        layer.close(index)
                    }, null, function (layero, index) {
                        layero.find("input.dialogIndex").attr("index", index)
                    })

                })

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
                 * 上一步 事件
                 */
                $preStep.click(function () {
                    var $this = $(this);
                    $userGroupInfo.addClass('active');
                    $jobAuditInfo.removeClass('active');
                    $preStep.removeClass('active');
                    $nextStep.addClass('active');
                    $confirmStep.removeClass('active');
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
                /**
                 * 下一步 事件
                 */
                $nextStep.click(function () {
                    // 验证当前表单信息
                    if (!$form_taskName.val()) {
                        layer.tips("任务名称由字母、下划线、中文组成", $form_taskName);
                        return
                    }
                    if (!$modelCode.val()) {
                        layer.tips("未导入用户", $modelCode);
                        return
                    }
                    if (!$form_smsContent.val()) {
                        layer.tips("未填写短信内容", $form_smsContent);
                        return
                    }

                    // 显示信息概览页面
                    $userGroupInfo.removeClass('active')
                    $jobAuditInfo.addClass('active')
                    // 显示按钮
                    $preStep.addClass('active');
                    $confirmStep.addClass('active');
                    $closeBtn.addClass('active');
                    $nextStep.removeClass('active');
                    showTaskDetail()
                    function showTaskDetail () {
                        var $name = $jobAuditInfo.find('.pre_taskName'),
                            $pre_smsContent = $jobAuditInfo.find('.pre_smsContent'),
                            $detail_appintUser_tableName = $jobAuditInfo.find('.detail_appintUser_tableName'),
                            $detail_phoneCounts = $jobAuditInfo.find('.detail_phoneCounts');
                        $name.text($form_taskName.val())
                        $pre_smsContent.text($form_smsContent.val())
                        $detail_appintUser_tableName.text($modelCode.val())
                        $detail_phoneCounts.text($phoneCount.val())
                    }
                })
                /**
                 * 确定 事件
                 */
                $confirmStep.click(function () {
                    var type = $operateData.attr("operate");
                    var dialogIndex = $operateData.attr("index");
                    var formObj = {
                        "taskName": $form.find("input[name='taskName']").val(),
                        "content": $form.find("textarea[name='content']").val(),
                        "tableName": $form.find("input[name='tableName']").val(),
                        "status": 0,
                        "id": $form.find("input[name='id']").val(),
                        "phoneCount": $form.find("input[name='phoneCount']").val()
                    };
                    var alertMessage = ''
                    if (type == 'create') {
                        alertMessage = '创建成功'
                        globalRequest.iScheduling.createOffnetSmsTask(true, formObj, successFunc, function (err) {
                            layer.alert('请求异常，请重试。')
                        })
                    } else {
                        alertMessage = '修改成功'
                        globalRequest.iScheduling.updateOffnetSmsTask(true, formObj, successFunc, function (err) {
                            layer.alert('请求异常，请重试。')
                        })
                    }


                    function successFunc (res) {
                        if (res.retValue == 0) {
                            layer.msg(alertMessage)
                            $plugin.iCompaignTableRefresh(dataTable, 'queryOffnetSmsTaskByPage.view?taskName=&status=');
                        } else {
                            layer.alert(res.desc)
                        }
                    }
                    //var options = {
                    //    type: 'POST',
                    //    url: url,
                    //    beforeSubmit: function () {
                    //        $html.loading(true)
                    //    },
                    //    success: function (res) {
                    //        $html.loading(false)
                    //        if (res) {
                    //            console.log(res);
                    //            // TODO
                    //            // $plugin.iCompaignTableRefresh(dataTable, 'queryOffnetSmsTaskByPage.view?taskName=&status=0&start=0&length=10');
                    //        } else {
                    //            layer.alert(res.desc)
                    //        }
                    //    },
                    //    error: function (a,b,c,d) {
                    //        $html.loading(false)
                    //        layer.alert('请求异常，请重试。')
                    //    }
                    //}
                    //$form.ajaxSubmit(options)
                    layer.close(dialogIndex)
                })
                /**
                 * 短信 营销方式 选择短信内容 事件
                 */
                $smsMessageSelectButton.click(function () {
                    var $dialog = $("#dialogMiddle"),
                        $all = $(".iMarket_Content").find("div.selectSmsContentInfo").clone(),
                        selectedSmsContent = $smsContentId.val();
                    $dialog.empty().append($all);
                    var dataTable, url = "querySmsContentsByPage.view", param = "?type=6";
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
                        } else {
                            $sceneSmsContentId.val("");
                            $sceneSmsMessageContent.val("");
                        }
                        layer.close(index);
                    })
                })
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
        var $userGroupInfo = $dialog.find("div.userGroupInfo");       // 任务基本信息
        var $form_taskName = $userGroupInfo.find("input[name='taskName']"),
            $form_smsContent = $userGroupInfo.find("textarea"),
            $taskId = $userGroupInfo.find("input[name='id']"),
            $status = $userGroupInfo.find("input[name='status']"),
            $modelCode = $userGroupInfo.find(".userGroup input[name='tableName']"),
            $phoneCount = $userGroupInfo.find(".userGroup input[name='phoneCount']");
        $form_taskName.val(initValue.taskName)
        $form_smsContent.val(initValue.content)
        $modelCode.val(initValue.tableName)
        $status.val(initValue.status)
        $taskId.val(initValue.id)
        $phoneCount.val(initValue.phoneCount || '0')
    }

    /**
     * 获取dataTable请求地址
     * @param status
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function (status) {
        var originUrl = "queryOffnetSmsTaskByPage.view",
            name = $.trim($(".queryName").val()),
            status = $('#status').val(),
            param = '?taskName=' + encodeURIComponent(name) + '&status=' + status;
        return originUrl + param;
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
