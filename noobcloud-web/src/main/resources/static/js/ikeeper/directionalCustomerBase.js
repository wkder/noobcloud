/**
 * Created by DELL on 2017/8/9.
 */



var directonalCustomerBase = function () {
    var obj = {},
        fileId = {},
        loginUser = {},
        dataTable = {},
         getUrl = "queryDirectonalCustomerBase.view";


    obj.initLoginUserInfo = function () {
        var loginUserId = globalConfigConstant.loginUser.id;
        globalRequest.iKeeper.queryCurrentKeeperUser(false, {loginUserId: loginUserId}, function (data) {
            loginUser = data.loginUser;
        }, function () {
            $html.warning("获取当前登录用户信息异常")
        });
    };


    // 初始化查询栏
    obj.initQueryRow = function () {
        // 查询栏按钮展现鉴权
        var $queryMaintainUserPhone = $(".queryMaintainUserPhone");
        var $btnAdd = $("#btnAdd");
        var $btnUpload= $("#btnUpload");
        var $templateBtn = $(".templateBtn");
        $btnAdd.hide();// 所有角色暂时禁用新增功能
        if(typeof(loginUser.isCanManage) == 'undefined'){// 是否有掌柜权限
            var html = "<div><span class='noPower' style='font-size: large'>抱歉，您暂无掌柜权限，如有疑问请联系管理员</span></div>";
            $("#page-wrapper #coreFrame").empty().append(html);
        }else if(loginUser.areaId == 99999){//省级隐藏新增和导入
            $btnUpload.hide();
        }else if(loginUser.areaId != 99999 && loginUser.isCanManage == 0 ){//地市末梢人员隐藏查询维系人员和导入功能
            $queryMaintainUserPhone.hide();
            $btnUpload.hide();
        }
        var $querySelectArea = $(".querySelectArea");
        var $maintainUserArea = $("select.city");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $querySelectArea.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    // 初始化查询栏地区选择
                    if (areaCode != 99999 && data[i].id == areaCode) {
                        $querySelectArea.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else if (areaCode == 99999) {
                        $querySelectArea.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                    $maintainUserArea.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                }
                $querySelectArea.val(areaCode);
                $("select.city option[value='99999']").remove();
                if (areaCode != 99999) {
                    $maintainUserArea.val(areaCode)
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    };

    obj.initDate = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?" + obj.getUrlParam(), type: "POST"},
            columns: [
                {data: "userName", title: "姓名", className: "dataTableFirstColumns", width: "10%"},
                {
                    data: "userPhone", title: "用户号码", width: "10%", render: function (data, type, row) {
                    return data;
                }
                },
                {data: "areaName", title: "地市", width: "5%"},
                {data: "maintainUserName", title: "维系人员", width: "10%"},
                {
                    data: "maintainUserPhone", title: "维系号码", width: "10%", render: function (data, type, row) {
                    return data;
                }
                },
                {data: "userWeiXin", title: "微信号", width: "10%"},
                {data: "userQQ", title: "QQ号", width: "10%"},
                {data: "userWeiBo", title: "微博号", width: "10%"},
                {data: "userWangWang", title: "旺旺号", width: "10%"},
                {
                    title: "操作", width: "10%", render: function (data, type, row) {
                    var buttens = "", editBtnHtml = "", btnDelHtml = "";
                    if (globalConfigConstant.loginUser.id == row.maintainUserId) {
                        editBtnHtml = "<a title='编辑' class='editBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='directonalCustomerBase.btnUpdate(" + row.id + ")'>编辑</a>";
                        btnDelHtml = "<a title='删除' class='deleteBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='directonalCustomerBase.btnDelete("+row.id+")'>删除</a>";
                    }
                    buttens = editBtnHtml + btnDelHtml;
                    return buttens;
                }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    };

    obj.initEvent = function () {
        // 输入框只能输入数字
        $(".queryUserPhone").keyup(function(){
            this.value = this.value.replace(/[^\d]/g,'');
        });
        $(".queryMaintainUserPhone").keyup(function(){
            this.value = this.value.replace(/[^\d]/g,'');
        });
        //初始化查询按钮
        $("#btnQuery").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + obj.getUrlParam());
        });
        // 初始化新增按钮
        $("#btnAdd").click(function () {
            obj.initElement($("#dialogPrimary"), "create");

            $plugin.iModal({
                title: '新增用户维系关系',
                content: $("#dialogPrimary"),
                area: '750px'
            }, function (index) {
                obj.eventSaveOrUpdate(index, "create")
            })
        });
        // 初始化导入按钮
        $("#btnUpload").click(obj.initUpload)
    };


    obj.initUpload = function () {
        fileId = null;
        var $dialog = $("#importDialog");
        $dialog.empty();
        $dialog.append($(".importContent").find(".importDirectionalCustomer").clone());
        $plugin.iModal({
            title: '导入用户维系关系',
            content: $dialog,
            area: '550px'
        }, function (index) {
            saveDirectionalCustomer(index);
        });

        $("#importDialog .importDirectionalCustomer").find(".importForm").find("input[type=file]").click(function (e) {
            $(this).val("");
            $("#importDialog .fileUploadName").val("");
        }).change(function (e) {
            try {
                $("#importDialog .fileUploadName").val("");
                var src = e.target.value;
                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                var fileExt = fileName.replace(/.+\./, "");
                if (fileExt !== "xlsx" && fileExt !== "xls") {
                    layer.msg("请使用xls格式的文件!");
                    return;
                }
                $("#importDialog .fileUploadName").val(fileName);
            } catch (e) {
                console.log("file selected error");
            }
        });

        $(".importForm .meatOperate .btnUpload").click(function () {
            submitFile();
        });

        function submitFile(){
            var $form = $("#importDialog .importDirectionalCustomer").find(".importForm");
            var $file = $form.find("input[type=file]");
            var $message = $("#importDialog").find(".retMessage .message");
            if ($file.val() == "") {
                layer.msg("请选择文件!");
                return;
            }
            else if ($file.val().indexOf(".xlsx") < 0 && $file.val().indexOf(".xls") < 0) {
                layer.msg("请使用xls或xlsx格式的文件!");
                return;
            }
            var options = {
                type: 'POST',
                url: 'importDirectionalCustomer.view',
                dataType: 'json',
                beforeSubmit: function () {
                    $html.loading(true)
                },
                success: function (data) {
                    $html.loading(false);
                    if (data.retValue == "0") {
                        fileId = data.fileId;
                        $message.text("创建成功 :"+ data.desc)
                    } else {
                        layer.alert("创建失败:" + data.desc);
                    }
                }
            };
            $form.ajaxSubmit(options);
        }


        /*
         创建用户维系关系
         */
        function saveDirectionalCustomer(index){
            if (fileId == null) {
                layer.alert("请先上传导入文件", {icon: 6});
                return;
            }
            globalRequest.iKeeper.saveDirectionalCustomer(true, {fileId: fileId}, function (data) {
                if (data.retValue == 0) {
                    dataTable.ajax.reload();
                    layer.close(index);
                    layer.msg("指定用户文件导入成功", {time: 1000});
                } else {
                    layer.alert("指定用户文件导入失败，" + data.desc, {icon: 6});
                }
            }, function () {
                layer.alert("指定用户文件导入失败", {icon: 6});
            });
        }
    };


    // 获取查询参数
    obj.getUrlParam = function () {
        var userPhone = $.trim($(".queryUserPhone").val());//用户号码
        var maintainPhone = $.trim($(".queryMaintainUserPhone").val());//维系号码
        var areaSelect = $(".querySelectArea").val();//地区选择
        return "userPhone=" + userPhone + "&maintainPhone=" + maintainPhone + "&areaSelect=" + areaSelect;
    };

    // 初始化弹窗元素
    obj.initElement = function ($dialog, type, domain) {

        if (!$dialog || !type) {
            return;
        }
        if (type === 'update' && !domain) {
            return;
        }

        var $ele = $(".iMarket_Content").find(".infoConfigBody").clone();
        $dialog.empty().append($ele);

        var $userName = $ele.find("input.userName"),
            $userPhone = $ele.find("input.userPhone"),
            $citySelect = $ele.find("select.city"),
            $userId = $ele.find("input.userId"),
            $userCode = $ele.find("input.userCode"),
            $maintainUser = $ele.find("input.maintainUser"),
            $maintainPhone = $ele.find("input.maintainPhone"),
            $userWeiXin = $ele.find("input.userWeiXin"),
            $userQQ = $ele.find("input.userQQ"),
            $userWeiBo = $ele.find("input.userWeiBo"),
            $userWangWang = $ele.find("input.userWangWang");


        if (type === 'create') {
            $userCode.empty();
            //$userId.attr("disabled", "disabled");
            $maintainUser.attr("disabled", "disabled");
            $maintainPhone.attr("disabled", "disabled");
            $maintainUser.val(globalConfigConstant.loginUser.name);
            $maintainPhone.val(loginUser.telephone);
        } else if (type === 'update') {
            $userCode.attr("disabled", "disabled");
            $maintainUser.attr("disabled", "disabled");
            $maintainPhone.attr("disabled", "disabled");
            $userPhone.attr("disabled", "disabled");
            // 更新则渲染数据
            $userName.val(domain.userName || "");
            $userPhone.val(domain.userPhone || "");
            $userId.val(domain.id || "");
            $userCode.val(domain.userCode || "");
            $maintainUser.val(domain.maintainUserName || "");
            $maintainPhone.val(domain.maintainUserPhone || "");
            $citySelect.val(domain.userAreaCode);
            $userWeiXin.val(domain.userWeiXin || "");
            $userQQ.val(domain.userQQ || "");
            $userWeiBo.val(domain.userWeiBo || "");
            $userWangWang.val(domain.userWangWang || "")
        }
    };

    // 保存
    obj.eventSaveOrUpdate = function (index, type) {
        if (!type) {
            return;
        }
        var domain = {}, $ele = $("#dialogPrimary").find(".infoConfigBody");
        // 初始化元素
        var $userName = $ele.find("input.userName"),
            $userPhone = $ele.find("input.userPhone"),
            $citySelect = $ele.find("select.city"),
            $userId = $ele.find("input.userId"),
            $userCode = $ele.find("input.userCode"),
            $maintainUser = $ele.find("input.maintainUser"),
            $maintainPhone = $ele.find("input.maintainPhone"),
            $userWeiXin = $ele.find("input.userWeiXin"),
            $userQQ = $ele.find("input.userQQ"),
            $userWeiBo = $ele.find("input.userWeiBo"),
            $userWangWang = $ele.find("input.userWangWang");
        if (globalConfigConstant.loginUser.id) {
            domain["maintainUserId"] = globalConfigConstant.loginUser.id
        } else {
            layer.msg("维系用户信息获取失败", {time: 1000});
            return
        }
        domain["userAreaCode"] = $citySelect.val();
        // 数据校验
        if (type === "create") {
            if (utils.valid($userName, utils.isChinese, domain, "userName")
                && utils.valid($userPhone, utils.isPhone, domain, "userPhone")
                && utils.valid($userPhone, utils.isNumber, domain, "userCode")
                && utils.valid($maintainPhone, utils.isPhone, domain, "maintainPhone")
                && checkSocialInfo($userWeiXin, "userWeiXin")
                && checkSocialInfo($userQQ, "userQQ")
                && checkSocialInfo($userWeiBo, "userWeiBo")
                && checkSocialInfo($userWangWang, "userWangWang")
            ) {
                create(index)
            }
        } else if (type === "update") {
            if (utils.valid($userName, utils.any, domain, "userName")
                && checkSocialInfo($userWeiXin, "userWeiXin")
                && checkSocialInfo($userQQ, "userQQ")
                && checkSocialInfo($userWeiBo, "userWeiBo")
                && checkSocialInfo($userWangWang, "userWangWang")
            ) {
                domain["id"] = $userId.val();
                domain["userCode"] = $userCode.val();
                update(index)
            }
        }

        function checkSocialInfo($element, eleStr) {
            if ($.trim($element.val())) {
                return utils.valid($element, utils.any, domain, eleStr)
            } else {
                domain[eleStr] = "";
                return true
            }
        }

        function create(index) {
            globalRequest.iKeeper.createUserMaintain(true, domain, function (data) {
                if (data.retValue === 0) {
                    dataTable.ajax.reload();
                    layer.close(index);
                    layer.msg("创建成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            })
        }

        function update(index) {
            globalRequest.iKeeper.updateUserMaintain(true, domain, function (data) {
                if (data.retValue === 0) {
                    dataTable.ajax.reload();
                    layer.close(index);
                    layer.msg("编辑成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            })
        }
    };

    // 编辑事件
    obj.btnUpdate = function (userId) {
        globalRequest.iKeeper.queryUserMaintainDetail(true, {"userId": userId}, function (domian) {
            if (domian) {
                obj.initElement($("#dialogPrimary"), "update", domian);

                $plugin.iModal({
                    title: '新增用户维系关系',
                    content: $("#dialogPrimary"),
                    area: '750px'
                }, function (index) {
                    obj.eventSaveOrUpdate(index, "update")
                })
            }
        }, function () {
            $html.warning("查询用户维系关系明细异常")
        });
    };

    // 删除事件
    obj.btnDelete = function (userId) {
        layer.confirm('确认删除?', {icon: 3, title: '提示'}, function (index) {
            globalRequest.iKeeper.deleteUserMaintain(true,{"userId":userId},function(data){
                if (data.retValue === 0) {
                    dataTable.ajax.reload();
                    layer.msg("删除成功", {time: 1000});
                } else {
                    layer.alert(data.desc, {icon: 6});
                }
            },function(){
                $html.warning("删除异常")
            });
        })
    };

    // 手机号加*展示
    obj.encryptPhone = function (phone) {
        if (phone) {
            return phone.substr(0, 3) + '****' + phone.substr(7)
        } else {
            return ""
        }
    };

    return obj
}();


function onLoadBody() {
    directonalCustomerBase.initLoginUserInfo();
    directonalCustomerBase.initQueryRow();
    directonalCustomerBase.initDate();
    directonalCustomerBase.initEvent();
}