/**
 * Created by Administrator on 2016/11/28.
 */

var stockUserDaily = function(){
    var obj = {};

    obj.initBody = function(){
        var $selectOption = $("div.iMarket_StockUserDaily_Body div.dailyType select").find("option:checked"),
            $queryOption = $("div.iMarket_StockUserDaily_Body div.dailyType input.queryValue");
        var tableNameSuffix = ($selectOption.val() == "all"?"":"_4g");
        $queryOption.val($selectOption.val());
        globalRequest.queryStockUserDaily(true,{"tableName":"analysis_daily"+tableNameSuffix},function(data){
            loadChartDailyData(data.chart);
            loadTableDailyData(data);
        });

        function loadChartDailyData(data){
            var dailyDataChart = echarts.init($('div.iMarket_StockUserDaily_Body div.chartContent')[0]);
            var chartDatas = [];
            var monthLegend = [];
            for (var month in data){
                var _chartData = {};
                _chartData["name"] = month+"月收入";
                _chartData["type"] = "line";
                _chartData["data"] = data[month].split(",");
                chartDatas.push(_chartData);
                monthLegend.push(month+"月收入");
            }

            var option = {
                title : {
                    text: '拍照用户日实时话费'
                },
                tooltip : {
                    trigger: 'axis'
                },
                backgroundColor:"#f9f9f9",
                legend: {
                    data:monthLegend
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        splitLine:false,
                        data : ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25'
                            ,'26','27','28','29','30','31']
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : chartDatas
            };
            dailyDataChart.setOption(option);
            window.onresize  = function(){
                dailyDataChart.resize();
            }
        }

        function loadTableDailyData(data){
            var html = template('dailyDataTemplate', {list: data.table,tableHead:data.tableHead});
            $("div.iMarket_StockUserDaily_Body div.dailyData tbody").empty();
            $("div.iMarket_StockUserDaily_Body div.dailyData tbody").append(html);
        }
    };

    obj.initEvent = function(){
        $("div.iMarket_StockUserDaily_Body button#btnQuery").click(function(){
            obj.initBody();
        });

        $("div.iMarket_StockUserDaily_Body div.downloadAnalysisDaily").click(function(){
            var $queryOption = $("div.iMarket_StockUserDaily_Body div.dailyType input.queryValue");
            var $downloadFrame = $(this).siblings("div.downloadFrame");
            $downloadFrame.find("input").val($queryOption.val());
            $downloadFrame.find("form")[0].submit();
        });
    };
    return obj;
}();

function onLoadBody(){
    stockUserDaily.initBody();
    stockUserDaily.initEvent();
}