/**
 * Created by Administrator on 2016/11/28.
 */

var stockUserIncome = function(){
    var obj = {};

    obj.initStockUserIncome = function(){
        globalRequest.queryStockUserIncomeData(true,{},function(data){
            var htmlOne = template('stockUserIncomeTemplate', {list: data,display:"TableOne"});
            $("div.iMarket_StockUserIncome_Body div.incomeTable table.tableOne tbody").empty();
            $("div.iMarket_StockUserIncome_Body div.incomeTable table.tableOne tbody").append(htmlOne);

            var htmlTwo = template('stockUserIncomeTemplate', {list: data,display:"TableTwo"});
            $("div.iMarket_StockUserIncome_Body div.incomeTable table.tableTwo tbody").empty();
            $("div.iMarket_StockUserIncome_Body div.incomeTable table.tableTwo tbody").append(htmlTwo);
        },function(){
            $html.warning("遇到异常，数据加载失败");
        });
    };

    obj.initEvent = function()
    {
        $("div.iMarket_StockUserIncome_Body div.downloadIncomeSituation").click(function(){
            var $downloadFrame = $(this).siblings("div.downloadFrame");
            $downloadFrame.find("form")[0].submit();
        });
    };

    return obj;
}();

function onLoadBody(){
    stockUserIncome.initStockUserIncome();
    stockUserIncome.initEvent();
}