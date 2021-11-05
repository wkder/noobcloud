var urlgroup = function () {
    var dataTable, urlListTable;
    var layerIndex = 0, layerIndexTwo = 0, layerIndexThree = 0, dspConfirm = 0, layerWaitIndex = 0;
    var fileUploadName = "";
    var bootan = true;
    var obj = {};
    var getUrlGroupUrl = "getUrlGroupList.view";
    var getUrlListUrl = "getUrlList.view";
    var getDelGroupUrl = "deleteUrlGroup.view";
    var getDelUrl = "deleteUrl.view";
    var saveUrlGroupUrl = "addOrEditUrlGroup.view";
    var uploadFileUrl = "uploadUrlFile.view";
    var getAddurlUrl = "addUrlState.view";
    var saveUrl = "saveUrl.view";
    var flashswfurl = "ext/plupload/Moxie.swf";
    var silverlightxapurl = "ext/plupload/Moxie.xap";

    obj.initData = function () {
        obj.dataTableInit();
        //obj.cmTableInit();
        //obj.cmTableUrlInit();
        obj.upload();
    };

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);               //查询
        $("#btnRefresh").click(obj.evtOnRefresh);           //刷新
        $("#btnAdd").click(obj.evtOnAddGroup);              //添加分类事件
        //$("#btnSaveGroup").click(evtOnSaveGroup);       //添加分类保存事件
        //$("#btnCancelGroup").click(evtOnCancelGroup);   //添加分类取消事件
        //$("#btnCancelUrl").click(evtOnCancelUrl);       //取消
        $("#btnAddUrl").click(obj.evtOnAddUrl);             //添加单个Url事件
        //$("#btnSaveUrl").click(evtOnSaveUrl);           //添加单个Url保存事件
        //$("#btnCancelAddUrl").click(obj.evtOnCancelAddUrl); //添加单个Url取消事件
    };

    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrlGroupUrl, type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 80, className: "dataTableFirstColumns"},
                {
                    data: "name", title: "分类名称", width: 400,
                    render: function (data, type, row) {
                        return "<span id='" + row.id + "' style='color:#42a354;cursor:pointer;' onclick=\"urlgroup.evtOnShowUrlList('" + row.id + "')\">" + row.name + "</span>";
                    }
                },
                {data: "count", title: "URL数量", width: 100, className: "centerColumns"},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='urlgroup.evtOnEditUrlGroup(\"" + row.id + "\",\"" + row.name + "\");'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick='urlgroup.evtOnDelUrlGroup(\"" + row.id + "\");'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 导入类别
    obj.upload = function () {
        //实例化一个plupload上传对象
        var uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,browserplus', //gears,
            browse_button: 'upload', //触发文件选择对话框的按钮，为那个元素id
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
                layerWaitIndex = layer.open({
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
            layer.close(layerWaitIndex);
            bootan = true;
            $.ajax({
                type: 'post',
                url: getAddurlUrl,
                dataType: 'json',
                data: {'name': fileUploadName},
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
                        $html.warning("上传失败！");
                    }
                }
            });
        });
        uploader.init();
    };

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getUrlGroupUrl + "?groupName=" + encodeURIComponent($("#txtGroupName").val()) + "&urlName=" + encodeURIComponent($("#txtUrlName").val()) + "&urlWord=" + encodeURIComponent($("#txtUrl").val()));
        dataTable.ajax.reload();
    };

    var groupid;
    var idLast;
    // 网址列表显示
    obj.evtOnShowUrlList = function (id) {
        $("#btnAddUrl").attr("data-id", 0);
        groupid = id;
        if (id !== idLast) {
            if (!urlListTable || !urlListTable.ajax.json) {
                var option = {
                    ele: $('#url-list'),
                    ajax: {url: getUrlListUrl + "?id=" + id, type: "POST"},
                    pageLength: 20,
                    info: false,
                    columns: [
                        {data: "name", title: "网址名称", width: 100},
                        {
                            data: "url", title: "网址", width: 120,
                            render: function (data, type, row) {
                                return "<span style='word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;overflow: hidden;' title='" + row.url + "'>" + row.url + "</span>";
                            }
                        },
                        {
                            title: "操作", width: 40,
                            render: function (data, type, row) {
                                return "<a class=\"btn btn-danger btn-delete\" title=\"删除\"  onclick=\"urlgroup.evtOnDelUrl(" + row.id + ")\">" +
                                    "<i class=\"fa fa-trash-o\"></i>" +
                                    "</a>";
                            }
                        }
                    ]
                };
                urlListTable = $plugin.iCompaignTable(option);
            }
            urlListTable.ajax.url(getUrlListUrl + "?id=" + id);
            urlListTable.ajax.reload();
            idLast = id;
        }

        $("#btnAddUrl").attr("data-id", id);

        //$html.iCompaignBox(false,['800px', '650px'],$('#popurlist'),function(index){
        //    layer.close(index);
        //});
        layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['800px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popurlist'),
            yes: function (index, layero) {
                layer.close(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });

    };

    // 新增网址分类名称
    obj.evtOnAddGroup = function () {
        layer.open({
            type: 1,
            title: "新增网址分类",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                var id = 0;
                //var name = $("#txtName").val();
                obj.evtOnSaveGroup(id, index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });

        $("#txtName").val("");
        $("#GroupId").val("");
    };

    // 修改网址分类名称
    obj.evtOnEditUrlGroup = function (id, name) {
        layer.open({
            type: 1,
            title: "编辑网址分类",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnSaveGroup(id, index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        $("#GroupId").val(id);
        $("#txtName").val(name);
    };

    //保存网址分类名称
    obj.evtOnSaveGroup = function (id, index) {
        if(!$("#popupAddOrEdit").autoVerifyForm())return;
        var name = $("#txtName").val();
        //if (!$("#popupAddOrEdit").cmValidate()) {
        //    return;
        //}

        //if (name.trim().length > 45) {
        //    $html.warning("网址名称超过最大长度！");
        //    return;
        //}

        setTimeout(function () {
            var oData = {};
            oData["Id"] = $.trim(id);
            oData["Name"] = $.trim(name);

            $util.ajaxPost(saveUrlGroupUrl, JSON.stringify(oData), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        layer.close(index);
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning('操作失败！');
                });
        }, 200);
        $("#GroupId").val("");
    };

    // 新增网址分类 取消
    obj.evtOnCancelGroup = function () {
        layer.close(layerIndex);
    };

    // 删除网址分类数据
    obj.evtOnDelUrlGroup = function (id) {
        dspConfirm = $html.confirm('确定删除该数据吗？', function () {
                $util.ajaxPost(getDelGroupUrl, JSON.stringify({urlgpId: id}), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(res.message);
                    }
                }, function () {
                    $html.warning('删除失败！');
                });
            },
            function () {
                layer.close(dspConfirm);
            });
    };

    // 删除网址单条数据
    obj.evtOnDelUrl = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                $util.ajaxPost(getDelUrl, JSON.stringify({Id: id, GpId: groupid}), function (res) {
                        if (res.state) {
                            $html.success(res.message);
                            urlListTable.ajax.reload();
                            dataTable.ajax.reload();
                        } else {
                            $html.warning(res.message);
                        }
                    },
                    function () {
                        $html.warning('删除失败！');
                    });
            },
            function () {
                layer.close(dspConfirm);
            });
    };

    // 网址 取消
    obj.evtOnCancelUrl = function () {
        layer.close(layerIndexTwo);
    };

    // 刷新
    obj.evtOnRefresh = function () {
        $("#txtGroupName").val("");
        $("#txtUrlName").val("");
        $("#txtUrl").val("");
        dataTable.ajax.url(getUrlGroupUrl);
        dataTable.ajax.reload();
    };

    obj.evtOnAddUrl = function () {
        $("#txtAddUrl").val("");
        $("#txtAddName").val("");

        layer.open({
            type: 1,
            title: "新增Url",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEditUrl'),
            yes: function (index, layero) {
                obj.evtOnSaveUrl(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    obj.evtOnSaveUrl = function (index) {
        if(!$("#popupAddOrEditUrl").autoVerifyForm())return;
        var id = $("#btnAddUrl").attr("data-id");
        if (id <= 0) {
            $html.warning("请先导入网址文件，再使用新增网址功能！");
            return;
        }

        var url = $("#txtAddUrl").val();
        var name = $("#txtAddName").val();

        //if (!$("#popupAddOrEditUrl").cmValidate()) {
        //    return;
        //}
        //ToDo  这里需要修改,如何一次添加两个验证在data-autoVerify中？
        if (/[\u4E00-\u9FA5]/i.test(url)) {
            $html.warning("网址禁止输入中文内容！");
            return;
        }

        setTimeout(function () {
            var oData = {};
            oData["id"] = $.trim(id);
            oData["url"] = $.trim(url);
            oData["name"] = $.trim(name);

            $util.ajaxPost(saveUrl, JSON.stringify(oData), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        //layer.close(layerIndexThree);
                        layer.close(index);
                        urlListTable.ajax.reload();
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

    obj.evtOnCancelAddUrl = function () {
        layer.close(layerIndexThree);
    };

    return obj;
}();

function onLoadBody() {
    urlgroup.initData();
    urlgroup.initEvent();
}
