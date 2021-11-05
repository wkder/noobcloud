/**
 * Created by xuan on 2017/4/24.
 */
var syncConfig = function () {
    var getMgr = "querySyncConfig.view",
        addOrEditUrl = "addOrEditSync.view",
        delMgr = "deleteSync.view",
        syncUrl="syncConfig.view",
        querySyncById="querySyncById.view",
        dataTable, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }
    //事件绑定
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddorEdit);
        $("#btnSync").click(obj.evtOnSync);
    }
    //列表加载

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr, type: "POST"},
            columns: [
                {data: "id", title: "序号", visible: false},
                {data: "mysqlDbName", title: "mysql库", className: "dataTableFirstColumns"},
                {data: "mysqlTableName", title: "mysql目标表"},
                {data: "gpDbName", title: "gp目标库"},
                {data: "frequency", title: "同步的频次",width:80},
                {data: "gpTableName", title: "gp目标表"},
                {
                    data: "syncType", title: "同步方式",width:80,
                    render: function (data, type, row) {
                        if (data== "0") {
                            return "全量";
                        }else{
                            return "增量";
                        }
                    }
                },
                {data: "ftpName", title: "FTP文件生成名称"},
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='syncConfig.evtOnAddorEdit(\"" + row.id + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"syncConfig.evtOnDelete(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    // 查询


    obj.evtOnQuery = function () {
        dataTable.ajax.url(getMgr + "?queryType="+encodeURIComponent($("#queryType").val()));
        dataTable.ajax.reload();
    }
    // 新增或修改 弹窗
    obj.evtOnAddorEdit = function (id) {
        var title = "新增";
        if(id>0){
            $util.ajaxPost(querySyncById, JSON.stringify({id: id}), function (data) {
                if (data.total == 1) {
                    title = "编辑";
                    $("#mysqlDbName").val(data.data[0].mysqlDbName);
                    $("#mysqlTableName").val(data.data[0].mysqlTableName);
                    $("#gpDbName").val(data.data[0].gpDbName);
                    $("#frequency").val(data.data[0].frequency);
                    $("#gpTableName").val(data.data[0].gpTableName);
                    $("#selType").val(data.data[0].syncType);
                    $("#syncField").val(data.data[0].syncField);
                    $("#syncFieldStr").val(data.data[0].syncFieldStr);
                    $("#ftpName").val(data.data[0].ftpName);
                    $("#delimit").val(data.data[0].delimit);
                }

            }, function () {
                $html.warning('操作失败！');
            });
        }else{
            $("#mysqlDbName").val("");
            $("#mysqlTableName").val("");
            $("#gpDbName").val("");
            $("#frequency").val("");
            $("#gpTableName").val("");
            $("#selType").val(0);
            $("#syncField").val("");
            $("#syncFieldStr").val("");
            $("#ftpName").val("");
            $("#delimit").val("");
            id=0;
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
            yes: function (index, layero) {
                obj.evtOnSave(index, id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //同步
    obj.evtOnSync=function(){
        $util.ajaxPost(syncUrl,{}, function (res) {
            if (res.state) {
                $html.success(res.message);
            } else {
                $html.warning(res.message);
            }
        }, function () {
            $html.warning('操作失败！');
        });
    }
    //保存
    obj.evtOnSave = function (index,id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
            var oData = {};

        var syncField=$("#syncField").val();
        var regexp = /^[_a-zA-Z0-9]+$/;
        var valid = regexp.test(syncField);
        //增量字段下划线、英文、数字组合
        if(syncField!=""&&!valid){//
            $("#syncField").focus();
            layer.tips("增量字段格式不对!", $("#cmTableContent  [name='syncField']"), {tips: 3});
            return;
        }


        var syncFieldStr= $("#syncFieldStr").val();
        ////增量值不为空
        //if(syncFieldStr==null||syncFieldStr==""){//
        //    $("#syncFieldStr").focus();
        //    layer.tips("增量值要不为空!", $("#cmTableContent  [name='syncFieldStr']"), {tips: 3});
        //    return;
        //}


        oData["mysqlDbName"] = $("#mysqlDbName").val();
        oData["mysqlTableName"] = $("#mysqlTableName").val();
        oData["gpDbName"] = $("#gpDbName").val();
        oData["frequency"] = $("#frequency").val();
        oData["gpTableName"] = $("#gpTableName").val();
        oData["selType"] = $("#selType").val();
        oData["syncField"] =syncField ;
        oData["syncFieldStr"] =syncFieldStr;
        oData["ftpName"] = $("#ftpName").val();
        oData["delimit"] = $("#delimit").val();
        oData["id"]=id;
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
    return obj;
}();

function onLoadBody() {
    syncConfig.initData();
    syncConfig.initEvent();
}