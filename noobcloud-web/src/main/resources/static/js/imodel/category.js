/**
 * Created by xuan on 2017/1/23.
 */
var category = function () {
    var dataTable,
        dspConfirm = 0, //删除提示框
        getUrl = "queryAllCategoriesByPage.view",
        saveUrl = "addOrEditCategory.view",
        getDeleteUrl = "deleteTestPhoneNumber.view",
        getSelectLevel = "getSelectLevel.view",
        getParentLevel = "getParentLevel.view",
        getParentLevel2 = "getParentLevel2.view",
        getIsUsed = "getIsUsed.view",
        getSubCategory = "querySubCategory.view",
        obj = {};
    var type = 0;//type=2表示标签分类
    var parentLevel = 0;//用来保存上一级层级
    var currentLevel=0;

    obj.initData = function (state) {
        type = state;
        obj.dataTableInit();
        obj.cmTableInit();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddorEdit);
        $("#btnBack").click(obj.evtOnBack);
    }

    //绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?type=" + type + "&pid=0&level="+currentLevel, type: "POST"},
            columns: [
                {data: "id", title: "分类ID", width: 60, client: false, className: "dataTableFirstColumns"},
                {data: "name", title: "栏目名称", width: 100},
                {
                    data: "level", title: "父级类别", className: "centerColumns", width: 120,
                    render: function (data, type, row) {
                        if (data == 0) {
                            return "第1级";
                        } else if (data == 1) {
                            return "第2级";
                        } else if (data == 2) {
                            return "第3级";
                        } else if (data == 3) {
                            return "第4级";
                        }else if (data == 4) {
                            return "第5级";
                        }else if (data == 5) {
                            return "第6级";
                        }else {
                            return "";
                        }
                    }
                },
                {data: "pIdName", title: "父级ID", className: "centerColumns", width: 120},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, t, row) {
                        //没有子类别，则隐藏查看子类别按钮
                        //$util.ajaxPost(getSubCategory, JSON.stringify({type:type,pid:row.id}), function (data) {
                        //       if(data==0){
                        //            $("a[name=btnSelectLevel]").hide();
                        //       }
                        //    },
                        //    function () {
                        //    });
                        var regex = new RegExp("\"", "g");
                        var value = "<a id='\"sp" + row.id + "\"' class='btn btn-info btn-edit' title='编辑' onclick='category.evtOnAddorEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class='fa fa-pencil-square-o'></i></a>";
                        if (row.level != "5") {
                            value += "<a name='btnSelectLevel' class='btn btn-warning btn-below' title='查看子类别' onclick='category.evtOnSelectLevel(\"" + row.id + "\",\"" + row.level + "\")'><i class=\"fa fa-chevron-down\"></i></a>";
                        }
                        return value
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getUrl + "?type=" + type + "&pid=0&name=" + encodeURIComponent($("#txtQuery").val())+"&level="+currentLevel);
        dataTable.ajax.reload();
    }

// 弹窗表格初始化
    obj.cmTableInit = function () {
        //$('#popupAddOrEdit').cmTable({
        //    columns: [
        //        {id: "selLevel", type: "select", desc: "栏目级别", client: false, url: n},
        //        {
        //            id: "selParent", type: "select", desc: "父级栏目", client: false, url: getParentLevel
        //        },
        //        {
        //            id: "txtName", desc: "栏目名称",
        //            validate: {expression: "NotNull"},
        //            alert: {className: "help-block alert alert-warning", text: "栏目名称不能为空"}
        //        },
        //        {
        //            id: "txtMarks", type: "textarea", desc: "备注",
        //            validate: {expression: "NotNull"}
        //        }
        //    ]
        //
        //});

        //$("#selLevel").change(function () {
        //    var level = $("#selLevel").val();
        //    $util.ajaxPost(getParentLevel2, JSON.stringify({level: level - 1, type: type}), function (data) {
        //            $("#selParent option").remove();
        //            $("#selParent").append(data.message);
        //        },
        //        function () {
        //        });
        //})
    }

