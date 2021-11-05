/**
 * Created by Chris on 2017/6/26.
 */
var FirstLogin4G = function() {
    var getFirstLoginUrl = "getFirstLogin4GList.view";
    var dataTable;
    var obj={};

    //初始化日期
    obj.initData = function() {
        $('#startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('#endTime').val(new Date().getDelayDay(0).format('yyyy-MM-dd'));
    }


    //初始化按钮操作
    obj.initBtn=function(){
        $("#queryFirstLogin").click(obj.evtOnRefresh);

    };

    //初始化表格
    obj.dataTableInit=function(){
        var param = getParam();
        var data1 = "startTime="+param.startTime+"&endTime="+param.endTime;
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getFirstLoginUrl+"?"+data1,
                type: "POST"
            },
            columns: [
                {data: "date", title: "日期", width: 400, className: "dataTableFirstColumns"},
                {data: "type", title: "场景类型", width: 300, className: "centerColumns"},
                {data: "condition", title: "场景条件", width: 800, className: "centerColumns"},
                {data: "catchnum", title: "捕捉用户数", width: 600, className: "centerColumns"},
                {data: "giftnum", title: "产品赠送用户数", width: 600, className: "centerColumns"},
                {data: "sendnum", title: "短信下发用户数", width: 600, className: "centerColumns"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };


    obj.evtOnRefresh=function(){
        var param = getParam();
        var data1 = "startTime="+param.startTime+"&endTime="+param.endTime;
        if(param.startTime.getDateNumber() - param.endTime.getDateNumber() > 0){
            layer.alert("起始日期请勿大于截止日期", {icon: 6});
            return;
        }
        dataTable.ajax.url(getFirstLoginUrl+"?"+data1);
        dataTable.ajax.reload();
    };

    //获取时间参数
    function getParam(){
            return {
            startTime : $("#startTime").val().replace(/-/g,""),
            endTime : $("#endTime").val().replace(/-/g,"")
        }
    }

    return obj;
}();

function onLoadBody() {
    FirstLogin4G.initData();
    FirstLogin4G.dataTableInit();
    FirstLogin4G.initBtn();
}