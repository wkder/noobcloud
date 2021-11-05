var welfare_city = function () {
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
                {data: null, className: "dataTableFirstColumns details-control", defaultContent: "", width: "5%",},
                {data: "welfareName", title: "福利名称"},
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
                        var editBtnHtml = "<a title='编辑' class='editBtn btn btn-info btn-edit' href='javascript:void(0)' onclick='welfare_city.addOrEdit(\"{0}\",\"{1}\")' ><i class=\"fa fa-pencil-square-o\"></i></a>".autoFormat("update", row.welfareId);
                        var deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' onclick='welfare_city.delete(\"{0}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(row.welfareId);
                        return editBtnHtml + deleteBtnHtml;
                    }
                }
            ],
            drawCallback: function (settings, json) {
                $('#dataTable thead tr th:first-child').removeClass("details-control");
            }
        };
        dataTable = $plugin.iCompaignTable(options);

        /**
         * 点击查看详情
         */
        $("#dataTable tbody").on("click", "td.details-control", function () {
            var $tr = $(this).closest('tr');
            var $row = dataTable.row($tr);
            var rowData = $row.data();
            if ($row.child.isShown()) {
                $row.child.hide();
                $tr.removeClass('shown');
            }
            else {
                globalRequest.iKeeper.queryProductListByCompositId(true, {welfareId: rowData.welfareId}, function (data) {
                    if (!data) {
                        layer.alert("数据异常,请刷新重试", {icon: 5});
                        return;
                    }
                    $row.child(format(data)).show();
                    var $newTr = $tr.next();
                    $newTr.addClass("backColor").children("td").attr("colspan", 5).addClass("dataTableFirstColumns");
                    $newTr.prepend("<td></td>");
                    $tr.addClass('shown');
                })
            }
        })

        function format(data) {
            var html = '<div class="row ">';
            for (var i = 0; i < data.length; i++) {
                html += '<div class="col-md-12">'
                html += '<div class="col-md-2 title">产品名称</div>'
                html += '<div class="col-md-2 content">{productName}</div>'.autoFormat({productName: data[i].productName})
                html += '<div class="col-md-2 title">产品编码</div>'
                html += '<div class="col-md-2 content">{productCode}</div>'.autoFormat({productCode: data[i].productCode})
                html += '<div class="col-md-2 title">产品类型</div>'
                html += '<div class="col-md-2 content">{productType}</div>'.autoFormat({productType: obj.getProductType(data[i].productType)})
                html += '<div class="col-md-2 title">区域</div>'
                html += '<div class="col-md-2 content">{areaNames}</div>'.autoFormat({areaNames: data[i].areaNames})
                html += '</div>'
            }
            html += '</div>'
            return html;
        }
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
            title: operate === welfare_constant.operate.create ? "新增福利" : "修改福利",
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

        if (!$all.autoVerifyForm()) {
            return;
        }
        var oData = $all.autoSpliceForm();
        delete oData.areaNames
        delete oData.productNames

        if (oData.effDate > oData.expDate) {
            layer.tips("开始时间不能大于结束时间", $("#addOrEdit_welfare_dialog .welfareInfo .expDate"));
            $("#addOrEdit_welfare_dialog .welfareInfo .expDate").focus();
            return false;
        }
        if (operate === welfare_constant.operate.create) {
            globalRequest.iKeeper.addWelfareOfShopKeeper(true, oData, function (data) {
                success(data);
            })
        } else {
            globalRequest.iKeeper.updateWelfareOfShopKeeper(true, oData, function (data) {
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
            globalRequest.iKeeper.deleteWelfareOfShopKeeper(true, {welfareId: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 5});
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
                break;
            case 3:
                var $product = $("div.iMarket_Content").find("div.productInfo").clone();
                $("#select_product_dialog").empty().append($product);
                break;
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
            $productName = $all.find(".productName"),       // 福利名称
            $productIds = $all.find(".productIds"),         // 产品组合Id
            $productNames = $all.find(".productNames"),     // 产品组合名称
            $netType = $all.find(".netType"),               // 产品网别
            $productTypeId = $all.find(".productTypeId"),   // 福利类型
            $effDate = $all.find(".effDate"),               // 开始时间
            $expDate = $all.find(".expDate"),               // 结束时间
            $orgIds = $all.find(".orgIds"),                 // 归属小组ID
            $orgNames = $all.find(".orgNames"),             // 归属小组名称
            $welfareTypeId = $all.find("[name='typeId']");  // 福利类型Id

        initEvent();

        function initEvent() {
            /**
             * 产品网别 改变事件
             */
            $netType.change(function () {
                $productNames.val("");
                $productIds.val("");
            })

            /**
             * 产品组合 点击事件
             */
            $productNames.click(function () {
                var $dialog = $("#select_product_dialog");
                obj.initDialog(3);
                var $all = $dialog.find("div.productInfo");
                var $queryWelfareTypeId = $all.find(".queryWelfareTypeId"),  // 福利类型
                    $queryProductTypeId = $all.find(".queryProductTypeId"),  // 产品类型
                    $queryProductName = $all.find(".queryProductName"),      // 产品名称
                    $queryBtn = $all.find(".queryBtn"),                      // 查询按钮
                    $leftSelect = $all.find(".multiLeftSelect"),             // 可选产品
                    $rightSelect = $all.find(".multiRightSelect");           // 已选产品

                initQuery();        // 初始化 查询条件
                initMultiSelect();  // 初始化 穿梭框
                getProductInfo()    // 获取产品信息
                initEvent();        // 初始化 事件

                $plugin.iModal({
                    title: '选择产品组合',
                    content: $dialog,
                    area: '750px'
                }, function (index, layero) {
                    var $rightOption = $rightSelect.find("option"),
                        rightOptionLength = $rightOption.length,
                        productNames = "", productIds = "";
                    for (var i = 0; i < rightOptionLength; i++) {
                        var text = $($rightOption[i]).text();
                        productIds += $($rightOption[i]).val() + ",";
                        productNames += text.substring(0, text.indexOf("【")) + ",";
                    }
                    $productNames.val(productNames.substring(0, productNames.length - 1));
                    $productIds.val(productIds.substring(0, productIds.length - 1));
                    $welfareTypeId.val($queryWelfareTypeId.val());
                    layer.close(index);
                })

                /**
                 * 初始化 查询条件
                 */
                function initQuery() {
                    obj.initProductType($queryProductTypeId);
                }

                /**
                 * 初始化 穿梭框
                 */
                function initMultiSelect() {
                    $leftSelect.multiselect({
                        right: '#select_product_dialog .multiRightSelect',
                        rightAll: '#select_product_dialog .rightAll',
                        rightSelected: '#select_product_dialog .rightSign',
                        leftSelected: '#select_product_dialog .leftSign',
                        leftAll: '#select_product_dialog .leftAll',
                        beforeMoveToLeft: function ($left, $right, $options) {
                            return true;
                        },
                        beforeMoveToRight: function ($left, $right, $options) {
                            return true
                        }
                    });
                }

                /**
                 * 获取产品信息
                 */
                function getProductInfo() {
                    var welfareTypeId = $queryWelfareTypeId.val(),
                        productTypeId = $queryProductTypeId.val(),
                        productName = $queryProductName.val(),
                        netType = $netType.val();
                    globalRequest.iKeeper.queryProductGroupOfShopKeeper(false, {
                        welfareTypeId: welfareTypeId,
                        productTypeId: productTypeId,
                        netType: netType,
                        productName: productName
                    }, function (data) {
                        if (!data) {
                            layer.alert("数据异常,请刷新重试", {icon: 5});
                            return;
                        }
                        $leftSelect.empty();
                        for (var i = 0; i < data.length; i++) {
                            $leftSelect.append("<option value='{0}'>{1}【{2}】</option>".autoFormat(data[i].productId, data[i].productName, data[i].netType.toUpperCase()));
                        }
                    });
                }

                /**
                 * 初始化 事件
                 */
                function initEvent() {
                    $queryBtn.click(function () {
                        getProductInfo();
                    })
                }
            })

            /**
             * 归属小组 点击事件
             */
            $orgNames.click(function () {
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
                globalRequest.iKeeper.queryBusinessOrg(true, {}, function (data) {
                    if (data && data.length > 0) {
                        var selectIdsArray = $orgIds.val().split(",");
                        if (selectIdsArray) {
                            for (var i = 0; i < selectIdsArray.length; i++) {
                                for (var j = 0; j < data.length; j++) {
                                    if (data[j].id == selectIdsArray[i]) {
                                        data[j].checked = true;
                                        break
                                    }
                                }
                            }
                        }

                        $.fn.zTree.init($("#treePrimary"), setting, data);
                        $plugin.iModal({
                            title: "归属小组",
                            content: $("#dialogTreePrimary"),
                            area: ['500px', '565px'],
                            btn: ['确定', '取消']
                        }, function (index) {
                            var orgNames = "", orgIds = "";
                            var zTree = $.fn.zTree.getZTreeObj("treePrimary"),
                                nodes = zTree.getCheckedNodes(),
                                nodesLength = nodes.length;
                            if (nodesLength <= 0) {
                                $orgNames.val("");
                                $orgIds.val("");
                            } else {
                                for (var i = 0; i < nodes.length; i++) {
                                    if (!nodes[i].isParent) {
                                        orgNames += nodes[i].name + ",";
                                        orgIds += nodes[i].id + ","
                                    }
                                }
                                $orgNames.val(orgNames.substring(0, orgNames.length - 1));
                                $orgIds.val(orgIds.substring(0, orgIds.length - 1));
                            }
                            layer.close(index);
                        })
                    }
                }, function () {
                    layer.alert("系统异常：查询归属小组失败", {icon: 5});
                });
            })
        }

        if (operate === welfare_constant.operate.update) {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }

            globalRequest.iKeeper.queryWelfareById(false, {welfareId: id}, function (data) {
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
        var welfareName = encodeURIComponent($(".queryName").val());
        return "queryWelfareOfShopKeeper.view?welfareName=" + welfareName;
    }

    /**
     * 获取产品类型名称
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

    /**
     * 初始化 产品类型
     * @param $element
     */
    obj.initProductType = function ($element) {
        $element.empty();
        $element.append("<option value='{0}'>{1}</option>".autoFormat("", "全部"));
        $element.append("<option value='{0}'>{1}</option>".autoFormat(1, "流量"));
        $element.append("<option value='{0}'>{1}</option>".autoFormat(2, "语音"));
        $element.append("<option value='{0}'>{1}</option>".autoFormat(3, "非现"));
        $element.append("<option value='{0}'>{1}</option>".autoFormat(4, "第三方福利"));
    }

    return obj;
}()

function onLoadBody() {
    welfare_city.iniData();
    welfare_city.initEvent();
}