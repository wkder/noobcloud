/**
 * Created by dtt on 2017/7/10.
 */
 var shopProvinceDaily = function(){
    var dataTable = {}, obj = {};


    /**
     * 加载数据
     * @param
     */
    obj.initData = function () {
        var param = getParam();
        globalRequest.iShop.queryShopProvinceDaily(true,param,function(data){
            obj.dataTableInit(data);
        },function(){
            $html.warning("载入数据异常,请稍后再试")
        });

        //obj.initAreaSelect();
    }

    /**
     * 初始化按钮事件
     */
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnExport").click(obj.evtOnExport);
        $("#btnDescription").click(obj.evtOnDescription);
    }

    /**
     * 时间控件初始化
     */
    obj.initDateTime = function () {
        $("#txtQueryDate").val(new Date().getDelayDay(-1).format("yyyy-MM-dd"));
    }

    /**
     * 表格初始化
     */
    obj.dataTableInit = function(data){
        if(data.items && data.items.length>0){
            var html = template("shopProvinceDaily",{list: data.items});
            $("#dataTable tbody tr").remove();
            $("#dataTable tbody").append(html);
        }else{
            var html = "<tr><td colspan='16' style='text-align: center'><div class='noData'>暂无相关数据</div></td></tr></li>";
            $("#dataTable tbody tr").remove();
            $("#dataTable tbody").append(html);
        }
    }

    obj.evtOnExport = function(){
        $util.exportFile("exportShopProvinceDaily.view", getParam());
    }

    //获取时间参数
    function getParam(){
        return {
            dateTime : $("#txtQueryDate").val().replace(/-/g,'')
        }
    }

    /**
     * 查询
     */
    obj.evtOnQuery = function () {
       obj.initData();
    }


    /**
     * 显示 指标说明
     */
    obj.evtOnDescription = function () {
        $plugin.iModal({
            title: '指标说明',
            content: $("#dialogDescription"),
            area: ["850px", "600px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    }
    return obj;
}()

function onLoadBody() {
    shopProvinceDaily.initDateTime();//时间初始化
    shopProvinceDaily.initData();
    shopProvinceDaily.initEvent();
}





