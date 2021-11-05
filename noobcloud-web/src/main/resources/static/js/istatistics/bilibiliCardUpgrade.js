/**
 * Created by DELL on 2018/5/2.
 */

var bilibiliCardUpgrade = function () {
    var dataTable = {}, obj = {}, queryB2iSmartFromsDaily = "queryPushBtoiSenceDetailByB2i_Type.view", queryB2iSmartFromsMonthly = "queryPushBtoiScenceStaticMonthByB2i_Type.view",
        downLoadB2iSmartFromsUrl = "downloadB2iSmartCloudFormData.view",b2iType = 5;

    // 初始化查询条件
    obj.initQueryData = function () {
        var $citySelect = $(".queryCityArea");
        var $startTime = $("#startTime");
        var $endTime = $("#endTime");
        $startTime.val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));// 昨天
        $endTime.val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));// 昨天
        // 获取地市
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $citySelect.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $citySelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $citySelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    };

    // 获取查询数据
    obj.getQueryData = function (type) {
        var $citySelect = $(".queryCityArea").val(),
            $startTime = $("#startTime").val(),
            $endTime = $("#endTime").val(),
            param = "";
        if ($citySelect && $startTime && $endTime) {
            if(!obj.checkTimeSelect($startTime,$endTime))
            {
                $html.warning("开始时间不能大于结束时间");
                return "";
            }
            param = "citySelect=" + $citySelect;
            if (type == 1) {
                param += "&startTime=" + $startTime.replace(/-/g, "") + "&endTime=" + $endTime.replace(/-/g, "");
            }
            else if (type == 2) {
                param += "&startTime=" + $startTime.replace(/-/g, "").substring(0, 6) + "&endTime=" + $endTime.replace(/-/g, "").substring(0, 6);
            }
            param += "&b2iType=" + b2iType;
            return param;
        } else {
            layer.alert("参数异常", {icon: 6});
            return "";
        }
    };


    obj.checkTimeSelect = function($startTime,$endTime)
    {
        // 校验日期
        if ($startTime > $endTime) {
            return false;
        }
        return true;
    };


    // 初始化日报
    obj.dailyDataTableInit = function (type) {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: queryB2iSmartFromsDaily + "?" + obj.getQueryData(type),
                type: "POST"
            },
            columns: [
                {data: "user_id", width: 300, title: "用户编码", className: "dataTableFirstColumns"},
                {data: "phone", width: 800, title: "手机号", className: "centerColumns"},
                {data: "message_content", width: 600, title: "营销短信", className: "centerColumns",defaultContent:"-"},
                {data: "send_time", width: 600, title: "发送时间", className: "centerColumns"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 初始化月报
    obj.monthlyDataTableInit = function (type) {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: queryB2iSmartFromsMonthly + "?" + obj.getQueryData(type),
                type: "POST"
            },
            columns: [
                {
                    data: "timest",
                    width: 400,
                    title: "月份",
                    className: "dataTableFirstColumns",
                    render: function (data, type, row, meta) {
                        if (data) {
                            return data
                        }
                    }
                },
                {data: "city_name", width: 300, title: "地市", className: "centerColumns"},
                {data: "sale_name", width: 800, title: "活动名称", className: "centerColumns"},
                {data: "sale_boid_id", width: 600, title: "波次ID", className: "centerColumns"},
                {data: "aim_sub_id", width: 600, title: "客户群ID", className: "centerColumns"},
                {data: "aim_sub_name", width: 600, title: "精细化目标用户客户群", className: "centerColumns"},
                {data: "tariff_code", width: 600, title: "资费编码", className: "centerColumns"},
                {data: "send_num", width: 600, title: "发送量", className: "centerColumns"},
                {data: "recv_suc_num", width: 600, title: "成功接收量", className: "centerColumns"},
                {data: "order_num", width: 600, title: "订购量", className: "centerColumns"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 获取下载参数
    obj.getDownloadParam = function (type) {
        var $citySelect = $(".queryCityArea").val(),
            $startTime = $("#startTime").val(),
            $endTime = $("#endTime").val(),
            param = {};
        if($citySelect && $startTime && $endTime)
        {
            param.citySelect = $citySelect;
            if(type == 1)
            {
                param.startTime = $startTime.replace(/-/g, "");
                param.endTime = $endTime.replace(/-/g, "");
                param.formType ="daily";
            }else if(type == 2){
                param.startTime = $startTime.replace(/-/g, "").substring(0, 6);
                param.endTime = $endTime.replace(/-/g, "").substring(0, 6);
                param.formType ="monthly";
            }
            if(!obj.checkTimeSelect($startTime,$endTime))
            {
                $html.warning("开始时间不能大于结束时间");
                return {};
            }
            param.b2iType = b2iType;
            return param;
        }else{
            layer.alert("参数异常", {icon: 6});
            return {};
        }

    };

    // 初始化事件
    obj.initEvent = function (type) {
        // 查询
        $("#smartCloudFromQueryBtn").click(function () {
            var param = obj.getQueryData(type);
            if (param == "" || !dataTable) {
                return;
            }
            if (type == 1) // 日报
            {
                dataTable.ajax.url(queryB2iSmartFromsDaily + "?" + param);
            } else if (type == 2) { // 月报
                dataTable.ajax.url(queryB2iSmartFromsMonthly + "?" + param);
            }
            dataTable.ajax.reload();
        });

        // 下载
        $("#smartCloudFromQueryDownloadBtn").click(function () {
            var params = obj.getDownloadParam(type);
            if(params)
            {
                $util.exportFile(downLoadB2iSmartFromsUrl,params);
            }
        });
    };
    return obj;
}();



function loadBilibiliCardUpgrade(type) {
    bilibiliCardUpgrade.initQueryData();

    if (type == 1) // 日报
    {
        bilibiliCardUpgrade.dailyDataTableInit(1);
    }
    else if (type == 2) // 月报
    {
        bilibiliCardUpgrade.monthlyDataTableInit(2);
    }
    bilibiliCardUpgrade.initEvent(type);
}


