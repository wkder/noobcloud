var woXunContentMgr = function () {
    var obj = {}, dataTable = {}, resourceTable;
    var woXun_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    obj.iniData = function () {
        var options = {
            ele: $('.woXunTable'),
            ajax: {url: obj.getAjaxUrl(1), type: "POST"},
            columns: [
                {data: "woxunId", title: "沃讯Id", className: "dataTableFirstColumns"},
                {data: "woxunTypeName", title: "沃讯类型"},
                {data: "resTitle", title: "沃讯标题"},
                {data: "resNumber", title: "资源个数"},
                {
                    data: "woxunId", title: "状态",
                    render: function (data, type, row) {
                        if (!data || data === 0) {
                            return "<span class='status-warning'>未提交</span>"
                        } else {
                            return "<span class='status-success'>提交</span>"
                        }
                    }
                },
                {
                    title: "操作", width: "20%",
                    render: function (data, type, row) {
                        var disabled = row.woxunId > 0 ? "disabled" : ""
                        var editBtnHtml = "<a title='编辑' class='editBtn btn btn-info btn-edit' href='javascript:void(0)' {0} onclick='woXunContentMgr.addOrEdit(\"{1}\",\"{2}\")' ><i class=\"fa fa-pencil-square-o\"></i></a>".autoFormat(disabled, "update", row.id);
                        var deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' {0} onclick='woXunContentMgr.delete(\"{1}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(disabled, row.id);
                        var detailBtnHtml = "<a title='查看资源列表' class='btn btn-primary btn-preview' href='javascript:void(0)' onclick='woXunContentMgr.showResourceList(\"{0}\",\"{1}\")'><i class=\"fa fa-eye\"></i></a>".autoFormat(row.id, row.woxunId);
                        var submitBtnHtml = "<a title='提交' class='btn btn-warning btn-submit' href='javascript:void(0)' {0} onclick='woXunContentMgr.submit(\"{1}\")'><i class=\"fa fa-cloud-upload\"></i></a>".autoFormat(disabled, row.id);
                        return editBtnHtml + deleteBtnHtml + detailBtnHtml + submitBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function () {
        $(".addBtn").click(function () {
            obj.addOrEdit("create");
        })

        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl(1));
        })
    }

    /**
     * 新增、修改事件
     * @param operate
     */
    obj.addOrEdit = function (operate, id) {
        debugger
        obj.initDialog(1);
        obj.initElementValue(operate, id);
        $plugin.iModal({
            title: operate === woXun_constant.operate.create ? "新增沃讯配置" : "修改沃讯配置",
            content: $("#addOrEdit_woXun_dialog"),
            area: '550px',
            btn: ['确定', '取消']
        }, function () {
            obj.save();
        }, null, function (layero, index) {
            layero.find(".operate").attr("index", index).attr("operate", operate);
        })
    }

    /**
     * 保存
     */
    obj.save = function () {
        var $all = $("#addOrEdit_woXun_dialog").find("div.woXunInfo");
        var operate = $all.find(".operate").attr("operate");
        var index = $all.find(".operate").attr("index");
        var oData = $all.autoSpliceForm();
        if (!$all.autoVerifyForm()) {
            return;
        }

        if (operate === woXun_constant.operate.create) {
            globalRequest.iResource.addWoXunContent(true, oData, function (data) {
                success(data);
            })
        } else {
            globalRequest.iResource.updateWoXunContent(true, oData, function (data) {
                success(data);
            })
        }

        function success(data) {
            if (data.retValue !== 0) {
                layer.alert(data.desc, {icon: 6});
                return;
            }
            layer.msg(data.desc, {time: 1000});
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl(1));
            layer.close(index);
        }
    }

    /**
     * 删除事件
     * @param id
     */
    obj.delete = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定删除数据吗？', function () {
            globalRequest.iResource.deleteWoXunContent(true, {id: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl(1));
                layer.close(confirmIndex);
            }, function () {
                layer.alert("删除失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 提交
     * @param id
     */
    obj.submit = function (id) {
        if (!id || id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        // globalRequest.iResource.submitWoXunContent(true, {id: id}, function (data) {
        //     if (data.retValue !== 0) {
        //         layer.alert("提交失败", {icon: 6});
        //         return;
        //     }
        //     layer.msg('提交成功', {time: 1000});
        //     layer.close(index);
        // })

        $.ajax({
            type: "post",
            data: {id: id},
            url: "submitWoXunContent.view",
            success: function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                layer.close(index);
            },
            error: function (e) {
                layer.alert("提交失败", {icon: 6});
            }
        });

    }

    /**
     * 查看资源列表
     * @param id
     * @param woxunId
     */
    obj.showResourceList = function (id, woxunId) {
        obj.initDialog(2);

        var $all = $("#show_resource_dialog").find("div.resourceListInfo"),
            $querySelectResourceType = $all.find(".querySelectResourceType"),
            $searchResourceBtn = $all.find(".searchResourceBtn"),
            $addResourceBtn = $all.find(".addResourceBtn");

        obj.initResourceType($querySelectResourceType);  // 资源类型

        initialize()

        initDataTable();

        initEvent();

        $plugin.iModal({
            title: "查看资源列表",
            content: $("#show_resource_dialog"),
            area: '950px',
            btn: ['确定', '取消']
        }, function (index) {
            layer.close(index);
        }, null, function (layero) {
            layero.find('.layui-layer-btn .layui-layer-btn0').remove();
        })

        function initialize() {
            if (woxunId > 0) {
                $addResourceBtn.hide();
            }
        }


        function initDataTable() {
            if (resourceTable) {
                resourceTable.destroy();
            }
            var options = {
                ele: $('#show_resource_dialog .resourceTable'),
                ajax: {url: obj.getAjaxUrl(2, id), type: "POST"},
                scrollY: 280,
                columns: [
                    {data: "typeName", title: "资源类型", className: "dataTableFirstColumns"},
                    {data: "relativeFilePath", title: "地址"},
                    {data: "rank", title: "级别"},
                    {data: "fileSize", title: "资源大小(KB)"},
                    {data: "resEditer", title: "操作人"},
                    {data: "resLastTime", title: "创建时间"},
                    {data: "resEditTime", title: "修改时间"},
                    {
                        title: "操作", width: "10%",
                        render: function (data, type, row) {
                            var disabled = woxunId > 0 ? "disabled" : "";
                            return "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' {0} onclick='woXunContentMgr.deleteResource(\"{1}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(disabled, row.id);

                        }
                    }
                ]
            };
            resourceTable = $plugin.iCompaignTable(options);
        }

        function initEvent() {
            /**
             * 资源列表查询
             */
            $searchResourceBtn.unbind('click').click(function () {
                $plugin.iCompaignTableRefresh(resourceTable, obj.getAjaxUrl(2, id));
            })

            /**
             * 资源列表新增
             */
            $addResourceBtn.unbind('click').click(function () {
                obj.addResource(id);
            })
        }
    }

    /**
     * 新增资源配置
     */
    obj.addResource = function (id) {
        obj.initDialog(3);
        obj.initResourceValue()
        $plugin.iModal({
            title: "新增资源配置",
            content: $("#add_resource_dialog"),
            area: '550px',
            btn: ['确定', '取消']
        }, function () {
            obj.saveResource(id);
        }, null, function (layero, index) {
            layero.find(".operate").attr("index", index);
        })
    }

    /**
     * 新增资源列表
     */
    obj.saveResource = function (id) {
        var $form = $("#add_resource_dialog").find(".importForm");
        $form.find("[name='id']").val(id)
        var options = {
            type: 'POST',
            url: 'importResource.view',
            dataType: 'json',
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (data) {
                $html.loading(false)
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                $plugin.iCompaignTableRefresh(resourceTable, obj.getAjaxUrl(2, id));
                layer.close($("#add_resource_dialog").find("div.resourceInfo .operate").attr("index"));
            }
        }
        $form.ajaxSubmit(options);
    }

    /**
     * 删除资源列表
     * @param id
     */
    obj.deleteResource = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定删除数据吗？', function () {
            globalRequest.iResource.deleteResource(true, {id: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                $plugin.iCompaignTableRefresh(resourceTable, obj.getAjaxUrl(2, id));
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
     */
    obj.initDialog = function (type) {
        switch (type) {
            case 1: // 新增、修改沃讯配置
                var $all = $("div.iMarket_Content").find("div.woXunInfo").clone();
                $("#addOrEdit_woXun_dialog").empty().append($all);
                break;
            case 2: // 查看资源列表
                var $all = $("div.iMarket_Content").find("div.resourceListInfo").clone();
                $("#show_resource_dialog").empty().append($all);
                break;
            case 3: // 新增资源列表
                var $all = $("div.iMarket_Content").find("div.resourceInfo").clone();
                $("#add_resource_dialog").empty().append($all);
                break;
        }
    }

    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function (operate, id) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var $all = $("#addOrEdit_woXun_dialog").find("div.woXunInfo"),
            $woXunType = $all.find("[name='woxunType']"),
            $resTitle = $all.find("[name='resTitle']");

        obj.initWoXunType($woXunType)  // 沃讯类型

        if (operate === woXun_constant.operate.update) {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            globalRequest.iResource.queryWoXunContentById(false, {id: id}, function (data) {
                if (!data) {
                    layer.alert("数据异常,请刷新重试", {icon: 5});
                    return;
                }
                $("#addOrEdit_woXun_dialog").find("div.woXunInfo").autoAssignmentForm(data);
            }, function () {
                layer.alert("数据异常，请刷新重试", {icon: 6});
            })
        }
    }

    /**
     * 资源表单控件赋值
     * @param id
     */
    obj.initResourceValue = function () {
        var $all = $("#add_resource_dialog").find("div.resourceInfo"),
            $rank = $all.find("[name='rank']"),
            $typeId = $all.find("[name='resourceType']"),
            $levelOne = $all.find(".levelOne"),
            $levelTwo = $all.find(".levelTwo");

        obj.initResourceType($typeId);  // 资源类型

        initEvent();

        function initEvent() {
            /**
             * 级别下拉框改变事件
             */
            $rank.unbind('change').change(function () {
                var $rankRow = $all.find('[data-rank="true"]');
                var type = $(this).val();
                if (type === "1") {
                    $levelOne.show();
                    $levelTwo.hide();
                    $rankRow.hide();
                } else {
                    $levelTwo.show();
                    $levelOne.hide();
                    $rankRow.show();
                }
            })

            /**
             * 选择文件 点击事件
             */
            $all.find(".importForm input[type=file]").unbind('click').click(function (e) {
                $(this).val("");
                $all.find(".fileUploadName").val("");
            });

            /**
             * 选择文件 切换事件
             */
            $all.find(".importForm input[type=file]").unbind('change').change(function (e) {
                try {
                    $all.find(".fileUploadName").val("");
                    var src = e.target.value;
                    var fileName = src.substring(src.lastIndexOf('\\') + 1);
                    var fileExt = fileName.replace(/.+\./, "");
                    if ($rank.val() === "1") {  // 一档
                        if (fileExt !== "txt") {
                            layer.msg("请选择模板规定的txt文件!");
                            return;
                        }
                    } else {    // 二挡
                        var type = $rank.val();
                        var typeText = $typeId.find("option:selected").text();
                        if (type === "0") {
                            layer.msg("请选择资源类型");
                            return;
                        } else if (fileExt !== typeText.toLowerCase()) {
                            layer.msg("请选择模板规定的" + typeText.toLowerCase() + "文件");
                            return;
                        }
                    }
                    $all.find(".fileUploadName").val(fileName);
                } catch (e) {
                    console.log("file selected error");
                }
            })
        }
    }

    /**
     * 加载资源类型
     * @param element
     */
    obj.initResourceType = function (element) {
        globalRequest.iResource.queryResourceType(false, {}, function (data) {
            element.empty();
            if (data) {
                element.append("<option value='A' selected>B</option>".replace(/A/g, '').replace(/B/g, "请选择资源类型"));
                for (var i = 0; i < data.length; i++) {
                    element.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                }
            }
        }, function () {
            layer.alert("数据异常，获取资源类型失败", {icon: 6});
        });

    }

    /**
     * 加载沃讯类型
     * @param element
     */
    obj.initWoXunType = function (element) {
        globalRequest.iResource.queryWoXunContentType(false, {}, function (data) {
            element.empty();
            if (data) {
                element.append("<option value='A' selected>B</option>".replace(/A/g, '').replace(/B/g, "请选择沃讯类型"));
                for (var i = 0; i < data.length; i++) {
                    element.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                }
            }
        });
    }

    /**
     * 获取dataTable请求地址
     * @param type
     * @param id
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function (type, id) {
        switch (type) {
            case 1:
                var woXunName = encodeURIComponent($(".queryName").val()),
                    woXunType = $(".querySelectWoXunType").val();
                return "queryWoXunContentByPage.view?woXunName=" + woXunName + "&woxunType=" + woXunType;
            case 2:
                var resourceType = $("#show_resource_dialog .querySelectResourceType").val();
                return "queryWoXunResourceByPage.view?id=" + id + "&resourceType=" + resourceType;
        }
    }

    return obj;
}()

function onLoadBody() {
    woXunContentMgr.initWoXunType($(".querySelectWoXunType"));
    woXunContentMgr.iniData();
    woXunContentMgr.initEvent();
}