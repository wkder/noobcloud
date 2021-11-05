/**
 * Created by Chris on 2017/7/6.
 */
var orderChannel=function () {
    var getOrderChannelUrl="getOrderChannelList.view";
    var dataTable;
    var obj={};

    //初始化时间
    obj.initData=function () {
        $('#orderTime').val(new Date().Format('yyyy-MM-dd'));
    };

    //初始化按钮
    obj.initBtn=function () {
        $('#queryOrderChannel').click(obj.evtOnRefresh);
    };

    //初始化表格
    obj.initTable=function () {
        var param=getParam();
        var $paging = $(".paging_select");
        var data ="orderTime="+param.orderTime+"&flag="+param.flag+"&orderYear="+param.orderYear+"&orderMon="+param.orderMon;
        $paging.find(".day").append('('+param.orderMon+'月'+param.orderDay+'日'+')');
        $paging.find(".mon").append('('+param.orderYear+'年'+param.orderMon+'月'+')');

        dateChange(param);//初始化时，实现点击插件弹窗

        var option={
            ele:$('#dataTable'),
            destroy:true,
            bRetrieve: true,
            ajax: {
                url:getOrderChannelUrl+"?"+data,
                type:"POST"
            },
            columns:[
                {data:"rowid",title: "序号", width: 200, className: "dataTableFirstColumns"},
                {data:"orderchannel",title: "订购渠道", width: 400, className: "centerColumns"},
                {data:"ordernum",title: "订购次数", width: 400, className: "centerColumns"},
                {data:"succnum",title: "成功次数", width: 400, className: "centerColumns"},
                {data:"succrate",title: "成功率", width: 400, className: "centerColumns",type: "ratio"},
                {data:"orderusernum",title: "订购用户数", width: 400, className: "centerColumns"},
                {data:"succusernum",title: "成功用户数", width: 400, className: "centerColumns"},
                {data:"succuserrate",title: "用户成功率", width: 400, className: "centerColumns"},
                {data:"orderchannelrate",title: "订购渠道百分比", width: 400, className: "centerColumns"}
            ]
        };
        dataTable=$plugin.iCompaignTable(option);
    };

    obj.evtOnRefresh=function () {
        var param=getParam();
        var $paging = $(".paging_select");
        var data ="orderTime="+param.orderTime+"&flag="+param.flag+"&orderYear="+param.orderYear+"&orderMon="+param.orderMon;

            $paging.find(".day").empty();
            $paging.find(".mon").empty();
            $paging.find(".day").append(param.orderDay?'('+param.orderMon+'月'+param.orderDay+'日'+')':'('+param.orderMon+'月)');
            $paging.find(".mon").append('('+param.orderYear+'年'+param.orderMon+'月'+')');

        dataTable.ajax.url(getOrderChannelUrl+"?"+data);
        dataTable.ajax.reload();
    };

    //初始化分页事件
    obj.initEvent=function () {
        $(".paging_select span").click(function () {
            $(this).siblings("span").removeClass("active");
            $(this).addClass("active");

            var param=getParam();
            dateChange(param);
        });
    };

    //分页切换，更改日期状态
    function dateChange(type){
        if(type != undefined && type != ''){
            var oTime =  $('#orderTime').val();
            var d = Date.parse(oTime);
            var newDate = new Date(d);
            if(type.flag=='month')
            {
                $('#orderTime').val(newDate.Format('yyyy-MM'));
                $('#orderTime').unbind('focus');
                $('#orderTime').bind('focus',
                    function () {WdatePicker({isShowWeek:false,isShowToday:false,isShowClear:false,readOnly:true, dateFmt: 'yyyy-MM', autoPickDate: true,maxDate:'%y-%M-%d' });});
            }
            else if(type.flag=='day')
            {
                $('#orderTime').val(newDate.Format('yyyy-MM-dd'));
                $('#orderTime').unbind('focus');
                $('#orderTime').bind('focus', function () {WdatePicker({isShowWeek:false,isShowToday:true,isShowClear:false,readOnly:true, dateFmt: 'yyyy-MM-dd', autoPickDate: true });});
            }
        }
        else {
            $html.warning('分页操作失败！');
        }

    };

    //获取时间参数
    function getParam() {
        return{
            orderTime:$('#orderTime').val().replace(/-/g,""),
            orderYear:$('#orderTime').val().replace(/-/g,"").substring(0,4),
            orderMon:$('#orderTime').val().replace(/-/g,"").substring(4,6),
            orderDay:$('#orderTime').val().replace(/-/g,"").substring(6,8),
            flag:$(".paging_select ").find(".query_day").hasClass("active") == true ? 'day' : 'month'
        }
    };

    return obj;
}();

function onLoadBody() {
    orderChannel.initData();
    orderChannel.initTable();
    orderChannel.initBtn();
    orderChannel.initEvent();
}


//Format()函数
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
