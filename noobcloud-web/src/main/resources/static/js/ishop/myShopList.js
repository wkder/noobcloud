/**
 * Created by gloomysw on 2017/02/16.
 */

var addOrUpdateUrl = "addOrUpdateMyShopList.view";

var savePageData = {};

var province = "";

// 列表每一项显示资料卡
var listRowStr = '<li class="rows"> <div class="title" title="{0}">{0}</div> <div class="contentArea"> <div class="rows"><span class="title">营业厅编码:</span><span class="value">{1}</span></div> <div class="rows"><span class="title">营业厅地址:</span><span class="value" title="{2}">{2}</span></div> <div class="rows"><span class="title">营业厅电话:</span><span class="value">{3}</span></div> <div class="rows"><span class="title">营业员数量:</span><span class="value">0</span></div> <div class="rows"><span class="title">炒店状态:</span><span class="value {4}" style="width: 81px;">{5}</span>{9}</div> </div> <div class="buttonArea"> <a href="javascript:void(0);" {6}>{7}</a> {8} </div> </li>';

var listRowSHStr = '<li class="rows" style="height: 376px;"> <div class="title" title="{0}">{0}</div> <div class="contentArea"> <div class="rows"><span class="title">营业厅编码:</span><span class="value">{1}</span></div> <div class="rows"><span class="title">营业厅地址:</span><span class="value" title="{2}">{2}</span></div> <div class="rows"><span class="title">营业厅电话:</span><span class="value">{3}</span></div> <div class="rows"><span class="title">营业员数量:</span><span class="value">0</span></div> <div class="rows"><span class="title" style="cursor: pointer;color: orange;" onclick="showPortrayal(\'{10}\')">营业厅画像</span></div> <div class="rows"><span class="title">炒店状态:</span><span class="value {4}" style="width: 81px;">{5}</span>{9}</div> </div> <div class="buttonArea"> <a href="javascript:void(0);" {6}>{7}</a> {8} </div> </li>';

// 炒店状态对象 管理按钮名称及字体颜色和按钮样式
var shopStatus = {
    "-1": {
        "buttonAttributes": 'class="button redBorderC"',
        "status": "已删除",
        "statusClass": "redFont",
        "buttonName": "预览",
        "update": "",
        "reminder": ""
    },
    "0": {
        "buttonAttributes": 'data-buttonStatus="update" data-showJson=\'{0}\' class="button redBorderC"',
        "status": "未注册",
        "statusClass": "redFont",
        "buttonName": "完善店面信息",
        "update": "",
        "reminder": ""
    },
    "1": {
        "buttonAttributes": 'data-buttonStatus="preview" data-showJson=\'{0}\' style="float: left; margin-left: 12%;" class="button prev greenBorderC"',
        "status": "在线",
        "statusClass": "greenFont",
        "buttonName": "预览",
        "update": '<a href="javascript:void(0);" data-buttonStatus="update" data-showJson=\'{0}\' style="float: left; margin-left: 8%;" class="button redBorderC">编辑</a>',
        "reminder": ""
    },
    "2": {
        "buttonAttributes": 'data-buttonStatus="preview" data-showJson=\'{0}\' class="button orangeBorderC"',
        "status": "待审核",
        "statusClass": "orangeFont",
        "buttonName": "预览",
        "update": "",
        "reminder": '<a class="btn btn-info" style=" height: 27px; line-height: 14px; " href="javascript:sendPreviewUserMessage({0},\'{1}\')">催单</a>'
    },
    "3": {
        "buttonAttributes": 'data-buttonStatus="update" data-showJson=\'{0}\' class="button redBorderC"',
        "status": "未通过",
        "statusClass": "redFont",
        "buttonName": "修改信息",
        "update": "",
        "reminder": ""
    }
};

// 城市列表集合 省份列表集合 根据parentId连接 炒店类型集合
var confAreaList = [], provinceList = [], baseinfoTypeList = [];

// 根据省份不同 显示不同内容
initProvince();

function initProvince() {
    province = $system.getProvince();
}

/**
 * 获取城市列表
 * 创建人:邵炜
 * 创建时间:2017年2月20日17:07:57
 */
