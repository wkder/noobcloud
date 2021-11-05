/**
 * Created by xuan on 2016/12/22.
 */
var pushconfig = function () {
    var dataTable,
        getPushConfigListUrl = "getPushConfigList.view",
        savePushConfigUrl = "addOrEditPushConfig.view",
        deletePushConfigUrl = "deletePushConfig.view",
        getSelectTypeUrl = "getSelectType.view",
        obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnRefresh").click(obj.evtOnRefresh);
        $("#btnAdd").click(obj.evtOnShowPushConfig);
    }

    //绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getPushConfigListUrl, type: "POST"},
            columns: [
                {data: "id", title: "序号", className: "dataTableFirstColumns"},
                {data: "type", title: "类型", visible: false},
                {
                    data: "type", title: "类型",
                    render: function (data, type, row) {
                        if (row.type == "1") {
                            return "流量包";
                        } else {
                            return "应用";
                        }
                    }
                },
                {data: "tId", title: "类型编号"},
                {data: "name", title: "类型名称"},
                {data: "sort", title: "排序", className: "centerColumns"},
                {
                    data: "isUsed", title: "启用", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.isUsed == 0) {
                            return "<i class='fa fa-times fa-2x' style='color: #F13E38;'></i>";
                        } else {
                            return "<i class='fa fa-check fa-2x' style='color: limegreen;'></i>";
                        }
                    }
                },
                {
                    title: "操作", className: "centerColumns",
                    render: function (data, type, row) {
                        var regex = new RegExp("\"", "g");
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='pushconfig.evtOnShowPushConfig(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"pushconfig.evtOnDelete(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

// 显示推送配置
    obj.evtOnShowPushConfig = function (o) {
        var title = "新增";
        $util.ajaxPost(getSelectTypeUrl, {}, function (data) {
            if (data.state) {
                $("#selType").html(data.message);
            }
        }, function () {
        });
        if (o && typeof (o) == "string") {
            o = JSON.parse(o);
            if (o.id > 0) { //编辑
                title = "编辑";
                if (o.name && o.name.trim() != "") {   //类型名称
                    $("#txtName").val(o.name);
                }
                if (o.type >= 0) {  //类型
                    $("#selType").val(o.type);
                }
                if (o.tId >= 0) {  //类型序号
                    $("#txtTId").val(o.tId);
                }
                if (o.sort >= 0) {  //排序
                    $("#txtSort").val(o.sort);
                }
                if (o.isUsed >= 0) {  //是否启用
                    $("#selUsed").val(o.isUsed);
                }
                $("#btnSave").attr("data-id", o.id);
            }
        } else {    //新增
            obj.reset();
            o.id = 0;
            $("#btnSave").attr("data-id", 0);
        }

        layer.open({
            type: 1,
            title: title + '推送类型',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index, layero) {
                obj.evtOnSave(index, o.id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

// 保存数据
    obj.evtOnSave = function (index, id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var type = $("#selType").val();
        var tId = $("#txtTId").val();
        var name = $("#txtName").val();
        var sort = $("#txtSort").val();

        if (!$("#cmTableContent").cmValidate()) {
            return;
        }

        //var id = $("#btnSave").attr("data-id");

        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["type"] = $.trim($("#selType").val());
            oData["tId"] = $.trim($("#txtTId").val());
            oData["name"] = $.trim($("#txtName").val());
            oData["sort"] = $.trim($("#txtSort").val());
            oData["isUsed"] = $.trim($("#selUsed").val());

            $util.ajaxPost(savePushConfigUrl, JSON.stringify(oData), function (data) {
                if (data.state) {
                    $html.success(data.message);
                    layer.close(index);
                    dataTable.ajax.reload();
                } else {
                    $html.warning(data.message);
                }
            }, function () {
                $html.warning("保存失败");
            });
        }, 200);
    }

// 删除推送配置
    obj.evtOnDelete = function (id) {
        var closeIndex = $html.confirm('您确定删除该数据吗?', function () {
                if (id <= 0) {
                    layer.close();
                    return;
                }
                $util.ajaxPost(deletePushConfigUrl, JSON.stringify({id: id}), function (data) {
                    if (data.state) {
                        $html.success(data.message);
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(data.message);
                    }
                }, function () {
                    $html.warning("删除失败!");
                });
            },
            function () {
                layer.close(closeIndex);
            });
    }

// 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getPushConfigListUrl + "?name=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

// 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getPushConfigListUrl);
        dataTable.ajax.reload();
    }

// 重置 内容
    obj.reset = function () {
        $("#btnSave").attr("data-taskid", 0);  //任务名重置并将其 data-taskid 重置为0
        $("#txtTId").val("");
        $("#txtName").val("");
        $("#txtSort").val("");
    }
    return obj;
}()


function onLoadBody() {

    pushconfig.initData();
    pushconfig.initEvent();

}

