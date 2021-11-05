/**
 * Created by hale on 2017/1/1.
 */

var smsSendConfig = function () {
    var getUrl = "querySmsSendConfigList.view", dataTable = {}, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddOrEdit);
    }

    // 表格初始化
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?accessNumber=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "accessNumber", title: "接入号", width: 100, className: "dataTableFirstColumns"},
                {
                    data: "", title: "发送时段", width: 80,
                    render: function (data, type, row) {
                        return row.sendBeginTime + "<br />" + row.sendEndTime;
                    }
                },
                {
                    data: "", title: "暂停时段", width: 80,
                    render: function (data, type, row) {
                        return row.sendPauseBeginTime + "<br />" + row.sendPauseEndTime;
                    }
                },
                {data: "ip", title: "网关IP", width: 100},
                {data: "port", title: "网关端口", width: 80},
                {data: "companyCode", title: "企业代码", width: 80},
                {data: "serviceType", title: "业务代码", width: 80},
                {data: "reportFlag", title: "反馈标识", width: 80},
                {data: "updateTime", title: "更新时间", width: 100},
                {data: "updateUserName", title: "更新人", width: 80},
                {
                    title: "操作", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        var regex = new RegExp("\"", "g");
                        return "<a class='btn btn-info btn-edit' title='编辑' onclick='smsSendConfig.evtOnAddOrEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class='fa fa-pencil-square-o'></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"smsSendConfig.evtOnDelete(" + row.id + ")\"><i class='fa fa-trash-o'></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getUrl + "?accessNumber=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

    // 新增或修改 弹窗
    obj.evtOnAddOrEdit = function (o) {
        $("#divSmsSendConfig").autoEmptyForm(); //清空表单内容

        var title = typeof o === "string" ? "修改短信发送配置" : "新增短信发送配置";
        $plugin.iModal({
            title: title,
            content: $("#divSmsSendConfig"),
            area: ['700px', '600px']
        }, obj.evtOnSave);

        if (typeof o === "string") { //修改
            $("#divSmsSendConfig").autoAssignmentForm(JSON.parse(o));
        }
    }

    // 保存
    obj.evtOnSave = function (index) {
        if (!$("#divSmsSendConfig").autoVerifyForm()) return;
        var oData = $("#divSmsSendConfig").autoSpliceForm();
        globalRequest.iScene.addOrEditSmsSendConfig(true, oData, function (data) {
            if (!data.state) {
                $html.warning(data.message);
                return;
            }
            $html.success(data.message);
            dataTable.ajax.reload();
            smsSendConfig.refreshGlobalAccessNumber();
            layer.close(index);
        });
    }

    // 删除
    obj.evtOnDelete = function (id) {
        var dspConfirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iScene.deleteSmsSendConfig(true, {"id": id}, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
                smsSendConfig.refreshGlobalAccessNumber();
            });
        }, function () {
            layer.close(dspConfirm);
        });
    }

    obj.refreshGlobalAccessNumber = function () {
        //重新加载公共接入号信息
        globalRequest.queryAllEffectiveAccessNumbers(true, {}, function (data) {
            globalConfigConstant.smsAccessNumber = data;
        }, function () {
            layer.alert("系统异常", {icon: 6});
        });
    }

    return obj;
}()

function onLoadBody() {
    smsSendConfig.initData();
    smsSendConfig.initEvent();
}