post("selectConfAreaList.view", false, "", function (data) {
    data.forEach(function (item) {
        if (item.parentId === 0) {
            provinceList.push(item)
        } else {
            confAreaList.push(item);
        }
    });
    cityAppendOption();
}, "", function () {
    $html.loading(true);
}, function () {
    $html.loading();
});

/**
 * 城市列表选择框赋值
 * 创建人:Frank
 * 创建时间:2021年7月20日17:53:56
 */
function cityAppendOption() {
    var cityJq = $('#myShopList .layerAddOrUpdate [name="cityAreaCode"]');
    provinceList.forEach(function (item) {
        confAreaList.forEach(function (model) {
            if (item.id === model.parentId) {
                cityJq.append('<option value="{0}">{1}</option>'.format(model.id, model.name));
            }
        });
    });
}

/**
 * 城市选择框发生变动赋值
 * 创建人:Frank
 * 创建时间:2021年72月20日17:59:41
 */
$('#myShopList .layerAddOrUpdate [name="cityAreaCode"]').change(function () {
    var cityElement = this;
    var districtJq = $(cityElement).next();
    districtJq.find("*").remove();
    confAreaList.forEach(function (model) {
        if (cityElement.value == model.parentId) {
            districtJq.append('<option value="{0}">{1}</option>'.format(model.id, model.name));
        }
    });
});

// 默认将城市选择框选择第一个
function setDefultCity() {
    $('#myShopList .layerAddOrUpdate [name="cityAreaCode"]').val(821).change();
}

// 地址栏点击搜索
$('#myShopList .layerAddOrUpdate [name="address"]').click(function () {
    addMaps.search(this.value);
});

/**
 * 获取炒店类型集合
 * 创建人:邵炜
 * 创建时间:2017年2月20日17:48:31
 */
post("selectBaseinfoTypeAll.view", false, "", function (data) {
    baseinfoTypeList = data;
    var locationTypeJq = $("#myShopList .layerAddOrUpdate .location_type");
    data.forEach(function (item) {
        locationTypeJq.append('<option value="{0}">{1}</option>'.format(item.locationTypeId, item.locationType));
    });
}, "", function () {
    $html.loading(true);
}, function () {
    $html.loading();
});

/**
 * 页面增加按钮追加点击事件
 * 创建人:邵炜
 * 创建时间:2017年2月16日15:43:33
 */
$("#myShopList .rows>.addButton").click(function () {
    addOrUpdateMySHop("新增我的炒店");
});

/**
 * 编辑按钮点击冒泡事件
 * 创建人:邵炜
 * 创建时间:2017年2月22日10:09:39
 */
$(document).on("click", '[data-buttonstatus="update"]', function () {
    addOrUpdateMySHop("编辑我的炒店", savePageData[this.getAttribute("data-showjson")]);
});

/**
 * 新增或编辑我的炒店
 * 创建人:邵炜
 * 创建时间:2017年2月20日20:48:08
 * @param name 弹框标题
 * @param dataObj 页面copy值
 */
