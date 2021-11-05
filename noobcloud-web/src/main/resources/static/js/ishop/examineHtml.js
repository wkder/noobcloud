var savePageData = {};

// 根据省份不同 显示不同内容
var province = $system.getProvince();

var positionBaseConfig = function () {

    var getUrl = "selectBaseInfoByPageStatus.view", dataTable, subDataTable, obj = {};
    //加载查询条件
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $("#qryBaseAreas");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取位置场景基站类型失败", {icon: 6});
        });
    }
    //主页table初始化
    obj.dataTableInit = function () {
        var baseId = $("#qrybaseId").val();
        var baseName = $("#qrybaseName").val();
        var baseArea = $("#qryBaseAreas").val();
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?baseId=" + baseId + "&baseName=" + baseName, type: "POST"},
            columns: [
                {data: "locationTypeNames", width: 100},
                {
                    width: 150, className: "baseName",
                    render: function (data, type, row) {
                        savePageData[row.baseId] = row;
                        return '<a data-buttonStatus="preview" style="    color: green; text-decoration: none; cursor: pointer;" data-showJson=\'{0}\' title="预览" >{1}</a>'.format(row.baseId, row.baseName);
                    }
                },
                {data: "businessHallCode", width: 80},
                {data: "fixedTelePhone", width: 100},
                {data: "address", width: 100},
                {
                    data: "status", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        switch (row.status) {
                            case "-1":
                                return "<i class='fa' style='color: red;'>禁用</i>";
                            case "0":
                                return "<i class='fa' style='color: red;'>未注册</i>";
                            case "1":
                                return "<i class='fa' style='color: green;'>在线</i>";
                            case "2":
                                return "<i class='fa' style='color: orange;'>待审核</i>";
                            default: // 3
                                return "<i class='fa' style='color: red;'>未通过</i>";
                        }
                    }
                },
                {
                    width: 120, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.lng && row.lat) {
                            // wgs84坐标转百度坐标
                            var ret = province === $system.PROVINCE_ENUM.SH ? Convert_GCJ02_To_BD09(row.lat,row.lng ) : coordtransform.wgs84tobd09(row.lng, row.lat);
                            row.lng = ret[0];
                            row.lat = ret[1];
                        }
                        return '<a class="btn btn-info" data-buttonStatus="preview" data-showJson=\'{0}\' title="审核" >审核</a>'.format(row.baseId);
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    //触发事件
    obj.initEvent = function () {
        //查询
        $("#positonBaseButton").click(function () {
            obj.queryPositionBase();
        });
        //新建位置基站
        $("#createPositionBaseButton").click(function () {
            obj.createPositionBase();
        });
        //导出
        $("#exportPositionBaseButton").click(function () {
            obj.exportData("getBaseDataDown.view", obj.getParams());
        });
        //导入
        $("#importPositionBaseButton").click(function () {
            obj.batchImportBase();
        });
        //上传
        $('body').on('click', '#batchImportBaseDialog .batchImportBaseSegment .addForm .execlInit', function () {
            obj.submitFile();
        });
    }
    // 查询
    obj.queryPositionBase = function () {
        dataTable.ajax.url(getUrl + "?baseId=" + $("#qrybaseId").val() + "&baseName=" + encodeURIComponent($("#qrybaseName").val()));
        dataTable.ajax.reload();
    }
    //新建位置场景基站
    obj.createPositionBase = function () {
        obj.initPositionBaseElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "新增基站配置",
            move: '.layui-layer-title',
            offset: '50px',
            area: ['580px', '520px'],
            content: $("#createPositionBaseDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                //保存位置场景
                obj.savePositionBaseData(index, "新增");
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //初始化对话框元素
    obj.initPositionBaseElement = function () {
        var $dialog = $("#createPositionBaseDialog");
        //加载静态页面
        var $panel = $(".iMarket_PosiBase_EditHtml").find("div.createPositonBaseSegment").clone();
        $dialog.find("div.createPositonBaseSegment").remove();
        $dialog.append($panel);
        //初始化地市
        initBaseAreas();
        function initBaseAreas() {
            var $baseAreaTypeSelect = $(".createPositonBaseSegment").find(".cityCodeSelect");
            globalRequest.queryPositionBaseAreas(false, {}, function (result) {
                $baseAreaTypeSelect.empty();
                if (result) {
                    var data = $.grep(result, function (item, i) {
                        return item.id > 0;
                    });
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                }
            }, function () {
                layer.alert("系统异常，新增基站配置获取地市失败", {icon: 6});
            });
        }
    }
    //保存场景位置基站站点
    obj.savePositionBaseData = function (index, msg) {
        var positionBaseObj = getPositionBaseObj();
        if (valitePositionBaseObj(positionBaseObj)) {
            globalRequest.createOrUpdatePositionBase(true, positionBaseObj, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    obj.queryPositionBase();
                    layer.msg(msg + "成功", {time: 1000});
                } else {
                    layer.alert(msg + "失败，" + data.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常", {icon: 6});
            });
        } else {
            return;
        }
        //获取位置场景基站对象
        function getPositionBaseObj() {
            var $obj = $("#createPositionBaseDialog .createPositonBaseSegment");
            return {
                baseId: $obj.find(".id").val(),
                baseName: $obj.find(".baseName").val(),
                address: $obj.find(".address").val(),
                businessHallCode: $obj.find(".businessHallCode").val(),
                cityCode: $obj.find(".cityCodeSelect").val(),
                cityName: $obj.find(".cityCodeSelect").find("option:selected").text(),
                locationTypeId: $obj.find(".locationTypeSelect").val(),
                locationType: $obj.find(".locationTypeSelect").find("option:selected").text(),
                lng: $obj.find(".lng").val(),
                lat: $obj.find(".lat").val(),
                radius: $obj.find(".radius").val(),
                status: $obj.find(".statusSelect").val()
            }
        }

        /*
         校验位置场景基站
         */
        function valitePositionBaseObj(obj) {
            var $html = $("#createPositionBaseDialog .createPositonBaseSegment");
            if (obj.baseName == "") {
                layer.tips('基站名称不能为空!', $html.find(".baseName"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else if (obj.baseName.length > 100) {
                layer.tips('基站名称长度不能超过100个字数!', $html.find(".baseName"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.address == "") {
                layer.tips('基站地址不能为空!', $html.find(".address"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else if (obj.address.length > 200) {
                layer.tips('基站地址长度不能超过200个字数!', $html.find(".address"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.businessHallCode.length > 60) {
                layer.tips('营业厅编码长度不能超过60个字数!', $html.find(".businessHallCode"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.cityCode == "") {
                layer.tips('地市不能为空!', $html.find(".cityCodeSelect"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.locationTypeId == "") {
                layer.tips('类型不能为空!', $html.find(".locationTypeSelect"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.lng == "") {
                layer.tips('经度不能为空!', $html.find(".lng"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.lat == "") {
                layer.tips('纬度不能为空!', $html.find(".lat"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.radius == "") {
                layer.tips('营销间隔不能为空!', $html.find(".radius"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else {
                var reg = /^[1-9]{1}\d*$/;
                if (!reg.test(obj.radius)) {
                    layer.tips('营销间隔只能为整数!', $html.find(".radius"), {time: 1000, tips: [2, "#71bff2"]});
                    return false;
                }
            }
            return true;
        }
    }
    //删除事件
    obj.deletePositionBase = function (id) {
        layer.confirm("确定删除？", {icon: 3, title: '提示'}, function () {
            globalRequest.deletePositionBaseById(true, {"baseId": id}, function (data) {
                if (data.retValue === 0) {
                    obj.queryPositionBase();
                    layer.msg("删除成功", {timeout: 800});
                } else {
                    layer.alert("系统异常", {icon: 6});
                }
            });
        });
    }
    //编辑事件
    obj.editPositionBase = function (id) {
        updatePositionBase();
        globalRequest.queryPositionBaseById(true, {baseId: id}, function (data) {
            var positionBaseDomain = data.positionBaseDomain;
            var $editDialog = $("#createPositionBaseDialog .createPositonBaseSegment");
            $editDialog.find(".id").val(positionBaseDomain.baseId);
            $editDialog.find(".baseName").val(positionBaseDomain.baseName);
            $editDialog.find(".address").val(positionBaseDomain.address);
            $editDialog.find(".businessHallCode").val(positionBaseDomain.businessHallCode);
            $editDialog.find(".cityCodeSelect").val(positionBaseDomain.cityCode);
            $editDialog.find(".locationTypeSelect").val(positionBaseDomain.locationTypeId);
            $editDialog.find(".lng").val(positionBaseDomain.lng);
            $editDialog.find(".lat").val(positionBaseDomain.lat);
            $editDialog.find(".radius").val(positionBaseDomain.radius);
            $editDialog.find(".statusSelect").val(positionBaseDomain.status);
        }, function () {
            layer.alert("根据ID查询位置基站数据失败", {icon: 6});
        });
        /*
         *修改位置场景
         */
        function updatePositionBase() {
            obj.initPositionBaseElement();
            layer.open({
                type: 1,
                shade: 0.3,
                title: "编辑位置场景",
                move: '.layui-layer-title',
                offset: '50px',
                area: ['580px', '520px'],
                content: $("#createPositionBaseDialog"),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    //保存位置场景
                    obj.savePositionBaseData(index, "编辑");
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        }
    }
    //导出数据
    obj.exportData = function (url, params) {
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm";
        tempForm.method = "POST";
        tempForm.action = url;

        $.each(params, function (idx, value) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = value[0];
            input.value = value[1];
            tempForm.appendChild(input);
        });
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    };
    //获取导出数据参数
    obj.getParams = function () {
        var paramList = [
            ["baseId", $("#qrybaseId").val()],
            ["baseName", $("#qrybaseName").val()],
            ["areaCode", $("#qryBaseAreas").val()],
            ["areaName", $("#qryBaseAreas").find("option:selected").text()]
        ];
        return paramList;
    }
    //导入
    obj.batchImportBase = function () {
        fileId = null;
        var $dialog = $("#batchImportBaseDialog");
        //加载静态页面
        var $panel = $(".iMarket_PosiBase_EditHtml").find("div.batchImportBaseSegment").clone();
        $dialog.find("div.batchImportBaseSegment").remove();
        $dialog.append($panel);
        layer.open({
            type: 1,
            shade: 0.3,
            title: "批量导入基站点",
            move: '.layui-layer-title',
            offset: '60px',
            area: ['880px', '500px'],
            content: $("#batchImportBaseDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                //保存位置场景
                savePositionDataImport(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });

        function savePositionDataImport(index) {
            if (fileId == null) {
                layer.alert("请先上传导入文件", {icon: 6});
                return;
            }
            globalRequest.createPositionBaseImport(true, {fileId: fileId}, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    obj.queryPositionBase();
                    layer.msg("批量导入基站点成功", {time: 1000});
                } else {
                    layer.alert("批量导入基站点失败，" + data.desc, {icon: 6});
                }
            }, function () {
                layer.alert("批量导入基站点失败", {icon: 6});
            });
        }
    }
    //文件上传
    obj.submitFile = function () {
        var $form = $("#batchImportBaseDialog .batchImportBaseSegment").find(".addForm");
        var $file = $form.find("input[type=file]");
        if ($file.val() == "") {
            layer.msg("请选择文件!");
            return;
        }
        var options = {
            type: 'POST',
            url: 'batchImportBaseInfo.view',
            dataType: 'json',
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (data) {
                $html.loading(false)
                if (data.retValue == "0") {
                    layer.msg(data.desc);
                    fileId = data.fileId;
                    initTable(data.fileId);
                } else {
                    layer.alert("创建失败" + data.desc);
                }
            }
        }
        $form.ajaxSubmit(options);

        function initTable(fileId) {
            var pageInfo = {
                itemCounts: 0,
                items: {}
            };

            var paras = {
                curPage: 1,
                countsPerPage: 10,
                fileId: fileId
            };

            globalRequest.queryPositionBaseImport(true, paras, function (data) {
                pageInfo.itemCounts = data.itemCounts;
                pageInfo.items = data.items;
                createPageBody();
                initPagination();
            }, function () {
                layer.alert("系统异常", {icon: 6});
            });

            function initPagination() {
                $("#batchImportBaseDialog .iTable .pagination").pagination({
                    items: pageInfo.itemCounts,
                    itemsOnPage: 10,
                    displayedPages: 10,
                    cssStyle: 'light-theme',
                    prevText: "<上一页",
                    nextText: "下一页>",
                    onPageClick: function (pageNumber) {
                        paras.curPage = pageNumber;
                        globalRequest.queryPositionBaseImport(true, paras, function (data) {
                            pageInfo.itemCounts = data.itemCounts;
                            pageInfo.items = data.items;
                            createPageBody();
                        });
                    }
                });
            }

            function createPageBody() {
                var html = "<tr><td colspan='11'><div class='noData'>暂无相关数据</div></td></tr></li>";
                if (pageInfo.items.length > 0) {
                    var html = template('positionBaseImport', {list: pageInfo.items});
                }
                $("#batchImportBaseDialog .iTable tbody tr").remove();
                $("#batchImportBaseDialog .iTable tbody").append(html);
            };
        }

    };


    return obj;
}();

function onLoadBody() {
    positionBaseConfig.initAreaSelect();
    positionBaseConfig.dataTableInit();
    positionBaseConfig.initEvent();
}

positionBaseConfig.initAreaSelect();
positionBaseConfig.dataTableInit();
positionBaseConfig.initEvent();

/**
 * 审核弹框
 * 创建人:邵炜
 * 创建时间:2017年2月22日21:36:28
 * @param id 主键
 * @param baseName 炒店名称
 */
function auditAreaLayer(id, baseName) {
    var auditAreaLayerJq = $("#auditAreaLayer");
    auditAreaLayerJq.find('[name="baseId"]').val(id);
    auditAreaLayerJq.find('[name="baseName"]').text(baseName);
    auditAreaLayerJq.find('[name="status"]').val(1);
    layer.open({
        type: 1,
        title: "炒店审批",
        closeBtn: 0,
        move: '.layui-layer-title',
        shadeClose: false,
        area: ['746px', '558px'],
        offset: '60px',
        shift: 6,
        btn: ['确定', '取消'],
        content: auditAreaLayerJq,
        yes: function (index) {
            layer.close(index);
            var postData = auditAreaLayerJq.autoSpliceForm();
            post("updateShopStatusByBaseId.view", true, postData, function (data) {
                if (data == 2) {
                    $html.success("数据保存成功!");
                    positionBaseConfig.queryPositionBase();
                } else {
                    $html.warning("数据保存失败!");
                }
                $("#auditAreaLayer textarea").val("");
            }, "", function () {
                $html.loading(true);
            }, function () {
                $html.loading();
            });
        },
        end: function () {
            $("#auditAreaLayer textarea").val("");
        }
    });
    $(".layui-layer-shade:not(:first)").remove();
}

function onLoadBody() {

}

/**
 * 预览按钮点击事件
 * 创建人:邵炜
 * 创建时间:2017年2月19日14:18:13
 */
$(document).on("click", '[data-buttonStatus="preview"]', function () {
    var jsonStr = this.getAttribute("data-showJson");
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

/**
 * 预览我的炒店
 * 创建人:邵炜
 * 创建时间:2017年2月20日20:52:00
 * @param dataObj 数据对象
 */
function previewShow(jsonObj) {
    var myShopListLayerPreview = $("#myShopList .layerPreview");
    layer.open({
        type: 1,
        title: '审批营业厅',
        closeBtn: 0,
        move: '.layui-layer-title',
        shadeClose: false,
        area: ['990px', '685px'],
        offset: '60px',
        skin: 'markBackGroundColor',
        shift: 6,
        btn: ['确定', '取消'],
        content: myShopListLayerPreview,
        yes: function (index) {
            layer.close(index);
            post("updateShopStatusByBaseId.view", true, {
                baseId: String(jsonObj.baseId),
                status: myShopListLayerPreview.find("select").val(),
                remark: myShopListLayerPreview.find('[name="remark"]').val(),
                cityCode: jsonObj.cityCode,
                baseName: jsonObj.baseName
            }, function (data) {
                if (data == 2) {
                    $html.success("审核成功!");
                    positionBaseConfig.queryPositionBase();
                } else {
                    $html.warning("审核失败!");
                }
            }, "", function () {
                $html.loading(true);
            }, function () {
                $html.loading();
            });
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
    previewMaps.isClearSearchMarker = true;
    previewMaps.search(jsonObj.address);
    previewMaps.centerAndZoom(jsonObj.lng, jsonObj.lat);
    previewMaps.setLocationArea(jsonObj.lng, jsonObj.lat);
    myShopListLayerPreview.find("select").val(1);
}

// 城市列表集合 省份列表集合 根据parentId连接 炒店类型集合
var confAreaList = [], provinceList = [], baseinfoTypeList = [];

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
}, "", function () {
    $html.loading(true);
}, function () {
    $html.loading();
});

/**
 * 获取炒店类型集合
 * 创建人:邵炜
 * 创建时间:2017年2月20日17:48:31
 */
post("selectBaseinfoTypeAll.view", false, "", function (data) {
    baseinfoTypeList = data;
}, "", function () {
    $html.loading(true);
}, function () {
    $html.loading();
});