/**
 * Created by Chris on 2017/9/27.
 */
var branchOpenConfig = function () {
    var getBranchOpenConfigUrl = "queryBatchOpenTask.view";
    var dataTable;
    var obj = {};

    //初始化dataTable
    obj.dataTableInit = function () {
        $('#dateTime').val(new Date().format('yyyy-MM-dd'));
        var params = "dateTime=" + $("#dateTime").val() + "&source=" + $(".querySelectType").val();
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getBranchOpenConfigUrl + "?" + params,
                type: "POST"
            },
            columns: [
                {data: "id", title: "群组", width: 300, className: "dataTableFirstColumns"},
                {
                    data: "taskName", title: "活动名称", width: 800, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.createUser == globalConfigConstant.loginUser.id && row.status == 1) {
                            return "<span onmouseover='branchOpenConfig.hoverAuditor(\"" + row.id + "\",this)'>" + data + "</span>";
                        } else {
                            return data;
                        }
                    }
                },
                {data: "createTime", title: "创建时间", width: 400, className: "centerColumns"},
                {
                    data: "taskSource", title: "来源", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        if (data === "jxhscene") {
                            return "精细化平台"
                        } else if (data === "sms") {
                            return "自导入群组"
                        } else {
                            return "未知"
                        }
                    }
                },
                {data: "marketAreaName", title: "地市", width: 400, className: "centerColumns"},
                {data: "appointUsersName", title: "用户群名称", width: 800, className: "centerColumns"},
                {data: "appointUsersDesc", title: "活动描述", width: 800, className: "centerColumns"},
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var assignBtnHtml = "";
                        if (row.createUser == globalConfigConstant.loginUser.id) {
                            if (row.status == 0) {
                                assignBtnHtml = "<a title='批开任务配置'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='branchOpenConfig.assignItem(" + row.id + ",\"" + row.taskName + "\")' >批开任务配置</a>";
                            }
                            else if (row.status == 1) {
                                assignBtnHtml = "<span>审核中</span>"
                            }
                        }
                        return assignBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    //初始化按钮事件
    obj.initBtn = function () {
        $(".groupExport").click(obj.groupExport);
        $(".searchBtn").click(obj.evtOnRefresh);
    };

    //查询事件
    obj.evtOnRefresh = function () {
        var params = "dateTime=" + $("#dateTime").val() + "&source=" + $(".querySelectType").val();
        dataTable.ajax.url(getBranchOpenConfigUrl + "?" + params);
        dataTable.ajax.reload();

    };

    //批开群组导入
    obj.groupExport = function () {
        // 点击按钮先查询用户是否有权限进行批开操作
        var isAuthority = false;
        globalRequest.iBatchOpen.checkUserImportAuthority(false,{},function(data){
            if(data && data.retValue == 0)
            {
                isAuthority = true;
            }
            else
            {
                layer.alert(data.desc)
            }
        },function(){
            $html.warning("系统异常,请稍后再试");
        });

        if(isAuthority == false)
        {
            return;
        }
        var $taskName = $(".importDialog .importForm #taskName");
        var $fileName = $(".importDialog .importForm span.file_name");

        var $form = $(".iMarket_groupImport_Popup .importForm"),
            $taskName = $(".iMarket_groupImport_Popup #taskName"),
            $modelName = $(".iMarket_groupImport_Popup #modelName"),
            $modelDesc = $(".iMarket_groupImport_Popup #modelDesc");

        // 点击先清空文本
        $(".importDialog").find(".importForm").find("input[type=file]").val("");
        $taskName.val("");
        $fileName.html("");
        $modelName.val("");
        $modelDesc.val("");
        // 选择文件名展现为活动名称
        $(".importDialog").find(".importForm").find("input[type=file]").click(function (e) {
            $(this).val("");
            $fileName.html("");
        }).change(function (e) {
            try {
                $fileName.html("");
                var src = e.target.value;
                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                var fileExt = fileName.replace(/.+\./, "");
                var taskName = fileName.split(".")[0];
                $fileName.html(fileName);
                if (fileExt !== "txt") {
                    layer.msg("请选择txt文件!");
                    return;
                }
                if ($taskName.val().length == 0) {
                    $taskName.val(taskName);
                }
            } catch (e) {
                console.log("file selected error");
            }
        });

        layer.open({
            type: 1,
            shade: 0.3,
            title: "批开群组导入",
            offset: '50px',
            area: ['580px', '520px'],
            content: $(".iMarket_groupImport_Popup"),
            btn: ['提交', '取消'],
            yes: function (index) {
                obj.submitGroupImport(index);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });

        //批开群组导入 提交事件
        obj.submitGroupImport = function (index) {
            // 校验
            if ($form.find("input[type=file]").val() && $taskName.val() && $modelName.val() && $modelDesc.val()) {
                var options = {
                    type: 'POST',
                    url: 'importBatchOpenTask.view',
                    dataType: 'json',
                    beforeSubmit: function () {
                        $html.loading(true)
                    },
                    success: function (data) {
                        $html.loading(false);
                        if (data.retValue == "0") {
                            layer.msg(data.remarks);
                            dataTable.ajax.reload();
                        } else {
                            layer.alert("创建失败:" + data.desc);
                        }
                    }
                };
                $form.ajaxSubmit(options);
                layer.close(index);
            } else {
                layer.msg("导入参数填写不全，请重试！");
                return false;
            }

        };
    };

    //批开任务配置
    obj.assignItem = function (ids, taskName) {
        var $NameDialog = $(".iMarket_taskAssign_Popup ");
        $NameDialog.find(".taskName").text(taskName || "空");
        $NameDialog.find(".dateTime").val("");// 清空执行时间
        var selectQueryProduct1 = $NameDialog.find("#selectQueryProduct1"),
            selectQueryProduct2 = $NameDialog.find("#selectQueryProduct2"),
            selectQueryProduct3 = $NameDialog.find("#selectQueryProduct3"),
            executeTime = $NameDialog.find("#executeTime"),
            isSmsSend = $NameDialog.find(".isSendSms");
        // 加载下拉数据
        globalRequest.iBatchOpen.queryAllProductForTask(false, {}, function (data) {
            // 清空下拉
            $NameDialog.find(".productSelect").empty();
            // 渲染数据
            var option = "<option class='product' value='BB' task_type='CC'>DD</option>";
            if (data) {
                selectQueryProduct1.append("<option value='' task_type=''>请选择产品</option>");
                selectQueryProduct2.append("<option value='' task_type=''>请选择产品</option>");
                selectQueryProduct3.append("<option value='' task_type=''>请选择产品</option>");
                for (var i = 0; i < data.length; i++) {
                    selectQueryProduct1.append(option.replace("BB", data[i].id).replace("CC", data[i].productType).replace("DD", data[i].productName));
                    selectQueryProduct2.append(option.replace("BB", data[i].id).replace("CC", data[i].productType).replace("DD", data[i].productName));
                    selectQueryProduct3.append(option.replace("BB", data[i].id).replace("CC", data[i].productType).replace("DD", data[i].productName));
                }
            }
        }, function () {
            layer.alert("查询可配置产品异常，请稍后重试");
        });

        // 提交任务审核
        function submitAudit(index) {
            var editProduct = {},
                product1 = selectQueryProduct1.val(),
                product2 = selectQueryProduct2.val(),
                product3 = selectQueryProduct3.val(),
                taskType1 = selectQueryProduct1.find("option:selected").attr("task_type"),
                taskType2 = selectQueryProduct2.find("option:selected").attr("task_type"),
                taskType3 = selectQueryProduct3.find("option:selected").attr("task_type");
            // 判断是否选择了产品
            if (!product1 && !product2 && !product3) {
                layer.msg("产品配置不能为空!");
                return;
            }
            // 判断是否选择一样的产品
            var ary1 = new Array();
            if (product1) {
                ary1.push(product1)
            }
            if (product2) {
                ary1.push(product2)
            }
            if (product3) {
                ary1.push(product3)
            }
            var nary = ary1.sort();
            for (var i = 0, y = ary1.length; i < y; i++) {
                if (nary[i] != undefined && nary[i] == nary[i + 1]) {
                    layer.msg("不能订购重复产品!");
                    return;
                }
            }
            // 判断产品类型是否一致
            var ary2 = new Array();
            if (taskType1) {
                ary2.push(taskType1)
            }
            if (taskType2) {
                ary2.push(taskType2)
            }
            if (taskType3) {
                ary2.push(taskType3)
            }
            var nary1 = ary2.sort();
            for (var i1 = 0; i1 < ary2.length; i1++) {
                if (nary1[i1] != undefined && nary1[i1 + 1] != undefined && nary1[i1] != nary1[i1 + 1]) {
                    layer.msg("产品类型需要保持一致!");
                    return;
                }
            }
            if (executeTime.val()) {
                editProduct.executeTime = executeTime.val();
            } else {
                layer.tips("请选择执行时间", executeTime);
                return;
            }
            editProduct.taskId = ids;
            editProduct.product1 = product1;
            editProduct.product2 = product2;
            editProduct.product3 = product3;
            if (isSmsSend.is(":checked")) {
                editProduct.isSmsSend = "0";
            } else {
                editProduct.isSmsSend = "1";
            }
            globalRequest.iBatchOpen.disposedBatchOpenTask(false, editProduct, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    dataTable.ajax.reload();
                    layer.msg("提交成功", {time: 1000});
                }
            }, function () {
                layer.alert("配置批开任务异常");
            });


        }

        layer.open({
            type: 1,
            shade: 0.3,
            title: "批开任务配置",
            offset: '50px',
            area: ['580px', '520px'],
            content: $(".iMarket_taskAssign_Popup"),
            btn: ['提交审核', '取消'],
            yes: function (index) {
                submitAudit(index);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });
    };

    /**
     * 显示活动名称字段浮动窗口
     * @param taskId
     * @param element
     */
    obj.hoverAuditor = function (taskId, element) {
        if (taskId <= 0) {
            return;
        }
        globalRequest.iBatchOpen.queryNowAuditUserNameByTaskId(false, {taskId: taskId}, function (data) {
            if (data && data.auditUserName) {
                layer.tips('当前审核人:'+data.auditUserName, $(element), {
                    tips: [1, '#00B38B'],
                    time: 1500
                });
            }
        })
    }

    return obj;
}();

function onLoadBody() {
    branchOpenConfig.dataTableInit();
    branchOpenConfig.initBtn();
}