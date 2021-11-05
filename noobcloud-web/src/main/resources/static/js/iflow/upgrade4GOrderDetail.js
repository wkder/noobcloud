/**
 * Created by DELL on 2017/11/15.
 */


var upgrade4GOrderDetail = function () {
    var queryUpgrade4GOrderDetail = "queryUpGrate4GOrderDetail.view";
    var downloadUpgrade4GOrderDetail = "downloadUpgrade4GOrderDetail.view";
    var obj = {};
    var dataTable;

    // 初始化事件
    obj.initEvent = function () {
        // 查询事件
        $("#orderDetailQueryBtn").click(obj.evtOnRefresh);
        // 导出事件
        $("#orderDetailDownloadBtn").click(function(){
            obj.evtOnDownload(downloadUpgrade4GOrderDetail,obj.getDownloadParam())
        })
    };

    // 初始化查询栏
    obj.initQueryRow = function(){
        var $cityAreaSelect = $(".query-row .queryCityArea"),
            $startTime = $(".query-row #startTime"),
            $endTime = $(".query-row #endTime");
        $startTime.val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));// 昨天
        $endTime.val(new Date().format('yyyy-MM-dd'));// 今天
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $cityAreaSelect.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $cityAreaSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $cityAreaSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    };


    //初始化表格
    obj.dataTableInit = function () {
        var param = obj.getQueryParam();
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: queryUpgrade4GOrderDetail+"?"+param,
                type: "POST"
            },
            columns: [
                {data: "orderId", title: "订单编号", width: 500, className: "dataTableFirstColumns"},
                {data: "cityName", title: "地市", width: 500, className: "centerColumns"},
                {data: "custPhone", title: "用户号码", width: 800, className: "centerColumns"},
                {data: "businessName", title: "办理业务", width: 600, className: "centerColumns"},
                {data: "productName", title: "赠送产品", width: 600, className: "centerColumns"},
                {data: "businessHallCode", title: "受理渠道", width: 600, className: "centerColumns",defaultContent:"-"},
                {data: "businessHallManager", title: "受理账号", width: 600, className: "centerColumns",defaultContent:"-"},
                {data: "openTime", title: "开通时间", width: 600, className: "centerColumns"}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询事件
    obj.evtOnRefresh = function () {
        var param = obj.getQueryParam();
        if(param == "")
        {
            return;
        }
        dataTable.ajax.url(queryUpgrade4GOrderDetail + "?" + param);
        dataTable.ajax.reload();
    };

    // 下载事件
    obj.evtOnDownload = function (url,paramList) {
        if(paramList == ""){
            return;
        }
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm";
        tempForm.method = "POST";
        tempForm.action = url;

        $.each(paramList,function(index,value){
            var input = document.createElement("input");
            input.type = "hidden";
            input.name = value[0];
            input.value = value[1];
            tempForm.appendChild(input);
        });
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    };

    // 获取请求栏的参数
    obj.getQueryParam = function () {
        var param,
            startTime = $(".query-row #startTime"),
            endTime = $(".query-row #endTime"),
            city = $(".query-row  .queryCityArea"),
            userPhone = $(".query-row  #customerPhone"),
            businessHallManagerPhone = $(".query-row  #businessHallManager"),
            detailType = $(".query-row .queryDetailType");
        var endTimeStr = endTime.val()?endTime.val()+" 23:59:59":"",
            startTimeStr = startTime.val()?startTime.val()+" 00:00:00":"";
        param = "startTime="+startTimeStr+"&endTime="+endTimeStr+"&cityArea="+city.val()+"&customerPhone="+userPhone.val()+"&businessHallManager="+businessHallManagerPhone.val()+"&detailType="+detailType.val();
        // 校验日期
        if (startTime.val() > endTime.val()) {
            $html.warning("开始时间不能大于结束时间");
            param = "";
            return param;
        }
        // 校验手机号
        if(userPhone.val().length > 0 && !utils.isPhone(userPhone.val())){
            $html.warning("请输入正确格式的用户号码");
            param = "";
        }
        if(businessHallManagerPhone.val().length > 0 && !utils.isNumber(businessHallManagerPhone.val())){
            $html.warning("请输入正确格式的受理账号号码");
            param = "";
        }
        //param = "startTime="+startTime.val()+"&endTime="+endTime.val()+"&city="+city.val()+"&userPhone="+userPhone.val()+"&businessHallManagerPhone="+businessHallManagerPhone.val();
        return param;
    };

    // 获取下载的参数
    obj.getDownloadParam = function () {
        var param,
            startTime = $(".query-row #startTime"),
            endTime = $(".query-row #endTime"),
            city = $(".query-row  .queryCityArea"),
            userPhone = $(".query-row  #customerPhone"),
            businessHallManagerPhone = $(".query-row  #businessHallManager"),
            detailType = $(".query-row .queryDetailType");
        var endTimeStr = endTime.val()?endTime.val()+" 23:59:59":"",
            startTimeStr = startTime.val()?startTime.val()+" 00:00:00":"";

        param = [
            ["startTime",startTimeStr],
            ["endTime",endTimeStr],
            ["cityArea",city.val()],
            ["customerPhone",userPhone.val()],
            ["businessHallManager",businessHallManagerPhone.val()],
            ["detailType",detailType.val()]
        ];

        if(userPhone.val().length > 0 && !utils.isPhone(userPhone.val())){
            layer.alert("请输入正确格式的用户号码");
            param = "";
        }
        if(businessHallManagerPhone.val().length > 0 && !utils.isPhone(businessHallManagerPhone.val())){
            layer.alert("请输入正确格式的受理账号号码");
            param = "";
        }
        return param;
    };




    return obj;
}();

function onLoadBody() {
    upgrade4GOrderDetail.initQueryRow();
    upgrade4GOrderDetail.initEvent();
    upgrade4GOrderDetail.dataTableInit();
}