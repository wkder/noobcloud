/**
 * Created by hale on 2017/5/8.
 */

var shopWeekly = function () {
    var getUrl = "queryShopWeeklyByPage.view",
        scrollY = 0, globalStatus = 0, dataTable = {}, obj = {};

    /**
     * 页面大小初始化
     */
    obj.initialize = function () {
        var winHeight = localStorage.getItem("shopWeeklyTableHeight");
        if (winHeight) {
            scrollY = winHeight - 100 - 76 - 10 - 30;
        } else {
            winHeight = $("#coreFrame").height();
            scrollY = winHeight - 100 - 76 - 10 - 30;
            localStorage.setItem("shopWeeklyTableHeight", winHeight);
        }
    };

    /**
     * 加载数据
     * @param status 0:地市周报 1:营业厅周报
     */
    obj.initData = function (status) {
        obj.initDateTime();
        obj.initAreaSelect();
        if (status === "1") {
            obj.initBaseSelect();
            globalStatus = 1;
        }
        obj.dataTableInit();
    };

    /**
     * 加载事件
     */
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnExport").click(obj.evtOnExport);
        $("#btnDescription").click(obj.evtOnDescription);
    };

    /**
     * 时间控件初始化
     */
    obj.initDateTime = function () {
        var date = new Date();
        $("#txtQueryDate").val(date.getDelayDay(-date.getDay()).format("yyyy-MM-dd"));
    };

    /**
     * 加载查询条件
     */
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $("#selectQueryBaseAreas");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == areaCode) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    };

    /**
     * 搜索栏 营业厅下拉框
     */
    obj.initBaseSelect = function () {
        var $baseSelect = $("#selectQueryBase");
        var paras = {
            baseAreaId: $.trim($("#selectQueryBaseAreas").val()),
            baseTypeId: "",
            baseId: "",
            baseName: ""
        };
        globalRequest.queryBases(true, paras, function (data) {
            $baseSelect.empty();
            $baseSelect.append("<option value='A'>B</option>".replace(/A/g, "").replace(/B/g, "请选择营业厅"));
            if (data) {
                var list = data.items;
                if (list && list.length > 0) {
                    for (var i = 0; i < list.length; i++) {
                        $baseSelect.append("<option data-code='C' value='A'>B</option>".replace(/A/g, list[i].id).replace(/B/g, list[i].name).replace(/C/g, list[i].code));
                    }
                }
            }
            $baseSelect.show();
        }, function () {
            layer.alert("加载营业厅数据异常", {icon: 6});
        })
    };

    /**
     * 表格初始化
     */
    obj.dataTableInit = function () {
        var params = "dateTime=" + $("#txtQueryDate").val() + "&areaCode=" + $("#selectQueryBaseAreas").val() + "&locationType=" + $("#selectQueryLocationType").val() + "&baseId=" + $("#selectQueryBase").val() + "&bussHallCoding=" + $.trim($("#bussHallCoding").val());
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + params,
                type: "POST"
            },
            scrollY: scrollY,
            paging: false,
            columns: [
                {data: "cityname"},
                {data: "busshallcoding"},
                {data: "basename"},
                {data: "basetypename"},
                {
                    data: "status",
                    render: function (data, type, row) {
                        switch (row.status) {
                            case 0:
                                return " <span style='color: red;'>否</span>";
                            case 1:
                                return "<span>是</span>";
                            default:
                                return " <span>" + row.status + "</span>";
                        }
                    }
                },
                {data: "provincetasknum"},
                {data: "citytasknum"},
                {data: "shoptasknum"},
                {data: "executetasknum"},
                {data: "executetaskrate"},
                {data: "businesstypenum"},
                {data: "changzhusendnum"},
                {data: "liudongsendnum"},
                {data: "zhidingsendnum"},
                // {data: "changzhurate"},
                {data: "totalsendnum"},
                {data: "smsrate"},
                {data: "ringrate"},
                {data: "banlinum"},
                {data: "baserank"},
                {data: "cityrank"}
            ],
            drawCallback: function (settings, json) {
                $(".dataTables_scrollHeadInner").css("width", "auto");
                var params = {};
                params["dateTime"] = $("#txtQueryDate").val();
                params["locationType"] = $("#selectQueryLocationType").val();
                params["locationName"] = "";
                params["areaCode"] = $("#selectQueryBaseAreas").val();
                params["baseId"] = $("#selectQueryBase").val();
                params["bussHallCoding"] = $.trim($("#bussHallCoding").val());
                globalRequest.iShop.queryShopWeeklyTotal(false, params, function (data) {
                    if (!data || data.length == 0) {
                        obj.setEmptyHtml();
                        return;
                    }
                    var allTotal = data.allTotal;
                    var hpTotal = data.hpTotal;
                    var zyTotal = data.zyTotal;

                    //  黄埔厅合计
                    if (hpTotal) {
                        var hpTotalTdHtml = "<td></td><td></td><td></td><td></td><td>" + hpTotal.provincetasknumtotal + "</td><td>" + hpTotal.citytasknumtotal + "</td><td>" + hpTotal.basetasknumtotal + "</td><td>" + hpTotal.executetasknumtotal + "</td><td>" + hpTotal.executetasktotalrate + "</td><td>" + hpTotal.businesstypenumtotal + "</td><td>" + hpTotal.changzhusendtotal + "</td><td>" + hpTotal.liudongsendtotal + "</td><td>" + hpTotal.zhidingsendtotal + "</td><td>" + hpTotal.totalsendnum + "</td><td>" + hpTotal.smstotalrate + "</td><td>" + hpTotal.totalringrate + "</td><td>" + hpTotal.totalbanlinum + "</td><td></td><td></td>";
                        var hpTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + hpTotalTdHtml + "</tr>";
                        hpTotalHtml = hpTotalHtml.replace("A", "黄埔厅合计");
                        $("#dataTable tbody").append(hpTotalHtml);
                    }

                    //  自营厅合计
                    if (zyTotal) {
                        var zyTotalTdHtml = "<td></td><td></td><td></td><td></td><td>" + zyTotal.provincetasknumtotal + "</td><td>" + zyTotal.citytasknumtotal + "</td><td>" + zyTotal.basetasknumtotal + "</td><td>" + zyTotal.executetasknumtotal + "</td><td>" + zyTotal.executetasktotalrate + "</td><td>" + zyTotal.businesstypenumtotal + "</td><td>" + zyTotal.changzhusendtotal + "</td><td>" + zyTotal.liudongsendtotal + "</td><td>" + zyTotal.zhidingsendtotal + "</td><td>" + zyTotal.totalsendnum + "</td><td>" + zyTotal.smstotalrate + "</td><td>" + zyTotal.totalringrate + "</td><td>" + zyTotal.totalbanlinum + "</td><td></td><td></td>";
                        var zyTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + zyTotalTdHtml + "</tr>";
                        zyTotalHtml = zyTotalHtml.replace("A", "自营厅合计");
                        $("#dataTable tbody").append(zyTotalHtml);
                    }

                    // 总合计
                    if (allTotal) {
                        var allTotalTdHtml = "<td></td><td></td><td></td><td></td><td>" + allTotal.provincetasknumtotal + "</td><td>" + allTotal.citytasknumtotal + "</td><td>" + allTotal.basetasknumtotal + "</td><td>" + allTotal.executetasknumtotal + "</td><td>" + allTotal.executetasktotalrate + "</td><td>" + allTotal.businesstypenumtotal + "</td><td>" + allTotal.changzhusendtotal + "</td><td>" + allTotal.liudongsendtotal + "</td><td>" + allTotal.zhidingsendtotal + "</td><td>" + allTotal.totalsendnum + "</td><td>" + allTotal.smstotalrate + "</td><td>" + allTotal.totalringrate + "</td><td>" + allTotal.totalbanlinum + "</td><td></td><td></td>";
                        var allTotalHtml = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + allTotalTdHtml + "</tr>";
                        allTotalHtml = allTotalHtml.replace("A", "总合计");
                        $("#dataTable tbody").append(allTotalHtml);
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

    /**
     * 查询
     */
    obj.evtOnQuery = function () {
        var params = "dateTime=" + $("#txtQueryDate").val() + "&areaCode=" + $("#selectQueryBaseAreas").val() + "&locationType=" + $("#selectQueryLocationType").val() + "&baseId=" + $("#selectQueryBase").val() + "&bussHallCoding=" + $.trim($("#bussHallCoding").val());
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + params);
    };

    /**
     * 导出Excel
     */
    obj.evtOnExport = function () {
        //var type = $("#selectQueryLocationType").val() == "-1" ? "全部" : $("#selectQueryLocationType").find("option:selected").text();
        //var areaName = $("#selectQueryBaseAreas").find("option:selected").text();
        //var fileName = $("#txtQueryDate").val() + "-" + areaName + "-" + type + ".xlsx";
        //return export_table_to_excel('dataTable', 'xlsx', fileName);

        var dateTime = $.trim($("#txtQueryDate").val()),
            areaCode = $.trim($("#selectQueryBaseAreas").val()),
            areaName = $.trim($("#selectQueryBaseAreas").find("option:selected").text()),
            locationType = $.trim($("#selectQueryLocationType").val()),
            baseId = $.trim($("#selectQueryBase").val()),
            bussHallCoding = $.trim($("#bussHallCoding").val()),
            type = globalStatus;
        var oData = {};
        oData["dateTime"] = dateTime;
        oData["areaCode"] = areaCode;
        oData["locationType"] = locationType;
        oData["baseId"] = baseId;
        oData["areaName"] = areaName;
        oData["bussHallCoding"] = bussHallCoding;
        oData["type"] = type;
        $util.exportFile("exportShopWeekly.view", oData);

    };

    /**
     * 显示 指标说明
     */
    obj.evtOnDescription = function () {
        $plugin.iModal({
            title: '指标说明',
            content: $("#dialogDescription"),
            area: ["850px", "600px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };

    /**
     * 设置空数据时的合计样式
     */
    obj.setEmptyHtml = function () {
        var tdHtml = "<td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0.00%</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0.00%</td><td>0.00%</td><td>0</td>",
            html = "<tr style='text-align: center;font-weight: bolder;'><td style='color:red;padding-left:20px;font-size:16px;'>A</td>" + tdHtml + "</tr>",
            hpHtml = html.replace("A", "黄埔厅合计"),
            zyHtml = html.replace("A", "自营厅合计"),
            totalHtml = html.replace("A", "总合计");
        $("#dataTable tbody").append(hpHtml);
        $("#dataTable tbody").append(zyHtml);
        $("#dataTable tbody").append(totalHtml);
        $(".dataTables_empty").css({"padding-top": "20px", "padding-bottom": "20px"});
    };

    return obj;
}();

function onLoadBody(status) {
    shopWeekly.initialize();
    shopWeekly.initData(status);
    shopWeekly.initEvent();
}