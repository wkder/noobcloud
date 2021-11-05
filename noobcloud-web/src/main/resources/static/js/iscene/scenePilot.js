/**
 * Created by xuan on 2017/2/8.
 */
var scenePilot = function () {
    var dataTable,
        dspConfirm = 0, // 删除提示框
        layerIndexTwo = 0,
        getScenePilotListUrl = "getScenePilotList.view",
        saveUrl = "addOrEditScenePilot.view",
        getDeleteScenePilotUrl = "deleteScenePilot.view",
        getUrlGroup = "getUrlGroup.view",
        getLocationGroup = "getLocationGroup.view",
        getSceneUrl = "getSceneUrl.view", // 获取场景url
        getAdditionListUrl = "getAdditionalList.view",
        obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    // 绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnRefresh").click(obj.evtOnRefresh);
        $("#btnAdd").click(obj.evtOnAddorEdit);
        $("#additionTr").click(obj.evtOnShowAddition)       // 选择附加条件
        $(".operation>div>span").click(obj.evtOnAddAdditionForOperation);
    }

    // 绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getScenePilotListUrl + "?type=2&name=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 60, className: "dataTableFirstColumns"},
                {data: "name", title: "名称", width: 100},
                {
                    data: "imgUrl", title: "触发形态", width: 120,
                    render: function (data, type, row) {
                        var imgUrl = unescape(row.imgUrl);
                        if (imgUrl.indexOf(',') != -1) {   // 多图模式
                            var url = imgUrl.split(',')[0];
                            return "<img src=\"" + url + "\" class=\"nStyle\"/>";
                        } else {
                            return "<img src=\"" + imgUrl + "\" class=\"nStyle\"/>";
                        }
                    }
                },
                {
                    data: "pilotType", title: "导航形式", width: 120,
                    render: function (data, type, row) {
                        if (data == "2") {
                            return "场景导航";
                        } else {
                            return "全页面导航";
                        }
                    }
                },
                {
                    data: "onLineTm", title: "触发时段", width: 100,
                    render: function (data, type, row) {
                        return row.onLineTm + "-" + row.offLineTm;
                    }
                },
                {data: "urlGroupNames", title: "网址分类", width: 200},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        row.imgUrl = encodeURI(row.imgUrl);
                        var regex = new RegExp("\"", "g");
                        return "<a class=\"btn btn-info btn-edit\" title='编辑' onclick='scenePilot.evtOnAddorEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class=\"fa fa-pencil-square-o\"></i></a><a class='btn btn-danger btn-delete' title='删除' onclick=\"scenePilot.evtOnDelete(" + row.id + ")\"><i class=\"fa fa-trash-o\"></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }
    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getScenePilotListUrl + "?type=2&name=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

    // 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getScenePilotListUrl + "?type=2");
        dataTable.ajax.reload();
    }

    // 编辑、新增用户
    obj.evtOnAddorEdit = function (o) {
        var urlGroupIds = "";
        var urlGroupNames = "";
        var locationGroupIds = "";
        var locationGroupNames = "";
        var title = typeof o === "string" ? "修改场景任务" : "新增场景任务";
        var id = 0;
        if (typeof o === "string") { // 修改
            var mod = JSON.parse(o);
            mod.imgUrl = decodeURI(mod.imgUrl);
            urlGroupIds = mod.urlGroupIds;
            urlGroupNames = mod.urlGroupNames;
            locationGroupIds = mod.locationGroupIds;
            locationGroupNames = mod.locationGroupNames;
            id = mod.id;
            $("#id").val(id);
            $("#taskName").val(mod.name);
            $("#chooseSceneImg").attr("src", unescape(mod.imgUrl).split(',')[0]);
            $("#chooseSceneImg").attr("data", mod.sceneIds);
            $("#intervarTime").val(mod.intervarTime);
            $("#onLineTm").val(mod.onLineTm);
            $("#offLineTm").val(mod.offLineTm);
            $("#selBlockMode").val(mod.blockMode);
            //$("#dialogPrimary #pilotUrl").val(mod.pilotUrl);
            $("#addition").attr("data-rules", mod.extStopCond).val(getExtStopCondDescString(mod.extStopCond));

        } else {
            $("#id").val(id);
            $("#taskName").val("");
            $("#chooseSceneImg").attr("src", "images/navdefault.png");
            $("#chooseSceneImg").attr("data", 0);
            $("#intervarTime").val("");
            $("#onLineTm").val("00:00");
            $("#offLineTm").val("23:59");
            $("#selBlockMode").val(0);
            $("#addition").attr("data-rules", "").val("");
            //$("#dialogPrimary #pilotUrl").val("");
        }
        obj.urlGroupInit(urlGroupIds, urlGroupNames);  // 网址分类
        obj.locationGroupInit(locationGroupIds, locationGroupNames); // 地理位置
        layer.open({
            type: 1,
            title: title,
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '660px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#cmTableContent'),
            yes: function (index, layero) {
                obj.evtOnSave(index, id);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });

    }

    // 删除用户
    obj.evtOnDelete = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(getDeleteScenePilotUrl, JSON.stringify({id: id}), function (data) {
                        if (data.state) {
                            $html.success(data.message);
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

    // 保存用户
    obj.evtOnSave = function (index, id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        // 网址分类
        var urlGroupIds = "";
        var urlGroupEle = $("#urlGroupsDiv :checkbox");
        for (var i = 0; i < urlGroupEle.length; i++) {
            if (urlGroupEle[i].checked) {
                urlGroupIds += $(urlGroupEle[i]).val() + ",";
            }
        }
        if (urlGroupIds === "") {
            $html.warning("请选择网址分类！");
            return;
        }
        // 地理位置
        var locationGroupIds = "";
        var locationGroupEle = $("#locationGroupsDiv :checkbox");
        for (var i = 0; i < locationGroupEle.length; i++) {
            if (locationGroupEle[i].checked) {
                locationGroupIds += $(locationGroupEle[i]).val() + ",";
            }
        }
        // 限制条件
        var extStopCond = $("#addition").attr("data-rules");
        if (!isVerifiedExp(extStopCond)) {
            $html.warning("限制条件格式错误！");
            return;
        }
        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }

        if ($("#chooseSceneImg").attr("data") == "0") {
            $html.warning("请选择触发形态！");
            return;
        }
        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["name"] = $("#taskName").val();
            oData["onLineTm"] = $("#onLineTm").val();
            oData["offLineTm"] = $("#offLineTm").val();
            oData["intervarTime"] = $("#intervarTime").val();
            oData["blockMode"] = $("#selBlockMode").val();
            oData["sceneIds"] = $("#chooseSceneImg").attr("data");
            oData["urlGroupIds"] = urlGroupIds.substr(0, urlGroupIds.length - 1);
            oData["locationGroupIds"] = locationGroupIds.substr(0, locationGroupIds.length - 1);
            oData["pilotType"] = 2; //1是全页面导航.2是场景导航
            oData["pilotUrl"] = "";
            oData["extStopCond"] = $.trim(extStopCond);

            $util.ajaxPost(saveUrl, JSON.stringify(oData), function (data) {
                    if (data.state) {
                        $html.success(data.message);
                        dataTable.ajax.reload();
                        layer.close(index);
                        obj.resetBox();
                    } else {
                        $html.warning(data.message);
                    }
                },
                function () {
                    $html.warning("操作失败！");
                });
        }, 200);
    }

    // 绑定网址
    obj.urlGroupInit = function (ids, names) {
        var htmlUrlGroup = $("#urlGroupsDiv");
        if ($.trim(htmlUrlGroup.html())) {
            htmlUrlGroup.html("");
        }
        $util.ajaxPost(getUrlGroup, {}, function (data) {
                var checkboxs = "";
                for (var i = 0; i < data.length; i++) {
                    var name = data[i].name;
                    checkboxs += '<div class="col-md-4"><input style="float: left;" type="checkbox" value="' + data[i].id + '" data-name=' + data[i].name + ' /><div style="border-radius:4px;float: left;">' + name + '</div></div>';
                }
                htmlUrlGroup.html(checkboxs)
                obj.setUrlGroupId(ids, names);
            },
            function () {
                $html.warning("操作失败！");
            });
    }
    // 编辑任务 设置 网址分类 勾选框
    obj.setUrlGroupId = function (ids, names) {
        if (ids) {
            var idArr = ids.split(','); //id集合
            var urlGroupEle = $("#urlGroupsDiv :checkbox");
            for (var i = 0; i < idArr.length; i++) {
                if (idArr[i] == "") continue;
                for (var j = 0; j < urlGroupEle.length; j++) {
                    if ($(urlGroupEle[j]).val() == idArr[i]) {
                        urlGroupEle[j].checked = true;
                        break;
                    }
                }
            }
        }
    }
    // 绑定地理位置
    obj.locationGroupInit = function (ids, names) {
        var htmlUrlGroup = $("#locationGroupsDiv");
        if ($.trim(htmlUrlGroup.html())) {
            htmlUrlGroup.html("");
        }
        $util.ajaxPost(getLocationGroup, {}, function (data) {
                var checkboxs = "";
                for (var i = 0; i < data.length; i++) {
                    var name = data[i].name;
                    checkboxs += '<div class="col-md-4"><input style="float: left;" type="checkbox" value="' + data[i].id + '" data-name=' + data[i].name + ' /><div style="border-radius:4px;float: left;">' + name + '</div></div>';
                }
                htmlUrlGroup.html(checkboxs)
                obj.setLocationGroupId(ids, names);
            },
            function () {
                $html.warning("操作失败！");
            });
    }
    // 编辑任务 设置 地理位置 勾选框
    obj.setLocationGroupId = function (ids, names) {
        if (ids) {
            var idArr = ids.split(','); //id集合
            var locationGroupEle = $("#locationGroupsDiv :checkbox");
            for (var i = 0; i < idArr.length; i++) {
                if (idArr[i] == "") continue;
                for (var j = 0; j < locationGroupEle.length; j++) {
                    if ($(locationGroupEle[j]).val() == idArr[i]) {
                        locationGroupEle[j].checked = true;
                        break;
                    }
                }
            }
        }
    }
    // 选择触发形态
    obj.evtOnChooseScene = function (name, url, id) {
        url = unescape(url);
        if (url.indexOf(',') != -1) {
            var imultUrl = url.split(',')[0];
            $("#chooseSceneImg").attr("src", imultUrl);
        } else {
            $("#chooseSceneImg").attr("src", url);
        }
        $("#chooseSceneImg").attr("data", id);
        layer.close(layerIndexTwo);
    }
    // 重置内容
    obj.resetBox = function () {
        $("#txtName").val("");
        $("#txtJs").val("");
    }
    // 触发形态数据加载
    obj.evtOnSceneInit = function () {
        var sceneHtml = $("#selectNavigation");
        if ($.trim(sceneHtml.html())) {
            layerIndexTwo = $plugin.iModal({
                title: '选择背景图片',
                content: $("#selectNavigation"),
                area: ['1100px', "660px"]
            }, null, null, function () {
                $(".layui-layer-btn0").css("cssText", "display:none !important");
            }, function () {
                scenemanage.evtOnChooseImgCancel()
            });
            return;
        }

        $util.ajaxPost(getSceneUrl, {}, function (data) {
            if (data) {
                var obj = data;
                for (var item in obj) {
                    if (obj.hasOwnProperty(item)) {
                        var imgSrc = unescape(obj[item].imgUrl);
                        if (imgSrc.indexOf(',') != -1 && obj[item].picTitle.indexOf(',') != -1) {   //多图模式
                            var imgUrl = imgSrc.split(',');
                            var imgUrlBall = imgUrl[0];
                            var imgUrlStrip = imgUrl[1];

                            var imgTitle = obj[item].picTitle.split(',');
                            var imgTitleBall = imgTitle[0];
                            var imgTitleStrip = imgTitle[1];

                            var client = obj[item].client;
                            if (client.length > 9) {
                                client = client.substring(0, 9);
                            }
                            sceneHtml.prepend("<div class='col-md-3 imgmain'><figure class='imghvr-slide-up'><img src='" + imgUrlBall + "'/><figcaption><div class='imgname'>" + client + "</div><div class='imgbtndiv'><button class='btn btn-info btn-sm imgbtn'  onclick='scenePilot.evtOnChooseScene(\"" + obj[item].picTitle + "\",\"" + escape(imgSrc) + "\",\"" + obj[item].id + "\")'>选择</button></div></figcaption></figure></div>");
                        } else {
                            var client = obj[item].client;
                            if (client.length > 9) {
                                client = client.substring(0, 9);
                            }
                            sceneHtml.prepend("<div class='col-md-3 imgmain'><figure class='imghvr-slide-up'><img src='" + imgSrc + "' /><figcaption><div class='imgname'>" + client + "</div><div class='imgbtndiv'><button class='btn btn-info btn-sm imgbtn'  onclick='scenePilot.evtOnChooseScene(\"" + obj[item].picTitle + "\",\"" + escape(imgSrc) + "\",\"" + obj[item].id + "\")'>选择</button></div></figcaption></figure></div>");
                        }
                    }
                }
                layerIndexTwo = $plugin.iModal({
                    title: '选择背景图片',
                    content: $("#selectNavigation"),
                    area: ['1100px', "660px"]
                }, null, null, function () {
                    $(".layui-layer-btn0").css("cssText", "display:none !important");
                }, function () {
                    scenemanage.evtOnChooseImgCancel()
                });
            }
        }, function () {
        });
    }

    // 图片选择 取消按钮
    obj.evtOnChooseImgCancel = function () {
        layer.close(layerIndexTwo);
    }

    obj.evtOnShowAddition = function () {
        layer.open({
            type: 1,
            title: "限制条件",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '660px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddition'),
            yes: function (index, layero) {
                obj.evtOnAddlAddition(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        var parent = $("#popupAddition").parent();
        parent.height(parent.height() - 10);

        $('#tagEditer').tagEditor('destroy');
        $('#tagEditer').tagEditor('removeTag');

        $('#tagEditer').tagEditor({
            initialTags: [],
            clickDelete: true,
            onChange: obj.tag_classes,
            placeholder: '选择操作项或手动添加，右键可删除'
        });
        var rule = $("#addition").attr("data-rules");
        if (rule && rule.length > 0 && $("ul.tag-editor>li>div.tag-editor-tag").text() == "") {
            $('#tagEditer').tagEditor('addTag', '' + rule + '');
        }

        $util.ajaxPost(getAdditionListUrl, {start: 0, length: 9999},
            function (res) {
                $("#rules").empty();

                if (!res || res.length <= 0) return;

                for (var i in res) {
                    var divMain = $("<div id='rulesData" + res[i].id + "' class='col-md-12 rules'></div>");
                    var divText = $("<div class='col-md-3'><sapn class='rulesword' data-name='" + res[i].name + "' data-desc='" + res[i].description + "'>" + res[i].name + ":" + res[i].description + "</sapn></div>");
                    var divSelect = $("<div class='col-md-3'> <select class='form-control'><option value='1'>&gt;</option><option value='2'>&lt;</option><option value='3'>&gt;=</option><option value='4'>&lt;=</option><option value='5'>==</option></select></div>");
                    var divInput = $("<div class='col-md-4'><input class='form-control' type='number' /></div>");
                    var divAdd = $("<div class='col-md-2' onclick='scenePilot.evtOnAddAddition(" + res[i].id + ")'><i class='fa fa-plus fa-2x'></i></div>");

                    divMain.append([divText, divSelect, divInput, divAdd]);
                    $("#rules").append(divMain);
                }
            },
            function () {
            });
    }

    // 新增规则
    obj.evtOnAddAddition = function (id) {
        if (id <= 0) return;

        var name = $('#rulesData' + id + ' .rulesword').attr("data-name");
        var desc = $('#rulesData' + id + ' .rulesword').attr("data-desc");
        var operatorText = $('#rulesData' + id + ' select').find("option:selected").text();
        var inputValue = $('#rulesData' + id + ' input').val();
        if (inputValue == "" || inputValue == null || inputValue == undefined) {
            $html.warning('规则内容不能为空！');
            return;
        }

        $('#tagEditer').tagEditor('addTag', '' + name + operatorText + inputValue + '');
    }

    // 新增规则 运算符
    obj.evtOnAddAdditionForOperation = function () {
        var li = $("ul.tag-editor>li>div.tag-editor-tag");
        if (li.length <= 0 && ($(this).text() == "&&" || $(this).text() == "||")) {
            $html.warning("请先选择或输入规则！");
            return;
        }

        $('#tagEditer').tagEditor('addTag', '' + $(this).text() + '');
    }

    // tagEditer 内容改变事件
    obj.tag_classes = function (field, editor, tags) {
        $('li', editor).each(function () {
            var li = $(this);
            var text = li.find('.tag-editor-tag').text();
            if (text == '且' || text == '或') li.addClass('green-tag');
            else if (text == '(' || text == ')') li.addClass('red-tag')
            else li.removeClass('red-tag green-tag');
        });
    }

    obj.evtOnAddlAddition = function (index) {
        var flag = true;
        var rules = "";
        var ele = $("ul.tag-editor>li>div");

        for (var i = 0; i < ele.length; i++) {
            if (ele.hasClass("active")) {
                flag = false;
                break;
            } else if ($(ele[i]).hasClass("tag-editor-tag")) {
                rules += $(ele[i]).attr("data-rules");
            }
        }

        if (!flag) {
            $html.warning("规则有误，请检查！");
            return;
        }

        if (!isVerifiedExp(rules)) {
            $html.warning("规则有误，请检查！");
            return;
        }

        var val = "";
        var divEle = $("ul.tag-editor>li>div.tag-editor-tag");
        var divEleLength = divEle.length;
        for (var i = 0; i < divEleLength; i++) {
            if ($(divEle[i]).text().trim() != "") {
                val += $(divEle[i]).text().trim() + " ";
            }
        }

        if (val.length > 255) {
            $html.warning("当前规则长度:" + val.length + ",长度不能大于255，请检查！");
            return;
        }

        $("#addition").val(val).attr("data-rules", rules);

        layer.close(index);
    }

    obj.resetRules = function () {
        $("ul.tag-editor").remove();
        $("#tagEditer").val("");
    }

    // 说明弹窗
    obj.evtOnHelp = function () {
        layer.open({
            type: 1,
            title: "说明",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '660px'],
            offset: '60px',
            shift: 6,
            btn: ['取消'],
            content: $('#popupHelp'),
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    return obj;
}()


function onLoadBody() {
    scenePilot.initData();
    scenePilot.initEvent();
}