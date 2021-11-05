var policy_province = function () {
    var obj = {}, dataTable = {}, menuId = 0;
    var policy_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    /**
     * 初始化表格数据
     */
    obj.iniData = function () {
        var catalogName = encodeURIComponent($(".queryCatalogName").val());
        globalRequest.iKeeper.queryKeeperPolicyMenu(false, {menuName: catalogName}, function (data) {
            if (data && data.length) {
                obj.sliceTable(data, $("#catlogTable"));
            }
        })
    }

    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        /**
         * 新增目录
         */
        $(".addBtn").click(function () {
            obj.addOrEdit(policy_constant.operate.create, 0, '', -1);
        })

        /**
         * 新增政策
         */
        $(".addPolicyBtn").click(function () {
            obj.addOrEditPolicy(policy_constant.operate.create);
        })

        /**
         * 查询目录
         */
        $(".searchBtn").click(function () {
            obj.iniData();
        })

        /**
         * 查询政策
         */
        $(".searchPolicyBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })

        /**
         * 返回
         */
        $(".returnBtn").click(function () {
            $(".queryPolicyName").val("");
            $(".policyContainer").hide();
            $(".catalogContainer").show();
            dataTable.destroy();
        })
    }

    /**
     * 新增、修改事件 目录
     * @param operate
     */
    obj.addOrEdit = function (operate, id, name, parentId, level, areaId) {
        if (operate === policy_constant.operate.create && level >= 3) {
            layer.alert("目录最多新增3级", {icon: 5});
            return;
        }
        obj.initDialog(1);
        obj.initElementValue(operate, id, name, parentId, level, areaId);
        $plugin.iModal({
            title: operate === policy_constant.operate.create ? "新增目录" : "修改目录",
            content: $("#addOrEdit_catalog_dialog"),
            area: '600px',
            btn: ['确定', '取消']
        }, function () {
            obj.save();
        }, null, function (layero, index) {
            layero.find("[name='operate']").attr("index", index).attr("operate", operate);
        })
    }

    /**
     * 保存目录
     */
    obj.save = function () {
        debugger
        var $all = $("#addOrEdit_catalog_dialog").find("div.catalogInfo");
        var operate = $all.find("[name='operate']").attr("operate");
        var index = $all.find("[name='operate']").attr("index");

        if (!$all.autoVerifyForm()) {
            return;
        }
        var oData = $all.autoSpliceForm();
        delete oData.pMenuName;
        delete oData.areaName;
        delete oData.operate
        operate === policy_constant.operate.create ? create() : update();

        /**
         * 新增
         */
        function create() {
            globalRequest.iKeeper.createKeeperPolicyMenu(true, oData, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg("新增成功", {time: 1000});
                obj.iniData();
                layer.close(index);
            })
        }

        /**
         * 修改
         */
        function update() {
            globalRequest.iKeeper.modifyKeeperPolicyMenu(true, oData, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg("修改成功", {time: 1000});
                obj.iniData();
                layer.close(index);
            })
        }
    }

    /**
     * 删除目录 事件
     * @param id
     * @param name
     */
    obj.delete = function (id, name) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var confirmIndex = $html.confirm('确定删除目录' + "【" + name + "】吗？", function () {
            globalRequest.iKeeper.deleteKeeperPolicyMenu(true, {menuId: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg("删除成功", {time: 1000});
                obj.iniData();
                layer.close(confirmIndex);
            }, function () {
                layer.alert("删除失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 进入详情页查看
     */
    obj.intoDetail = function (_menuId) {
        menuId = _menuId
        initTable();

        function initTable() {
            var options = {
                ele: $('#policyTable'),
                ajax: {url: obj.getAjaxUrl(), type: "POST"},
                columns: [
                    {data: "policyName", title: "政策名称", className: "dataTableFirstColumns", width: '12%'},
                    {
                        data: "productNames", title: "产品名称", width: "25%",
                        render: function (data, type, row) {
                            return "<span class='moreWord' title=" + data + ">" + data + "</span>";
                        }
                    },
                    {
                        data: "productIds", title: "产品Id", width: '15%',
                        render: function (data, type, row) {
                            return "<span class='moreWord' title=" + data + ">" + data + "</span>";
                        }
                    },
                    {data: "orgNames", title: "区域", width: '10%'},
                    {data: "applyTime", title: "开始时间", width: '10%'},
                    {data: "expireTime", title: "结束时间", width: '10%'},
                    {
                        title: "操作", width: "12%",
                        render: function (data, type, row) {
                            var detailBtnHtml = "<a title='详情' class='btn btn-primary btn-preview' href='javascript:void(0)' onclick='policy_province.detailPolicy(\"{0}\")'><i class=\"fa fa-eye\"></i></a>".autoFormat(row.policyId);
                            var editBtnHtml = "<a title='修改' class='btn btn-info btn-edit'  onclick='policy_province.addOrEditPolicy(\"{0}\",{1})'><i class='fa fa-pencil-square-o'></i></a>".autoFormat(policy_constant.operate.update, row.policyId);
                            var deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' onclick='policy_province.deletePolicy(\"{0}\",\"{1}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(row.policyId, row.policyName);
                            return detailBtnHtml + editBtnHtml + deleteBtnHtml;
                        }
                    }
                ]
            };
            dataTable = $plugin.iCompaignTable(options);
        }

        $(".catalogContainer").hide();
        $(".policyContainer").show();
    }

    /**
     * 新增、修改事件 政策
     * @param operate
     */
    obj.addOrEditPolicy = function (operate, id) {
        obj.initDialog(2);
        obj.initPolicyElement(operate, id);
        $plugin.iModal({
            title: operate === policy_constant.operate.create ? "新增政策" : "修改政策",
            content: $("#addOrEdit_policy_dialog"),
            area: '700px',
            btn: ['确定', '取消']
        }, function () {
            obj.savePolicy();
        }, null, function (layero, index) {
            layero.find("[name='operate']").attr("index", index).attr("operate", operate);
        })
    }

    /**
     * 保存政策
     */
    obj.savePolicy = function () {
        var $all = $("#addOrEdit_policy_dialog").find("div.policyInfo"),
            $applyTime = $all.find("[name='applyTime']"),                   // 开始时间
            $expireTime = $all.find("[name='expireTime']"),                 // 结束时间
            operate = $all.find("[name='operate']").attr("operate"),
            index = $all.find("[name='operate']").attr("index");

        if (!$all.autoVerifyForm()) {
            return;
        }
        if ($applyTime.val().replace(/-/g, "") > $expireTime.val().replace(/-/g, "")) {
            layer.alert("任务开始时间不能大于结束时间", {icon: 6});
            return;
        }
        var oData = $all.autoSpliceForm();
        oData.menuId = menuId
        delete oData.operate
        operate === policy_constant.operate.create ? create() : update();

        /**
         * 新增
         */
        function create() {
            globalRequest.iKeeper.createKeeperPolicyInfo(true, oData, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg("新增成功", {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(index);
            })
        }

        /**
         * 修改
         */
        function update() {
            globalRequest.iKeeper.modifyKeeperPolicyInfo(true, oData, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg("修改成功", {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(index);
            })
        }
    }

    /**
     * 查看 政策详情
     * @param policyContent
     */
    obj.detailPolicy = function (policyId) {
        if (!policyId || policyId <= 0) {
            layer.alert("未找到该数据，请稍后重试", {icon: 6});
            return;
        }

        obj.initDialog(4);
        var $all = $("#detail_policy_dialog").find("div.policyDetailInfo");
        globalRequest.iKeeper.queryKeeperPolicyDetail(true, {policyId: policyId}, function (data) {
            if (!data) {
                layer.alert("根据ID查询政策详情失败", {icon: 6});
                return;
            }
            $all.find(".detail_policyContent").text(data.policyContent || "空");
        }, function () {
            layer.alert("根据ID查询政策详情失败", {icon: 6});
        })
        $plugin.iModal({
            title: "政策详情",
            content: $("#detail_policy_dialog"),
            area: '600px'
        }, function (index) {
            layer.close(index)
        })

    }

    /**
     * 删除政策 事件
     * @param id
     * @param name
     */
    obj.deletePolicy = function (id, name) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var confirmIndex = $html.confirm('确定删除政策' + "【" + name + "】吗？", function () {
            globalRequest.iKeeper.deleteKeeperPolicyInfo(true, {policyId: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg("删除成功", {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl())
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
     * @param type
     */
    obj.initDialog = function (type) {
        switch (type) {
            case 1:
                var $all = $("div.iMarket_Content").find("div.catalogInfo").clone();
                $("#addOrEdit_catalog_dialog").empty().append($all);
                break;
            case 2:
                var $all = $("div.iMarket_Content").find("div.policyInfo").clone();
                $("#addOrEdit_policy_dialog").empty().append($all);
                break;
            case 3:
                var $all = $("div.iMarket_Content").find("div.productInfo").clone();
                $("#select_product_dialog").empty().append($all);
                break;
            case 4: // 查看政策详情
                var $all = $("div.iMarket_Content").find("div.policyDetailInfo").clone();
                $("#detail_policy_dialog").empty().append($all);
                break;
        }
    }

    /**
     * 政策目录 赋值
     * @param operate
     * @param id
     * @param name
     * @param parentId
     * @param level
     * @param areaId
     */
    obj.initElementValue = function (operate, id, name, parentId, level, areaId) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var $all = $("#addOrEdit_catalog_dialog").find("div.catalogInfo"),
            $menuId = $all.find("[name='menuId']"),
            $menuName = $all.find("[name='menuName']"),
            $areaId = $all.find("[name='areaId']"),
            $areaName = $all.find("[name='areaName']"),
            $level = $all.find("[name='menuLevel']"),
            $parentName = $all.find("[name='pMenuName']"),
            $pId = $all.find("[name='pId']"),
            $parentOrgNameRow = $all.find(".parentOrgNameRow");
        $level.attr("disabled", true);
        $pId.attr("disabled", true);

        initEvent();

        function initEvent() {
            /**
             * 归属区域 点击事件
             */
            $areaName.click(function () {
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
                        chkStyle: "radio",
                        radioType: "all"
                    }
                };
                var ajaxUrl = '', param = {menuId: 0};
                if (operate === policy_constant.operate.create) {
                    level++;
                    if (!level || level === 1) {
                        ajaxUrl = 'queryUserAreasByCode.view';
                    } else {
                        ajaxUrl = 'queryAvailAreaByMenuId.view';
                    }
                    param.menuId = id;
                } else {
                    if (level === 1 || areaId === '99999') {
                        ajaxUrl = 'queryUserAreasByCode.view';
                    } else {
                        ajaxUrl = 'queryAvailAreaByMenuId.view';
                    }
                    param.menuId = parentId;
                }
                $util.ajaxPost(ajaxUrl, JSON.stringify(param), function (data) {
                    if (data && data.length > 0) {
                        var selectIdsArray = $areaId.val().split(",");
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
                                $areaName.val("");
                                $areaId.val("");
                            } else {
                                if (nodesLength < data.length) {    // 没有全选 则去掉江苏省
                                    for (var i = 0; i < nodes.length; i++) {
                                        areaNamesStr += nodes[i].name + ",";
                                        areaIdsStr += nodes[i].id + ","
                                    }
                                    $areaName.val(areaNamesStr.substring(0, areaNamesStr.length - 1));
                                    $areaId.val(areaIdsStr.substring(0, areaIdsStr.length - 1));
                                } else if (nodesLength === data.length) {   // 全选 则直接赋江苏省的值
                                    $areaName.val(nodes[0].name);
                                    $areaId.val(nodes[0].id);
                                }
                            }
                            layer.close(index);
                        })
                    }
                }, function () {
                    layer.alert("系统异常：查询用户目录失败");
                })
            });
        }

        if (operate == policy_constant.operate.create) {
            if (parentId >= 0) { // 新增子级组织
                $level.val(level + 1);
                $parentName.val(name);
                $pId.val(id);
                $parentOrgNameRow.show();
            } else {    // 新增根级组织
                $level.val(1);
                $pId.val(0);
                $parentOrgNameRow.hide();
            }
        } else {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }

            globalRequest.iKeeper.queryKeeperPolicyMenu(false, {menuId: id}, function (data) {
                if (data && data.length > 0) {
                    level == 1 ? $parentOrgNameRow.hide() : $parentOrgNameRow.show();
                    $all.autoAssignmentForm(data[0]);
                }
            })
        }
    }

    /**
     * 政策内容 赋值
     * @param operate
     */
    obj.initPolicyElement = function (operate, id) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var $all = $("#addOrEdit_policy_dialog").find("div.policyInfo"),
            $policyName = $all.find("[name='policyName']"),                 // 政策名称
            $productIds = $all.find("[name='productIds']"),                 // 关联产品Id
            $productNames = $all.find("[name='productNames']"),             // 关联产品名称
            $orgIds = $all.find("[name='orgIds']"),                         // 归属小组Id
            $orgNames = $all.find("[name='orgNames']"),                     // 归属小组名称
            $applyTime = $all.find("[name='applyTime']"),                   // 开始时间
            $expireTime = $all.find("[name='expireTime']"),                 // 结束时间
            policyContent = $all.find("[name='policyContent']");            // 政策内容

        initEvent();

        function initEvent() {
            /**
             * 关联产品 点击事件
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
                    layer.close(index);
                })

                /**
                 * 初始化 查询条件
                 */
                function initQuery() {
                    $queryProductTypeId.empty();
                    $queryProductTypeId.append("<option value='{0}'>{1}</option>".autoFormat("", "全部"));
                    $queryProductTypeId.append("<option value='{0}'>{1}</option>".autoFormat(1, "流量"));
                    $queryProductTypeId.append("<option value='{0}'>{1}</option>".autoFormat(2, "语音"));
                    $queryProductTypeId.append("<option value='{0}'>{1}</option>".autoFormat(3, "非现"));
                    $queryProductTypeId.append("<option value='{0}'>{1}</option>".autoFormat(4, "第三方福利"));
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
                    globalRequest.iKeeper.queryProductGroupOfShopKeeper(false, {
                        welfareTypeId: $queryWelfareTypeId.val(),
                        productTypeId: $queryProductTypeId.val(),
                        productName: $queryProductName.val()
                    }, function (data) {
                        if (!data) {
                            layer.alert("数据异常,请刷新重试", {icon: 5});
                            return;
                        }
                        $rightSelect.empty();
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
                            area: ['500px', '520px'],
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

        if (operate == policy_constant.operate.update) {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            globalRequest.iKeeper.queryKeeperPolicyDetail(false, {policyId: id}, function (data) {
                if (data) {
                    $all.autoAssignmentForm(data)
                }
            })
        }
    }

    /**
     * 拼接Table
     * @param data
     */
    obj.sliceTable = function (data, $table) {
        var html = "";
        $table.find("thead").empty();
        $table.find("tbody").empty();
        data.forEach(function (item, index) {
            html += '<tr lang="{id:{menuId},pid:{pId},level:{level}}">'.autoFormat({
                menuId: item.menuId,
                pId: item.pId,
                level: item.menuLevel
            });
            html += '<td>{menuName}</td>'.autoFormat({menuName: item.menuName});
            html += '<td>{createTime}</td>'.autoFormat({createTime: item.createTime});
            html += '<td>{policyNum}</td>'.autoFormat({policyNum: item.policyNum || 0});

            html += "<td class='centerColumns'>";
            html += "<a class='btn btn-primary btn-add' title='新增' onclick='policy_province.addOrEdit(\"{0}\",{1},\"{2}\",{3},{4},{5})'><i class='fa fa-plus'></i></a>".autoFormat(policy_constant.operate.create, item.menuId, item.menuName, item.pId, item.menuLevel, item.areaId);
            html += "<a class='btn btn-info btn-edit' title='修改' onclick='policy_province.addOrEdit(\"{0}\",{1},\"{2}\",{3},{4},{5})'><i class='fa fa-pencil-square-o'></i></a>".autoFormat(policy_constant.operate.update, item.menuId, item.menuName, item.pId, item.menuLevel, item.areaId);
            html += "<a class='btn btn-warning btn-below' title='进入' onclick='policy_province.intoDetail({0},{1},{2})'><i class='fa fa-chevron-down'></i></a>".autoFormat(item.menuId, item.pId, item.menuLevel);
            html += "<a class='btn btn-danger btn-delete' title='删除' hasDelete onclick='policy_province.delete({0},\"{1}\")' {2}><i class='fa fa-trash-o'></i></a>".autoFormat(item.menuId, item.menuName, item.policyNum > 0 ? "disabled" : "")
            html += "</td>";
        })
        $table.append(html);

        initTreeTable();

        function initTreeTable() {
            new oTreeTable($table.eq(0).attr("id"), $table[0], {
                showIcon: false,
                iconPath: 'ext/otreetable/imgs/default/'
            });
            $table.prepend("<thead><tr><th>目录名称</th><th>创建时间</th><th>已有政策数</th><th>操作</th></tr></thead>")
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var queryPolicyName = encodeURIComponent($(".queryPolicyName").val());
        console.log("menuId:" + menuId, "queryPolicyName:" + queryPolicyName)
        return "queryKeeperPolicyInfoByPage.view?policyName=" + queryPolicyName + "&menuId=" + menuId;
    }

    return obj;
}()

function onLoadBody() {
    console.log('loginUser.areaCode:', globalConfigConstant.loginUser.areaCode)
    policy_province.iniData();
    policy_province.initEvent();
}