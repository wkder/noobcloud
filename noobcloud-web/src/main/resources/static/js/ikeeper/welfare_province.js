var welfare_province = function () {
    var obj = {}, dataTable = {};
    var welfare_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    obj.iniData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "productName", title: "产品名称", className: "dataTableFirstColumns"},
                {data: "productCode", title: "产品编码"},
                {
                    data: "productType", title: "产品类型",
                    render: function (data, type, row) {
                        return obj.getProductType(data);
                    }
                },
                {
                    data: "typeId", title: "福利类型",
                    render: function (data, type, row) {
                        return obj.getWelfareType(data);
                    }
                },
                {data: "areaNames", title: "区域"},
                {data: "effDate", title: "生效时间"},
                {data: "expDate", title: "失效时间"},
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var editBtnHtml = "<a title='编辑' class='editBtn btn btn-info btn-edit' href='javascript:void(0)' onclick='welfare_province.addOrEdit(\"{0}\",\"{1}\")' ><i class=\"fa fa-pencil-square-o\"></i></a>".autoFormat("update", row.productId);
                        var deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' onclick='welfare_province.delete(\"{0}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(row.productId);
                        return editBtnHtml + deleteBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function () {
        $(".addBtn").click(function () {
            obj.addOrEdit("create");
        })

        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })
    }

    /**
     * 新增、修改事件
     * @param operate
     */
    obj.addOrEdit = function (operate, id) {
        obj.initDialog(1);
        obj.initElementValue(operate, id);
        $plugin.iModal({
            title: operate === welfare_constant.operate.create ? "新增产品" : "修改产品",
            content: $("#addOrEdit_welfare_dialog"),
            area: '750px',
            btn: ['确定', '取消']
        }, function () {
            obj.save();
        }, null, function (layero, index) {
            layero.find(".operate").attr("index", index).attr("operate", operate);
        })
    }

    /**
     * 保存
     */
    obj.save = function () {
        var $all = $("#addOrEdit_welfare_dialog").find("div.welfareInfo");
        var operate = $all.find(".operate").attr("operate");
        var index = $all.find(".operate").attr("index");

        var oData = $all.autoSpliceForm();
        delete oData.areaNames

        if (!$all.autoVerifyForm()) {
            return;
        }
        // 开始时间不能大于结束时间
        if (oData.effDate > oData.expDate) {
            layer.tips("开始时间不能大于结束时间", $("#addOrEdit_welfare_dialog .welfareInfo .expDate"));
            $("#addOrEdit_welfare_dialog .welfareInfo .expDate").focus();
            return false;
        }
        // 产品编码有效性校验
        if (!checkOnlineProduct(oData.productCode, oData.netType)) {
            return;
        }

        if (operate === welfare_constant.operate.create) {
            globalRequest.iKeeper.addProduct(true, oData, function (data) {
                success(data);
            })
        } else {
            globalRequest.iKeeper.updateProduct(true, oData, function (data) {
                success(data);
            })
        }

        function success(data) {
            if (data.retValue !== 0) {
                layer.alert(data.desc, {icon: 6});
                return;
            }
            layer.msg(data.desc, {time: 1000});
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
            layer.close(index);
        }

        /**
         * 产品编码有效性校验
         */
        function checkOnlineProduct(productCode, netType) {
            var result = true;
            globalRequest.iKeeper.checkOnlineProduct(false, {
                productCode: productCode,
                netType: netType
            }, function (data) {
                if (!data) {
                    layer.tips("产品编码无效", $("#addOrEdit_welfare_dialog .welfareInfo [name='productCode']"));
                    $("#addOrEdit_welfare_dialog .welfareInfo [name='productCode']").focus();
                    result = false;
                }
            })
            return result;
        }
    }

    /**
     * 删除事件
     * @param id
     */
    obj.delete = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定删除数据吗？', function () {
            globalRequest.iKeeper.deleteProduct(true, {productId: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(confirmIndex);

            }, function () {
                layer.alert("删除失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 初始化弹窗
     */
    obj.initDialog = function (type) {
        switch (type) {
            case 1:
                var $all = $("div.iMarket_Content").find("div.welfareInfo").clone();
                $("#addOrEdit_welfare_dialog").empty().append($all);
                break;
            case 2:
                var $area = $("div.iMarket_Content").find("div.areaInfo").clone();
                $("#select_area_dialog").empty().append($area);
                break
        }
    }

    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function (operate, id) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var $all = $("#addOrEdit_welfare_dialog").find("div.welfareInfo"),
            $productName = $all.find(".productName"),
            $productCode = $all.find(".productCode"),
            $productTypeId = $all.find(".productTypeId"),
            $welfareTypeId = $all.find(".welfareTypeId"),
            $effDate = $all.find(".effDate"),
            $areaIds = $all.find(".areaIds"),
            $areaNames = $all.find(".areaNames");

        initProductType();  // 产品类型

        function initProductType() {
            $productTypeId.empty();
            $productTypeId.append("<option value='{0}'>{1}</option>".autoFormat(1, "流量"));
            $productTypeId.append("<option value='{0}'>{1}</option>".autoFormat(2, "语音"));
            $productTypeId.append("<option value='{0}'>{1}</option>".autoFormat(3, "非现"));
            $productTypeId.append("<option value='{0}'>{1}</option>".autoFormat(4, "第三方福利"));
        }

        initEvent();

        function initEvent() {
            /**
             * 归属区域 点击事件
             */
            $areaNames.click(function () {
                var setting = {
                    view: {
                        dblClickExpand: true
                    },
                    edit: {
                        enable: true,
                        showRemoveBtn: false,
                        showRenameBtn: false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        },
                        keep: {
                            leaf: true,
                            parent: true
                        }
                    },
                    check: {
                        enable: true,
                        chkStyle: "checkbox",
                        radioType: "all"
                    }
                };
                globalRequest.iScheduling.queryUserAreas(true, {}, function (data) {
                    if (data && data.length > 0) {
                        var selectIdsArray = $areaIds.val().split(",");
                        if (selectIdsArray) {
                            if (selectIdsArray[0] === "99999") {
                                for (var j = 0; j < data.length; j++) {
                                    data[j].checked = true;
                                }
                            } else {
                                for (var i = 0; i < selectIdsArray.length; i++) {
                                    for (var j = 0; j < data.length; j++) {
                                        if (data[j].id == selectIdsArray[i]) {
                                            data[j].checked = true;
                                            break
                                        }
                                    }
                                }
                            }
                        }

                        $.fn.zTree.init($("#treePrimary"), setting, data);
                        $plugin.iModal({
                            title: "归属区域",
                            content: $("#dialogTreePrimary"),
                            area: ['500px', '500px'],
                            btn: ['确定', '取消']
                        }, function (index) {
                            var areaNamesStr = "", areaIdsStr = "";
                            var zTree = $.fn.zTree.getZTreeObj("treePrimary"),
                                nodes = zTree.getCheckedNodes(),
                                nodesLength = nodes.length;
                            if (nodesLength <= 0) {
                                $areaNames.val("");
                                $areaIds.val("");
                            } else {
                                if (nodesLength < data.length) {    // 没有全选 则去掉江苏省
                                    nodes.splice(0, 1);
                                    for (var i = 0; i < nodes.length; i++) {
                                        areaNamesStr += nodes[i].name + ",";
                                        areaIdsStr += nodes[i].id + ","
                                    }
                                    $areaNames.val(areaNamesStr.substring(0, areaNamesStr.length - 1));
                                    $areaIds.val(areaIdsStr.substring(0, areaIdsStr.length - 1));
                                } else if (nodesLength === data.length) {   // 全选 则直接赋江苏省的值
                                    $areaNames.val(nodes[0].name);
                                    $areaIds.val(nodes[0].id);
                                }
                            }
                            layer.close(index);
                        })
                    }
                }, function () {
                    layer.alert("系统异常：查询用户目录失败");
                });
            });
        }

        if (operate === welfare_constant.operate.update) {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            globalRequest.iKeeper.queryProductById(false, {productId: id}, function (data) {
                if (!data) {
                    layer.alert("数据异常,请刷新重试", {icon: 5});
                    return;
                }
                $("#addOrEdit_welfare_dialog").find("div.welfareInfo").autoAssignmentForm(data);
            })
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var welfareName = encodeURIComponent($(".queryName").val()),
            productCode = encodeURIComponent($(".queryProductCode").val());
        return "queryProductOfShopKeeper.view?productName=" + welfareName + "&productCode=" + productCode;
    }

    /**
     * 获取产品类型
     * @param type
     */
    obj.getProductType = function (type) {
        switch (parseInt(type)) {
            case 1:
                return "流量包"
            case 2:
                return "语音"
            case 3:
                return "非现"
            case 4:
                return "第三方福利"
            default:
                return "未知"
        }
    }

    /**
     * 获取福利类型
     * @param type
     */
    obj.getWelfareType = function (type) {
        switch (parseInt(type)) {
            case 1:
                return "生日维系"
            case 2:
                return "2转4维系"
            case 3:
                return "场景关怀"
            case 4:
                return "优惠到期"
            case 5:
                return "普通福利"
            default:
                return "未知"
        }
    }

    return obj;
}()

function onLoadBody() {
    welfare_province.iniData();
    welfare_province.initEvent();
}