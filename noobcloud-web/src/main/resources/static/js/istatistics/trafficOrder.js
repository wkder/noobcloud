/**
 * Created by DELL on 2017/6/18.
 */

var trafficOrder = function(){
    var obj = {},reportType;

    obj.initDate = function(){
        $('.startTime').val(new Date().getDelayDay(-8).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    };

    obj.initBody = function(){
        var param = getParam();
        globalRequest.queryDailyTrafficOrder(true,param,function(data){
            obj.initData(data);
            reportType  = 1;
        },function(){
           $html.warning("载入数据异常,请稍后再试")
        });
    };
    obj.initData = function(data){
        if(data.items && data.items.length>0){
            var html = template("trafficOrder",{list: data.items});
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
      $("#queryMonthlyReport").click(function(){
          verifyDate();
          var param = getParam();
          globalRequest.queryMonthlyTrafficOrder(true,param,function(data){
              obj.initData(data);
              reportType = 2;
          },function(){
              $html.warning("载入数据异常,请稍后再试")
          });
      });
      //下载
      $("#exportBaseButton").click(function(){
          var param = getParam();
          param['reportType'] = reportType;//1 代表日报，2 代表月报,3 代表全省
          $util.exportFile("downloadTrafficOrder.view",param);
      });
    };

    //获取时间参数
    function getParam(){
        return {
            startTime : $("#startTime").val().replace(/-/g,""),
            endTime : $("#endTime").val().replace(/-/g,"")
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
    trafficOrder.initDate();
    trafficOrder.initBody();
    trafficOrder.initEvent();
}
