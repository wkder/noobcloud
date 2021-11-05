var keeperUserSetting = function(){
    var keeperUserTable,url = "queryKeeperUsersByPage.view",keeperUserObj = {};

    keeperUserObj.initBody = function(){
        var options = {
            ele: $('table.keeperUserTab'),
            ajax: {url: url, type: "POST"},
            columns: [
                {data: "userName", title: "姓名", width: "10%", className: "dataTableFirstColumns"},
                {data: "telephone", title: "手机号码", width: "10%"},
                {data: "areaName", title: "地市", width: "10%"},
                {data: "systemOrgName", title: "组织机构", width: "8%"},
                {data: "businessOrgName", title: "业务归属", width: "8%"},
                {
                    data: "interfaceMan", title: "接口人", width: "5%",
                    render: function (data, type, row) {
                        if (data == 1) {return '是'}else if(data == 0){return '否'}
                    }
                },
                {data: "isCanManage", title: "任务审核权", width: "8%",
                    render: function (data, type, row) {
                        if (data == 1) {return '是'}else if(data == 0){return '否'}
                    }
                },
                {data: "abilityNames", title: "维系能力", width: "27%"},
                {
                    data: "status", title: "状态", width: "8%", render: function (data, type, row) {
                        if (data == 0) {
                            return "<p style='color:green;'>生效中</p>"
                        } else if(data == 3){
                            return "<p style='color:red;'>已暂停</p>"
                        } else {
                            return "<p>未知</p>"
                        }
                    }
                },
                {
                    title: "操作", width: "10%",
                    render: function (data, type, row) {
                        var operate = "";
                        if (row.createUser == globalConfigConstant.loginUser.id) {
                            if (row.status == 0) {
                                operate += "<a type='button' class='editBtn btn btn-info btn-sm btn-edit' href='#' onclick=keeperUserSetting.editKeeperUser(" + row.userId + ") ><i class='fa fa-edit'></i></a>";
                            }
                            operate += "<a type='button' class='btn btn-danger btn-sm btn-delete' href='#' onclick=keeperUserSetting.deleteKeeperUser(" + row.userId + ") ><i class='fa fa-trash-o'></i></a>";
                        }
                        return operate;
                    }
                },
                {data: "userId", visible: false},
                {data: "createUser", visible: false}
            ]
        };
        keeperUserTable = $plugin.iCompaignTable(options);
    };
    keeperUserObj.initEvent = function(){
        $("div.keeperUserRefreshBtn").click(function (e) {
            //dataTable.ajax.url(url + (condition ? condition : ""));
            keeperUserTable.ajax.reload();
        });

        $(".searchBtn").click(function (e) {
            keeperUserTable.ajax.url(url+"?phone="+$(this).siblings("input.telephone").val());
            keeperUserTable.ajax.reload();
        });

        $(".keeperUserAddBtn").click(function() {
            var $dialog = $('#dialogPrimary').empty();
            $dialog.append($(".iMarket_Content .keeperUserInfo").clone());
            if (globalConfigConstant.loginUser.areaId != 99999) {
                $dialog.find(".areaSelect").remove();
                $dialog.find(".areaId").val(globalConfigConstant.loginUser.areaId);
                $dialog.find(".areaName").show().val(globalConfigConstant.loginUser.areaName);
                keeperUserObj.queryUserFroKeeperUser($dialog.find(".userSelect"),globalConfigConstant.loginUser.areaId);
            }else {
                keeperUserObj.queryAllAreas($dialog.find(".keeperUserInfo"));
            }
            keeperUserObj.initSmsSignatureAuditUsers($dialog.find(".keeperUserInfo .smsSignatureAuditUser"), $dialog.find(".keeperUserInfo .areaId"));
            $plugin.iModal({
                title: "新增维系员工",
                content: $dialog,
                area: ['750px', "620px"],
            }, keeperUserObj.saveKeepUser, null, function (layero, index) {
                layero.find(".keeperUserHandel").attr("type", "create");
            }, null);
            keeperUserObj.initSubEvent($dialog.find(".keeperUserInfo"));
        });
    };

    keeperUserObj.queryUserFroKeeperUser = function($user,areaId){
        globalRequest.iKeeper.queryUsersForKeeperUser(true,{areaId: areaId},function(data){
            var users = [];
            for (var i=0;i<data.length;i++){
                users.push("<option value='"+data[i].id+"' phone='"+data[i].telephone+"'>"+data[i].name+"</option>");
            }
            $user.find("option:gt(0)").remove();
            $user.append(users.join(""));
        });
    };

    //加载所有的区域
    keeperUserObj.queryAllAreas = function($obj){
        var $areaSelect = $obj.find(".areaSelect");
        globalRequest.queryAllAreas(true,{},function(data){
            var areas = [];
            for (var i=0;i<data.length;i++){
                if (data[i].id != 99999){
                    areas.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
                }
            }
            $areaSelect.find("option:gt(0)").remove();
            $areaSelect.append(areas.join(""));

/*            if (globalConfigConstant.loginUser.areaCode != 99999) {
                $areaSelect.val(globalConfigConstant.loginUser.areaCode);
                $areaSelect.attr("disable","disable");
            }*/
        });
    };

    keeperUserObj.initSmsSignatureAuditUsers = function($smsSignatureAuditUser, $areaSelect, smsSignatureAuditUser){
        var auditUsers = [];
        globalRequest.iKeeper.querySmsSignatureAuditUsers(true,{areaId: $areaSelect.val()},function(data){
            for (var i=0;i<data.length;i++){
                auditUsers.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
            }
            $smsSignatureAuditUser.find("option:gt(0)").remove();
            $smsSignatureAuditUser.append(auditUsers.join(""));
            if (smsSignatureAuditUser){
                $smsSignatureAuditUser.val(smsSignatureAuditUser);
            }
        });
    };

    keeperUserObj.queryKeeperUserOrg = function(event){
        var type = event.data.type;
        var title = event.data.title;
        var $this = $(this);
        var $dialog = $("#dialogTreePrimary")
        var setting = {
            view: {
                dblClickExpand: true
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "orgId",
                    pIdKey: "parentId"
                },
                key: {
                    name: "orgName"
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
            callback: {}
        };
        globalRequest.iKeeper.queryRootOrgByOrgType(false, {orgName: '', orgTypeId: type}, function (data) {
            for (var i =0;i<data.length;i++) {
                if (data[i].orgId == $this.closest(".row").find("input.id").val()){
                    data[i]["checked"] = true;
                    break;
                }
            }
            $.fn.zTree.init($dialog.find("#treePrimary"), setting, data);
            $plugin.iModal({
                title: title,
                content: $dialog,
                area: ['500px', "600px"],
            }, function(index, layero){
                var zTree = $.fn.zTree.getZTreeObj("treePrimary");
                var selectNodes = zTree.getCheckedNodes();
                if (selectNodes.length > 0 ) {
                    var $id = $this.closest(".row").find("input.id");
                    $id.val(selectNodes[0].orgId);
                    $id.siblings("input").val(selectNodes[0].orgName);
                    layer.close(index);
                }
            }, null, null, null);
        });
    };

    //区域选择触发事件
    keeperUserObj.initUserForKeeperUser = function($user, $area){
        globalRequest.iKeeper.queryUsersForKeeperUser(true,{areaId: $area.val()},function(data){
            var users = [];
            for (var i=0;i<data.length;i++){
                users.push("<option value='"+data[i].id+"' phone='"+data[i].telephone+"'>"+data[i].name+"</option>");
            }
            $user.find("option:gt(0)").remove();
            $user.append(users.join(""));
        });
    };

    keeperUserObj.areaChange = function(event){
        var $obj = event.data.keeperObj;
        var $user = $obj.find(".userSelect");
        var $area = $obj.find(".areaSelect");
        var $smsSignatureAudit = $obj.find(".smsSignatureAuditUser");
        keeperUserObj.initUserForKeeperUser($user, $area);
        keeperUserObj.initSmsSignatureAuditUsers($smsSignatureAudit,$area);
    };

    //维系能力选择
    keeperUserObj.dialogAbilitySelect = function(){
        var $dialog = $('#dialogMiddle').empty();
        $dialog.append($(".iMarket_Content .abilitySelectInfo").clone());
        var $abilityIds = $(this).closest(".row").find(".abilityIds");
        var $abilityTexts = $(this).closest(".row").find(".abilityText");
        var $abilityList = $dialog.find(".abilityList");
        var abilityIdArray = $abilityIds.val().split(",");

        globalRequest.iKeeper.queryKeeperTaskType(false, {}, function (data) {
            var attrArray = [];
            for (var i=0;i<data.length;i++){
                attrArray.push("<div class='col-xs-4'><div class='abilityItem "+(abilityIdArray.indexOf(data[i].typeId+'') >=0?'active':'')+"' data-value="+data[i].typeId+">"+data[i].typeName+"</div></div>");
            }
            $abilityList.empty().append(attrArray.join(""));
        });

        $dialog.find(".abilitySelectInfo .abilityItem").click(function(){
            var $this = $(this);
            if ($this.hasClass("active")){
                $this.removeClass("active");
            } else {
                $this.addClass("active");
            }
        });

        $plugin.iModal({
            title: "维系能力选择",
            content: $dialog,
            area: ['750px', "620px"],
        }, function(index, layero){
            var $abilityItems = layero.find(".abilityList div.abilityItem.active");
            var abilityNames = [],abilityIds = [];
            $abilityItems.each(function(){
                var $this = $(this);
                abilityIds.push($this.attr("data-value"));
                abilityNames.push($this.text());
            });
            $abilityIds.val(abilityIds.join(","));
            $abilityTexts.val(abilityNames.join(","));
            layer.close(index);
        }, null, null, null);
    };

    ///保存用户
    keeperUserObj.saveKeepUser = function (index, layero){
        var keeperUser = {};
        if (!keeperUserObj.packageDomain(keeperUser,layero)){
            return ;
        }
        var type = layero.find(".keeperUserHandel").attr("type");
        if (type == "create") {
            globalRequest.iKeeper.createKeeperUser(true,keeperUser,function(data){
                if (data.retValue !== 0){
                    $html.warning(data.desc);
                    return;
                }
                $html.success("维系员工新增成功！");
                layer.close(index);
            });
        } else if (type == "edit"){
            globalRequest.iKeeper.updateKeeperUser(true,keeperUser,function(data){
                if (data.retValue !== 0){
                    $html.warning(data.desc);
                    return;
                }
                $html.success("维系员工编辑成功！");
                layer.close(index);
            });
        }
        globalLocalRefresh.refreshKeeperUser();
    };

    //删除用户
    keeperUserObj.deleteKeeperUser = function (userId){
        if (userId <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        var index = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iKeeper.deleteKeeperUser(true, {userId: userId}, function (data) {
                if (data.retValue !== 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("删除成功！");
                globalLocalRefresh.refreshKeeperUser();
            });
        }, function () {
            layer.close(index);
        });
    };

    //编辑用户
    keeperUserObj.editKeeperUser = function(userId){
        var $dialog = $('#dialogPrimary').empty();
        $dialog.append($(".iMarket_Content .keeperUserInfo").clone());
        $dialog.find("select.userSelect").hide();
        $dialog.find("select.areaSelect").hide();

        //var $areaSelect  = $dialog.find(".areaSelect");
        var $areaName  = $dialog.find("input.areaName").show();
        var $areaId  = $dialog.find("input.areaId");
        var $userName  = $dialog.find("input.userName").show();
        var $userId  = $dialog.find("input.userId");
        var $telephone  = $dialog.find(".telephone");
        //var $isCanManage  = $dialog.find(".isCanManage");
        var $interfaceMan  = $dialog.find(".interfaceMan");
        var $systemOrg  = $dialog.find(".systemOrg");
        var $systemOrgId  = $dialog.find(".systemOrgId");
        var $businessOrg  = $dialog.find(".businessOrg");
        var $businessOrgId  = $dialog.find(".businessOrgId");
        var $abilityText  = $dialog.find(".abilityText");
        var $abilityIds  = $dialog.find(".abilityIds");
        var $smsSignature  = $dialog.find(".smsSignature");
        var $smsSignatureAuditUser  = $dialog.find(".smsSignatureAuditUser");

        keeperUserObj.initSubEvent($dialog.find(".keeperUserInfo"));
        //keeperUserObj.queryAllAreas($dialog.find(".keeperUserInfo"));

        // 设置编辑内容
        globalRequest.iKeeper.queryKeeperUserDetail(true,{userId: userId},function(data){
            $areaId.val(data.areaId);
            $areaName.val(data.areaName);
            //$userSelect.val(data.userId);
            $userId.val(data.userId);
            $userName.val(data.userName);
            $telephone.val(data.telephone);
           // $isCanManage.val(data.isCanManage);
            $interfaceMan.val(data.interfaceMan);
            $systemOrg.val(data.systemOrgName);
            $systemOrgId.val(data.systemOrgId);
            $businessOrg.val(data.businessOrgName);
            $businessOrgId.val(data.businessOrgId);
            $abilityText.val(data.abilityNames);
            $abilityIds.val(data.ability);
            $smsSignature.val(data.smsSignature);
            $smsSignature.attr("disabled","disabled");
            keeperUserObj.initSmsSignatureAuditUsers($smsSignatureAuditUser, $areaId, data.auditUser);
        });

        $plugin.iModal({
            title: "编辑维系员工",
            content: $dialog,
            area: ['750px', "620px"],
        }, keeperUserObj.saveKeepUser, null, function (layero, index) {
            layero.find(".keeperUserHandel").attr("type", "edit");
        }, null);
    };

    //弹框事件
    keeperUserObj.initSubEvent = function($obj){
        //地区切换事件
        $obj.find(".areaSelect").change({"keeperObj":$obj},keeperUserObj.areaChange);

        //用户选择事件
        $obj.find(".userSelect").change(function() {
            $obj.find(".telephone").val($(this).find("option:selected").attr("phone"));
        });
        //维系能力选择事件
        $obj.find(".abilitySelectBtn").click(keeperUserObj.dialogAbilitySelect);

        //系统组织
        $obj.find(".systemOrgSelectBtn").click({type:1},keeperUserObj.queryKeeperUserOrg);

        //业务组织
        $obj.find(".businessOrgSelectBtn").click({type:2},keeperUserObj.queryKeeperUserOrg);
    };

    //对象组装
    keeperUserObj.packageDomain = function(obj,$dialog){
        var type = $dialog.find(".keeperUserHandel").attr("type");
        var $areaSelect = $dialog.find(".areaSelect");
        var $userSelect = $dialog.find(".userSelect");
        var $userId = $dialog.find(".userId");
        if (globalConfigConstant.loginUser.areaId == 99999 && type == "create" && (!$areaSelect.val() || $areaSelect.val() == -1)){
            $html.warning("请选择维系区域！");
            return false;
        }
        if (type == "create" && (!$userSelect.val() || $userSelect.val() == -1)){
            $html.warning("请选择维系员工！");
            return false;
        }
        obj["userId"] = type == "create"?$userSelect.val():$userId.val();
        if (utils.valid($dialog.find(".interfaceMan"), utils.notEmpty, obj, "interfaceMan")
            //&& utils.valid($dialog.find(".isCanManage"), utils.notEmpty, obj, "isCanManage")
            && utils.valid($dialog.find(".systemOrgId"), utils.notEmpty, obj, "systemOrgId")
            && utils.valid($dialog.find(".businessOrgId"), utils.notEmpty, obj, "businessOrgId")
            && utils.valid($dialog.find(".abilityIds"), utils.notEmpty, obj, "ability")
            && utils.valid($dialog.find(".smsSignature"), utils.any, obj, "smsSignature")
            && utils.valid($dialog.find(".smsSignatureAuditUser"), utils.notEmpty, obj, "auditUser")){
            return true;
        }
    };

    return keeperUserObj;
}();

function onLoadBody() {
    keeperUserSetting.initBody();
    keeperUserSetting.initEvent()
}