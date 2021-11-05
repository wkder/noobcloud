var positionBaseConfig = function () {
    var getUrl = "selectBaseInfoByPage.view", dataTable, subDataTable, obj = {}, loginUser;
    // 加载查询条件
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
            layer.alert("系统异常，获取位置场景营业厅类型失败", {icon: 6});
        });
    }
    // 主页table初始化
    obj.dataTableInit = function () {
        var baseId = $("#qrybaseId").val();
        var baseName = $("#qrybaseName").val();
        var baseArea = $("#qryBaseAreas").val();
        var buscoding = encodeURIComponent($("#qrybuscoding").val());
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?baseId=" + baseId + "&baseName=" + baseName + "&baseArea=" + baseArea + "&buscoding=" + buscoding,
                type: "POST"
            },
            columns: [
                {data: "locationTypeNames", width: 100},
                {data: "baseName", width: 150},
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
                            var ret = province === $system.PROVINCE_ENUM.SH ? Convert_GCJ02_To_BD09(row.lat, row.lng) : coordtransform.wgs84tobd09(row.lng, row.lat);
                            row.lng = ret[0];
                            row.lat = ret[1];
                        }

                        savePageData[row.baseId] = row;
                        var inputButton = '<a class="btn btn-primary btn-sm btn-preview" data-buttonStatus="preview" data-showJson=\'{0}\' title="预览" ><i class="fa fa-eye"></i></a>'.format(row.baseId);
                        if (province === $system.PROVINCE_ENUM.SH) {
                            inputButton = '<a class="btn btn-warning btn-sm btn-delete" onclick="showPortrayal(\'{0}\')" title="营业厅画像" ><i class="fa fa-user"></i></a>'.format(row.businessHallCode);
                        }
                        // 如果是自建任务
                        if (row.isUpdate == 1) {
                            inputButton += '<a id="btnEdit" class="btn btn-info btn-edit" data-buttonStatus="update" data-showJson=\'{0}\' title="编辑" ><i class="fa fa-pencil-square-o"></i></a>'.format(row.baseId);
                        }

                        // 如果是省级管理员
                        if (loginUser == 99999) {

                            inputButton += "<a id='btndel' class='btn btn-danger btn-delete' title='删除' " +
                                "onclick=positionBaseConfig.confirmPositionBase(\"" + row.baseId + "\",\"" + row.baseName + "\")>" +
                                "<i class=\"fa fa-trash-o\"></i></a>";
                        }

                        return inputButton;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    // 触发事件
    obj.initEvent = function () {
        // 查询
        $("#positonBaseButton").click(function () {
            obj.queryPositionBase();
        });
        // 新建位置基站
        $("#createPositionBaseButton").click(function () {
            obj.createPositionBase();
        });
        // 导出
        $("#exportPositionBaseButton").click(function () {
            obj.exportData("getBaseDataDown.view", obj.getParams());
        });
        // 导入
        $("#importPositionBaseButton").click(function () {
            obj.batchImportBase();
        });
        // 上传
        $('body').on('click', '#batchImportBaseDialog .batchImportBaseSegment .addForm .execlInit', function () {
            obj.submitFile();
        });
    }
    // 查询
    obj.queryPositionBase = function () {
        dataTable.ajax.url(getUrl + "?baseId=" + $("#qrybaseId").val() + "&baseName=" + encodeURIComponent($("#qrybaseName").val()) + "&baseArea=" + $("#qryBaseAreas").val() + "&buscoding=" + encodeURIComponent($("#qrybuscoding").val()));
        dataTable.ajax.reload();
    }
    // 新建位置场景基站
    obj.createPositionBase = function () {
        obj.initPositionBaseElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "新增营业厅配置",
            offset: '50px',
            area: ['580px', '520px'],
            content: $("#createPositionBaseDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                // 保存位置场景
                obj.savePositionBaseData(index, "新增");
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    // 初始化对话框元素
    obj.initPositionBaseElement = function () {
        var $dialog = $("#createPositionBaseDialog");
        // 加载静态页面
        var $panel = $(".iMarket_PosiBase_EditHtml").find("div.createPositonBaseSegment").clone();
        $dialog.find("div.createPositonBaseSegment").remove();
        $dialog.append($panel);
        // 初始化地市
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
                layer.alert("系统异常，新增营业厅配置获取地市失败", {icon: 6});
            });
        }
    }
    // 初始化删除对话框元素
    obj.initdelPositionBaseElement = function () {
        var $dialog = $("#deletePositionBaseDialog");
        // 加载静态页面
        var $panel = $(".iMarket_PosiBase_DelHtml").find("div.deletePositionBaseSegment").clone();
        $dialog.find("div.deletePositionBaseSegment").remove();// 将之前插入的div去除，以便插入最新div
        $dialog.append($panel);
    }
    // 保存场景位置基站站点
    obj.savePositionBaseData = function (index, msg) {
        debugger;
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

        // 获取位置场景基站对象
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
                layer.tips('营业厅名称不能为空!', $html.find(".baseName"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else if (obj.baseName.length > 100) {
                layer.tips('营业厅名称长度不能超过100个字数!', $html.find(".baseName"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.address == "") {
                layer.tips('营业厅地址不能为空!', $html.find(".address"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else if (obj.address.length > 200) {
                layer.tips('营业厅地址长度不能超过200个字数!', $html.find(".address"), {time: 1000, tips: [2, "#71bff2"]});
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
    // 获取登录人信息
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser.areaId;
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    };

    function updPositionBase(ids) {
        obj.initdelPositionBaseElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "失效营业厅",
            offset: '50px',
            area: ['580px', '520px'],
            content: $("#deletePositionBaseDialog"),
            btn: ['确定', '取消'],
            yes: function (index) {
                // 删除记录
                obj.deletePositionBase(ids, index);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });
    }

    // 删除事件前弹出相关信息
    obj.confirmPositionBase = function (id, name) {
        updPositionBase(id);
        var $editDialog = $("#deletePositionBaseDialog .deletePositionBaseSegment");
        $editDialog.find(".del_baseName").text(name || "空");

        globalRequest.delPositionBaseById(false, {"baseId": id}, function (data) {
            var a = data.shift();
            var b = '';
            $.each(data, function (idx, obj) {
                b += obj.taskName + '(' + obj.taskId + ')' + '<br/>';
            });
            $editDialog.find(".del_bassUser").text(a ? a["userName"] : "空");
            $editDialog.find(".del_bassJob").html(b || "空");
        }, function () {
            layer.alert("系统异常，获取失效营业厅信息失败", {icon: 6});
        });
    };
    // 删除事件
    obj.deletePositionBase = function (id, index) {
        var input = $("#auditDialog").val();
        if (input == "") {
            layer.alert("失效原因不为空", {icon: 3, title: '提示'})
        }
        else {
            layer.confirm("确定失效?失效后不可恢复,请慎重!", {icon: 3, title: '提示'}, function () {
                globalRequest.deletePositionBaseById(true, {
                    "baseId": id,
                    "input": input,
                    "userId": globalConfigConstant.loginUser.id
                }, function (data) {
                    if (data.retValue === 0) {
                        obj.queryPositionBase();
                        layer.msg("失效成功", {timeout: 800});
                        layer.close(index);
                    } else {
                        layer.alert("系统异常", {icon: 6});
                    }
                });
            });
        }
    }
    // 编辑事件
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
            layer.alert("根据ID查询位置营业厅数据失败", {icon: 6});
        });

        /*
         * 修改位置场景
         */
        function updatePositionBase() {
            debugger;
            obj.initPositionBaseElement();
            layer.open({
                type: 1,
                shade: 0.3,
                title: "编辑位置场景",
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
    // 导出数据
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
    // 获取导出数据参数
    obj.getParams = function () {
        var paramList = [
            ["baseId", $("#qrybaseId").val()],
            ["baseName", $("#qrybaseName").val()],
            ["buscoding", encodeURIComponent($("#qrybuscoding").val())],
            ["areaCode", $("#qryBaseAreas").val()],
            ["areaName", $("#qryBaseAreas").find("option:selected").text()]
        ];
        return paramList;
    }
    // 导入
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
            title: "批量导入营业厅",
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
                    layer.msg("批量导入营业厅成功", {time: 1000});
                } else {
                    layer.alert("批量导入营业厅失败，" + data.desc, {icon: 6});
                }
            }, function () {
                layer.alert("批量导入营业厅失败", {icon: 6});
            });
        }
    }
    // 文件上传
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
    positionBaseConfig.getLoginUser();
}