// 编辑、新增分类
    obj.evtOnAddorEdit = function (o) {
        var title = "新增";
        var id = 0;
        if (o && typeof (o) == "string") {   //编辑
            o = JSON.parse(o);
            title = "编辑";
            id = o.id;
            $util.ajaxPost(getParentLevel2, JSON.stringify({level: o.level - 1, type: type}), function (data) {
                    $("#selParent option").remove();
                    $("#selParent").append(data.message);
                    $("#txtName").val(o.name);
                    $("#txtMarks").val(o.remarks);
                    $("#selLevel").val(o.level);
                    $("#selParent").val(o.pId);
                },
                function () {

                });
        } else {        //新增
            id = 0;
            $("#selLevel").val(-1);
            $("#selParent").val(-1);
            $("#txtName").val("");
            $("#txtMarks").val("");
            $("#selParent option").remove();
            $("#selParent").append("<option value='0'>请选择...</option>");
        }

        //打开编辑框
        layer.open({
            type: 1,
            title: title + '分类',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
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

        $("#selLevel").change(function () {
            var level = $("#selLevel").val();
            $util.ajaxPost(getParentLevel2, JSON.stringify({level: level - 1, type: type}), function (data) {
                    $("#selParent option").remove();
                    $("#selParent").append(data.message);
                },
                function () {
                });
        })
    }

    //查看子栏目
    obj.evtOnSelectLevel = function (id, level) {
        parentLevel = level;//保存当前展示层级的上一级
        currentLevel=parseInt(level)+1;
        dataTable.ajax.url(getUrl + "?type=" + type + "&pid=" + id);
        dataTable.ajax.reload();
    }

    //返回
    obj.evtOnBack = function () {
        dataTable.ajax.url(getUrl + "?type=" + type + "&level=" + parentLevel);
        dataTable.ajax.reload();
        //点击返回时,取得当前展示层级的上一级
        parentLevel = (parentLevel - 1);
        if (parentLevel <= 0) {
            parentLevel = 0;
        }
        currentLevel=(parentLevel==0?0:parentLevel+1);
    }

// 删除用户
    obj.evtOnDelete = function (id) {
        dspConfirm = $html.confirm('您确定删除该数据吗？', function () {
                if (id <= 0) {
                    $html.warning("删除失败！");
                    return;
                }
                $util.ajaxPost(getDeleteUrl, JSON.stringify({id: id}), function (data) {
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

    // 保存分类
    obj.evtOnSave = function (index, id) {
        if (!$("#cmTableContent").autoVerifyForm()) return;
        var selLevel = $("#selLevel").val();
        var selParent = $("#selParent").val();
        var name = $("#txtName").val();
        var remarks = $("#txtMarks").val();
        if (!$("#popupAddOrEdit").cmValidate()) {
            return;
        }

        if (selLevel == -1) {
            $html.warning("请选择栏目级别!");
            return;
        }
        if (selLevel > 0 && selParent == 0) {
            $html.warning("请选择父级栏目!");
            return;
        }
        setTimeout(function () {
            var oData = {};
            oData["id"] = id;
            oData["level"] = $.trim(selLevel); //
            oData["pId"] = $.trim(selParent);//
            var pIdName = (selParent == "0" ? "" : ($.trim($("#selParent").find("option:selected").text())));
            if (selLevel == "2") {
                pIdName = pIdName.split('--')[1];
            }
            oData["pIdName"] = pIdName;
            oData["name"] = $.trim(name);//
            oData["remarks"] = $.trim(remarks);
            oData["type"] = type;

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


// 重置内容
    obj.resetBox = function () {
        $("#txtPhone").val("");
        $("#txtUserName").val("");
    }

    return obj;

}()


function onLoadBody(state) {
    //state=3表示标签分类
    category.initData(state);
    category.initEvent();

}
