/**
 * Created by chang on 2017/6/12.
 */

/**
 * 取地市列表信息
 */

function initCityInfo() {
    var list = [];
    globalRequest.queryBaseAreas(false, {}, function (data) {
        list = data
    }, function () {
        layer.alert("系统异常，获取位置场景营业厅类型失败", {icon: 6});
    });
    return list
}

/**
 * 获取城市列表
 * 创建人:邵炜
 * 创建时间:2017年2月20日17:07:57
 */
var provinceList1 = [], confAreaList1 = [], defaultLng = '', defaultLat = ''
post("selectConfAreaList.view", false, "", function (data) {
    data.forEach(function (item) {
        if (item.parentId === 0) {
            provinceList1.push(item)
        } else {
            confAreaList1.push(item);
        }
    });
}, "", function () {
    $html.loading(true);
}, function () {
    $html.loading();
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
            $("#shopTempTask .layerAddOrUpdate .lngValue").val(p.lng);
            $("#shopTempTask .layerAddOrUpdate .latValue").val(p.lat);
            pointGetMyCityDistrict(p);
        },
        onDraggingCallBack: function (e) {
            var p = e.point;
            $("#shopTempTask .layerAddOrUpdate .lngValue").val(p.lng);
            $("#shopTempTask .layerAddOrUpdate .latValue").val(p.lat);
            pointGetMyCityDistrict(p);
        },
        changeTitleEmptyMessage: function (number) {
            var explainTitleObj = $("#shopTempTask .layerAddOrUpdate .explain:eq(0)");
            explainTitleObj.html((number === 0 ? "您输入的地址在地图上查询失败，请重新输入！" : ""));
            if (number === 0) {
                $("#shopTempTask .layerAddOrUpdate .lngValue").val("");
                $("#shopTempTask .layerAddOrUpdate .latValue").val("");
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
        var citySelectJq = $('#shopTempTask .layerAddOrUpdate [name="cityAreaCode"]');
        citySelectJq.val(f.addressComponents.city);
        // addMaps.centerAndZoom(point.lng, point.lat);
        // addMaps.setLocationArea(point.lng, point.lat);
        // citySelectJq.change();
        var districtJq = $('#shopTempTask .layerAddOrUpdate .district');
        districtJq.val(f.addressComponents.district);
    });
}

/**
 * 营业厅地址框发生变动实时检索地图
 * 创建人:邵炜
 * 创建时间:2017年2月17日10:56:08
 */
// $('#shopTempTask .layerAddOrUpdate [name="address"]').keyup(function () {
//     addMaps.search(this.value);
// });
// 默认将城市选择框选择第一个
function setDefultCity() {
    $('#shopTempTask .layerAddOrUpdate [name="cityAreaCode"]').val(821).change();
}


/**
 * 城市选择框发生变动赋值
 * 创建人:邵炜
 * 创建时间:2017年2月20日17:59:41
 */
$('#shopTempTask .layerAddOrUpdate [name="cityAreaCode"]').change(function () {
    var cityElement = this;
    var confAreaList = initCityInfo()
    var districtJq = $(cityElement).next();
    districtJq.find("*").remove();
    confAreaList.forEach(function (model) {
        if (cityElement.value == model.parentId) {
            districtJq.append('<option value="{0}">{1}</option>'.format(model.id, model.name));
        }
    });
});

