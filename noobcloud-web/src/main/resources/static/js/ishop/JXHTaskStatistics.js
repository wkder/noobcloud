/**
 * Created by DELL on 2017/6/14.
 */

var jxhTaskStatistics  = function(){
    var obj = {},dataTable,
        getUrl="queryJXHTaskStatistic.view";

    obj.initData = function(){
        $('.startTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
        $('.endTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
        $("#taskName").val("");
        $("#marketType").val("all");
        $("#businessType").val("-1")
    };

    obj.dataTableInit = function(){
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl,
                data:function(d){
                    var param = {
                        startTime : $.trim($("#startTime").val()),
                        endTime : $.trim($("#endTime").val()),
                        taskName : $.trim($("#taskName").val()),
                        marketType : $("#marketType").val(),
                        businessType : $("#businessType").val()
                    };
                    var data = $.extend({},d,param);
                    return data;
                },
                type: "POST"
            },
            lengthChange:true,
            columns: [
                {data: "date", title: "日期", width: 40 ,className:"dataTableFirstColumns"},
                {data: "taskName", title: "任务名称", width: 80},
                {data: "marketType", title: "来源", width: 60,
                    render:function(data, type, row){
                        switch(data){
                            case 'sms' : return  "自建群发任务";
                            case 'scenesms' : return  "自建场景任务";
                            case 'jxhsms' : return  "精细化群发任务";
                            case 'jxhscene' : return  "精细化场景任务";
                            default : return ""
                        }
                    }},
                {data: "businessType", title: "业务类型", width: 60,
                    render:function(data,type,row){
                        switch(data){
                            case 1 : return  "互联网综合任务";
                            case 2 : return  "内容营销";
                            case 3 : return  "流量经营";
                            case 4 : return  "APP场景营销";
                            default : return ""
                        }
                }},
                {data: "targetUser", title: "目标用户", width: 60,
                    render:function(data,type,row){
                        if(data == '' || data == null){
                            return "全网监控"
                        }else{
                            return $.trim(data);
                        }
                        //var arry = data.split(",")
                        //if(arry.length>1){
                        //
                        //}else{
                        //    return arry[0];
                        //}
                }},
                {data: "marketContent", title: "短信内容", width: 120},
                {data: "smsSend", title: "短信发送人数", width: 40,defaultContent:0},
                {data: "smsRecv", title: "短信到达人数", width: 40,defaultContent:0},
                {data: "smsRate", title: "短信到达率", width: 40}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.initEvent= function(){
        $("#queryButton").click(function(){
            var startTime = $.trim($("#startTime").val()),
                endTime = $.trim($("#endTime").val());
            if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
                layer.alert("开始时间请勿大于结束时间", {icon: 6});
                return;
            }
            dataTable.ajax.reload();
        });

        $("#exportBaseButton").click(function(){
            obj.exportData("downloadJXHTaskStatistics.view", obj.getParams());
        });
    };

    obj.getParams = function(){
        var paramList = [
            ["startTime", $("#startTime").val()],
            ["endTime", $("#endTime").val()],
            ["taskName", $.trim($("#taskName").val())],
            ["marketType", $("#marketType").val()],
            ["businessType", $("#businessType").val()]
        ];
        return paramList;
    };




    // 导出数据
    obj.exportData = function (url, params) {
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm";
        tempForm.method = "POST";
        tempForm.action = url;

        $.each(params, function (idx, value) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = value[0];
            input.value = value[1];
            tempForm.appendChild(input);
        });
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    };
    return obj;
}();


function onLoadBody(){
    jxhTaskStatistics.initData();
    jxhTaskStatistics.dataTableInit();
    jxhTaskStatistics.initEvent();
}
