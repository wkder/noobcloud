/**
 * Created by yangyang on 2016/2/25.
 *
 * 依赖jquery.js reuqest.js utils.js
 * 为了防止整个html页面过分庞大，不利于阅读。出现多次的div(搜索框、任务对话框、标签对话框、客户群对话框)等，使用占位符放在页面中，然后使用jquery进行初始化
 * 注意：加载的html片段，其事件定义、处理，就在本文件中。哪里加载html片段，哪里就对事件作定义和处理！
 */


/**
 * 需要局部刷新的放到这里（任务创建后，页面需要局部刷新）
 */
var globalLocalRefresh = {
    refreshRoleList: function (condition) {
        $("div.iMarket_Body div.roleRefreshBtn").trigger("click", [condition]);
    },
    refreshUserList: function (condition) {
        $("div.iMarket_Body div.userRefreshBtn").trigger("click", [condition]);
    },
    refreshTaskList: function (condition) {
        $("div.iMarket_Body div.taskRefreshBtn").trigger("click", [condition]);
    },
    refreshModleList: function (condition) {
        $("#menuTree .active-menu").trigger("click", [condition]);
    },
    refreshConsoleTaskList: function (condition) {
        $("div.consoleTaskRefreshBtn").trigger("click", [condition]);
    },
    refreshConsoleFinishTaskList: function () {
        $("div.consoleFinishTaskRefreshBtn").trigger("click");
    },
    refreshModelDownloadSetting: function () {
        $("div.modelDownloadSettingRefreshBtn").trigger("click");
    },
    refreshKeeperUser: function () {
        $("div.keeperUserRefreshBtn").trigger("click");
    }
};

var globalConfigConstant = {
    dimensionDetail: {},
    dimension: {},
    dataPermissionList: [],
    smsAccessNumber: [],
    loginUser: {},
    session: {}
};


/**
 * 重复使用的html片段(比如各种对话框内容)放到这里
 * 使用jquery的appand方法追加元素
 */
