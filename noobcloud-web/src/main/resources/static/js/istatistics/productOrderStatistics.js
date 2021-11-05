/**
 * Created by Chris on 2017/7/24.
 */

var productOrderStatistics = function () {
    var getProductOrderStatisticsUrl="queryProductOrderStatisticsByPage.view";
    var obj={};
    var dataTable;

    obj.initBody=function () {
        // var pageInfo = {
        //     itemCounts:0,
        //     items : {}
        // };
        var startTime=$("#startTime").val();
        var endTime=$("#endTime").val();
        var areaValue=$("#qryBaseAreas").val();

        var paras ="startTime="+startTime+"&endTime="+endTime+"&areaValue="+areaValue;
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getProductOrderStatisticsUrl+"?"+ paras,
                type: "POST"
            },
            columns: [
                {data: "product_code"},
                {data: "product_name"},
                {data: "order_num"},
                {data: "succ_num"},
                {data: "succ_rate"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);


        // globalRequest.queryProductOrderStatisticsByPage(true,paras,function(data){
        //     pageInfo.itemCounts=data.itemCounts;
        //     pageInfo.items = data.items;
        //     createPageBody();
        //     initPagination();
        // },function(){
        //     layer.alert("系统异常",{icon: 6});
        // });
        // function createPageBody(){
        //
        //     var html = "<tr><td colspan='6'><div class='noData'>暂无相关数据</div> </td></tr>";
        //     if (pageInfo.items.length > 0){
        //         html = template('productOrderStatisticsTemplate', {list:pageInfo.items});
        //     }
        //     $("#dataTable tbody tr").remove();
        //     $("#dataTable tbody").append(html);
        // };

        // function initPagination(){
        //     $("#pagination").pagination({
        //         items: pageInfo.itemCounts,
        //         itemsOnPage: 10,
        //         displayedPages:10,
        //         cssStyle: 'light-theme',
        //         prevText:"<上一页",
        //         nextText:"下一页>",
        //         onPageClick:function(pageNumber){
        //             paras.curPage = pageNumber;
        //             globalRequest.queryProductOrderStatisticsByPage(true,paras,function(data){
        //                 pageInfo.itemCounts=data.itemCounts;
        //                 pageInfo.items = data.items;
        //                 createPageBody();
        //             });
        //         }
        //     })
        // };
    };

    //获取地市信息
    obj.initCity=function () {
        globalRequest.queryMarketAreas(true,{},function(data){
            var cityArray = [];
            for (var index in data){
                cityArray.push("<option value='"+data[index].id+"'>"+data[index].name+"</option>");
            }
            $("#qryBaseAreas").append(cityArray);
        },function(){
            layer.alert("系统异常",{icon: 6});
        });
    };

    obj.initEvents=function () {
        $("#btnQuery").click(function(){
            var startTime=$("#startTime").val();
            var endTime=$("#endTime").val();
            var areaValue=$("#qryBaseAreas").val();
            verifyDate();
            //if (startTime!=""&&endTime!="") {
            //    var startT=startTime.replace("-","").substring(0,8);
            //    var endT=endTime.replace("-","").substring(0,8);
            //
            //    if (startT>endT) {
            //        layer.alert("起始时间请勿大于结束时间",{icon: 6});
            //    }
            //}

            var paras ="startTime="+startTime+"&endTime="+endTime+"&areaValue="+areaValue;
            dataTable.ajax.url(getProductOrderStatisticsUrl+"?"+paras);
            dataTable.ajax.reload();

            // obj.initBody({"startTime":$("#startTime").val(),"endTime":$("#endTime").val(),"areaValue":$("#qryBaseAreas").val()});
        });
    };

    //时间校验
    function verifyDate(){
        var startTime = $.trim($("#startTime").val()),
            endTime = $.trim($("#endTime").val());
        if(startTime.getDateNumber() - endTime.getDateNumber() > 0){
            layer.alert("起始日期请勿大于截止日期", {icon: 6});
            return;
        }
    }

    return obj;
}();

function onLoadBody(){
    productOrderStatistics.initBody();
    productOrderStatistics.initCity();
    productOrderStatistics.initEvents();
}