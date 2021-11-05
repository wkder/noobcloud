/**
 * Created by chang on 2017/8/4.
 */
var parnterList = new function () {
    var obj = {}
    var loginUser = {}
    var get_list_api = 'queryDixiaoParnterStatistic.view'
    var activity = {}
    obj.initPage = function (model) {
        activity = model
        obj.initDataTable(model)
    }
    obj.initDataTable = function (model) {
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: get_list_api + "?taskid=" + parseInt(model.taskid),
                type: "POST"
            },
            paging: false,
            columns: [
                {data: "partnername", title: "团队", className: "centerColumns", width: 140},
                {data: "partnercode", title: "渠道编码", className: "centerColumns", width: 140},
                {data: "totalnum", title: "分配人数", className: "centerColumns", width: 130},
                {data: "updatetime", title: "推送时间", className: "centerColumns", width: 130},
                {data: "ranklist", title: "产品档位", className: "centerColumns", width: 130},
                {
                    width: 160, className: "centerColumns", title: "操作",
                    render: function (data, type, row) {
                        var $buttons = "";
                        var rowStr = JSON.stringify(row) + ''
                        var $queryBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='查看详情' onclick='parnterList.handleRnakByActivity(" + rowStr + ")'>查看详情</a>";
                        $buttons = $buttons + $queryBtnHtml
                        return $buttons
                    }
                }
            ]
        }
        dataTable = $plugin.iCompaignTable(option)
    }
    /**
     * 根据活动，前往该活动的档位分配页面
     * @param model
     */
    obj.handleRnakByActivity = function (model) {
        url = 'iconsumption/allotStall.requestHtml'
        activity.isfromparnter = 1
        activity.partnercode = model.partnercode
        $("#coreFrame").load(url + "?time" + new Date().getTime(), function (response, sts, xhr) {
            if (xhr.status == 200) {
                // 将活动对象传递到下一页
                onLoadBody(activity);
            } else if (xhr.status == 911) {
                var redirectUrl = xhr.getResponseHeader("redirectUrl");
                layer.alert('会话超时，请重新登录', function (index) {
                    window.location.href = redirectUrl;
                    layer.close(index);
                    return;
                });
            }
        });
    }
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    return obj
}
function onLoadBody(model) {
    parnterList.initPage(model)
}