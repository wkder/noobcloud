var userResourcesSetting = function(){
    var userResourcesTable,url = "queryResourceUserModelByPage.view",userResourcesObj = {};
    userResourcesObj.initBody = function(){
        var options = {
            ele: $('table.userResourcesTab'),
            ajax: {url: url, type: "POST"},
            columns: [
                {data: "title", title: "标题", width: "15%", className: "dataTableFirstColumns"},
                {data: "fileName", title: "原始文件名", width: "15%"},
                {data: "dataDate", title: "数据日期", width: "10%"},
                {data: "refreshResult", title: "刷新结果", width: "8%"},
                {data: "totalCount", title: "刷新总数", width: "8%"},
                {data: "successCount", title: "成功数", width: "8%"},
                {data: "failCount", title: "失败数", width: "8%"},
                {data: "remarks", title: "描述备注", width: "18%"},
                {
                    title: "操作", width: "10%",
                    render: function (data, type, row) {
                        var operate = utils.authButton('<a class="btn listBtn-download" title="下载资源模型" onclick="userResourcesSetting.resourceDownload(' + row.id + ')"><i class="fa fa-arrow-down"></i></a>', 'resourceModelDownload');
                        if (globalConfigConstant.loginUser.areaId == 99999) {
                            operate += utils.authButton('<a class="btn listBtn-info" title="编辑资源模型" onclick="userResourcesSetting.resourceEdit(' + row.id + ')"><i class="fa fa-pencil"></i></a>', 'resourceModelEdit');
                            operate += utils.authButton('<a class="btn listBtn-danger" title="删除资源模型" onclick="userResourcesSetting.resourceDelete(' + row.id + ')"><i class="fa fa-times"></i></a>', 'resourceModelDelete');
                        }
                        return operate;
                    }
                },
                {data: "id", visible: false}
            ]
        };
        userResourcesTable = $plugin.iCompaignTable(options);

        if (globalConfigConstant.loginUser.areaId != 99999) {
            $(".userResourcesAddBtn").remove();
        }
    };

    userResourcesObj.initEvent = function(){
        $("div.userResourcesRefreshBtn").click(function (e) {
            //dataTable.ajax.url(url + (condition ? condition : ""));
            userResourcesTable.ajax.reload();
        });

        $(".userResourcesAddBtn").click(function() {
            var $dialog = $('#dialogPrimary').empty();
            $dialog.append($(".iMarket_Content .userResourcesInfo").clone());
            $plugin.iModal({
                title: "新增用户资源信息",
                content: $dialog,
                area: ['550px', "400px"],
            }, userResourcesObj.saveUserResources, null, function (layero, index) {
                layero.find(".userResourcesHandel").attr("type", "create");
                userResourcesObj.initSubEvent($dialog.find(".userResourcesInfo"));
            }, null);
        });
    };

    userResourcesObj.resourceDownload = function(id){
        $util.exportFile("downloadResourceModel.view", {id: id});
    };

    userResourcesObj.resourceEdit = function(id){
        var $dialog = $('#dialogPrimary').empty();
        $dialog.append($(".iMarket_Content .userResourcesInfo").clone());
        globalRequest.iModel.queryResourceModelById(true, {id: id}, function (data) {
            $dialog.find(".fileSelectBtn").remove();
            $dialog.find(".title").val(data.title);
            $dialog.find(".layerInput").val(data.fileName);
            $dialog.find(".roleNames").val(data.roleNames);
            $dialog.find(".roleIds").val(data.roleIds);
            $dialog.find(".remarks").val(data.remarks)
        });

        $plugin.iModal({
            title: "修改用户资源信息",
            content: $dialog,
            area: ['550px', "400px"],
        }, userResourcesObj.saveUserResources, null, function (layero, index) {
            layero.find(".userResourcesHandel").attr("type", "update").attr("id",id);
            userResourcesObj.initSubEvent($dialog.find(".userResourcesInfo"));
        }, null);
    };

    userResourcesObj.resourceDelete = function(id){
        if (id <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        var confirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iModel.deleteResourceModel(true, {id: id}, function (data) {
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success(data.desc);
                userResourcesTable.ajax.reload();
            })
        }, function () {
            layer.close(confirm);
        });
    };

    userResourcesObj.initSubEvent = function($obj){
        //选择需要导入的文件
        $obj.find(".fileSelectBtn").click(function(e){
            e.preventDefault();
            $obj.find(".fileUpload").click();
        });
        //本地导入文本框内容改变时
        $obj.find(".fileUpload").change(function(e){
            try {
                var src = e.target.value;
                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                var fileExt = fileName.replace(/.+\./, "");
                if (fileExt !== "txt") {
                    $html.warning("文件格式错误");
                    return;
                }
                $obj.find("input[name=importFile]").val(fileName);
            } catch (e) {
                console.log("evtOnFileImport error");
            }
        });

        //角色选择
        $obj.find(".roleSelectBtn").click(function(e){
            e.preventDefault();
            var roleIds = $obj.find(".roleIds").val();
            var roleIdArray = roleIds? roleIds.split(","):[];
            var $dialog = $("#dialogMiddle").empty().append("<div class='roleDiv'></div>");
            var $roleDiv = $dialog.find(".roleDiv")
            globalRequest.iModel.queryAllRole(true, {}, function (data) {
                var html = "";
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type != 2) {
                        var activeClass = "", lastDivClass = "";
                        if (roleIdArray.indexOf(data[i].id + "") != -1) {
                            activeClass = "div-choose-user-active";
                        }
                        html += "<div class='col-md-4 div-choose-user " + activeClass + "" + lastDivClass + "' onclick='userResourcesSetting.evtOnSpanChooseAssignUsersClass(this)'>";
                        html += "<span data-id='" + data[i].id + "' title='" + data[i].name + "'>";
                        html += "" + data[i].name + "";
                        html += "</span></div>";
                    }
                }
                $roleDiv.append(html);
            });

            $plugin.iModal({
                title: '选择指定角色',
                content: $dialog,
                area: ['600px', '600px']
            }, userResourcesObj.chooseAssignUserRoles)
        });
    };

    userResourcesObj.chooseAssignUserRoles = function (index,layero) {
        var $dialog = $('#dialogPrimary').find(" .userResourcesInfo");
        var $eleArray = layero.find(".div-choose-user-active"), checkedValues = [], checkedIds = [];
        for (var i = 0; i < $eleArray.length; i++) {
            var $checkedElement = $($eleArray[i]).children("span");
            checkedValues.push($checkedElement.attr("title"));
            checkedIds.push($checkedElement.attr("data-id"));
        }
        $dialog.find(".roleNames").val(checkedValues.join(","));
        $dialog.find(".roleIds").val(checkedIds.join(","));
        layer.close(index);
    };

    // 选择指定角色-点击DIV事件
    userResourcesObj.evtOnSpanChooseAssignUsersClass = function (e) {
        if (!$(e).hasClass("div-choose-user-active")) {
            $(e).addClass("div-choose-user-active");
        } else {
            $(e).removeClass("div-choose-user-active");
        }
    };

    userResourcesObj.saveUserResources = function(index, layero){
        var type = layero.find(".userResourcesHandel").attr("type");
        var id = layero.find(".userResourcesHandel").attr("id");
        if (type == "create"){
            var options = {
                type: 'post',
                url: 'createResourcesUserModel.view',
                dataType: 'json',
                beforeSubmit: function () {
                    $html.loading(true)
                },
                success: function (data) {
                    $html.loading(false);
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success(data.desc);
                    layer.close(index);
                    //刷新
                    $("div.userResourcesRefreshBtn").trigger("click");
                }
            };
            layero.find("#userResourcesForm").ajaxSubmit(options);
        } else {
            var $title = layero.find(".title");
            var $roleIds = layero.find(".roleIds");
            var $remarks = layero.find(".remarks");

            var resourceDomain = {"id": id};
            if (!(utils.valid($title, utils.notEmpty, resourceDomain, "title")
                && utils.valid($roleIds, utils.any, resourceDomain, "roleIds")
                && utils.valid($remarks, utils.any, resourceDomain, "remarks"))) {
                return;
            }

            globalRequest.iModel.editResourceModel(true, resourceDomain, function (data) {
                $html.loading(false);
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success(data.desc);
                layer.close(index);
                //刷新
                $("div.userResourcesRefreshBtn").trigger("click");
            });
        }

    };

    return userResourcesObj;
}();

function onLoadBody() {
    userResourcesSetting.initBody();
    userResourcesSetting.initEvent()
}