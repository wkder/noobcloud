/**
 * Created by hale on 2016/11/21.
 */

var tagManager = function () {
    var getUrl = "queryAllTagsByPage.view";
    var dataTable, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(function(){
            obj.evtOnAddOrEdit()
        });
    }

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?searchContent=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "name", title: "标签名称", width: 100, className: "dataTableFirstColumns"},
                {data: "createUserName", title: "用户名", width: 80},
                {data: "dataTime", title: "数据周期", width: 80},
                {data: "refreshResult", title: "刷新结果", className: "centerColumns", width: 100},
                {data: "lastRefreshTotalCount", title: "导入总数", className: "centerColumns", width: 80},
                {data: "lastRefreshSuccessCount", title: "导入成功数", className: "centerColumns", width: 80},
                {data: "lastRefreshFailCount", title: "导入失败数", className: "centerColumns", width: 80},
                {
                    title: "操作", width: 100,
                    render: function (data, type, row) {
                        delete row.refreshResultReason;
                        var html = "";
                        // 编辑
                        row.createTime = row.createTime ? encodeURI(row.createTime) : row.createTime;
                        row.dataTime = row.dataTime ? encodeURI(row.dataTime) : row.dataTime;
                        row.executeTime = row.executeTime ? encodeURI(row.executeTime) : row.executeTime;
                        row.intervalTime = row.intervalTime ? encodeURI(row.intervalTime) : row.intervalTime;
                        row.lastUpdateTime = row.lastUpdateTime ? encodeURI(row.lastUpdateTime) : row.lastUpdateTime;
                        html += "<a class='btn btn-info btn-edit' title='编辑' onclick=tagManager.evtOnAddOrEdit(" + JSON.stringify(row) + ")><i class='fa fa-pencil-square-o'></i></a>";
                        // 删除
                        html += "<a class='btn btn-danger btn-delete' title='删除' onclick=tagManager.evtOnDelete(" + row.id + ")><i class='fa fa-trash-o'></i></a>";
                        // 导入
                        if (row.needAutoFetch && row.needAutoFetch == 1) {
                            html += "<a class='btn btn-primary btn-import' title='导入' onclick=tagManager.evtOnImport(" + row.id + ")><i class='fa fa-reply'></i></a><form id='formImport_" + row.id + "' class='form' enctype='multipart/form-data' method='POST' style='display: none;'><input type='hidden' value='" + row.id + "' name='id'/> <input class='upload' type='file' name='file'/></form>";
                        }
                        return html;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 下拉列表加载
    obj.selectDbInit = function () {
        globalRequest.iTag.querySchemas(false, {}, function (data) {
            obj.selectCommonInit($("#divTag [name='dbSchema']"), data, null, "<option value='-1'>--请选择--</option>");
        })
    }

    obj.selectTableInit = function () {
        globalRequest.iTag.queryTableAndViews(false, {schema: $("#divTag [name='dbSchema']").val()}, function (data) {
            obj.selectCommonInit($("#divTag [name='tableName']"), data, null, "<option value='-1'>--请选择--</option>");
        })
    }

    obj.selectPhoneFieldInit = function () {
        globalRequest.iTag.queryTableColumnInfo(false, {
            schema: $("#divTag [name='dbSchema']").val(),
            tableName: $("#divTag [name='tableName']").val()
        }, function (data) {
            obj.selectCommonInit($("#divTag [name='phoneColumnName']"), data, ["columnName", "columnName"]);
        })
    }

    obj.selectServerConnectionInit = function () {
        globalRequest.iTag.queryAllRemoteServerNames(false, {}, function (data) {
            obj.selectCommonInit($("#divTag [name='remoteServerId']"), data, ["serverId", "serverName"], "<option value='-1'>--请选择--</option>");
        })
    }

    obj.selectDbChange = function () {
        obj.selectTableInit();
    }

    obj.selectTableChange = function () {
        obj.selectPhoneFieldInit();
        $("#divTag [name='areaColumnName']").val("");
    }

    obj.evtOnAddOrEdit = function (model) {
        $("#divTag").autoEmptyForm();
        $("#divTag [name='tableName']").empty();
        $("#divTag [name='phoneColumnName']").empty();
        $("#divTag [name='needAutoFetch']:checked").empty();
        $("#divTag [name='areaColumnName']").val("");
        $('[data-display="1"]').hide();


/*
        obj.selectPhoneFieldInit();*/
        obj.selectServerConnectionInit();

        // 下拉列表 联动事件
        $("#divTag [name='dbSchema']").unbind("change").change(obj.selectDbChange);
        $("#divTag [name='tableName']").unbind("change").change(obj.selectTableChange);
        // 自动取数 事件
        $("#divTag [name='needAutoFetch']").unbind("click").click(obj.evtOnAutoRead);
        // 筛选字段 按钮事件
        $("#divTag #btnFilterField").unbind("click").click(obj.evtOnFilterField);
        // 服务器连接 按钮事件
        $("#divTag #btnAddConnection").unbind("click").click(obj.evtOnServerConnection);
        // 测试连接 按钮事件
        $("#divTag #btnTestConnection").unbind("click").click(obj.evtOnTestConnection);

        var title = model ? "修改标签" : "新增标签";

        if (model) { //修改
            model.createTime = model.createTime ? decodeURI(model.createTime) : model.createTime;
            model.dataTime = model.dataTime ? decodeURI(model.dataTime) : model.dataTime;
            model.executeTime = model.executeTime ? decodeURI(model.executeTime) : model.executeTime;
            model.intervalTime = model.intervalTime ? decodeURI(model.intervalTime) : model.intervalTime;
            model.lastUpdateTime = model.lastUpdateTime ? decodeURI(model.lastUpdateTime) : model.lastUpdateTime;
            $("#divTag").autoAssignmentForm(model);
            obj.selectDbInit();
            $("#divTag [name='dbSchema']").val(model.dbSchema);
            obj.selectDbChange();
            $("#divTag [name='tableName']").val(model.tableName);
            obj.selectTableChange();
            $("#divTag [name='phoneColumnName']").val(model.phoneColumnName);
            $("#divTag [name='needAutoFetch']:checked").trigger("click");

            if (model.intervalTime && model.intervalTime.indexOf("_") != -1) {
                var intervalType = model.intervalTime.split('_')[1];
                var intervalTime = model.intervalTime.split('_')[0];
                $("#divTag [name='intervalType']").val(intervalType)
                $("#divTag [name='intervalTime']").val(intervalTime);
            }
        } else {
            obj.selectDbInit();
        }

        $plugin.iModal({
            title: title,
            content: $("#divTag"),
            area: '700px'
        }, obj.evtOnSave);
    }

    // 保存标签
    obj.evtOnSave = function (index) {
        if (!$("#divTag").autoVerifyForm())return;
        var oData = $("#divTag").autoSpliceForm();
        if (oData["intervalTime"]) {
            oData["intervalTime"] = oData["intervalTime"] + "_" + oData["intervalType"];
        }
        if (oData["intervalType"] != undefined) {
            delete oData["intervalType"];
        }

        // 自动取数 需要验证下列输入内容
        if ($("#divTag [name='needAutoFetch']:checked").val() == "0") {
            if ($("#divTag [name='remoteServerId']").val() == "-1") {   //服务器连接
                layer.tips("请选择一个服务器连接", $("#divTag [name='remoteServerId']"), {tips: 3});
                return;
            }
            if (!$("#divTag [name='remoteFile']").val()) {   //文件路径
                layer.tips("文件路径不能为空", $("#divTag [name='remoteFile']"), {tips: 3});
                return;
            }
            if (!$("#divTag [name='executeTime']").val()) {   //读取时间
                layer.tips("读取时间不能为空", $("#divTag [name='executeTime']"), {tips: 3});
                return;
            }
            if (!/^[0-9]+$/.test($("#divTag [name='intervalTime']").val())) {   //时间间隔
                layer.tips("时间间隔格式不对", $("#divTag [name='intervalTime']"), {tips: 3});
                return;
            }
        }

        globalRequest.iTag.addOrEditTag(true, oData, function (data) {
            if (!data.state) {
                $html.warning(data.message);
                return;
            }
            $html.success(data.message);
            dataTable.ajax.reload();
            layer.close(index);
        })
    }

    // 删除标签
    obj.evtOnDelete = function (id) {
        if (id <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        var confirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iTag.deleteTag(true, {id: id}, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
            })
        }, function () {
            layer.close(confirm);
        });
    }

    obj.evtOnImport = function (id) {
        $("#formImport_" + id + " .upload").click().change(obj.evtOnFileImport);
    }

    obj.evtOnFileImport = function (e) {
        try {
            var src = e.target.value;
            var fileName = src.substring(src.lastIndexOf('\\') + 1);
            var fileExt = fileName.replace(/.+\./, "");
            if (fileExt !== "txt") {
                $html.warning("文件格式必须为文本格式");
                return;
            }
            $("#divModel [name='remoteFile']").val(fileName);
        } catch (e) {
            console.log("evtOnFileImport error");
        }

        var $importForm = $(e.target).parent();
        var options = {
            type: 'POST',
            url: 'loadTagDataFromImportFile.view',
            dataType: 'json',
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (data) {
                $html.loading(false);
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
            }
        };
        $importForm.ajaxSubmit(options);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getUrl + "?searchContent=" + $("#txtQuery").val());
        dataTable.ajax.reload();
    }

    // 自动取数
    obj.evtOnAutoRead = function (e) {
        try {
            var value = e.target.value;
            var element = $('[data-display="1"]');
            value == "0" ? element.show() : value == "1" ? element.hide() : element.hide();
        } catch (e) {
            console.log("evtOnAutoRead error");
        }
    }

    // 弹出筛选字段
    obj.evtOnFilterField = function () {
        $("#divFiled").autoEmptyForm();
        globalRequest.iTag.queryTableColumnInfo(false, {
                schema: $("#divTag [name='dbSchema']").val(),
                tableName: $("#divTag [name='tableName']").val()
            },
            function (data) {
                $("#divFilterField").empty();

                var html = "";
                var checkedAreaColumnName = $("#divTag [name='areaColumnName']").val();
                var checkedColumnArray = checkedAreaColumnName ? checkedAreaColumnName.split(",") : []

                for (var i = 0; i < data.length; i++) {
                    var activeClass = "", lastDivClass = "";
                    if ((i + 1) % 3 == 0) {
                        lastDivClass = 'margin-right-none';
                    }
                    if (checkedColumnArray.indexOf(data[i].columnName) != -1) {
                        activeClass = "div-filter-field-active";
                    }
                    html += "<div class='col-md-4 div-filter-field " + activeClass + " " + lastDivClass + "' onclick='tagManager.evtOnSpanChooseFilterFieldClass(this)'>";
                    html += "<span data-name='" + data[i].columnName + "' title='" + data[i].columnName + "'>";
                    html += "" + data[i].columnName + "";
                    html += "</span></div>";
                }
                $("#divFilterField").append(html);
            })

        $plugin.iModal({
            title: '选择筛选字段',
            content: $("#divField"),
            area: '700px'
        }, obj.evtOnChooseFilterField);
    }

    // 选择筛选字段-点击DIV事件
    obj.evtOnSpanChooseFilterFieldClass = function (e) {
        if (!$(e).hasClass("div-filter-field-active")) {
            $(e).addClass("div-filter-field-active");
        } else {
            $(e).removeClass("div-filter-field-active");
        }
    }

    // 选择筛选字段
    obj.evtOnChooseFilterField = function (index) {
        var $eleArray = $("#divFilterField .div-filter-field-active").children("span");
        var checkedValues = "";
        for (var i = 0; i < $eleArray.length; i++) {
            checkedValues += $($eleArray[i]).html() + ",";
        }
        $("#divTag [name='areaColumnName']").val(checkedValues.substr(0, checkedValues.length - 1));
        layer.close(index);
    }

    // 服务器连接
    obj.evtOnServerConnection = function () {
        $("#divRemoteServer").autoEmptyForm();

        $("#btnTestConnection").unbind("click").click(obj.evtOnTestConnection);

        $plugin.iModal({
            title: '新增远程服务器',
            content: $("#divRemoteServer"),
            area: '700px'
        }, obj.evtOnSaveRemoteServer);
    }

    // 保存远程服务器
    obj.evtOnSaveRemoteServer = function (index) {
        var oData = $("#divRemoteServer").autoSpliceForm();
        globalRequest.iTag.addOrEditRemoteServer(true, oData, function (data) {
            if (!data.state) {
                $html.warning(data.message);
                return;
            }
            // 重新加载下拉列表
            obj.selectServerConnectionInit();
            layer.close(index);
        })
    }

    // 测试连接
    obj.evtOnTestConnection = function () {
        var oData = $("#divRemoteServer").autoSpliceForm();
        globalRequest.iTag.testConnection(true, oData, function (data) {
            if (!data.state) {
                $html.warning(data.message);
                return;
            }
            $html.success(data.message);
        })
    }

    // 加载下拉列表
    obj.selectCommonInit = function ($element, data, columnValues, defaultValue) {
        $element.empty();
        var html = defaultValue ? defaultValue : "";
        for (var i = 0; i < data.length; i++) {
            if (columnValues) {
                html += "<option value='" + Object.getOwnPropertyDescriptor(data[i], columnValues[0]).value + "'>" + Object.getOwnPropertyDescriptor(data[i], columnValues[1]).value + "</option>";
            } else {
                html += "<option value='" + data[i] + "'>" + data[i] + "</option>";
            }
        }
        $element.append(html);
    }

    return obj;
}()

function onLoadBody() {
    tagManager.initData();
    tagManager.initEvent();
}
