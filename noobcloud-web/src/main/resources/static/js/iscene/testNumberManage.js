var testnumbermanager = function () {
    var layerIndex = 0, dspConfirm = 0;
    var dataTable, obj = {};
    var getMobListUrl = "getMobList.view",
        delMobUrl = "delMob.view",
        addMobUrl = "addMob.view";

    obj.initData = function () {
        obj.dataTableInit();
        //obj.cmTableInit();
    };

    obj.initEvent = function () {
        $("#btnAdd").click(obj.evtOnShowTempDetail);
        $("#btnQuery").click(obj.evtOnQueryMobList);
    };

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMobListUrl, type: "POST"},
            columns: [
                {data: "mob", title: "手机号码", width: 260, className: "dataTableFirstColumns"},
                {data: "taskId", title: "任务ID", width: 160, className: "centerColumns"},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a id='btndel' class='btn btn-danger btn-delete' title='删除' onclick='testnumbermanager.evtOnDeleteTemp(\"" + row.mob + "\")'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    //弹窗表格初始化
    //obj.cmTableInit = function () {
    //    $("#popupAddOrEdit").cmTable({
    //        columns: [
    //            {
    //                id: "txtPhone", desc: "手机号码",
    //                validate: {expression: "IsPhone"},
    //                alert: {className: "help-block alert alert-warning", text: "手机号码不能为空"}
    //            },
    //            {
    //                id: "txtTaskId", desc: "任务ID",
    //                validate: {expression: "IsNum"},
    //                alert: {className: "help-block alert alert-warning", text: "任务ID必须为正整数"}
    //            }
    //        ]
    //    });
    //};

    // 新增测试号码
    obj.evtOnShowTempDetail = function () {
        $("#btnSave").attr("data-id", 0);
        $("#txtPhone").val("");
        $("#txtTaskId").val("");

        layer.open({
            type: 1,
            title: '新增测试号码',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnSaveUserData(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    //ToDo 接口实现模糊查询功能对接功能预留
    //obj.evtOnQueryMobList = function(){
    //    dataTable.ajax.url(getMobListUrl + "?mobNum=" + $("#txtQuery").val());
    //    dataTable.ajax.reload();
    //};


    // 保存测试号码
    obj.evtOnSaveUserData = function (index) {
        var id = $("#btnSave").attr("data-id");
        var txtPhone = $("#txtPhone").val();
        var txtTaskId = $("#txtTaskId").val();

        //if (!$("#popupAddOrEdit").cmValidate()) {
        //    return;
        //}
        if(!$("#popupAddOrEdit").autoVerifyForm())return;

        setTimeout(function () {
            var oData = {};
            oData["mob"] = $.trim(txtPhone);
            oData["taskId"] = $.trim(txtTaskId);

            $util.ajaxPost(addMobUrl, JSON.stringify(oData), function (res) {
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
                    $html.warning("保存失败！");
                });
        }, 200);
    };

    // 取消
    obj.evtOnCancel = function () {
        layer.close(layerIndex);
    };

    // 重置内容
    obj.resetBox = function () {
        $("#txtPhone").val("");
        $("#txtTaskId").val("");
    };

    // 删除测试号码
    obj.evtOnDeleteTemp = function (mob) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (mob <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(delMobUrl, JSON.stringify({mob: mob}), function (res) {
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
    return obj;
}();

function onLoadBody() {
    testnumbermanager.initData();
    testnumbermanager.initEvent();
}