function addOrUpdateMySHop(name, dataObj) {
    var layerAddOrUpdateJq = $('#myShopList .layerAddOrUpdate');
    layer.open({
        type: 1,
        title: name,
        closeBtn: 0,
        move: '.layui-layer-title',
        skin: 'markBackGroundColor',
        shadeClose: false,
        area: ['990px', '630px'],
        offset: '60px',
        shift: 6,
        btn: ['确定', '取消'],
        content: layerAddOrUpdateJq,
        success: function(index){
            if (province != $system.PROVINCE_ENUM.SH) {
                layerAddOrUpdateJq.find("[name='radius']").find("option.specialOption").remove();
            }
        },
        yes: function (index) {
            if (!layerAddOrUpdateJq.autoVerifyForm()) return;
            layer.close(index);
            var dataValue = layerAddOrUpdateJq.autoSpliceForm();
            confAreaList.forEach(function (item) {
                if (province !== $system.PROVINCE_ENUM.SH) {
                    if (item.id == dataValue.cityAreaCode) {
                        dataValue["cityCode"] = item.code;
                    }
                } else {
                    if (item.id == dataValue.districtCode) {
                        dataValue["cityCode"] = item.code;
                    }
                }
            });
            if (dataValue.quotaNumber) {
                dataValue.quotaNumber = parseInt(dataValue.quotaNumber).toString();
            }
            previewShow(dataValue, dataSumbit);
        },
        cancel: function (index) {
            layer.close(index);
        }
    });
    $(".layui-layer-shade:not(:first)").remove();
    addMaps = addMaps.reset();
    layerAddOrUpdateJq.autoEmptyForm();
    layerAddOrUpdateJq.autoAssignmentForm(dataObj);
    if (dataObj) {
        if (dataObj.address && !dataObj.lng) {
            //addMaps.isClearSearchMarker = true;
            addMaps.search(dataObj.address);
        }
        $('#myShopList .layerAddOrUpdate [name="cityAreaCode"]').change().next().val(dataObj.districtCode);
        //addMaps.centerAndZoom(dataObj.lng, dataObj.lat);
        addMaps.setLocationArea(dataObj.lng, dataObj.lat);
        if (!dataObj.radius) {
            layerAddOrUpdateJq.find("[name='radius']").val("400");
        }
    } else {
        layerAddOrUpdateJq.find("[name='radius']").val("400");
        setDefultCity();
        addMaps.search();
        if (province === $system.PROVINCE_ENUM.SH) {
            $('.layerAddOrUpdate [name="quotaNumber"]').val(200000);
        } else {
            $(".layerAddOrUpdate [name='quotaNumber']").val(50000);
        }
        $(".layerAddOrUpdate [name='radius']").val(1000);
    }
}

/**
 * 新增或修改数据提交
 * 创建人:邵炜
 * 创建时间:2017年2月20日20:58:22
 * @param dataValue  数据对象
 */
function dataSumbit(dataValue) {
    dataValue.baseId = dataValue.baseId <= 0 ? 0 : dataValue.baseId;

    // 百度坐标转wgs84坐标
    var ret = province === $system.PROVINCE_ENUM.SH ? Convert_BD09_To_GCJ02(dataValue.lat, dataValue.lng) : coordtransform.bd09towgs84(dataValue.lng, dataValue.lat);
    dataValue.lng = ret[0];
    dataValue.lat = ret[1];

    post(addOrUpdateUrl, true, dataValue, function (data) {
        if (data > 0) {
            //$html.success("我的炒店保存成功!请等待管理员审核!");
            subSuccessfully();
            selectMyShopList(myShopListPageIndex);
        } else {
            $html.warning("我的炒店保存失败!请稍后再试!");
        }
    }, "", function () {
        $html.loading(true);
    }, function () {
        $html.loading();
    })
}

/**
 * 预览我的炒店
 * 创建人:邵炜
 * 创建时间:2017年2月20日20:52:00
 * @param dataObj 数据对象
 */
function previewShow(jsonObj, callBack) {
    var myShopListLayerPreview = $("#myShopList .layerPreview");
    layer.open({
        type: 1,
        title: '预览我的营业厅',
        closeBtn: 0,
        move: '.layui-layer-title',
        shadeClose: false,
        area: ['990px', '630px'],
        offset: '60px',
        skin: 'markBackGroundColor',
        shift: 6,
        btn: callBack ? ['确定', '返回'] : ['确定'],
        content: myShopListLayerPreview,
        yes: function (index) {
            layer.close(index);
            if (callBack) {
                callBack(jsonObj);
            }
        },
        btn2: function (index) {
            console.log(1);
            layer.close(index);
            if (callBack) {
                addOrUpdateMySHop("新增我的炒店", jsonObj);
            }
        }
    });
    $(".layui-layer-shade:not(:first)").remove();
    previewMaps = previewMaps.reset();
    myShopListLayerPreview.autoAssignmentForm(jsonObj);
    var cityName = "", districtName = "", locationTypeName;
    confAreaList.forEach(function (item) {
        if (cityName && districtName) {
            return true;
        }
        if (item.id == jsonObj.cityAreaCode) {
            cityName = item.name;
        }
        if (item.id == jsonObj.districtCode) {
            districtName = item.name;
        }
    });
    baseinfoTypeList.forEach(function (item) {
        if (item.locationTypeId == jsonObj.locationTypeId) {
            locationTypeName = item.locationType;
            return true;
        }
    });
    myShopListLayerPreview.find('[name="cityDistrict"]').text("{0},{1}".format(cityName, districtName));
    myShopListLayerPreview.find('[name="locationTypeName"]').text(locationTypeName);
    if (!jsonObj.lng) {
        // previewMaps.isClearSearchMarker = true;
        previewMaps.search(jsonObj.address);
    }
    //  previewMaps.centerAndZoom(jsonObj.lng, jsonObj.lat);
    previewMaps.setLocationArea(jsonObj.lng, jsonObj.lat);
}

