/**
 * Created by hale on 2017/2/22.
 */
var menuMgr = function () {
    var dataTable,
        getUrl = "queryMenusByPage.view",
        obj = {},
        parentLevel = 1,    // 保存上一级层级
        stackparentIdArray = [],    // 记录每次点击查看子栏目的parentId
        stacksubIdArray = [];    // 记录每次点击查看子栏目的subId

    obj.initData = function () {
        obj.dataTableInit();
    }

    // 绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddorEdit);
        $("#btnBack").click(obj.evtOnBack);
    }

    // 绑定列表
    obj.dataTableInit = function (id, id) {
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?title=" + $("#txtQuery").val() + "&parentId=0" + "&level=" + parentLevel,
                type: "POST"
            },
            columns: [
                {data: "id", title: "ID", client: false, visible: false},
                {data: "title", title: "栏目名称", width: 120, className: "dataTableFirstColumns"},
                {
                    data: "level", title: "栏目级别", width: 120,
                    render: function (data, t, row) {
                        switch (row.level) {
                            case 1:
                                return "第一级";
                            case 2:
                                return "第二级";
                            case 3:
                                return "第三级";
                            case 4:
                                return "第四级";
                            default :
                                return "";
                        }
                    }
                },
                {data: "parentId", title: "父级ID", width: 120},
                // {data: "sortNo", title: "排序", width: 40},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, t, row) {
                        var regex = new RegExp("\"", "g");
                        return "<a id='\"sp" + row.id + "\"' class='btn btn-info btn-edit' title='编辑' onclick='menuMgr.evtOnAddorEdit(\"" + JSON.stringify(row).replace(regex, "\\\"") + "\")'><i class='fa fa-pencil-square-o'></i></a>" +
                            "<a name='btnSelectLevel' class='btn btn-warning btn-below' title='查看子栏目' onclick='menuMgr.evtOnSelectLevel(\"" + row.parentId + "\",\"" + row.id + "\",\"" + row.level + "\")'><i class=\"fa fa-chevron-down\"></i></a>" +
                            "<a class='btn btn-danger btn-delete' title='删除' onclick=\"menuMgr.evtOnDelete(" + row.id + ")\"><i class='fa fa-trash-o'></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    obj.selectMenuInit = function () {
        globalRequest.iSystem.queryCurrentLevelMenu(false, {level: $("#divMenu [name='level']").val()}, function (data) {
            $("#divMenu [name='parentId']").empty();
            var html = "<option value='-1'>--请选择父级栏目--</option>";
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    html += "<option value='" + data[i].parentId + "' data-subId='" + data[i].id + "'>" + data[i].title + "</option>";
                }
            }
            $("#divMenu [name='parentId']").append(html);
        })
    }

    obj.selectLevelChange = function () {
        obj.selectMenuInit();
    }

    // 查询
    obj.evtOnQuery = function () {
        var currentId = stacksubIdArray[stacksubIdArray.length - 1] || "";
        dataTable.ajax.url(getUrl + "?title=" + encodeURIComponent($("#txtQuery").val()) + "&parentId=" + currentId + "&level=" + parentLevel);
        dataTable.ajax.reload();
    }

    // 查看子栏目
    obj.evtOnSelectLevel = function (parentId, subId, level) {
        $("#txtQuery").val("");
        parentLevel = parseInt(level) + 1;    // 保存当前展示层级的上一级
        stackparentIdArray.push(parentId);
        stacksubIdArray.push(subId);
        dataTable.ajax.url(getUrl + "?title=" + $("#txtQuery").val() + "&parentId=" + subId + "&level=" + parentLevel);
        dataTable.ajax.reload();
    }

    // 返回
    obj.evtOnBack = function () {
        $("#txtQuery").val("");
        parentLevel--;
        var currentId = stackparentIdArray[stackparentIdArray.length - 1];
        if (!currentId) {
            layer.msg("根级目录无法返回");
            return
        }
        stackparentIdArray.pop();
        stacksubIdArray.pop();
        dataTable.ajax.url(getUrl + "?title=" + $("#txtQuery").val() + "&parentId=" + currentId + "&level=" + parentLevel);
        dataTable.ajax.reload();
        if (parentLevel <= 0) {  // 点击返回时,取得当前展示层级的上一级
            parentLevel = 0;
        }
    }

    // 编辑、新增分类
    obj.evtOnAddorEdit = function (o) {
        $("#divMenu").autoEmptyForm(); // 清空表单内容
        obj.selectMenuInit();
        $("#divMenu [name='level']").unbind("change").change(obj.selectLevelChange);// 下拉列表 联动事件

        var title = typeof o === "string" ? "修改栏目管理" : "新增栏目管理";

        if (typeof o === "string") { //修改
            var model = JSON.parse(o);

            $("#divMenu").autoAssignmentForm(model);
            $("#divMenu [name='level']").val(model.level - 1);
            $("#divMenu [name='parentId']").val(model.id);

            obj.selectLevelChange();
            $("#divMenu [name='parentId']").find("[data-subId='" + model.parentId + "']").attr("selected", true);
        }

        // 打开编辑框
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
            content: $('#divMenu'),
            yes: function (index, layero) {
                obj.evtOnSave(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }

    // 保存栏目
    obj.evtOnSave = function (index) {
        if (!$("#divMenu").autoVerifyForm()) return;
        var oData = $("#divMenu").autoSpliceForm();
        oData["level"]++;
        oData["parentId"] = $("#divMenu [name='parentId']").find("option:selected").attr("data-subId");

        globalRequest.iSystem.addOrEditMenu(true, oData, function (data) {
            if (!data.state) {
                $html.warning(data.message);
                return;
            }
            $html.success(data.message);
            dataTable.ajax.reload();
            layer.close(index);
        });
    }

    // 删除栏目
    obj.evtOnDelete = function (id) {
        var confirm = $html.confirm('确定删除该数据吗？', function () {
            if (id <= 0) {
                $html.warning("删除失败！");
                return;
            }

            globalRequest.iSystem.deleteMenu(true, {id: id}, function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
            })
        }, function () {
            layer.close(confirm);
        });
    }

    return obj;
}()


function onLoadBody() {
    menuMgr.initData();
    menuMgr.initEvent();
}
