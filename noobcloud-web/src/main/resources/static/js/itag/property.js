/**
 * Created by hale on 2017/1/18.
 */

var property = function () {
    var getUrl = "queryPropertiesByPage.view",
        getPropertyUrl = "queryColumnInfoAndDimension.view",
        dataTable = {}, propertyDataTable = {}, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
        obj.selectTableInit($("#selTable")); // 加载下拉列表
        obj.propertyDataTableInit(); // 加载新增弹窗table
    }

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddOrEdit);
    }

    obj.dataTableInit = function () {
        var name = $("#txtProperty").val(),
            table = $("#txtTable").val(),
            column = $("#txtColumn").val(),
            creater = $("#txtCreater").val(),
            paras = "nameSearch=" + name + "&tableNameSearch=" + table + "&columnNameSearch=" + column + "&userNameSearch=" + creater;

        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?" + paras, type: "POST"},
            columns: [
                {data: "name", title: "属性名称", width: 80, className: "dataTableFirstColumns"},
                {data: "catalogName", title: "目录类别", width: 80},
                {
                    data: "tableName", title: "所属表名", width: 120,
                    render: function (data, type, row) {
                        return "<span title='" + row.tableName + "' style='word-break: break-all;display: -webkit-box;overflow: hidden;-webkit-line-clamp: 1;-webkit-box-orient: vertical;'>" + row.tableName + "</span>";
                    }
                },
                {data: "columnName", title: "所属列名", width: 80},
                {data: "valueType", title: "数据类型", width: 80},
                {data: "dimensionName", title: "维度", width: 120},
                {data: "createUserName", title: "创建人", width: 80},
                {data: "createTime", title: "创建时间", width: 120},
                {
                    title: "操作", width: 120, className: "centerColumns",
                    render: function (data, type, row) {
                        var regex = new RegExp("\"", "g");
                        return "<a class='btn btn-info btn-edit' title='编辑' onclick='property.evtOnAddOrEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class='fa fa-pencil-square-o'></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"property.evtOnDelete(" + row.id + ")\"><i class='fa fa-trash-o'></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    obj.propertyDataTableInit = function () {
        var params = obj.getSelectTableParams($("#selTable"));
        var option = {
            ele: $('#propertyDataTable'),
            ajax: {url: getPropertyUrl + "?" + params, type: "POST"},
            headerCheckbox: true,
            serverSide: false,
            columns: [
                {
                    render: function (data, type, row) {
                        var id = "propertyDataTable_" + row.id;
                        return "<input id='" + id + "'  type='checkbox'/>";
                    }
                },
                {
                    data: "columnName", title: "列名",
                    render: function (data, type, row) {
                        return "<span id='columnName_" + row.id + "'>" + row.columnName + "</span>";
                    }
                },
                {
                    data: "dataType", title: "数据类型",
                    render: function (data, type, row) {
                        return "<span id='dataType_" + row.id + "'>" + row.dataType + "</span>";
                    }
                },
                {
                    title: "使用名称",
                    render: function (data, type, row) {
                        return "<input type='text' id='name_" + row.id + "' class='form-control' data-required='true' maxlength='20' placeholder='使用名称'/>";
                    }
                },
                {
                    title: "目录类别",
                    render: function (data, type, row) {
                        return "<input id='catalogId_" + row.id + "' type='hidden' value=''/><input type='text' id='catalogName_" + row.id + "' class='form-control' data-required='true' placeholder='目录类别' onclick='property.evtOnShowCatalogTree(" + row.id + "," + '"add"' + ")' readonly='readonly' style='background-color: #fff;cursor: pointer;'/>";
                    }
                },
                {
                    title: "维度",
                    render: function (data, type, row) {
                        var selectObj = row.select;
                        var html = "<select id='dimensionId_" + row.id + "' class='form-control'><option value='-1'>无</option>";
                        for (var i = 0; i < selectObj.length; i++) {
                            html += "<option value='" + selectObj[i].id + "'>" + selectObj[i].name + "</option>"
                        }
                        html += "</select>";
                        return html;
                    }
                },
                {
                    title: "备注",
                    render: function (data, type, row) {
                        return "<input id='remarks_" + row.id + "' type='text' class='form-control' maxlength='50' placeholder='备注'/>";
                    }
                }
            ]
        };
        propertyDataTable = $plugin.iCompaignTable(option);
    }

    // 下拉列表加载
    obj.selectTableInit = function ($element) {
        globalRequest.iTag.queryAllTagSchemaAndNames(false, {}, function (data) {
            for (var i = 0; i < data.length; i++) {
                $element.empty();
                var html = "";
                for (var i = 0; i < data.length; i++) {
                    var selectValue = data[i].schemaName + "." + data[i].tableName;
                    html += "<option value='" + selectValue + "'>" + selectValue + "</option>"
                }
                $element.append(html);
            }
        })
    }

    obj.selectEditFieldInit = function () {
        var oData = obj.getSelectTableParams($("#divEditProperty [name='tableName']"), "json");
        globalRequest.iTag.queryTableColumnInfo(false, oData, function (data) {
            $("#divEditProperty [name='columnName']").empty();
            var html = "";
            for (var i = 0; i < data.length; i++) {
                html += "<option value='" + data[i].columnName + "'>" + data[i].columnName + "</option>"
            }
            $("#divEditProperty [name='columnName']").append(html);
        })
    }

    obj.selectEditDimensionInit = function () {
        globalRequest.iTag.queryAllDimensionIdAndNames(false, {}, function (data) {
            $("#divEditProperty [name='dimensionId']").empty();
            var html = "<option value='-1'>无</option>";
            for (var i = 0; i < data.length; i++) {
                html += "<option value='" + data[i].id + "'>" + data[i].name + "</option>"
            }
            $("#divEditProperty [name='dimensionId']").append(html);
        })
    }

    // 下拉列表联动事件
    obj.selectTableChange = function () {
        var params = obj.getSelectTableParams($("#selTable"));
        propertyDataTable.ajax.url(getPropertyUrl + "?" + params);
        propertyDataTable.ajax.reload();
    }

    obj.selectEditTableChange = function () {
        obj.selectEditFieldInit();
    }

    // 查询
    obj.evtOnQuery = function () {
        var name = $("#txtProperty").val(),
            table = $("#txtTable").val(),
            column = $("#txtColumn").val(),
            creater = $("#txtCreater").val(),
            params = "nameSearch=" + name + "&tableNameSearch=" + table + "&columnNameSearch=" + column + "&userNameSearch=" + creater;
        dataTable.ajax.url(getUrl + "?" + params);
        dataTable.ajax.reload();
    }

    // 新增或修改 弹窗
    obj.evtOnAddOrEdit = function (o) {
        $("#propertyDataTable").autoEmptyForm();
        obj.emptyProperty();
        $("#divEditProperty [name='catalogName']").attr("data-catalogId", "");

        var title = "新增元属性", area = ['910px', '600px'], content = $("#divProperty"), type = 1;
        if (typeof o === "string") {  //修改
            title = "修改元属性", area = ['700px', '650px'], content = $("#divEditProperty"), type = 2;
            var model = JSON.parse(o);
            // 下拉列表加载
            obj.selectTableInit($("#divEditProperty [name='tableName']"));
            obj.selectEditFieldInit();
            obj.selectEditDimensionInit();
            $("#divEditProperty [name='tableName']").unbind("change").change(obj.selectEditTableChange);
            $("#btnChooseCatalog").unbind("click").click(function () {
                obj.evtOnShowCatalogTree(model.catalogId, "edit");
            });

            $("#divEditProperty").autoAssignmentForm(model);
            obj.selectEditTableChange();
            $("#divEditProperty [name='columnName']").val(model.columnName);
            $("#divEditProperty [name='catalogName']").attr("data-catalogId", model.catalogId);
        } else {
            // 下拉列表 联动事件
            $("#selTable").unbind("change").change(obj.selectTableChange);
            // 表格checkbox 勾选事件
            $("#propertyDataTable [type='checkbox']").unbind("click").click(obj.evtOnPropertyDataTableCheck);
        }
        
        $plugin.iModal({
            title: title,
            content: content,
            area: area
        }, obj.evtOnSave);
        //  新增或修改标志
        $(".layui-layer-btn0").attr("data-operation", type);
    }

    // 新增保存
    obj.evtOnSave = function (index) {
        var operation = $(".layui-layer-btn0").attr("data-operation");

        if (operation == "2") {   //修改
            var oData = $("#divEditProperty").autoSpliceForm();
            globalRequest.iTag.updateProperty(true, oData, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
                layer.close(index);
            });
        } else {    //新增
            var dataArray = [];
            var $checkedElements = $("#propertyDataTable [type='checkbox']:checked");
            for (var i = 0; i < $checkedElements.length; i++) {
                if ($checkedElements[i].checked) {
                    if ($checkedElements[i].id.indexOf("chkAll") == -1) {
                        var rowId = $($checkedElements[i]).attr("id").split('_')[1];
                        var $elements = $($checkedElements[i]).parent("td").siblings().children("[data-required='true']");
                        if (!$($elements[0]).val() || !$($elements[1]).val()) {
                            $html.warning("请把本页面勾选属性的必填项填写完整");
                            return;
                        }

                        var oData = {};
                        oData["columnName"] = $("#columnName_" + rowId + "").text();
                        oData["valueType"] = $("#dataType_" + rowId + "").text();
                        oData["name"] = $("#name_" + rowId + "").val();
                        oData["catalogId"] = $("#catalogId_" + rowId + "").val();
                        oData["catalogName"] = $("#catalogName_" + rowId + "").val();
                        oData["dimensionId"] = $("#dimensionId_" + rowId + "").val();
                        oData["remarks"] = $("#remarks_" + rowId + "").val();
                        oData["tableName"] = $("#selTable").val();

                        dataArray.push(oData);
                    }
                }
            }

            globalRequest.iTag.createProperties(true, dataArray, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
                layer.close(index);
            });
        }
    }

    // 删除
    obj.evtOnDelete = function (id) {
        if (id <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        var dspConfirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iTag.deleteProperty(true, {"id": id}, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
            });
        }, function () {
            layer.close(dspConfirm);
        });
    }

    // 表格checkbox勾选
    obj.evtOnPropertyDataTableCheck = function () {
        var $checkBox = $("#propertyDataTable [type='checkbox']");
        if ($(this).prop("id").indexOf('chkAll') != -1) { //全选
            $checkBox.prop("checked", $(this).prop("checked"));
        } else {
            $(this).prop("checked", $(this).prop("checked"));
            var checkboxLength = $checkBox.length;
            var checkedLength = $("#propertyDataTable [type='checkbox']:checked").length;
            if ((checkboxLength - 1) === checkedLength) {
                $("#propertyDataTable_chkAll").prop("checked", $(this).prop("checked"));
            }
        }
    }

    // 显示 类别
    obj.evtOnShowCatalogTree = function (id, type) {
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
        globalRequest.iModel.queryAllCategoryByBody(true, {type: 1}, function (data) {
            var ids = "";
            if (type === "add") {
                ids = $("#catalogId_" + id).val();
            } else if (type === "edit") {
                ids = $("#divEditProperty [name='catalogId']").val();
            }
            var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
            obj.setParentChecked(ids, data);
            result = data;
            $("#dialogTreePrimary").find("ul").empty();
            $.fn.zTree.init($("#treePrimary"), setting, result);

            layer.open({
                type: 1,
                title: "选择类别",
                closeBtn: 0,
                move: false,
                shadeClose: true,
                area: ['600px', '600px'],
                offset: '60px',
                shift: 6,
                btn: ['确定', '取消'],
                content: $('#dialogTreePrimary'),
                yes: function (index) {
                    obj.evtOnCatalogTree(id, type, index);
                },
                cancel: function (index) {
                    layer.close(index);
                }
            });
        });
    }

    obj.evtOnCatalogTree = function (id, type, index) {
        var zTree = $.fn.zTree.getZTreeObj("treePrimary");
        var checkedNodes = zTree.getCheckedNodes(true);
        if (checkedNodes.length > 0) {
            if (type === "add") {
                $("#catalogId_" + id).val(checkedNodes[0].id);
                $("#catalogName_" + id).val(checkedNodes[0].name);
            } else {
                $("#divEditProperty [name='catalogName']").val(checkedNodes[0].name);
                $("#divEditProperty [name='catalogId']").val(checkedNodes[0].id);
            }
            layer.close(index);
        } else {
            $html.warning("没有选择任何目录");
        }
    }

    // 获取请求参数
    obj.getSelectTableParams = function (element, dataType) {
        try {
            var selectTableValue = element.val();
            var schemaName = selectTableValue.split('.')[0];
            var tableName = selectTableValue.split('.')[1];
            if (dataType == "json") {
                return {schema: schemaName, tableName: tableName};
            }
            return "schema=" + schemaName + "&tableName=" + tableName;
        }
        catch (e) {
            return "schema=&tableName=";
        }
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

    obj.emptyProperty = function () {
        var $elements = $("#divProperty input");
        $elements.each(function (index, ele) {
            if (ele.type == "checkbox") {
                ele.checked = false;
            } else {
                $(ele).val("");
            }
        })

        var $select = $("#propertyDataTable select");
        $select.each(function (index, ele) {
            if (ele.type == "select-one") {
                $(ele).val(-1);
            }
        })
    }

    return obj;
}()

function onLoadBody() {
    property.initData();
    property.initEvent();
}