/**
 * 预览按钮点击事件
 * 创建人:邵炜
 * 创建时间:2017年2月19日14:18:13
 */
$(document).on("click", '[data-buttonStatus="preview"]', function () {
    var jsonStr = this.getAttribute("data-showJson");
    console.log(jsonStr)
    if (!jsonStr) {
        $html.warning("数据出现问题,请联系管理员!");
        return;
    }
    previewShow(savePageData[jsonStr]);
});

/**
 * 预览地图实例化
 * 创建人:邵炜
 * 创建时间:2017年2月19日14:14:25
 */
var previewMaps = new baiduMapRun({
    divId: "mapAreaShow",
    positioningCity: "中国江苏省南京市"
});

var addMaps;
if (document.getElementById("mapArea")) {
    /**
     * 新增修改地图实例化
     * 创建人:邵炜
     * 创建时间:2017年2月17日10:55:15
     */
    addMaps = new baiduMapRun({
        divId: "mapArea",
        positioningCity: "中国江苏省南京市",
        onClickRBICallBack: function (e) {
            var p = e.target.getPosition();
            $("#myShopList .layerAddOrUpdate .lngValue").val(p.lng);
            $("#myShopList .layerAddOrUpdate .latValue").val(p.lat);
            pointGetMyCityDistrict(p);
        },
        onDraggingCallBack: function (e) {
            var p = e.point;
            $("#myShopList .layerAddOrUpdate .lngValue").val(p.lng);
            $("#myShopList .layerAddOrUpdate .latValue").val(p.lat);
            pointGetMyCityDistrict(p);
        },
        changeTitleEmptyMessage: function (number) {
            var explainTitleObj = $("#myShopList .layerAddOrUpdate .explain:eq(0)");
            explainTitleObj.html((number === 0 ? "您输入的地址在地图上查询失败，请重新输入！" : ""));
            if (number === 0) {
                $("#myShopList .layerAddOrUpdate .lngValue").val("");
                $("#myShopList .layerAddOrUpdate .latValue").val("");
            }
        }
    });
}

/**
 * 根据坐标获取坐标锁在城市区
 * 创建人:邵炜
 * 创建时间:2017年2月21日16:00:09
 * @param point 坐标
 */
function pointGetMyCityDistrict(point) {
    addMaps.getLocation(point.lng, point.lat, function (f) {
        var citySelectJq = $('#myShopList .layerAddOrUpdate [name="cityAreaCode"]');
        citySelectJq.find('option').removeAttr("selected").each(function () {
            if (this.text == f.addressComponents.city) {
                citySelectJq.val(this.value);
            }
        });
        citySelectJq.change();
        var districtJq = $('#myShopList .layerAddOrUpdate .district');
        districtJq.find("option").each(function () {
            if (this.text == f.addressComponents.district) {
                districtJq.val(this.value);
            }
        });
    });
}

/**
 * 营业厅地址框发生变动实时检索地图
 * 创建人:邵炜
 * 创建时间:2017年2月17日10:56:08
 */
$('#myShopList .layerAddOrUpdate [name="address"]').keyup(function () {
    addMaps.search(this.value);
});

/**
 * 提交成功弹框
 * 创建人:邵炜
 * 创建时间:2017年2月19日21:50:57
 */
