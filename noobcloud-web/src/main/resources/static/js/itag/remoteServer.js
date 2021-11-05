/**
 * Created by xuan on 2017/1/18.
 */
var remoteServer = function () {
    var getMgr = "queryRemoteServersByPage.view",
        addOrEditUrl = "addOrEditRemoteServer.view",
        delMgr = "deleteRemoteServer.view",
        test = "testConnection.view",
        dataTable, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddorEdit);
    }

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr + "?nameSearch=", type: "POST"},
            columns: [
                {data: "id", title: "序号", visible: false},
                {data: "name", title: "服务器名称", className: "dataTableFirstColumns"},
                {data: "serverIp", title: "主机IP"},
                {data: "connectType", title: "连接方式"},
                {data: "port", title: "端口号"},
                {data: "serverUser", title: "用户名"},
                {data: "createTime", title: "创建时间"},
                {
                    title: "操作", className: "centerColumns",
                    render: function (data, type, row) {
                        var regex = new RegExp("\"", "g");
                        return "<a class='btn btn-info btn-edit' title='编辑' onclick='remoteServer.evtOnAddorEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"remoteServer.evtOnDelete(" + row.id + ")\"><i class='fa fa-trash-o'></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getMgr + "?nameSearch=" + $("#txtQuery").val().trim());
        dataTable.ajax.reload();
    }

    // 新增或修改 弹窗
    obj.evtOnAddorEdit = function (o) {
        //$('#dialogPrimary').find(".cmTableContent").remove();
        $('#dialogPrimary').empty();
        var $all = $(".cmTableContent").clone();
        $('#dialogPrimary').append($all);

        var title = typeof o === "string" ? "修改服务器链接" : "新增服务器链接";
        if (typeof o === "string") { //修改
            var mod = JSON.parse(o);
            $("#dialogPrimary #id").val(mod.id);
            $("#dialogPrimary #name").val(mod.name);
            $("#dialogPrimary #ip").val(mod.serverIp);
            $("#dialogPrimary #connectType").val(mod.connectType);
            $("#dialogPrimary #port").val(mod.port);
            $("#dialogPrimary #user").val(mod.serverUser);
            $("#dialogPrimary #remarks").val(mod.remarks);
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
            content: $('#dialogPrimary'),
            yes: function (index) {
                obj.evtOnSave(index);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });
    }

    // 保存
    obj.evtOnSave = function (index) {
        if (!$("#dialogPrimary").autoVerifyForm()) return;
        var oData = {};
        oData["id"] = $("#dialogPrimary #id").val() == "" ? "0" : $("#dialogPrimary #id").val();
        oData["name"] = $("#dialogPrimary #name").val();
        oData["serverIp"] = $("#dialogPrimary #ip").val();
        oData["connectType"] = $("#dialogPrimary #connectType").val();
        oData["port"] = $("#dialogPrimary #port").val();
        oData["serverUser"] = $("#dialogPrimary #user").val();
        if ($("#dialogPrimary #password").val() != null && $("#dialogPrimary #password").val() != "") {
            oData["password"] = $("#dialogPrimary #password").val();
        }
        oData["remarks"] = $("#dialogPrimary #remarks").val();
        oData["status"] = 0;

        $util.ajaxPost(addOrEditUrl, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
                dataTable.ajax.reload();
                layer.close(index);
            } else {
                $html.warning(res.message);
            }
        }, function () {
            $html.warning('操作失败！');
        });
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

    obj.testConnect = function () {
        var oData = {};
        oData["id"] = $("#dialogPrimary #id").val() == "" ? "0" : $("#dialogPrimary #id").val();
        oData["name"] = $("#dialogPrimary #name").val();
        oData["serverIp"] = $("#dialogPrimary #ip").val();
        oData["connectType"] = $("#dialogPrimary #connectType").val();
        oData["port"] = $("#dialogPrimary #port").val();
        oData["serverUser"] = $("#dialogPrimary #user").val();
        if ($("#dialogPrimary #password").val() != null && $("#dialogPrimary #password").val() != "") {
            oData["password"] = $("#dialogPrimary #password").val();
        }
        oData["remarks"] = $("#dialogPrimary #remarks").val();
        oData["status"] = 0;
        $util.ajaxPost(test, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
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
    remoteServer.initData();
    remoteServer.initEvent();
}