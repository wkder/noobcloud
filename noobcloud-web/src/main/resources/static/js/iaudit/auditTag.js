/**
 * Created by Administrator on 2016/11/30.
 */
var audittag = function () {

    //var getUrl = "queryMyAuditTag.view" ;
    var getUrl = "queryNeedMeAuditTags.view";
    //var saveUrl = "saveMyAuditTag.view";
    var saveUrl = "auditTag.view";

    var layerIndex = 0, dspConfirm = 0;
    var dataTable;
    var obj = {};

    obj.initData = function () {
        obj.dataTableInit();
        obj.cmTableInit();
    };
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl, type: "POST"},
            columns: [
                {data: "name", title: "标签名称", width: 60, className: "dataTableFirstColumns"},
                {data: "type", title: "创建类型", width: 60},
                {data: "catalog", title: "目录", width: 60},
                {
                    data: "createTime", title: "创建时间", width: 60,
                    render: function (data, type, row) {
                        var str = row.createTime;
                        var date = new Date(str);
                        return date.format("yyyy-MM-dd");
                    }
                },
                {data: "remark", title: "备注", width: 90},
                {
                    data: "state", title: "状态", width: 60, className: "centerColumns",
                    render: function (data, type, row) {
                        return row.state == 0 ? "审核中" : "审核完成";
                    }
                },
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-info listBtn-info\" title='编辑' onclick=\"audittag.evtOnShow('" + row.name + "')\">审批</a>"
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
                    id: "segmentName", desc: "标签名称"
                },
                {
                    id: "auditDecision", desc: "审批决定", client: true, type: "select",
                    options: [
                        {id: 0, value: "通过"},
                        {id: 1, value: "拒绝"}
                    ]
                },
                {
                    id: "remark", desc: "备注",
                    type: "textarea"
                }
            ]
        });
    };


    obj.evtOnShow = function (name) {
        var title = "审批标签" + name;
        $("#segmentName").val(name);
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
                obj.evtOnSave(index, name);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    obj.evtOnSave = function (index, name) {
        var segmentName = name;//客户群名称
        var remark = $("#remark").val();//备注
        var decision = $("#auditDecision").val();//审核

        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }

        setTimeout(function () {
            var oData = {};
            //oData["id"] = id;
            oData["name"] = $.trim(segmentName);
            oData["decision"] = $.trim(decision);
            oData["remark"] = $.trim(remark);

            $util.ajaxPost(saveUrl, JSON.stringify(oData),
                function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        dataTable.ajax.reload();
                        layer.close(index);
                        //obj.resetBox();
                    } else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning("操作失败！");
                });
        }, 200);
    };
    return obj;
}();


function onLoadAuditTag() {
    audittag.initData();
}

