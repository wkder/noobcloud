/**
 * Created by xuan on 2017/1/21.
 */
var testNumberManage = function () {
    var dataTable,
        dspConfirm = 0, //删除提示框
        getUrl = "queryTestPhoneNumbersByPage.view",
        saveUrl = "addOrEditTestPhoneNumber.view",
        getDeleteUrl = "deleteTestPhoneNumber.view",
        obj = {};

    obj.initData = function () {
        obj.dataTableInit();
        obj.cmTableInit();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnRefresh").click(obj.evtOnRefresh);
        $("#btnAdd").click(obj.evtOnAddorEdit);
    }

    //绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl, type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 60, className: "dataTableFirstColumns"},
                {data: "testPhoneNumber", title: "测试号码", width: 100},
                {data: "userName", title: "号码归属人", width: 120},
                {
                    title: "操作", width: 80,
                    render: function (data, type, row) {
                        return "<a type='button' class='editBtn btn btn-info btn-sm btn-edit' href='#' onclick=\"testNumberManage.evtOnAddorEdit('" + row.id + "','" + row.testPhoneNumber + "','" + row.userName + "','" + row.multiPicture + "')\" ><i class='fa fa-edit'></i></a>" +
                            "<a type='button' class='btn btn-danger btn-sm btn-delete' href='#' onclick='testNumberManage.evtOnDelete(\"" + row.id + "\")' ><i class='fa fa-trash-o'></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

// 弹窗表格初始化
    obj.cmTableInit = function () {
        $('#popupAddOrEdit').cmTable({
            columns: [
                {
                    id: "txtPhone", desc: "测试号码",
                    validate: {expression: "IsPhone"},
                    alert: {className: "help-block alert alert-warning", text: "测试号码不能为空"}
                },
                {
                    id: "txtUserName", desc: "号码归属人",
                    validate: {expression: "NotNull"},
                    alert: {className: "help-block alert alert-warning", text: "号码归属人不能为空"}
                }
            ]

        });
    }


// 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getUrl);
        dataTable.ajax.reload();
    }

// 编辑、新增用户
    obj.evtOnAddorEdit = function (id, phone, name) {
        var title = "新增";
        if (id > 0) {   //编辑
            title = "编辑";
            $("#btnSave").attr("data-id", id);
            $("#txtPhone").val(phone);
            $("#txtUserName").val(name);
        } else {        //新增
            id = 0;
            $("#btnSave").attr("data-id", 0);
            $("#txtPhone").val("");
            $("#txtUserName").val("");
        }

        //打开编辑框
        layer.open({
            type: 1,
            title: title + '测试号码',
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
    }

// 删除用户
    obj.evtOnDelete = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(getDeleteUrl, JSON.stringify({id: id}), function (data) {
                        if (data.state) {
                            $html.success(data.message);
                            dataTable.ajax.reload();
                        } else {
                            $html.warning(data.message);
                        }
                    },
                    function () {
                        $html.warning("删除失败！");
                    });
            },
            function () {
                layer.close(dspConfirm);
            });
    }

// 保存用户
    obj.evtOnSave = function (index, id) {
        var phone = $("#txtPhone").val();
        var userName = $("#txtUserName").val();

        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }

        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["testPhoneNumber"] = $.trim(phone); //号码
            oData["userName"] = $.trim(userName);//

            $util.ajaxPost(saveUrl, JSON.stringify(oData), function (data) {
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
        $("#txtPhone").val("");
        $("#txtUserName").val("");
    }

    return obj;

}()


function onLoadBody() {

    testNumberManage.initData();
    testNumberManage.initEvent();

}
