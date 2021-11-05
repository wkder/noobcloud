/**
 * Created by Chris on 2017/12/5.
 */

var flowOperationDaily = function () {
    var getUrl = "getFlowOperationDaily.view";
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
                {data: "timest", width: 400, className: "dataTableFirstColumns"},
                {data: "dayorder", width: 300, className: "centerColumns"},
                {data: "monthorder", width: 800, className: "centerColumns"},
                {data: "diejiaorder", width: 600, className: "centerColumns"},
                {data: "xianshiorder", width: 600, className: "centerColumns"},
                {data: "dingxiangorder", width: 600, className: "centerColumns"},
                {data: "yearorder", width: 600, className: "centerColumns"},
                {data: "internationalorder", width: 600, className: "centerColumns"},
                {data: "totalorder", width: 600, className: "centerColumns"}
            ],
            drawCallback: function (settings, json) {
                $(".dataTables_scrollHeadInner").css("width", "auto");
                var queryMonth = $("#queryMonth").val().replace(/-/g, "");
                globalRequest.queryFlowOperationDailyTotal(false, {queryMonth: queryMonth}, function (data) {
                    if (!data || data.length == 0) {
                        obj.setEmptyHtml();
                        return;
                    }

                    // 累计
                    var allTotalTdHtml = "<td>" + data.dayordertotal + "</td><td>" + data.monthordertotal + "</td><td>" + data.diejiaordertotal + "</td><td>" + data.xianshiordertotal + "</td><td>" + data.dingxiangordertotal + "</td><td>" + data.yearordertotal + "</td><td>" + data.internationalordertotal + "</td><td>" + data.totalordertotal + "</td>";
                    var allTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + allTotalTdHtml + "</tr>";
                    allTotalHtml = allTotalHtml.replace("A", "合计");
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

    // 下载事件
    obj.evtOnDownload = function () {
        var data = getParams();
        $util.exportFile("downloadFlowOperationDaily.view", data);
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
        var tdHtml = "<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>",
            html = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + tdHtml + "</tr>",

            totalHtml = html.replace("A", "合计");

        $("#dataTable tbody").prepend(totalHtml);

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
    flowOperationDaily.initData();
    flowOperationDaily.initBtn();
    flowOperationDaily.dataTableInit();

}