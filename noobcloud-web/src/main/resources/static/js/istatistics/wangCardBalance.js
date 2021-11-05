/**
 * Created by Chris on 2018/1/11.
 */
var wangCardBalance = function () {
    var getUrl = "getWangCardBalance.view";
    var dataTable;
    var obj = {};

    obj.cityNameByCode = function (code) {
        var cityData = {
            '0025': '南京',
            '0512': '苏州',
            '0510': '无锡',
            '0519': '常州',
            '0514': '扬州',
            '0511': '镇江',
            '0513': '南通',
            '0516': '徐州',
            '0523': '泰州',
            '0515': '盐城',
            '0517': '淮安',
            '0518': '连云港',
            '0527': '宿迁'
        };
        if (code) {
            return cityData[code]
        }
        return code
    };

    //初始化日期
    obj.initData = function () {
        $('#queryMonth').val(new Date().format('yyyy-MM'));
    };

    //初始化按钮操作
    obj.initBtn = function () {
        $("#queryBtn").click(obj.evtOnRefresh);
        $("#queryMonth").bind('focus', function () {
            WdatePicker({
                isShowWeek: false,
                isShowToday: false,
                isShowClear: false,
                readOnly: true,
                dateFmt: 'yyyy-MM',
                autoPickDate: true,
                maxDate: '%y-%M-%d'
            });
        });
    };

    //初始化表格
    obj.dataTableInit = function () {
        var data = "queryMonth=" + $("#queryMonth").val().replace(/-/g, "");
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getUrl + "?" + data,
                type: "POST"
            },
            columns: [
                {
                    data: "citycode", title: "地市", width: 400, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<span>" + obj.cityNameByCode(row.citycode) + "</span>";
                    }
                },
                {data: "tasknum", title: "任务数", width: 600, className: "centerColumns"},
                {data: "durationtime", title: "基本接通量(>=20s)", width: 600, className: "centerColumns"},
                {data: "durationfee", title: "基础呼叫费", width: 600, className: "centerColumns"},
                {data: "paymentamount", title: "充值量(>=100)", width: 600, className: "centerColumns"},
                {data: "paymentfee", title: "充值费", width: 600, className: "centerColumns"},
                {data: "totalfee", title: "总金额", width: 600, className: "centerColumns"}
            ],
            drawCallback: function (settings, json) {
                $(".dataTables_scrollHeadInner").css("width", "auto");
                var queryMonth = $("#queryMonth").val().replace(/-/g, "");
                globalRequest.queryWangCardBalanceTotal(false, {queryMonth: queryMonth}, function (data) {
                    if (!data || data.length == 0 || data.durationtime == null) {
                        obj.setEmptyHtml();
                        return;
                    }

                    // 累计
                    var allTotalTdHtml = "<td>" + data.tasknum + "</td><td>" + data.durationtime + "</td><td>" + data.durationfee + "</td><td>" + data.paymentamount + "</td><td>" + data.paymentfee + "</td><td>" + data.totalfee + "</td>>";
                    var allTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td>" + allTotalTdHtml + "</tr>";
                    allTotalHtml = allTotalHtml.replace("A", "全省");
                    $("#dataTable tbody").prepend(allTotalHtml);

                    $(".dataTables_empty").css({"padding-top": "20px", "padding-bottom": "20px"});
                }, function () {
                    $html.warning("合计数据异常");
                })
            },
            initComplete: function (settings, json) {
                $("#dataTable_wrapper").css("text-align", "center");
                $("#dataTable_wrapper :first(.row)").hide();
                $(".dataTables_scrollHeadInner").css("width", "auto");
            }
        };
        dataTable = $plugin.iCompaignTable(option);
    };


    // 查询事件
    obj.evtOnRefresh = function () {
        var data = "queryMonth=" + $("#queryMonth").val().replace(/-/g, "");
        dataTable.ajax.url(getUrl + "?" + data);
        dataTable.ajax.reload();
    };


    //设置空数据时的合计样式
    obj.setEmptyHtml = function () {
        var tdHtml = "<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>",
            html = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td>" + tdHtml + "</tr>",

            totalHtml = html.replace("A", "全省");

        $("#dataTable tbody").prepend(totalHtml);

        $(".dataTables_empty").css({"padding-top": "20px", "padding-bottom": "20px"});
    };


    return obj;
}();

function onLoadBody() {
    wangCardBalance.initData();
    wangCardBalance.initBtn();
    wangCardBalance.dataTableInit();
}
