/**
 * Created by Hale on 2017年12月19日11:19:44.
 */
var studentInfoMgr_School = function () {
    var obj = {}, fileId = {}, loginUser = {}, dataTable = {};

    obj.initLoginUserInfo = function () {
        var loginUserId = globalConfigConstant.loginUser.id;
        globalRequest.iKeeper.queryCurrentKeeperUser(false, {loginUserId: loginUserId}, function (data) {
            loginUser = data.loginUser;
        }, function () {
            layer.alert("获取当前登录用户信息异常", {icon: 5});
        });
    };

    obj.initQueryRow = function () {
        // 查询栏按钮展现鉴权
        var $queryMaintainUserPhone = $(".queryMaintainUserPhone");
        var $btnUpload = $("#btnUpload");
        if (typeof(loginUser.isCanManage) == 'undefined') { // 是否有掌柜权限
            var html = "<div><span class='noPower' style='font-size: large'>抱歉，您暂无掌柜权限，如有疑问请联系管理员</span></div>";
            $("#page-wrapper #coreFrame").empty().append(html);
        } else if (loginUser.areaId == 99999) { // 省级隐藏导入
            // $btnUpload.remove();
        } else if (loginUser.areaId != 99999 && loginUser.isCanManage == 0) { // 地市末梢人员隐藏查询维系人员和导入功能
            $queryMaintainUserPhone.remove();
            $btnUpload.remove();
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
            layer.alert("系统异常，获取地市失败", {icon: 5});
        });
    };

    obj.initData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "name", title: "姓名", className: "dataTableFirstColumns", width: "8%"},
                {data: "userPhone", title: "用户号码", width: "10%"},
                {data: "maintainUserPhone", title: "维系号码", width: "10%"},
                {data: "schoolName", title: "校园", width: "8%"},
                {data: "departmentName", title: "院系", width: "8%"},
                {data: "className", title: "班级", width: "8%"},
                {data: "dormName", title: "宿舍号", width: "8%"},
                {data: "enrollmentDate", title: "入学时间", width: "10%"},
                {data: "graduationDate", title: "毕业时间", width: "10%"},
                {data: "areaName", title: "地区", width: "8%"},
                {
                    title: "操作", width: "10%", render: function (data, type, row) {
                        var $editBtnHtml = "", $deleteBtnHtml = "";
                        if (globalConfigConstant.loginUser.id == row.maintainUserId) {
                            $editBtnHtml = "<a title='编辑' class='editBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' onclick='studentInfoMgr_School.btnUpdate(" + row.id + ")'>编辑</a>";
                            $deleteBtnHtml = "<a title='删除' class='deleteBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' onclick='studentInfoMgr_School.btnDelete(" + row.id + ")'>删除</a>";
                        }
                        return $editBtnHtml + $deleteBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    };

    obj.initEvent = function () {
        /**
         * 输入框只能输入数字
         */
        $(".queryUserPhone").keyup(function () {
            this.value = this.value.replace(/[^\d]/g, '');
        });
        $(".queryMaintainUserPhone").keyup(function () {
            this.value = this.value.replace(/[^\d]/g, '');
        });

        /**
         * 查询 事件
         */
        $("#btnQuery").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        });

        /**
         * 导入 事件
         */
        $("#btnUpload").click(function () {
            obj.initUpload();
        })
    };

    /**
     * 导入 事件
     */
    obj.initUpload = function () {
        fileId = null;
        var $dialog = $("#importDialog");
        $dialog.empty();
        $dialog.append($(".importContent").find(".importDirectionalCustomer").clone());
        $plugin.iModal({
            title: '导入学生信息',
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

        function submitFile() {
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
                url: 'importStudentMaintain.view',
                dataType: 'json',
                beforeSubmit: function () {
                    $html.loading(true)
                },
                success: function (data) {
                    $html.loading(false);
                    if (data.retValue == "0") {
                        fileId = data.fileId;
                        $message.text("创建成功 :" + data.desc)
                    } else {
                        layer.alert("创建失败:" + data.desc, {icon: 5});
                    }
                }
            };
            $form.ajaxSubmit(options);
        }

        /*
         创建用户维系关系
         */
        function saveDirectionalCustomer(index) {
            if (fileId == null) {
                layer.alert("请先上传导入文件", {icon: 5});
                return;
            }
            globalRequest.iKeeper_school.saveStudentMaintain(true, {fileId: fileId}, function (data) {
                if (data.retValue == 0) {
                    dataTable.ajax.reload();
                    layer.close(index);
                    layer.msg("指定学生文件导入成功", {time: 1000});
                } else {
                    layer.alert("指定学生文件导入失败，" + data.desc, {icon: 5});
                }
            }, function () {
                layer.alert("指定学生文件导入失败", {icon: 5});
            });
        }
    };

    /**
     * 编辑事件
     * @param userId
     */
    obj.btnUpdate = function (userId) {
        globalRequest.iKeeper_school.queryKeeperStudentDetail(true, {"userId": userId}, function (data) {
            if (data) {
                var $dialog = $("#dialogPrimary");
                var $ele = $(".iMarket_Content").find(".studentInfo").clone();
                $dialog.empty().append($ele);
                $dialog.autoAssignmentForm(data);
                $ele.find("input[name='name']").attr("disabled", "disabled");
                $ele.find("input[name='certificateID']").attr("disabled", "disabled");
                $ele.find("input[name='userPhone']").attr("disabled", "disabled");
                $plugin.iModal({
                    title: '修改学生信息',
                    content: $dialog,
                    area: ['750px', '600px']
                }, function (index) {
                    postData(index)
                })
            }
        }, function () {
            layer.alert("查询学生维系关系明细异常", {icon: 5});
        });

        function postData(index) {
            globalRequest.iKeeper_school.updateStudentMaintain(true,
                $("#dialogPrimary").find(".studentInfo").autoSpliceForm(),
                function (data) {
                    if (data.retValue !== 0) {
                        layer.alert(data.desc, {icon: 5});
                        return;
                    }
                    dataTable.ajax.reload();
                    layer.close(index);
                    layer.msg("修改成功", {time: 1000});
                })
        }
    };

    /**
     * 删除事件
     * @param userId
     */
    obj.btnDelete = function (userId) {
        layer.confirm('确认删除?', {icon: 3, title: '提示'}, function () {
            globalRequest.iKeeper_school.deleteStudentMaintain(true, {"userId": userId}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 5});
                    return;
                }
                dataTable.ajax.reload();
                layer.msg("删除成功", {time: 1000});
            }, function () {
                layer.alert("删除异常", {icon: 5});
            });
        })
    };

    /**
     * 获取查询参数
     * @returns {string}
     */
    obj.getAjaxUrl = function () {
        var userPhone = $.trim($(".queryUserPhone").val()); // 用户号码
        var maintainPhone = $.trim($(".queryMaintainUserPhone").val()); // 维系号码
        var areaSelect = $(".querySelectArea").val(); // 地区选择
        return "queryKeeperStudentByPage.view?userPhone=" + userPhone + "&maintainUserPhone=" + maintainPhone + "&areaSelect=" + areaSelect;
    };

    return obj
}();

function onLoadBody() {
    studentInfoMgr_School.initLoginUserInfo();
    studentInfoMgr_School.initQueryRow();
    studentInfoMgr_School.initData();
    studentInfoMgr_School.initEvent();
}