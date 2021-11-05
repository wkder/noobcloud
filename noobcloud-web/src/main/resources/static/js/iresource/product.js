/**
 * Created by Administrator on 2016/11/24.
 */
var marketProductMgr = function () {
    var getMgr = "queryMarketProductsByPage.view",
        addOrEditUrl = "addOrEditProduct.view",
        delMgr = "deleteProduct.view",
        dataTable, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }
    //事件绑定
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddorEdit);
    }
    //列表接在
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr, type: "POST"},
            columns: [
                {data: "id", title: "序号", visible: false},
                {data: "name", title: "名称", className: "dataTableFirstColumns"},
                {data: "catalogName", title: "业务类别"},
                {data: "price", title: "价格"},
                {data: "code", title: "编码"},
                {data: "userBaseFeatures", title: "基本特征"},
                {data: "userHobbyFeatures", title: "喜好特征"},
                {data: "orderKey", title: "订购关键字"},
                {
                    title: "操作",
                    render: function (data, type, row) {
                        var regex = new RegExp("\"", "g");
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='marketProductMgr.evtOnAddorEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"marketProductMgr.evtOnDelete(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getMgr + "?name="+encodeURIComponent($("#txtQuery").val())+"&catalogName="+encodeURIComponent($("#catalogNameQuery").val())+"&orderKeyWord="+encodeURIComponent($("#orderKeyWord").val()) + "&productCode=" +encodeURIComponent($("#productCode").val()));
        dataTable.ajax.reload();
    }

    // 新增或修改 弹窗
    obj.evtOnAddorEdit = function (o) {
        //$('#dialogPrimary').find(".cmTableContent").remove();
        $('#dialogPrimary').empty();
        var $all = $(".cmTableContent").clone();
        $('#dialogPrimary').append($all);

        var title = typeof o === "string" ? "修改产品" : "新增产品";
        if (typeof o === "string") { //修改
            var mod = JSON.parse(o);
            $("#dialogPrimary #id").val(mod.id);
            $("#dialogPrimary #productId").val(mod.productId);
            $("#dialogPrimary #productName").val(mod.name);
            $("#dialogPrimary #price").val(mod.price);
            $("#dialogPrimary #code").val(mod.code);
            $("#dialogPrimary #catalogName").val(mod.catalogName);
            $("#dialogPrimary #catalogId").val(mod.catalogId);
            //适用网络
            var forNet = mod.fornet;
            if (forNet != null && forNet != "") {
                var values = forNet.split(',');
                for (var i = 0; i < values.length; i++) {
                    $("#dialogPrimary #chk_" + values[i])[0].checked = true;
                }
            }

            //$("#dialogPrimary #forNet").val(mod.fornet);
            $("#dialogPrimary #spId").val(mod.spid);
            //$("#dialogPrimary #catalogId").val(mod.catalogId);
            //$("#dialogPrimary #catalogName").val(mod.catalogName);
            // $("#dialogPrimary #orderCode").val(mod.orderCode);
            $("#dialogPrimary #userBaseFeatures").val(mod.userBaseFeatures);
            $("#dialogPrimary #userHobbyFeatures").val(mod.userHobbyFeatures);
            $("#dialogPrimary #productFeatures").val(mod.productFeatures);
            $("#dialogPrimary #orderKey").val(mod.orderKey);
            $("#dialogPrimary #keyType").val(mod.keyType);
            $("#dialogPrimary #successMsg").val(mod.successMsg);
            $("#dialogPrimary #netType").val(mod.netType);
            $("#dialogPrimary #effectMode").val(mod.effectMode);
            $("#dialogPrimary #confirmMsg").val(mod.confirmMsg);
            $("#dialogPrimary #orderSucMsg").val(mod.orderSucMsg);
            $("#dialogPrimary #orderFailMsg").val(mod.orderFailMsg);
            $("#dialogPrimary #confirmOrder").val(mod.confirmOrder);

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

    //业务类别树节点加载
    obj.productCatalogTree = function () {
        var setting = {
            check: {
                enable: true,
                chkStyle: 'radio',
                radioType: "all"
            },
            view: {
                dblClickExpand: true,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable: true
                },
                keep: {
                    parent: true,
                    leaf: true
                }
            }
        };

        globalRequest.queryAllCategoryUnderCatalog(true, {}, function (data) {
            var ids = $("#dialogPrimary #catalogId").val();
            var names = $("#dialogPrimary #catalogName").val();

            var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
            setParentChecked(ids, data);
            function setParentChecked(modelIds, data) {
                if (modelIds && modelIds.length > 0) {
                    for (var j = 0; j < data.length; j++) {
                        if (data[j].id == modelIds) {
                            data[j]["checked"] = true;
                            data[j]["open"] = true;
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
                title: "业务类别选择",
                offset: '70px',
                area: ['600px', '600px'],
                content: $("#dialogTreePrimary"),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                    var checkedNodes = zTree.getCheckedNodes(true);
                    if (checkedNodes.length > 0) {
                        names = checkedNodes[0].name;
                        ids = checkedNodes[0].id;
                        $("#dialogPrimary #catalogName").val(names);
                        $("#dialogPrimary #catalogId").val(ids);
                        layer.close(index);
                    } else {
                        layer.alert("没有选择任何增值业务产品");
                    }
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        }, function (data) {
            layer.alert("查询增值业务产品失败", {icon: 6});
        });
    }

    //保存
    obj.evtOnSave = function (index) {
        if (!$("#dialogPrimary").autoVerifyForm()) return;
        if($("#dialogPrimary #catalogId").val()==""){
            $html.warning("业务类别不能为空！");
            return;
        }
        //试用网络
        var forNet = "";
        $("#dialogPrimary .forNet:checked").each(function (i) {
            forNet += "," + $(this).val();
        });
        if (forNet =="") {
            $html.warning("请选择试用网络!");
            return;
        }
        var oData = {};
        oData["id"] = $("#dialogPrimary #id").val() == "" ? "0" : $("#dialogPrimary #id").val();
        oData["productId"] = $("#dialogPrimary #productId").val();
        oData["name"] = $("#dialogPrimary #productName").val();
        oData["price"] = $("#dialogPrimary #price").val();
        oData["code"] = $("#dialogPrimary #code").val();
        oData["fornet"] = forNet.substring(1, forNet.length);
        oData["spid"] = $("#dialogPrimary #spId").val();
        oData["catalogId"] = $("#dialogPrimary #catalogId").val();
        oData["catalogName"] = $("#dialogPrimary #catalogName").val();
        // oData["orderCode"] = $("#dialogPrimary #orderCode").val();
        oData["userBaseFeatures"] = $("#dialogPrimary #userBaseFeatures").val();
        oData["userHobbyFeatures"] = $("#dialogPrimary #userHobbyFeatures").val();
        oData["productFeatures"] = $("#dialogPrimary #productFeatures").val();
        oData["introduce"] = $("#dialogPrimary #introduce").val();

        oData["orderKey"] = $("#dialogPrimary #orderKey").val();
        oData["keyType"] = $("#dialogPrimary #keyType").val();
        oData["successMsg"] = $("#dialogPrimary #successMsg").val();
        oData["netType"] = $("#dialogPrimary #netType").val();
        oData["effectMode"] = $("#dialogPrimary #effectMode").val();
        oData["confirmMsg"] = $("#dialogPrimary #confirmMsg").val();
        oData["orderSucMsg"] = $("#dialogPrimary #orderSucMsg").val();
        oData["orderFailMsg"] = $("#dialogPrimary #orderFailMsg").val();
        oData["confirmOrder"] = $("#dialogPrimary #confirmOrder").val();
        oData["status"] = 0;

        $util.ajaxPost(addOrEditUrl, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
                dataTable.ajax.reload(null, false);
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
    marketProductMgr.initData();
    marketProductMgr.initEvent();
}