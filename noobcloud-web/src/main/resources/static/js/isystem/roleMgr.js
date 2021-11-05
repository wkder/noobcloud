var roleMgr_new = function () {
    var obj = {}, dataTable = {};
    var roleMgr_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    obj.iniData = function () {
        var options = {
            ele: $('.roleTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "name", title: "名称", width: "30%", className: "dataTableFirstColumns"},
                {data: "createUserName", title: "创建人", width: "15%"},
                {data: "createTime", title: "创建时间", width: "20%"},
                {data: "typeName", title: "角色类型", width: "15%"},
                {
                    title: "操作", width: "20%", className: "centerColumns",
                    render: function (data, type, row) {
                        var editBtnHtml = "<a title='编辑' class='editBtn btn btn-info btn-edit' href='javascript:void(0)' onclick='roleMgr_new.addOrEdit(\"{0}\",\"{1}\")' ><i class=\"fa fa-pencil-square-o\"></i></a>".autoFormat("update", row.id);
                        var deleteBtnHtml = "<a title='删除' class='btn btn-danger btn-delete' href='javascript:void(0)' onclick='roleMgr_new.delete(\"{0}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(row.id);
                        return editBtnHtml + deleteBtnHtml;
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
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })
    }

    /**
     * 新增、修改事件
     * @param operate
     */
    obj.addOrEdit = function (operate, id) {
        obj.initDialog();
        $plugin.iModal({
            title: operate === roleMgr_constant.operate.create ? "新增角色" : "修改角色",
            content: $("#addOrEdit_roleInfo_dialog"),
            area: ['750px', '650px'],
            btn: ['确定', '取消']
        }, function () {
            obj.save();
        }, null, function (layero, index) {
            obj.initElementValue(operate, id);
            layero.find(".operate").attr("index", index).attr("operate", operate);
        })
    }

    /**
     * 保存
     */
    obj.save = function () {
        var $all = $("#addOrEdit_roleInfo_dialog").find("div.roleInfo"),
            operate = $all.find(".operate").attr("operate"),
            index = $all.find(".operate").attr("index");
        var oData = $all.autoSpliceForm();
        //oData["permissionList"] = obj.spliceData(obj.getZTreeSelectedData("menuTree"), obj.getZTreeSelectedData("buttonTree"));
        oData["permissionMenuIds"] = obj.getZTreeSelectedData("menuTree")
        oData["permissionDataIds"] = obj.getZTreeSelectedData("buttonTree")
        if (!$all.autoVerifyForm()) {
            return;
        }

        if (operate === roleMgr_constant.operate.create) {
            globalRequest.createRoleInfo(true, oData, function (data) {
                success(data, operate);
            })
        } else {
            globalRequest.updateRoleInfo(true, oData, function (data) {
                success(data, operate);
            })
        }

        function success(data, operate) {
            var errorMsg = operate === roleMgr_constant.operate.create ? '新增失败' : '修改失败'
            var successMsg = operate === roleMgr_constant.operate.create ? '新增成功' : '修改成功'
            if (data.retValue !== 0) {
                layer.alert(errorMsg, {icon: 6});
                return;
            }
            layer.msg(successMsg, {time: 1000});
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
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
            globalRequest.deleteRole(true, {id: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert('删除失败,'+data.desc, {icon: 6});
                    return;
                }
                layer.msg('删除成功', {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
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
    obj.initDialog = function () {
        var $all = $("div.iMarket_Content").find("div.roleInfo").clone();
        $("#addOrEdit_roleInfo_dialog").empty().append($all);
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
        var $all = $("#addOrEdit_roleInfo_dialog").find("div.roleInfo"),
            $name = $all.find("[name='name']"),
            $type = $all.find("[name='type']"),
            $menuTree = $all.find("#menuTree"),
            $menuPermissionIds = $all.find("[name='permissionMenuIds']"),
            $buttonTree = $all.find("#buttonTree"),
            $permissionButtonIds = $all.find("[name='permissionButtonIds']"),
            $remarks = $all.find("[name='remarks']");
        initData();
        initEvent();

        function initData() {
            initRoleType();             // 初始化角色类型下拉框
            initAllPermissionData();    // 初始化角色等级下拉框、菜单权限、按钮权限
        }

        function initEvent() {
            /**
             * 角色等级下拉框 改变事件
             */
            $type.change(function () {
                initAllPermissionData();
            })
        }

        if (operate === roleMgr_constant.operate.update) {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            globalRequest.iSystem.queryRoleDetailById(false, {roleId: id}, function (data) {
                if (!data) {
                    layer.alert("数据异常,请刷新重试", {icon: 5});
                    return;
                }

                $("#addOrEdit_roleInfo_dialog").find("div.roleInfo").autoAssignmentForm(data);
                $type.change();
                var permissionData = obj.splitData(data.permissionList);
                obj.setZTreeNodeChecked("menuTree", permissionData.menuData);
                obj.setZTreeNodeChecked("buttonTree", permissionData.buttonData);
            })
            $type.attr("disabled", true)
        }


        /**
         * 初始化角色类型下拉框
         */
        function initRoleType() {
            globalRequest.iSystem.queryRoleTypes(false, {}, function (data) {
                $type.empty();
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        $type.append("<option value='A'>B</option>".replace(/A/g, data[i].val).replace(/B/g, data[i].text));
                    }
                }
            }, function () {
                layer.alert("系统异常，获取角色类型", {icon: 6});
            });
        }

        /**
         * 根据角色类型下拉框的值
         * 初始化角色等级下拉框、菜单权限、按钮权限
         */
        function initAllPermissionData() {
            globalRequest.iSystem.fetchChangedInfoOfType(false, {type: $type.val()}, function (data) {
                if (!data || data.retValue != "0") {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                if (data && data.permission) {
                    var permissionData = obj.filterPermissionData(data.permission)
                    initMenuPermission(permissionData.menuData);
                    initButtonPermission(permissionData.buttonData);
                }
            }, function () {
                layer.alert("系统异常，获取数据失败", {icon: 6});
            });

            function initMenuPermission(data) {
                var setting = {
                    view: {
                        dblClickExpand: false,
                        selectedMulti: true,
                        txtSelectedEnable: true
                    },
                    data: {simpleData: {enable: true}},
                    check: {enable: true, chkStyle: "checkbox"},
                    callback: {}
                };
                $.fn.zTree.init($menuTree, setting, data);
            }

            function initButtonPermission(data) {
                var setting = {
                    view: {
                        dblClickExpand: false,
                        selectedMulti: true,
                        txtSelectedEnable: true,
                        showLine: false
                    },
                    data: {simpleData: {enable: true}},
                    check: {enable: true, chkStyle: "checkbox"},
                    callback: {}
                };
                $.fn.zTree.init($buttonTree, setting, data);
            }
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        return "queryRolesByPage.view?name=" + $.trim($(".searchName").val());
    }

    /**
     * 过滤权限数据
     * @param data
     */
    obj.filterPermissionData = function (data) {
        var dataObj = {menuData: [], buttonData: []}
        var len = data.length;
        for (var i = 0; i < len; i++) {
            if (data[i].sourceType === 'm') {
                dataObj.menuData.push(data[i])
            } else if (data[i].sourceType === 'o') {
                dataObj.buttonData.push(data[i])
            }
        }
        return dataObj;
    }

    /**
     *
     * @param treeId
     * @returns {string}
     */
    obj.getZTreeSelectedData = function (treeId) {
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        var selectNode = zTree.getCheckedNodes();
        var permissionIds = [];
        for (var i = 0; i < selectNode.length; i++) {
            permissionIds.push(selectNode[i].id);
        }
        return permissionIds.join(",")
    }

    /**
     * 设置权限树的选中状态
     * @param treeId
     * @param data
     */
    obj.setZTreeNodeChecked = function (treeId, data) {
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        var node = zTree.getNodes();
        var allNodes = zTree.transformToArray(node)
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < allNodes.length; j++) {
                if (data[i]["id"] === allNodes[j]["id"]) {
                    allNodes[j]["checked"] = true;
                    zTree.updateNode(allNodes[j])
                }
            }
        }
    }

    /**
     * 拼接角色数据
     * @param data
     * @param type
     * @returns {Array}
     */
    obj.spliceData = function (menuData, buttonData) {
        var _menuData = "", _menuLen = 0, _buttonData = "", btnLen = 0, result = [];
        if (menuData) {
            _menuData = menuData.split(',');
            _menuLen = _menuData.length;
            for (var i = 0; i < _menuLen; i++) {
                result.push({id: _menuData[i], sourceType: 'm'});
            }
        }
        if (buttonData) {
            _buttonData = buttonData.split(',');
            btnLen = _buttonData.length;
            for (var i = 0; i < btnLen; i++) {
                result.push({id: _buttonData[i], sourceType: 'o'});
            }
        }
        return result;
    }

    /**
     *
     * @param data
     * @returns {{menuData: Array, buttonData: Array}}
     */
    obj.splitData = function (data) {
        var _len = data.length, result = {menuData: [], buttonData: []}
        for (var i = 0; i < _len; i++) {
            if (data[i].sourceType === 'm') {
                data[i]["checked"] = true
                result.menuData.push(data[i])
            } else if (data[i].sourceType === 'o') {
                data[i]["checked"] = true
                result.buttonData.push(data[i])
            }
        }
        return result
    }
    return obj;
}()

function onLoadBody() {
    roleMgr_new.iniData();
    roleMgr_new.initEvent();
}
