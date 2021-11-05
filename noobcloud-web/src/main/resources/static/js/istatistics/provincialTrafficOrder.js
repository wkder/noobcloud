/**
 * Created by Chris on 2017/6/20.
 */
/**
 * Created by DELL on 2017/6/18.
 */

var ProvincialTrafficOrder = function(){
    var obj = {};

    obj.initDate = function(){
        $('.startTime').val(new Date().getDelayDay(-8).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    };

    obj.initBody = function(){
        var param = getParam();
        var pageInfo = {
            itemCounts: 0,
            items: {}
        };
        globalRequest.queryProvincialTrafficOrder(true,param,function(data){
            pageInfo.itemCounts = data.itemCounts;
            pageInfo.items = data.items;
            initData();
            initPagination();
        },function(){
            $html.warning("载入数据异常,请稍后再试")
        });

        function initPagination() {
            $("#dataTable .pagination").pagination({
                items: pageInfo.itemCounts,
                itemsOnPage: 10,
                displayedPages: 10,
                cssStyle: 'light-theme',
                prevText: "<上一页",
                nextText: "下一页>",
                onPageClick: function (pageNumber) {
                    param.curPage = pageNumber;
                    globalRequest.queryProvincialTrafficOrder(true, param, function (data) {
                        pageInfo.itemCounts = data.itemCounts;
                        pageInfo.items = data.items;
                        initData();
                    });
                }
            });
        }

        function initData(){
            if(pageInfo.items && pageInfo.items.length>0){
                var html = template("provincialTrafficOrder",{list: pageInfo.items});
                $("#dataTable tbody tr").remove();
                $("#dataTable tbody").append(html);
            }
            if (pageInfo.items && pageInfo.items.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("#dataTable tbody tr").remove();
                $("#dataTable tbody").append(html);
            }
        };

    };

    obj.initData = function(data){
        if(data.items && data.items.length>0){
            var html = template("provincialTrafficOrder",{list: data.items});
            $("#dataTable tbody tr").remove();
            $("#dataTable tbody").append(html);
        }
        if (data.items && data.items.length == 0) {
            var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
            $("#dataTable tbody tr").remove();
            $("#dataTable tbody").append(html);
        }
    };



    //初始化按钮事件
    obj.initEvent = function(){
        $("#queryDailyReport").click(function(){
            verifyDate();
            obj.initBody();
        });

        //下载
        $("#exportBaseButton").click(function(){
            var reportType = 3;//代表全省日报
            var param = getParam();
            param['reportType'] = reportType;
            $util.exportFile("downloadTrafficOrder.view",param);
        });
    };

    //获取时间参数
    function getParam(){
        return {
            startTime : $("#startTime").val().replace(/-/g,""),
            endTime : $("#endTime").val().replace(/-/g,""),
            curPage: 1,
            countsPerPage: 10
        }
    }

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
    ProvincialTrafficOrder.initDate();
    ProvincialTrafficOrder.initBody();
    ProvincialTrafficOrder.initEvent();
}
