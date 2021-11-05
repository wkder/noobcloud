/**
 * Created by Chris on 2017/11/3.
 */
var businessManage = function () {
    var getBusinessManage = "queryUpgrade4GBusiness.view";
    var obj = {}, dataObj = {};
    var dataTable;

    // 初始化事件
    obj.initEvent = function () {
        //查询事件
        $("#businessManageQueryBtn").click(obj.evtOnRefresh);
        //新增事件
        $("#businessManageAddPopUp").click(obj.evtOnAddOrEdit);
    };

    //初始化表格
    obj.dataTableInit = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getBusinessManage,
                type: "POST"
            },
            columns: [
                //{data: "businessId", title: "业务ID", width: 400, className: "dataTableFirstColumns"},
                {data: "businessName", title: "业务名称", width: 300, className: "dataTableFirstColumns"},
                {data: "areaName", title: "归属地市", width: 800, className: "centerColumns"},
                {data: "locationGroupName", title: "关联渠道", width: 600, className: "centerColumns"},
                {data: "productName", title: "关联产品", width: 600, className: "centerColumns"},
                {data: "businessDesc", title: "业务说明", width: 600, className: "centerColumns"},
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var rowStr = JSON.stringify(row);
                        var editHtml = "<a title='编辑'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='businessManage.evtOnAddOrEdit(" + rowStr + ")' >编辑</a>";
                        var deleteHtml = "<a title='删除'  class='assignBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='businessManage.businessManageDel(\"" + row.businessId + "\")' >删除</a>";
                        if(row.createUser == globalConfigConstant.loginUser.id){
                            return editHtml + deleteHtml;
                        }else {
                            return "";
                        }

                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询事件
    obj.evtOnRefresh = function () {
        var data = "businessName=" + $("#businessName").val();
        dataTable.ajax.url(getBusinessManage + "?" + data);
        dataTable.ajax.reload();
    };

    // 业务管理新增或修改弹窗
    obj.evtOnAddOrEdit = function (o) {
        var $popUpTable = $(".popUpTable");
        $popUpTable.empty().append($(".businessManageAddOrEditBtnPopUp").find(".businessManageInfo").clone());
        // 查询归属地市
        var $queryBelongingArea = $popUpTable.find(".queryBelongingArea");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $queryBelongingArea.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $queryBelongingArea.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $queryBelongingArea.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
        // 查询关联分组
        var $queryRelatingGroup = $popUpTable.find(".queryRelatingGroup");

        globalRequest.iUpgrade4G.queryUpGrate4GRelatingGroup(false, {"areaCode":$queryBelongingArea.val()}, function (data) {
            $queryRelatingGroup.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $queryRelatingGroup.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $queryRelatingGroup.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
                // 增加下拉模糊查询的功能
                $queryRelatingGroup.searchableSelect();
                $queryRelatingGroup.siblings(".searchable-select").css("z-index",2);
            }
        }, function () {
            layer.alert("系统异常，获取关联分组失败", {icon: 6});
        });

        // 查询关联产品
        var $queryRelatingProduct = $popUpTable.find(".queryRelatingProduct");
        globalRequest.iUpgrade4G.queryUpGrate4GRelatingProduct(false, {}, function (data) {
            $queryRelatingProduct.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $queryRelatingProduct.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $queryRelatingProduct.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
                // 增加下拉模糊查询的功能
                $queryRelatingProduct.searchableSelect();
                $queryRelatingProduct.siblings(".searchable-select").css("z-index",1);
            }
        }, function () {
            layer.alert("系统异常，获取关联产品失败", {icon: 6});
        });


        var title = o.businessName == undefined ? "新增业务管理" : "修改业务管理";
        $plugin.iModal({
            title: title,
            content: $popUpTable,
            area: ['700px', '600px'],
            btn: ['保存', '取消']
        }, obj.evtOnSave);

        var $businessName = $popUpTable.find(".businessName"),
            $areaCode = $popUpTable.find(".queryBelongingArea"),
            $relatedGroup = $popUpTable.find(".queryRelatingGroup"),
            $relatedProduct = $popUpTable.find(".queryRelatingProduct"),
            $businessDesc = $popUpTable.find(".businessInfo");

        // 修改业务归属地市的时候关联分组
        $areaCode.change(function(){
            globalRequest.iUpgrade4G.queryUpGrate4GRelatingGroup(false, {"areaCode":$queryBelongingArea.val()}, function (data) {
                $queryRelatingGroup.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            $queryRelatingGroup.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            $queryRelatingGroup.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                    $queryRelatingGroup.siblings(".searchable-select").remove();
                    $queryRelatingGroup.searchableSelect();
                    $queryRelatingGroup.siblings(".searchable-select").css("z-index",2);
                }
            }, function () {
                layer.alert("系统异常，获取关联分组失败", {icon: 6});
            });

        });

        if (o.businessName) { //修改
            dataObj["businessId"] = o.businessId;
            $businessName.val(o.businessName);
            $areaCode.val(o.areaCode);
            //$relatedGroup.val(o.locationGroupId);
            $relatedGroup.siblings(".searchable-select").find("div[data-value="+o.locationGroupId+"]").trigger("click");
            //$relatedProduct.val(o.productId);
            $relatedProduct.siblings(".searchable-select").find("div[data-value="+o.productId+"]").trigger("click");
            $businessDesc.val(o.businessDesc);
        }

    };

    // 保存
    obj.evtOnSave = function (index) {
        // 获取参数
        var $popUpTable = $(".popUpTable"),
            $businessName = $popUpTable.find(".businessName"),
            $areaCode = $popUpTable.find(".queryBelongingArea"),
            $relatedGroup = $popUpTable.find(".queryRelatingGroup"),
            $relatedProduct = $popUpTable.find(".queryRelatingProduct"),
            $businessDesc = $popUpTable.find(".businessInfo");
        // 数据组装
        if(utils.valid($businessName, utils.notEmpty, dataObj, "businessName")){
            //dataObj["businessName"] = $businessName.val();
            dataObj["areaCode"] = $areaCode.val();
            dataObj["groupId"] = $relatedGroup.siblings(".searchable-select").find(".searchable-select-items .selected").attr("data-value");
            dataObj["productId"] = $relatedProduct.siblings(".searchable-select").find(".searchable-select-items .selected").attr("data-value");
            dataObj["businessDesc"] = $businessDesc.val();
            if(dataObj["businessId"]){
                // 修改
                globalRequest.iUpgrade4G.updateUpgrade4GBusiness(true, dataObj, function (data) {
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("修改成功");
                    dataTable.ajax.reload();
                    layer.close(index);
                });
            }else{
                // 新增
                globalRequest.iUpgrade4G.createUpgrade4GBusiness(true, dataObj, function (data) {
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

    // 删除事件
    obj.businessManageDel = function (id) {
        var businessManageConfirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iUpgrade4G.deleteUpgrade4GBusiness(true, {"businessId": id}, function (data) {
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("删除成功");
                dataTable.ajax.reload();
            });
        }, function () {
            layer.close(businessManageConfirm);
        });
    };

    return obj;
}();

function onLoadBody() {
    businessManage.initEvent();
    businessManage.dataTableInit();
}