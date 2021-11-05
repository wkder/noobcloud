var positionScene = function () {
    var getUrl = "queryPositionSceneByPage.view", dataTable, subDataTable, obj = {};

    //主页table初始化
    obj.dataTableInit = function () {
        var positionScenName = $("#qrypositionScenName").val();
        var positionScenStau = $("#qrypositionScenStau").val();
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?positionScenName=" + positionScenName + "&positionScenStau=" + positionScenStau,
                type: "POST"
            },
            columns: [
                {data: "scenceName", width: 140, className: "dataTableFirstColumns"},
                {data: "scenceTypeName", width: 80},
                {data: "beginTime", width: 100, className: "centerColumns",},
                {data: "endTime", width: 100, className: "centerColumns",},
                {data: "baseName", width: 200},
                {
                    data: "status", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>生效</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>失效</i>";
                        }
                    }
                },
                {
                    width: 120, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a id='btnEdit' class='btn btn-info btn-edit' title='编辑' onclick='positionScene.editPositionSms(\"" + row.id + "\")'><i class=\"fa fa-pencil-square-o\"></i></a>" +
                            "<a id='btndel' class='btn btn-danger btn-delete' title='删除' onclick='positionScene.deletePositionSms(\"" + row.id + "\")'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    //触发事件
    obj.initEvent = function () {
        //查询
        $("#positonScenButton").click(function () {
            obj.queryPositionScene();
        });
        //新建位置场景
        $("#createPositionScenButton").click(function () {
            obj.createPositionScene();
        });
    }
    // 查询
    obj.queryPositionScene = function () {
        dataTable.ajax.url(getUrl + "?positionScenName=" + encodeURIComponent($("#qrypositionScenName").val()) + "&positionScenStau=" + $("#qrypositionScenStau").val());
        dataTable.ajax.reload();
    }
    //新建位置场景
    obj.createPositionScene = function () {
        obj.initPositionSceneElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "新建位置场景",
            offset: '50px',
            area: ['700px', '630px'],
            content: $("#createPositionSceneDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                //保存位置场景
                obj.savePositionSceneData(index, "新增");
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //初始化对话框元素
    obj.initPositionSceneElement = function () {
        var $dialog = $("#createPositionSceneDialog");
        //加载静态页面
        var $panel = $(".iMarket_Position_EditHtml").find("div.positionScenceSegment").clone();
        $dialog.find("div.positionScenceSegment").remove();
        $dialog.append($panel);
        //加载场景类别
        initSenceType();
        //加载监视用户黑白名单
        initUsers();
        //初始化监控的基站
        initBaseAreas();
        //初始化监控号段黑白名单
        initAreas();
        //初始化接收发送任务报告
        initReportElement();

        //场景类别初始化事件
        function initSenceType() {
            var $scenceTypeSelect = $dialog.find("select.scenceTypeSelect");
            globalRequest.queryPositonSenceType(true, {}, function (data) {
                $scenceTypeSelect.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            $scenceTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            $scenceTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                }
            }, function () {
                layer.alert("系统异常，获取位置场景类别失败", {icon: 6});
            });
        }

        //初始化监视用户名单
        function initUsers() {
            var $whiteUsers = $dialog.find(".whiteUsers");
            var $whiteUserIds = $dialog.find(".whiteUserIds");
            var $blackUsers = $dialog.find(".blackUsers");
            var $blackUserIds = $dialog.find(".blackUserIds");
            //监视用户白名单选择事件
            $whiteUsers.click(function () {
                obj.initSegmentSelectDialog($whiteUsers, $whiteUserIds);
            });
            //监视用户黑名单选择事件
            $blackUsers.click(function () {
                obj.initSegmentSelectDialog($blackUsers, $blackUserIds);
            });
        }

        function initAreas() {
            var $whiteAreas = $dialog.find(".whiteAreas");
            var $whiteAreaIds = $dialog.find(".whiteAreaIds");
            var $blackAreas = $dialog.find(".blackAreas");
            var $blackAreaIds = $dialog.find(".blackAreaIds");
            $whiteAreas.click(function () {
                var $this = $(this);
                obj.initPositionAreaSelectDialog($whiteAreas, $whiteAreaIds);
            });
            $blackAreas.click(function () {
                var $this = $(this);
                obj.initPositionAreaSelectDialog($blackAreas, $blackAreaIds);
            });

        }

        function initReportElement() {
            var $isSendReport = $dialog.find("select.isSengReportSelect");
            var $reportPhone = $dialog.find(".reportPhone");
            $isSendReport.change(function () {
                if ($(this).val() == "1") {
                    $reportPhone.parent().removeClass("hide");
                } else {
                    $reportPhone.parent().addClass("hide");
                }
            })
        }

        //初始化基站选择事件
        function initBaseAreas() {
            var $baseAreaTypeSelect = $dialog.find("select.baseAreaTypeSelect");
            var baseAreaIdSelect = $dialog.find("select.baseAreaIdSelect");
            globalRequest.queryBaseAreas(false, {}, function (data) {
                baseAreaIdSelect.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            baseAreaIdSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            baseAreaIdSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                }
            }, function () {
                layer.alert("系统异常，获取位置场景监控的基站失败", {icon: 6});
            });

            globalRequest.queryBaseAreaType(true, {}, function (data) {
                $baseAreaTypeSelect.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (i === 0) {
                            $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        } else {
                            $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                        }
                    }
                    //基站点点击事件
                    $dialog.find(".baseId").click(function () {
                        initBaseElement();
                        onLoadBaseBody();
                        layer.open({
                            type: 1,
                            shade: 0.3,
                            title: "选择基站点",
                            offset: '50px',
                            area: ['620px', '710px'],
                            content: $("#positionBaseInfoDialog"),
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                var $selected = $("#positionBaseInfoDialog .positionBaseInfoSegment .baseinfo tbody tr").filter(".silver");
                                var $baseId = $selected.find(".baseId").text();
                                var $baseName = $selected.find(".baseName").text();
                                $dialog.find(".baseId").val($baseId + "-" + $baseName);
                                $dialog.find(".baseIds").val($baseId);
                                layer.close(index);
                            },
                            cancel: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    })
                }
            }, function () {
                layer.alert("系统异常，获取位置场景基站类型失败", {icon: 6});
            });

            function initBaseElement() {
                var $baseDialog = $("#positionBaseInfoDialog");
                var $basePanel = $(".iMarket_Position_EditHtml .positionBaseInfoSegment").clone();
                $baseDialog.find("div.positionBaseInfoSegment").remove();
                $baseDialog.append($basePanel);

                //基站站点搜索事件
                $("#positionBaseInfoDialog .positionBaseInfoSegment .searchButton").click(function () {
                    onLoadBaseBody();
                });
            }

            function onLoadBaseBody() {
                var baseAreaId = $dialog.find(".baseAreaIdSelect").val();
                var baseTypeId = $dialog.find(".baseAreaTypeSelect").val();
                var baseId = $("#d-baseId").val();
                var baseName = $("#d-baseName").val();

                var pageInfo = {
                    itemCounts: 0,
                    items: {}
                };

                var paras = {
                    curPage: 1,
                    countsPerPage: 10,
                    baseAreaId: baseAreaId,
                    baseTypeId: baseTypeId,
                    baseId: baseId,
                    baseName: baseName
                };

                globalRequest.queryBasesByPage(true, paras, function (data) {
                    pageInfo.itemCounts = data.itemCounts;
                    pageInfo.items = data.items;
                    createPageBody();
                    initPagination();
                }, function () {
                    layer.alert("加载基站数据异常", {icon: 6});
                });

                function initPagination() {
                    $("#positionBaseInfoDialog .positionBaseInfoSegment .baseinfo .pagination").pagination({
                        items: pageInfo.itemCounts,
                        itemsOnPage: 10,
                        displayedPages: 4,
                        cssStyle: 'light-theme',
                        prevText: "<上一页",
                        nextText: "下一页>",
                        onPageClick: function (pageNumber) {
                            paras.curPage = pageNumber;
                            globalRequest.queryBasesByPage(true, paras, function (data) {
                                pageInfo.itemCounts = data.itemCounts;
                                pageInfo.items = data.items;
                                createPageBody();
                            });
                        }
                    });
                }

                function createPageBody() {
                    var html = "<tr><td colspan='3'><div class='noData'>暂无相关数据</div></td></tr></li>";
                    if (pageInfo.items.length > 0) {
                        var html = template('positionBaseInfo', {list: pageInfo.items});
                    }
                    $("#positionBaseInfoDialog .positionBaseInfoSegment .baseinfo tbody tr").remove();
                    $("#positionBaseInfoDialog .positionBaseInfoSegment .baseinfo tbody").append(html);
                    $("#positionBaseInfoDialog .positionBaseInfoSegment .baseinfo tbody tr").click(function () {
                        $(this).siblings().removeClass("silver");
                        $(this).toggleClass("silver");
                    })

                };
            }
        }
    }
    //用户群选择树
    obj.initSegmentSelectDialog = function ($names, $ids) {
        var setting = {
            check: {
                enable: true,
                chkStyle: 'checkbox',
                radioType: "all"
            },
            view: {
                dblClickExpand: true,
                selectedMulti: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            }
        };

        globalRequest.queryAllModelsUnderCatalog(true, {}, function (data) {
            var names = $names.val().split(",");
            var ids = $ids.val().split(",");
            var result = [{id: '-1', pId: '-2', name: "暂无相关信息", isParent: true, nocheck: true}];
            setParentChecked(ids, data);
            function setParentChecked(modelIds, data) {
                if (modelIds && modelIds.length > 0) {
                    for (var i = 0; i < modelIds.length; i++) {
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].id == modelIds[i]) {
                                data[j]["checked"] = true;
                                data[j]["open"] = true;
                                setParentChecked([data[j].pId], data);
                                break;
                            }
                        }
                    }
                }
            }

            result = data;

            $.fn.zTree.init($("#treePrimary"), setting, result);

            layer.open({
                type: 1,
                shade: 0.3,
                title: "客户群选择",
                offset: '70px',
                area: ['600px', '600px'],
                content: $("#dialogTreePrimary"),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                    var checkedNodes = zTree.getCheckedNodes(true);
                    if (checkedNodes.length > 0) {
                        var names = [], ids = [], hasSegment = false;
                        for (var i = 0; i < checkedNodes.length; i++) {
                            if (!checkedNodes[i].isParent) {
                                ids.push(checkedNodes[i].id);
                                names.push(checkedNodes[i].name);
                                hasSegment = true;
                            }
                        }

                        if (!hasSegment) {
                            layer.msg("请选择客户群")
                            return;
                        }
                        $names.val(names.join(","));
                        $ids.val(ids.join(","));
                        layer.close(index);
                    } else {
                        layer.alert("没有选择任何客户群");
                    }
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        }, function (data) {
            layer.alert("查询客户群失败", {icon: 6});
        });
    }

    //号段地区选择
    obj.initPositionAreaSelectDialog = function ($names, $ids) {
        var value = {"name": $names.val(), "id": $ids.val()};

        var nameArray = [];
        var idArray = [];

        if ($names.val()) {
            nameArray = $names.val().split(",");
        }
        if ($ids.val()) {
            idArray = $ids.val().split(",");
        }
        var setting = {
            view: {
                dblClickExpand: false,
                selectedMulti: true,
                txtSelectedEnable: true,
                showLine: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            check: {
                enable: true,
                chkStyle: "checkbox"
            },
            callback: {}
        };
        globalRequest.queryUserAreasCode(true, {}, function (data) {
            var selectIds = $ids.val();

            if (data && data.length > 0) {
                //选中的地域弹框时勾选
                var selectIds = $ids.val() ? $ids.val().split(",") : [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].pId == 0) {
                        data[i].nocheck = true;
                    }
                    if (selectIds.indexOf(data[i].id + "") >= 0) {
                        data[i].checked = true;
                    }
                }
            }

            $.fn.zTree.init($("#treePrimary"), setting, data);
            layer.open({
                type: 1,
                shade: 0.3,
                title: "用户归属地区选择",
                offset: '70px',
                area: ['400px', '560px'],
                content: $('#dialogTreePrimary'),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                    var nodes = zTree.getCheckedNodes();
                    var areaNames = [], areaIds = [];
                    for (var i = 0; i < nodes.length; i++) {
                        areaNames.push(nodes[i].name);
                        areaIds.push(nodes[i].id);
                    }
                    $ids.val(areaIds.join(","));
                    $names.val(areaNames.join(","));
                    layer.close(index);
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        }, function () {
            layer.alert("系统异常：查询号段地区目录失败");
        });
    }


    //保存场景位置
    obj.savePositionSceneData = function (index, msg) {
        var positionSceneObj = getPositionSceneObj();
        if (valitePositionSceneObj(positionSceneObj)) {
            globalRequest.createOrUpdatePositionScen(true, positionSceneObj, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    obj.queryPositionScene();
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
        //获取位置场景对象
        function getPositionSceneObj() {
            var $obj = $("#createPositionSceneDialog .positionScenceSegment");
            return {
                id: $obj.find(".id").val(),
                scenceName: $obj.find(".scenceName").val(),
                scenceType: $obj.find("select.scenceTypeSelect").val(),
                monitorInvartal: $obj.find("select.monitorInvartal").val(),
                beginTime: $obj.find(".beginTime").val(),
                endTime: $obj.find(".endTime").val(),
                monitorArea: $obj.find(".monitorArea").val(),
                channelId: $obj.find(".channelIdSelect").val(),
                monitorType: $obj.find(".monitorTypeSelect").val(),
                baseAreaId: $obj.find(".baseAreaIdSelect").val(),
                baseAreaType: $obj.find(".baseAreaTypeSelect").val(),
                baseId: $obj.find(".baseIds").val(),
                baseName: $obj.find(".baseId").val(),
                taskWeight: $obj.find(".taskWeight").val(),
                triggerChannelId: $obj.find(".triggerChannelIdSelect").val(),
                isSengReport: $obj.find(".isSengReportSelect").val(),
                reportPhone: $obj.find(".reportPhone").val(),
                sendInterval: $obj.find(".sendInterval").val(),
                whiteUsers: $obj.find(".whiteUserIds").val(),
                blackUsers: $obj.find(".blackUserIds").val(),
                whiteAreas: $obj.find(".whiteAreaIds").val(),
                blackAreas: $obj.find(".blackAreaIds").val(),
                whiteUserNames: $obj.find(".whiteUsers").val(),
                blackUserNames: $obj.find(".blackUsers").val(),
                whiteAreaNames: $obj.find(".whiteAreas").val(),
                blackAreaNames: $obj.find(".blackAreas").val(),
                status: $obj.find(".status").val()
            }
        }

        /*
         校验位置场景
         */
        function valitePositionSceneObj(obj) {
            var $html = $("#createPositionSceneDialog .positionScenceSegment");
            if (obj.scenceName == "") {
                layer.tips('位置场景名称不能为空!', $html.find(".scenceName"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.scenceType == "") {
                layer.tips('场景类别不能为空!', $html.find(".scenceTypeSelect"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.monitorInvartal == "") {
                layer.tips('监控周期不能为空!', $html.find(".monitorInvartal"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.beginTime == "") {
                layer.tips('开始时间不能为空!', $html.find(".beginTime"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.endTime == "") {
                layer.tips('结束时间不能为空!', $html.find(".endTime"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.baseAreaId == "") {
                layer.tips('监控的基站地区不能为空!', $html.find(".baseAreaIdSelect"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.baseAreaType == "") {
                layer.tips('监控的基站类型不能为空!', $html.find(".baseAreaTypeSelect"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.baseName == "") {
                layer.tips('监控的基站点不能为空!', $html.find(".baseId"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.sendInterval == "") {
                layer.tips('营销间隔不能为空!', $html.find(".sendInterval"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else {
                var reg = /^\d+$/;
                if (!reg.test(obj.sendInterval)) {
                    layer.tips('营销间隔只能为整数!', $html.find(".sendInterval"), {time: 1000, tips: [2, "#71bff2"]});
                    return false;
                }
            }

            if (obj.isSengReport == "1") {
                if (obj.reportPhone == "") {
                    layer.tips('接收发送报告手机号码不能为空!', $html.find(".reportPhone"), {time: 1000, tips: [2, "#71bff2"]});
                    return false;
                } else if (!/^(\+86|86)?1\d{10}$/.test(obj.reportPhone)) {
                    layer.tips('接收发送报告手机号码为空或无效!', $html.find(".reportPhone"), {time: 1000, tips: [2, "#71bff2"]});
                    return false;
                }
            }

            if (obj.taskWeight == "") {
                layer.tips('任务权重不能为空!', $html.find(".taskWeight"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else {
                var reg = /^\d+$/;
                if (!reg.test(obj.taskWeight)) {
                    layer.tips('任务权重只能为整数!', $html.find(".taskWeight"), {time: 1000, tips: [2, "#71bff2"]});
                    return false;
                }
            }
            return true;
        }
    }
    //删除事件
    obj.deletePositionSms = function (id) {
        layer.confirm("确定删除？", {icon: 3, title: '提示'}, function () {
            globalRequest.deletePositionSceneById(true, {"id": id}, function (data) {
                if (data.retValue === 0) {
                    obj.queryPositionScene();
                    layer.msg("删除成功", {timeout: 800});
                } else {
                    layer.alert("系统异常", {icon: 6});
                }
            });
        });
    }
    //编辑事件
    obj.editPositionSms = function (id) {
        obj.updatePositionScene();
        obj.initUpdateData(id);
    }
    //修改位置场景
    obj.updatePositionScene = function () {
        obj.initPositionSceneElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "编辑位置场景",
            offset: '50px',
            area: ['700px', '630px'],
            content: $("#createPositionSceneDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                //保存位置场景
                obj.savePositionSceneData(index, "编辑");
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //初始化编辑框数据
    obj.initUpdateData = function (id) {
        globalRequest.queryPositionSceneById(true, {id: id}, function (data) {
            var positionSceneDomain = data.positionSceneDomain;
            var $obj = $("#createPositionSceneDialog .positionScenceSegment");
            $obj.find(".id").val(positionSceneDomain.id);
            $obj.find(".scenceName").val(positionSceneDomain.scenceName);
            $obj.find(".scenceName").attr("disabled", true);
            $obj.find(".scenceTypeSelect").val(positionSceneDomain.scenceType);
            $obj.find(".monitorArea").val(positionSceneDomain.monitorArea);
            $obj.find(".monitorInvartal").val(positionSceneDomain.monitorInvartal);
            $obj.find(".beginTime").val(positionSceneDomain.beginTime);
            $obj.find(".endTime").val(positionSceneDomain.endTime);
            $obj.find(".channelIdSelect").val(positionSceneDomain.channelId);
            $obj.find(".monitorTypeSelect").val(positionSceneDomain.monitorType);
            $obj.find(".baseAreaIdSelect").val(positionSceneDomain.baseAreaId);
            $obj.find(".baseAreaTypeSelect").val(positionSceneDomain.baseAreaType);
            $obj.find(".baseId").val(positionSceneDomain.baseName);
            $obj.find(".baseIds").val(positionSceneDomain.baseId);
            $obj.find(".triggerChannelIdSelect").val(positionSceneDomain.triggerChannelId);
            $obj.find(".isSengReportSelect").val(positionSceneDomain.isSengReport);
            $obj.find(".reportPhone").val(positionSceneDomain.reportPhone);
            if ($obj.find(".isSengReportSelect").val() == "1") {
                $obj.find(".reportPhonelabel").removeClass("hide");
            } else {
                $obj.find(".reportPhonelabel").addClass("hide");
            }
            $obj.find(".sendInterval").val(positionSceneDomain.sendInterval);
            $obj.find(".taskWeight").val(positionSceneDomain.taskWeight);
            $obj.find(".whiteUsers").val(positionSceneDomain.whiteUserNames);
            $obj.find(".whiteUserIds").val(positionSceneDomain.whiteUsers);
            $obj.find(".blackUsers").val(positionSceneDomain.blackUserNames);
            $obj.find(".blackUserIds").val(positionSceneDomain.blackUsers);
            $obj.find(".whiteAreas").val(positionSceneDomain.whiteAreaNames);
            $obj.find(".whiteAreaIds").val(positionSceneDomain.whiteAreas);
            $obj.find(".blackAreas").val(positionSceneDomain.blackAreaNames);
            $obj.find(".blackAreaIds").val(positionSceneDomain.blackAreas);
            $obj.find(".status").val(positionSceneDomain.status);
        }, function () {
            layer.alert("根据ID查询位置场景数据失败", {icon: 6});
        });
    }

    return obj;
}();

function onLoadBody() {
    positionScene.dataTableInit();
    positionScene.initEvent();

}