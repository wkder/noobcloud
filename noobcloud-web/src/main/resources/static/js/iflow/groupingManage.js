/**
 * Created by Chris on 2017/11/3.
 */
var groupingManage = function () {
    var getGroupingManage = "queryUpgrade4GGroup.view";
    var obj = {}, dataObj = {};
    var dataTable;

    // 初始化事件
    obj.initEvent = function () {
        //查询事件
        $("#groupingManageQueryBtn").click(obj.evtOnRefresh);
        //新增事件
        $("#groupingManageAddPopUp").click(obj.evtOnAddOrEdit);
    };

    //初始化表格
    obj.dataTableInit = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getGroupingManage,
                type: "POST"
            },
            columns: [
                //{data: "groupId", title: "组ID", width: 400, className: "dataTableFirstColumns"},
                {data: "groupName", title: "组名称", width: 300, className: "dataTableFirstColumns"},
                {data: "areaName", title: "归属地市", width: 800, className: "centerColumns"},
                {data: "locationGroupName", title: "分组类型", width: 600, className: "centerColumns"},
                {data: "locationGroupNumber", title: "渠道数", width: 600, className: "centerColumns"},
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var jsonStr = JSON.stringify(row);
                        var editHtml = "<a title='编辑'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='groupingManage.evtOnAddOrEdit("+jsonStr+")' >编辑</a>";
                        var deleteHtml = "<a title='删除'  class='assignBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='groupingManage.groupingManageDel(\"" + row.groupId + "\")' >删除</a>";
                        return editHtml + deleteHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询事件
    obj.evtOnRefresh = function () {
        var data = "groupingManageGroupName=" + $("#groupingManageGroupName").val();
        dataTable.ajax.url(getGroupingManage + "?" + data);
        dataTable.ajax.reload();
    };

    // 分组管理新增或者修改弹窗
    obj.evtOnAddOrEdit = function (o) {
        dataObj = {};
        var $popUpTable = $(".popUpTable");
        $popUpTable.empty().append($(".groupingManageAddOrEditBtnPopUp").find(".groupingManageInfo").clone());
        var $queryBelongingArea = $popUpTable.find(".queryBelongingArea");
        // 查询分组归属地市
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $queryBelongingArea.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $queryBelongingArea.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $queryBelongingArea.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });

        var title = o.areaName == undefined ? "新增分组管理" : "修改分组管理";
        $plugin.iModal({
            title: title,
            content: $popUpTable,
            area: ['700px', '600px'],
            btn: ['保存', '取消']
        }, obj.evtOnSave);
        // 全选事件
        obj.eventOnChoiceAll();
        if (o.areaName != undefined) { //修改
            var x;
            // 赋值
            dataObj["groupId"] = o.groupId;
            $popUpTable.find(".queryGroupName").val(o.groupName);
            $popUpTable.find(".queryBelongingArea").val(o.areaCode);
            var locationTypes = o.locationTypeGroup.split(",");
            for(x in locationTypes){
                $popUpTable.find("input[value='"+locationTypes[x]+"']").prop("checked", true);
            }
        }

    };

    //保存事件
    obj.evtOnSave = function (index) {
        // 获取弹窗参数
        var popUpTable = $(".popUpTable").find(".groupingManageInfo"),
            groupName = popUpTable.find(".queryGroupName"),
            areaCode = popUpTable.find(".queryBelongingArea");
        // 获取所有选择的关联渠道
        var areaCodes = new Array();
        popUpTable.find('input[name="groupingManage"]:checked').each(function () {
            areaCodes.push($(this).val())
        });
        var areaCodeStr = areaCodes.join(",");
        // 组装数据
        if(utils.valid(groupName,utils.notEmpty, dataObj, "groupName"))
        {
            //dataObj["groupName"] = groupName.val();
            dataObj["areaCode"] = areaCode.val();
            if(areaCodeStr.length == 0){
                $html.warning("请选择关联渠道");
                return ;
            }
            dataObj["locationTypeGroup"] = areaCodeStr;
            // 数据组装完成
            if(dataObj["groupId"]){
                //更新
                globalRequest.iUpgrade4G.updateUpgrade4GGroup(true, dataObj, function (data) {
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("更新成功");
                    dataTable.ajax.reload();
                    layer.close(index);
                });
            }else{
                globalRequest.iUpgrade4G.createUpgrade4GGroup(true, dataObj, function (data) {
                    if (data.retValue != 0) {
                        $html.warning(data.desc);
                        return;
                    }
                    $html.success("创建成功");
                    dataTable.ajax.reload();
                    layer.close(index);
                });
            }
        }
    };

    // 关联渠道全选按钮
    obj.eventOnChoiceAll = function () {
        var popUpTable = $(".popUpTable").find(".groupingManageInfo"),
            choiceAll = popUpTable.find(".groupingManageTableAll");
        choiceAll.on('click', function () {
            var isChecked = $(this).is(":checked");
            popUpTable.find('input[name="groupingManage"]').each(function () {
                this.checked = isChecked;
            });
        });
    };

    //删除事件
    obj.groupingManageDel = function (groupId) {
        var groupingManageConfirm = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iUpgrade4G.deleteUpgrade4GGroup(true, {"groupId": groupId}, function (data) {
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("删除成功");
                dataTable.ajax.reload();
            });
        }, function () {
            layer.close(groupingManageConfirm);
        });
    };

    return obj;
}();

function onLoadBody() {
    groupingManage.dataTableInit();
    groupingManage.initEvent();
}