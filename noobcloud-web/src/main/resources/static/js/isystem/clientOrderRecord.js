/**
 * Created by DELL on 2017/5/16.
 */

var clientOrderRecord = function(){
    var obj = {};
    var dataTable;
    var getUrl = "queryClientOrderRecord.view";
    obj.initData = function(){
        $('#dateTime').val(new Date().format('yyyy-MM'));
        $("#phoneNum").val("");
    };

    obj.dataTableInit = function () {
        var dateTime = $.trim($("#dateTime").val()).replace(/[\-]/g,'');
        var phoneNum = $("#phoneNum").val();
        var phone = utils.isPhone(phoneNum)?phoneNum:function(){$html.success("请输入正确格式的手机号码");return ""}() ;
        var param = "dateTime="+dateTime+"&phone="+phone;
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?" + param, type: "POST"},
            columns: [
                {data: "rows", title: "#", width: 40,className: "dataTableFirstColumns"},
                {data: "name", title: "产品名称", width: 100},
                {data: "productcode", title: "产品编码", width: 100},
                {
                    data: "orderchannel", title: "订购渠道", width: 100
                },
                {
                    data:"ordertime",title: "订购时间", width: 120,
                    render: function (data, type, row) {
                        var date = data.toString();
                        if(date.length=14){
                            return date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8) + " " + date.substring(8,10) + ":" +date.substring(10,12) + ":" + date.substring(12,14);
                        }else{
                            return data;
                        }
                    }
                },
                {
                    data:"orderip",title:"订购ip",width: 100
                },
                {
                    data:"resultcode",title:"订购状态",width: 100,
                    render:function(data, type, row){
                        if(data=='00000'){
                            return "<span style='color: #ffffff;padding: 3px 8px;background-color: #00B38B'>订购成功</span>";
                        }else{
                            return "<span style='color: #ffffff;padding: 3px 8px;background-color: #ff0000'>订购失败</span>";
                        }
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);

    };

    obj.initEvent = function(){
        $("#btnQuery").click(function(){
                var date = $("#dateTime").val();
                var phoneNum = $("#phoneNum").val();
                if(utils.isPhone(phoneNum)){
                    if(date){
                        var dateTime = $.trim(date).replace(/[\-]/g,'');
                        var param = "dateTime="+dateTime+"&phone="+phoneNum;
                        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + param);
                    }else{
                        $html.success("请选择要查询的月份");
                    }
                }else{
                    $html.success("请输入正确格式的手机号码");
                }
            }
        )
    };

    return obj;
}();

function onLoadBody(){
    clientOrderRecord.initData();
    clientOrderRecord.dataTableInit();
    clientOrderRecord.initEvent();
}