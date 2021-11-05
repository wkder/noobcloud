/**
 * Created by Administrator on 2016/11/28.
 */
var monthlyReserved = function(){
    var obj = {};

    obj.initData = function(){
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth();
        var years = [];
        var $yearSelect = $("div.iMarket_MonthlyReserved_Body div.dateSelect select.year");
        var $monthSelect = $("div.iMarket_MonthlyReserved_Body div.dateSelect select.month");
        for (var year = 2000;year<2051;year++){
            years.push("<option value='A'>A年</option>".replace(/A/g,year));
        }
        $yearSelect.append(years);
        $yearSelect.val(currentYear);
        $monthSelect.val(currentMonth);
    }

    obj.initBody = function(){
        var $yearSelect = $("div.iMarket_MonthlyReserved_Body div.dateSelect select.year");
        var $monthSelect = $("div.iMarket_MonthlyReserved_Body div.dateSelect select.month");
        var $queryOption = $("div.iMarket_MonthlyReserved_Body div.dateSelect input.queryValue");
        var year = $yearSelect.val();
        var month = $monthSelect.val();
        $queryOption.val(year+","+month);

        globalRequest.queryMonthlyReservedData(true,{"year":year,"month":month},function(data){
            var html = "<tr><td colspan='13' style='text-align:center;color:red;height:40px;'>无相关记录</td></tr>";
            if (data.length > 0){
                html = template('monthlyReservedTemplate', {list: data});
            }
            $("div.iMarket_MonthlyReserved_Body div.monthlyData tbody").empty();
            $("div.iMarket_MonthlyReserved_Body div.monthlyData tbody").append(html);
        });
    }

    obj.initEvent = function(){
        $("div.iMarket_MonthlyReserved_Body button#btnQuery").click(function(){
            obj.initBody();
        });

        $("div.iMarket_MonthlyReserved_Body div.downloadMonthlyReserved").click(function(){

            var $selects = $(this).parent().siblings("div.dateSelect").find("select"),$queryOption = $("div.iMarket_MonthlyReserved_Body .dateSelect input.queryValue");;
            var year = $selects.filter(".year").val();
            var month = $selects.filter(".month").val();
            if($queryOption.val()){
                var yearMonth = $queryOption.val().split(",");
                year = yearMonth[0];
                month = yearMonth[1];
            }
            month = month.length<2?("0"+month):month;

            var $downloadFrame = $(this).siblings("div.downloadFrame");
            $downloadFrame.find("input").val(year+month);
            $downloadFrame.find("form")[0].submit();
        });
    };
    return obj;
}();
function onLoadBody(){
    monthlyReserved.initData();
    monthlyReserved.initBody();
    monthlyReserved.initEvent();
}