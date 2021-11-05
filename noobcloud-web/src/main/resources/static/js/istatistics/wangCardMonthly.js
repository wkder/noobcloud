/**
 * Created by Chris on 2018/1/10.
 */

var wangCardMonthly = function () {
    var getUrl = "getWangCardMonthly.view";
    var dataTable;
    var obj = {};

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
                {data: "time", title: "日期", width: 600, className: "centerColumns"},
                {data: "tasknum", title: "任务数", width: 600, className: "centerColumns"},
                {data: "durationtime", title: "接通数(>=20s)", width: 600, className: "centerColumns"},
                {data: "durarate", title: "呼通率", width: 600, className: "centerColumns"},
                {data: "paymentamount", title: "充值数(>=100)", width: 600, className: "centerColumns"},
                {data: "succrate", title: "成功率", width: 600, className: "centerColumns"}
            ],
            drawCallback: function (settings, json) {
                $(".dataTables_scrollHeadInner").css("width", "auto");
                var queryMonth = $("#queryMonth").val().replace(/-/g, "");
                globalRequest.queryWangCardMonthlyTotal(false, {queryMonth: queryMonth}, function (data) {
                    if (!data || data.length == 0 || data.durationtime == null || data.paymentamount == null) {
                        obj.setEmptyHtml();
                        return;
                    }

                    // 累计
                    var allTotalTdHtml = "<td>" + data.tasknum + "</td><td>" + data.durationtime + "</td><td>" + data.durarate + "</td><td>" + data.paymentamount + "</td><td>" + data.succrate + "</td>";
                    var allTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td>" + allTotalTdHtml + "</tr>";
                    allTotalHtml = allTotalHtml.replace("A", "月累计");
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
        var tdHtml = "<td>0</td><td>0</td><td>0.00%</td><td>0</td><td>0.00%</td>",
            html = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td>" + tdHtml + "</tr>",

            totalHtml = html.replace("A", "月累计");

        $("#dataTable tbody").prepend(totalHtml);

        $(".dataTables_empty").css({"padding-top": "20px", "padding-bottom": "20px"});
    };


    return obj;
}();

function onLoadBody() {
    wangCardMonthly.initData();
    wangCardMonthly.initBtn();
    wangCardMonthly.dataTableInit();
}
