/**
 * Created by hale on 2017/4/10.
 */

var shopUserBlacklist = function () {
    var getUrl = "queryShopBlackPhoneByPage.view",
        loginUser, loginUserDignity, dialogHeight,
        dbFileId = 0, dataTable = {}, obj = {};

    /**
     * 页面大小初始化
     */
    obj.initialize = function () {
        var winHeight = localStorage.getItem("winHeight");
        if (winHeight) {
            dialogHeight = winHeight - 100;
        } else {
            winHeight = $(window).height();
            dialogHeight = winHeight - 100;
            localStorage.setItem("winHeight", winHeight);
        }

        var $radioProvince = $("#radioProvince").parent("label");
        var $radioProvinceSpan = $radioProvince.find("span");
        var $radioCity = $("#radioCity").parent("label");
        var $radioCitySpan = $radioCity.find("span");
        var $blockLocationName = $("#blockLocationName");

        if (loginUser.businessHallIds === '') {
            if (loginUser.areaCode === 99999) { // 省级管理员
                $blockLocationName.hide();

                $radioCity.hide();
                $radioCitySpan.text("");

                $radioProvince.show();
                $radioProvinceSpan.text(loginUser.areaName);

                loginUserDignity = "province";
            } else {    // 地市管理员
                $blockLocationName.hide();

                $radioProvince.hide();
                $radioProvinceSpan.text("");

                $radioCity.show();
                $radioCitySpan.text(loginUser.areaName);

                loginUserDignity = "city";
            }
        } else {    // 营业厅管理员
            $radioProvince.hide();
            $radioProvinceSpan.text("");

            $radioCity.hide();
            $radioCitySpan.text("");

            $blockLocationName.show();

            loginUserDignity = "business";
        }

        if (loginUser.id == 101067) {
            $("#btnEffect").show();
        }

    }

    /**
     * 加载数据
     */
    obj.initData = function () {
        obj.initAreaSelect();
        obj.dataTableInit();
    }

    /**
     * 加载事件
     */
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddShopUserBlackList);
        $("#btnEffect").click(obj.evtOnEffectBlackList);
        $("#btnDeteleAll").click(obj.evtOnDeleteAll);
        $(".shop-tab div").click(obj.evtOnToggle);
    }

    /**
     * 时间控件初始化
     */
    obj.initDateTime = function () {
        $("[name='hideStartTime']").val(new Date().getDelayDay(1).format("yyyy-MM-dd"));
        $("[name='hideEndTime']").val(new Date().getDelayDay(8).format("yyyy-MM-dd"));
    }

    /**
     * 表格初始化
     */
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?phone=" + $.trim($("#txtQueryPhone").val()) + "&baseAreas=" + $("#selectQueryBaseAreas").val(),
                type: "POST"
            },
            columns: [

                {
                    data: "phone", title: "手机号", width: 80, className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        if (data) {
                            return data.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2')
                        }
                        return data;
                    }
                },
                {data: "hideContent", title: "免打扰范围", width: 150},
                {data: "hideStartTime", title: "开始时间", width: 100},
                {data: "hideEndTime", title: "失效时间", width: 100},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class='btn btn-danger btn-delete' title='删除' onclick='shopUserBlacklist.evtOnDelete(\"" + row.phone + "\",\"" + row.hideBases + "\");'><i class=\"fa fa-trash-o \"></i></a>";

                        // if (loginUser.businessHallIds === '') { // 省级管理员 地市管理员
                        //     if (row.hideArea == loginUser.areaCode) {
                        //         return $html;
                        //     }
                        // } else {    // 营业厅管理员
                        //     var businessHallIdsArray = loginUser.businessHallIds.splitWithoutBlank(',');
                        //     for (var i = 0; i < businessHallIdsArray.length; i++) {
                        //         if (businessHallIdsArray[i] == row.hideBases) {
                        //             return $html;
                        //         }
                        //     }
                        // }
                        // return "";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    /**
     * 查询
     */
    obj.evtOnQuery = function () {
        // dataTable.ajax.url(getUrl + "?phone=" + $.trim($("#txtQueryPhone").val()) + "$baseAreas=" + $("#selectQueryBaseAreas").val());
        // dataTable.ajax.reload();
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?phone=" + $.trim($("#txtQueryPhone").val()) + "&baseAreas=" + $("#selectQueryBaseAreas").val());
    }

    /**
     * 启用生效
     */
    obj.evtOnEffectBlackList = function () {
        globalRequest.iShop.flushShopBlack(true, {}, function (data) {
            if (!data || data.retValue != 0) {
                layer.alert(data.desc, {icon: 6});
            }
            layer.msg("启用生效成功");
        }, function () {
            layer.alert("启用生效失败", {icon: 6});
        })
    }

    /**
     * 新增用户黑名单
     */
    obj.evtOnAddShopUserBlackList = function () {
        obj.resetForm();
        $("#dialogShopUserBlackList").autoEmptyForm();
        obj.initDateTime();
        $(".file-browse-btn input[type=file]").unbind('click').unbind('change')
            .click(obj.evtOnFileClick).change(obj.evtOnFileChange);                     // 浏览点击事件、改变事件
        $(".file-upload-btn").unbind('click').click(obj.evtOnSubmitFile);               // 文件上传
        $("#selShieldType").unbind('change').change(obj.evtOnShieldTypeChange);         // 屏蔽类型下拉框 改变事件
        $("#blockLocationName").unbind('click').click(obj.evtOnChooseBlockLocation);    // 免打扰范围 点击事件

        $plugin.iModal({
            title: '新增炒店用户黑名单',
            content: $("#dialogShopUserBlackList"),
            area: ['650px', dialogHeight + "px"]
        }, function (index) {
            obj.evtOnSave(index);
        });
    }

    /**
     * 删除
     * @param phone 手机号
     */
    obj.evtOnDelete = function (phone, hideBase) {
        if (!phone || phone.length != 11) {
            layer.alert("未找到该数据，请稍后重试", {icon: 5});
            return;
        }
        var confirmIndex = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iShop.deleteShopUserBlackList(true, {phone: phone, businessCodes: hideBase}, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                dataTable.ajax.reload();
                layer.close(confirmIndex);
            }, function () {
                layer.alert("删除炒店用户黑名单失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 全部删除
     */
    obj.evtOnDeleteAll = function () {
        var confirmIndex = $html.confirm('确定删除全部数据吗？', function () {
            globalRequest.iShop.deleteAllShopUserBlackList(true, {}, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                dataTable.ajax.reload();
                layer.close(confirmIndex);
            }, function () {
                layer.alert("删除炒店用户黑名单失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 保存
     * @param index 弹窗索引
     */
    obj.evtOnSave = function (index) {
        var oData = $("#dialogShopUserBlackList").autoSpliceForm();

        // 导入方式
        var tabType = $(".shop-tab").find(".shop-tab-active").attr("data-type");
        if (tabType === "1") {
            if (!oData["phone"]) {
                layer.tips("手机号不能为空", $("[name='phone']"));
                $("[name='phone']").focus();
                return;
            }
            if (!/^1[3|4|5|6|7|8|9]\d{9}$/.test(oData["phone"])) {
                layer.tips("手机号格式不正确", $("[name='phone']"));
                $("[name='phone']").focus();
                return;
            }
        }

        // 屏蔽类型
        var shieldType = $("#selShieldType").val();
        if (shieldType === "1") {
            var dateArray = obj.getShieldTime();
            oData["hideStartTime"] = dateArray[0];
            oData["hideEndTime"] = dateArray[1];
        }

        // 登录人身份判断
        if (loginUserDignity === "province" || loginUserDignity === "city") {
            oData["hideArea"] = loginUser.areaCode;
            oData["hideBases"] = "";
        } else {
            oData["hideArea"] = "";
            if (!$("#blockLocationName").val() || !$("[name='hideBases']").val()) {
                layer.tips("免打扰范围不能为空", $("#blockLocationName"));
                $("#blockLocationName").focus();
                return;
            }
        }

        // 判断开始时间 结束时间
        if (oData["hideStartTime"].getDateNumber() - oData["hideEndTime"].getDateNumber() > 0) {
            layer.tips("开始时间不能大于结束时间", $("[name='hideEndTime']"));
            $("[name='hideEndTime']").focus();
            return;
        }

        if (tabType === "1") {   // 单个号码
            delete oData["file"];
            globalRequest.iShop.createShopUserBlackList(true, oData, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                dataTable.ajax.reload();
                layer.close(index);
            }, function () {
                layer.alert("新增炒店用户黑名单失败", {icon: 5});
            }, function () {
                $html.loading(true);
            }, function () {
                $html.loading(false);
            })
        } else if (tabType === "2") {   // 批量导入
            if (dbFileId === 0) {
                layer.alert("请先上传文件", {icon: 5});
                return;
            }
            oData["dbFileId"] = dbFileId;
            globalRequest.iShop.createMoreShopUserBlackList(true, oData, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                dataTable.ajax.reload();
                layer.close(index);
            }, function () {
                layer.alert("新增炒店用户黑名单失败", {icon: 5});
            }, function () {
                $html.loading(true);
            }, function () {
                $html.loading(false);
            })
        }
    }

    /**
     * tab标签切换
     */
    obj.evtOnToggle = function () {
        $(this).removeClass('shop-tab-active').addClass('shop-tab-active').siblings('div.col-md-6').removeClass('shop-tab-active');
        switch ($(this).attr("data-type")) {
            case "1":
                $(".batch-row").hide();
                $(".explain div:not(:first-child)").hide();
                $(".explain div:first-child").text("当日新增的用户黑名单次日生效");
                $(".single-row").show();
                break;
            case "2":
                $(".single-row").hide();
                $(".batch-row").show();
                $(".explain div:not(:first-child)").show();
                $(".explain div:first-child").text("1、当日新增的用户黑名单次日生效");
                break;
        }
    }

    /**
     * 浏览点击事件
     */
    obj.evtOnFileClick = function () {
        $(this).val("");
        $(".file-name").val("");
    }

    /**
     * 浏览改变事件
     * @param e 事件对象
     */
    obj.evtOnFileChange = function (e) {
        try {
            $(".file-name").val("");
            var src = e.target.value;
            var fileName = src.substring(src.lastIndexOf('\\') + 1);
            var fileExt = fileName.replace(/.+\./, "");
            if (fileExt !== "xlsx" && fileExt !== "xls") {
                layer.msg("请选择模板规定的.xlsx或.xls文件!");
                return;
            }
            $(".file-name").val(fileName);
        } catch (e) {
            console.log("file selected error");
        }
    }

    /**
     * 文件上传
     */
    obj.evtOnSubmitFile = function () {
        var $form = $(".shop-form form");
        var $file = $form.find("input[type=file]");
        if ($file.val() == "") {
            layer.msg("请选择文件!");
            return;
        } else if ($file.val().indexOf(".xlsx") < 0 && $file.val().indexOf(".xls") < 0) {
            layer.msg("请选择模板规定的.xlsx或.xls文件!");
            return;
        }
        var options = {
            type: 'POST',
            url: 'importShopUserBlackListFile.view',
            dataType: 'json',
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (data) {
                $html.loading(false)
                if (!data || data.retValue != "0") {
                    layer.alert("创建失败:" + data.desc);
                }
                dbFileId = data.fileId;
                layer.msg(data.desc);
            }
        }
        $form.ajaxSubmit(options);
    }

    /**
     * 屏蔽类型下拉框切换
     */
    obj.evtOnShieldTypeChange = function () {
        if ($(this).val() == "1") {
            $("[name='hideStartTime']").hide();
            $("[name='hideEndTime']").hide();
            $("#mark").hide();
            $("#selShieldTime").show();
        } else {
            $("#selShieldTime").hide();
            $("[name='hideStartTime']").show();
            $("[name='hideEndTime']").show();
            $("#mark").show();
        }
    }

    /**
     * 免打扰范围选择
     */
    obj.evtOnChooseBlockLocation = function () {
        $("#btnQueryLocation").unbind('click').click(obj.initMultiSelect);

        $('.js-multiselect').multiselect({
            right: '#multiselectRight',
            rightAll: '#btnRightAll',
            rightSelected: '#btnRightSign',
            leftSelected: '#btnLeftSign',
            leftAll: '#btnLeftAll'
        });
        obj.initMultiSelect();

        $plugin.iModal({
            title: '选择免打扰范围',
            content: $("#dialogLocation"),
            area: ['650px', dialogHeight + "px"]
        }, function (index) {
            var $blockLocationName = $("#blockLocationName");
            var $blockLocationId = $("[name='hideBases']");
            var $rightSelect = $("#multiselectRight option");
            var locationIds = [], locationNames = '';
            if ($rightSelect && $rightSelect.length > 0) {
                for (var i = 0; i < $rightSelect.length; i++) {
                    locationIds += $($rightSelect[i]).val() + ",";
                    locationNames += $($rightSelect[i]).text() + ",";
                }
            }
            if (locationIds && locationIds.length > 0) {
                locationIds = locationIds.substring(0, locationIds.length - 1);
            }
            if (locationNames && locationNames.length > 0) {
                locationNames = locationNames.substring(0, locationNames.length - 1);
            }
            $blockLocationId.val(locationIds);
            $blockLocationName.val(locationNames);
            layer.close(index);
        });
    }

    /**
     * 免打扰范围的下拉框
     */
    obj.initMultiSelect = function () {
        var paras = {
            baseAreaId: loginUser.areaCode,
            baseName: $.trim($("#txtQueryBaseName").val())
        };
        globalRequest.iShop.queryShopBlockBases(false, paras, function (data) {
            if (data) {
                var $leftSelect = $(".js-multiselect");
                var $rightSelect = $("#multiselectRight");
                $leftSelect.empty();
                $rightSelect.empty();

                var locationIdsArray = $("[name='hideBases']").val().splitWithoutBlank(',');
                var locationNamesArray = $("#blockLocationName").val().splitWithoutBlank(',');

                if (locationIdsArray && locationIdsArray.length > 0) {  // 将已选营业厅加入 左边的下拉框
                    // 比较库里数据和已选中的数据
                    // 相同的数据放已选营业厅
                    // 不同的数据放可选营业厅
                    var sameData = obj.arraySame(locationIdsArray, data.items);
                    var diffData = obj.arrayDiff(sameData, data.items);
                    for (var i = 0; i < locationIdsArray.length; i++) {
                        $rightSelect.append("<option value='" + locationIdsArray[i] + "' title='" + locationNamesArray[i] + "'>" + locationNamesArray[i] + "</option>");
                    }
                    for (var j = 0; j < diffData.length; j++) {
                        $leftSelect.append("<option value='" + diffData[j].id + "' title='" + diffData[j].name + "'>" + diffData[j].name + "</option>");
                    }
                } else {    // 将未选营业厅加入 右边的下拉框
                    for (var i = 0; i < data.items.length; i++) {
                        $leftSelect.append("<option value='" + data.items[i].id + "' title='" + data.items[i].name + "'>" + data.items[i].name + "</option>");
                    }
                }
            }
        }, function () {
            layer.alert("加载免打扰范围数据异常", {icon: 6});
        })
    }

    /**
     * 搜索栏的地区下拉框
     */
    obj.initAreaSelect = function () {
        var $baseAreaSelect = $("#selectQueryBaseAreas");
        globalRequest.iShop.queryShopBlackBaseAreas(false, {}, function (data) {
            $baseAreaSelect.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == areaCode) {
                        $baseAreaSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $baseAreaSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    }

    /**
     * 获取屏蔽时长
     * @returns {[*,*]} 数组 [开始时间,结束时间]
     */
    obj.getShieldTime = function () {
        var startTime = new Date().getDelayDay(1).format("yyyy-MM-dd");
        var endTime = "";
        var shieldTime = $("#selShieldTime").val();
        switch (shieldTime) {
            case "1":
                endTime = obj.addMoth(startTime, 1);
                break;
            case "3":
                endTime = obj.addMoth(startTime, 3);
                break;
            case "6":
                endTime = obj.addMoth(startTime, 6);
                break;
            case "12":
                endTime = obj.addMoth(startTime, 12);
                break;
            default:
                endTime = new Date().getDelayDay(8).format("yyyy-MM-dd");
                break;
        }
        return [startTime, endTime];
    }

    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            $("#loginUser").val(data.loginUser.id);
            loginUser = data.loginUser;
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }

    /**
     * 重置表单
     */
    obj.resetForm = function () {
        var tabSingle = $($(".shop-tab div")[0]);
        var fileName = $(".file-name");
        var file = $(".file-browse-btn input[type=file]");
        var selShieldType = $("#selShieldType");
        var selShieldTime = $("#selShieldTime");
        var blockLocationName = $("#blockLocationName");
        var hideBases = $("[name='hideBases']");

        tabSingle.click();
        fileName.val("");
        file.val("");
        obj.initDateTime();
        selShieldType.val("1").change();
        selShieldTime.val("1");
        blockLocationName.val("");
        hideBases.val("");
    }

    /**
     * 找出2个数组的相同部分
     *
     * @param dataOne 数组
     * @param dataTwo 数组
     * @returns {Array} 返回相同内容的数组
     */
    obj.arraySame = function (dataOne, dataTwo) {
        var newData = [];
        for (var i = 0; i < dataTwo.length; i++) {
            for (var j = 0; j < dataOne.length; j++) {
                if (dataOne[j] == dataTwo[i].id) {
                    newData.push(dataTwo[i]);
                    break;
                }
            }
        }
        return newData;
    }

    /**
     * 找出2个数组的不同部分
     *
     * @param dataOne 数组
     * @param dataTwo 数组
     * @returns {Array} 返回不同内容的数组
     */
    obj.arrayDiff = function (dataOne, dataTwo) {
        var temp = [], tempArray = [];
        for (var i = 0; i < dataOne.length; i++) {
            temp[dataOne[i].id] = true;
        }
        for (var i = 0; i < dataTwo.length; i++) {
            if (!temp[dataTwo[i].id]) {
                tempArray.push(dataTwo[i]);
            }
        }
        return tempArray;
    }

    /**
     * 日期按月份增加
     *
     * @param date date对象
     * @param m 月份的数字
     * @returns {string} 增加后的日期
     */
    obj.addMoth = function (date, m) {
        var ds = date.split('-'), _d = ds[2] - 0;
        var nextM = new Date(ds[0], ds[1] - 1 + m + 1, 0);
        var max = nextM.getDate();
        date = new Date(ds[0], ds[1] - 1 + m, _d > max ? max : _d);
        var targetDate = date.format("yyyy-MM-dd").split('-');
        return targetDate[0] + '-' + targetDate[1] + '-' + targetDate[2];
    }

    return obj;
}()

function onLoadBody() {
    shopUserBlacklist.getLoginUser();
    shopUserBlacklist.initialize();
    shopUserBlacklist.initData();
    shopUserBlacklist.initEvent();
}




