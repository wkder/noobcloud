/**
 * Created by Chris on 2017/12/12.
 */
var chaotaoMarketResult = function () {
    var getUrl = "getChaotaoMarketResult.view";
    var dataTable;
    var obj = {};

    //初始化日期
    obj.initData = function () {
        $('#queryTime').val(new Date().format('yyyy-MM-dd'));
    };

    //初始化按钮操作
    obj.initBtn = function () {
        $("#queryBtn").click(obj.evtOnRefresh);
        $("#downloadList").click(obj.evtOnDownload);
        $("#queryDesc").click(obj.evtOnPopUp);
    };

    //初始化表格
    obj.dataTableInit = function () {
        var data = "queryTime=" + $("#queryTime").val().replace(/-/g, "");
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getUrl + "?" + data,
                type: "POST"
            },
            columns: [
                {data: "productname", title: "产品名称", width: 600, className: "centerColumns"},
                {data: "jxhpushusercounts", title: "精细化推送用户数", width: 800, className: "centerColumns"},
                {data: "marketingusercounts", title: "营销用户数", width: 600, className: "centerColumns"},
                {data: "arrvuser", title: "到达用户数", width: 600, className: "centerColumns"},
                {data: "arrvrate", title: "到达率", width: 600, className: "centerColumns"},
                {data: "feedbackuser", title: "反馈人数", width: 600, className: "centerColumns"},
                {data: "feedbackrate", title: "反馈率", width: 600, className: "centerColumns"},
                {data: "prodcutorderuser", title: "订购用户数", width: 600, className: "centerColumns"},
                {data: "changerate", title: "转化率", width: 600, className: "centerColumns"}
            ],
            drawCallback: function (settings, json) {
                $(".dataTables_scrollHeadInner").css("width", "auto");
                var queryTime = $("#queryTime").val().replace(/-/g, "");
                globalRequest.queryChaotaoMarketResultTotal(false, {queryTime: queryTime}, function (data) {
                    if (!data || data.arrvratetotal == null || data.feedbackratetotal == null || data.changeratetotal == null) {
                        obj.setEmptyHtml();
                        return;
                    }

                    // 累计
                    var allTotalTdHtml = "<td>" + data.jxhpushusercountstotal + "</td><td>" + data.marketingusercountstotal + "</td><td>" + data.arrvusertotal + "</td><td>" + data.arrvratetotal + "</td><td>" + data.feedbackusertotal + "</td><td>" + data.feedbackratetotal + "</td><td>" + data.prodcutorderusertotal + "</td><td>" + data.changeratetotal + "</td>";
                    var allTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;font-size:16px;'>A</td>" + allTotalTdHtml + "</tr>";
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
        var data = "queryTime=" + $("#queryTime").val().replace(/-/g, "");
        dataTable.ajax.url(getUrl + "?" + data);
        dataTable.ajax.reload();
    };

    // 下载事件
    obj.evtOnDownload = function () {
        var data = getParams();
        $util.exportFile("downloadChaotaoMarketResult.view", data);
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
        var tdHtml = "<td>0</td><td>0</td><td>0</td><td>0.00%</td><td>0</td><td>0.00%</td><td>0</td><td>0.00%</td>",
            html = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + tdHtml + "</tr>",

            totalHtml = html.replace("A", "合计");

        $("#dataTable tbody").prepend(totalHtml);

        $(".dataTables_empty").css({"padding-top": "20px", "padding-bottom": "20px"});
    };

    function getParams() {
        return {
            queryTime: $("#queryTime").val().replace(/-/g, "")
        }
    }

    return obj;
}();

function onLoadBody() {
    chaotaoMarketResult.initData();
    chaotaoMarketResult.initBtn();
    chaotaoMarketResult.dataTableInit();
}