/*var htmlHandle = {
    province: $system.getProvince(),
    province_enum: {
        sh: "上海",
        js: "江苏"
    },
    /!**
     * initSearchHtml(type,class,sortNo,[placeholder|options[value,text]])
     *
     * 公共:
     *      参数1：类型
     *      参数2：class
     *      参数3：将要在查询中的排列顺序
     *  input:
     *      参数4：placeholder
     *  select:
     *      参数4：options
     *          options：参数1：数据格式(1:默认数组，2：json格式，主要用户数据量较大时)
     *                   参数2...n：数据value,text,value,text,value,text,value,text....value,text
     *!/
    handleRole: function ($dialog, initValue) {
        var $all = $("div.iMarket_Content").find("div.roleInfo").clone();
        $dialog.empty().append($all);

        var $menuPermissionBtn = $all.find(".menuPermissionBtn");
        var $dataPermissionBtn = $all.find(".dataPermissionBtn");
        var $roleName = $all.find(".roleName");
        var $roleType = $all.find(".roleType");
        var $homePageSelect = $all.find(".homePageSelect");
        var $menuPermissionShow = $all.find(".menuPermissionShow");
        var $menuPermissionIds = $all.find(".menuPermissionIds");
        var $dataPermissionShow = $all.find(".dataPermissionShow");
        var $dataPermissionIds = $all.find(".dataPermissionIds");
        var $remarks = $all.find(".remarks");
        var $handleBtn = $all.find(".handleBtn");

        if (initValue) {
            $roleName.val(initValue.name);
            $remarks.val(initValue.remarks);
            $roleType.val(initValue.type);
            $menuPermissionIds.val(initValue.permissionMenuIds);
            $dataPermissionIds.val(initValue.permissionDataIds);
            renderNames($menuPermissionShow, initValue.permissionMenuNames);
            renderNames($dataPermissionShow, initValue.permissionDataNames);
            initHomePageSelect();
            $homePageSelect.val(initValue.homePageId);
        }

        initEvent();

        function renderNames($permissionShow, names) {
            if (names) {
                var permissions = [], nameArray = names.split(",");
                for (var i = 0; i < nameArray.length; i++) {
                    permissions.push("<span class='pRender' title='" + nameArray[i] + "'>" + nameArray[i] + "</span>");
                }
                $permissionShow.append(permissions.join(""));
            }
        }

        function initHomePageSelect() {
            if ($menuPermissionIds.val()) {
                var idNames = initValue.permissionIdNames ? initValue.permissionIdNames.split(",") : [],
                    homePageSelect = [];
                for (var i = 0; i < idNames.length; i++) {
                    var idName = idNames[i].split("^");
                    homePageSelect.push("<option value=" + idName[0] + ">" + idName[1] + "</option>");
                }
                $homePageSelect.empty().append(homePageSelect.join(""));
            }
        }

        function initEvent() {
            $menuPermissionBtn.click(function () {
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

                globalRequest.queryAllPermissions(true, {type: "MENU"}, function (data) {
                    var menuPermissionRoot = {
                        id: '0',
                        pId: '-1',
                        name: '菜单权限',
                        isParent: true,
                        checked: false,
                        nocheck: false,
                        open: true
                    };
                    data.push(menuPermissionRoot);

                    var menuPIds = $menuPermissionIds.val();

                    if (menuPIds) {
                        var menuPIdArray = menuPIds ? menuPIds.split(",") : [];
                        for (var i = 0; i < data.length; i++) {
                            if (menuPIdArray.indexOf(data[i].id + "") >= 0) {
                                data[i]["checked"] = true;
                            }
                        }
                    }

                    $.fn.zTree.init($("#treePrimary"), setting, data);
                });

                layer.open({
                    type: 1,
                    shade: 0.3,
                    title: "菜单权限选择",
                    offset: '80px',
                    area: ['350px', '400px'],
                    content: $('#dialogTreePrimary'),
                    closeBtn: 0,
                    btn: ["确定", "取消"],
                    yes: function (index, layero) {
                        var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                        var selectNode = zTree.getCheckedNodes();
                        var menuPermissions = [], menuPermissionIds = [];
                        var homePageSelect = [];
                        for (var i = 0; i < selectNode.length; i++) {
                            menuPermissions.push("<span class='pRender' title='" + selectNode[i].name + "'>" + selectNode[i].name + "</span>");
                            menuPermissionIds.push(selectNode[i].id);
                            if (!selectNode[i].isParent) {
                                homePageSelect.push("<option value='" + selectNode[i].id + "'>" + selectNode[i].name + "</option>");
                            }
                        }
                        $menuPermissionShow.empty().append(menuPermissions.join(""));
                        $menuPermissionIds.val(menuPermissionIds.join(","));
                        $homePageSelect.empty().append(homePageSelect.join(""));
                        layer.close(index);
                    },
                    cancel: function (index, layero) {
                        layer.close(index);
                    }
                });
            });

            $dataPermissionBtn.click(function () {
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

                globalRequest.queryAllPermissions(true, {type: "DATA"}, function (data) {
                    var dataPermissionRoot = {
                        id: 'data',
                        pId: '-1',
                        name: '数据权限',
                        isParent: true,
                        checked: false,
                        nocheck: false
                    };
                    data.push(dataPermissionRoot);

                    var dataPIds = $dataPermissionIds.val();

                    if (dataPIds) {
                        var dataPIdArray = dataPIds ? dataPIds.split(",") : [];
                        for (var i = 0; i < data.length; i++) {
                            if (dataPIdArray.indexOf(data[i].id) >= 0) {
                                data[i]["checked"] = true;
                            }
                        }
                    }

                    $.fn.zTree.init($("#treePrimary"), setting, data);
                });

                layer.open({
                    type: 1,
                    shade: 0.3,
                    title: "数据权限选择",
                    offset: '80px',
                    area: ['350px', '400px'],
                    content: $('#dialogTreePrimary'),
                    closeBtn: 0,
                    btn: ["确定", "取消"],
                    yes: function (index, layero) {
                        var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                        var selectNode = zTree.getCheckedNodes();
                        var dataPermissions = [], dataPermissionIds = [];
                        for (var i = 0; i < selectNode.length; i++) {
                            dataPermissions.push("<span class='pRender' title='" + selectNode[i].name + "'>" + selectNode[i].name + "</span>");
                            dataPermissionIds.push(selectNode[i].id);
                        }
                        $dataPermissionShow.empty().append(dataPermissions.join(""));
                        $dataPermissionIds.val(dataPermissionIds.join(","));
                        layer.close(index);
                    },
                    cancel: function (index, layero) {
                        layer.close(index);
                    }
                });
            });

            $handleBtn.click(function () {
                var $this = $(this), index = $this.attr("index"), operate = $this.attr("operate");
                var role = {};
                if (!checkParams(role)) {
                    return;
                }
                if (operate == "create") {
                    globalRequest.createRoleInfo(true, role, function (data) {
                        if (data.retValue !== 0) {
                            layer.alert("创建失败," + data.desc);
                        } else {
                            layer.msg("创建成功");
                            globalLocalRefresh.refreshRoleList();
                            layer.close(index);
                        }
                    }, function () {
                        layer.alert("系统异常", {icon: 6});
                    });
                } else if (operate == "update") {
                    role["id"] = initValue.id;
                    globalRequest.updateRoleInfo(true, role, function (data) {
                        if (data.retValue !== 0) {
                            layer.alert("更新失败," + data.desc);
                        } else {
                            layer.msg("更新成功");
                            globalLocalRefresh.refreshRoleList();
                            layer.close(index);
                        }
                    }, function () {
                        layer.alert("系统异常", {icon: 6});
                    });
                }

                function checkParams(role) {
                    if (utils.valid($roleName, utils.notEmpty, role, "name")
                        && utils.valid($roleType, utils.notEmpty, role, "type")
                        && utils.valid($homePageSelect, utils.any, role, "homePageId")
                        && utils.valid($menuPermissionIds, utils.any, role, "permissionMenuIds")
                        && utils.valid($dataPermissionIds, utils.any, role, "permissionDataIds")
                        && utils.valid($remarks, utils.any, role, "remarks")) {
                        return true;
                    }
                    return false;
                }
            });
        }
    },

    handleUser: function ($dialog, initValue, operate) {
        var $all = $("div.iMarket_Content").find("div.userInfo").clone();
        $dialog.empty().append($all);

        var $userName = $all.find(".name");
        var $telephone = $all.find(".telephone");
        var $password = $all.find(".password");
        var $areaId = $all.find(".areaId");
        var $areaCode = $all.find(".areaCode");
        var $areaName = $all.find(".areaName");
        var $businessHallNames = $all.find(".businessHallNames");
        var $businessHallIds = $all.find(".businessHallIds");
        var $email = $all.find(".email");
        var $roleNames = $all.find(".roleNames");
        var $roleIds = $all.find(".roleIds");
        var $roleType = $all.find(".roleType");
        var $homePageSelect = $all.find(".homePageSelect");
        var $segmentAuditNames = $all.find(".segmentAuditNames");
        var $segmentAuditUsers = $all.find(".segmentAuditUsers");
    /!*    var $tagAuditNames = $all.find(".tagAuditNames");
        var $tagAuditUsers = $all.find(".tagAuditUsers");*!/
        var $marketAuditNames = $all.find(".marketAuditNames");
        var $marketingAuditUsers = $all.find(".marketingAuditUsers");
        var $messagePushAuditNames = $all.find(".messagePushAuditNames");
        var $messagePushAuditUsers = $all.find(".messagePushAuditUsers");
        var $remarks = $all.find(".remarks");

        var $areaSelectBtn = $all.find(".areaSelectBtn");
        var $businessHallSelectBtn = $all.find(".businessHallSelectBtn");
        var $roleSelectBtn = $all.find(".roleSelectBtn");
        var $auditUserBtn = $all.find(".auditUserBtn");
        var $userHandleBtn = $all.find(".userHandleBtn");
        var $businessHall = $all.find("div.businessHall.row");

        var $modelAudit = $all.find("div.modelAudit.row");
        //var $tagAudit = $all.find("div.tagAudit.row");

        if ($system.PROVINCE_ENUM.JS != $system.getProvince()) {
            $all.find("div.messagePushAuditDiv").remove();
        }

        if (initValue) {
            $userName.val(initValue.name);
            $telephone.val(initValue.telephone);
            $email.val(initValue.email);
            $remarks.val(initValue.remarks);
            $areaId.val(initValue.areaId);
            $areaCode.val(initValue.areaCode);
            $areaName.val(initValue.areaName);
            $businessHallNames.val(initValue.businessHallNames);
            $businessHallIds.val(initValue.businessHallIds);
            $segmentAuditNames.val(initValue.segmentAuditUserNames);
            $segmentAuditUsers.val(initValue.segmentAuditUsers);
/!*            $tagAuditNames.val(initValue.tagAuditUserNames);
            $tagAuditUsers.val(initValue.tagAuditUsers);*!/
            $marketAuditNames.val(initValue.marketingAuditUserNames);
            $marketingAuditUsers.val(initValue.marketingAuditUsers);
            $messagePushAuditNames.val(initValue.messagePushAuditUserNames);
            $messagePushAuditUsers.val(initValue.messagePushAuditUsers);
            $roleNames.val(initValue.roleNames);
            $roleIds.val(initValue.roleIds);
            $roleType.val(initValue.userType);
            $all.find("input.password").closest("div.row").find("span.must").remove();
            //如果有营业厅则显示营业厅信息框
            if (initValue.areaId != 99999) {
                $businessHall.show();
            }
            if (initValue.userType == 2) {
                $modelAudit.hide();
                //$tagAudit.hide();
            }

            initSelectedMenu(initValue.roleIds, initValue.homePage);
        }
        //新增时，登录用户不是省级用户时，只能同市的营业厅用户
        if (globalConfigConstant.loginUser.areaId != 99999) {
            $areaSelectBtn.remove();
            $areaId.val(globalConfigConstant.loginUser.areaId);
            $areaCode.val(globalConfigConstant.loginUser.areaCode);
            $areaName.val(globalConfigConstant.loginUser.areaName);
            $businessHall.show();
        }

        if (operate == "view") {
            $all.find("input").attr("disabled", "disabled");
            $all.find("textarea").attr("disabled", "disabled");
            $all.find("button.btn").remove();
            $all.find("input.password").closest("div.row").remove();
            return;
        }
        initEvent();
        function initEvent() {
            $areaSelectBtn.click(function () {
                var setting = {
                    view: {
                        dblClickExpand: true
                    },
                    edit: {
                        enable: true,
                        showRemoveBtn: false,
                        showRenameBtn: false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        },
                        keep: {
                            leaf: true,
                            parent: true
                        }
                    },
                    check: {
                        enable: true,
                        chkStyle: "radio",
                        radioType: "all"
                    },
                    callback: {
                        beforeCheck: function (treeId, treeNode) {
                            if (initValue) {
                                var flag = true;
                                globalRequest.checkChangeUserArea(false, {"USER_ID": initValue.id}, function (data) {
                                    //如果有特殊要求，则设置specialFlag为true，返回信息为不加处理的所有信息
                                    if (data.retValue != 0) {
                                        flag = false;
                                        layer.alert("错误，" + data.desc);
                                    }
                                }, function () {
                                    layer.alert("系统异常");
                                });
                                return flag;
                            }
                            return true;
                        }
                    }
                };
                globalRequest.iScheduling.queryUserAreas(true, {}, function (data) {
                    if (data && data.length > 0) {
                        var selectId = $areaId.val();
                        if (selectId) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].id == selectId) {
                                    data[i].checked = true;
                                    break;
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
                            closeBtn: 0,
                            btn: ['确定', '取消'],
                            yes: function (index, layero) {
                                var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                                var nodes = zTree.getCheckedNodes();

                                if (nodes.length > 0) {
                                    if (nodes[0].pId && $areaId.val() != nodes[0].id) {
                                        $businessHall.show();
                                        $businessHallNames.val("");
                                        $businessHallIds.val("");
                                    } else if (!nodes[0].pId) {
                                        $businessHall.hide();
                                        $businessHallNames.val("");
                                        $businessHallIds.val("");
                                    }

                                    $areaName.val(nodes[0].name);
                                    $areaId.val(nodes[0].id);
                                    $areaCode.val(nodes[0].element.code);
                                } else {
                                    $areaName.val("");
                                    $areaId.val("");
                                }
                                //当用户地区发成改变时，做默认处理
                                $roleNames.val("");
                                $roleIds.val("");
                                $roleType.val("");
                                $marketAuditNames.val("");
                                $marketingAuditUsers.val("");
                                $modelAudit.show();
                                $tagAudit.show();
                                $homePageSelect.empty();
                                layer.close(index);
                            },
                            cancel: function (index, layero) {
                                layer.close(index);
                            }
                        });
                    }
                }, function () {
                    layer.alert("系统异常：查询用户目录失败");
                });
            });

            $businessHallSelectBtn.click(function () {
                var $businessHall = $("<div class='businessHall'>" +
                    "<div class='businessHallSearch' style='margin: 5px 20px;'>" +
                    "<input class='name form-control' type='text' style='width: 50%;display: inline-block;margin-right: 20px;'/>" +
                    "<button class='searchBtn btn btn-primary'><i class='fa fa-search'></i>搜索</button>" +
                    "</div>" +
                    "<div class='businessHallList'>" +
                    "<table class='businessHallTable table' style='width:100%;'></table>" +
                    "</div>" +
                    "</div>");
                var userId = initValue ? initValue.id : "";
                var url = "";
                if (htmlHandle.province === htmlHandle.province_enum.sh) {
                    url = "queryBusinessHallByCondition.view?areaCode=" + $areaCode.val() + "&baseTypeId=1,2&editUserId=" + userId;
                } else {
                    url = "queryBusinessHallByCondition.view?areaCode=" + $areaCode.val() + "&baseTypeId=1,7&editUserId=" + userId;
                }
                var selectedBusinessHallNames = $businessHallNames.val() ? $businessHallNames.val().split(",") : [],
                    selectedBusinessHallIds = $businessHallIds.val() ? $businessHallIds.val().split(",") : [],
                    dataTable;
                $("#dialogMiddle").empty().append($businessHall);
                initData();
                initEvent();
                function initData() {
                    var options = {
                        ele: $businessHall.find('table.businessHallTable'),
                        ajax: {url: url, type: "POST"},
                        columns: [
                            {
                                data: "id", width: "20%",
                                render: function (data, type, row) {
                                    if (selectedBusinessHallIds.indexOf(row.id + "") >= 0) {
                                        return '<input type="checkbox" name="id" checked value="' + row.id + '"/>';
                                    }
                                    return '<input type="checkbox" name="id" value="' + row.id + '"/>';
                                }
                            },
                            {data: "name", title: "营业厅名称", width: "70%"}
                        ]
                    };
                    dataTable = $plugin.iCompaignTable(options);
                }

                function initEvent() {
                    $businessHall.on("click", "input[name = id]", function () {
                        var $this = $(this);
                        var $businessHallName = $this.closest("td").siblings("td");
                        if ($this.is(":checked")) {
                            selectedBusinessHallIds.push($this.val());
                            selectedBusinessHallNames.push($businessHallName.text());
                        } else {
                            var indexId = selectedBusinessHallIds.indexOf($this.val());
                            var indexName = selectedBusinessHallIds.indexOf($this.val());
                            selectedBusinessHallIds.splice(indexId, 1);
                            selectedBusinessHallNames.splice(indexName, 1);
                        }
                    });

                    $businessHall.on("click", "div.businessHallSearch .searchBtn", function () {
                        var $this = $(this), name = $this.siblings(".name").val();
                        dataTable.ajax.url(url + "&name=" + name);
                        dataTable.ajax.reload();
                    });
                }


                layer.open({
                    type: 1,
                    shade: 0.3,
                    title: "营业厅选择",
                    offset: '80px',
                    area: ['700px', '660px'],
                    content: $('#dialogMiddle'),
                    closeBtn: 0,
                    btn: ["确定", "取消"],
                    yes: function (index, layero) {
                        $businessHallNames.val(selectedBusinessHallNames.join(","));
                        $businessHallIds.val(selectedBusinessHallIds.join(","));
                        layer.close(index);
                    },
                    cancel: function (index, layero) {
                        layer.close(index);
                    }
                });
            });

            $auditUserBtn.click(function () {
                var $this = $(this), $row = $this.closest(".row");
                var $auditUserName = $row.find(".auditNames");
                var $auditUsersDetail = $row.find(".auditUserDetail");
                var userId = initValue ? initValue.id : null;

                var auditTypeName, auditType;
                if ($this.hasClass("auditModel")) {
                    auditTypeName = "模型";
                    auditType = "auditModel";
                } else if ($this.hasClass("auditTag")) {
                    auditTypeName = "标签";
                    auditType = "auditTag";
                } else if ($this.hasClass("auditMarketJob")) {
                    auditTypeName = "营销任务";
                    auditType = "auditMarketJob";
                } else if ($this.hasClass("auditMessagePush")) {
                    auditTypeName = "消息推送任务";
                    auditType = "auditMessagePush";
                }

                var initValueSub = {
                    userId: userId,
                    selectArea: $areaId.val(),
                    auditType: auditType,
                    operate: $userHandleBtn.attr("operate"),
                    auditTypeName: auditTypeName,
                    auditUsers: $auditUsersDetail.val()
                };
                htmlHandle.selectAuditUser($("#dialogMiddle"), initValueSub);

                layer.open({
                    type: 1,
                    shade: 0.3,
                    title: auditTypeName + "审批人配置",
                    offset: '80px',
                    area: ['550px', '520px'],
                    content: $("#dialogMiddle"),
                    closeBtn: 0,
                    btn: ['确定', '取消', "清空"],
                    yes: function (index, layero) {
                        var $auditTrs = layero.find(".auditUserTab tr.auditCt");
                        var auditUserDetail = [];
                        var auditUserNames = [];
                        var isContinue = true;

                        $auditTrs.each(function () {
                            var auditUserInfo = {};
                            var $order = $(this).find("span.order");
                            var $auditUser = $(this).find("input.auditUserId");
                            var $auditUserName = $(this).find("input.auditUserName");

                            auditUserInfo["order"] = $order.attr("order-val");
                            if (auditUserInfo["order"] == 0) {
                                if (!$auditUser.val()) {
                                    return;
                                }
                            }
                            if (!(utils.valid($auditUser, (auditUserInfo["order"] == 0?utils.any: utils.notEmpty), auditUserInfo, "auditUser")
                                && utils.valid($auditUserName, (auditUserInfo["order"] == 0?utils.any: utils.notEmpty), auditUserInfo, "auditUserName"))) {
                                isContinue = false;
                                return false;
                            }
                            auditUserDetail.push(auditUserInfo);
                            auditUserNames.push($auditUserName.val() + "(" + (auditUserInfo["order"] == 0?'终': auditUserInfo["order"]) + "级审批)");
                        });
                        if (!isContinue) {
                            return;
                        }
                        $auditUserName.val(auditUserNames.join(","));
                        $auditUsersDetail.val(JSON.stringify(auditUserDetail));

                        layer.close(index);
                    },
                    cancel: function (index, layero) {

                        layer.close(index);
                    },
                    btn3: function (index, layero) {
                        if ($userHandleBtn.attr("operate") != "create" && !htmlHandle.checkChangeAuditUser(userId, auditType, auditTypeName)) {
                            return;
                        }
                        $auditUserName.val("");
                        $auditUsersDetail.val("");
                        layer.close(index);
                    }
                });
            });

            $roleSelectBtn.click(function () {
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
                        },
                        keep: {
                            leaf: true,
                            parent: true
                        }
                    },
                    check: {
                        enable: true,
                        chkStyle: "checkbox"
                    },
                    callback: {
                        beforeCheck: function (treeId, treeNode) {
                            if (initValue) {
                                var flag = true;
                                globalRequest.checkChangeUserArea(false, {"USER_ID": initValue.id}, function (data) {
                                    //如果有特殊要求，则设置specialFlag为true，返回信息为不加处理的所有信息
                                    if (data.retValue != 0) {
                                        flag = false;
                                        layer.alert("错误，" + data.desc);
                                    }
                                }, function () {
                                    layer.alert("系统异常");
                                });
                                return flag;
                            }
                            return true;
                        }
                    }
                };
                globalRequest.queryRolesForType(true, {}, function (data) {
                    //var roleRoot = {id: 'role0', pId: '-1', name: '角色配置', isParent: true, nocheck: true, open: true};
                    var selectRoleIds = $roleIds.val() ? $roleIds.val().split(",") : [];
                   // data.push(roleRoot);
                    var selectType = []
                    if (selectRoleIds.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            if (selectRoleIds.indexOf(data[i].id + "") >= 0) {
                                data[i].checked = true;
                                selectType.push("t_" + data[i].type)
                            }
                        }
                        for (var i = 0; i < data.length; i++) {
                            if (selectType.indexOf(data[i].id + "") >= 0) {
                                data[i].checked = true;
                            }
                        }
                    }
                    $.fn.zTree.init($("#treePrimary"), setting, data);

                    layer.open({
                        type: 1,
                        shade: 0.3,
                        title: "角色选择",
                        offset: '80px',
                        area: ['350px', '450px'],
                        content: $('#dialogTreePrimary'),
                        closeBtn: 0,
                        btn: ["确定", "取消"],
                        yes: function (index, layero) {
                            var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                            var selectNodes = zTree.getCheckedNodes();
                            var roleIds = [], roleNames = [], type = 1;
                            for (var i = 0; i < selectNodes.length; i++) {
                                if (!selectNodes[i].isParent) {
                                    if (selectNodes[i].type != 1) {
                                        type = selectNodes[i].type;
                                    }
                                    roleIds.push(selectNodes[i].id);
                                    roleNames.push(selectNodes[i].name);
                                }
                            }
                            $roleIds.val(roleIds.join(","));
                            $roleNames.val(roleNames.join(","));
                            $roleType.val(type);

                            initSelectedMenu(roleIds.join(","));

                            //如果选择的是炒店角色那么隐藏模型和标签审批人选择框，同时营销审批人默认是当前登录用户
                            var auditUserDetail = {
                                "order": "1",
                                "auditUser": globalConfigConstant.loginUser.id + "",
                                "auditUserName": globalConfigConstant.loginUser.name
                            };
                            var auditUserName = globalConfigConstant.loginUser.name + "(1级审批)";

                            if (type == 2222) {
                                $modelAudit.hide();
                                //$tagAudit.hide();
                                $marketAuditNames.val(auditUserName);
                                $marketingAuditUsers.val(JSON.stringify([auditUserDetail]));
                            } else {
                                $modelAudit.show();
                                //$tagAudit.show();
                                $marketAuditNames.val("");
                                $marketingAuditUsers.val("");
                            }

                            layer.close(index);
                        },
                        cancel: function (index, layero) {
                            layer.close(index);
                        }
                    });
                });
            });

            $userHandleBtn.click(function () {
                var $this = $(this), index = $this.attr("index"), operate = $this.attr("operate");
                var user = {};
                if (!checkParams(user, operate)) {
                    return;
                }
                if (operate == "create") {
                    globalRequest.createUser(true, user, function (data) {
                        if (data.retValue !== 0) {
                            if (data.retValue == -4) {
                                $businessHallNames.val("");
                                $businessHallIds.val("");
                            }
                            layer.alert("创建失败," + data.desc);
                        } else {
                            layer.msg("创建成功");
                            globalLocalRefresh.refreshUserList();
                            layer.close(index);
                        }
                    }, function () {
                        layer.alert("系统异常", {icon: 6});
                    });
                } else if (operate == "update") {
                    user["id"] = initValue.id;
                    globalRequest.updateUser(true, user, function (data) {
                        if (data.retValue !== 0) {
                            if (data.retValue == -4) {
                                $businessHallNames.val("");
                                $businessHallIds.val("");
                            }
                            layer.alert("更新失败," + data.desc);
                        } else {
                            layer.msg("更新成功");
                            globalLocalRefresh.refreshUserList();
                            layer.close(index);
                        }
                    }, function () {
                        layer.alert("系统异常", {icon: 6});
                    });
                }
            });

            function checkParams(user, operate) {
                if (utils.valid($userName, utils.notEmpty, user, "name")
                    && utils.valid($telephone, utils.isPhone, user, "telephone")
                    && ((operate == "create" && utils.valid($password, utils.password, user, "password"))
                    || (operate == "update" && utils.valid($password, utils.any, user, "password")))
                    && utils.valid($areaId, utils.notEmpty, user, "areaId")
                   /!* && ((globalConfigConstant.loginUser.areaId == 99999 && utils.valid($businessHallIds, utils.any, user, "businessHallIds"))
                    || (globalConfigConstant.loginUser.areaId != 99999 && utils.valid($businessHallIds, utils.notEmpty, user, "businessHallIds")))*!/
                    && utils.valid($businessHallIds, utils.any, user, "businessHallIds")
                    && utils.valid($email, utils.isEmail, user, "email")
                    && utils.valid($roleIds, utils.notEmpty, user, "roleIds")
                    && utils.valid($homePageSelect, utils.notEmpty, user, "homePage")
                    && utils.valid($segmentAuditUsers, utils.any, user, "segmentAuditUsers")
                    //&& utils.valid($tagAuditUsers, utils.any, user, "tagAuditUsers")
                    && utils.valid($marketingAuditUsers, utils.notEmpty, user, "marketingAuditUsers")
                    && utils.valid($messagePushAuditUsers, utils.any, user, "messagePushAuditUsers")
                    && utils.valid($remarks, utils.any, user, "remarks")) {
                    return true;
                }
                return false;
            }
        }

        function initSelectedMenu(roleIds, value) {
            globalRequest.queryAppointedRoleMenus(false,{"roleIds": roleIds},function(data){
                var menuArray = [];
                for (var i =0;i<data.length;i++) {
                    menuArray.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
                }
                $homePageSelect.empty().append(menuArray.join(""));
                if (value) {
                    $homePageSelect.val(value);
                }
            });
        }
    },
    distributionUserRole: function($dialog, initValue){
        var $all = $("div.iMarket_Content").find("div.distributionUserRoleInfo").clone();
        $dialog.empty().append($all);
        var $areaSelect = $all.find(".areaSelect");
        var $subAdminSelect = $all.find(".subAdminSelect");
        var $businessHallTypeSelect = $all.find(".businessHallTypeSelect");
        var $unDistributionData = $all.find(".unDistributionData");
        var $onDistributionData = $all.find(".onDistributionData");
        var $changeBtn = $all.find(".changeBtn .btn");
        var $distributionBtn = $all.find(".distributionBtn")
        initDistributionSearch();
        initEvent();
        //初始化加载所有营业厅
        $subAdminSelect.trigger("change");

        function initDistributionSearch(){
            //加载当前登录用户的区域信息
            var loginUser = globalConfigConstant.loginUser;
            $areaSelect.append("<option value='"+loginUser.areaId+"'>"+loginUser.areaName+"</option>");
            $areaSelect.val(loginUser.areaId);

            //加载我创建的子管理员
            globalRequest.queryAllMyCreatedSubUsers(false,{"userId":loginUser.id},function(data){
                var userArray = [];
                for (var i =0;i<data.length;i++) {
                    userArray.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
                }
                $subAdminSelect.append(userArray.join(""));
            });

            //加载营业厅类型
            globalRequest.queryBaseAreaType(false,{},function(data){
                var businessHallType = [];
                for (var i =0;i<data.length;i++) {
                    businessHallType.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
                }
                $businessHallTypeSelect.append(businessHallType.join(""));
            });
        }

        function initEvent (){
            $subAdminSelect.change(function(e,selectedBusinessHalls){
                var businessHallType = $businessHallTypeSelect.val();
                globalRequest.queryUnderMeBusinessHallsByCondition(false,{"targetUserId":$subAdminSelect.val(),"businessHallType": businessHallType,"selectedBusinessHalls":selectedBusinessHalls},function(data){
                    var unDistributionData = data["unDistribution"],onDistributionData = data["onDistribution"];
                    var unDistributionArray = [],onDistributionArray = [];
                    for (var i =0;i<unDistributionData.length;i++) {
                        unDistributionArray.push("<li value='"+unDistributionData[i].id+"' type='"+unDistributionData[i].locationTypeId+"' title='"+unDistributionData[i].name+"'>"+unDistributionData[i].name+"</li>");
                    }
                    for (var i =0;i<onDistributionData.length;i++) {
                        onDistributionArray.push("<li value='"+onDistributionData[i].id+"' type='"+onDistributionData[i].locationTypeId+"' title='"+onDistributionData[i].name+"'>"+onDistributionData[i].name+"</li>");
                    }
                    $unDistributionData.empty().append(unDistributionArray.join(""));
                    $onDistributionData.empty().append(onDistributionArray.join(""));
                });
            });

            $businessHallTypeSelect.change(function(){
                var selectedBusinessHalls = [];
                $onDistributionData.find("li").each(function(){
                    selectedBusinessHalls.push($(this).attr("value"));
                });
                $subAdminSelect.trigger("change",[selectedBusinessHalls.join(",")]);
            });

            $unDistributionData.on("click","li",function(){
                var $this = $(this);
                $this.addClass("active").siblings("li").removeClass("active");
            });

            $onDistributionData.on("click","li",function(){
                var $this = $(this);
                $this.addClass("active").siblings("li").removeClass("active");
            });

            $changeBtn.click(function(){
                var $this = $(this);
                if ($this.hasClass("right")) {
                    var $selectLi = $unDistributionData.find("li.active");
                    if ($selectLi.length == 0) {
                        return;
                    }
                    $selectLi.removeClass("active").hide();
                    $onDistributionData.append($selectLi.clone().show());
                }else if ($this.hasClass("left")){
                    var $selectLi = $onDistributionData.find("li.active");
                    if ($selectLi.length == 0) {
                        return;
                    }
                    var type = $selectLi.attr("type");
                    if (type == $businessHallTypeSelect.val()){
                        $unDistributionData.append($selectLi.clone().removeClass("active"));
                    }
                    $selectLi.remove();
                }
            });

            $distributionBtn.click(function(){
                var index = $(this).attr("index");

                var subAdmin = $subAdminSelect.val();
                var selectBusinessHallIds = [];
                $onDistributionData.find("li").each(function(){
                    selectBusinessHallIds.push($(this).attr("value"));
                });

                if (!subAdmin || subAdmin == -1){
                    $html.warning("请指定审批人！");
                    return false;
                }

                if (selectBusinessHallIds.length == 0){
                    $html.warning("请选择需要分配审批人的营业厅！");
                    return false;
                }

                globalRequest.batchUpdateUsersAuditUser(false,{subAdmin:subAdmin,businessHallIds:selectBusinessHallIds.join(",")},function(data){
                    if (data.retValue != 0){
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("保存成功！");
                    layer.close(index);
                });
            });
        }

    },

    selectAuditUser: function ($dialog, initValue) {
        var $all = $(".iMarket_Content").find("div.auditUserSelectInfo").clone();
        $dialog.empty().append($all);

        var $auditUserTab = $all.find(".auditUserTab");
        var zhSort = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
        var tr = "<tr  class='auditCt'>" +
            "<td><span style='color:red;'>* </span><span class='order' order-val='VV'>AA</span>级审批</td>" +
            "<td>" +
            "<input type='text' class='auditUserName'value='BB'/>" +
            "<input type='text' class='specificHide auditUserId'value='CC' title='请选择审批人' style='position: relative;top: -20px;'/></td>" +
            "<td style='text-align: left;'>" +
            "<a type='button' class='addBtn btn btn-success btn-xs' href='#' onclick=''><i class='fa fa-plus'></i></a>" +
            "<a type='button' class='deleteBtn btn btn-danger btn-xs' href='#' onclick=''><i class='fa fa-trash-o'></i></a>" +
            "<a type='button' class='upBtn btn btn-primary btn-xs' href='#' onclick=''><i class='fa fa-chevron-up'></i></a>" +
            "<a type='button' class='downBtn btn btn-primary btn-xs' href='#' onclick=''><i class='fa fa-chevron-down'></i></a>" +
            "</td>" +
            "</tr>";

        initBody();
        initEvent();

        function initBody() {

            var auditUserData = initValue.auditUsers ? JSON.parse(initValue.auditUsers) : [];
            var auditUserArray = [];
            if (auditUserData.length > 0) {
                for (var i = 0; i < auditUserData.length; i++) {
                    if (auditUserData[i].order == 0) {
                        $auditUserTab.find("tfoot").find(".auditUserId").val(auditUserData[i].auditUser);
                        $auditUserTab.find("tfoot").find(".auditUserName").val(auditUserData[i].auditUserName);
                    } else {
                        auditUserArray.push(initTr(auditUserData[i]));
                    }
                }
            } else {
                auditUserArray.push(initTr());
            }
            $auditUserTab.find("tbody").empty().append(auditUserArray.join(""));


        }

        function initEvent() {
            //添加一条审核人选择框
            $auditUserTab.on("click", "a.addBtn", function () {
                var $currentTr = $(this).closest("tr");

                if (initValue.operate == "create" || htmlHandle.checkChangeAuditUser(initValue.userId, initValue.auditType, initValue.auditTypeName)) {
                    $currentTr.after($(initTr()));
                    initAuditOrder($auditUserTab.find("tbody"));
                }

            });

            //删除
            $auditUserTab.on("click", "tbody a.deleteBtn", function () {
                var $currentTr = $(this).closest("tr");

                if (initValue.operate != "create" && !htmlHandle.checkChangeAuditUser(initValue.userId, initValue.auditType, initValue.auditTypeName)) {
                    return;
                }

                if ($auditUserTab.find("tbody tr").length == 1) {
                    $auditUserTab.append($(initTr()));
                }
                $currentTr.remove();
                initAuditOrder($auditUserTab.find("tbody"));
            });

            $auditUserTab.on("click","tfoot a.deleteBtn",function(){
                var $currentTr = $(this).closest("tr");
                $currentTr.find(".auditUserName").val("");
                $currentTr.find(".auditUserId").val("");
            });

            //上移
            $auditUserTab.on("click", "a.upBtn", function () {
                var $currentTr = $(this).closest("tr");
                var $prevTr = $currentTr.prev();

                if ($currentTr.index() > 0
                    && (initValue.operate == "create" || htmlHandle.checkChangeAuditUser(initValue.userId, initValue.auditType, initValue.auditTypeName))) {
                    $currentTr.insertBefore($prevTr);
                    initAuditOrder($auditUserTab.find("tbody"));
                }
            });

            $auditUserTab.on("click", "a.downBtn", function () {
                var $currentTr = $(this).closest("tr");
                var $nextTr = $currentTr.next();

                if ($nextTr.length > 0
                    && (initValue.operate == "create" || htmlHandle.checkChangeAuditUser(initValue.userId, initValue.auditType, initValue.auditTypeName))) {
                    $currentTr.insertAfter($nextTr);
                    initAuditOrder($auditUserTab.find("tbody"));
                }
            });

            $auditUserTab.on("click", "input.auditUserName", function () {
                var $this = $(this);
                var $auditUserId = $this.siblings("input.auditUserId");
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
                        chkStyle: "radio",
                        radioType: "all"
                    },
                    callback: {
                        beforeCheck: function (treeId, treeNode) {
                            //判断能够被勾掉,如果是新增直接为true
                            if (initValue.operate == "create") {
                                return true;
                            }
                            return htmlHandle.checkChangeAuditUser(initValue.userId, initValue.auditType, initValue.auditTypeName);
                        }
                    }
                };

                globalRequest.queryAuditUsers(true, {
                    userId: initValue.userId,
                    auditType: initValue.auditType,
                    areaId: initValue.selectArea
                }, function (data) {
                    //选中的展开
                    checkAndShowOpen(data, $auditUserId.val(), 'checked');

                    //给同一用户添加同类型的审批人，已经被作为审批人的不能被再次选择
                    checkAndSetCheckDisabled(data, $this);
                    var selectedAuditUserId = $auditUserId.val();
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == selectedAuditUserId) {
                            data[i].checked = true;
                            break;
                        }
                    }

                    $.fn.zTree.init($("#treePrimary"), setting, data);
                    layer.open({
                        type: 1,
                        shade: 0.3,
                        title: "审核人选择",
                        offset: '80px',
                        area: ['350px', '560px'],
                        content: $("#dialogTreePrimary"),
                        closeBtn: 0,
                        btn: ['确定', '取消'],
                        yes: function (index, layero) {
                            var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                            var node = zTree.getCheckedNodes();
                            $this.val(node.length > 0 ? node[0].name : "");
                            $auditUserId.val(node.length > 0 ? node[0].id : "");
                            layer.close(index);
                        },
                        cancel: function (index, layero) {
                            layer.close(index);
                        }
                    });
                }, function () {
                    layer.alert("系统异常");
                });
            });

            //用于展现选中的地区或者目录路径上的所有目录
            function checkAndShowOpen(data, selectId, type) {
                if (!selectId) return;
                var selectPId = "";
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == selectId) {
                        if (type == 'checked') {
                            data[i]["checked"] = true;
                            selectPId = data[i].pId;
                        }
                        else if (type == 'open') {
                            data[i]["open"] = true;
                            selectPId = data[i].pId;
                        }
                        break;
                    }
                }
                if (selectPId != '0') {
                    checkAndShowOpen(data, selectPId, 'open');
                }
            }


            //设置同一类型的审批人，被选中的不能再被选中，置灰
            function checkAndSetCheckDisabled(data, $input) {
                var $auditUserIds = $input.closest("table.auditUserTab").find("tr.auditCt").not($input.closest("tr")[0]).find("input.auditUserId");
                $auditUserIds.each(function () {
                    var $this = $(this);
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == $this.val()) {
                            data[i]["chkDisabled"] = true;
                            break;
                        }
                    }
                });
            }

            function initAuditOrder($tBody) {
                $tBody.find("tr").each(function (i) {
                    var $this = $(this), $order = $this.find("span.order");
                    $order.text(zhSort[i] ? zhSort[i] : (i + 1));
                    $order.attr("order-val", i + 1)
                });
            }
        }

        //初始化加载审批人列表数据
        function initTr(data) {
            var order = data && data.order ? data.order : 1;
            var auditUserName = data && data.auditUserName ? data.auditUserName : "";
            var auditUserId = data && data.auditUser ? data.auditUser : "";
            return tr.replace(/VV/g, order).replace(/AA/g, zhSort[order - 1] ? zhSort[order - 1] : order)
                .replace(/BB/g, auditUserName).replace(/CC/g, auditUserId);
        }
    },

    checkChangeAuditUser: function (userId, auditType, auditTypeName) {
        var flag = true;
        globalRequest.checkChangeAuditUser(false, {"USER_ID": userId, "AUDIT_TYPE": auditType}, function (data) {
            //如果有特殊要求，则设置specialFlag为true，返回信息为不加处理的所有信息
            if (data.retValue == 1) {
                flag = false;
                layer.alert(data.desc + " 审批流程未完成，无法执行增/删/改/切换操作！");
            } else if (data.retValue == -1) {
                flag = false;
                layer.alert("系统异常");
            }
        }, function () {
            layer.alert("系统异常");
        });
        return flag;
    },

    handleCreateMarketModel: function (initValue) {
        var model = initValue;
        $("#menuTree .task").click();
        $("#menuTree .task_manage").click();
        //$("#menuTree .task_use").click();

        /!*        var c = setInterval(function () {
         if (document.readyState === 'complete') {   // 网页加载成功
         clearInterval(c);
         $("div.iMarket_Body .addBtn").click();
         $("#dialogPrimary .marketSegmentSelectBtn").attr("disabled", true);
         $("#dialogPrimary").find(".marketSegments textarea.segmentNames").val(model.name);
         $("#dialogPrimary").find(".marketSegments .segmentIds").val(model.id);
         }
         }, 300);*!/

        $("#menuTree").find("a.task_use").trigger("click", [{
            segmentId: model.id,
            segmentName: model.name,
            lastRefreshCount: model.lastRefreshCount,
            operateType: "modelToCreate",
            button: "div.iMarket_Body .addBtn"
        }]);
    },
    handleGoUserListByProductId: function (initValue) {
        var model = initValue
        $('#menuTree').find('a.icommon_rank ').trigger("click", [{
            proId: model.proId,
            area: model.area,
            operateType: "goUserListByProductId",
            button: "#userList #queryUsers"
        }])
    }
};*/



