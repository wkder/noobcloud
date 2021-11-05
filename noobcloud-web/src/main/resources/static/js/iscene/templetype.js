/**
 * Created by xuan on 2016/12/22.
 */
var templeType = function () {
    var dataTable,
        dspConfirm = 0, //删除提示框
        getTempleTypeUrl = "getTempleList.view",
        saveTempleTypeUrl = "addOrEditTempleType.view",
        getDeleteTempleTypeUrl = "deleteTempleType.view",
        getSelectMultilUrl = "getMultilType.view",
        obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnRefresh").click(obj.evtOnRefresh);
        $("#btnAdd").click(obj.evtOnShowTempDatail);
    }

    //绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getTempleTypeUrl + "?name=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 60, className: "dataTableFirstColumns"},
                {data: "typeName", title: "模型名称", width: 100},
                {data: "typeJS", title: "模型脚本", width: 120},
                {
                    data: "multiPicture", title: "多图模式", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.multiPicture == "1") { //多图
                            return "<i class='fa fa-check fa-2x' style='color: limegreen;'></i>";
                        } else {
                            return "<i class='fa fa-times fa-2x' style='color: #F13E38;'></i>";
                        }
                    }
                },
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        //<a id='btndel' class='btn btn-danger btn-delete' title='删除' onclick='templeType.evtOnDeleteTemp(\"" + row.id + "\")'><i class=\"fa fa-trash-o\"></i></a>
                        return "<a id='\"sp" + row.id + "\"' class=\"btn btn-info btn-edit\" title='编辑' onclick=\"templeType.evtOnShowTempDatail('" + row.id + "','" + row.typeName + "','" + row.typeJS + "','" + row.multiPicture + "')\"><i class=\"fa fa-pencil-square-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }


// 用户查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getTempleTypeUrl + "?name=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

// 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getTempleTypeUrl);
        dataTable.ajax.reload();
    }

// 编辑、新增用户
    obj.evtOnShowTempDatail = function (id, typename, typejs, multipicture) {
        var title = "新增";
        if (id > 0) {   //编辑
            title = "编辑";
            $("#btnSave").attr("data-id", id);
            $("#txtName").val(typename);
            $("#txtJs").val(typejs);
            $("#selMulti").val(multipicture);
        } else {        //新增
            id = 0;
            $("#btnSave").attr("data-id", 0);
            $("#txtName").val("");
            $("#txtJs").val("");
        }

        //打开编辑框
        layer.open({
            type: 1,
            title: title + '模型',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index, layero) {
                obj.evtOnSaveUserData(index, id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    // 删除用户
    obj.evtOnDeleteTemp = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(getDeleteTempleTypeUrl, JSON.stringify({id: id}), function (data) {
                        if (data.state) {
                            $html.success(data.message);
                            dataTable.ajax.reload();
                        } else {
                            $html.warning(data.message);
                        }
                    },
                    function () {
                        $html.warning("删除失败！");
                    })
            },
            function () {
                layer.close(dspConfirm);
            });
    }

// 保存用户
    obj.evtOnSaveUserData = function (index, id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var typeName = $("#txtName").val();
        var typejs = $("#txtJs").val();
        var multipicture = $("#selMulti").val();

        if (!$("#cmTableContent").cmValidate()) {
            return;
        }

        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["typeName"] = $.trim(typeName); //模型名称
            oData["typeJS"] = $.trim(typejs);//Js文件名称
            oData["multiPicture"] = $.trim(multipicture); //是否支持图片多上传(1上传多张 2上传单张)

            $util.ajaxPost(saveTempleTypeUrl, JSON.stringify(oData), function (data) {
                    if (data.state) {
                        $html.success(data.message);
                        dataTable.ajax.reload();
                        layer.close(index);
                        obj.resetBox();
                    } else {
                        $html.warning(data.message);
                    }
                },
                function () {
                    $html.warning("操作失败！");
                });
        }, 200);
    }


// 重置内容
    obj.resetBox = function () {
        $("#txtName").val("");
        $("#txtJs").val("");
    }

    return obj;
}()


function onLoadBody() {

    templeType.initData();
    templeType.initEvent();

}