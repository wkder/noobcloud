/**
 * Created by xuan on 2017/1/18. 维度管理
 */
var dimension = function () {
    var getMgr = "queryDimensionsByPage.view",
        getValue = "queryDimensionValueById.view",
        addOrEditValues = "addOrEditDimension.view",
        delMgr = "deleteDimension.view",
        dataTable, dataTable2, count, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    //事件绑定
    obj.initEvent = function () {
        $("#btnAdd").click(obj.evtOnAddorEdit);
    }

    //列表加载
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr, type: "POST"},
            columns: [
                {data: "id", title: "序号", visible: false},
                {data: "name", title: "维度名称", className: "dataTableFirstColumns"},
                {
                    data: "value", title: "关联值",
                    render: function (data, type, row) {
                        var json = eval(data);
                        var com = "<select name='selKey_" + row.id + "' onchange='dimension.changeSelect(1," + row.id + ")'>";
                        for (var i = 0; i < json.length; i++) {
                            com += "<option value='" + json[i].key + "'>" + json[i].key + "</option>";
                        }
                        com += "</select>";
                        return com;
                    }
                },
                {
                    data: "value", title: "显示值",
                    render: function (data, type, row) {
                        var json = eval(data);
                        var com = "<select  name='selValue_" + row.id + "' onchange='dimension.changeSelect(2," + row.id + ")'>"
                        for (var i = 0; i < json.length; i++) {
                            com += "<option value='" + json[i].key + "'>" + json[i].value + "</option>"
                        }
                        com += "</select>"
                        return com;
                    }
                },
                {data: "createTime", title: "创建时间"},
                {
                    title: "操作", className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class='btn btn-info btn-edit' title='新增' onclick=\"dimension.evtOnAddorEdit('" + row.id + "','" + row.name + "')\"><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"dimension.evtOnDelete(" + row.id + ")\"><i class='fa fa-trash-o'></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);

        //绑定list
        var option2 = {
            ele: $('#dataTable2'),
            ajax: {url: getValue + "?id=0", type: "POST"},
            paging: false,
            columns: [
                {
                    data: "key", title: "关联值", className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        return "<input type='text' name='key_" + data + "' value='" + data + "' >";
                    }
                },
                {
                    data: "value", title: "显示值",
                    render: function (data, type, row) {
                        return "<input type='text' name='value_" + row.value + "' value='" + data + "' >";
                    }
                },
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a class='btn btn-info btn-add' title='新增' onclick=\"dimension.evtAddValues(" + row.key + ")\"><i class='fa fa-plus'></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"dimension.evtDeleteValues(" + row.key + ")\"><i class='fa fa-trash-o'></i></a>";
                    }
                }
            ]
        };
        dataTable2 = $plugin.iCompaignTable(option2);

    }

    //列表下来框选中连带值变动
    obj.changeSelect = function (type, id) {
        if (type == 1) {
            var key = $("select[name=selKey_" + id + "]").val();
            $("select[name=selValue_" + id + "]").val(key);
        } else {
            var key = $("select[name=selValue_" + id + "]").val();
            $("select[name=selKey_" + id + "]").val(key);
        }
    }

    // 新增或修改 弹窗
    obj.evtOnAddorEdit = function (id, name) {
        count = 0;//新增编辑行的个数
        var title = typeof id === "string" ? "修改维度管理" : "新增维度管理";
        if (typeof id === "string") { //修改
            dataTable2.ajax.url(getValue + "?id=" + id);
            dataTable2.ajax.reload();
            $("#id").val(id);
            $("#name").val(name);
        } else {
            id = 0;//新增
            count = 1;
            $("#name").val("");
            $("#dataTable2 tbody tr").remove();
            var str = "<tr role=\"row\" class=\"even\"><td class=\"dataTableFirstColumns\"><input type=\"text\" name=\"key_" + count + "\" value=\"\"></td><td><input type=\"text\" name=\"value_" + count + "\" value=\"\">" +
                "</td><td><a class=\"btn btn-info btn-add\" title=\"编辑\"  onclick=\"dimension.evtAddValues(" + (count++) + ")\"><i class=\"fa fa-plus\"></i></a>" +
                "<a class=\"btn btn-danger btn-delete\" title=\"删除\" name=\"value_" + count + "\" onclick=\"dimension.evtDeleteValues(" + (count++) + ")\"><i class=\"fa fa-trash-o\"></i></a></td></tr>";
            //得到所点击行号
            $("#dataTable2 tbody").append(str);
        }

        layer.open({
            type: 1,
            title: title,
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index) {
                obj.evtOnSaveValue(index, id);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });

        $("#dataTable2_info").hide();
    }

    // 删除
    obj.evtOnDelete = function (id) {
        var dspConfirm = $html.confirm('确定删除该数据吗？', function () {
            $util.ajaxPost(delMgr, JSON.stringify({"id": id}), function (res) {
                if (res.state) {
                    $html.success(res.message);
                    dataTable.ajax.reload();
                } else {
                    $html.warning(res.message);
                }
            }, function () {
                $html.warning('操作失败！');
            });
        }, function () {
            layer.close(dspConfirm);
        });
    }

    // 新增一行value
    obj.evtAddValues = function (key) {
        var str = "<tr role=\"row\" class=\"even\"><td class='dataTableFirstColumns'><input type=\"text\" name=\"key_" + count + "\" value=\"\"></td><td><input type=\"text\" name=\"value_" + count + "\" value=\"\">" +
            "</td><td><a class=\"btn btn-info btn-add\" title=\"新增\"  onclick=\"dimension.evtAddValues(" + count + ")\"><i class=\"fa fa-plus\"></i></a>" +
            "<a class=\"btn btn-danger btn-delete\" title=\"删除\" name=\"value_" + count + "\" onclick=\"dimension.evtDeleteValues(" + count + ")\"><i class=\"fa fa-trash-o\"></i></a></td></tr>";
        //得到所点击行号
        var rowIndex = $($($.parseHTML("input[name=key_" + key + "]",document,true))[0]).parent().parent().index();
        //var rowIndex = $("input[name=key_" + key + "]").parent().parent().index();
        $("#dataTable2 tbody tr:eq(" + (rowIndex) + ")").after(str);
        count++;
    }

    // 删除一行value
    obj.evtDeleteValues = function (key) {
        $("input[name=key_" + key + "]").parent().parent().remove();
    }

    // 保存
    obj.evtOnSaveValue = function (index, id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var json = "";
        var result=true;
        $("#dataTable2 tbody tr").each(function () {
            var key = $("td:eq(0) input", this).val();
            var value = $("td:eq(1) input", this).val();
            if(key==""||value==""){
                result=false;
                return false;
            }
            json += ',{"key":"' + key + '","value":"' + value + '"}';
        });
        if(!result){
            $html.warning('关联值或显示值不为空！');
            return;
        }
        var value = "[" + json.substring(1, json.length) + "]";
        var oData = {};
        oData["id"] = id;
        oData["name"] = $("#name").val();
        oData["value"] = value;
        oData["status"] = 0;

        $util.ajaxPost(addOrEditValues, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
                dataTable.ajax.reload();
                dataTable2.ajax.reload();
                layer.close(index);
            } else {
                $html.warning(res.message);
            }
        }, function () {
            $html.warning('操作失败！');
        });
    }

    return obj;
}();

function onLoadBody() {
    dimension.initData();
    dimension.initEvent();
}