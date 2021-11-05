var additionalcondition = function () {
    var getUrl = "getAdditionalData.view",
        saveUrl = "addOrEditionAdditional.view",
        deleteUrl = "deleteAdditional.view",
        selectUrl = "getAdditionalType.view";//获取下拉数据
    var layerIndex = 0, dspConfirm = 0;
    var dataTable;
    var obj = {};


    obj.initData = function () {
        $("#popupAddOrEdit input").attr("maxLength","15");//设置新增或修改时所有文本框的最大输入字符数
        obj.dataTableInit();
        //obj.cmTableInit();
    };

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnRefresh").click(obj.evtOnRefresh);
        $("#btnAdd").click(obj.evtOnShow);
    };

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?name=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 60, className: "dataTableFirstColumns"},
                {data: "name", title: "内部名称", width: 100},
                {data: "description", title: "外部名称", width: 120},
                {
                    data: "type", title: "变量类型", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return row.type == 1 ? "int" : "String";
                    }
                },
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a id='\"sp" + row.Id + "\"' class=\"btn btn-info btn-edit\" title='编辑' onclick=\"additionalcondition.evtOnShow('" + row.id + "','" + row.name + "','" + row.description + "','" + row.type + "')\"><i class=\"fa fa-pencil-square-o\"></i></a><a id='btndel' class='btn btn-danger btn-delete' title='删除' onclick='additionalcondition.evtOnDelete(\"" + row.id + "\")'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 弹窗表格初始化
    //obj.cmTableInit = function () {
    //    $('#popupAddOrEdit').cmTable({
    //        columns: [
    //            {
    //                id: "txtName", desc: "内部名称",
    //                validate: {expression: "NotNull"},
    //                alert: {className: "help-block alert alert-warning", text: "内部名称不能为空"}
    //            },
    //            {
    //                id: "txtDescription", desc: "外部名称",
    //                validate: {expression: "NotNull"},
    //                alert: {className: "help-block alert alert-warning", text: "外部名称不能为空"}
    //            },
    //            {id: "selType", type: "select", desc: "变量类型", client: false, url: selectUrl}
    //        ]
    //        //toolbtns: [
    //        //    {id: "btnSave", type: "confirm", text: "确定"},
    //        //    {id: "btnCancel", type: "cancel", text: "取消"}
    //        //]
    //    });
    //};

    // 用户查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getUrl + "?name=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    };

    // 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getUrl);
        dataTable.ajax.reload();
    };


    obj.evtOnSave = function (index, id) {
        //var id = $("#btnSave").attr("data-id");
        var name = $("#txtName").val();
        var desc = $("#txtDescription").val();
        var type = $("#selType").val();

        //if (!$("#popupAddOrEdit").cmValidate()) {
        //    return;
        //}
        if(!$("#popupAddOrEdit").autoVerifyForm())return;

        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["name"] = $.trim(name);
            oData["desc"] = $.trim(desc);
            oData["type"] = $.trim(type);

            $util.ajaxPost(saveUrl, JSON.stringify(oData), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        dataTable.ajax.reload();
                        layer.close(index);
                        obj.resetBox();
                    } else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning("操作失败！");
                });
        }, 200);
    };

    // 取消
    obj.evtOnCancel = function () {
        layer.close(layerIndex);
    };

    // 编辑、新增用户
    obj.evtOnShow = function (id, name, desc, type) {
        var title = "新增";
        if (id > 0) {   //编辑
            title = "编辑";
            $("#btnSave").attr("data-id", id);
            $("#txtName").val(name);
            $("#txtDescription").val(desc);
            $("#selType").val(type);
        } else {        //新增
            id = 0;
            $("#btnSave").attr("data-id", 0);
            $("#txtName").val("");
            $("#txtDescription").val("");
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
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnSave(index, id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    obj.evtOnDelete = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(deleteUrl, JSON.stringify({id: id}), function (res) {
                        if (res.state) {
                            $html.success(res.message);
                            dataTable.ajax.reload();
                        } else {
                            $html.warning(res.message);
                        }
                    },
                    function () {
                        $html.warning("删除失败！");
                    });
            },
            function () {
                layer.close(dspConfirm);
            });
    };

    // 重置内容
    obj.resetBox = function () {
        $("#txtName").val("");
        $("#txtDescription").val("");
    };
    return obj;
}();

function onLoadBody() {
    additionalcondition.initData();
    additionalcondition.initEvent();
}