function subSuccessfully() {
    layer.open({
        type: 1,
        title: '新增我的营业厅',
        closeBtn: 0,
        move: '.layui-layer-title',
        skin: 'markBackGroundColor',
        shadeClose: false,
        area: ['990px', '556px'],
        offset: '60px',
        shift: 6,
        btn: ['确定'],
        content: $("#myShopList .subSuccessfully"),
        yes: function (index) {
            layer.close(index);
            $("#positonBaseButton").click();
        }
    });
    $(".layui-layer-shade:not(:first)").remove();
}

var myShopListPageIndex = 0;

/**
 * 获取我的炒店集合
 * 创建人:邵炜
 * 创建时间:2017年2月20日11:12:24
 */
function selectMyShopList(pageIndex) {
    post("selectMyShopList.view?pageIndex=" + pageIndex, true, "", function (data) {
        pageShowY(pageIndex, data.total);
        // 清除我的炒店列表中的数据并将ul jq对象反馈出来
        $("#myShopList .contentListArea:eq(0)>li:not(:last)").remove();
        var myShopListJq = $("#myShopList .contentListArea:eq(0)");
        data.data.forEach(function (item) {
            var model = shopStatus[item.status];
            if (item.lng && item.lat) {
                // wgs84坐标转百度坐标
                var ret = province === $system.PROVINCE_ENUM.SH ? Convert_GCJ02_To_BD09(item.lat, item.lng) : coordtransform.wgs84tobd09(item.lng, item.lat);
                item.lng = ret[0];
                item.lat = ret[1];
            }
            savePageData[item.baseId] = item;

            if (province === $system.PROVINCE_ENUM.SH) {
                myShopListJq.prepend(listRowSHStr.format(item.baseName, item.businessHallCode, item.address, item.fixedTelePhone, model.statusClass, model.status, model.buttonAttributes.format(item.baseId), model.buttonName, model.update.format(item.baseId), model.reminder.format(item.baseId, item.baseName), item.businessHallCode));
            } else {
                myShopListJq.prepend(listRowStr.format(item.baseName, item.businessHallCode, item.address, item.fixedTelePhone, model.statusClass, model.status, model.buttonAttributes.format(item.baseId), model.buttonName, model.update.format(item.baseId), model.reminder.format(item.baseId, item.baseName)));
            }
        });
    }, "", function () {
        $html.loading(true);
    }, function () {
        $html.loading();
    });
}

/**
 * 给审核人员发送审核短信
 * 创建人:邵炜
 * 创建时间:2017年3月11日17:18:42
 * @param baseId 店面主键
 */
function sendPreviewUserMessage(baseId, baseName) {
    var data = {
        baseId: baseId,
        baseName: baseName
    };
    post("sendPreviewUserMessage.view", true, data, function (result) {
        result == "0" ? $html.warning("催单短信发送失败!") : $html.success("催单短信发送成功!");
    }, "", function () {
        $html.loading(true);
    }, function () {
        $html.loading();
    })
}

selectMyShopList(myShopListPageIndex);

/**
 * 分页控件
 * 创建人:邵炜
 * 创建时间:2017年2月23日01:25:57
 */
function pageShowY(pageIndex, pageCount) {
    $("#myShopList .pagination").pagination(pageCount, {
        current_page: pageIndex,
        next_text: "下一页",
        prev_text: "上一页",
        callback: pageselectCallback,
        items_per_page: 12 //每页显示1项
    });
}


/**
 * 分页点击回调事件
 * 创建人:邵炜
 * 创建时间:2017年2月23日01:27:50
 * @param pageIndex 当前页
 */
function pageselectCallback(pageIndex) {
    if (myShopListPageIndex == pageIndex) {
        return;
    }
    myShopListPageIndex = pageIndex;
    selectMyShopList(myShopListPageIndex);
}

/**
 * 点击显示用户画像
 */
function showPortrayal(baseCode) {
    var $dialog = $("#portrayal_dialog");
    var $panel = $(".layerPortrayal").find("div.portrayalInfo").clone();
    $dialog.find("div.portrayalInfo").remove();
    $dialog.append($panel);
    var ret = initPortrayalValue(baseCode);
    if(!ret){return;}
    $plugin.iModal({
        title: '营业厅画像',
        content: $("#portrayal_dialog"),
        area: '850px',
        btn: []
    }, null, null, function (layero, index) {
        layero.find('.layui-layer-btn').remove();
    })
}

