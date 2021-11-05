function onLoadBody() {
    var url = "queryUsersByPage.view", dataTable;

    initSearchData();
    initData();
    initEvent();

    function initSearchData(){
        var loginUser = globalConfigConstant.loginUser;
        //炒店角色没有地区和角色查询功能
        if (loginUser.userType == 2 || loginUser.businessHallIds){
            $(".areaSearchSelect").remove();
            $(".roleSearchSelect").remove();
            return;
        }else if (loginUser.areaId != 99999){
            $(".areaSearchSelect").remove();
        }else {
            globalRequest.queryAllAreas(true,{},function(data){
                var areas = [];
                for (var i=0;i<data.length;i++){
                    if (data[i].id != 99999){
                        areas.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
                    }else{
                        areas.splice(0,0,"<option value='"+data[i].id+"'>"+data[i].name+"</option>")
                    }
                }
                $(".areaSearchSelect option").not(":first()").remove();
                $(".areaSearchSelect").append(areas.join(""));
            });
            $(".distributionBtn").remove();
        }
        globalRequest.iModel.queryAllRole(true,{},function(data){
            var areas = [];
            for (var i=0;i<data.length;i++){
                areas.push("<option value='"+data[i].id+"'>"+data[i].name+"</option>");
            }
            $(".roleSearchSelect option").not(":first()").remove();
            $(".roleSearchSelect").append(areas.join(""));
        });


    }

    function initData() {
        var loginUser = globalConfigConstant.loginUser;
        var options = {
            ele: $('table.userTab'),
            ajax: {url: url, type: "POST"},
            columns: [
                {data: "id", visible: false},
                {data: "name", title: "姓名", width: "15%", className: "dataTableFirstColumns"},
                {data: "telephone", title: "手机号", width: "15%"},
                {data: "areaName", title: "归属地区", width: "15%"},
                {data: "businessHallNames", title: "营业厅", width: "15%"},
                {
                    data: "status", title: "状态", width: "15%", render: function (data, type, row) {
                    if (data == 0) {
                        return "<p style='color:green;'>生效中</p>"
                    } else {
                        return "<p style='color:red;'>已暂停</p>"
                    }
                }
                },
                {
                    title: "操作", width: "10%",
                    render: function (data, type, row) {
                         var $buttons = "";
                         var $viewButton = "<a type='button' class='btn btn-primary btn-sm btn-preview' href='#' onclick=viewItem(" + JSON.stringify(row) + ") title='预览'><i class='fa fa-eye'></i></a>";
                         var $editButton =  (row.status == 0?"<a type='button' class='btn btn-info btn-sm btn-edit' href='#' onclick=editItem(" + JSON.stringify(row) + ") title='编辑'><i class='fa fa-edit'></i></a>":"");
                         var $executeButton = "<a type='button' class='btn btn-default btn-sm btn-preview' href='#' onclick=startStopUser(" + row.id + ") title='"+(row.status == 0?'禁用':'启用')+"'>" +
                             "<i style='font-size:16px;' class='fa "+(row.status == 0?'fa-ban':'fa-check-circle-o')+"' title='用户启停'></i>" +
                             "</a>";
                         $buttons = $viewButton + $editButton;
                        /**
                         * 用户解冻操作下放给炒店地市管理员
                         * updateTime:2018-03-26
                         * updateUser:wtt
                         */
                         if(loginUser.areaId == "99999" || (loginUser.roleIds.toString().indexOf("1000003") != -1 && row.areaId == loginUser.areaId)){
                             $buttons += $executeButton;
                         }
                         return  $buttons;
                    }
                },
                {data: "areaId", visible: false},
                {data: "userType", visible: false},
                {data: "email", visible: false},
                {data: "areaCode", visible: false},
                {data: "tagAuditUsers", visible: false},
                {data: "tagAuditUserNames", visible: false},
                {data: "segmentAuditUsers", visible: false},
                {data: "segmentAuditUserNames", visible: false},
                {data: "marketingAuditUsers", visible: false},
                {data: "marketingAuditUserNames", visible: false},
                {data: "messagePushAuditUsers", visible: false},
                {data: "messagePushAuditUserNames", visible: false},
                {data: "businessHallIds", visible: false},
                {data: "roleIds", visible: false},
                {data: "homePage", visible: false},
                {data: "roleNames", visible: false},
                {data: "remarks", visible: false}
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    function initEvent() {
        $("div.userRefreshBtn").click(function (e, condition) {
            dataTable.ajax.url(url + (condition ? condition : ""));
            dataTable.ajax.reload();
        });

        $(".searchBtn").click(function () {
            var $this = $(this), name = $this.siblings(".name").val(), telephone = $this.siblings(".telephone").val(),
            areaId = "",roleId = "";
            if ($this.siblings(".areaSearchSelect").length > 0){
                areaId = $this.siblings(".areaSearchSelect").val();
            }
            if ($this.siblings(".roleSearchSelect").length > 0){
                roleId = $this.siblings(".roleSearchSelect").val();
            }
            var condition = "?name=" + encodeURIComponent(name) + "&telephone=" + encodeURIComponent(telephone)
                + "&areaId=" + encodeURIComponent(areaId) + "&roleId=" + encodeURIComponent(roleId);
            globalLocalRefresh.refreshUserList(condition);
        });

        $(".addBtn").click(function () {
            htmlHandle.handleUser($('#dialogPrimary'));
            layer.open({
                type: 1,
                shade: 0.3,
                title: "用户新增",
                offset: '70px',
                area: ['700px', '610px'],
                content: $('#dialogPrimary'),
                closeBtn: 0,
                btn: ["确定", "取消"],
                success: function (layero, index) {
                    layero.find("div.userHandleBtn").attr("index", index).attr("operate", "create");
                },
                yes: function (index, layero) {
                    layero.find("div.userHandleBtn").trigger("click");
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        });

        //批量分配权限
        $(".distributionBtn").click(function () {
            htmlHandle.distributionUserRole($('#dialogPrimary'));
            layer.open({
                type: 1,
                shade: 0.3,
                title: "批量指定审批人",
                offset: '70px',
                area: ['800px', '650px'],
                content: $('#dialogPrimary'),
                closeBtn: 0,
                btn: ["确定", "取消"],
                success: function (layero, index) {
                    layero.find("div.distributionBtn").attr("index", index).attr("operate", "create");
                },
                yes: function (index, layero) {
                    layero.find("div.distributionBtn").trigger("click");
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        });
    }
}

function viewItem(user){
    htmlHandle.handleUser($('#dialogPrimary'), user,"view");
    layer.open({
        type: 1,
        shade: 0.3,
        title: "用户预览",
        offset: '70px',
        area: ['800px', '610px'],
        content: $('#dialogPrimary'),
        closeBtn: 0,
        btn: ["关闭"],
        yes: function (index, layero) {
            layer.close(index);
        }
    });
}

function editItem(user) {
    htmlHandle.handleUser($('#dialogPrimary'), user);
    layer.open({
        type: 1,
        shade: 0.3,
        title: "用户修改",
        offset: '70px',
        area: ['800px', '610px'],
        content: $('#dialogPrimary'),
        closeBtn: 0,
        btn: ["确定", "取消"],
        success: function (layero, index) {
            layero.find("div.userHandleBtn").attr("index", index).attr("operate", "update");
        },
        yes: function (index, layero) {
            layero.find("div.userHandleBtn").trigger("click");
        },
        cancel: function (index, layero) {
            layer.close(index);
        }
    });
}

//启停用户操作
function startStopUser(userId) {
    globalRequest.startStopUser(true, {userId: userId}, function (data) {
        if (data.retValue !== 0) {
            layer.alert("操作失败," + data.desc);
        } else {
            layer.msg(data.desc);
            globalLocalRefresh.refreshUserList();
        }
    }, function () {
        layer.alert("系统异常", {icon: 6});
    });
}