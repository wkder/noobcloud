/**
 * Created by Administrator on 2016/11/30.
 */

var auditModel = function () {

    //var getUrl = "queryMyAuditSegments.view" ;
    var getUrl = "queryNeedMeAuditModels.view";
    //var saveUrl = "saveMyAuditSegments.view";
    var saveUrl = "auditModel.view";
    //var layerIndex = 0, dspConfirm = 0;
    var dataTable;
    var obj = {};

    obj.initData = function () {
        $("#taskTypeFilter").hide();
        obj.dataTableInit();
        obj.cmTableInit();
    };
    /**
     * QAQ  columns.defaultContent用来设置列的默认值
     */
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl, type: "POST"},
            columns: [
                {data: "name", title: "客户群名称", width: 60, className: "dataTableFirstColumns"},
                {data: "id", visible: false},
                {
                    data: "createType", title: "创建类型", width: 60, render: function (data, type, row) {
                    if (data == "rule") {
                        return "规则创建"
                    } else if (data == "localImport") {
                        return "本地导入创建"
                    } else if (data == "remoteImport") {
                        return "远程导入创建"
                    }
                }
                },
                {data: "catalogName", title: "目录", width: 60},
                {
                    data: "createTime", title: "创建时间", width: 60,
                    render: function (data, type, row) {
                        var str = row.createTime;
                        var date = new Date(str);
                        return date.format("yyyy-MM-dd");
                    }
                },
                {data: "remarks", title: "备注", width: 90, defaultContent: ""},
                {
                    data: "status", title: "状态", width: 60,
                    render: function (data, type, row) {
                        return row.status == 2 ? "待审批" : "审核完成";
                    }
                },
                {
                    title: "操作", width: 80,
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-info\" title='审批' onclick=\"auditModel.evtOnShow('" + row.name + "','" + row.id + "')\">审批</a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.cmTableInit = function () {
        $('#popupAddOrEdit').cmTable({
            columns: [
                {
                    id: "modelName", desc: "客户群名称", disabled: true
                },
                {
                    id: "auditDecision", desc: "审批决定", client: true, type: "select",
                    options: [
                        {id: 0, value: "通过"},
                        {id: 1, value: "拒绝"}
                    ]
                },
                {
                    id: "reason", desc: "理由",
                    type: "textarea"
                }
            ]
        });
    };


    obj.evtOnShow = function (name, id) {
        var title = "审批客户群" + name;
        $("#modelName").val(name);
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
        $("#reason").val("");
        $("#auditDecision option")[0].selected = true;
    };

    obj.evtOnSave = function (index, id) {
        var modelId = id;//客户群id
        var reason = $("#reason").val();//原因
        var decision = $("#auditDecision").val();//审核

        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }

        setTimeout(function () {
            var oData = {};
            oData["id"] = $.trim(modelId);
            oData["decision"] = $.trim(decision);
            oData["reason"] = $.trim(reason);

            $util.ajaxPost(saveUrl, JSON.stringify(oData),
                function (res) {
                    if (res.retValue == 0) {
                        $html.success(res.desc);
                        dataTable.ajax.reload();
                        layer.close(index);
                        //obj.resetBox();
                    } else {
                        $html.warning(res.desc);
                        layer.close(index);
                    }
                },
                function () {
                    $html.warning("操作失败！");
                });
        }, 200);
    };
    return obj;
}();


function onLoadAuditSegment() {
    auditModel.initData();
}
//function onLoadBody(){
//    auditModel.initData();
//}

