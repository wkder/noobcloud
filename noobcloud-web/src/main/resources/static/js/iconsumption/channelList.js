/**
 * Created by chang on 2017/7/31.
 */
var channelList = new function () {
    var obj = {}
    var loginUser = {}
    var get_list_api = 'queryBusinessCodeByPage.view'
    obj.initPage = function () {
        obj.getLoginUser()
        obj.initDataTable()
        // 筛选团队列表
        $('#queryChannel').click(function () {
            obj.queryChannel()
        })
    }
    /**
     * 初始化表格
     */
    obj.initDataTable = function () {
        var channelName = $('#channelName').val()
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: get_list_api + "?name=" + channelName,
                type: "POST"
            },
            columns: [
                {data: "name", title: "渠道名称", className: "centerColumns", width: 140},
                {data: "code", title: "渠道编码", className: "centerColumns", width: 140},
                {data: "createtime", title: "更新时间", className: "centerColumns", width: 130}
            ]
        }
        dataTable = $plugin.iCompaignTable(option)
    }
    /**
     * 筛选渠道信息
     */
    obj.queryChannel = function () {
        var channelName = $('#channelName').val()
        dataTable.ajax.url(get_list_api + "?name=" + channelName);
        dataTable.ajax.reload();
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
function onLoadBody(status) {
    channelList.initPage()
}