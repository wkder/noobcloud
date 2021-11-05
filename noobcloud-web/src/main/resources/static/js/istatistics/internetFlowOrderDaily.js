/**
 * Created by Chris on 2017/12/7.
 */

var internetFlowOrderDaily = function () {
    var getUrl = "getInternetFlowOrderDaily.view";
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
        $("#downloadList").click(obj.evtOnDownload);
        $("#queryDesc").click(obj.evtOnPopUp);
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
                {data: "timest", title: "交易时间", width: 600, className: "centerColumns"},
                {data: "spname", title: "交易对方", width: 600, className: "centerColumns"},
                {data: "monthguonei", title: "全国月包", width: 600, className: "centerColumns"},
                {data: "monthshengnei", title: "省内月包", width: 600, className: "centerColumns"},
                {data: "xianshiorder", title: "闲时包", width: 600, className: "centerColumns"},
                {data: "dayorder", title: "日包", width: 600, className: "centerColumns"},
                {data: "totalorder", title: "合计", width: 600, className: "centerColumns"}
            ],
            drawCallback: function (settings, json) {
                $(".dataTables_scrollHeadInner").css("width", "auto");
                var queryMonth = $("#queryMonth").val().replace(/-/g, "");

                globalRequest.queryInternetFlowOrderDailyTotal(false, {queryMonth: queryMonth}, function (data) {
                    if (!data || data.length == 0) {
                        obj.setEmptyHtml();
                        return;
                    }

                    var allTotal = data.allTotal;
                    var szTotal = data.szTotal;
                    var hzTotal = data.hzTotal;
                    var szgTotal = data.szgTotal;

                    // 累计
                    if (allTotal) {
                        var allTotalTdHtml = "<td>" + allTotal.monthguoneitotal + "</td><td>" + allTotal.monthshengneitotal + "</td><td>" + allTotal.xianshiordertotal + "</td><td>" + allTotal.dayordertotal + "</td><td>" + allTotal.totalordertotal + "</td>";
                        var allTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td><td style='padding-left:20px;font-size:16px;'>B</td>" + allTotalTdHtml + "</tr>";
                        allTotalHtml = allTotalHtml.replace("A", queryMonth + "月累计").replace("B", "累计");
                        $("#dataTable tbody").prepend(allTotalHtml);
                    }

                    //  杭州坤虫合计
                    if (hzTotal) {
                        var hzTotalTdHtml = "<td>" + hzTotal.monthguoneitotal + "</td><td>" + hzTotal.monthshengneitotal + "</td><td>" + hzTotal.xianshiordertotal + "</td><td>" + hzTotal.dayordertotal + "</td><td>" + hzTotal.totalordertotal + "</td>";
                        var hzTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td><td style='padding-left:20px;font-size:16px;'>B</td>" + hzTotalTdHtml + "</tr>";
                        hzTotalHtml = hzTotalHtml.replace("A", queryMonth + "月累计").replace("B", "杭州坤虫");
                        $("#dataTable tbody").prepend(hzTotalHtml);
                    }

                    //  深圳腾讯合计
                    if (szgTotal) {
                        var szgTotalTdHtml = "<td>" + szgTotal.monthguoneitotal + "</td><td>" + szgTotal.monthshengneitotal + "</td><td>" + szgTotal.xianshiordertotal + "</td><td>" + szgTotal.dayordertotal + "</td><td>" + szgTotal.totalordertotal + "</td>";
                        var szgTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td><td style='padding-left:20px;font-size:16px;'>B</td>" + szgTotalTdHtml + "</tr>";
                        szgTotalHtml = szgTotalHtml.replace("A", queryMonth + "月累计").replace("B", "深圳腾讯");
                        $("#dataTable tbody").prepend(szgTotalHtml);
                    }

                    //  苏州瑞翼合计
                    if (szTotal) {
                        var szTotalTdHtml = "<td>" + szTotal.monthguoneitotal + "</td><td>" + szTotal.monthshengneitotal + "</td><td>" + szTotal.xianshiordertotal + "</td><td>" + szTotal.dayordertotal + "</td><td>" + szTotal.totalordertotal + "</td>";
                        var szTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td><td style='padding-left:20px;font-size:16px;'>B</td>" + szTotalTdHtml + "</tr>";
                        szTotalHtml = szTotalHtml.replace("A", queryMonth + "月累计").replace("B", "苏州瑞翼");
                        $("#dataTable tbody").prepend(szTotalHtml);
                    }

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

    // 下载事件
    obj.evtOnDownload = function () {
        var data = getParams();
        $util.exportFile("downloadInternetFlowOrderDaily.view", data);
    };

    // 指标弹窗
    obj.evtOnPopUp = function () {
        $plugin.iModal({
            title: '指标说明',
            content: $(".dialogDescription"),
            offset: '100px',
            area: ["600px", "400px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };


    //设置空数据时的合计样式
    obj.setEmptyHtml = function () {
        var queryMonth = $("#queryMonth").val();
        var tdHtml = "<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>",
            html = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td><td padding-left:20px;font-size:16px;'>B</td>" + tdHtml + "</tr>",
            szHtml = html.replace("A", queryMonth + "月累计").replace("B", "苏州瑞翼"),
            szgHtml = html.replace("A", queryMonth + "月累计").replace("B", "深圳腾讯"),
            hzHtml = html.replace("A", queryMonth + "月累计").replace("B", "杭州坤虫"),
            totalHtml = html.replace("A", queryMonth + "月累计").replace("B", "累计");

        $("#dataTable tbody").prepend(totalHtml);
        $("#dataTable tbody").prepend(hzHtml);
        $("#dataTable tbody").prepend(szgHtml);
        $("#dataTable tbody").prepend(szHtml);

        $(".dataTables_empty").css({"padding-top": "20px", "padding-bottom": "20px"});
    };


    function getParams() {
        return {
            queryMonth: $("#queryMonth").val().replace(/-/g, "")
        }
    }

    return obj;
}();

function onLoadBody() {
    internetFlowOrderDaily.initData();
    internetFlowOrderDaily.initBtn();
    internetFlowOrderDaily.dataTableInit();
}