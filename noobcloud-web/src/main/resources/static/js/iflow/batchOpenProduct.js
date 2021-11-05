var branchOpenManage = function () {
    var getBranchOpenManageUrl = "queryBatchOpenProduct.view";
    var dataTable;
    var obj = {};
    var domain = {}, addOrEditDataObj = {};
    var loginUserDignity = {};
    var branchOpenManage_Constant = {
        targetUser: {
            province: "1",
            city: "2"
        },
        loginUserType: {
            province: 1,
            city: 2,
            business: 3
        }
    };

    // 初始化查询按钮
    obj.initBtn = function () {
        // 鉴权
        if (globalConfigConstant.loginUser.areaCode != 99999) {
            $(".productAddBtn").css("display", "none");
        }
        $(".searchBtn").click(obj.evtOnRefresh);
        $(".productAddBtn").click(obj.evtOnAddOrEdit);
    };

    // 初始化dataTable
    obj.dataTableInit = function () {
        var productName = $.trim($(".queryProductName").val());
        var data = "productName=" + encodeURIComponent(productName);
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getBranchOpenManageUrl + "?" + data,
                type: "POST"
            },
            columns: [
                {data: "id", title: "序号", width: 400, className: "dataTableFirstColumns"},
                {data: "productName", title: "产品名称", width: 300, className: "centerColumns"},
                {data: "smsContent", title: "模板短信", width: 800, className: "centerColumns"},
                {data: "productDesc", title: "产品说明", width: 600, className: "centerColumns"},
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var assignBtnHtml = "", editBth = "", delBtn = "";
                        if (globalConfigConstant.loginUser.areaCode == 99999) {
                            if (row.status === 0) {
                                // 未分配
                                assignBtnHtml = "<a title='权限分配'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='branchOpenManage.assignItem(\"" + row.productType + "\"," + row.id + ",\"" + row.productName + "\",0" + ")' >权限分配</a>";
                            } else if (row.status === 1) {
                                // 已分配
                                assignBtnHtml = "<a title='已分配' class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='branchOpenManage.assignItem(\"" + row.productType + "\"," + row.id + ",\"" + row.productName + "\",1" + ")'>已分配</a>";
                            }
                            editBth = "<a title='编辑产品信息' class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' onclick='branchOpenManage.evtOnAddOrEdit(\"" + row.id + "\")'>编辑</a>";
                            delBtn = "<a title='删除产品信息' class='assignBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='branchOpenManage.productManageDel(\"" + row.id + "\")'>删除</a>";
                        }
                        return assignBtnHtml + editBth + delBtn;
                    }

                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    //初始化按钮操作
    obj.evtOnRefresh = function () {
        var productName = $.trim($(".queryProductName").val());
        var data = "productName=" + encodeURIComponent(productName);
        dataTable.ajax.url(getBranchOpenManageUrl + "?" + data);
        dataTable.ajax.reload();
    };

    //权限分配按钮操作
    obj.assignItem = function (productType, productId, productName, type) {
        var $NameDialog = $(".iMarket_branchOpen_Popup .branchOpenSegment");
        $NameDialog.find(".product").text(productName || "空");
        $NameDialog.find(".cbss_time_control").remove();
        //获取地市
        var $targetUserCityContainer = $(".iMarket_branchOpen_Popup .branchOpenSegment .targetUser-city .col-md-12");
        var $radiosCity = $(".iMarket_branchOpen_Popup .branchOpenSegment .targetUser-city .radiosCity .col-md-12 :checkbox");// 地市
        var $radiosProvince = $(".iMarket_branchOpen_Popup .branchOpenSegment .targetUser-province .radiosProvince"); // 全省
        var $cbssTimeSelect = $(".iMarket_branchOpen_time");
        var $all = $(".iMarket_branchOpen_Popup .branchOpenSegment"),
            $targetContainer = $all.find(".targetUser"),                // 目标用户容器
            $provinceRadio = $all.find(".radiosProvince"),              // 全省 radio
            $provinceLabel = $all.find(".targetUser-province label"),   // 全省 名称
            $cityRadio = $all.find(".radiosCity"),                      // 地市 radio
            $cityLabel = $all.find(".targetUser-city .targetUser-city-text"),     // 地市 名称
            $cityItemLabel = $all.find("wtt"),   // 地市 checkbox名称
            $cityItemChecks = $all.find("wtt"),
            $cbssStartTime = $all.find("wtt"),
            $cbssEndTime = $all.find("wtt"),
            $effectiveMonthRow = $all.find(".effectiveMonthRow"),
            $effectiveStrategy = $all.find(".effectiveStrategy"),
            $effectiveMonth = $all.find(".effectiveMonth");
        // 每次点开默认都不选中
        $provinceRadio.removeAttr("checked");
        $cityRadio.removeAttr("checked");
        // 初始化选项
        $effectiveMonth.val("1");
        $effectiveStrategy.val(0);
        // 如果产品类型是cbss则放开时间选择
        // if (productType === 'cbss') {
        //     var timeSelect = $cbssTimeSelect.find(".cbss_time_control").clone();
        //     $NameDialog.append(timeSelect);
        //     $cbssStartTime = $NameDialog.find("#startTime");
        //     $cbssEndTime = $NameDialog.find("#endTime");
        // }
        if (productType === 'cbss') {
            $effectiveMonthRow.show();
        } else {
            $effectiveMonthRow.hide();
        }
        $radiosProvince[0].disabled = true;
        //查询地市
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $targetUserCityContainer.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id != "99999") {
                        $targetUserCityContainer.append("<label class='checkbox-inline cityChoice'><input type='checkbox' value='A' disabled='disabled'>B</label>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $radiosProvince.val(data[i].id);
                        $radiosProvince[0].disabled = false;
                    }
                }
            }
            $cityItemChecks = $all.find(".targetUser .targetUser-city .col-md-12 input");  // 地市 checkbox
            $cityItemLabel = $all.find(".targetUser-city div label"); // 地市 label
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });

        // 权限省级和地市只能单选
        $targetContainer.on('click', ':radio', function () {
            var type = $(this).attr("data-targetUser");
            switch (type) {
                case branchOpenManage_Constant.targetUser.province:
                    $cityItemChecks.each(function () {
                        this.disabled = true;
                        this.checked = false;
                    });
                    break;
                case branchOpenManage_Constant.targetUser.city:
                    $cityItemChecks.each(function () {
                        this.disabled = false;
                    });
                    break;
            }
        });

        if (type == 1) {
            // 已经分配，再次分配
            var dataObj = {};
            dataObj["productType"] = productType;
            dataObj["productId"] = productId;
            globalRequest.iBatchOpen.queryBatchOpenProductAssignItem(false, dataObj, function (o) {
                var data = o.data;
                if (o.retValue === -1) {
                    layer.msg(o.desc, {time: 1000});
                    return;
                } else if (o.retValue === 1 || o.retValue === 0) {
                    var areaCodeAuthority = data["areaCodeAuthority"];
                    var areas = areaCodeAuthority.split(",");
                    if (areas) {
                        for (var i = 0; i < areas.length; i++) {
                            if (areas[i] == '99999') {
                                $radiosProvince[0].checked = true;
                            } else {
                                $targetUserCityContainer.find(".cityChoice").find(":checkbox").attr("disabled", false);
                                $cityRadio[0].checked = true;
                                $targetUserCityContainer.find(".cityChoice").find(":checkbox[value='" + areas[i] + "']")[0].checked = true;
                            }
                        }
                    }
                    $effectiveMonth.val(data.effectiveMonth);
                    $effectiveStrategy.val(data.effectiveStrategy);
                    if (o.retValue === 1) {
                        layer.msg(o.desc, {time: 500});
                        // $cbssStartTime[0].disabled = true;
                        // $cbssEndTime[0].disabled = true;
                        $effectiveMonth[0].disabled = true;
                        $effectiveStrategy[0].disabled = true;
                    }
                }
            }, function () {
                layer.alert('查询产品详情异常');
            });
        }

        // 产品权限分配提交
        function productAuthorityAssign(index) {
            //Radio判断
            if (!$provinceRadio.is(":checked") && !$cityRadio.is(":checked")) {
                layer.tips("全省或地市必须选择一项", $provinceLabel);
                $provinceLabel.focus();
                return false;
            }
            if ($provinceRadio.is(":checked")) {
                domain["areaSelect"] = $.trim($provinceRadio.val());
                domain["areaDesc"] = $.trim($provinceLabel.text());
            } else if ($cityRadio.is(":checked")) {
                var result = obj.getCheckboxInfo($cityItemChecks, $cityItemLabel);
                if (!result.checked) {
                    layer.tips("必须选择一个地市", $cityLabel);
                    $cityLabel.focus();
                    return false;
                }
                domain["areaSelect"] = result.codes;
                domain["areaDesc"] = result.names;
            }
            if (productType === 'cbss') {
                // 产品类型为cbss需要配置时间
                // if (!$cbssStartTime.val() || !$cbssEndTime.val()) {
                //     layer.tips("cbss产品需要配置生效和失效时间", $cbssStartTime);
                //     $cbssStartTime.focus();
                //     return false;
                // }
                // if ($cbssStartTime.val() > $cbssEndTime.val()) {
                //     layer.tips("开始时间不能大于结束时间", $cbssEndTime);
                //     $cbssEndTime.focus();
                //     return false;
                // }
                // domain["startTime"] = $cbssStartTime.val();
                // domain["endTime"] = $cbssEndTime.val();
                if (!$effectiveMonth.val()) {
                    layer.tips("cbss产品需要配置生效时长", $effectiveMonth);
                    $effectiveMonth.focus();
                    return false;
                }
            }
            domain["effectiveMonth"] = $effectiveMonth.val();
            domain["effectiveStrategy"] = $effectiveStrategy.val();
            domain["productId"] = productId;
            domain["productType"] = productType;
            domain["type"] = type;
            // 提交
            layer.close(index);
            globalRequest.iBatchOpen.productAuthorityAssign(false, domain, function (data) {
                if (data.retValue === 0) {
                    dataTable.ajax.reload();
                    layer.msg("权限分配成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                layer.alert('权限分配异常失败');
            });
        }

        layer.open({
            type: 1,
            shade: 0.3,
            title: "权限配置",
            offset: '50px',
            area: ['580px', '520px'],
            content: $(".iMarket_branchOpen_Popup"),
            btn: ['提交', '取消'],
            yes: function (index) {
                productAuthorityAssign(index);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });
    };

    //获取复选框信息
    obj.getCheckboxInfo = function ($checkbox, $label) {
        var result = {checked: false, codes: "", names: ""};
        for (var i = 0; i < $checkbox.length; i++) {
            if ($($checkbox[i]).is(":checked")) {
                result.checked = true;
                result.codes += $.trim($($checkbox[i]).val()) + ",";
                result.names += $.trim($($label[i]).text()) + ",";
            }
        }
        if (result.codes.length > 0) {
            result.codes = result.codes.substring(0, result.codes.length - 1);
        }
        if (result.names.length > 0) {
            result.names = result.names.substring(0, result.names.length - 1);
        }
        return result
    };


    //新增，修改事件
    obj.evtOnAddOrEdit = function (o) {
        addOrEditDataObj = {};
        var $panel = $("#dialogPrimary");
        $panel.empty().append($(".productManageAddOrEditBtnPopUp").find(".productManageInfo").clone());
        var title = typeof o === "string" ? "修改产品管理" : "新增产品管理";
        $plugin.iModal({
            title: title,
            content: $panel,
            area: ['700px', '600px'],
            btn: ['保存', '取消']
        }, obj.evtOnSave);
        //obj.autoCleanPopUp($(".productManageInfo"));
        supportSystem();
        var $all = $panel.find(".productManageInfo");
        if (typeof o === "string") { //修改
            addOrEditDataObj["id"] = o;
            globalRequest.iBatchOpen.queryBatchOpenProductById(true, {"productId": o}, function (data) {
                if (!data) {
                    $html.warning("数据加载失败");
                    return;
                }
                $all.find(".popUpProductName").val(data.productName);
                if (data.productType == 'bss') {
                    $all.find("input[name='popUpBSSCheck']").prop("checked", true);//checkbox
                    $all.find(".popUpBSSContent").find("input[type=text]").each(function () {
                        this.disabled = false
                    });// 放开文本框
                    $all.find(".popUpProductCodeBSS").val(data.productCode);
                    $all.find(".popUpPackageCodeBSS").val(data.packageCode);
                    $all.find(".popUpExpenseCodeBSS").val(data.elementCode);
                } else if (data.productType == 'cbss') {
                    $all.find("input[name='popUpCBSSCheck']").prop("checked", true);//checkbox
                    $all.find(".popUpCBSSContent").find("input[type=text]").each(function () {
                        this.disabled = false
                    });// 放开文本框
                    $all.find(".popUpProductCodeCBSS").val(data.productCode);
                    $all.find(".popUpPackageCodeCBSS").val(data.packageCode);
                    $all.find(".popUpElementCodeCBSS").val(data.elementCode);
                }
                $all.find(".popUpSucMsg").val(data.smsContent);
                $all.find(".popUpProductInfo").val(data.productDesc);
            }, function () {
                $html.warning("遇到异常，数据加载失败");
            });
        }
    };

    // 支持系统事件处理
    function supportSystem() {
        var $all = $("#dialogPrimary").find(".productManageInfo"),
            $productName = $all.find(".popUpProductName"),
            $productCodeBss = $all.find(".popUpProductCodeBSS"),
            $productCodeCBss = $all.find(".popUpProductCodeCBSS"),
            $bssChecked = $all.find(".popUpBSSCheck"),
            $cbssChecked = $all.find(".popUpCBSSCheck"),

            $bssPackageCode = $all.find(".popUpPackageCodeBSS"),
            $bssExpenseCode = $all.find(".popUpExpenseCodeBSS"),
            $cbssPackageCode = $all.find(".popUpPackageCodeCBSS"),
            $cbssElementCode = $all.find(".popUpElementCodeCBSS");

        $all.find("input:checkbox").on("click", function () {
            var type = $(this).attr("product-type");
            var isChecked = this.checked;
            switch (type) {
                case "1":
                    if (isChecked) {
                        $productCodeBss[0].disabled = false;
                        makeDisabled($bssPackageCode, false);
                        makeDisabled($bssExpenseCode, false);
                        // 单选
                        $productCodeCBss[0].value = "";
                        $productCodeCBss[0].disabled = true;
                        makeDisabled($cbssPackageCode, true);
                        makeDisabled($cbssElementCode, true);
                        $cbssChecked.prop("checked", false);

                    } else {
                        $productCodeBss[0].value = "";
                        $productCodeBss[0].disabled = true;
                        makeDisabled($bssPackageCode, true);
                        makeDisabled($bssExpenseCode, true);
                    }
                    break;
                case "2":
                    if (isChecked) {
                        $productCodeCBss[0].disabled = false;
                        makeDisabled($cbssPackageCode, false);
                        makeDisabled($cbssElementCode, false);
                        // 单选
                        $productCodeBss[0].value = "";
                        $productCodeBss[0].disabled = true;
                        makeDisabled($bssPackageCode, true);
                        makeDisabled($bssExpenseCode, true);
                        $bssChecked.prop("checked", false);
                    } else {
                        $productCodeCBss[0].value = "";
                        $productCodeCBss[0].disabled = true;
                        makeDisabled($cbssPackageCode, true);
                        makeDisabled($cbssElementCode, true);
                    }
                    break;
            }
        })

        function makeDisabled($element, isDisabled) {
            if ($element) {
                $element[0].value = "";
                $element[0].disabled = isDisabled;
            }
        }

    }

    /**
     * 保存事件
     * @param index
     */
    obj.evtOnSave = function (index) {
        var $all = $("#dialogPrimary").find(".productManageInfo"),
            $productName = $all.find(".popUpProductName"),
            $productTypeBss = $all.find(".popUpBSSCheck"),
            $productTypeCBss = $all.find(".popUpCBSSCheck"),
            $productCodeBss = $all.find(".popUpProductCodeBSS"),
            $productCodeCBss = $all.find(".popUpProductCodeCBSS"),
            $smsContent = $all.find(".popUpSucMsg"),
            $productDesc = $all.find(".popUpProductInfo"),
            $bssPackageCode = $all.find(".popUpPackageCodeBSS"),
            $bssExpenseCode = $all.find(".popUpExpenseCodeBSS"),
            $cbssPackageCode = $all.find(".popUpPackageCodeCBSS"),
            $cbssElementCode = $all.find(".popUpElementCodeCBSS");
        // 参数组装并校验
        //dataObj["productName"] = $productName.val();
        if ($productTypeBss.is(":checked")) {
            addOrEditDataObj["productType"] = "bss";
            if (utils.valid($productCodeBss, utils.notEmpty, addOrEditDataObj, "productCode")
                && utils.valid($bssPackageCode, utils.any, addOrEditDataObj, "packageCode")
                && utils.valid($bssExpenseCode, utils.any, addOrEditDataObj, "elementCode")
            ) {
                //addOrEditDataObj["productCode"] = $productCodeBss.val();
                //delete  addOrEditDataObj.bssProductCode;
            } else {
                return;
            }
        } else if ($productTypeCBss.is(":checked")) {
            addOrEditDataObj["productType"] = "cbss";
            if (utils.valid($productCodeCBss, utils.any, addOrEditDataObj, "productCode")
                && utils.valid($cbssPackageCode, utils.any, addOrEditDataObj, "packageCode")
                && utils.valid($cbssElementCode, utils.notEmpty, addOrEditDataObj, "elementCode")
            ) {
                //addOrEditDataObj["productCode"] = $productCodeCBss.val();
                //delete  addOrEditDataObj.cbssProductCode;
            } else {
                return;
            }
        } else {
            $html.warning("请选择产品类型");
            return;
        }
        if (utils.valid($productName, utils.notEmpty, addOrEditDataObj, "productName")
        ) {
            //dataObj["cbssProductCode"] = $productCodeCBss.val();
            //dataObj["bssProductCode"] = $productCodeBss.val();
            //dataObj["bssRateCode"] = $rateCodeBss.val();
            //dataObj["cbssElementCode"] = $elementCodeCBss.val();
            //dataObj["orderCode"] = $orderCode.val();
            addOrEditDataObj["smsContent"] = $smsContent.val();
            addOrEditDataObj["productDesc"] = $productDesc.val();
            // 判断是新增还是修改
            if (addOrEditDataObj["id"]) {
                globalRequest.iBatchOpen.updateBatchOpenProduct(true, addOrEditDataObj, function (data) {
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("修改成功");
                    dataTable.ajax.reload();
                    layer.close(index);
                });
            } else {
                globalRequest.iBatchOpen.createBatchOpenProduct(true, addOrEditDataObj, function (data) {
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("新增成功");
                    dataTable.ajax.reload();
                    layer.close(index);
                });
            }
        }
    };


    obj.productManageDel = function (id) {
        var productManageConfirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iBatchOpen.deleteBatchOpenProductById(true, {"productId": id}, function (data) {
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("删除成功");
                dataTable.ajax.reload();
            });
        }, function () {
            layer.close(productManageConfirm);
        });
    };

    return obj;
}();

function onLoadBody() {
    branchOpenManage.dataTableInit();
    branchOpenManage.initBtn();
}
