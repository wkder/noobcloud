var locationgroup = function () {
    var dataTable, locationTable;
    var layerIndex = 0, confirmIndex = 0, readyWait = 0;
    var fileUploadName = "";
    var bootan = true;
    var isload = false;
    var obj = {};


    var getLocationGroup = "getLocationGroupList.view";
    var getLocationList = "getLocationList.view";
    var saveLocationGroup = "addOrEditLocationGroup.view";
    var deleteLocation = "deleteLocation.view";
    var deleteLocationGroup = "deleteLocationGroup.view";
    var uploadFileLocation = "upLoadLocationFile.view";
    var addsLocation = "addsLocation.view";
    var flashswfurl = "ext/iprobe/plupload/Moxie.swf";
    var silverlightxapurl = "ext/iprobe/plupload/Moxie.xap";


    obj.initData = function () {
        obj.dataTableInit();
        //obj.cmTableInit();
        obj.upload();
    };

    obj.initEvent = function () {
        $("#btnRefresh").click(obj.evtOnRefresh);  //刷新事件
        $("#btnAdd").click(obj.evtOnAddGroup);     //添加分类事件
        $("#btnQuery").click(obj.evtOnQuery);      //查询事件

    };

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getLocationGroup, type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 80, className: "dataTableFirstColumns"},
                {
                    data: "name", title: "区域类别", width: 400,
                    render: function (data, type, row) {
                        return "<span id='" + row.id + "' style='color:#42a354;cursor:pointer;' onclick=\"locationgroup.showlocation('" + row.tableName + "')\">" + row.name + "</span>";
                    }
                },
                {data: "count", title: "区域数", width: 100, className: "centerColumns"},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='locationgroup.evtOnEditGroup(\"" + row.id + "\",\"" + row.name + "\");'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick='locationgroup.evtOnDeleteGroup(\"" + row.id + "\",\"" + row.name + "\");'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    //// 弹窗表格初始化
    //obj.cmTableInit = function () {
    //    $("#popupAddOrEdit").cmTable({
    //        columns: [
    //            {
    //                id: "txtName", desc: "分类名称",
    //                validate: {expression: "NotNull"},
    //                alert: {className: "help-block alert alert-warning", text: "分类名称不能为空"}
    //            }
    //        ]
    //    });
    //};

    // 导入分类
    obj.upload = function () {
        //实例化一个plupload上传对象
        var uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,browserplus', //gears,
            browse_button: 'upload', //触发文件选择对话框的按钮，为那个元素id
            url: uploadFileLocation, //服务器端的上传页面地址
            flash_swf_url: flashswfurl, //swf文件，当需要使用swf方式进行上传时需要配置该参数
            silverlight_xap_url: silverlightxapurl, //silverlight文件，当需要使用silverlight方式进行上传时需要配置该参数
            multi_selection: false,
            //max_file_size: '20mb',
            chunk_size: '1000kb'
        });
        //绑定各种事件，并在事件监听函数中做你想做的事
        uploader.bind('FilesAdded', function (uploader, files) {
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            var fileextension = files[0].name.split('.')[1];
            if (fileextension === 'csv') {
                if(files[0].name.length>40){
                    $html.warning("文件名不能超过20个字符哦");
                    uploader.stop();
                    return;
                }
                fileUploadName = files[0].name.split('.')[0] + "-" + $util.guid() + ".csv";
                uploader.settings.url = uploadFileLocation + '?fName=' + encodeURI(fileUploadName);
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
                readyWait = layer.open({
                    type: 1,
                    title: '进度上传中,请勿关闭该窗口',
                    area: ['auto', '120px'],
                    skin: 'layui-layer-lan',
                    closeBtn: 1,
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
            layer.close(readyWait);
            bootan = true;
            $.ajax({
                type: 'post',
                url: addsLocation,
                data: {'name': fileUploadName},
                dataType: 'json',
                beforeSend: function () {
                    $html.loading(true);
                },
                complete: function () {
                    $html.loading(false);
                },
                success: function (data) {
                    if (data.state) {
                        $html.success("上传成功！");
                        dataTable.ajax.reload();
                    } else {
                        $html.warning("上传失败！错误手机号：" + data.message);
                    }
                }
            });
        });
        uploader.init();
    };

    // 刷新
    obj.evtOnRefresh = function () {
        $("#txtGroupName").val("");
        dataTable.ajax.url(getLocationGroup);
        dataTable.ajax.reload();
    };

    // 添加分类
    obj.evtOnAddGroup = function () {
        //清空分类框内容
        $("#txtName").val("");
        $("#GroupId").val("");

        layer.open({
            type: 1,
            title: "新增区域分类",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnSaveGroup(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getLocationGroup + "?groupName=" + encodeURIComponent($("#txtGroupName").val()));
        dataTable.ajax.reload();
    };

    // 显示区域名称列表
    obj.showlocation = function (tableName) {
        locationTable = {};
        if (!isload) {
            isload = true;
        } else {
            $("#poplocation>div:nth-child(1)>#region-list_wrapper").remove();
            $("#poplocation>div:nth-child(1)").append('<table id="region-list" class="table table-hover table-condensed table-bordered" cellspacing="0"></table>');
        }

        var option = {
            ele: $('#region-list'),
            ajax: {url: getLocationList + "?tableName=" + tableName, type: "POST"},
            pageLength: 20,
            info: false,
            columns: [
                {data: "oid", title: "OID", width: 60},
                {data: "lac", title: "LAC", width: 60},
                {data: "ci", title: "CI", width: 60},
                {data: "city", title: "城市", width: 60},
                {data: "sceneId", title: "场景编号", width: 60},
                {data: "sceneName", title: "场景名称", width: 80},
                {data: "scenelong", title: "小区经度", width: 60},
                {data: "scenelat", title: "小区纬度", width: 60},
                {data: "coverage", title: "覆盖范围", width: 60},
                {
                    data: "isReport", title: "是否上报", width: 60,
                    render: function (data, type, row) {
                        if (row.isReport != 1) {
                            return "否";
                        } else {
                            return "是";
                        }
                    }
                },
                {data: "adminRegion", title: "行政区", width: 60},
                {data: "regionName", title: "小区中文名", width: 60},
                {data: "netWorkType", title: "网络类型", width: 60},
                {data: "ulitype", title: "ULIType", width: 60},
                {
                    title: "操作", width: 50,
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-danger btn-delete\" title=\"删除\" onclick=\"locationgroup.evtOnDeleteLocation('" + row.id + "','" + tableName + "')\">" +
                            "<i class=\"fa fa-trash-o\"></i>" +
                            "</a>";
                    }
                }
            ]
        };
        locationTable = $plugin.iCompaignTable(option);

        layer.open({
            type: 1,
            title: "区域名称",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['1060px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#poplocation'),
            yes: function (index, layero) {
                layer.close(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    // 删除区域名称
    obj.evtOnDeleteLocation = function (id, tableName) {
        confirmIndex = $html.confirm('确定删除该数据吗？', function () {
            $util.ajaxPost(deleteLocation, JSON.stringify({pid: id, tableName: tableName}), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        locationTable.ajax.reload();
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning('删除失败！');
                });
        }, function () {
            layer.close(confirmIndex);
        });
    };

    // 编辑分类
    obj.evtOnEditGroup = function (id, name) {
        $("#GroupId").val(id);
        $("#txtName").val(name);

        layer.open({
            type: 1,
            title: "编辑区域分类",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnSaveGroup(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });

    };

    // 保存分类
    obj.evtOnSaveGroup = function (index) {
        if(!$("#popupAddOrEdit").autoVerifyForm())return;
        var id = $("#GroupId").val();
        var value = id > 0 ? "编辑" : "新增";
        var name = $("#txtName").val();

        //if (!$("#popupAddOrEdit").cmValidate()) {
        //    return;
        //}
        setTimeout(function () {
            var oData = {};
            oData["Id"] = $.trim(id);
            oData["Name"] = $.trim(name);

            $util.ajaxPost(saveLocationGroup, JSON.stringify(oData), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        layer.close(index);
                        dataTable.ajax.reload();
                    }
                    else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning("操作失败！");
                });
        }, 200);
    };

    // 删除区域分类
    obj.evtOnDeleteGroup = function (id, name) {
        var msg = "确定删除名称为: [" + name + "] 的区域分类吗？";
        confirmIndex = $html.confirm(msg, function () {
            $util.ajaxPost(deleteLocationGroup, JSON.stringify({pid: id}), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning('删除失败！');
                });
        }, function () {
            layer.close(confirmIndex);
        });
    };

    return obj;
}();

function onLoadBody() {
    locationgroup.initData();
    locationgroup.initEvent();
}