/**
 * 获取营业厅画像详情
 * @param baseCode
 */
function initPortrayalValue(baseCode) {
    var ret = true;
    if (!baseCode) {
        layer.alert("暂无信息，敬请期待！", {icon: 6});
        return false;
    }
    globalRequest.iShop.queryBusinessHallPortraitById(false, {businessHallCoding: baseCode}, function (d) {
        var domain  = d.data;
        if (!domain) {
            layer.alert("暂无信息，敬请期待！", {icon: 6});
            ret = false;
            return;
        }
        var $portrayalInfo = $("#portrayal_dialog div.portrayalInfo");
        $portrayalInfo.find(".detail_baseName").text(domain.name || "暂无信息");                                    // 营业厅名称
        $portrayalInfo.find(".detail_address").text(domain.address || "暂无信息");                                      // 详细地址
        $portrayalInfo.find(".detail_businessHallCoding").text(domain.businessHallCoding || "暂无信息");                // 卡库编码
        $portrayalInfo.find(".detail_locationType").text(domain.locationType || "暂无信息");                           // 分类
        $portrayalInfo.find(".detail_openDate").text(domain.openDate || "暂无信息");                                    // 开厅时间
        $portrayalInfo.find(".detail_decorateTime").text(domain.decorateTime || "暂无信息");                            // 装修时间
        $portrayalInfo.find(".detail_areaSize").text(domain.areaSize || "暂无信息");                                    // 面积
        $portrayalInfo.find(".detail_internetSpeed").text(domain.internetSpeed || "暂无信息");                          // 网速
        $portrayalInfo.find(".detail_wifiNumber").text(domain.wifiNumber || "暂无信息");                                // 智能WIFI数
        $portrayalInfo.find(".detail_wifiUserNumber").text(domain.wifiUserNumber || "暂无信息");                        // 智能WIFI使用人数
        $portrayalInfo.find(".detail_lightboxNumber").text(domain.lightboxNumber || "暂无信息");                        // 灯箱数
        $portrayalInfo.find(".detail_taixiNumber").text(domain.taixiNumber || "暂无信息");                              // 台席数
        $portrayalInfo.find(".detail_desktopPCNumber").text(domain.desktopPCNumber || "暂无信息");                      // 台式机数
        $portrayalInfo.find(".detail_cloudterminalEqptNumber").text(domain.cloudterminalEqptNumber || "暂无信息");      // 云终端数
        $portrayalInfo.find(".detail_paperlessEqptNumber").text(domain.paperlessEqptNumber || "暂无信息");              // 无纸化设备数
        $portrayalInfo.find(".detail_paperlessMonthBusinessNum").text(domain.paperlessMonthBusinessNum || "暂无信息");  // 无纸化设备月均业务量
        $portrayalInfo.find(".detail_businessType2").text(domain.businessType2 || "暂无信息");                                        // 可办理业务小类
        $portrayalInfo.find(".detail_personalServiceItems").text(domain.personalServiceItems || "暂无信息");            // 个性化服务项枚举
        $portrayalInfo.find(".detail_hallpeopleNumber").text(domain.hallpeopleNumber || "暂无信息");                    // 厅内人数
        $portrayalInfo.find(".detail_averageAge").text(domain.averageAge || "暂无信息");                                // 营业厅人员平均年龄
        $portrayalInfo.find(".detail_serviceSatisfaction").text(domain.serviceSatisfaction || "暂无信息");              // 服务满意度
        $portrayalInfo.find(".detail_kuandaiBusinessNum").text(domain.kuandaiBusinessNum || "暂无信息");                // 宽带业务受理量
        $portrayalInfo.find(".detail_terminalStoreStatus").text(domain.terminalStoreStatus === "0" ? "无" : domain.terminalStoreStatus === "1" ? "有" : "暂无信息");              // 有无终端产品专卖店
    },function () {
        layer.alert("查询营业厅画像失败", {icon: 6});
        ret = false;
    });
    return ret;
}

function onLoadBody() {

}