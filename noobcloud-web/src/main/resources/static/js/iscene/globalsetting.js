/**
 * Created by Administrator on 2016/12/1.
 */

var globalsetting = function () {
    var editUrl = "editGlobalSetting.view",
        getGlobalSettingUrl = "getGlobalSettingList.view";
    var dataTable;
    var layerIndex = 0;
    var obj = {};

    //初始化表格
    obj.initData = function () {
        obj.dataTableInit();
        //obj.cmTableInit();
    };

    //初始化按钮事件
    obj.initEvent = function () {
        $("#btnRefresh").click(obj.evtOnRefresh);
    };

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getGlobalSettingUrl, type: "POST"},
            columns: [
                {
                    title: "类型名称", width: 550, className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        var str;
                        var i = row.type;
                        switch (i) {
                            case 1:
                                str = "场景任务-投放总数（次）";
                                break;
                            case 2:
                                str = "场景任务-间隔（秒）";
                                break;
                            case 3:
                                str = "全页面任务-间隔（秒）";
                                break;
                            case 4:
                                str = "全页面任务-投放总数（次）";
                                break;
                            default:
                                break;
                        }
                        return "<span>" + str + "</span>"
                    }
                },
                {data: "num", title: "参数值", width: 500, className: "centerColumns"},
                {
                    title: '操作', width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class='btn btn-info btn-edit' title='编辑' onclick='globalsetting.evtOnEditData(" + row.id + "," + row.type + "," + row.num + ")'><i class=\"fa fa-pencil-square-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    //obj.cmTableInit = function () {
    //    $("#popupAddOrEdit").cmTable({
    //        columns: [
    //            {id: "globaltype", desc: "类型", disabled: true},
    //            {
    //                id: "globalnum", desc: "参数值",
    //                validate: {expression: "IsNum"},
    //                alert: {className: "help-block alert alert-warning", text: "参数值必须为正整数"}
    //            }
    //        ]
    //    });
    //};

    obj.evtOnCancel = function () {
        $("globalnum").val("");
        layer.close(layerIndex);
    };

    obj.evtOnRefresh = function () {
        dataTable.ajax.url(getGlobalSettingUrl);
        dataTable.ajax.reload();
    };

    obj.evtOnUpdate = function (index, type) {
        //var id = $("#btnSave").attr("data-id");
        var id = type;
        var str;
        switch (id) {
            case 1:
                str = "场景任务投放总数";
                break;
            case 2:
                str = "场景任务间隔";
                break;
            case 3:
                str = "全页面任务间隔";
                break;
            case 4:
                str = "全页面任务投放总数";
                break;
        }

        var num = $($(".form-control")[1]).val();

        //if (!$("#popupAddOrEdit").cmValidate()) {
        //    return;
        //}
        if(!$("#popupAddOrEdit").autoVerifyForm())return;

        $util.ajaxPost(editUrl, JSON.stringify({id: id, number: num}), function (res) {
                if (res.state) {
                    $html.success(res.message);
                    layer.close(index);
                    dataTable.ajax.reload();
                } else {
                    $html.warning(res.message);
                }
            },
            function () {
                $html.warning('操作失败！');
            });
    };

    obj.evtOnEditData = function (id, type, num) {
        var str;
        //var i = type;
        switch (type) {
            case 1:
                str = "场景任务投放总数";
                break;
            case 2:
                str = "场景任务间隔";
                break;
            case 3:
                str = "全页面任务间隔";
                break;
            case 4:
                str = "全页面任务投放总数";
                break;
        }

        $("#globaltype").val(str);  //类型
        $("#globalnum").val(num);   //参数值
        $("#btnSave").attr("data-id", id); //存ID

        layer.open({
            type: 1,
            title: '全局设置',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnUpdate(index, type);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    return obj;
}();

function onLoadBody() {
    globalsetting.initData();
    globalsetting.initEvent();
}


