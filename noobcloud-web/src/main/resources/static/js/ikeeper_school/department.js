var department_school = function () {
    var obj = {}, loginUser = {};
    var department_school_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    /**
     * 初始化表格数据
     */
    obj.iniData = function () {
        var departmentName = encodeURIComponent($(".queryName").val());
        var type = $(".tab-row-container div.tab-item.active").data("part");
        globalRequest.iKeeper.queryRootOrgByOrgType(false, {orgName: departmentName, orgTypeId: type}, function (data) {
            if (data && data.length) {
                data.forEach(function (item) {
                    if (item.parentId == 0) {
                        item.level = 1;
                    } else {
                        item.level = obj.getItemLevel(data, item).level + 1;
                    }
                })
            }
            obj.setTabStyle(type);
            obj.sliceTable(data, type == 1 ? $("#departmentTable") : $("#businessTable"), type);
        })
    }

    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        /**
         * 新增根节点组织
         */
        $(".addBtn").click(function () {
            obj.addOrEdit(department_school_constant.operate.create);
        })

        /**
         * 查询
         */
        $(".searchBtn").click(function () {
            obj.iniData();
        })

        /**
         * tab切换
         */
        $(".tab-row-container div.tab-item").click(function () {
            if (!$(this).hasClass("active")) {
                $(this).siblings(".tab-item").removeClass("active").children("label").removeClass("active");
                $(this).addClass("active").children("label").addClass("active");
                obj.iniData()
            }
        })
    }

    /**
     * 新增、修改事件
     * @param operate
     */
    obj.addOrEdit = function (operate, id, name, parentId, level) {
        if (operate === department_school_constant.operate.create && level >= 6) {
            layer.alert("组织层级最多新增6级", {icon: 5});
            return;
        }
        obj.initDialog();
        obj.initElementValue(operate, id, name, parentId, level);
        $plugin.iModal({
            title: operate === department_school_constant.operate.create ? "新增组织" : "修改组织",
            content: $("#addOrEdit_department_dialog"),
            area: '600px',
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
        var $all = $("#addOrEdit_department_dialog").find("div.departmentInfo");
        var operate = $all.find(".operate").attr("operate");
        var index = $all.find(".operate").attr("index");

        if (!$all.autoVerifyForm()) {
            return;
        }
        var oData = $all.autoSpliceForm();
        delete oData.parentOrgName;
        delete oData.level;
        operate === department_school_constant.operate.create ? create() : update();

        /**
         * 新增
         */
        function create() {
            globalRequest.iKeeper.addOrg(true, oData, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                obj.iniData();
                layer.close(index);
            })
        }

        /**
         * 修改
         */
        function update() {
            globalRequest.iKeeper.updateOrg(true, oData, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                obj.iniData();
                layer.close(index);
            })
        }
    }

    /**
     * 删除事件
     * @param id
     * @param name
     * @param orgTypeId
     */
    obj.delete = function (id, name, orgTypeId) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定删除组织' + "【" + name + "】吗？", function () {
            globalRequest.iKeeper.deleteOrg(true, {orgId: id, orgTypeId: orgTypeId}, function (data) {
                if (!data.state) {
                    layer.alert(data.message, {icon: 6});
                    return;
                }
                layer.msg(data.message, {time: 1000});
                obj.iniData();
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
        var $all = $("div.iMarket_Content").find("div.departmentInfo").clone();
        $("#addOrEdit_department_dialog").empty().append($all);
    }

    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function (operate, id, name, parentId, level) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var type = $(".tab-row-container div.tab-item.active").data("part"),
            $all = $("#addOrEdit_department_dialog").find("div.departmentInfo"),
            $orgId = $all.find(".orgId"),
            $orgName = $all.find(".orgName"),
            $orgType = $all.find(".orgType"),
            $orgLevel = $all.find(".orgLevel"),
            $parentOrgName = $all.find(".parentOrgName"),
            $parentOrgId = $all.find(".parentOrgId"),
            $comments = $all.find(".comments"),
            $parentOrgNameRow = $all.find(".parentOrgNameRow");
        $orgType.attr("disabled", true);
        $orgLevel.attr("disabled", true);
        $parentOrgName.attr("disabled", true);

        if (operate == department_school_constant.operate.create) {
            if (parentId >= 0) { // 新增子级组织
                $orgType.val(type);
                $orgLevel.val(level + 1);
                $parentOrgName.val(name);
                $parentOrgId.val(id);
                $parentOrgNameRow.show();
            } else {    // 新增根级组织
                $orgType.val(type);
                $orgLevel.val(1);
                $parentOrgId.val(0);
                $parentOrgNameRow.hide();
            }
        } else {
            if (id <= 0) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            globalRequest.iKeeper.queryOrgListByOrgId(false, {orgId: id}, function (data) {
                if (data && data.length > 0) {
                    level == 1 ? $parentOrgNameRow.hide() : $parentOrgNameRow.show();
                    $orgId.val(data[0].orgId);
                    $orgName.val(data[0].orgName);
                    $orgType.val(data[0].orgTypeId);
                    $orgLevel.val(level);
                    $parentOrgName.val(data[0].parentOrgName);
                    $parentOrgId.val(data[0].orgId);
                    $comments.val(data[0].comments);
                }
            })
        }
    }

    /**
     * 拼接Table
     * @param data
     */
    obj.sliceTable = function (data, $table, type) {
        var html = "";
        $table.find("thead").empty();
        $table.find("tbody").empty();
        data.forEach(function (item, index) {
            html += '<tr lang="{id:{orgId},pid:{parentId},level:{level}}">'.autoFormat({
                orgId: item.orgId,
                parentId: item.parentId,
                level: item.level
            });
            html += '<td>{orgName}</td>'.autoFormat({orgName: item.orgName});
            html += '<td>{createDate}</td>'.autoFormat({createDate: item.createDate});
            html += '<td>{comments}</td>'.autoFormat({comments: item.comments});

            if (loginUser.identity === "cityManager") {
                html += "<td class='centerColumns'>";
                html += "<a class='btn btn-primary btn-add' title='新增' onclick='department_school.addOrEdit(\"{0}\",{1},\"{2}\",{3},{4})'><i class='fa fa-plus'></i></a>".autoFormat(department_school_constant.operate.create, item.orgId, item.orgName, item.parentId, item.level);
                html += "<a class='btn btn-info btn-edit' title='编辑' onclick='department_school.addOrEdit(\"{0}\",{1},\"{2}\",{3},{4})'><i class='fa fa-pencil-square-o'></i></a>".autoFormat(department_school_constant.operate.update, item.orgId, item.orgName, item.parentId, item.level);
                html += "<a class='btn btn-danger btn-delete' title='删除' onclick='department_school.delete({0},\"{1}\",{2})'><i class='fa fa-trash-o'></i></a>".autoFormat(item.orgId, item.orgName, item.orgTypeId)
                html += "</td>";
            }
        })
        $table.append(html);

        var icon = type == 1 ? "device" : "book";

        initTreeTable();

        function initTreeTable() {
            new oTreeTable($table.eq(0).attr("id"), $table[0], {
                showIcon: false,
                iconPath: 'ext/otreetable/imgs/default/'
            });
            if (loginUser.identity === "cityManager") {
                $table.prepend("<thead><tr><th>组织名称</th><th>创建时间</th><th>组织描述</th><th>操作</th></tr></thead>")
            } else {
                $table.prepend("<thead><tr><th>组织名称</th><th>创建时间</th><th>组织描述</th></tr></thead>")
            }
        }
    }

    /**
     * 获取表格数据层级
     * @param data 数据源
     * @param currentItem 当前数据
     * @returns {{}}
     */
    obj.getItemLevel = function (data, currentItem) {
        var findItem = {};
        for (var i = 0; i < data.length; i++) {
            if (data[i].orgId == currentItem.parentId) {
                findItem = data[i];
                break
            }
        }
        return findItem
    }

    /**
     * 设置Tab样式
     * @param type 类型(1:部门组织 2:业务组织)
     */
    obj.setTabStyle = function (type) {
        var $departmentRow = $("#departmentTable").parent("div.col-md-12");
        var $businessRow = $("#businessTable").parent("div.col-md-12");
        if (type == 1) {
            $businessRow.removeClass("fadeIn").addClass("hidden");
            $departmentRow.removeClass("hidden").addClass("fadeIn");
        } else {
            $departmentRow.removeClass("fadeIn").addClass("hidden")
            $businessRow.removeClass("hidden").addClass("fadeIn");
        }
    }

    /**
     * 判断当前人员身份
     */
    obj.initLoginUser = function () {
        loginUser = globalConfigConstant.loginUser;
        if (!loginUser) {
            loginUser.identity = "otherManager";
            $(".addBtn").remove();
            console.log("get loginUser error: loginUser is null");
            return;
        }

        if (loginUser.areaCode !== 99999 && loginUser.keeperUser && loginUser.keeperUser.isCanManage) { // 地市管理员 可以增删改
            loginUser.identity = "cityManager";
            $(".addBtn").show();
        } else {
            loginUser.identity = "otherManager";    // 省级管理员及末梢人员只能查看页面
            $(".addBtn").remove();
        }
    }

    return obj;
}()

function onLoadBody() {
    department_school.initLoginUser();
    department_school.iniData();
    department_school.initEvent();
}