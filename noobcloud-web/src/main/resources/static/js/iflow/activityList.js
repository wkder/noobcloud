/**
 * Created by Chris on 2017/11/3.
 */
var activityList = function () {
    var getActivityList = "queryUpgrade4GActivity.view";
    var obj = {};
    var dataTable;

    // 初始化事件
    obj.initEvent = function () {
        // 初始化查询日期为当前月
        $('#dateTime').val(new Date().format('yyyy-MM'));
        //查询事件
        $("#activityListQueryBtn").click(obj.evtOnRefresh);
    };

    //初始化表格
    obj.dataTableInit = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getQueryUrl(),
                type: "POST"
            },
            columns: [
                {data: "createTime", title: "创建时间", width: 500, className: "dataTableFirstColumns"},
                {data: "areaName", title: "活动地市", width: 300, className: "centerColumns"},
                {data: "activityName", title: "活动名称", width: 500, className: "centerColumns"},
                {data: "appointUserName", title: "用户群名称", width: 600, className: "centerColumns"},
                {data: "startTime", title: "开始时间", width: 500, className: "centerColumns"},
                {data: "endTime", title: "结束时间", width: 500, className: "centerColumns"},
                {data: "marketContent", title: "营销用语", width: 800, className: "centerColumns"},
                {data: "businessName", title: "关联业务", width: 600, className: "centerColumns"},
                {data: "appointUserCount", title: "用户数", width: 400, className: "centerColumns"},
                {
                    title: "状态", width: 300, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "待上线";
                        } else if (row.status == 1) {
                            return "已上线";
                        } else if (row.status == 3) {
                            return "已下线";
                        } else  if(row.status == -1){
                            return "待同步";
                        }else {
                            return "未知状态";
                        }
                    }
                },
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var rowStr = JSON.stringify(row);
                        var loadHtml = "<a title='上线'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='activityList.evtOnLoad(" + rowStr + ")' >上线</a>";
                        var unloadHtml = "<a title='下线'  class='assignBtn btn btn-danger btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='activityList.evtOnUnload(\"" + row.id + "\")' >下线</a>";

                        if (row.status == 0 && row.appointUserId) {
                            return loadHtml;
                        } else if (row.status == 1) {
                            return unloadHtml;
                        } else return "";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询事件
    obj.evtOnRefresh = function () {
        //var data = "groupingManageGroupName=" + $("#activityListName").val()+"&dateTime="+$('#dateTime').val;
        //dataTable.ajax.url(getActivityList + "?" + data);
        dataTable.ajax.url(getQueryUrl());
        dataTable.ajax.reload();
    };

    // 获取查询条件
    var getQueryUrl = function () {
        var data = "groupingManageGroupName=" + $("#activityListName").val()+"&dateTime="+$('#dateTime').val();
        return getActivityList + "?" + data;
    };

    //上线事件
    obj.evtOnLoad = function (rowObj) {
        if(!rowObj.id){
            $html.warning("数据异常");
            return ;
        }
        var $popUpTable = $(".popUpTable");
        $popUpTable.empty().append($(".activityListPopUp").find(".activityListInfo").clone());
        // 查询关联业务
        var $relatingActivity = $popUpTable.find(".relatingActivity");
        globalRequest.iUpgrade4G.queryRelatedBusinessById(true, {"activityId":rowObj.id}, function (data) {
            $relatingActivity.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $relatingActivity.append("<option value='A' selected>B</option>".replace(/A/g, data[i].businessId).replace(/B/g, data[i].businessName));
                    } else {
                        $relatingActivity.append("<option value='A'>B</option>".replace(/A/g, data[i].businessId).replace(/B/g, data[i].businessName));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取关联业务失败", {icon: 6});
        });
        // 赋值
        $popUpTable.find(".activityId").html(rowObj.id);
        $popUpTable.find(".activityName").html(rowObj.activityName);
        $popUpTable.find(".activityProduct").html(rowObj.productName);

        $plugin.iModal({
            title: "活动上线",
            content: $popUpTable,
            area: ['700px', '600px'],
            btn: ['上线', '取消']
        }, function (index) {
            // 组装参数
            var dataObj = {};
            dataObj["activityId"] = rowObj.id;
            dataObj["businessId"] = $popUpTable.find(".relatingActivity").val();
            globalRequest.iUpgrade4G.implementUpgrade4GActivity(true, dataObj, function (data) {
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("上线成功");
                dataTable.ajax.reload();
                layer.close(index);
            }, function () {
                $html.warning("遇到异常，上线失败");
            });
        });
    };


    // 下线事件
    obj.evtOnUnload = function (id) {
        var evtOnUnloadConfirm = $html.confirm('确定下线吗？', function () {
            globalRequest.iUpgrade4G.offlineUpgrade4GActivity(true, {"activityId": id}, function (data) {
                if (data.retValue != 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("下线成功");
                dataTable.ajax.reload();
            }, function () {
                $html.warning("遇到异常，下线失败");
            });
        }, function () {
            layer.close(evtOnUnloadConfirm);
        });
    };

    return obj;
}();

function onLoadBody() {
    activityList.initEvent();
    activityList.dataTableInit();
}