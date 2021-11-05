/**
 * Created by Chris on 2017/10/13.
 */
var promoteOnNetMarket = function () {
    var getPromoteMarket = "queryPromoteOnNetMarket.view";
    var obj = {};
    var dataTable;

    // 初始化时间
    obj.initData = function () {
        $('#startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('#endTime').val(new Date().getDelayDay(0).format('yyyy-MM-dd'));
    };

    //初始化按钮操作
    obj.initEvent = function () {
        //查询
        $("#promoteQueryBtn").click(obj.evtOnRefresh);

        //指标
        $("#btnDescription").click(function () {
            obj.evtOnDescription();
        });

        // 导出
        // $("#exportBaseButton").click(function () {
        //     var param = obj.getParam();
        //     $util.exportFile("downloadPromoteOnNetMarket", param);
        // });
    };

    //初始化表格
    obj.dataTableInit = function () {
        var param = getParam();
        var data1 = "startTime=" + param.startTime + "&endTime=" + param.endTime;
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getPromoteMarket + "?" + data1,
                type: "POST"
            },
            columns: [
                {data: "date", title: "营销日期", width: 400, className: "dataTableFirstColumns"},
                {data: "type", title: "营销类型", width: 300, className: "centerColumns"},
                {data: "condition", title: "营销客群", width: 800, className: "centerColumns"},
                {data: "catchnum", title: "营销用户数", width: 600, className: "centerColumns"},
                {data: "giftnum", title: "已成功转化用户数<br>(30天内统计有效)", width: 600, className: "centerColumns"},
                {data: "transfer_rate", title: "转化率<br>(转化/营销)", width: 600, className: "centerColumns"},
                {
                    title: "分析", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var analysisHtml = "<a title='日转化趋势'  class='assignBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='promoteOnNetMarket.analysisPopUp(\"" + row.date + "\",\"" + row.type + "\",\"" + row.condition + "\")' >日转化趋势</a>";
                        return analysisHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询、时间校验事件
    obj.evtOnRefresh = function () {
        var param = getParam();
        var data1 = "startTime=" + param.startTime + "&endTime=" + param.endTime;
        if (param.startTime.getDateNumber() - param.endTime.getDateNumber() > 0) {
            layer.alert("开始时间请勿大于结束日期", {icon: 6});
            return;
        }
        dataTable.ajax.url(getPromoteMarket + "?" + data1);
        dataTable.ajax.reload();
    };


    //指标 事件
    obj.evtOnDescription = function () {
        $plugin.iModal({
            title: '指标说明',
            content: $("#dialogDescription"),
            offset: '100px',
            area: ["600px", "400px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };


    //分析弹窗事件(柱状图和artTemplate)
    obj.analysisPopUp = function (date, type, condition) {
        obj.evtOnChanging();

        globalRequest.queryPromoteOnNetMarketChart(true, {"date": date, "type": type, "condition": condition}, function (data) {
            var wholePromoteData = data;
            var promoteDistributionDate = [];
            var promoteDistributionValue = [];
            for (var i = 0,y = wholePromoteData.length;i<y; i++) {
                promoteDistributionDate.push(wholePromoteData[i].timest);
                promoteDistributionValue.push(wholePromoteData[i].num);
            }

            var distributionOfUserChart = echarts.init($('div.distributionOfUser')[0]);
            var distributionOption = {
                title: {
                    text: '日转化用户数',
                    x: 'center',
                    padding: 10,
                    textStyle:{
                        fontWeight:500
                    }
                },
                backgroundColor: "#f9f9f9",
                tooltip: {
                    trigger: 'axis'
                },
                calculable: false,
                xAxis: [
                    {
                        type: 'category',
                        data: promoteDistributionDate,
                        name: "日期",
                        linkSymbol: "arrow",
                        splitLine: false,
                        axisLabel: {
                            rotate: 45
                        },
                        axisTick:{
                            alignWithLabel:true
                        },
                        boundaryGap: true
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: "人数"
                    }
                ],
                series: [
                    {
                        name: '日转化用户数',
                        type: 'bar',
                        data: promoteDistributionValue,
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    return "#587BBD"
                                }

                            }
                        }
                    }
                ]
            };

            distributionOfUserChart.setOption(distributionOption);

            window.onresize = function () {
                distributionOfUserChart.resize();
            };


            // if (data && data.length > 0) {
                var htmlOne = template('promoteOnNetMarketTemplate', {list: data});//artTemplate
                $("div.promoteOnNetMarketChart #dataTable1 tbody tr").empty();
                $("div.promoteOnNetMarketChart #dataTable1 tbody ").append(htmlOne);
            // }

            // if (data && data.length == 0) {
            //     var htmlOne = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
            //     $("div.promoteOnNetMarketChart #dataTable1 tbody tr").empty();
            //     $("div.promoteOnNetMarketChart #dataTable1 tbody ").append(htmlOne);
            // }


        }, function () {
            $html.warning("遇到异常，数据加载失败");
        });


    };

    // 日转化趋势弹窗事件
    obj.evtOnChanging = function () {
        $plugin.iModal({
            title: '日转化趋势',
            content: $(".promoteOnNetMarketChart"),
            offset: '100px',
            area: ["850px", "600px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };


    //获取时间参数
    function getParam() {
        return {
            startTime: $("#startTime").val().replace(/-/g, ""),
            endTime: $("#endTime").val().replace(/-/g, "")
        }
    }

    return obj;
}();

function onLoadBody() {
    promoteOnNetMarket.initData();
    promoteOnNetMarket.initEvent();
    promoteOnNetMarket.dataTableInit();
}