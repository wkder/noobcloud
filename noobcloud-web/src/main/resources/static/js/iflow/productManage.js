/**
 * Created by Chris on 2017/11/2.
 */

var productManage = function () {
    var getProductManage = "queryAllUpgrade4GProduct.view";
    var obj = {}, dataObj = {};
    var dataTable;

    //初始化事件
    obj.initEvent = function () {
        //查询事件
        $("#productManageQueryBtn").click(obj.evtOnRefresh);
        //新增事件
        $("#productManageAddPopUp").click(obj.evtOnAddOrEdit);
    };

    //初始化表格
    obj.dataTableInit = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getProductManage,
                type: "POST"
            },
            columns: [
                {data: "productName", title: "产品名称", width: 800, className: "dataTableFirstColumns"},
                {
                    data: "productType",
                    title: "支持系统",
                    width: 300,
                    className: "centerColumns",
                    render: function (data, type, row) {
                        if (data == 'all') {
                            return 'bss/cbss'
                        } else {
                            return data
                        }
                    }
                },
                {data: "productDesc", title: "产品说明", width: 800, className: "centerColumns"},
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var editHtml = "<a title='编辑'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='productManage.evtOnAddOrEdit(\"" + row.productId + "\")' >编辑</a>";
                        var deleteHtml = "<a title='删除'  class='assignBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='productManage.productManageDel(\"" + row.productId + "\")' >删除</a>";
                        return editHtml + deleteHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询事件
    obj.evtOnRefresh = function () {
        var data = "productName=" + $("#productName").val();
        dataTable.ajax.url(getProductManage + "?" + data);
        dataTable.ajax.reload();
    };

    //新增，修改事件
    obj.evtOnAddOrEdit = function (o) {
        dataObj = {};
        var $panel = $(".popUpTable");
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
            dataObj["productId"] = o;
            globalRequest.iUpgrade4G.queryUpgrade4GProductById(true, {"productId": o}, function (data) {
                $all.find(".popUpProductName").val(data.productName);
                if (data.productType == 'bss') {
                    $all.find("input[name='popUpBSSCheck']").prop("checked", true);//checkbox
                    $all.find(".popUpBSSContent").find("input[type=text]").each(function(){this.disabled = false});// 放开文本框
                    $all.find(".popUpProductCodeBSS").val(data.bssProductCode);
                    $all.find(".popUpPackageCodeBSS").val(data.bssPackageCode);
                    $all.find(".popUpExpenseCodeBSS").val(data.bssRateCode);
                } else if (data.productType == 'cbss') {
                    $all.find("input[name='popUpCBSSCheck']").prop("checked", true);//checkbox
                    $all.find(".popUpCBSSContent").find("input[type=text]").each(function(){this.disabled = false});// 放开文本框
                    $all.find(".popUpProductCodeCBSS").val(data.cbssProductCode);
                    $all.find(".popUpPackageCodeCBSS").val(data.cbssPackageCode);
                    $all.find(".popUpElementCodeCBSS").val(data.cbssElementCode);
                } else if (data.productType == 'all') {
                    $all.find("input[name='popUpBSSCheck']").prop("checked", true);//checkbox
                    $all.find(".popUpBSSContent").find("input[type=text]").each(function(){this.disabled = false});// 放开文本框
                    $all.find(".popUpProductCodeBSS").val(data.bssProductCode);
                    $all.find(".popUpPackageCodeBSS").val(data.bssPackageCode);
                    $all.find(".popUpExpenseCodeBSS").val(data.bssRateCode);

                    $all.find("input[name='popUpCBSSCheck']").prop("checked", true);//checkbox
                    $all.find(".popUpCBSSContent").find("input[type=text]").each(function(){this.disabled = false});// 放开文本框
                    $all.find(".popUpProductCodeCBSS").val(data.cbssProductCode);
                    $all.find(".popUpPackageCodeCBSS").val(data.cbssPackageCode);
                    $all.find(".popUpElementCodeCBSS").val(data.cbssElementCode);
                }
                //$all.find(".popUpOrderCode").val(data.orderCode);
                $all.find(".popUpSucMsg").val(data.smsContent);
                $all.find(".popUpProductInfo").val(data.productDesc);

            }, function () {
                $html.warning("遇到异常，数据加载失败");
            });
        }
    };

    // 保存
    obj.evtOnSave = function (index) {
        var $all = $(".popUpTable").find(".productManageInfo"),
            $productName = $all.find(".popUpProductName"),
            $productTypeBss = $all.find(".popUpBSSCheck"),
            $productTypeCBss = $all.find(".popUpCBSSCheck"),
            $productCodeBss = $all.find(".popUpProductCodeBSS"),
            $productCodeCBss = $all.find(".popUpProductCodeCBSS"),
            $packageCodeBss = $all.find(".popUpPackageCodeBSS"),
            $packageCodeCBss = $all.find(".popUpPackageCodeCBSS"),
            $rateCodeBss = $all.find(".popUpExpenseCodeBSS"),
            $elementCodeCBss = $all.find(".popUpElementCodeCBSS"),
            //$orderCode = $all.find(".popUpOrderCode"),
            $smsContent = $all.find(".popUpSucMsg"),
            $productDesc = $all.find(".popUpProductInfo");
        // 参数组装并校验
        //dataObj["productName"] = $productName.val();
        if ($productTypeBss.is(":checked") && $productTypeCBss.is(":checked")) {
            dataObj["productType"] = "all";
            if(utils.valid($productCodeCBss, utils.notEmpty, dataObj, "cbssProductCode")&&
                utils.valid($productCodeBss, utils.notEmpty, dataObj, "bssProductCode")&&
                utils.valid($rateCodeBss, utils.notEmpty, dataObj, "bssRateCode")&&
                utils.valid($elementCodeCBss, utils.notEmpty, dataObj, "cbssElementCode")){
                /**  do nothing */
            }else {
                return ;
            }
        } else if ($productTypeBss.is(":checked")) {
            dataObj["productType"] = "bss";
            if(utils.valid($productCodeBss, utils.notEmpty, dataObj, "bssProductCode")&&
                utils.valid($rateCodeBss, utils.notEmpty, dataObj, "bssRateCode")){
                /** do nothing */
            }else{
                return ;
            }
        } else if ($productTypeCBss.is(":checked")) {
            dataObj["productType"] = "cbss";
            if(utils.valid($productCodeCBss, utils.notEmpty, dataObj, "cbssProductCode")&&
                utils.valid($elementCodeCBss, utils.notEmpty, dataObj, "cbssElementCode")
            ){
               /** do nothing */
            }else{
                return;
            }
        } else {
            $html.warning("请选择产品类型");
            return;
        }
        if(utils.valid($productName, utils.notEmpty, dataObj, "productName")
            //utils.valid($orderCode, utils.notEmpty, dataObj, "orderCode")
        ){
            //dataObj["cbssProductCode"] = $productCodeCBss.val();
            //dataObj["bssProductCode"] = $productCodeBss.val();
            dataObj["cbssPackageCode"] = $packageCodeCBss.val();
            dataObj["bssPackageCode"] = $packageCodeBss.val();
            //dataObj["bssRateCode"] = $rateCodeBss.val();
            //dataObj["cbssElementCode"] = $elementCodeCBss.val();
            //dataObj["orderCode"] = $orderCode.val();
            dataObj["smsContent"] = $smsContent.val();
            dataObj["productDesc"] = $productDesc.val();
            // 判断是新增还是修改
            if (dataObj["productId"]) {
                globalRequest.iUpgrade4G.updateUpgrade4GProduct(true, dataObj, function (data) {
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("修改成功");
                    dataTable.ajax.reload();
                    layer.close(index);
                });
            } else {
                globalRequest.iUpgrade4G.createUpgrade4GProduct(true, dataObj, function (data) {
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
    // 支持系统事件处理
    function supportSystem(){
        var $all = $(".popUpTable").find(".productManageInfo"),
            $productName = $all.find(".popUpProductName"),
            $productTypeBss = $all.find(".popUpBSSCheck"),
            $productTypeCBss = $all.find(".popUpCBSSCheck"),
            $productCodeBss = $all.find(".popUpProductCodeBSS"),
            $productCodeCBss = $all.find(".popUpProductCodeCBSS"),
            $packageCodeBss = $all.find(".popUpPackageCodeBSS"),
            $packageCodeCBss = $all.find(".popUpPackageCodeCBSS"),
            $rateCodeBss = $all.find(".popUpExpenseCodeBSS"),
            $elementCodeCBss = $all.find(".popUpElementCodeCBSS"),
            $orderCode = $all.find(".popUpOrderCode"),
            $smsContent = $all.find(".popUpSucMsg"),
            $productDesc = $all.find(".popUpProductInfo");

        $all.find("input:checkbox").on("click",function(){
            var type = $(this).attr("product-type");
            var isChecked = this.checked;
            switch(type) {
                case "1":
                    if(isChecked){
                        $productCodeBss[0].disabled = false;
                        $packageCodeBss[0].disabled  = false;
                        $rateCodeBss[0].disabled = false;
                    }else{
                        $productCodeBss[0].value = "";
                        $packageCodeBss[0].value = "";
                        $rateCodeBss[0].value = "";
                        $productCodeBss[0].disabled = true;
                        $packageCodeBss[0].disabled  = true;
                        $rateCodeBss[0].disabled = true;
                    }
                    break;
                case "2":
                    if(isChecked){
                        $productCodeCBss[0].disabled = false;
                        $packageCodeCBss[0].disabled  = false;
                        $elementCodeCBss[0].disabled = false;
                    }else{
                        $productCodeCBss[0].value = "";
                        $packageCodeCBss[0].value = "";
                        $elementCodeCBss[0].value = "";
                        $productCodeCBss[0].disabled = true;
                        $packageCodeCBss[0].disabled  = true;
                        $elementCodeCBss[0].disabled = true;
                    }
                    break;
            }
        })

    }


    //删除事件
    obj.productManageDel = function (id) {
        var productManageConfirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iUpgrade4G.deleteUpgrade4GProduct(true, {"productId": id}, function (data) {
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

    // 清空弹窗
    obj.autoCleanPopUp = function (ele) {
        ele.find("input").each(function (index, element) {
            if (element.type == "text") {
                element.val = "";
            } else if (element.type == "checkbox") {
                element.checked = false;
            }
        });
        ele.find("textarea").each(function (index, element) {
            element.val = "";
        });
    }
    return obj;
}();
function onLoadBody() {
    productManage.initEvent();
    productManage.dataTableInit();
}