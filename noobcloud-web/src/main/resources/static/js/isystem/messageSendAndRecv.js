/**
 * Created by DELL on 2017/5/15.
 */

var messageSendAndRecv = function(){
    var obj = {};
    var dataTable;
    var getUrl = "queryMessageSendAndRecv.view";
    obj.dataTableInit = function(){
        var phoneNum = $.trim($("phoneNum").val());
        var phone = utils.isPhone(phoneNum)?phoneNum:function(){$html.success("请输入正确格式的手机号码");return ""}() ;
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?phone=" + $("#phoneNum").val(), type: "POST"},
            columns: [
                {data: "rows", title: "#", width: 30,className: "dataTableFirstColumns"},
                {data: "message", title: "短信内容", width: 220},
                {data: "spnum", title: "接入号", width: 80},
                {
                    data: "type", title: "用户操作", width: 80,
                    render: function (data, type, row) {
                        if(data == 0){
                            return "<span style='color: #ffffff;padding: 3px 8px;background-color: #00B38B'>发送</span>"
                        }else if(data == 1){
                            return "<span style='color: #ffffff;padding: 3px 8px;background-color: #006699'>接受</span>"
                        }
                    }
                },
                {
                    data:"time",title: "操作时间", width: 100,
                    render: function (data, type, row) {
                        var date = data.toString();
                        if(date.length=14){
                            return date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6,8) + " " + date.substring(8,10) + ":" +date.substring(10,12) + ":" + date.substring(12,14);
                        }else{
                            return data;
                        }
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };


    obj.initEvent = function(){
        $("#btnQuery").click(function(){
            var phone = $.trim($("#phoneNum").val());
            if(utils.isPhone(phone)){
                var param = "phone="+phone;
                $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + param);
            }else{
                $html.success("请输入正确的手机号格式");
            }
        });
    };
    return obj;
}();

function onLoadBody(){
    messageSendAndRecv.dataTableInit();
    messageSendAndRecv.initEvent();
}
