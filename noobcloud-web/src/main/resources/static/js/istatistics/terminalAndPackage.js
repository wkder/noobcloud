/**
 * Created by Administrator on 2016/11/28.
 */


var terminalAndPackage = function(){
    var obj = {};
    var $selectAnalysisYear = $("div.iMarket_TerminalAndPackage_Body select.queryComparisonYear");
    var $selectAnalysisMonth = $("div.iMarket_TerminalAndPackage_Body select.queryComparisonMonth");
    var date = new Date();
    var currentYear = date.getFullYear();
    var currentMonth =date.getMonth()+1;
    $selectAnalysisYear.val(currentYear);
    $selectAnalysisMonth.val(currentMonth);

     obj.initYear = function(){
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth();
        var years = [];
        var $yearSelect = $("div.iMarket_TerminalAndPackage_Body div.queryComparison select.queryComparisonYear");
        var $monthSelect = $("div.iMarket_TerminalAndPackage_Body div.queryComparison select.queryComparisonMonth");
        for (var year = 2000;year<2051;year++){
            years.push("<option value='A'>A年</option>".replace(/A/g,year));
        }
        $yearSelect.append(years);
        $yearSelect.val(currentYear);
        $monthSelect.val(currentMonth);
    };

    obj.initTerminalPackageCompareData = function(){
        var userProportionChart = echarts.init($('div.userProportion')[0]);
        var comparisonProportionChart = echarts.init($('div.comparisonProportion')[0]);
        var year = $selectAnalysisYear.val();
        var month = $selectAnalysisMonth.val();
        month = month.length<2? "0"+month : month;

        globalRequest.queryTerminalPackageData(true,{yearMonth:year+month},function(data){
            var userProportionOption = {
                title : {
                    text: '城市用户占比',
                },
                tooltip : {
                    trigger: 'axis'
                },
                legend: {
                    data:['3G占比','4G占比']
                },
                calculable : true,
                backgroundColor:"#f9f9f9",
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        name:"城市",
                        splitLine:false,
                        data : data["cityUser"]["cityName"],
                        axisLabel: {
                            rotate: 45
                        }
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        name:"百分比(%)"
                    }
                ],
                series : [
                    {
                        name:'3G占比',
                        type:'line',
                        data:data["cityUser"]["proportion3G"]
                    },
                    {
                        name:'4G占比',
                        type:'line',
                        data:data["cityUser"]["proportion4G"]
                    }
                ]
            };

            var comparisonProportionOption = {
                title : {
                    text: '终端套餐对比',
                },
                backgroundColor:"#f9f9f9",
                tooltip : {
                    trigger: 'axis'
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        splitLine:false,
                        data : ['2G','3G','4G']
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        splitLine:false,
                        name:"终端设备占比(%)"
                    },
                    {
                        type : 'value',
                        splitLine:false,
                        name:"套餐模式占比(%)"
                    }
                ],
                series : [
                    {
                        name:'终端设备占比',
                        type:'bar',
                        data:data["terminalPackage"]["terminalProportion"],
                        barWidth:19,
                        barCategoryGap:"75%",
                        itemStyle:{
                            normal: {
                                color: function (params) {
                                    return "#98B7EE"
                                }

                            }
                        }
                    },
                    {
                        name:'套餐模式占比',
                        type:'bar',
                        data:data["terminalPackage"]["packageProportion"],
                        barWidth:19,
                        barCategoryGap:"75%",
                        yAxisIndex:1,
                        itemStyle:{
                            normal: {
                                color: function (params) {
                                    return "#34599D"
                                }

                            }
                        }
                    }
                ]
            };

            userProportionChart.setOption(userProportionOption);
            comparisonProportionChart.setOption(comparisonProportionOption);

            window.onresize  = function(){
                userProportionChart.resize();
                comparisonProportionChart.resize();
            }
        },function(){
            layer.alert("系统异常",{icon: 6});
        });

        globalRequest.queryBehaviorPreferences(true,{yearMonth:year+month},function(data){
            var html = template('behaviorPreferencesTemplate', {list: data});
            $(".behaviorPreferencesTable ul.info > li").not(".infoHeader").remove();
            $(".behaviorPreferencesTable ul.info").append(html);


        },function(){
            layer.alert("系统异常",{icon: 6});
        });

    };

    obj.initTerminalPackageEvent = function(){
        $("div.queryComparison button#btnQuery").click(function(){
            obj.initTerminalPackageCompareData();
        });
    };
    return obj;
}();

function onLoadBody(){
    terminalAndPackage.initYear();
    terminalAndPackage.initTerminalPackageCompareData();
    terminalAndPackage.initTerminalPackageEvent();
}