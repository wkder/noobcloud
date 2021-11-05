/**
 * Created by hale on 2017/1/21.
 */

var marketingModel = function () {
    var getUrl = "queryModelsByPage.view",
        downloadUrl = "downloadModel.view",
        status = 0, dataTable = {}, obj = {}, myRule = {}, remarksList = [];

    // 声明元素和变量
    var $queryNameText = $("#txtName"),                                      // 模型名称
        $queryUserNameText = $("#txtCreater"),                               // 创建人
        $queryCatalogText = $("#txtCatalog"),                                // 选择目录
        $queryCreateTypeSelect = $("#selRule"),                              // 创建方式
        $queryBtn = $("#btnQuery"),                                          // 搜索按钮
        $addBtn = $("#btnAdd"),                                              // 新增按钮
        $displayIcons = $(".i-div"),                                         // 显示风格切换的图标
        $listIcon = $("[data-switch='list']"),                               // 列表图标
        $tableIcon = $("[data-switch='table']"),                             // 表格图标
        $modelTable = $('#dataTable'),                                       // 表格
        $dialogModel = $("#divModel"),                                       // 模型 弹窗
        $dialogAssignUsers = $("#divAssignUsers"),                           // 指定角色 弹窗
        $dialogRemoteServer = $("#divRemoteServer"),                         // 远程服务器 弹窗
        $nameText = $dialogModel.find("[name='name']"),                      // 模型名称
        $catlogText = $dialogModel.find("[name='catalogName']"),             // 目录分类
        $catlogId = $dialogModel.find("[name='catalogId']"),                 // 目录分类 隐藏域
        $catlogBtn = $dialogModel.find("#btnChooseCatalog"),                 // 目录分类 按钮
        $roleRadio = $dialogModel.find("[name='radioSpecifiedRoleIds']"),    // 角色可见性
        $roleTextArea = $dialogModel.find("[name='specifiedRoleIds']"),      // 指定角色
        $roleBtn = $dialogModel.find("#btnChooseUsers"),                     // 指定角色 按钮
        $divAssignUsers = $("#divBlockAssignUsers"),                         // 指定角色Div
        $smsRadio = $dialogModel.find("[name='isNeedSendNotifySms']"),       // 发送短信
        $createTypeSelect = $dialogModel.find("[name='createType']"),        // 创建方式
        //  $importTypeRadio = $dialogModel.find("[name='importType']"),         // 导入方式
        //$remoteServerSelect = $dialogModel.find("[name='remoteServerId']"),  // 服务器连接
        //$remoteServerBtn = $dialogModel.find("#btnAddConnection"),           // 服务器连接 按钮
        $testConnectionBtn = $("#btnTestConnection"),                        // 测试连接 按钮
        $remoteFileText = $dialogModel.find("[name='remoteFile']"),          // 文件路径
        $localFileBtn = $dialogModel.find("#btnChooseFile"),                 // 文件路径 按钮
        $fileUpload = $("#fileUpload"),                                      // 本地文件导入
        $executeTimeText = $dialogModel.find("[name='executeTime']"),        // 读取时间
        $executeTimeCheckBox = $dialogModel.find("[name='isNeedDelete']"),   // 读取时间 是否删除复选框
        //  $intervalTimeText = $dialogModel.find("[name='intervalTime']"),      // 时间间隔
        // $intervalTimeSelect = $dialogModel.find("[name='intervalType']"),    // 时间间隔 下拉框
        $remarksTextArea = $dialogModel.find("[name='remarks']"),            // 备注
        $ruleTree = $(".ruleRight");                                         // 规则树

    var EDIT = "edit", RESUBMIT = "resubmit", CHECK = "check",
        CREATE_TYPE_RULE = "rule", CREATE_TYPE_IMPORT = "import";

    obj.initData = function (data) {
        getUrl += "?status=" + data;
        status = data;
        if (status == 0) {
            $.loadmore.get(obj.tableInit, {scroll: true, size: 16}, 0, 16);
        }
        obj.dataListInit();
    }

    obj.initEvent = function () {
        $queryCatalogText.change(obj.ClearCatalogText);
        $queryCatalogText.click(obj.evtOnShowQueryCatlogTree);
        $queryBtn.click(obj.evtOnQuery);
        $addBtn.click(function () {
            obj.evtOnAddOrEdit({}, "add");
        });
        $displayIcons.click(obj.evtOnShowListOrTable)
    }

    obj.tableInit = function (config, offset, size) {
        config.isAjax = true;
        config.isEnd = false;
        var params = marketingModel.getParams("json");
        params.start = offset || 0;
        params.length = size || 16;

        globalRequest.iModel.queryModelsByList(false, params, function (data) {
            var $form = $("[data-switch='table']>div:first-child");
            if (config.isQuery) {
                $form.empty();
                config.isQuery = false;
            }
            $form.append(obj.spliceHtml(data.data));

            config.isAjax = false;
            var sum = data.total;
            if ((offset + size) >= sum) {
                config.isEnd = true;  //停止滚动加载请求
                console.log("停止滚动加载请求 :" + config.isEnd);
            }
            config.isQuery = false;
        }, {});
    }

    obj.dataListInit = function () {
        var params = obj.getParams();
        var option = {
            ele: $modelTable,
            ajax: {url: getUrl + "&" + params, type: "POST"},
            columns: [
                {
                    data: "name", title: "模型名称", width: 50, className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        return "<span title='" + row.name + "' style='width:100px;word-break: break-all;display: -webkit-box;overflow: hidden;-webkit-line-clamp: 2;-webkit-box-orient: vertical;'>" + row.name + "</span>";
                    }
                },
                {
                    data: "createType", title: "创建类型", width: 80,
                    render: function (data, type, row) {
                        return obj.enum(row.createType);
                    }
                },
                {data: "catalogName", title: "目录", width: 100},
                {data: "createUserName", title: "创建人", width: 80},
                {data: "createTime", title: "创建时间", width: 80},
                {data: "lastRefreshSuccessTime", title: "刷新时间", width: 80},
                {data: "lastRefreshCount", title: "人数", width: 100},
                {data: "rule", visible: false},
                {
                    title: "操作", width: 100,
                    render: function (data, type, row) {
                        var element = utils.authButton("<a class='btn listBtn-create' title='创建营销' onclick='marketingModel.evtOnCreate(" + row.id + ",\"" + row.name + "\"," + row.lastRefreshCount + ")'><i class='fa fa-plus'></i></a>", "modelToMarketTaskCreate");
                        element += utils.authButton('<a class="btn listBtn-download" title="下载模型" onclick="marketingModel.evtOnDownload(' + row.id + ')"><i class="fa fa-arrow-down"></i></a>', 'modelDownload');

                        if (row.createType == 'rule') {
                            // 刷新
                            element += "<a class='btn listBtn-refresh' title='刷新模型' onclick=marketingModel.evtOnRefresh(" + row.id + ",'" + row.rule + "')><i class='fa fa-refresh'></i></a>";
                        }

                        row.executeTime = row.executeTime ? encodeURI(row.executeTime) : row.executeTime;
                        row.createTime = row.createTime ? encodeURI(row.createTime) : row.createTime;
                        row.lastUpdateTime = row.lastUpdateTime ? encodeURI(row.lastUpdateTime) : row.lastUpdateTime;
                        row.lastRefreshTime = row.lastRefreshTime ? encodeURI(row.lastRefreshTime) : row.lastRefreshTime;
                        row.lastRefreshSuccessTime = row.lastRefreshSuccessTime ? encodeURI(row.lastRefreshSuccessTime) : row.lastRefreshSuccessTime;

                        if (row.createUser == globalConfigConstant.loginUser.id) {
                            element += utils.authButton("<a class='btn listBtn-info' title='编辑模型' onclick=marketingModel.evtOnAddOrEdit(" + JSON.stringify(row) + ",\"edit\")><i class='fa fa-pencil'></i></a>", "modelEdit");
                            element += utils.authButton('<a class="btn listBtn-danger" title="删除模型" onclick="marketingModel.evtOnDelete(' + row.id + ')"><i class="fa fa-times"></i></a>', "modelDelete");
                        }

                        var viewAuditHtml = "<a type='button' class='viewAuditBtn btn btn-danger btn-sm btn-preview' title='查看详情' href='#' onclick='marketingModel.viewAudit(" + row.id + ")' ><i class='fa fa-eye'></i></a>";

                        //被拒绝的模型页面操作按钮配置
                        var resubmit = "<a type='button' class='resubmitBtn btn btn-primary btn-sm btn-back' href='#' title='重新提交' onclick=marketingModel.evtOnAddOrEdit(" + JSON.stringify(row) + "," + '"resubmit"' + ")><i class='fa fa-reply'></i></a>";
                        resubmit += "<a class='deleteBtn btn btn-danger btn-sm btn-delete' title='删除模型' onclick='marketingModel.evtOnDelete(" + row.id + ")'><i class='fa fa-trash-o'></i></a>";
                        resubmit += viewAuditHtml;

                        if (row.status == 0 || row.status == 1) {//审批通过/刷新中
                            return element;
                        } else if (row.status == 2) {//审批中
                            return viewAuditHtml;
                        } else if (row.status == 3) {
                            return resubmit;
                        }
                        return '';
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    obj.ClearCatalogText = function () {
        if ($queryCatalogText.val().length <= 0) {
            $queryCatalogText.attr("data-id", "");
        }
    }

    // 查询-选择目录树
    obj.evtOnShowQueryCatlogTree = function () {
        var setting = {
            check: {
                enable: true,
                chkStyle: 'radio',
                radioType: "all"
            },
            view: {
                dblClickExpand: true,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true
                },
                keep: {
                    parent: true,
                    leaf: true
                }
            }
        };

        globalRequest.iModel.queryAllCategoryByBody(true, {type: 2}, function (data) {
            var ids = $queryCatalogText.val("").attr("data-id", "").attr("data-id");
            var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
            obj.setParentChecked(ids, data);
            result = data;
            $("#dialogTreePrimary").find("ul").empty();
            $.fn.zTree.init($("#treePrimary"), setting, result);

            $plugin.iModal({
                title: '目录分类',
                content: $("#dialogTreePrimary"),
                area: ['600px', '600px']
            }, obj.evtOnQueryCatlogTree)
        });
    }

    obj.evtOnQueryCatlogTree = function (index) {
        var zTree = $.fn.zTree.getZTreeObj("treePrimary");
        var checkedNodes = zTree.getCheckedNodes(true);
        if (checkedNodes.length > 0) {
            $queryCatalogText.val(checkedNodes[0].name).attr("data-id", checkedNodes[0].id);
            layer.close(index);
        } else {
            $html.warning("没有选择任何目录");
        }
    }

    // 查询
    obj.evtOnQuery = function () {
        $.loadmore.get(obj.tableInit, {scroll: true, size: 16, isQuery: true});
        dataTable.ajax.url(getUrl + "&" + obj.getParams());
        dataTable.ajax.reload();
    }

    // 创建
    obj.evtOnCreate = function (id, name, lastRefreshCount) {
        htmlHandle.handleCreateMarketModel({id: id, name: name, lastRefreshCount: lastRefreshCount});
    }

    // 查看审批记录
    obj.viewAudit = function (id) {
        var $dialog = $("#dialogPrimary").empty();
        $dialog.append("<table class='processTab table' style='width:100%;'></table>");

        var options = {
            ele: $dialog.find('table.processTab'),
            ajax: {url: "queryModelAuditProgress.view?id=" + id, type: "POST"},
            paging: false,
            columns: [
                {data: "auditUserName", title: "审批人", width: "15%"},
                {
                    data: "auditResult", title: "审批结果", width: "15%",
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
                        ;
                    }
                },
                {data: "auditTime", title: "审批时间", width: "25%"},
                {data: "remarks", title: "审批说明", width: "45%"}
            ]
        };
        $plugin.iCompaignTable(options);

        layer.open({
            type: 1,
            shade: 0.3,
            title: "审批进度详情",
            offset: '70px',
            area: ['700px', '500px'],
            content: $dialog,
            closeBtn: 0,
            btn: ["关闭"],
            yes: function (index, layero) {
                layer.close(index);
            }
        });
    }

    // 下载
    obj.evtOnDownload = function (id) {
        $util.exportFile(downloadUrl, {id: id});
    }

    // 刷新 TODO
    obj.evtOnRefresh = function (id, rules) {
        if (id <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        /*var $this = $(this), $parentLi = $this.closest("li"), $spans = $parentLi.find("span");
         if (rules != null) {
         // $this.attr("title", "刷新中...").removeClass("refresh").addClass("disRefresh");
         globalRequest.queryMatchRuleUserCounts(true, {rules: rules}, function (data) {
         if (data >= 0) {
         globalRequest.queryModelById(true, {id: id}, function (result) {
         var $multipleType = $("div.iMarket_Segments_Body div.multipleTypeOfDisplay div.multipleType.selected");
         var displayType = $multipleType.hasClass("list") ? "list" : "table";
         var html = template('segmentTemplate', {
         list: [result.items],
         currentOriginUser: result.currentOriginUser,
         displayType: displayType,
         operatePermission: segmentOperatePermissions
         });
         $parentLi.replaceWith(html);
         }, function () {
         layer.msg("系统异常");
         $this.attr("title", "刷新客户群").removeClass("disRefresh").addClass("refresh");
         });
         layer.msg("刷新成功");
         } else {
         layer.msg("刷新失败");
         $this.attr("title", "刷新客户群").removeClass("disRefresh").addClass("refresh");
         }
         }, function () {
         layer.msg("刷新失败");
         $this.attr("title", "刷新客户群").removeClass("disRefresh").addClass("refresh");
         })
         } else {
         layer.msg("规则为空，操作失败");
         }*/


        $html.success("刷新成功");
    }

    // 新增或修改
    obj.evtOnAddOrEdit = function (model, type) {
        // 初始化元素状态
        var title = "新增模型", btnText = "下一步";
        $dialogModel.autoEmptyForm();
        $roleTextArea.attr("data-roleIds", "");
        $ruleTree.empty().unbind("addRuleEvent");
        $createTypeSelect.val("rule").change();
        $roleRadio.eq(0).click();
        myRule = new multiRule($ruleTree);  //初始化rule组件
        // 初始化元素事件
        $catlogBtn.unbind("click").click(obj.evtOnCataLog);                     // 目录分类 按钮事件
        $roleRadio.unbind("click").click(obj.evtOnCheckVisibleUser);            // 角色可见性 切换事件
        $roleBtn.unbind("click").click(obj.evtOnAssignUsers);                   // 指定角色 按钮事件
        $createTypeSelect.unbind("change").change(obj.evtOnChangeCreateType);   // 创建方式 切换事件
        $localFileBtn.unbind("click").click(obj.evtOnChooseFile);               // 文件选择 按钮事件
        $dialogModel.find("span.fileMust").show();
        // 修改、重新提交、查看
        if (type === EDIT || type === RESUBMIT || type === CHECK) {
            model.executeTime = model.executeTime ? decodeURI(model.executeTime) : model.executeTime;
            model.createTime = model.createTime ? decodeURI(model.createTime) : model.createTime;
            model.lastUpdateTime = model.lastUpdateTime ? decodeURI(model.lastUpdateTime) : model.lastUpdateTime;
            model.lastRefreshTime = model.lastRefreshTime ? encodeURI(model.lastRefreshTime) : model.lastRefreshTime;
            model.lastRefreshSuccessTime = model.lastRefreshSuccessTime ? encodeURI(model.lastRefreshSuccessTime) : model.lastRefreshSuccessTime;
            model.specifiedRoleIds ? model["radioSpecifiedRoleIds"] = 0 : model["radioSpecifiedRoleIds"] = 1;
            $dialogModel.autoAssignmentForm(model);
            $dialogModel.find("span.fileMust").hide();
            title = obj.enum(type);
            !model.specifiedRoleIds ? $roleRadio.eq(0).click() : $roleRadio.eq(1).click();    // 用户可见性
            $roleTextArea.val(model.specifiedRoleNames).attr("data-roleIds", model.specifiedRoleIds);   // 指定角色
            if (model.createType !== CREATE_TYPE_RULE) {          // 创建类型 (rule，localImport，remoteImport)
                btnText = "确定";
                $createTypeSelect.val("import").change();
                // model.createType === IMPORT_REMOTE ? $($importTypeRadio[0]).click() : $($importTypeRadio[1]).click();
                $remoteFileText.val(model.remoteFile);
            }
            myRule.init(JSON.parse(model.rule));    // 加载rule
        }
        obj.attrState(type);

        $plugin.iModal({
            title: title,
            content: $dialogModel,
            area: ['700px', '650px']
        }, obj.evtOnSaveOrNext, null, function (layero, index) {
            $(".layui-layer-btn0").attr("data-operation", type);
            if (type == CHECK && btnText == "确定") {
                layero.find(".layui-layer-btn0").css("cssText", "display:none !important");
            }
        }, null);

        $(".layui-layer-btn0").text(btnText);
    }

    // 保存或进行下一步
    obj.evtOnSaveOrNext = function (index) {
        if (!$dialogModel.autoVerifyForm()) {
            return;
        }
        if ($dialogModel.find("[name='radioSpecifiedRoleIds']:checked").val() == "0") {
            if (!$roleTextArea.val()) {
                $roleTextArea.focus();
                layer.tips("请选择指定角色", $roleTextArea, {tips: 3});
                return;
            }
        }

        var modelData = $dialogModel.autoSpliceForm();
        globalRequest.checkDuplicationOfModelName(true, {id: modelData.id, name: modelData.name}, function (data) {
            if (data.retValue != 0) {
                layer.tips(data.desc, $nameText, {tips: 3});
                $nameText.focus();
            } else {
                var $confirmBtn = $(".layui-layer-btn0");
                if ($confirmBtn.text() === "下一步") {
                    obj.getTree();
                    var operation = $(".layui-layer-btn0").attr("data-operation");

                    var title = obj.enum(operation);
                    if ($system.PROVINCE_ENUM.JS == $system.getProvince()) {
                        var titleType = title
                        title = titleType +  '<button type="button refreshTime">标签更新信息</button>';
                    }
                    $plugin.iModal({
                        title: title,
                        content: $("#divProperty"),
                        move: false,
                        area: ['900px', '650px']
                    }, obj.evtOnSaveProperty, null, function (layero, index) {
                        if (operation == CHECK) {
                            layero.find(".layui-layer-btn0").css("cssText", "display:none !important");
                        }

                        // 查看标签更新时间事件
                        var $refreshTime = layero.find('.layui-layer-title button');
                        layero.find('.layui-layer-title').css('cursor', 'default').removeAttr('move');
                        $refreshTime.css({
                            "float" : "right",
                            "margin-right": "50px",
                            "height": "36px",
                            "line-height": "36px",
                            "font-weight": 400,
                            "background-color": "#00B38B",
                            "color": "white",
                            "border": "1px solid #00B38B",
                            "border-radius": "4px",
                            "font-size": "14px",
                            "outline": "none"
                        })
                        $refreshTime.click(function (e) {
                            var $dialog = $("#dialogMiddle"),
                                $all = $('.updateTimeTable .refreshUpdateTime').clone();
                            $dialog.empty().append($all);
                            var url = 'queryLabelsByPage.view', dataTable = {};
                            initData()

                            function initData() {
                                var options = {
                                    ele: $dialog.find('table.updateTimeTable'),
                                    ajax: {url: url, type: "POST"},
                                    columns: [
                                        {data: "lable_name", title: '标签名', width: "25%", className: "dataTableFirstColumns"},
                                        {data: "lable_data_date", title: "数据日期", width: "25%", className: "centerColumns"},
                                        {data: "update_time", title: "执行时间", width: "30%", className: "centerColumns"},
                                        {data: "update_period", title: "文件周期", width: "20%", className: "centerColumns"}
                                    ]
                                };
                                dataTable = $plugin.iCompaignTable(options);
                            }

                            $plugin.iModal({
                                title: '最新更新时间',
                                content: $dialog,
                                area: '750px'
                            }, function (index, layero) {
                                var $selectTr = layero.find('table.smsContentTab').find("tr.selected");
                                layer.close(index);
                            }, null, function (layero, index) {
                                layero.find('div.layui-layer-btn').hide();
                            })
                        })
                    });

                } else if ($confirmBtn.text() === "确定") {
                    obj.saveCommon("", index);
                }
            }
        });
    }

    obj.evtOnSaveProperty = function (index) {
        obj.saveCommon(CREATE_TYPE_RULE, index);
    }

    // 保存 公共方法
    obj.saveCommon = function (type, index) {
        var oData = $dialogModel.autoSpliceForm();
        // oData["intervalTime"] = oData["intervalTime"] + "_" + oData["intervalType"];
        oData["createType"] = obj.getCreateType();
        oData["specifiedRoleIds"] = $roleTextArea.attr("data-roleIds");
        oData["isNeedSendNotifySms"] = $smsRadio.filter(":checked").val();
        //delete oData.importType;
        //delete oData.intervalType;
        delete oData.radioSpecifiedRoleIds;

        if (type === CREATE_TYPE_RULE) { //保存规则创建
            var rules = myRule.save();
            if (rules == null) {
                return;
            }
            oData["rule"] = JSON.stringify(rules);
            delete oData.file;
            globalRequest.iModel.addOrEditModel(true, oData, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                if (type === CREATE_TYPE_RULE) {
                    setTimeout(function () {
                        layer.closeAll();
                        globalLocalRefresh.refreshModleList();
                    }, 200);
                } else {
                    layer.close(index);
                    globalLocalRefresh.refreshModleList();
                }
            })
        } else {
            if ($dialogModel.find("span.fileMust").is(":visible") && $remoteFileText.val() === "") {
                layer.tips("请选择文件并导入", $remoteFileText, {tips: 3});
                return;
            }

            var options = {
                type: 'POST',
                url: 'addOrEditModelByLocalFile.view',
                dataType: 'json',
                beforeSubmit: function () {
                    $html.loading(true)
                },
                success: function (data) {
                    $html.loading(false)
                    if (!data.state) {
                        $html.warning(data.message);
                        return;
                    }
                    $html.success(data.message);
                    layer.close(index);
                    globalLocalRefresh.refreshModleList();
                }
            };
            $roleTextArea.val($roleTextArea.attr("data-roleIds"));
            $("#localFileForm").ajaxSubmit(options);
        }

        /*var $element = $importTypeRadio.filter(":checked");
         if ($element.val() === IMPORT_LOCAL) {    //本地文件导入
         if ($remoteFileText.val() === "") {
         layer.tips("请选择文件并导入", $remoteFileText, {tips: 3});
         return;
         }

         var options = {
         type: 'POST',
         url: 'addOrEditModelByLocalFile.view',
         dataType: 'json',
         success: function (data) {
         if (!data.state) {
         $html.warning(data.message);
         return;
         }
         $html.success(data.message);
         layer.close(index);
         globalLocalRefresh.refreshModleList();
         }
         };
         $roleTextArea.val($roleTextArea.attr("data-roleIds"));
         $("#localFileForm").ajaxSubmit(options);
         } else {
         delete oData.file;

         if (type !== CREATE_TYPE_RULE) {
         if ($remoteServerSelect.val() === "-1") {
         layer.tips("请选择服务器连接", $remoteServerSelect, {tips: 3});
         return;
         }
         if ($remoteFileText.val() === "") {
         layer.tips("请填写文件路径", $remoteFileText, {tips: 3});
         return;
         }
         if ($executeTimeText.val() === "") {
         layer.tips("请设置读取时间", $executeTimeText, {tips: 3});
         return;
         }
         if ($intervalTimeText.val() === "") {
         layer.tips("请填写时间间隔", $intervalTimeText, {tips: 3});
         return;
         }
         }

         globalRequest.iModel.addOrEditModel(true, oData, function (data) {
         if (!data.state) {
         $html.warning(data.message);
         return;
         }
         $html.success(data.message);
         if (type === CREATE_TYPE_RULE) {
         setTimeout(function () {
         layer.closeAll();
         globalLocalRefresh.refreshModleList();
         }, 200);
         } else {
         layer.close(index);
         globalLocalRefresh.refreshModleList();
         }
         })
         }*/
    };

    // 删除
    obj.evtOnDelete = function (id) {
        if (id <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        var index = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iModel.deleteModel(true, {id: id}, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                globalLocalRefresh.refreshModleList();
            });
        }, function () {
            layer.close(index);
        });
    };

    // 切换显示 列表与表格
    obj.evtOnShowListOrTable = function () {
        var $icon = $(this).children("i");
        var $siblingIcon = $(this).siblings(".i-div").children("i");

        $icon.css("color", "#00B38B");
        $siblingIcon.css("color", "#3e3737");

        if ($icon.hasClass("fa-table")) {
            $listIcon.hide();
            $tableIcon.show();
        } else if ($icon.hasClass("fa-list")) {
            $tableIcon.hide();
            $listIcon.show();
        }
    }

    // 切换显示 用户可见性
    obj.evtOnCheckVisibleUser = function (e) {
        var ele = e.target;
        if (ele.value === "1") { // 全部用户
            $('[data-visibleUser="1"]').hide();
            $(".sendNotifySmsChoose").hide();
        } else if (ele.value === "0") {  // 指定用户
            $('[data-visibleUser="1"]').show();
            $(".sendNotifySmsChoose").show();
        }
    }

    // 弹出目录分类
    obj.evtOnCataLog = function (e) {
        e.preventDefault();
        var setting = {
            check: {
                enable: true,
                chkStyle: 'radio',
                radioType: "all"
            },
            view: {
                dblClickExpand: true,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true
                },
                keep: {
                    parent: true,
                    leaf: true
                }
            }
        };

        globalRequest.iModel.queryAllCategoryByBody(true, {type: 2}, function (data) {
            var ids = $catlogId.val();
            var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
            obj.setParentChecked(ids, data);
            result = data;
            $("#dialogTreePrimary").find("ul").empty();
            $.fn.zTree.init($("#treePrimary"), setting, result);

            $plugin.iModal({
                title: '目录分类',
                content: $("#dialogTreePrimary"),
                area: ['600px', '600px']
            }, obj.evtOnCatalogTree);
        });
    }

    obj.evtOnCatalogTree = function (index) {
        var zTree = $.fn.zTree.getZTreeObj("treePrimary");
        var checkedNodes = zTree.getCheckedNodes(true);
        if (checkedNodes.length > 0) {
            $catlogText.val(checkedNodes[0].name);
            $catlogId.val(checkedNodes[0].id);
            layer.close(index);
        } else {
            $html.warning("没有选择任何目录");
        }
    }

    // 弹出指定用户
    obj.evtOnAssignUsers = function (e) {
        e.preventDefault();
        $dialogAssignUsers.autoEmptyForm();
        globalRequest.iModel.queryAllRole(true, {}, function (data) {
            $divAssignUsers.empty();

            var html = "";
            var checkedAreaColumnName = $roleTextArea.val();
            var checkedColumnArray = checkedAreaColumnName.split(",") || []
            for (var i = 0; i < data.length; i++) {
                var activeClass = "", lastDivClass = "";
                if (checkedColumnArray.indexOf(data[i].name) != -1) {
                    activeClass = "div-choose-user-active";
                }
                html += "<div class='col-md-4 div-choose-user " + activeClass + "" + lastDivClass + "' onclick='marketingModel.evtOnSpanChooseAssignUsersClass(this)'>";
                html += "<span data-id='" + data[i].id + "' title='" + data[i].name + "'>";
                html += "" + data[i].name + "";
                html += "</span></div>";
            }
            $divAssignUsers.append(html);
        })

        $plugin.iModal({
            title: '选择指定角色',
            content: $dialogAssignUsers,
            area: ['900px', '600px']
        }, obj.evtOnChooseAssignUsers)
    }

    // 选择指定角色-点击DIV事件
    obj.evtOnSpanChooseAssignUsersClass = function (e) {
        if (!$(e).hasClass("div-choose-user-active")) {
            $(e).addClass("div-choose-user-active");
        } else {
            $(e).removeClass("div-choose-user-active");
        }
    }

    // 选择指定角色
    obj.evtOnChooseAssignUsers = function (index) {
        var $eleArray = $divAssignUsers.find(".div-choose-user-active"), checkedValues = "", checkedIds = "";
        for (var i = 0; i < $eleArray.length; i++) {
            var $checkedElement = $($eleArray[i]).children("span");
            checkedValues += $checkedElement.html() + ",";
            checkedIds += $checkedElement.attr("data-id") + ",";
        }
        $roleTextArea.val(checkedValues.substr(0, checkedValues.length - 1)).attr("data-roleIds", checkedIds.substr(0, checkedIds.length - 1));
        layer.close(index);
    }

    // 切换显示 创建方式
    obj.evtOnChangeCreateType = function () {
        var $confirmBtn = $(".layui-layer-btn0");
        if ($(this).val() === CREATE_TYPE_RULE) {
            $("[data-createType='1']").hide();
            $confirmBtn.text("下一步");
        } else if ($(this).val() === CREATE_TYPE_IMPORT) {
            // if ($importTypeRadio.filter(":checked").val() === IMPORT_LOCAL) {
            $("[data-importType='local']").show();
            /* } else {
             $("[data-createType='1']").show();
             }*/
            $confirmBtn.text("确定");
        }
    }

    // 文件选择
    obj.evtOnChooseFile = function (e) {
        e.preventDefault();
        $fileUpload.click().change(obj.evtOnFileImport);
    }

    // 文件导入
    obj.evtOnFileImport = function (e) {
        try {
            var src = e.target.value;
            var fileName = src.substring(src.lastIndexOf('\\') + 1);
            var fileExt = fileName.replace(/.+\./, "");
            if (fileExt !== "txt") {
                $html.warning("文件格式必须为文本格式");
                return;
            }
            $remoteFileText.val(fileName);
        } catch (e) {
            console.log("evtOnFileImport error");
        }
    }

    // 拖拽事件 拖拽之前触发
    obj.beforeDrag = function (treeId, treeNodes) {
        if (treeNodes.length !== 1) {
            return false;
        }
        var isChild = !treeNodes[0].isParent;
        if (isChild) {
            var dragNode = treeNodes[0];
            $(document).one("mouseup", function (e) {
                $(e.target).trigger(multiRule.ADD_RULE_EVENT, [$(e.target), dragNode]);
            });
            return true;
        } else {
            return false;
        }
    }

    // 拖拽事件 拖拽之后触发
    obj.beforeDrop = function () {
        return false;
    }

    // 获取请求参数
    obj.getParams = function (dataType) {
        var nameSearch = $queryNameText.val(),
            createTypeSearch = $queryCreateTypeSelect.val(),
            userNameSearch = $queryUserNameText.val();
        var catalogSearch = $queryCatalogText.attr("data-id") ? $queryCatalogText.attr("data-id") : "";


        if (dataType === "json") {
            return {
                nameSearch: nameSearch,
                userNameSearch: userNameSearch,
                createTypeSearch: createTypeSearch,
                catalogSearch: catalogSearch,
                start: 0,
                length: 8,
                status: status
            }
        }
        var result = "nameSearch=" + encodeURIComponent(nameSearch) + "&userNameSearch=" + encodeURIComponent(userNameSearch) + "&createTypeSearch=" + createTypeSearch + "&catalogSearch=" + catalogSearch;
        if (!$queryCatalogText.val()) {
            $queryCatalogText.attr("data-id", "");
        }
        return result;
    }

    // 拼接html
    obj.spliceHtml = function (data) {
        if (!data) {
            return '<div class="col-md-12 emptyData">暂无相关数据</div>';
        }
        var html = '', lastDivClass = '';
        for (var i = 0; i < data.length; i++) {
            lastDivClass = '';
            if ((i + 1) % 4 === 0) {
                lastDivClass = 'margin-right-none';
            }

            data[i].executeTime = data[i].executeTime ? encodeURI(data[i].executeTime) : data[i].executeTime;
            data[i].createTime = data[i].createTime ? encodeURI(data[i].createTime) : data[i].createTime;
            data[i].lastUpdateTime = data[i].lastUpdateTime ? encodeURI(data[i].lastUpdateTime) : data[i].lastUpdateTime;
            data[i].lastRefreshTime = data[i].lastRefreshTime ? encodeURI(data[i].lastRefreshTime) : data[i].lastRefreshTime;
            data[i].lastRefreshSuccessTime = data[i].lastRefreshSuccessTime ? encodeURI(data[i].lastRefreshSuccessTime) : data[i].lastRefreshSuccessTime;

            html += '<div class="col-md-3 ' + lastDivClass + ' ">';
            // 名称
            html += "<div class='col-md-12'><a onclick=marketingModel.evtOnAddOrEdit(" + JSON.stringify(data[i]) + ",\"check\")>" + data[i].name + "</a></div>";
            // 创建人
            var userName = (data[i].createUserName && data[i].createUserName.length > 16) ? data[i].createUserName.substring(0, 12) + "..." : data[i].createUserName;
            html += '<div class="col-md-12"><div class="col-md-3">创建人：</div><div class="col-md-9" title="' + data[i].createUserName + '">' + userName + '</div></div>';
            // 创建类型
            html += '<div class="col-md-12"><div class="col-md-3">创建类型：</div><div class="col-md-9">' + obj.enum(data[i].createType) + '</div></div>';

            html += '<div class="col-md-12"><div class="col-md-3">目录：</div><div class="col-md-9">' + data[i].catalogName + '</div></div>';
            // 创建时间
            html += '<div class="col-md-12"><div class="col-md-3">创建时间：</div><div class="col-md-9">' + (decodeURI(data[i].createTime) || "" ) + '</div></div>';
            // 刷新时间
            html += '<div class="col-md-12"><div class="col-md-3">刷新时间：</div><div class="col-md-9">' + (decodeURI(data[i].lastRefreshSuccessTime) || "") + '</div></div>';
            // 人数
            html += '<div class="col-md-12"><div class="col-md-3">人数：</div><div class="col-md-9">' + (data[i].lastRefreshCount || 0) + '</div></div>';
            // 操作
            html += '<div class="col-md-12"><div class="col-md-3">操作：</div><div class="col-md-9">';

            // 创建
            html += utils.authButton("<a class='btn listBtn-create' title='创建营销' onclick='marketingModel.evtOnCreate(" + data[i].id + ",\"" + data[i].name + "\"," + data[i].lastRefreshCount + ")'><i class='fa fa-plus'></i></a>", 'modelToMarketTaskCreate');
            // 下载
            html += utils.authButton('<a class="btn listBtn-download" title="下载模型" onclick="marketingModel.evtOnDownload(' + data[i].id + ')"><i class="fa fa-arrow-down"></i></a>', 'modelDownload');
            if (data[i].createType == 'rule') {
                // 刷新
                html += "<a class='btn listBtn-refresh' title='刷新模型' onclick=marketingModel.evtOnRefresh(" + data[i].id + ",'" + data[i].rule + "')><i class='fa fa-refresh'></i></a>";
            }

            if (data[i].createUser == globalConfigConstant.loginUser.id) {
                // 编辑
                html += utils.authButton("<a class='btn listBtn-info' title='编辑模型' onclick=marketingModel.evtOnAddOrEdit(" + JSON.stringify(data[i]) + ",\"edit\")><i class='fa fa-pencil'></i></a>", "modelEdit");
                // 删除
                html += utils.authButton('<a class="btn listBtn-danger" onclick="marketingModel.evtOnDelete(' + data[i].id + ')" title="删除模型"><i class="fa fa-times"></i></a>', 'modelDelete');
            }
            html += '</div></div>';

            var rule = data[i].rule ? data[i].rule : "";
            html += '<span class="rule" style="display: none;">' + rule + '</span>';
            html += '</div>';
        }

        if (!html) html = '<div class="col-md-12 emptyData">暂无相关数据</div>';
        return html;
    }

    // 获取属性树
    obj.getTree = function () {
        var setting = {
            edit: {
                enable: true,
                showRemoveBtn: false,
                showRenameBtn: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeDrag: obj.beforeDrag,
                beforeDrop: obj.beforeDrop
            },
            view: {
                addHoverDom: addHoverDom,
                removeHoverDom: removeHoverDom
            }
        };

        function addHoverDom(treeId, treeNode) {
            if (treeNode.isParent || treeNode.valueType == 'model') return;
            var aObj = $("#" + treeNode.tId);
            if ($("#getDataRefreshTimeBtn_" + treeNode.id).length > 0) return;
            // var btn = $("#getDataRefreshTimeBtn_" + treeNode.id);

            aObj.on('mouseenter', getRemarks())
            function getRemarks() {
                aObj.find('a').removeAttr('title')
                var remarksItem = remarksList.filter(function(v) {
                    return v.id == treeNode.id
                });
                var remarks = remarksItem[0].remarks;
                if (remarks) {
                    layer.tips(remarks, aObj)
                }
            }
        }

        function removeHoverDom(treeId, treeNode) {
            $("#getDataRefreshTimeBtn_" + treeNode.id).unbind().remove();
        }

        globalRequest.iModel.queryAllPropertiesAndImportModelUnderCategory(true, {}, function (data) {
            if (data && data.length > 0) {
                var ulTree = $("ul.ztree");
                var propertyRoot = {id: '0', pId: '-2', name: "属性", isParent: true, nocheck: true};
                var modelRoot = {id: '-1', pId: '-2', name: "模型", isParent: true, nocheck: true};
                data.push(propertyRoot);
                data.push(modelRoot);

                var properties = [];

                $.each(data, function (index, ele) {
                    if (!(ele.isParent || ele.valueType == 'model')) {
                        properties.push(ele)
                    }
                })
                $.each(properties, function (index, ele) {
                    globalRequest.queryDataRefreshTime(true, {propertyId: ele.id}, function (data) {
                        remarksList.push({
                            id: ele.id,
                            remarks: data.remarks
                        })
                    })
                })

                $("#divProperty>div").find("ul").empty();
                $.fn.zTree.init($("#propertyTree"), setting, data);
            }
        });
    }

    // 获取创建方式:导入创建的参数
    obj.getCreateType = function () {
        var createType = "";
        if ($createTypeSelect.val() === CREATE_TYPE_IMPORT) {
            /*$importTypeRadio.each(function (index, ele) {
             if (ele.checked) {
             createType = ele.value;
             }
             })*/
            createType = CREATE_TYPE_IMPORT;
        } else if ($createTypeSelect.val() === CREATE_TYPE_RULE) {
            createType = CREATE_TYPE_RULE;
            //  $localFileBtn.show();
        }
        return createType;
    }

    // 元素禁用
    obj.attrState = function (type) {
        var readonly = type === CHECK;
        $nameText.attr("readonly", readonly);               //模型名称
        $catlogBtn.attr("disabled", readonly);              //目录分类 按钮
        $roleRadio.attr("disabled", readonly);              //角色可见性
        $roleBtn.attr("disabled", readonly);                //指定角色 按钮
        $smsRadio.attr("disabled", readonly);               //发送短信
        $createTypeSelect.attr("disabled", readonly);       //创建方式
        $localFileBtn.attr("disabled", readonly);           //文件路径 按钮
        $executeTimeText.attr("disabled", readonly);        //读取时间
        $executeTimeCheckBox.attr("disabled", readonly);    //读取时间 是否删除复选框
        $remarksTextArea.attr("readonly", readonly);        //备注
    }

    obj.setParentChecked = function (modelIds, data) {
        if (modelIds && modelIds.length > 0) {
            for (var j = 0; j < data.length; j++) {
                if (data[j].id == modelIds) {
                    data[j]["checked"] = true;
                    data[j]["open"] = true;
                    break;
                }
            }
        }
    }

    obj.enum = function (val) {
        var dic = {
            'add': function () {
                return '新增模型';
            },
            'edit': function () {
                return '修改模型';
            },
            'resubmit': function () {
                return '重新提交';
            },
            'check': function () {
                return '查看模型';
            },
            'localImport': function () {
                return '本地导入';
            },
            /*            'remoteImport': function () {
             return '远程导入';
             },*/
            'rule': function () {
                return '规则创建';
            }
        };

        if (typeof dic[val] !== 'function') {
            throw new Error('enum error');
        }

        return dic[val]();
    }

    return obj;
}()

function onLoadBody(status) {
    //不是使用中的模型，不展现新增按钮和切换按钮
    if (status != 0) {
        $("#btnAdd").hide();
        $("div.row .switchShowBtn").hide();
        $("[data-switch='list']").show();
        $("[data-switch='table']").hide();
    } else {
        $("#btnAdd").show();
        $("div.row .switchShowBtn").show();
    }
    marketingModel.initData(status);
    marketingModel.initEvent();
}
