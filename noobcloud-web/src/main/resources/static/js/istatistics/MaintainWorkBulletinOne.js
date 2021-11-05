/**
 * Created by Chris on 2017/7/20.
 */

var MaintainWorkBulletinOne=function () {
    var getMaintainWorkBulletinOne = "queryMaintainWorkBulletin.view";
    var obj={};
    var dataTable;

    obj.initDate=function () {
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth()+1;
        var years = [];
        var $yearSelect = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect select.year");
        var $monthSelect = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect select.month");
        for (var year = 2000;year<2051;year++){
            years.push("<option value='A'>A年</option>".replace(/A/g,year));
        }
        $yearSelect.append(years);
        $yearSelect.val(currentYear);
        $monthSelect.val(currentMonth);
    };

    obj.initBody=function () {
        var $yearSelect = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect select.year");
        var $monthSelect = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect select.month");
        var $queryOption = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect input.queryValue");
        var year = $yearSelect.val();
        var month = $monthSelect.val();month = month.length<2?("0"+month):month;
        var yearMonth = year + month;
        var data = "yearMonth=" + yearMonth;
        $queryOption.val(yearMonth);

        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getMaintainWorkBulletinOne+"?"+ data ,
                type: "POST"
            },
            paging: false,
            columns: [
                {data: "cityName"},
                {data: "feeRate"},
                {data: "uvRate"},
                {data: "feeTwoRate"},
                {data: "uvTwoRate"},
                {data: "twoGWang"},
                {data: "fourGWang"},
                {data: "twoZhongd"},
                {data: "fourZhongd"},
                {data: "arpu"},
                {data: "cha"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.initEvent=function () {
        $("div.iMarket_MaintainWorkBulletin_Body div.maintainWorkBulletinQueryBtn").click(function(){
            var $yearSelect = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect select.year");
            var $monthSelect = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect select.month");
            var $queryOption = $("div.iMarket_MaintainWorkBulletin_Body div.dateSelect input.queryValue");
            var year = $yearSelect.val();
            var month = $monthSelect.val();month = month.length<2?("0"+month):month;
            var yearMonth = year + month;
            var data = "yearMonth=" + yearMonth;
            $queryOption.val(yearMonth);
            dataTable.ajax.url(getMaintainWorkBulletinOne+"?"+data);
            dataTable.ajax.reload();
        });

        $("div.iMarket_MaintainWorkBulletin_Body div.downloadMaintainWorkBulletin").click(function(){
            var $selects = $(this).siblings().find("select")
            var $queryOption = $("div.iMarket_MaintainWorkBulletin_Body .dateSelect input.queryValue");
            var year = $selects.filter(".year").val();
            var month = $selects.filter(".month").val();
            month = month.length<2?("0"+month):month;
            var yearMonth = year + month;
            $queryOption.val(yearMonth);
            // if($queryOption.val()){
            //     yearMonth = $queryOption.val();
            // }else{
            //     yearMonth = year + month;
            // }
            var $downloadFrame = $(this).siblings("div.downloadFrame");
            $downloadFrame.find("input").val(yearMonth);
            $downloadFrame.find("form")[0].submit();
        });
    };

    return obj;
}();
function onLoadBody() {
    MaintainWorkBulletinOne.initDate();
    MaintainWorkBulletinOne.initBody();
    MaintainWorkBulletinOne.initEvent();
}