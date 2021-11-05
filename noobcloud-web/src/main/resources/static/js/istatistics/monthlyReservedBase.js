/**
 * Created by Administrator on 2016/11/28.
 */
var monthlyReservedBase = function(){
    var obj = {};

    obj.initData = function(){
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth();
        var years = [];
        var $yearSelect = $("div.iMarket_MonthlyReservedBase_Body div.dateSelect select.year");
        var $monthSelect = $("div.iMarket_MonthlyReservedBase_Body div.dateSelect select.month");
        var $citySelect = $("div.iMarket_MonthlyReservedBase_Body div.dateSelect select.city");
        for (var year = 2000;year<2051;year++){
            years.push("<option value='A'>A年</option>".replace(/A/g,year));
        }
        $yearSelect.append(years);
        $yearSelect.val(currentYear);
        $monthSelect.val(currentMonth);
        /** 暂时先在html写死城市数据 **/
        //$util.ajaxPost("queryCity.view",{},function(data){
        //
        //},function(){
        //    $html.warning("操作失败！");
        //});
        $citySelect.val("南宁");
    };

    obj.initBody = function(){
        var $selects = $("div.iMarket_MonthlyReservedBase_Body div.dateSelect select");
        var year = $selects.filter(".year").val();
        var month = $selects.filter(".month").val();
        var city = $selects.filter(".city").val();

        globalRequest.queryBaseMonthlyReservedData(true,{"year":year,"month":month,"city":city},function(data){
            var result = data["result"];
            var process = data["process"];

            var resultHtml = "<tr><td colspan='5' style='text-align:center;color:red;height:40px;'>无相关记录</td></tr>";
            var processHtml = "<tr><td colspan='7' style='text-align:center;color:red;height:40px;'>无相关记录</td></tr>";
            if (result.length > 0){
                resultHtml = template('baseMonthlyReservedResultTemplate', {list: result});
            }
            $("div.iMarket_MonthlyReservedBase_Body div table.tableOne tbody").empty();
            $("div.iMarket_MonthlyReservedBase_Body div table.tableOne tbody").append(resultHtml);

            if (process.length > 0){
                processHtml = template('baseMonthlyReservedProcessTemplate', {list: process});
            }
            $("div.iMarket_MonthlyReservedBase_Body div table.tableTwo tbody").empty();
            $("div.iMarket_MonthlyReservedBase_Body div table.tableTwo tbody").append(processHtml);
            $("div.iMarket_MonthlyReservedBase_Body input.queryValue").val(year+","+month+","+city);
        });
    };

    obj.initEvent = function(){
        $("div.iMarket_MonthlyReservedBase_Body button#btnQuery").click(function(){
            obj.initBody();
        });

        $("div.iMarket_MonthlyReservedBase_Body div.downloadBaseMonthlyReserved").click(function(){
            var $selects = $(this).parent().siblings("div.dateSelect").find("select"),$queryOption = $("div.iMarket_MonthlyReservedBase_Body input.queryValue");
            var year = $selects.filter(".year").val();
            var month = $selects.filter(".month").val();
            var cityId = $selects.filter(".city").val();
            if($queryOption.val()){
                var options = $queryOption.val().split(",");
                year = options[0];
                month = options[1];
                cityId = options[2];
            }
            month = month.length<2?("0"+month):month;

            var $downloadFrame = $(this).siblings("div.downloadFrame");
            $downloadFrame.find("input.yearMonth").val(year+month);
            $downloadFrame.find("input.cityId").val(cityId);
            $downloadFrame.find("form")[0].submit();
        });
    };
    return obj;
}();

function onLoadBody(){
    monthlyReservedBase.initData();
    monthlyReservedBase.initBody();
    monthlyReservedBase.initEvent();
}