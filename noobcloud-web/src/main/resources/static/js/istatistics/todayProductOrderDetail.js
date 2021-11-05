/**
 * Created by DELL on 2017/7/6.
 */

var todayProductOrderDetail = function () {
    var obj = {},
        dataTable,
        secondRowObj = {},
        getFirstLevel = "getProductOrderFirstLevel.view",
        //getSecondLevel = "getProductOrderSecondLevel.view",
        getFactoryName = "getProductOrderFactoryName.view",
        getChannelName = "getProductOrderChannelName.view",
        getProductOrderDetail = "queryProductOrderDetailByPage.view",
        getTodayProductOrderDetail = "queryTodayProductOrderDetailByPage.view";
    var $first= $(".firstLevel"), // 产品类别
        //$second = $(".secondLevel"),
        $factory = $(".manufacturer"),
        $channel = $(".channels"),
        $city = $(".city"),
        $downloadBtn = $("#exportProductOrderBtn");
    var options = "<option value='AA'>BB</option>";
    /**
     * 根据页签获取查询的类型  默认为 1
     * 1：当日订购
     * 2：截止到当日
     */
    var queryType = 1;

    //初始化查询条件栏
    obj.initQueryRow = function () {
        $("#orderTime").val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
        $first.append("<option value='99999' selected>请选择产品类别</option>");
        //$second.append("<option value='99999' selected>全部类别</option>");
        $factory.append("<option value='99999' selected>请选择营销厂家</option>");
        $channel.append("<option value='99999' selected>请选择订购渠道</option>");

        //初始化地市
        globalRequest.queryProductOrderCity(false,{},function(d){
            for (var i = 0, j = d.length; i < j; i++) {
                $city.append(options.replace(/AA/g,d[i]["cityCode"]).replace(/BB/g,d[i]["cityName"]));
                $(".city option[value='99999']").attr("selected",true);
            }
        },queryErr);
        //初始化一级类别
        $util.ajaxPost(getFirstLevel, {}, function (d) {
            for (var i = 0, j = d.length; i < j; i++) {
                $first.append(options.replace(/AA/g,d[i].id).replace(/BB/g,d[i].name))
            }
        }, queryErr);
        //初始化营销厂家
        $util.ajaxPost(getFactoryName, {}, function (d) {
            for (var i = 0, j = d.length; i < j; i++) {
                $factory.append(options.replace(/AA/g,d[i].name).replace(/BB/g,d[i].name))
            }
        }, queryErr);

    };

    //初始化表格
    obj.initDataTable = function(){
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getTodayProductOrderDetail,
                /*data:function(d){
                    var newData = $.extend({},d,obj.getParam());
                    return newData;
                },*/
                type: "POST"
            },
            lengthChange:true,
            columns: [
                {data: "productName", title: "产品名称", width: 70 ,className:"dataTableFirstColumns"},
                {data: "productCode", title: "产品编码", width: 70},
                {data: "productPrice", title: "资费", width: 30},
                {data: "orderNum", title: "订购次数", width: 50},
                {data: "succNum", title: "成功次数", width: 50},
                {data: "orderUser", title: "订购用户数", width: 50},
                {data: "succUser", title: "成功用户数", width: 50},
                {data: "succRate", title: "成功率", width: 50},
                {data: "totalPrice", title: "总额", width: 50},
                {data: "factoryName", title: "营销厂家", width: 60},
                {data: "channel", title: "订购渠道", width: 60}
                /*{title: "操作", width: 50,
                    render:function(data,type,row){
                        var rowObj = JSON.stringify(row);
                       return "<span style='color: red;cursor: pointer' class='errorLog' onclick='productOrderDetail.showErrLog("+rowObj+")'>操作日志</span>"
                    }}*/
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 获取条件栏的参数
    obj.getParam = function(){
      return {
          OrderTime:formatTime($("#orderTime").val()),
          firstLevel:$first.val(),
          //secondLevel:$second.val(),
          factoryName:$factory.val(),
          channelName:$channel.val(),
          city:$city.val(),
          type:queryType
      }
    };

    obj.getDownloadParam = function(){
        return [
            ["OrderTime",formatTime($("#orderTime").val())],
            ["firstLevel",$first.val()],
            ["factoryName",$factory.val()],
            ["channelName",$channel.val()],
            ["city",$city.val()],
            ["type",queryType]
        ]
    };


    //修改日期格式
    function formatTime(t){
        if(t){
           return t.replace(/-/g,'');
        }
    }

    //第一层弹窗展示
    obj.showErrLog = function(rowObj){
        secondRowObj = rowObj;
        var $dialog = $("#dialogPrimary").empty();
        var $all = $(".iMarket_Content").find("div.showErrorContentInfo").clone();
        $dialog.empty().append($all);
        var timeSet = rowObj.timest,
            productCode = rowObj.productcode,
            channel = rowObj.channelid,
            productName = rowObj.productname,
            param = "timeSet="+timeSet+"&productCode="+productCode+"&channel="+channel
            ;
        var firstDialogDataTable,url="queryErrorLogByPage.view";
        initData();

        function initData(){
            var options = {
                ele: $dialog.find('table.errorLogTab'),
                ajax: {url: url+"?"+param, type: "POST"},
                columns: [
                    {data: "result_code", title: "状态代码", width: "42%", className: "dataTableFirstColumns"},
                    {data: "result_description", title: "状态描述", width: "30%", className: "centerColumns"},
                    {data: "operatetimes", title: "操作次数", width: "20%", className: "centerColumns"},
                    {title: "操作", width: "20%", className: "centerColumns",
                        render:function(data,type,row){
                            return "<span style='color: red;cursor: pointer' class='errorLog' onclick='productOrderDetail.showUser(\""+row.result_code+"\",\""+row.result_description+"\")'>查看用户</span>"
                        }
                    }
                ]
            };
            firstDialogDataTable = $plugin.iCompaignTable(options);

        }

        obj.initEvent = function(){
            globalRequest.queryTodayProductOrderDetailByPage(true, {
                /*taskId: id,
                auditResult: decision,
                remarks: reason,
                taskName: taskName,*/
                start: 0,
                length: 10
            }, function (res) {
                if (res.retValue != 0) {
                    layer.alert(res.desc, {icon: 6});
                }
                dataTable.ajax.reload();
                layer.close(index);
                layer.msg(res.desc, {time: 1000});
            }, function () {
                layer.alert('操作数据库失败');
            });
            /*// 查询
            $dialog.find(".errorLogSearchBtn").click(function(){
                var params = param;
                params += "&resultCode="+ $.trim($dialog.find(".qryContentInfo").val())+"&resultDescription="+$.trim($dialog.find(".qryKeyInfo").val());
                $plugin.iCompaignTableRefresh(firstDialogDataTable, url + "?" + params);
            });
            // 下载
            $dialog.find(".errorLogDownloadBtn").click(function(){
                var params = param;
                params += "&resultCode="+ $.trim($dialog.find(".qryContentInfo").val())+"&resultDescription="+$.trim($dialog.find(".qryKeyInfo").val());
            });*/
        }

        layer.open({
            type: 1,
            shade: 0.3,
            title: productName?productName:''+'错误日志',
            offset: '70px',
            area: ['1000px', '700px'],
            content: $dialog,
            closeBtn: 0,
            btn: ["关闭"],
            yes: function (index, layero) {
                layer.close(index);
            }
        });


    };

    // 第二级弹窗
    obj.showUser = function(resultCode,resultDesc){
        var $dialog = $("#dialogMiddle").empty();
        var $all = $(".iMarket_Content").find("div.showUserInfo").clone();
        $dialog.empty().append($all);
        var timeSet = secondRowObj.timest,
            productCode = secondRowObj.productcode,
            channel = secondRowObj.channelid,
            secondDialogDataTable,url="queryUserInfoByPage.view";
        function getSecondDialogParam(){
            return {
                timeSet : secondRowObj.timest,
                productCode : secondRowObj.productcode,
                channel : secondRowObj.channelid,
                resultDesc:resultDesc,
                resultCode:resultCode,
                operateType:$dialog.find(".qryContentInfo").val()?$dialog.find(".qryContentInfo").val():"",
                userPhone:$dialog.find(".qryKeyInfo").val()?$dialog.find(".qryKeyInfo").val():""
            }
        }

        initData();

        function initData() {
            var options = {
                ele: $dialog.find('table.userInfoTab'),
                ajax:{
                    url: url,
                    data:function(d){
                        var newData = $.extend({},d,getSecondDialogParam());
                        return newData;
                    },
                    type: "POST"
                },
                columns: [
                    {data: "phone", title: "状态代码", width: "42%", className: "dataTableFirstColumns"},
                    {data: "ordertime", title: "状态描述", width: "30%", className: "centerColumns"},
                    {data: "operateway", title: "操作次数", width: "20%", className: "centerColumns"}
                ]
            };
            secondDialogDataTable =  $plugin.iCompaignTable(options);
        }

        initEvent();

        function initEvent(){
            $dialog.find(".userInfoSearchBtn").click(function(){
                secondDialogDataTable.ajax.reload();
            });
        }



        layer.open({
            type: 1,
            shade: 0.3,
            title: '['+resultCode+']用户',
            offset: '70px',
            area: ['1000px', '700px'],
            content: $dialog,
            closeBtn: 0,
            btn: ["关闭"],
            yes: function (index, layero) {
                layer.close(index);
            }
        });




    };



    // 初始化事件
    /*obj.initEvent = function(){
        /!**
         * 一级类别级联触发二级类别
         *!/
        //$first.change(function(){
        //    var parentId = $(this).val();
        //    $second.empty();
        //    $second.append("<option value='9999' selected>全部类别</option>");
        //    $util.ajaxPost(getSecondLevel,JSON.stringify({"parentId":parentId}),function(data){
        //        for (var i = 0, j = data.length; i < j; i++) {
        //            $second.append(options.replace(/AA/g,data[i].id).replace(/BB/g,data[i].name))
        //        }
        //    },function(){
        //        queryErr();
        //    })
        //});

        /!**
         * 营销厂家触发订购渠道
         *!/
        $factory.change(function(){
            var factoryName = $(this).val();
            if(factoryName == 99999){
                $channel.empty();
                $channel.append("<option value='99999' selected>请选择订购渠道</option>");
            }else{
                $channel.empty();
                $channel.append("<option value='99999' selected>请选择订购渠道</option>");
                $util.ajaxPost(getChannelName,JSON.stringify({"factoryName":factoryName}),function(data){
                    for(var i = 0, j = data.length; i < j; i++){
                        $channel.append(options.replace(/AA/g,data[i].id).replace(/BB/g,data[i].channelName))
                    }
                },function(){
                    queryErr();
                })
            }
        });

        /!**
         * 查询条件
         *!/
        $("#queryAllDetail").click(function(){
            dataTable.ajax.reload();
        });

        /!**
         * 查询条件页签点击效果
         *!/
        $(".paging_select span").click(function () {
            $(this).siblings("span").removeClass("active");
            $(this).addClass("active");
            queryType = $(this).find("input").val();
            dataTable.ajax.reload();
        })

        /!**
         * 下载功能
         *!/
        $downloadBtn.click(function(){
            var param = obj.getDownloadParam();
            var url = "downloadProductOrderDetail.view";
            var tempForm = document.createElement("form");
            tempForm.id = "tempForm";
            tempForm.method = "POST";
            tempForm.action = url;

            $.each(param,function(index,value){
                var input = document.createElement("input");
                input.type = "hidden";
                input.name = value[0];
                input.value = value[1];
                tempForm.appendChild(input);
            });
            document.body.appendChild(tempForm);
            tempForm.submit();
            document.body.removeChild(tempForm);
        });

    };*/


    //条件栏加载异常处理
    function queryErr() {
        $html.warning("加载查询条件异常,请稍后重试");
    }


    return obj;
}();

function onLoadBody(){
    //productOrderDetail.initQueryRow();
    //productOrderDetail.initEvent();
    todayProductOrderDetail.initDataTable();
    todayProductOrderDetail.initEvent();
}