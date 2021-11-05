/**
 * Created by Administrator on 2016/11/25.
 */

var flowAnalysis = function () {
    var obj = {};

    //初始化时间模块
    obj.initDate = function() {
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth();//js月份0-11
        var years = [];
        var $yearSelect = $("div.iMarket_FlowAnalysis_Body div.queryAnalysis select.queryAnalysisYear");
        var $monthSelect = $("div.iMarket_FlowAnalysis_Body div.queryAnalysis select.queryAnalysisMonth");
        for (var year = 2000; year < 2051; year++) {
            years.push("<option value='A'>A年</option>".replace(/A/g, year));
        }
        $yearSelect.append(years);
        $yearSelect.val(currentYear);
        $monthSelect.val(currentMonth);
    };

    obj.initAnalysisData = function() {

        var proportionOfCityFlowChart = echarts.init($('div.proportionOfCityFlow')[0]);
        var distributionOfCityFlowChart = echarts.init($('div.distributionOfCityFlow')[0]);
        var contrastOfFlowGrowthChart = echarts.init($('div.contrastOfFlowGrowth')[0]);
        var $selectAnalysisYear = $("div.iMarket_FlowAnalysis_Body div.queryAnalysis select.queryAnalysisYear");
        var $selectAnalysisMonth = $("div.iMarket_FlowAnalysis_Body div.queryAnalysis select.queryAnalysisMonth");

        var year = $selectAnalysisYear.val();
        var month = $selectAnalysisMonth.val();
        month = month.length < 2 ? "0" + month : month;//处理日期显示格式

        globalRequest.queryAnalysisFlowRateByUDate(false, {yearMonth: year + month}, function (data) {
            var wholeFlowData = data.flowData;
            var flowDistributionArea = [];
            var flowDistributionValue = [];
            for (var i = 0,y = wholeFlowData.length;i<y; i++) {
                flowDistributionArea.push(wholeFlowData[i].name);
                flowDistributionValue.push(wholeFlowData[i].value);
            }
            var contrastData = [], flowContrast = data.flowContrast, i = 0, colorBox = ["#98B7EE", "#5C8EE6", '#587BBD'];//这里修改插件颜色
            for (var month in flowContrast) {
                var monthContrastData = {};
                monthContrastData["name"] = month + "月";
                monthContrastData["type"] = "bar";
                monthContrastData["data"] = flowContrast[month];
                monthContrastData["barWidth"] = 18;
                monthContrastData["barCategoryGap"] = "36%";
                monthContrastData["itemStyle"] = {normal: {color: colorBox[i]}};
                contrastData.push(monthContrastData);
                i++;
            }

            var proportionOption = {
                title: {
                    text: '地市流量占比',
                    x: 'left'
                },
                backgroundColor: "#f9f9f9",
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                color: ["#587BBD"],
                //color: [
                //    '#c12e34','#e6b600','#0098d9','#2b821d',
                //    '#005eaa','#339ca8','#cda819','#32a487'
                //],
                calculable: false,
                series: [
                    {
                        name: '地市流量占比',
                        type: 'pie',
                        radius: '50%',
                        center: ['50%', '50%'],
                        data: wholeFlowData
                    }
                ]
            };

            var distributionOption = {
                title: {
                    text: '地市流量分布',
                    x: 'left'
                },
                backgroundColor: "#f9f9f9",
                tooltip: {
                    trigger: 'axis'
                },
                calculable: false,
                xAxis: [
                    {
                        type: 'category',
                        data: flowDistributionArea,
                        name: "地市",
                        linkSymbol: "arrow",
                        splitLine: false,
                        axisLabel: {
                            rotate: 45
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: "流量(GB)"
                    }
                ],
                series: [
                    {
                        name: '地市流量分布',
                        type: 'bar',
                        data: flowDistributionValue,
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

            var contrastOption = {
                title: {
                    text: '流量增长对比'
                },
                backgroundColor: "#f9f9f9",
                tooltip: {
                    trigger: 'axis'
                },
                calculable: false,
                xAxis: [
                    {
                        type: 'category',
                        name: "模式",
                        splitLine: false,
                        data: ['2G', '3G', '4G']
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        splitLine: false,
                        name: "近三个月流量(GB)"
                    }
                ],
                series: contrastData
            };
            proportionOfCityFlowChart.setOption(proportionOption);
            distributionOfCityFlowChart.setOption(distributionOption);
            contrastOfFlowGrowthChart.setOption(contrastOption);

            //eCharts图表随浏览器大小变换size
            window.onresize = function () {
                proportionOfCityFlowChart.resize();
                distributionOfCityFlowChart.resize();
                contrastOfFlowGrowthChart.resize();
            }

        }, function () {
            layer.alert("系统异常", {icon: 6});
        });

        globalRequest.queryAnalysisFlowByUDate(true, {yearMonth: year + month}, function (data) {
            var html = template('flowAnalysisTemplate', {list: data});
            $("div.iMarket_FlowAnalysis_Body .flowAnalysisTable ul.info > li").not(".infoHeader").remove();//删除已有的数据
            $("div.iMarket_FlowAnalysis_Body .flowAnalysisTable ul.info").append(html);
        });
    };

    obj.initFlowAnalysisEvent = function() {
        $("div.queryAnalysis.lineShow button#btnQuery").click(function () {
            obj.initAnalysisData();
        });
    };
    return obj;
}();

function onLoadBody() {
    flowAnalysis.initDate();
    flowAnalysis.initAnalysisData();
    flowAnalysis.initFlowAnalysisEvent();
}