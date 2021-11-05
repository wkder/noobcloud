/**
 * Created by xuan on 2016/12/22.
 */
var pushcontent = function () {
    var dataTable, taskListTable,
        layerIndex = 0, layerIndexTwo = 0,
        getPushListUrl = "getPushList.view",
        getTaskListUrl = "getTaskList.view",
        savePushUrl = "addOrEditPush.view",
        deletePushUrl = "deletePush.view",
        uploadUrl = "uploadCommon.view",
        getSelectPushConfigUrl = "getSelectPushConfig.view",
        getSelectNetWorkUrl = "getSelectNetWork.view",
        getSelectUsedUrl = "getContentIsUsed.view",
        getContent = "getContent.view",
        obj = {};
    var fileArray = {
        fileName: "",
        serverPath: ""
    }

    obj.initData = function () {
        obj.dataTableInit();
        obj.selectPushConfigInit();
        //obj.cmTableInit();
        obj.uploadInit();
    }

    // 绑定事件
    obj.initEvent = function () {
        $("#trChoose input[type='radio']").click(obj.evtOnChangeType);
        $("#btnQuery").click(obj.evtOnQueryPush);
        $("#btnAdd").click(obj.evtOnShowPush);
        $("#btnCancel").click(obj.evtOnCancelPush);
        $("#btnSave").click(obj.evtSavePush);
        $("#txtTaskName").click(obj.evtOnShowTask);
        //$("#btnTaskAddOrEdit").click(obj.evtOnConfirmTask);
        //$("#btnTaskCancel").click(obj.evtOnCancelTask);
    }

    // 绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getPushListUrl + "?name=&kind=", type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 60, className: "dataTableFirstColumns"},
                {data: "taskName", title: "任务名", width: 120},
                {data: "pushName", title: "类型", width: 60},
                {data: "content", title: "内容", width: 140},
                {
                    data: "href", title: "网址", width: 80,
                    render: function (data, type, row) {
                        return "<span style='word-break: break-all; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;overflow: hidden;'>" + row.href + "</span>";
                    }
                },
                {data: "remark", title: "描述", width: 80},
                {data: "orderKey", title: "订购编码", width: 80},
                {
                    data: "isUsed", title: "启用", width: 40, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.isUsed == 0) {
                            return "<i class='fa fa-times fa-2x' style='color: red;'></i>";
                        } else {
                            return "<i class='fa fa-check fa-2x' style='color: #00B38B;'></i>";
                        }
                    }
                },
                {
                    title: "操作", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='pushcontent.evtOnShowPush(" + row.id + ")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"pushcontent.evtOnDelPush(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 弹窗表格初始化
    obj.cmTableInit = function () {
        $('#popupAddOrEdit').cmTable({
            columns: [
                {
                    id: "txtTaskName", desc: "任务名", readonly: true,
                    alert: {className: "help-block alert alert-info", text: "点击任务名可替换任务"}
                },
                {id: "txtContent", desc: "内容", validate: {expression: "NotNull"}},
                {id: "txtTitle", desc: "标题"},
                {id: "uploadImg", type: "div", desc: "封面图片", className: "zyupload"},
                {
                    type: "radio", desc: "图标", trId: "trTitle",
                    group: [
                        {
                            id: "iconFirst",
                            name: "iconType",
                            attribute: ["data-icontype", 1],
                            appendDom: '<img src="images/icon1.png" />',
                            checked: true
                        },
                        {
                            id: "iconSecond",
                            name: "iconType",
                            attribute: ["data-icontype", 2],
                            appendDom: '<img src="images/icon2.png" />'
                        },
                        {
                            id: "iconThird",
                            name: "iconType",
                            attribute: ["data-icontype", 3],
                            appendDom: '<img src="images/icon3.png" />'
                        }
                    ]
                },
                {id: "selPuchConfig", type: "select", desc: "推送类型", client: false, url: getSelectPushConfigUrl},
                {
                    type: "radio", desc: "选择", trId: "trChoose",
                    group: [
                        {name: "type", attribute: ["data-dbtype", 1], appendDom: '<span>网址</span>', checked: true},
                        {name: "type", attribute: ["data-dbtype", 2], appendDom: '<span>描述</span>'}
                    ],
                    alert: {className: "help-block alert alert-info", text: "流量包选择描述，活动应用选择网址"}
                },
                {id: "txtHref", desc: "网址", trId: "trHref", validate: {expression: "NotNull"}},
                {id: "txtDesc", desc: "描述", trId: "trDesc", visible: false, validate: {expression: "NotNull"}},
                {
                    id: "txtOrderKey",
                    desc: "订购编码",
                    trId: "trOrderKey",
                    visible: false,
                    validate: {expression: "NotNull"},
                },
                {id: "txtSort", desc: "排序", trId: "trSort", visible: false, validate: {expression: "IsNum"}},
                {id: "selNetWork", type: "select", desc: "网络类型", client: false, url: getSelectNetWorkUrl},
                {id: "selIsUsed", type: "select", desc: "是否启用", client: false, url: getSelectUsedUrl}
            ]
        });
    }

    // 上传
    obj.uploadInit = function () {
        $("#uploadImg").zyUpload({
            width: "500px",                                 // 宽度
            height: "400px",                                // 宽度
            itemWidth: "140px",                             // 文件项的宽度
            itemHeight: "115px",                            // 文件项的高度
            url: uploadUrl,                                // 上传文件的路径
            fileType: ["jpg", "png", "jpeg", "gif", "bmp"], // 上传文件的类型
            fileSize: 51200000,                             // 上传文件的大小
            multiple: false,                                // 是否可以多个文件上传
            dragDrop: false,                                // 是否可以拖动上传文件
            tailor: false,                                  // 是否可以裁剪图片
            del: true,                                      // 是否可以删除文件
            finishDel: false,  				                // 是否在上传文件完成后删除预览
            /* 外部获得的回调接口 */
            onSelect: function (selectFiles, allFiles) {    // 选择文件的回调方法  selectFile:当前选中的文件  allFiles:还没上传的全部文件
                console.info("当前选择了以下文件：" + selectFiles);
            },
            onDelete: function (file, files) {              // 删除一个文件的回调方法 file:当前删除的文件  files:删除之后的文件
                fileArray = {
                    fileName: "",
                    serverPath: ""
                }
                console.info("当前删除了此文件：" + file.name);
            },
            onSuccess: function (file, response) {          // 文件上传成功的回调方法
                console.info("此文件上传成功：" + file.name);
                console.info("此文件上传到服务器地址：" + response);
                fileArray.fileName = obj.getFileName(file.name);
                response.replace("")
                fileArray.serverPath = response;
            },
            onFailure: function (file, response) {          // 文件上传失败的回调方法
                console.info("此文件上传失败：");
                console.info(file.name);
            },
            onComplete: function (response) {
            } // 上传完成的回调方法
        });
    }

    // 推送配置 下拉列表加载
    obj.selectPushConfigInit = function () {
        globalRequest.iScene.getSelectPushConfig(false, {}, function (data) {
            $("#selQueryPush").html("<option value=''>全部类型</option>" + data.message);
        })
    }

    // 显示推送列表
    obj.evtOnShowPush = function (id) {
        var title = "新增";
        fileArray = {
            fileName: "",
            serverPath: ""
        }
        //推送类型下来列表加载
        $util.ajaxPost(getSelectPushConfigUrl,{},
            function (data) {
                if (data.state) {
                    $("#selPuchConfig").html(data.message);
                }
            }, function () {
            });
        if (id > 0) {  //编辑
            title = "编辑";
            $util.ajaxPost(getContent,JSON.stringify({id: id}),
                function (data) {
                    if (data.total == 1) {
                        var o=data.data[0];
                        if (o.taskName && o.taskName.trim() != "") {  //任务名
                            $("#txtTaskName").val(o.taskName).attr("data-taskid", o.taskId);
                        }
                        if (o.content && o.content.trim() != "") {  //内容
                            $("#txtContent").val(o.content);
                        }
                        if (o.imgUrl && o.imgUrl.trim() != "") {
                            $('#uploadImage_0')[0].src = o.imgUrl;
                            $(".file_bar").show();
                            var filename= o.imgUrl.substr( o.imgUrl.lastIndexOf('\\')+1);
                            $(".file_bar .file_name")[0].title=filename;
                            $(".file_bar .file_name")[0].innerHTML=filename;
                            $(".upload_append_list").hover(
                                function (e) {
                                    $(this).find(".file_bar").addClass("file_hover");
                                },function (e) {
                                    $(this).find(".file_bar").removeClass("file_hover");
                                }
                            );
                            $(".file_del").click(function() {
                                $('#uploadImage_0')[0].src="ext/zyupload/skins/images/add_img.png";
                                $(".file_bar").hide();
                            });
                        }else{
                            $('#uploadImage_0')[0].src="ext/zyupload/skins/images/add_img.png";
                            $(".file_bar").hide();
                        }

                        if (o.icon && o.icon > 0) {  //图标
                            switch (o.icon) {
                                case 1:
                                    $("#iconFirst").attr("checked", "checked");
                                    break;
                                case 2:
                                    $("#iconSecond").attr("checked", "checked");
                                    break;
                                case 3:
                                    $("#iconThird").attr("checked", "checked");
                                    break;
                            }
                        }

                        if (o.type == 1) {    //网址
                            $('#trChoose input:radio:first').trigger("click");
                            if (o.href && o.href.trim() != "") {
                                $("#txtHref").val(o.href);
                            }
                            //清空描述中的内容
                            $("#txtDesc").val("");
                            $("#txtOrderKey").val("");
                        } else {    //描述
                            $('#trChoose input:radio:last').trigger("click");
                            if (o.remark && o.remark.trim() != "") {
                                $("#txtDesc").val(o.remark);
                            }
                            if (o.orderKey && o.orderKey.trim() != "") {
                                $("#txtOrderKey").val(o.orderKey);
                            }
                            if (o.sort && o.sort != "") {
                                $("#txtSort").val(o.sort);
                            }
                            //清空网址中的内容
                            $("#txtHref").val("");
                        }

                        if (o.kind >= 0) { //推送类型
                            $("#selPuchConfig").val(o.kind);
                        }

                        if (o.netWork == 1 || o.netWork == 2) {
                            $("#selNetWork").val(o.netWork);
                        }
                        if (o.isUsed == 1 || o.isUsed == 0) {
                            $("#selIsUsed").val(o.isUsed);
                        }
                        $("#btnSave").attr("data-id", o.id);
                    }
                }, function () {
                });

        } else {    //新增
            obj.reset();
            id = 0;
            $("#btnSave").attr("data-id", 0);
            $('#uploadImage_0')[0].src="ext/zyupload/skins/images/add_img.png";
            $(".file_bar").hide();
        }
        //隐藏上传图片右下角
        $("#uploadSuccess_1").hide();
        layer.open({
            type: 1,
            title: title + '推送内容',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index) {
                obj.evtSavePush(index, id);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });
    }

    // 取消
    obj.evtOnCancelPush = function () {
        obj.reset();
        layer.close(layerIndexTwo);
    }

    // 保存数据
    obj.evtSavePush = function (index, id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var content = $("#txtContent").val();
        if (!$("#cmTableContent").cmValidate()) {
            return;
        }
        if($.trim($("#txtTaskName").attr("data-taskid"))==""||$.trim($("#txtTaskName").attr("data-taskid"))=="0"){
            $html.warning("请选择任务名！");
            return;
        }

        var type = $('#trChoose input[type="radio"]:checked').attr("data-dbtype");
        if (type == 1) { //网址
            if ($("#txtDesc").val().length > 0) {
                $("#txtDesc").val("");
            }
            if ($("#txtOrderKey").val().length > 0) {
                $("#txtOrderKey").val("");
            }
            if(!(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test($("#txtHref").val()))){
                $("#txtHref").focus();
                layer.tips("网址链接格式不正确！", $("#cmTableContent [name='href']"), {tips: 3});
                return;
            }

        } else { //描述
            if ($("#txtHref").val().length > 0) {
                $("#txtHref").val("");
            }
            if($("#txtDesc").val()==""){
                $("#txtDesc").focus();
                layer.tips("请填写描述！", $("#cmTableContent  [name='remark']"), {tips: 3});
                return;
            }
            if($("#txtOrderKey").val()==""){
                $("#txtOrderKey").focus();
                layer.tips("请填写订购编码", $("#cmTableContent  [name='orderKey']"), {tips: 3});
                return;
            }
            if(!(/^[0-9]+$/.test($("#txtSort").val()))){
                $("#txtSort").focus();
                layer.tips("排序必须为数字", $("#cmTableContent  [name='sort']"), {tips: 3});
                return;
            }
        }

        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["taskId"] = $.trim($("#txtTaskName").attr("data-taskid"));
            oData["title"] = $.trim($("#txtTitle").val());
            oData["icon"] = $.trim($("#trTitle input[type='radio']:checked").attr("data-icontype"));
            oData["content"] = $.trim($("#txtContent").val());
            oData["href"] = $.trim($("#txtHref").val());
            oData["remark"] = $.trim($("#txtDesc").val());
            oData["orderKey"] = $.trim($("#txtOrderKey").val());
            oData["netWork"] = $.trim($("#selNetWork").val());
            oData["sort"] = $.trim($("#txtSort").val()) == "" ? "-1" : $.trim($("#txtSort").val());
            oData["kind"] = $.trim($("#selPuchConfig").val());
            oData["type"] = $.trim(type);
            oData["isUsed"] = $.trim($("#selIsUsed").val());
            oData["pictureByte"] = $.trim(fileArray.serverPath);

            $util.ajaxPost(savePushUrl, JSON.stringify(oData), function (data) {
                if (data.state) {
                    $html.success(data.message);
                    layer.close(index);
                    dataTable.ajax.reload();
                } else {
                    $html.warning(data.message);
                }
            }, function () {
                $html.warning("操作失败！");
            });
        }, 200);
    }

    // 删除推送内容
    obj.evtOnDelPush = function (id) {
        var closeIndex = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    layer.close();
                    return;
                }
                $util.ajaxPost(deletePushUrl, JSON.stringify({id: id}), function (data) {
                    if (data.state) {
                        $html.success(data.message);
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(data.message);
                    }
                }, function () {
                    $html.warning("删除失败！");
                });
            },
            function () {
                layer.close(closeIndex);
            });
    }

    // 查询
    obj.evtOnQueryPush = function () {
        dataTable.ajax.url(getPushListUrl + "?name=" + encodeURIComponent($("#txtQuery").val()) + "&kind=" + $("#selQueryPush").val());
        dataTable.ajax.reload();
    }

    // radio切换选择
    obj.evtOnChangeType = function () {
        if ($(this).attr("data-dbtype") == "1") {   //网址
            $("#trDesc").hide();
            $("#trOrderKey").hide();
            $("#trSort").hide();
            $("#trHref").show();
        } else if ($(this).attr("data-dbtype") == "2") { //描述
            $("#trHref").hide();
            $("#trDesc").show();
            $("#trOrderKey").show();
            $("#trSort").show();
        }
    }

    // 显示任务列表
    obj.evtOnShowTask = function () {
        layer.open({
            type: 1,
            title: '任务选择',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['720px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupTask'),
            yes: function (index, layero) {
                obj.evtOnConfirmTask (index);
            },
            cancel: function (index, layero) {
                $("#popupTask input[type='checkbox']").each(function () {   //设置checkbox全部取消选中
                    $(this).attr('checked', false);
                });
                layer.close(index);
            }
        });
        //layerIndex = $html.iProbeBox(650, $('#popupTask'));
        //$('#popupTask').removeClass('hidden');
        obj.tableTaskInit();
    }

    // 任务列表
    obj.tableTaskInit = function () {
        var isload = false;
        if (!taskListTable || !taskListTable.ajax.json) {
            isload = true;
            var option = {
                ele: $('#tableTask'),
                ajax: {url: getTaskListUrl, type: "POST"},
                info: false,
                columns: [
                    {
                        title: "选择", width: 10,
                        render: function (data, type, row) {
                            var checked = "";
                            if (row.id == $("#txtTaskName").attr("data-taskid")) {
                                checked = " checked='checked'";
                            }
                            return "<input type='radio' " + checked + " name='taskChk' data-taskid='" + row.id + "' onclick='pushcontent.evtOnRadioTask(this,event)' />";
                        }
                    },
                    {
                        data: "Name", title: "任务名", width: 400,
                        render: function (data, type, row) {
                            return "<span>" + row.name + "</span>"
                        }
                    },
                    {
                        title: "操作", width: 10,
                        render: function (data, type, row) {
                            return "<a class='btn btn-info dspBtn' onclick=\"pushcontent.evtOnSelectTask(this,event)\"><i class=\"fa fa-check-square\" data-type=\"btnSpan\" onclick=\"pushcontent.evtOnSelectTask(this,event)\"></i></a>"
                        }
                    }
                ]
            };
            taskListTable = $plugin.iCompaignTable(option);
        }
        if (!isload) {
            taskListTable.ajax.url(getTaskListUrl);
            taskListTable.ajax.reload();
        }
    }

    obj.evtOnRadioTask = function (thisObj) {
        $("#popupTask input[type=radio]").attr("checked", false);
        thisObj.checked= "checked";
    }

    // 任务列表 选择任务 选择
    obj.evtOnSelectTask = function (thisObj) {
        var chk = [];
        if ($(thisObj).attr("data-type") == "btnSpan") {   //如果是点击span 触发的事件 获取checkbox的方式则不同
            chk = $(thisObj).parent().parent().siblings().children("input[type='radio']");
        } else {
            chk = $(thisObj).parent().siblings().children("input[type='radio']");
        }
        $(chk)[0].checked = $(chk).attr("checked") != "checked";
        $(chk).parent().parent().siblings().children("td").children("input[type = 'radio']").attr("checked", false); //将其他checkbox取消选中
       // thisObj.event.stopPropagation(); //组织事件冒泡
    }

    // 任务列表 选择任务 确定
    obj.evtOnConfirmTask = function (index) {
        var isChecked = false;
        var taskId = 0;
        $("#popupTask input[type='radio']").each(function () {
            if ($(this)[0].checked == true) {
                taskId = $(this).attr("data-taskid");   //获取taskId
                $("#txtTaskName").attr("data-taskid", taskId);
                var taskName = $(this).parent().siblings().children("span").text();
                $("#txtTaskName").val(taskName);

                isChecked = true;
            }
        });
        if (!isChecked) {
            $html.warning("请选择一个任务！");
            return;
        }
        layer.close(index);
    }

    // 任务列表 选择任务 取消
    obj.evtOnCancelTask = function () {
        $("#popupTask input[type='radio']").each(function () {   //设置checkbox全部取消选中
            $(this).attr('checked', false);
        });
        layer.close(layerIndex);
    }

    // 重置 内容
    obj.reset = function () {
        $("#txtTaskName").val("").attr("data-taskid", 0);  //任务名重置并将其 data-taskid 重置为0
        $("#txtContent").val("");   //内容
        obj.selectPushConfigInit(); //推送类型
        $("#txtTitle").val(""); //标题
        $("#hiddenImg").hide();
        $(".close.fileinput-remove").trigger('click');
        $("#txtHref").val("");  //网址
        $("#txtDesc").val("");  //描述
        $("#txtOrderKey").val("");  //订购编码
        $("#txtSort").val("");      //排序
        $('input:radio:first').attr('checked', 'checked');  //所有radio重置为 选中第一个radio
        //$('.upload_image')[0].src = "ext/zyupload/skins/images/add_img.png";
    }

    // 获取文件名
    obj.getFileName = function (o) {
        var filename = o.replace(/.*(\/|\\)/, "");
        var i = filename.lastIndexOf(".");
        if (i >= 0)
            return filename.substring(0, i);
        else
            return filename;
    }

    return obj;
}()
function onLoadBody() {

    pushcontent.initData();
    pushcontent.initEvent();


}


