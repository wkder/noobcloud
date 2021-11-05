/**
 * Created by xuan on 2016/12/22.
 */
var scenemanage = function () {
    var dataTable,
        layerIndex = 0, layerIndexTwo = 0, dspConfirm = 0, multi = 0,
        getSceneListUrl = "getSceneList.view",
        getPictureUrl = "getPictureUrl.view",
        saveSceneUrl = "addOrEditScene.view",
        getSceneContent = "getSceneContent.view",
        deleteSceneUrl = "deleteScene.view",
        getTemplatesUrl = "getTempleType.view",
        obj = {};
    var isChooseImg = false;
    obj.initData = function () {
        obj.dataTableInit();
    }

    // 绑定事件
    obj.initEvent = function () {
        $("#btnAdd").click(obj.evtOnShowScene);                 //新增场景
        $("#btnQuery").click(obj.evtOnQuery);                   //查询
        $("#btnRefresh").click(obj.evtOnRefresh);               //刷新
        $("#editbkImg").click(obj.evtOnEditbkImg);              //选择背景图片
        //$("#btnSave").click(obj.evtOnSaveScene);              //新增、编辑场景 保存按钮事件
        //$("#btnCancel").click(obj.evtOnSceneCancel);          //新增、编辑场景 取消按钮事件
        $("#selTemplates").change(obj.evtOnTempSelectChange);   //模型下拉列表改变事件
    }
    // 绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getSceneListUrl + "?client=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 60, className: "dataTableFirstColumns"},
                {data: "client", title: "场景名称", width: 150},
                {
                    data: "imgUrl", title: "图片", width: 150,
                    render: function (data, type, row) {
                        var imgUrl = row.imgUrl;
                        if (imgUrl.indexOf(',') != -1) {   //多图模式
                            var url = imgUrl.split(',')[0];
                            return "<img src=\"" + url + "\" class=\"nStyle\"/>";
                        } else {
                            return "<img src=\"" + imgUrl + "\" class=\"nStyle\"/>";
                        }
                    }
                },
                {data: "typeName", title: "模型", width: 100, className: "centerColumns"},
                {data: "taskId", title: "任务ID", width: 100, className: "centerColumns"},
                {
                    data: "multiPicture", title: "多图模式", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.multiPicture == "1") { //多图
                            return "<i class='fa fa-check fa-2x' style='color: limegreen;'></i>";
                        } else {
                            return "<i class='fa fa-times fa-2x' style='color: #F13E38;'></i>";
                        }
                    }
                },
                {
                    title: "操作", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick=\"scenemanage.evtOnEditScene('" + row.id + "')\"><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"scenemanage.evtOnDelScene(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 弹窗表格初始化
    obj.cmTableInit = function () {
        $("#popupAddOrEdit").cmTable({
            columns: [
                {
                    id: "client", desc: "场景名称",
                    validate: {expression: "NotNull"},
                    alert: {className: "help-block alert alert-warning", text: "场景名称不能为空"}
                },
                {id: "selTemplates", type: "select", desc: "模型", client: false, url: getTemplatesUrl},
                {
                    id: "bkUrl", desc: "背景图片链接",
                    validate: {expression: "NotNull"}
                },
                {
                    id: "showTrackUrl", desc: "展示监控地址",
                    validate: {expression: "NotNull"}
                },
                {
                    id: "clickTrackUrl", desc: "点击监控地址",
                    validate: {expression: "NotNull"}
                },
                {
                    id: "editbkImg", type: "button", desc: "选择背景图片",
                    alert: {className: "help-block alert alert-info", text: "多图模型选择图片时：第一张图片为：球的图片 第二张图片为：条的图片"}
                },
                {id: "pvwImg", type: "image", desc: "预览", appendDom: '<img id="pvwImgSecond" />'}
            ]
        });
    }

    // 场景名称查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getSceneListUrl + "?client=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

    // 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getSceneListUrl);
        dataTable.ajax.reload();
    }

    // 新增、编辑 场景
    obj.evtOnShowScene = function (sceneid) {
        var title = "新增";
        $util.ajaxPost(getTemplatesUrl, {},
            function (data) {
                if (data.state) {
                    $("#selTemplates").html(data.message);
                }
            }, function () {
            });
        if (sceneid && typeof (sceneid) == "number") {  //编辑
            title = "编辑";
            $('#btnSave').attr("data-id", sceneid);
            isChooseImg = true;
        } else {    //新增
            sceneid = 0;
            isChooseImg = false;
            $('#btnSave').attr("data-id", 0);
            obj.reset();
        }

        layer.open({
            type: 1,
            title: title + '导航形态',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '660px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index, layero) {
                obj.evtOnSaveScene(index, sceneid);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    // 图片编辑
    obj.evtOnEditbkImg = function () {
        // 根据选择的模型 加载对应的图片
        var tempid = $("#selTemplates").val();

        $util.ajaxPost(getPictureUrl, JSON.stringify({templeId: tempid}), function (data) {
                var html = "";
                for (var item in data.data) {
                    if (data.data.hasOwnProperty(item)) {
                        var name = data.data[item].title;
                        if (name.length >= 12) {
                            name = name.substr(0, 12);
                        }
                        html += "<div id='" + data.data[item].title + "' class='col-md-3'><figure class='imghvr-slide-up'><img src='" + data.data[item].pictureByte + "' data-url='" + data.data[item].url + "' /><figcaption><div class='imgname'>" + name + "</div><div class='imgbtndiv'><button class='btn btn-info btn-sm imgbtn'>选择</button></div></figcaption></figure></div>";
                    }
                }
                $("#editbk").html(html);

                var temp = $("#selTemplates").find("option:selected").text();
                if ($("#bkUrl").val().length === 0 && temp != "新版流量球") {
                    $html.warning("请先填写背景图片URL！");
                    return;
                }

                layerIndexTwo = $plugin.iModal({
                    title: '选择背景图片',
                    content: $("#editbk"),
                    area: ['1100px', "660px"]
                }, null, null, function () {
                    $(".layui-layer-btn0").css("cssText", "display:none !important");
                }, function () {
                    scenemanage.evtOnChooseImgCancel()
                });

                multi = 0;
                $("#hideImgUrl").val("");
                $("#hideImgTitle").val("");
                $("#pvwImg").css({
                    "border": "none",
                    "height": "1px"
                }).attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==");
                $("#pvwImgSecond").css({
                    "border": "none",
                    "height": "1px"
                }).attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==");


                $('#editbk').removeClass('hidden');
                $("#editbk .imgbtn").click(obj.evtOnImgSelect);
            },
            function () {
                $html.warning("获取图片失败！");
            });
    }

    // 图片选择
    obj.evtOnImgSelect = function (e) {
        isChooseImg = true;
        var img = $(this).parent().parent().parent().children().get(0);
        $(img).css("border", "8px solid #08A1EF");
        $(img).siblings().css("border", "1px solid #ccc");
        var src;
        var id;
        var parentDiv;
        var imgTitle;
        if ($("#selTemplates").find("option:selected").attr("data-Multi") == "1") {   //可以选多张图片
            multi++;
            if (multi > 2) {
                $html.warning("最多选择两张图片！");
                return;
            }
            parentDiv = $(this).parent().parent().parent().parent();
            id = $(parentDiv).parent().attr("id");
            src = $(img).attr("data-url");
            // src = src;

            if ($("#hideImgUrl").val().length <= 0) {
                $("#hideImgUrl").val(src + ",");
            } else {
                $("#hideImgUrl").val($("#hideImgUrl").val() + src);
            }
            imgTitle = $(this).parent().siblings().text();
            if ($("#hideImgTitle").val().length <= 0) {
                $("#hideImgTitle").val(imgTitle + ",");
            } else {
                $("#hideImgTitle").val($("#hideImgTitle").val() + imgTitle);
            }

            if (multi == 2) {
                var srcTwo = $("#hideImgUrl").val();
                var srcTwoArr = srcTwo.split(',');
                $("#pvwImg").css({
                    "border": "1px solid #ccc",
                    "border-radius": "5px",
                    "height": "50px"
                }).attr("src", srcTwoArr[0]);
                $("#pvwImgSecond").css({
                    "border": "1px solid #ccc",
                    "border-radius": "5px",
                    "height": "50px"
                }).attr("src", srcTwoArr[1]);
                layer.close(layerIndexTwo);
            }
        } else {
            parentDiv = $(this).parent().parent().parent().parent();
            id = $(parentDiv).parent().attr("id");
            src = $(img).attr("data-url");
            //src = root + "//" + src;
            $("#hideImgUrl").val(src);
            imgTitle = $(this).parent().siblings().text();
            $("#hideImgTitle").val(imgTitle);

            layer.close(layerIndexTwo);

            $("#pvwImg").css({"border": "1px solid #ccc", "border-radius": "5px", "height": "50px"}).attr("src", src);
        }
    }

    // 保存场景
    obj.evtOnSaveScene = function (index, id) {
        //var id = $("#btnSave").attr('data-id');
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var sceneName = $("#client").val();
        var templateid = $("#selTemplates option:selected").val();
        var bkUrl = $("#bkUrl").val();
        var showTrackUrl = $("#showTrackUrl").val();//展示监控链接
        var clickTrackUrl = $("#clickTrackUrl").val();//点击监控链接
        if (!$("#cmTableContent").cmValidate()) {
            return;
        }
        if (!isChooseImg) {  //是否选择过背景图片
            $html.warning("请选择背景图片！");
            return;
        }
        var imgUrl = $("#hideImgUrl").val();
        //修改成绝对地址
        var pathName = location.pathname.substring(0, location.pathname.substr(1).indexOf('/') + 1);
        var absoluteImageUrl = location.protocol + '//' + location.host + pathName + '/' + imgUrl;
        var imgTitle = $("#hideImgTitle").val();

        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["client"] = $.trim(sceneName);
            oData["backUrl"] = $.trim(bkUrl);
            oData["showTrackUrl"] = $.trim(showTrackUrl);
            oData["clickTrackUrl"] = $.trim(clickTrackUrl);
            oData["modelId"] = $.trim(templateid);
            oData["imgUrl"] = $.trim(absoluteImageUrl);
            oData["picTitle"] = $.trim(imgTitle);
            oData["multi"] = $.trim($("#selTemplates").find("option:selected").attr("data-Multi"));

            $util.ajaxPost(saveSceneUrl, JSON.stringify(oData), function (data) {
                if (data.state) {
                    $html.success(data.message);
                    layer.close(index);
                    dataTable.ajax.reload();
                    obj.reset();
                } else {
                    $html.warning(data.message);
                }
            }, function () {
                $html.warning("操作失败！");
            });
        }, 200);
    }

    // 重置表单内容
    obj.reset = function () {
        $("#client").val('');
        $("#selTemplates").val("1");
        $("#bkUrl").val('').css("backgroundColor", "white").removeAttr("disabled", "disabled");
        $("#showTrackUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
        $("#clickTrackUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
        $("#pvwImg").css({
            "border": "none",
            "height": "1px"
        }).attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==");
        $("#pvwImgSecond").css({
            "border": "none",
            "height": "1px"
        }).attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==");
    }

    // 场景编辑
    obj.evtOnEditScene = function (sceneId) {
        if (!sceneId || sceneId.length === 0) {
            $html.warning("编辑场景失败！");
            return;
        }

        $util.ajaxPost(getSceneContent, JSON.stringify({id: sceneId}), function (data) {
                if (data.total == 1) {
                    $("#client").val(data.data[0].client);
                    $("#selTemplates").val(data.data[0].modelId);
                    $("#selTemplates").attr("data-Multi", data.data[0].multiPicture);
                    var temp = $("#selTemplates").find("option:selected").text();
                    if (temp == "新版流量球") {
                        $("#bkUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
                    } else {
                        $("#bkUrl").val(data.data[0].backUrl);
                    }
                    if (temp.indexOf("监控") == -1) {
                        $("#showTrackUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
                        $("#clickTrackUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
                    } else {
                        $("#showTrackUrl").val(data.data[0].showTrackUrl);
                        $("#clickTrackUrl").val(data.data[0].clickTrackUrl);
                        $("#showTrackUrl").css("backgroundColor", "white").removeAttr("disabled", "disabled");
                        $("#clickTrackUrl").css("backgroundColor", "white").removeAttr("disabled", "disabled");
                    }
                    var img = data.data[0].imgUrl
                    if (data.data[0].multiPicture == "1") {//多图模式

                        var ImgArr = img.split(",");
                        $("#pvwImg").css({
                            "border": "1px solid #ccc",
                            "border-radius": "5px",
                            "height": "50px"
                        }).attr("src", ImgArr[0]);
                        $("#pvwImgSecond").css({
                            "border": "1px solid #ccc",
                            "border-radius": "5px",
                            "height": "50px"
                        }).attr("src", ImgArr[1]);

                    } else {
                        $("#pvwImg").css({
                            "border": "1px solid #ccc",
                            "border-radius": "5px",
                            "height": "50px"
                        }).attr("src", img);
                        $("#pvwImgSecond").css("");
                    }
                    $("#hideImgUrl").val(data.data[0].imgUrl);
                    $("#hideImgTitle").val(data.data[0].picTitle);

                    $('#btnSave').attr("data-id", data.data[0].id);
                    obj.evtOnShowScene(data.data[0].id);
                } else {
                    $html.warning(data.msg);
                }
            },
            function () {
                $html.warning("编辑场景失败！");
            });
    }

    // 场景 取消
    obj.evtOnSceneCancel = function () {
        obj.reset();
        layer.close(layerIndex);
    }

    // 图片选择 取消按钮
    obj.evtOnChooseImgCancel = function () {
        layer.close(layerIndexTwo);
    }

    // 场景删除
    obj.evtOnDelScene = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(deleteSceneUrl, JSON.stringify({id: id}), function (data) {
                        if (data.state) {
                            $html.success(data.message);
                            dataTable.ajax.url(getSceneListUrl + "?client=");
                            dataTable.ajax.reload();
                        } else {
                            $html.warning(data.message);
                        }
                    },
                    function () {
                        $html.warning("删除失败！");
                    });
            },
            function () {
                layer.close(dspConfirm);
            });
    }

    // 模型下拉列表切换内容
    obj.evtOnTempSelectChange = function () {
        var temp = $("#selTemplates").find("option:selected").text();
        //
        if (temp == "新版流量球") {
            $("#bkUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val("");
        } else {
            $("#bkUrl").css("backgroundColor", "white").removeAttr("disabled", "disabled");
        }
        if (temp.indexOf("监控") != -1) {
            $("#showTrackUrl").css("backgroundColor", "white").removeAttr("disabled", "disabled");
            $("#clickTrackUrl").css("backgroundColor", "white").removeAttr("disabled", "disabled");

        } else {
            $("#showTrackUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
            $("#clickTrackUrl").css("backgroundColor", "#eee").attr("disabled", "disabled").val('');
        }

        $("#hideImgUrl").val("");
        $("#hideImgTitle").val("");
        $("#pvwImg").css({
            "border": "none",
            "height": "1px"
        }).attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==");
        $("#pvwImgSecond").css({
            "border": "none",
            "height": "1px"
        }).attr("src", "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==");
        isChooseImg = false;
    }
    return obj;
}()

function onLoadBody() {
    scenemanage.initData();
    scenemanage.initEvent();
}

