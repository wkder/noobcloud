    var iptvTask = function () {
    var obj = {}, dataTable = {}, appointFileId = {}, successCount = {};
    var iptvTask_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    obj.iniData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "name", title: "任务名称", className: "dataTableFirstColumns", width: 100},
                {
                    data: "type", title: "任务类型", width: 60,
                    render: function (data, type, row) {
                        return obj.getTaskType(data);
                    }
                },
                {data: "areaName", title: "区域", width: 60},
                {data: "startTime", title: "开始时间", width: 80},
                {data: "stopTime", title: "结束时间", width: 80},
                {
                    data: "status", title: "状态", width: 80,
                    render: function (data, type, row) {
                        return obj.getTaskStatus(data)
                    }
                },
                {data: "targetUserCount", title: "用户数", width: 60},
                {
                    title: "操作", width: 130,
                    render: function (data, type, row) {
                        var viewBtnHtml = "<a title='预览' class='btn btn-primary btn-preview' href='javascript:void(0)' onclick='iptvTask.preview(\"{0}\")'><i class='fa fa-eye'></i></a>".autoFormat(row.id);
                        var editBtnHtml = "<a title='编辑' class='btn btn-info btn-edit' href='javascript:void(0)' onclick='iptvTask.addOrEdit(\"{0}\",\"{1}\")' ><i class=\"fa fa-pencil-square-o\"></i></a>".autoFormat("update", row.id);
                        var deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' onclick='iptvTask.delete(\"{0}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(row.id);
                        var stopBtnHtml = "<a title='任务启停' class='btn btn-default btn-delete startTask' href='javascript:void(0)' onclick='iptvTask.startStop(\"" + row.id + "\",\"" + row.status + "\")'><i class='fa " + (row.status == 0 ? 'fa-check-circle-o' : 'fa-ban') + "'></i></a>";
                        //处理中时，不允许其他操作
                        if (row.status != 9) {
                            if (row.createUser == globalConfigConstant.loginUser.id || (row.status == 5 && row.areaCode == globalConfigConstant.loginUser.areaCode)) {
                                viewBtnHtml += editBtnHtml + deleteBtnHtml;
                            }
                            if (row.createUser == globalConfigConstant.loginUser.id || globalConfigConstant.loginUser.areaCode == 99999) {
                                viewBtnHtml += stopBtnHtml;
                            }
                        }
                        return viewBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function () {
        $(".addBtn").click(function () {
            obj.addOrEdit("create");
        })

        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })
    }

    /**
     * 新增、修改事件
     * @param operate
     */
    obj.addOrEdit = function (operate, id) {
        obj.initDialog(1);
        obj.initElementValue(operate, id);
        $plugin.iModal({
            title: operate === iptvTask_constant.operate.create ? "新增任务" : "修改任务",
            content: $("#addOrEdit_task_dialog"),
            area: '750px',
            btn: ['确定', '取消']
        }, function () {
            obj.save();
        }, null, function (layero, index) {
            layero.find(".operate").attr("index", index).attr("operate", operate);
        })
    }

    /**
     * 保存
     */
    obj.save = function () {
        var $all = $("#addOrEdit_task_dialog").find("div.taskInfo");
        var $form = $("#addOrEdit_task_dialog").find(".importForm");
        var $modelName = $all.find('[name="modelName"]');
        var operate = $all.find(".operate").attr("operate");
        var index = $all.find(".operate").attr("index");
        var ajaxUrl = "createMessagePushTask.view";
        var oData = $all.autoSpliceForm();
        delete oData.areaName
        delete oData.modelName

        if (operate === iptvTask_constant.operate.update) {
            $modelName.removeAttr('data-expression');
            ajaxUrl = "updateMessagePushTask.view";
        }
        if (!$all.autoVerifyForm()) {
            return;
        }
        // 开始时间不能大于结束时间
        if (oData.startTime > oData.stopTime) {
            layer.tips("开始时间不能大于结束时间", $("#addOrEdit_task_dialog .taskInfo [name='stopTime']"));
            $("#addOrEdit_task_dialog .taskInfo [name='stopTime']").focus();
            return false;
        }
        if (operate === iptvTask_constant.operate.create) {
            globalRequest.iPtv.createMessagePushTask(true, oData, function (data) {
                success(data);
            })
        } else {
            globalRequest.iPtv.updateMessagePushTask(true, oData, function (data) {
                success(data);
            })
        }

        function success(data) {
            if (data.retValue !== 0) {
                layer.alert(data.desc, {icon: 6});
                return;
            }
            layer.msg('保存成功', {time: 1000});
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
            layer.close(index);
        }
    }

    /**
     * 删除事件
     * @param id
     */
    obj.delete = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iPtv.deleteMessagePushTask(true, {taskId: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(confirmIndex);

            }, function () {
                layer.alert("删除失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 任务启停事件
     * @param taskId
     * @param status
     */
    obj.startStop = function (taskId, status) {
        var text = status == 1 ? '确定停用该任务吗？' : '确定启用该任务吗？';
        var confirmIndex = $html.confirm(text, function () {
            globalRequest.iPtv.startStopMessagePushTask(true, {taskId: taskId}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert("操作失败," + data.desc);
                } else {
                    layer.msg(data.desc);
                    $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                }
            }, function () {
                layer.alert("系统异常", {icon: 5});
            });
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 预览 事件
     * @param id
     */
    obj.preview = function (id) {
        obj.initDialog(3);
        obj.initDetailValue(id, "preview");
        $plugin.iModal({
            title: '预览任务',
            content: $("#preview_dialog"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "preview");
        })
    }

    /**
     * 初始化弹窗
     */
    obj.initDialog = function (type) {
        switch (type) {
            case 1:
                var $all = $("div.iMarket_Content").find("div.taskInfo").clone();
                $("#addOrEdit_task_dialog").empty().append($all);
                break;
            case 2:
                var $userGroup = $("div.iMarket_Content").find("div.importUserGroupInfo").clone();
                $("#import_userGroup_dialog").empty().append($userGroup);
                break;
            case 3:
                var $preview = $("div.iMarket_Content").find("div.taskDetailInfo").clone();
                $("#preview_dialog").empty().append($preview);
                break;
        }
    }

    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function (operate, id) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var $all = $("#addOrEdit_task_dialog").find("div.taskInfo"),
            $taskName = $all.find('[name="name"]'),
            $modelName = $all.find('[name="modelName"]'),
            $modelCode = $all.find('[name="modelCode"]'),
            $file = $all.find("input[type=file]"),
            $userGroupRow = $all.find('.userGroup'),
            $userGroupBtn = $all.find('.userGroupBtn'),
            $areaCode = $all.find('[name="areaCode"]'),
            $areaName = $all.find('[name="areaName"]');

        initContentSelect();

        function initContentSelect() {
            var $contentSelect = $('[name="contentId"]');
            globalRequest.iPtv.queryAllMessagePageContent(false, {}, function (data) {
                $contentSelect.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        $contentSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }, function () {
                layer.alert("系统异常，获取内容模板失败", {icon: 6});
            });
        }

        initEvent();

        function initEvent() {
            /**
             * 归属区域 点击事件
             */
                // 如果是地市管理员，那么覆盖区域将无法选择
            var userInfo = globalConfigConstant.loginUser
            $areaName.val(userInfo.areaName);
            $areaCode.val(userInfo.areaCode);
            // if (userInfo.areaId !== 99999) {
            //     $areaName.val(userInfo.areaName);
            //     $areaCode.val(userInfo.areaCode);
            //     $areaName.click(function () {
            //         var comfirmBox = $html.confirm('您的权限只能覆盖当前区域', function () {
            //             layer.close(comfirmBox);
            //         }, function () {
            //             layer.close(comfirmBox);
            //         })
            //     })
            // } else {
            //     $areaName.click(function () {
            //         var setting = {
            //             view: {
            //                 dblClickExpand: true
            //             },
            //             edit: {
            //                 enable: true,
            //                 showRemoveBtn: false,
            //                 showRenameBtn: false
            //             },
            //             data: {
            //                 simpleData: {
            //                     enable: true
            //                 },
            //                 keep: {
            //                     leaf: true,
            //                     parent: true
            //                 }
            //             },
            //             check: {
            //                 enable: true,
            //                 chkStyle: "radio",
            //                 radioType: "all"
            //             }
            //         };
            //         globalRequest.iScheduling.queryUserAreas(true, {}, function (data) {
            //             if (data && data.length > 0) {
            //                 var selectIdsArray = $areaCode.val().split(",");
            //                 if (selectIdsArray) {
            //                     if (selectIdsArray[0] === "99999") {
            //                         for (var j = 0; j < data.length; j++) {
            //                             data[j].checked = true;
            //                         }
            //                     } else {
            //                         for (var i = 0; i < selectIdsArray.length; i++) {
            //                             for (var j = 0; j < data.length; j++) {
            //                                 if (data[j].element.code == selectIdsArray[i]) {
            //                                     data[j].checked = true;
            //                                     break
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //
            //                 $.fn.zTree.init($("#treePrimary"), setting, data);
            //                 $plugin.iModal({
            //                     title: "归属区域",
            //                     content: $("#dialogTreePrimary"),
            //                     area: ['500px', '500px'],
            //                     btn: ['确定', '取消']
            //                 }, function (index) {
            //                     var areaNamesStr = "", areaIdsStr = "";
            //                     var zTree = $.fn.zTree.getZTreeObj("treePrimary"),
            //                         nodes = zTree.getCheckedNodes(),
            //                         nodesLength = nodes.length;
            //                     if (nodesLength <= 0) {
            //                         $areaName.val("");
            //                         $areaCode.val("");
            //                     } else {
            //                         if (nodesLength < data.length) {    // 没有全选 则去掉江苏省
            //                             // nodes.splice(0, 1);
            //                             for (var i = 0; i < nodes.length; i++) {
            //                                 areaNamesStr += nodes[i].name + ",";
            //                                 areaIdsStr += nodes[i].element.code + ","
            //                             }
            //                             $areaName.val(areaNamesStr.substring(0, areaNamesStr.length - 1));
            //                             $areaCode.val(areaIdsStr.substring(0, areaIdsStr.length - 1));
            //                         } else if (nodesLength === data.length) {   // 全选 则直接赋江苏省的值
            //                             $areaName.val(nodes[0].name);
            //                             $areaCode.val(nodes[0].element.code);
            //                         }
            //                     }
            //                     layer.close(index);
            //                 })
            //             }
            //         }, function () {
            //             layer.alert("系统异常：查询用户目录失败");
            //         });
            //     });
            // }

            /**
             * 导入客群 选择文件 点击事件
             */
            $file.click(function (e) {
                $(this).val("");
                $modelName.val("");
            }).change(function (e) {
                try {
                    $modelName.val("");
                    var src = e.target.value;
                    var fileName = src.substring(src.lastIndexOf('\\') + 1);
                    var fileExt = fileName.replace(/.+\./, "");
                    if (fileExt !== "txt") {
                        layer.msg("请使用txt格式的文件!");
                        return;
                    }
                    $modelName.val(fileName);
                } catch (e) {
                    console.log("file selected error");
                }
            })

            /**
             * 导入客群 点击事件
             */
            $userGroupBtn.click(function () {
                if ($modelCode.val()) {
                    layer.confirm("重新导入指定维系用户文件会覆盖当前数据", function (index) {
                        layer.close(index);
                        userGroup();
                    });
                } else {
                    userGroup()
                }

                function userGroup() {
                    appointFileId = null;
                    successCount = null;
                    var $dialog = $("#import_userGroup_dialog");
                    obj.initDialog(2);
                    var $all = $dialog.find(".importUserGroupInfo"),
                        $form = $all.find(".importForm"),
                        $fileUploadName = $all.find(".fileUploadName"),
                        $fileUploadBtn = $all.find(".importForm .btnUpload"),
                        $files = $all.find("input[type=file]");
                    $plugin.iModal({
                        title: '导入客群',
                        content: $dialog,
                        area: ['750px', '630px']
                    }, function (index) {
                        if (!appointFileId) {
                            layer.msg('您还未上传文件！')
                            return;
                        } else {
                            if (successCount === 0) {
                                layer.alert('您成功导入的用户数为0，请查看导入数据是否符合要求！')
                                return;
                            } else {
                                $modelName.val($fileUploadName.val());
                                $modelCode.val(appointFileId);
                            }
                        }
                        layer.close(index);
                    }, null, function (layero, index) {
                        layero.find("input.dialogIndex").attr("index", index);
                    })

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
                            url: 'importIptvManualTaskAim.view',
                            dataType: 'json',
                            beforeSubmit: function () {
                                $html.loading(true)
                            },
                            success: function (data) {
                                $html.loading(false)
                                if (data.retValue == "0") {
                                    layer.msg("上传成功", {time: 2000});
                                    appointFileId = data.fileCode;
                                    successCount = data.successCount;
                                    $("#import_userGroup_dialog .importUserGroupInfo").find(".phoneInfo .uploadMessage").text('上传成功,共上传' + data.totalCount + '条记录,成功' + data.successCount + '条记录');
                                } else {
                                    layer.alert("创建失败:" + data.desc);
                                }
                            }
                        }
                        $form.ajaxSubmit(options);
                    }
                }
            })
        }

        if (operate === iptvTask_constant.operate.update) {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            globalRequest.iPtv.queryMessagePushTaskDetail(false, {taskId: id}, function (data) {
                if (!data) {
                    layer.alert("数据异常,请刷新重试", {icon: 5});
                    return;
                }
                $("#addOrEdit_task_dialog").find("div.taskInfo").autoAssignmentForm(data);
                if (data.type == "jxh") {
                    $taskName.attr('disabled', true);
                    $areaName.attr('disabled', true);
                    $userGroupRow.hide();
                }
            })
        }
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param status
     */
    obj.initDetailValue = function (id, type) {
        if (type == "preview") {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.iPtv.queryMessagePushTaskDetail(true, {taskId: id, showDivHeight: 190}, function (data) {
                if (!data) {
                    layer.alert("根据ID查询任务数据失败", {icon: 6});
                    return;
                }
                var $all = $("#preview_dialog div.taskDetailInfo");
                $all.find(".detail_taskName").text(data.name || "空");
                $all.find(".detail_taskType").text(obj.getTaskType(data.type) || "空");
                $all.find(".detail_startTime").text(data.startTime || "空");
                $all.find(".detail_stopTime").text(data.stopTime || "空");
                $all.find(".detail_areaName").text(data.areaName || "空");
                $all.find(".detail_triggerBalance").text(data.triggerBalance || "空");
                $all.find(".detail_repeatStrategy").text(data.repeatStrategy || "空");
                $all.find(".detail_remarks").text(data.remarks || "空");
                $all.find('.preHtml').html(data.contentHtml || '')
            }, function () {
                layer.alert("根据ID查询任务数据失败", {icon: 6});
            })
        }
    }

    /**
     * 获取任务状态
     * @param status
     */
    obj.getTaskStatus = function (status) {
        if (status == -1) {
            return "<i class='fa'>无效</i>";
        } else if (status == 0) {
            return "<i class='fa' style=''>已暂停</i>";
        } else if (status == 1) {
            return "<i class='fa' style='color: green;'>已生效</i>";
        } else if (status == 2) {
            return "<i class='fa' style=''>待生效</i>";
        } else if (status == 3) {
            return "<i class='fa' style=''>审批中</i>";
        } else if (status == 4) {
            return "<i class='fa' style='color: red;'>审批拒绝</i>";
        } else if (status == 5) {
            return "<i class='fa' style='color: #00a0d0;'>待处理</i>";
        } else if (status == 6) {
            return "<i class='fa' style='color: red;'>终止</i>";
        } else if (status == 9) {
            return "<i class='fa' style='color: orange;'>处理中</i>";
        } else {
            return "<i class='fa'>未知</i>";
        }
    }

    /**
     * 获取任务类型
     */
    obj.getTaskType = function (type) {
        switch (type) {
            case "manual":
                return "手工自建"
            case "jxh":
                return "精细化"
            default:
                return "未知"
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var $queryName = $.trim($(".queryName").val());
        return "queryMessagePushTasksByPage.view?name=" + $queryName;
    }

    return obj;
}
()

function onLoadBody() {
    iptvTask.iniData();
    iptvTask.initEvent();
}