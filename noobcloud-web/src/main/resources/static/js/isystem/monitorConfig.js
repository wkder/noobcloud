/**
 * Created by xuan on 2017/4/19.
 */
var monitorConfig = function () {
    var getMgr = "queryMonitorConfig.view",
        addOrEditUrl = "addOrEditMonitor.view",
        delMgr = "deleteMonitor.view",
        getEmailOrPhone = "addEmailOrPhone.view",
        queryEmailOrPhone="queryEmailOrPhone.view",
        queryEmail="queryEmail.view",
        queryPhone="queryPhone.view",
        queryMonitorById="queryMonitorById.view",
        queryEmailList="queryEmailList.view",
        queryPhoneList="queryPhoneList.view",
        deleteEmail="deleteEmail.view",
        deletePhone="deletePhone.view",
        addOrEditEmail="addOrEditEmail.view",
        addOrEditPhone="addOrEditPhone.view",
        dataTable, obj = {},layerWaitIndex1 = 0,layerWaitIndex2 = 0,dataTableEmail,dataTablePhone;
    var fileUploadName = "";
    var flashswfurl = "ext/plupload/Moxie.swf";
    var uploadFileUrl = "uploadUrlFileMonitor.view";
    var silverlightxapurl = "ext/plupload/Moxie.xap";
    var bootan = true;
    var monitorId=0;//监控配置Id
    var emailListShow=true;
    var phoneListShow=true;

    obj.initData = function () {
        obj.dataTableInit();
        obj.upload();
        obj.uploadPhone();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddorEdit);
    }

    //列表加载
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getMgr, type: "POST"},
            columns: [
                {data: "id", title: "序号", visible: false},
                {data: "serverIp", title: "目标服务地址", className: "dataTableFirstColumns"},
                {data: "serverAccount", title: "账号服务"},
                {data: "dataBaseName", title: "库名"},
                {
                    data: "type", title: "类型",
                    render: function (data, type, row) {
                        if (data== "1") {
                            return "FTP";
                        } else if (data== "2"){
                            return "MySQL";
                        }else{
                            return "GP";
                        }
                    }},
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='monitorConfig.evtOnAddorEdit(\"" + row.id + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"monitorConfig.evtOnDelete(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 导入类别（email）
    obj.upload = function () {
        //实例化一个plupload上传对象
        var uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,browserplus', //gears,
            browse_button: 'updateEmail', //触发文件选择对话框的按钮，为那个元素id
            url: uploadFileUrl, //服务器端的上传页面地址
            flash_swf_url: flashswfurl, //swf文件，当需要使用swf方式进行上传时需要配置该参数
            silverlight_xap_url: silverlightxapurl, //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            multi_selection: false,
            chunk_size: '100kb'
        });
        //绑定各种事件，并在事件监听函数中做你想做的事
        uploader.bind('FilesAdded', function (uploader, files) {
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            var fileextension = files[0].name.split('.')[1];
            if (fileextension === 'txt') {
                if(files[0].name.length>40){
                    $html.warning("文件名不能超过20个字符哦");
                    uploader.stop();
                    return;
                }
                fileUploadName = files[0].name.split('.')[0] + "-" + $util.guid() + ".txt";
                uploader.settings.url = uploadFileUrl + '?fname=' + encodeURI(fileUploadName) + "&originalFile=" + encodeURI(files[0].name.split('.')[0]);
                uploader.start();
            }
            else {
                $html.warning("上传文件格式不正确！");
                uploader.stop();
            }
        });
        uploader.bind('UploadProgress', function (uploader, file) {
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            if (bootan) {
                bootan = false;
                layerWaitIndex1 = layer.open({
                    type: 1,
                    title: '进度上传中,请勿关闭该窗口',
                    area: ['auto', '120px'],
                    skin: 'layui-layer-lan',
                    closeBtn: 1,
                    //offset: "rb",
                    shift: 0,
                    content: $('#uploadPross'),
                    success: function () {
                        $("#uploadPross").show();
                    },
                });
            }
            var valuesf = parseInt((file.loaded / file.origSize) * 100) + "%";
            $("#uploadPross .title").text(file.loaded + "/" + file.origSize + "  --  " + valuesf);
            $("#uploadPross .proess").css("width", valuesf);
        });

        uploader.bind('FileUploaded', function () {
            layer.close(layerWaitIndex1);
            bootan = true;
            $.ajax({
                type: 'post',
                url: getEmailOrPhone,
                dataType: 'json',
                data: {'name': fileUploadName,'type':1},
                beforeSend: function () {
                    $html.loading(true);
                },
                complete: function () {
                    $html.loading(false);
                },
                success: function (data) {
                    if (data.state) {
                        $("#txtEmail").val(data.message)
                        $html.success("上传成功！");

                    } else {
                        $html.warning("上传失败！");
                    }
                }
            });
        });
        uploader.init();
    };

    // 导入类别(phone)
    obj.uploadPhone = function () {
        //实例化一个plupload上传对象
        var uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,browserplus', //gears,
            browse_button: 'updatePhone', //触发文件选择对话框的按钮，为那个元素id
            url: uploadFileUrl, //服务器端的上传页面地址
            flash_swf_url: flashswfurl, //swf文件，当需要使用swf方式进行上传时需要配置该参数
            silverlight_xap_url: silverlightxapurl, //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            multi_selection: false,
            chunk_size: '100kb'
        });
        //绑定各种事件，并在事件监听函数中做你想做的事
        uploader.bind('FilesAdded', function (uploader, files) {
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            var fileextension = files[0].name.split('.')[1];
            if (fileextension === 'txt') {
                if(files[0].name.length>40){
                    $html.warning("文件名不能超过20个字符哦");
                    uploader.stop();
                    return;
                }
                fileUploadName = files[0].name.split('.')[0] + "-" + $util.guid() + ".txt";
                uploader.settings.url = uploadFileUrl + '?fname=' + encodeURI(fileUploadName) + "&originalFile=" + encodeURI(files[0].name.split('.')[0]);
                uploader.start();
            }
            else {
                $html.warning("上传文件格式不正确！");
                uploader.stop();
            }
        });
        uploader.bind('UploadProgress', function (uploader, file) {
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            if (bootan) {
                bootan = false;
                layerWaitIndex2 = layer.open({
                    type: 1,
                    title: '进度上传中,请勿关闭该窗口',
                    area: ['auto', '120px'],
                    skin: 'layui-layer-lan',
                    closeBtn: 1,
                    //offset: "rb",
                    shift: 0,
                    content: $('#uploadPross'),
                    success: function () {
                        $("#uploadPross").show();
                    },
                });
            }
            var valuesf = parseInt((file.loaded / file.origSize) * 100) + "%";
            $("#uploadPross .title").text(file.loaded + "/" + file.origSize + "  --  " + valuesf);
            $("#uploadPross .proess").css("width", valuesf);
        });

        uploader.bind('FileUploaded', function () {
            layer.close(layerWaitIndex2);
            bootan = true;
            $.ajax({
                type: 'post',
                url: getEmailOrPhone,
                dataType: 'json',
                data: {'name': fileUploadName,'type':2},
                beforeSend: function () {
                    $html.loading(true);
                },
                complete: function () {
                    $html.loading(false);
                },
                success: function (data) {
                    if (data.state) {
                        $("#txtPhone").val(data.message)
                        $html.success("上传成功！");
                    } else {
                        $html.warning("上传失败！");
                    }
                }
            });
        });
        uploader.init();
    };
    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getMgr + "?serverIp="+encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }
    // 新增或修改 弹窗
    obj.evtOnAddorEdit = function (id) {
        var title = "新增";
        $("#txtEmail").val("");
        $("#txtPhone").val("");
        if(id>0) {//修改
            monitorId=id;//保存当前编辑监控配置的id为全局变量
            $util.ajaxPost(queryMonitorById, JSON.stringify({id: id}), function (data) {

                if (data.total == 1) {
                    title = "编辑";
                    $("#serverIp").val(data.data[0].serverIp);
                    $("#port").val(data.data[0].port);
                    $("#serverAccount").val(data.data[0].serverAccount);
                    //$("#serverPassWord").val(data.data[0].serverPassWord);
                    $("#serverPassWord").val("");
                    $("#selType").val(data.data[0].type);
                    $("#expected").val(data.data[0].expected);
                    $("#format").val(data.data[0].format);
                    $("#timeTick").val(data.data[0].timeTick);
                    $("#dataBaseName").val(data.data[0].dataBaseName);
                    $("#messageContent").val(data.data[0].messageContent);
                    if (data.data[0].type == 1) {//FTP
                        $("#dataBaseName").parent().parent().hide();
                        $("#format").parent().parent().show();
                    } else if (data.data[0].type == 2) {//MySql
                        $("#format").parent().parent().hide();
                        $("#dataBaseName").parent().parent().show();
                    } else {//GP
                        $("#dataBaseName").parent().parent().show();
                        $("#format").parent().parent().show();
                    }
                    $("#btnEmail").show();
                    $("#btnPhone").show();
                    $util.ajaxPost(queryEmailOrPhone, JSON.stringify({"id": id}), function (res) {

                        if (res.state) {
                            var count = res.message.split('|');
                            $("#txtEmail").val("已导入邮箱数量: " + count[0] + "个");
                            $("#txtPhone").val("已导入号码数量: " + count[1] + "个");
                        }
                    }, function () {
                        $html.warning('操作失败！');
                    });
                }
                $("#selType").change(function () {
                    var value = $(this).children('option:selected').val();
                    if (value == 1) {//FTP
                        $("#dataBaseName").parent().parent().hide();
                        $("#format").parent().parent().show();
                    } else if (value == 2) {//MySql
                        $("#format").parent().parent().hide();
                        $("#dataBaseName").parent().parent().show();
                    } else {//GP
                        $("#dataBaseName").parent().parent().show();
                        $("#format").parent().parent().show();
                    }
                })
            }, function () {
                $html.warning('操作失败！');
            });
        }else{//新增
            $("#serverIp").val("");
            $("#port").val("");
            $("#serverAccount").val("");
            $("#serverPassWord").val("");
            $("#selType").val(1);
            $("#expected").val("");
            $("#format").val("");
            $("#timeTick").val("");
            $("#dataBaseName").val("");
            $("#messageContent").val("");
            $("#dataBaseName").parent().parent().hide();
            id=0;
            $("#btnEmail").hide();
            $("#btnPhone").hide();
        }
        //打开编辑窗口
        layer.open({
            type: 1,
            title: title,
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index, layero) {
                obj.evtOnSave(index,id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        //var optionEmail="";
        var optionPhone="";
    }

    //点击展示邮箱展示事件
    obj.evtShowEmail=function(){
        layer.open({
            type: 1,
            title: "邮件展示",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['650px', '600px'],
            offset: '60px',
            shift: 6,
            btn: ['确定'],
            content: $('#cmTableEmail'),
            yes: function (index, layero) {
                //保存成功重新查询导入邮箱数量
                $util.ajaxPost(queryEmail, JSON.stringify({"id": monitorId}), function (res) {
                    if (res.state) {
                        $("#txtEmail").val("已导入邮箱数量: " + res.message + "个");
                    }
                }, function () {
                    $html.warning('操作失败！');
                });
                layer.close(index);
            }
        });
        //展示列表
        if(emailListShow) {
            var optionEmail = {
                ele: $('#dataTableEmail'),
                ajax: {url: queryEmailList + "?id=" + monitorId, type: "POST"},
                columns: [
                    {data: "id", title: "序号", visible: false},
                    {data: "email", title: "邮箱", className: "dataTableFirstColumns"},
                    {
                        title: "操作",
                        render: function (data, type, row) {
                            var regex = new RegExp("\"", "g");
                            return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='monitorConfig.evtOnAddorEditEmail(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"monitorConfig.evtOnDeleteEmail(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                        }
                    }
                ]
            };
            dataTableEmail = $plugin.iCompaignTable(optionEmail);
            emailListShow=false;
        }else{
            dataTableEmail.ajax.url(queryEmailList + "?id=" + monitorId);
            dataTableEmail.ajax.reload();
        }
    }

    //点击展示号码展示事件
    obj.evtShowPhone=function(){
        layer.open({
            type: 1,
            title: "号码展示",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['650px', '600px'],
            offset: '60px',
            shift: 6,
            btn: ['确定'],
            content: $('#cmTablePhone'),
            yes: function (index, layero) {
                //保存成功重新查询导入号码数量
                $util.ajaxPost(queryPhone, JSON.stringify({"id": monitorId}), function (res) {
                    if (res.state) {
                        $("#txtPhone").val("已导入号码数量: " +res.message + "个");
                    }
                }, function () {
                    $html.warning('操作失败！');
                });
                layer.close(index);
            }
        });
        //展示列表
        if(phoneListShow) {
            var optionPhone = {
                ele: $('#dataTablePhone'),
                ajax: {url: queryPhoneList + "?id=" + monitorId, type: "POST"},
                columns: [
                    {data: "id", title: "序号", visible: false},
                    {data: "phone", title: "号码", className: "dataTableFirstColumns"},
                    {
                        title: "操作",
                        render: function (data, type, row) {
                            var regex = new RegExp("\"", "g");
                            return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='monitorConfig.evtOnAddorEditPhone(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"monitorConfig.evtOnDeletePhone(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                        }
                    }
                ]
            };
            dataTablePhone = $plugin.iCompaignTable(optionPhone);
            phoneListShow=false;
        }else{
            dataTablePhone.ajax.url(queryPhoneList + "?id=" + monitorId);
            dataTablePhone.ajax.reload();
        }
    }

    //编辑email
    obj.evtOnAddorEditEmail=function(o){
        var id=0;
        if (o && typeof (o) == "string") {   //编辑
            o = JSON.parse(o);
            id = o.id;
            $("#email").val(o.email);
        }else{
            $("#email").val("");
        }

        layer.open({
            type: 1,
            title: id=="0"?"新增":"修改",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['600px', '550px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmEmailDetail'),
            yes: function (index, layero) {
                obj.evtOnSaveEmail(index,id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //保存email
    obj.evtOnSaveEmail = function (index,id) {
        if (!$("#cmEmailDetail").autoVerifyForm()) return;

            var oData = {};
        oData["email"] = $("#email").val();
        oData["monitorId"]=monitorId;
        oData["id"]=id;
        $util.ajaxPost(addOrEditEmail, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
                dataTableEmail.ajax.reload();
                layer.close(index);
            } else {
                $html.warning(res.message);
            }
        }, function () {
            $html.warning('操作失败！');
        });
    }
    //删除email
    obj.evtOnDeleteEmail=function(id){
        var dspConfirm = $html.confirm('确定删除该数据吗？', function () {
            $util.ajaxPost(deleteEmail, JSON.stringify({"id": id,"monitorId":monitorId}), function (res) {
                if (res.state) {
                    $html.success(res.message);
                    dataTableEmail.ajax.reload();
                } else {
                    $html.warning(res.message);
                }
            }, function () {
                $html.warning('操作失败！');
            });
        }, function () {
            layer.close(dspConfirm);
        });
    }

    //编辑号码
    obj.evtOnAddorEditPhone=function(o){
        var id=0;
        if (o && typeof (o) == "string") {   //编辑
            o = JSON.parse(o);
            id = o.id;
            $("#phone").val(o.phone);
        }else{
            $("#phone").val("");
        }

        layer.open({
            type: 1,
            title: id=="0"?"新增":"修改",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['600px', '550px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmPhoneDetail'),
            yes: function (index, layero) {
                obj.evtOnSavePhone(index,id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    //保存Phone
    obj.evtOnSavePhone = function (index,id) {
        if (!$("#cmPhoneDetail").autoVerifyForm()) return;

        var oData = {};
        oData["phone"] = $("#phone").val();
        oData["monitorId"]=monitorId;
        oData["id"]=id;
        $util.ajaxPost(addOrEditPhone, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
                dataTablePhone.ajax.reload();
                layer.close(index);
            } else {
                $html.warning(res.message);
            }
        }, function () {
            $html.warning('操作失败！');
        });
    }

    //删除phone
    obj.evtOnDeletePhone=function(id){
        var dspConfirm = $html.confirm('确定删除该数据吗？', function () {
            $util.ajaxPost(deletePhone, JSON.stringify({"id": id,"monitorId":monitorId}), function (res) {
                if (res.state) {
                    $html.success(res.message);
                    dataTablePhone.ajax.reload();
                } else {
                    $html.warning(res.message);
                }
            }, function () {
                $html.warning('操作失败！');
            });
        }, function () {
            layer.close(dspConfirm);
        });
    }

    //保存
    obj.evtOnSave = function (index,id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var selType=$("#selType").val();
        var serverIp= $("#serverIp").val();
        if(selType==3){//GP
            if($("#dataBaseName").val()==""){
                $("#dataBaseName").focus();
                layer.tips("库名不为空!", $("#cmTableContent  [name='dataBaseName']"), {tips: 3});
                return;
            }
        }
        var regexp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
        var valid = regexp.test(serverIp);
        if(!valid){//首先必须是 xxx.xxx.xxx.xxx 类型的数字，如果不是，返回false
            $("#serverIp").focus();
            layer.tips("目标服务地址格式不对!", $("#cmTableContent  [name='serverIp']"), {tips: 3});
            return;
        }
            //var regex="^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]{1,2})){3}$";

        //邮件或号码必须要导入一个
        var emailPath = $("#txtEmail").val();
        var phonePath = $("#txtPhone").val();
        if(id==0&&emailPath==""&&phonePath==""){
            $html.warning("邮箱或号码必须导入一个！");
            return;
        }
        //下发通知内容
        var messageContent= $("#messageContent").val();
        var start = messageContent.indexOf("【");
        if(start!=0&&messageContent.indexOf("】")==-1){
            $html.warning("下发内容要包含【】标题！");
            return;
        }
            var oData = {};
        oData["serverIp"] = serverIp;
        oData["port"] = $("#port").val();
        oData["serverAccount"] = $("#serverAccount").val();
        if($("#serverPassWord").val().trim()!=""){
            oData["serverPassWord"] = $("#serverPassWord").val();
        }else{
            oData["serverPassWord"]="";
        }
        oData["type"] = selType;
        oData["expected"] = $("#expected").val();
        oData["format"] = $("#format").val();
        oData["timeTick"] = $("#timeTick").val();
        oData["dataBaseName"] = $("#dataBaseName").val();
        oData["messageContent"] = messageContent;
        oData["emailPath"] =emailPath;
        oData["phonePath"] =phonePath;
        oData["id"]=id;
        $util.ajaxPost(addOrEditUrl, JSON.stringify(oData), function (res) {
            if (res.state) {
                $html.success(res.message);
                dataTable.ajax.reload();
                layer.close(index);
            } else {
                $html.warning(res.message);
            }
        }, function () {
            $html.warning('操作失败！');
        });
    }

    // 删除
    obj.evtOnDelete = function (id) {
        var dspConfirm = $html.confirm('确定删除该数据吗？', function () {
            $util.ajaxPost(delMgr, JSON.stringify({"id": id}), function (res) {
                if (res.state) {
                    $html.success(res.message);
                    dataTable.ajax.reload();
                } else {
                    $html.warning(res.message);
                }
            }, function () {
                $html.warning('操作失败！');
            });
        }, function () {
            layer.close(dspConfirm);
        });
    }
    return obj;
}();

function onLoadBody() {
    monitorConfig.initData();
    monitorConfig.initEvent();
}