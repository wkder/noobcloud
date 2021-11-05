/**
 * Created by Administrator on 2016/11/24.
 */
var smsContentMgr = function () {
    var getMgr = "querySmsContentsByPage.view",
        dataTable, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    //事件绑定
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(function () {
            obj.evtOnAddorEdit(null);
        });
    }

    //列表加载
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr, type: "POST"},
            columns: [
                {data: "id", title: "序号", visible: false},
                {
                    data: "content", title: "内容标题", className: "dataTableFirstColumns", width: "250px",
                    render: function (data, type, row) {
                        if (data) {
                            if (data.length > 50) {
                                var topHalfData = data.substring(0, 50),
                                    upperHalfData = data.substring(50, data.length - 1),
                                    $fold = "<span class='unfold' onclick='smsContentMgr.fold(this,\"unfold\")'>展开</span>",
                                    $unfold = "&nbsp<span class='fold' style='display: none;' onclick='smsContentMgr.fold(this,\"fold\")'>收起</span>",
                                    $ellipsis = "<span class='ellipsis'>...</span>",
                                    $topHalf = "<span>" + topHalfData + "</span>",
                                    $upperHalf = "<span class='upperHalf' style='display: none;'>" + upperHalfData + "</span>";
                                return $topHalf + $ellipsis + $fold + $upperHalf + $unfold;
                            } else {
                                return data;
                            }
                        }
                    }
                },
                {data: "keywords", title: "关键词"},
                {data: "url", title: "url", visible: false},
                {data: "createUserArea", title: "createUserArea", visible: false},
                {data: "productIds", title: "productIds", visible: false},
                {data: "productNames", title: "营销产品", visible: false},
                {data: "createTime", title: "创建时间"},
                {data: "createUserName", title: "创建人"},
                {
                    data: "createUserTelePhone", title: "手机号",
                    render: function (data, type, row) {
                        if (data && data.length >= 11) {
                            return data.substring(0, data.length - 4) + "****";
                        }
                        else {
                            return "-"
                        }
                    }
                },
                {data: "updateTime", title: "更新时间"},
                {
                    title: "操作",
                    render: function (data, type, row) {
                        var loginUser = globalConfigConstant.loginUser;
                        if ((loginUser.areaId == 99999)
                            || (loginUser.businessHallIds && loginUser.id == row.createUser)
                            || (!loginUser.businessHallIds && loginUser.areaId == row.createUserArea)) {
                            row.createTime = row.createTime ? encodeURI(row.createTime) : row.createTime;
                            row.updateTime = row.updateTime ? encodeURI(row.updateTime) : row.updateTime;
                            return "<a class='btn btn-info btn-edit' title='编辑' onclick='smsContentMgr.evtOnAddorEdit(" + JSON.stringify(row) + ")'><i class='fa fa-pencil-square-o'></i></a>"
                                +
                                "<a class='btn btn-danger btn-delete' title='删除' onclick='smsContentMgr.evtOnDelete(" + row.id + ")'><i class='fa fa-trash-o'></i></a>"
                        } else {
                            return "<a class='btn btn-danger btn-delete' style='visibility: hidden'><i class='fa fa-trash-o'></i></a>";
                        }

                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);


    }
    /**
     * 文字展开折叠 处理
     * @param e
     * @param type
     */
    obj.fold = function (e, type) {
        var _this = $(e);
        if (type === 'unfold') {
            _this.hide().siblings("span.ellipsis").hide().siblings("span.upperHalf").show().siblings("span.fold").show();
        } else {
            _this.hide().siblings("span.ellipsis").show().siblings("span.upperHalf").hide().siblings("span.unfold").show();
        }
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getMgr + "?searchContent=" + encodeURIComponent($("#txtQuery").val()) + "&key=" + encodeURIComponent($("#txtKey").val()) + "&mob=" + encodeURIComponent($("#txtMob").val()));
        dataTable.ajax.reload();
    }

    // 新增或修改 弹窗
    obj.evtOnAddorEdit = function (model) {
        $('#dialogPrimary').empty();
        var $all = $(".cmTableContent").clone();
        $('#dialogPrimary').append($all);

        var title = model ? "修改话术管理" : "新增话术管理";
        if (model) { //修改
            model.createTime = model.createTime ? decodeURI(model.createTime) : model.createTime;
            model.updateTime = model.updateTime ? decodeURI(model.updateTime) : model.updateTime;

            $("#dialogPrimary #id").val(model.id);
            $("#dialogPrimary #content").val(model.content);
            $("#dialogPrimary #keywords").val(model.keywords);
            $("#dialogPrimary #businessType").val(model.businessType);
            $("#dialogPrimary #url").val(model.url);
            $("#dialogPrimary #productNames").val(model.productNames);
            $("#dialogPrimary #productIds").val(model.productIds);
        } else {
            $("#dialogPrimary #id").val(0);
            $("#dialogPrimary #content").val("");
            $("#dialogPrimary #keywords").val("");
            $("#dialogPrimary #businessType").val(0);
            $("#dialogPrimary #url").val("");
            $("#dialogPrimary #productNames").val("");
            $("#dialogPrimary #productIds").val("");
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
            yes: function (index, layero) {
                obj.evtOnSave(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });

    }

    // 加载产品选择树节点
    obj.productSelectTree = function () {
        var setting = {
            check: {
                enable: true,
                chkStyle: "checkbox"
            },
            view: {
                dblClickExpand: true,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            }
        };

        globalRequest.queryAllProductUnderCatalog(true, {}, function (data) {
            var ids = $("#dialogPrimary #productIds").val();
            var names = $("#dialogPrimary #productNames").val();

            var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];

            setParentChecked(ids, data);

            function setParentChecked(modelIds, data) {
                var _modelIds = modelIds.split(",");
                for (var i = 0; i < _modelIds.length; i++) {
                    for (var j = 0; j < data.length; j++) {
                        if (data[j].id == _modelIds[i]) {
                            data[j]["checked"] = true;
                            if (data[j].pId != -1) {
                                setParentChecked(data[j].pId + "", data);
                            }
                            break;
                        }
                    }
                }
            }

            result = data;

            $.fn.zTree.init($("#treePrimary"), setting, result);

            layer.open({
                type: 1,
                shade: 0.3,
                title: "增值业务产品选择",
                offset: '70px',
                area: ['600px', '600px'],
                content: $("#dialogTreePrimary"),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                    var checkedNodes = zTree.getCheckedNodes(true);
                    var _ids = [], _names = [];
                    if (checkedNodes.length > 0) {
                        for (var i = 0; i < checkedNodes.length; i++) {
                            if (!checkedNodes[i].isParent) {
                                _ids.push(checkedNodes[i].id);
                                _names.push(checkedNodes[i].name);
                            }
                        }
                    }
                    $("#dialogPrimary #productNames").val(_names.join(","));
                    $("#dialogPrimary #productIds").val(_ids.join(","));
                    layer.close(index);
                }
                ,
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        }, function (data) {
            layer.alert("查询增值业务产品失败", {icon: 6});
        });
    }

    // 保存
    obj.evtOnSave = function (index) {
        if (!$("#dialogPrimary").autoVerifyForm()) return;

        var oData = {};
        oData["id"] = $("#dialogPrimary #id").val() == "" ? "0" : $("#dialogPrimary #id").val();
        oData["content"] = $("#dialogPrimary #content").val();
        oData["keywords"] = $("#dialogPrimary #keywords").val();
        oData["businessType"] = $("#dialogPrimary #businessType").val();
        oData["url"] = $("#dialogPrimary #url").val();
        oData["productIds"] = $("#dialogPrimary #productIds").val();

        $util.ajaxPost("addOrEditSmsContent.view", JSON.stringify(oData), function (res) {
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
            $util.ajaxPost("deleteSmsContent.view", JSON.stringify({"id": id}), function (res) {
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

    // 获取内容类型
    obj.getBusinessType = function (type) {
        switch (parseInt(type)) {
            case 0:
                return "炒店业务";
            case 1:
                return "场景业务";
            case 2:
                return "掌柜短信业务";
            case 3:
                return "掌柜话+业务";
            default:
                return "未知"
        }
    }

    return obj;
}();

function onLoadBody() {
    smsContentMgr.initData();
    smsContentMgr.initEvent();
}