var shopTemporaryTask = function () {
    var listUrl = 'queryShopTempTaskByPage.view', obj = {}, loginUser = {}
    /**
     * 列表筛选页面地市下拉框赋值
     */
    obj.cityAppendOption = function () {
        var $baseAreaTypeSelect = $("#qryBaseAreas")
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
            layer.alert("系统异常，获取位置场景营业厅类型失败", {icon: 6});
        });
    }

    /**
     * 获取我的炒店集合
     */
    obj.dataTableInit = function (data) {
        status = data;
        obj.getLoginUser()
        var baseId = $("#qrybaseId").val();
        var projectName = $("#projectName").val();
        var baseArea = $("#qryBaseAreas").val();
        var taskType = $("#taskTypeFilter").val();
        var beginTime = $("#creatDateTime").val();
        var endTime = $("#endDateTime").val();
        var loginUserId = loginUser.id;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: listUrl + "?baseId=" + baseId + "&projectName=" + projectName + "&baseArea=" + baseArea + "&taskType=" + taskType + "&beginTime=" + beginTime,
                type: "POST"
            },
            columns: [
                {data: "id", title: "任务ID", className: "dataTableFirstColumns", visible: false},
                {data: "taskName", title: '项目名称', width: 120},
                {
                    data: "baseAreaName", width: 100, title: "来源", className: "centerColumns",
                    render: function (data, type, row) {
                        return "<i class='fa' onmouseover='shopTemporaryTask.hoverBaseNames(this, " + row.id + "," + row.taskClassifyId + ")'>" + row.baseAreaName + "</i>";
                    }
                },
                {
                    data: "taskClassifyId", width: 150, title: "业务类型", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.taskClassifyId == 1) {
                            return "<i class='fa'>炒店业务</i>";
                        } else if (row.taskClassifyId == 2) {
                            return "<i class='fa'>临时摊点（校园）</i>";
                        } else if (row.taskClassifyId == 3) {
                            return "<i class='fa'>临时摊点（集客）</i>";
                        } else if (row.taskClassifyId == 4) {
                            return "<i class='fa'>临时摊点（公众）</i>";
                        }
                    }
                },
                {data: "startTime", title: '开始时间', width: 100, className: "centerColumns"},
                {data: "stopTime", title: '结束时间', width: 100, className: "centerColumns"},
                {data: "createTimeStr", title: '配置时间', width: 100},
                {
                    data: "marketUser", width: 100, title: "目标用户", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.marketUser == 1) {
                            return "<i class='fa'>常驻</i>";
                        } else if (row.marketUser == 2) {
                            return "<i class='fa'>流动拜访</i>";
                        } else if (row.marketUser == 3) {
                            return "<i class='fa' style='color: green;'>常驻+流动拜访</i>";
                        } else if (row.marketUser == 4) {
                            return "<i class='fa' style='color: red;'>个性化推荐</i>";
                        }
                    }
                },
                {
                    data: "status", width: 80, title: "状态", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa'>草稿</i>";
                        } else if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>待审核</i>";
                        } else if (row.status == 2) {
                            return "<i class='fa' style='color: green;'>审核成功</i>";
                        } else if (row.status == 3) {
                            return "<i class='fa' style='color: red;' onmouseover='shopTemporaryTask.hoverDecisionDesc(this, " + row.id + ")'>审核拒绝</i>";
                        } else if (row.status == 4) {
                            return "<i class='fa' style='color: blue;'>已暂停</i>";
                        } else if (row.status == 5) {
                            return "<i class='fa' style='color: blue;'>已失效</i>";
                        } else if (row.status == 6) {
                            return "<i class='fa' style='color: red;'>已终止</i>";
                        } else if (row.status == 20 || row.status == 30) {
                            return "<i class='fa' style='color: blue;'>营销处理中</i>";
                        } else if (row.status == 23 || row.status == 21 || row.status == 24) {
                            return "<i class='fa' style='color: blue;'>营销成功</i>";
                        } else if (row.status == 17 || row.status == 18 || row.status == 19 || row.status == 16 || row.status == 22) {
                            return "<i class='fa' style='color: red;'>营销失败</i>";
                        }
                    }
                },
                {
                    width: 160, className: "centerColumns", title: "操作",
                    render: function (data, type, row) {
                        var $buttons = "";
                        var rowStr = JSON.stringify(row) + ''
                        var $editBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='编辑' onclick='shopTemporaryTask.editShopTempTask(" + rowStr + ")'>编辑</a>";
                        var $deleteBtnHtml = "<a id='btndel' class='btn btn-danger btn-delete btn-sm' title='删除' onclick='shopTemporaryTask.delShopTempTask(\"" + row.id + "\")'>删除</a>";
                        var $viewBtnHtml = "<a id='btnView' class='btn btn-success btn-preview btn-sm' title='预览' onclick='shopTemporaryTask.viewShopTempTask(" + rowStr + ")'>预览</a>";
                        var $reminderHtml = "<a id='btnReminder' class='btn btn-warning btn-edit btn-sm' title='催单提醒' onclick='shopTemporaryTask.reminderItem(\"" + row.id + "\",\"" + row.taskName + "\")'>催单</a>";
                        var $pauseHtml = "<a id='btnPause' class='btn btn-warning btn-edit btn-sm' title='一键终止任务' onclick='shopTemporaryTask.pauseItem(\"" + row.id + "\",\"" + row.taskName + "\")'>终止</a>";
                        if (status == 2) {
                            if (row.status == 4 || row.status == 2 || row.status == 17 || row.status == 18 || row.status == 19 || row.status == 16 || row.status == 22) {
                                if (loginUser.businessHallIds != '') {
                                } else {
                                    $buttons = $viewBtnHtml;
                                }
                            } else if (row.status == 30) {
                            } else if (row.status == 23 || row.status == 21 || row.status == 24) {
                                $buttons = $viewBtnHtml;
                            }
                        } else {
                            if (loginUserId == row.createUser && (row.status == 1 || row.status == 3)) {
                                $buttons = $editBtnHtml + $deleteBtnHtml;
                            }
                            $buttons += $viewBtnHtml;
                            // 省级或地市级管理员有一键终止的权限
                            if (loginUser.businessHallIds == '' && row.status != 6) {
                                $buttons += $pauseHtml;
                            }
                        }
                        // 审批中，有催单功能
                        if (row.status == 1 && loginUserId == row.createUser) {
                            $buttons += $reminderHtml;
                        }
                        return $buttons;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    /**
     * 数据筛选
     */
    obj.queryShopTask = function () {
        var baseId = $("#qrybaseId").val();
        var projectName = $("#projectName").val();
        var baseArea = $("#qryBaseAreas").val();
        var taskType = $("#taskTypeFilter").val();
        var creatTime = $.trim($("#creatDateTime").val());
        var endTime = $.trim($("#endDateTime").val());
        dataTable.ajax.url(listUrl + "?baseId=" + baseId + "&projectName=" + projectName + "&baseArea=" + baseArea + "&taskType=" + taskType + "&beginTime=" + creatTime);
        dataTable.ajax.reload();
    }
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
            if (parseInt(loginUser.areaId) !== 99999) {
                $('#createShopTempTask').show()
            }
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    /**
     *  显示任务池来源字段浮动窗口
     */
    obj.hoverBaseNames = function (element, id, typeId) {
        if (id <= 0) {
            return;
        }
        globalRequest.queryShopTaskByIdForHover(true, {id: id, taskClassifyId: typeId}, function (data) {
            if (data && data.shopTaskDomain) {
                var baseCodesArray = data.shopTaskDomain.baseCodes ? data.shopTaskDomain.baseCodes.split(',') : ['空'];
                var $tips = baseCodesArray[0]
                layer.tips($tips, $(element), {
                    tips: [1, '#00B38B'],
                    time: 2500
                });
            }
        })
    }
    // 显示审核拒绝原因浮动窗口
    obj.hoverDecisionDesc = function (element, id) {
        if (id <= 0) {
            return;
        }
        globalRequest.iShop.queryShopTaskAuditReject(true, {taskId: id}, function (data) {
            if (data && data.reason) {
                layer.tips(data.reason, $(element), {
                    tips: [1, '#00B38B'],
                    time: 1500
                });
            }
        })
    }
    /**
     *  催单事件
     */
    obj.reminderItem = function (id, taskName) {
        layer.confirm('确认提醒审批人审批任务:' + taskName + "?", function (index) {
            globalRequest.reminderItem(true, {id: id, taskName: taskName}, function (data) {
                if (data.retValue == 0) {
                    obj.queryShopTask();
                    layer.msg("提醒审批任务成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }), function () {
                layer.alert('提醒审批失败');
            };
        });
    }
    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        // 筛选
        $('#shopTempTaskButton').click(function () {
            shopTemporaryTask.queryShopTask()
        })
        //新建炒店临时任务
        $("#createShopTempTask").click(function () {
            obj.createShopTempTask('新增炒店临时任务');
        });
    }
    /**
     * 新建炒店临时任务
     */
    obj.createShopTempTask = function (name, dataObj) {
        var layerAddOrUpdateJq = $('#shopTempTask .layerAddOrUpdate');
        layerAddOrUpdateJq.find('#baseName').removeAttr("disabled");
        layerAddOrUpdateJq.find('#taskType').removeAttr("disabled");
        // layerAddOrUpdateJq.find('#mobile').removeAttr("disabled");
        obj.getPhone()
        addMaps.positioningCity = loginUser.areaName
        layer.open({
            type: 1,
            shade: 0.3,
            title: name,
            skin: 'markBackGroundColor',
            shadeClose: false,
            area: ['1100px', '630px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: layerAddOrUpdateJq,
            yes: function (index) {
                shopTemporaryTask.insertShopTempTask(index, '新增')
            },
            cancel: function (index) {
                layer.close(index);
            }
        });
        $(".layui-layer-shade:not(:first)").remove();
        layerAddOrUpdateJq.autoEmptyForm();
        layerAddOrUpdateJq.autoAssignmentForm(dataObj);

        // 因19大召开 江苏版本 临时修改 国内漫入不可选
        if ($system.getProvince() === $system.PROVINCE_ENUM.JS) {
            $("#nation").attr('disabled', 'true')
        }

        if (dataObj) {
            if (dataObj.address && !dataObj.lng) {
                //addMaps.isClearSearchMarker = true;
                addMaps.search(dataObj.address);
            }
            // 初始化经纬度和所属区县信息
            layerAddOrUpdateJq.find('[name="cityAreaCode"]').change().next().val(dataObj.districtCode);
            addMaps.centerAndZoom(dataObj.lng, dataObj.lat);
            addMaps.setLocationArea(dataObj.lng, dataObj.lat);
        } else {
            addMaps = addMaps.reset();
            addMaps.search();
            // 初始化有效期信息
            layerAddOrUpdateJq.find('#validBeginDateTime').val(addDate(new Date()))
            layerAddOrUpdateJq.find('#validEndDateTime').val(addDate(new Date(), 30))
            layerAddOrUpdateJq.find('#smsContent').val('')
            $(".layerAddOrUpdate [name='quotaNumber']").val(50000);
            $(".layerAddOrUpdate [name='radius']").val(1000);
        }
        // 初始化 监控类型选中事件
        var $marketType = $('#marketUserType')
        var $marketArea = $('#marketArea')
        $('#city').attr('disabled', 'true')
        $marketType.find(':checkbox').change(function () {
            // 首先取当前操作的复选框内的值，在判断当前值是否选中
            var ischecked_1 = $marketType.find('#marketUser1').is(':checked')
            var ischecked_2 = $marketType.find('#marketUser2').is(':checked')
            // 常驻 选中，流动拜访不选中，监控范围都不选，且都不可选
            // 流动拜访选中，默认本市用户选中，且必须选中一个
            if (ischecked_1 && !ischecked_2) {
                $marketArea.find(':checkbox').each(function (i, x) {
                    $(x).attr('disabled', 'true')
                    $(x).removeAttr('checked')
                })
            } else if (ischecked_2 && ischecked_1) {
                $marketArea.find(':checkbox').each(function (i, x) {
                    $(x).removeAttr('disabled')
                    if ($(x).attr('id') === 'city') {
                        x.checked = true
                    }
                })
            }
            // 因19大召开 江苏版本 临时修改 国内漫入不可选
            if ($system.getProvince() === $system.PROVINCE_ENUM.JS) {
                $("#nation").attr('disabled', 'true')
            }
        })
        // 根据经纬度进行打点
        $('#queryLocation').click(function () {
            var lngValue = $('#shopTempTask').find('#lngValue').val()
            var latValue = $('#shopTempTask').find('#lat').val()
            if (!lngValue || $.trim(lngValue).length < 1) {
                layer.tips('经度不能为空!', $html.find("#lngValue"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            if (!latValue || $.trim(latValue).length < 1) {
                layer.tips('纬度不能为空!', $html.find("#lat"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            //wgs84转百度坐标进行打点
            var ret = coordtransform.wgs84tobd09(lngValue, latValue);
            addMaps.setLocationArea(ret[0], ret[1]);
            // 根据经纬度打点出来的地址，将详细地址赋值到 【场馆地址】
            addMaps.getLocation(ret[0], ret[1], function (f) {
                var address = ''
                if (f.addressComponents && f.addressComponents.street && f.addressComponents.streetNumber) {
                    address = f.addressComponents.street + f.addressComponents.streetNumber
                } else {
                    address = f.business
                }
                console.log('f:', f)
                $('#shopTempTask').find('#address').val(address)
            })
        })
        // 根据详细地址打点
        $('#queryAddress').click(function () {
            var address = $('#shopTempTask').find('#address').val()
            if (!address || $.trim(address).length < 1) {
                layer.tips('场馆地址不能为空!', $html.find("#address"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            addMaps.search(address);
        })
    }
    /**
     * 一键终止事件
     */
    obj.pauseItem = function (id, taskName) {
        layer.confirm('确认暂停所有营业厅该任务：' + taskName + "? 该操作不可恢复！！", function (index) {
            globalRequest.pauseTempItem(true, {id: id, taskName: taskName}, function (data) {
                if (data.retValue == 0) {
                    obj.queryShopTask();
                    layer.msg("终止任务成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }), function () {
                layer.alert('终止任务失败');
            };
        });
    }
    /**
     * 插入临时任务数据
     */
    obj.insertShopTempTask = function (index, msg) {
        var model = obj.shopTempTaskModel()
        if (obj.verifycationModel(model)) {
            $html.loading(true);
            globalRequest.createShopTempTaskRequ(true, model, function (data) {
                $html.loading(false);
                if (parseInt(data.retValue) === 0) {
                    layer.close(index);
                    obj.queryShopTask();
                    layer.msg(msg + "成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                $html.loading(false);
                layer.alert("系统异常", {icon: 6});
            })
        }
    }
    /**
     * 取新增或者编辑对象
     * @returns {{name: (*|{}), quota: (*|{}), taskType: (*|{}), validBeginDateTime: (*|{}), validEndDateTime: (*|{}), locationTypeId: (*|{}), address: (*|{}), cityAreaCode: (*|{}), districtCode: (*|{}), monitorType: (*|{}), mobile: (*|{}), smsContent: (*|{})}}
     */
    obj.shopTempTaskModel = function () {
        var $objElement = $('#shopTempTask .layerAddOrUpdate');
        var cityId = 0, cityCode = 0
        var confAreaId = 0
        confAreaList1.forEach(function (item) {
            if (item.name == $objElement.find('[name="cityAreaCode"]').val()) {
                cityId = item.id
                cityCode = item.code
            }
            // 模糊匹配区县
            var regArea = $objElement.find('[name="districtCode"]').val()
            regArea = regArea.substring(0, regArea.length - 1)
            console.log('regArea:', regArea)
            if (item.name.indexOf(regArea) > -1) {
                confAreaId = item.id
            }
        })
        // 监控类型
        var marketArray = [], marketUser = 0
        var $marketType = $objElement.find('#marketUserType')
        $marketType.find('[type="checkbox"]:checked').each(function (index, element) {
            if ($(element).val()) {
                marketArray.push($(element).val())
            }
        })
        if (marketArray.length > 0 && marketArray.length < 2) {
            marketUser = parseInt(marketArray[0])
        } else if (marketArray.length === 2) {
            marketUser = 3
        }
        // 监控范围
        var $marketArea = $('#marketArea')
        var manruRange = ''
        $marketArea.find(':checkbox').each(function (i, x) {
            if ($(x).is(':checked')) {
                var item = $(x).val()
                manruRange += item
            } else {
                manruRange += '0'
            }
        })
        // 百度坐标转wgs84坐标(作废)
        var lng = $objElement.find('#lngValue').val()
        var lat = $objElement.find('#lat').val()
        //var ret = coordtransform.bd09towgs84(lng, lat)
        //lng = ret[0]
        //lat = ret[1]
        return {
            taskName: $objElement.find('#baseName').val(), // 项目名称
            marketLimit: parseInt($objElement.find('#quotaNumber').val()), // 任务发送配额
            taskClassifyId: parseInt($objElement.find('#taskType').val()), // 类型
            startTime: $objElement.find('#validBeginDateTime').val(), // 有效期开始时间
            stopTime: $objElement.find('#validEndDateTime').val(), // 有效期而结束时间
            sendInterval: parseInt($objElement.find('#locationTypeId').val()), // 营销间隔
            addressDetail: $objElement.find('#address').val(), // 场馆地址
            longitude: lng, // 经度
            latitude: lat, // 纬度
            radius: $objElement.find('#radius').val(), // 半径
            baseAreaName: $objElement.find('[name="cityAreaCode"]').val(), // 所属地市
            monitorArea: $objElement.find('[name="districtCode"]').val(), // 所属区县
            marketUser: marketUser, // 监控类型
            accessNumber: $objElement.find('#mobile').val(), // 接入号
            marketContentText: $objElement.find('#smsContent').val(), // 短信内容
            cityId: cityId,
            cityCode: cityCode,
            areaId: confAreaId,
            manruRange: manruRange
        }
    }
    obj.verifycationModel = function (model) {
        var $html = $('#shopTempTask .layerAddOrUpdate');
        if (!model.taskName || $.trim(model.taskName).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('项目名称不能为空!', $html.find("#baseName"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.marketLimit || parseInt(model.marketLimit) < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('任务发送配额必须大于0!', $html.find("#quotaNumber"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.startTime) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('有效期开始时间不能为空!', $html.find("#validBeginDateTime"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.stopTime) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('有效期结束时间不能为空!', $html.find("#validEndDateTime"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (Date.parse(new Date(model.startTime)) / 1000 > Date.parse(new Date(model.stopTime)) / 1000) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('有效期结束时间必须 大于或等于 有效期开始时间!', $html.find("#validEndDateTime"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.addressDetail || $.trim(model.addressDetail).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('场馆地址不能为空!', $html.find("#address"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.longitude || $.trim(model.longitude).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('经度不能为空!', $html.find("#lngValue"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.latitude || $.trim(model.latitude).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('纬度不能为空!', $html.find("#lat"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.radius || $.trim(model.radius).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('半径不能为空!', $html.find("#radius"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        } //
        if (!(/(^[1-9]\d*$)/.test(model.radius))) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('半径只能为大于0的整数!', $html.find("#radius"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!model.accessNumber || $.trim(model.accessNumber).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('接入号不能为空!', $html.find("#mobile"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!(/(^[1-9]\d*$)/.test(model.accessNumber)) || model.accessNumber.length > 20) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('接入号为不超过20位的数字!', $html.find("#mobile"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (model.marketUser < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('请勾选监控类型!', $html.find(".marketUser2"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (model.marketUser === 2 || model.marketUser === 3) {
            if (model.manruRange === '' || model.manruRange === '000') {
                layer.tips('请勾选监控范围!', $html.find("#city"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
        }
        if (!model.marketContentText || $.trim(model.marketContentText).length < 1) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('短信内容不能为空!', $html.find("#smsContent"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        var lng = $html.find('#lngValue').val()
        var lat = $html.find('#lat').val()
        if (!lng || $.trim(lng).length < 1 || !lat || $.trim(lat).length < 1) {
            layer.tips('您输入的场馆地址无效，请重新输入!', $html.find("#lat"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if ((DateDiff(model.startTime + ' 00:00:00', model.stopTime + ' 23:59:59')) > 30) {
            $('.layui-layer-content').scrollTop(0, 0)
            layer.tips('有效期最长为30天!', $html.find("#validEndDateTime"), {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        return true
    }
    /**
     * 临时任务编辑
     * @param id
     * @param status
     */
    obj.editShopTempTask = function (model) {
        var $objElement = $('#shopTempTask .layerAddOrUpdate');
        $objElement.find('#baseName').attr("disabled", "disabled");
        $objElement.find('#taskType').attr("disabled", "disabled");
        // $objElement.find('#mobile').attr("disabled", "disabled");
        try {
            $objElement.find('#baseName').val(model.taskName || '')
            $objElement.find('#validBeginDateTime').val(model.startTime)
            $objElement.find('#validEndDateTime').val(model.stopTime)
            $objElement.find('#address').val(model.addressDetail)
            $objElement.find('[name="cityAreaCode"]').val(model.baseAreaName)
            $objElement.find('[name="districtCode"]').val(model.monitorArea)
            $objElement.find('#radius').val(model.radius)

            if (parseInt(model.marketUser) === 1) {
                // $objElement.find('#marketUser1').attr("checked", true);
                $objElement.find('#marketUser2').attr('checked', false)
            } else if (parseInt(model.marketUser) === 2) {
                $objElement.find('#marketUser1').attr('checked', false)
                // $objElement.find('#marketUser2').attr('checked', true)
            }
            else if (parseInt(model.marketUser) === 3) {
                $objElement.find('#marketUser1').attr('checked', true)
                $objElement.find('#marketUser2').attr('checked', true)
            }
            if (parseInt(model.marketUser) === 3 || parseInt(model.marketUser) === 2) {
                // 先重置所有
                $('#marketArea').find(':checkbox').each(function (i, x) {
                    x.checked = true
                })
                if (model.manruRange == '001') {
                    $objElement.find('#nation').attr('checked', false)
                    $objElement.find('#province').attr('checked', false)
                } else if (model.manruRange == '011') {
                    $objElement.find('#nation').attr('checked', false)
                } else if (model.manruRange == '000') {
                    $objElement.find('#nation').attr('checked', false)
                    $objElement.find('#province').attr('checked', false)
                    $objElement.find('#city').attr('checked', false)
                } else if (model.manruRange == '101') {
                    $objElement.find('#province').attr('checked', false)
                } else if (model.manruRange == '100') {
                    $objElement.find('#province').attr('checked', false)
                    $objElement.find('#city').attr('checked', false)
                } else if (model.manruRange == '110') {
                    $objElement.find('#city').attr('checked', false)
                }
            } else {
                $objElement.find('#nation').attr('disabled', 'true')
                $objElement.find('#province').attr('disabled', 'true')
                $objElement.find('#city').attr('disabled', 'true')
            }

            // 因19大召开 江苏版本 临时修改 国内漫入不可选
            if ($system.getProvince() === $system.PROVINCE_ENUM.JS) {
                $("#nation").attr('disabled', 'true')
                $('#nation').attr('checked', false)
            }

            $objElement.find('#mobile').val(model.accessNumber)
            $objElement.find('#smsContent').val(model.marketContentText)
            $objElement.find('#quotaNumber').val(model.marketLimit)
            $objElement.find('#locationTypeId').val(model.sendInterval)
            layerUpdateShopTempTask()
        } catch (ex) {
            layer.alert("根据ID查询炒店临时任务数据失败", {icon: 6});
        }

        function layerUpdateShopTempTask() {
            var layerAddOrUpdateJq = $('#shopTempTask .layerAddOrUpdate');
            layer.open({
                type: 1,
                shade: 0.3,
                title: '编辑炒店临时任务',
                skin: 'markBackGroundColor',
                shadeClose: false,
                area: ['1100px', '630px'],
                offset: '60px',
                shift: 6,
                btn: ['确定', '取消'],
                content: layerAddOrUpdateJq,
                yes: function (index) {
                    shopTemporaryTask.updateShopTempTask(index, '编辑', model.id, model.baseIds)
                },
                cancel: function (index) {
                    layer.close(index);
                }
            });
            addMaps = addMaps.reset();
            addMaps.centerAndZoom(model.longitude, model.latitude);
            addMaps.setLocationArea(model.longitude, model.latitude);
            // 初始化 监控类型选中事件
            var $marketType = $('#marketUserType')
            var $marketArea = $('#marketArea')
            $marketType.find(':checkbox').change(function () {
                // 首先取当前操作的复选框内的值，在判断当前值是否选中
                var ischecked_1 = $marketType.find('#marketUser1').is(':checked')
                var ischecked_2 = $marketType.find('#marketUser2').is(':checked')
                // 常驻 选中，流动拜访不选中，监控范围都不选，且都不可选
                // 流动拜访选中，默认本市用户选中，且必须选中一个
                if (ischecked_1 && !ischecked_2) {
                    $marketArea.find(':checkbox').each(function (i, x) {
                        $(x).attr('disabled', 'true')
                        $(x).removeAttr('checked')
                    })
                } else if (ischecked_2 && ischecked_1) {
                    $marketArea.find(':checkbox').each(function (i, x) {
                        $(x).removeAttr('disabled')
                        if ($(x).attr('id') === 'city') {
                            x.checked = true
                        }
                    })
                }
                // 因19大召开 江苏版本 临时修改 国内漫入不可选
                if ($system.getProvince() === $system.PROVINCE_ENUM.JS) {
                    $("#nation").attr('disabled', 'true')
                }
            })
        }

        // 根据经纬度进行打点
        $('#queryLocation').click(function () {
            var lngValue = $('#shopTempTask').find('#lngValue').val()
            var latValue = $('#shopTempTask').find('#lat').val()
            if (!lngValue || $.trim(lngValue).length < 1) {
                layer.tips('经度不能为空!', $html.find("#lngValue"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            if (!latValue || $.trim(latValue).length < 1) {
                layer.tips('纬度不能为空!', $html.find("#lat"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            //wgs84转百度坐标进行打点
            var ret = coordtransform.wgs84tobd09(lngValue, latValue);
            addMaps.setLocationArea(ret[0], ret[1]);
            // 根据经纬度打点出来的地址，将详细地址赋值到 【场馆地址】
            addMaps.getLocation(ret[0], ret[1], function (f) {
                var address = ''
                if (f.addressComponents && f.addressComponents.street && f.addressComponents.streetNumber) {
                    address = f.addressComponents.street + f.addressComponents.streetNumber
                } else {
                    address = f.business
                }
                console.log('f:', f)
                $('#shopTempTask').find('#address').val(address)
            })
        })
        // 根据详细地址打点
        $('#queryAddress').click(function () {
            var address = $('#shopTempTask').find('#address').val()
            if (!address || $.trim(address).length < 1) {
                layer.tips('场馆地址不能为空!', $html.find("#address"), {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            addMaps.search(address);
        })
    }
    /**
     * 编辑炒店临时任务
     */
    obj.updateShopTempTask = function (index, msg, id, baseIds) {
        var model = obj.shopTempTaskModel()
        model.id = id
        model.baseIds = baseIds
        if (obj.verifycationModel(model)) {
            $html.loading(true);
            post('updateShopTempTask.view', true, model, function (data) {
                $html.loading(false);
                if (parseInt(data.retValue) === 0) {
                    layer.close(index);
                    obj.queryShopTask();
                    layer.msg(msg + "成功", {time: 1000});
                } else {
                    $html.loading(false);
                    layer.alert(data.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常", {icon: 6});
            })
        }
    }
    /**
     * 删除炒店临时任务
     */
    obj.delShopTempTask = function (id) {
        layer.confirm("确定删除?删除后不可恢复,请慎重!", {icon: 3, title: '提示'}, function () {
            post('deleteShopTempTaskById.view', true, {"shopTaskId": id}, function (data) {
                if (parseInt(data.retValue) === 0) {
                    obj.queryShopTask();
                    layer.msg("删除成功", {timeout: 800});
                    layer.close(index);
                } else {
                    layer.alert("系统异常", {icon: 6});
                }
            });
        });
    }
    /**
     * 取接入号信息
     */
    obj.getPhone = function () {
        post('queryAccessNum.view', true, {}, function (data) {
            if (data && data.length > 0) {
                var layerAddOrUpdateJq = $('#shopTempTask .layerAddOrUpdate');
                // layerAddOrUpdateJq.find('#mobile').attr("disabled", "disabled");
                layerAddOrUpdateJq.find('#mobile').val(data[0].name)
            }
        })
    }
    /**
     * 预览炒店临时任务
     */
    obj.viewShopTempTask = function (model) {
        var $objElement = $('#shopTempTask .layerPreview');
        // wgs84坐标转百度坐标
        var ret = coordtransform.wgs84tobd09(model.longitude, model.latitude);

        $objElement.find('[name="baseName"]').text(model.taskName || '') // 名称
        $objElement.find('[name="beginDate"]').text(model.startTime) // 有效期
        $objElement.find('[name="endDate"]').text(model.stopTime) // 有效期
        $objElement.find('[name="address"]').text(model.addressDetail) // 详细地址
        $objElement.find('[name="cityDistrict"]').text(model.baseAreaName + ' ' + model.monitorArea) //区县
        $objElement.find('[name="lng"]').text(ret[0]) //经度
        $objElement.find('[name="lat"]').text(ret[1]) // 纬度
        $objElement.find('[name="radius"]').text(model.radius + '米') // 半径
        $objElement.find('[name="sendInterval"]').text(model.sendInterval + '天') // 营销间隔

        var marketUserText = ''
        switch (model.marketUser) {
            case 1:
                marketUserText = '常驻'
                break
            case 2:
                marketUserText = '流动拜访'
                break
            case 3:
                marketUserText = '常驻+流动拜访用户'
                break
        }
        var marketArea = '暂无'
        if (model.marketUser === 2 || model.marketUser === 3) {
            switch (model.manruRange) {
                case '111':
                    marketArea = '国内漫入+本省跨地市漫入+本市用户'
                    break
                case '101':
                    marketArea = '国内漫入+本市用户'
                    break
                case '100':
                    marketArea = '国内漫入'
                    break
                case '011':
                    marketArea = '本省跨地市漫入+本市用户'
                    break
                case '001':
                    marketArea = '本市用户'
                    break
                case '010':
                    marketArea = '本省跨地市漫入'
                    break
                case '110':
                    marketArea = '国内漫入+本省跨地市漫入'
                    break
                default:
                    marketArea = '暂无'

            }
        }
        $objElement.find('[name="marketArea"]').text(marketArea) //
        $objElement.find('[name="marketUser"]').text(marketUserText) //
        $objElement.find('[name="phone"]').text(model.accessNumber) // 接入号
        $objElement.find('[name="smsContent"]').text(model.marketContentText) // 营销内容
        $objElement.find('[name="quotaNumber"]').text(model.marketLimit) // 发送配额
        var classifyName = '炒店业务'
        switch (model.taskClassifyId) {
            case 2:
                classifyName = '临时摊点（校园）'
                break;
            case 3:
                classifyName = '临时摊点（集客）'
                break;
            case 4:
                classifyName = '临时摊点（公众）'
                break;

        }
        $objElement.find('[name="businessHallCode"]').text(classifyName) //类型
        layerPreviewShopTempTask()

        function layerPreviewShopTempTask() {
            var layerPreviewJq = $('#shopTempTask .layerPreview');
            layer.open({
                type: 1,
                title: '预览炒店临时任务',
                closeBtn: 0,
                skin: 'markBackGroundColor',
                shadeClose: false,
                area: ['700px', '630px'],
                offset: '60px',
                shift: 6,
                btn: ['确定'],
                content: layerPreviewJq,
                yes: function (index) {
                    layer.close(index);
                }
            });
            previewMaps = previewMaps.reset();
            previewMaps.centerAndZoom(model.longitude, model.latitude);
            previewMaps.setLocationArea(model.longitude, model.latitude);
        }
    }
    return obj
}();

function onLoadBody(status) {
    shopTemporaryTask.cityAppendOption()
    shopTemporaryTask.dataTableInit(status)
    shopTemporaryTask.initEvent()
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 日期， 在原有日期基础上，增加days天数，默认增加1天
 */
function addDate(date, days) {
    if (days == undefined || days == '') {
        days = 1;
    }
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return date.getFullYear() + '-' + getFormatDate(month) + '-' + getFormatDate(day);
}

/**
 *  日期月份/天的显示，如果是1位数，则在前面加上'0'
 * @param arg
 * @returns {*}
 */
function getFormatDate(arg) {
    if (arg == undefined || arg == '') {
        return '';
    }

    var re = arg + '';
    if (re.length < 2) {
        re = '0' + re;
    }

    return re;
}

//计算天数差的函数，通用
function DateDiff(sDate1, sDate2) {    //sDate1和sDate2是2002-12-18格式
    var oDate = 0
    if (sDate1 && sDate2 && typeof sDate1 === 'string' && typeof sDate2 === 'string') {
        oDate = Date.parse(sDate2) - Date.parse(sDate1)
        return Math.ceil(oDate / 1000 / 60 / 60 / 24)    //把相差的毫秒数转换为天数
    }
    return 31
}