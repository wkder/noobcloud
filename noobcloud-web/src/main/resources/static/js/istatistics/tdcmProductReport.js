/**
 * Created by DELL on 2017/6/26.
 */


var tdcmProductReport = function () {
    var obj = {},
        dataTable,
        getUrl = "queryB2IProductReport.view";
    obj.initData = function () {
        //region初始化月份
        var date = new Date;
        var year = date.getFullYear();
        var month = date.getMonth();//上个月
        month = (month < 10 ? "0" + month : month);
        var selectedDate = year.toString() + month.toString();
        var mon = '<option value="BB">AA</option>';
        var monthSelect = $(".queryMonth");
        monthSelect.append(mon.replace(/AA/g, '1月').replace(/BB/g, year + '01'));
        monthSelect.append(mon.replace(/AA/g, '2月').replace(/BB/g, year + '02'));
        monthSelect.append(mon.replace(/AA/g, '3月').replace(/BB/g, year + '03'));
        monthSelect.append(mon.replace(/AA/g, '4月').replace(/BB/g, year + '04'));
        monthSelect.append(mon.replace(/AA/g, '5月').replace(/BB/g, year + '05'));
        monthSelect.append(mon.replace(/AA/g, '6月').replace(/BB/g, year + '06'));
        monthSelect.append(mon.replace(/AA/g, '7月').replace(/BB/g, year + '07'));
        monthSelect.append(mon.replace(/AA/g, '8月').replace(/BB/g, year + '08'));
        monthSelect.append(mon.replace(/AA/g, '9月').replace(/BB/g, year + '09'));
        monthSelect.append(mon.replace(/AA/g, '10月').replace(/BB/g, year + '10'));
        monthSelect.append(mon.replace(/AA/g, '11月').replace(/BB/g, year + '11'));
        monthSelect.append(mon.replace(/AA/g, '12月').replace(/BB/g, year + '12'));
        monthSelect.val(selectedDate);
        //endregion
        //region初始化产品类型选项
        var productTypeSelect = $(".queryProductType");
        var productType = '<option value="BB">AA</option>';
        productTypeSelect.append(productType.replace(/AA/g, '全部').replace(/BB/g, '合计'));
        productTypeSelect.append(productType.replace(/AA/g, 'T项目').replace(/BB/g, 'T项目'));
        productTypeSelect.append(productType.replace(/AA/g, 'D项目').replace(/BB/g, 'D项目'));
        productTypeSelect.append(productType.replace(/AA/g, 'C项目').replace(/BB/g, 'C项目'));
        productTypeSelect.append(productType.replace(/AA/g, 'M项目').replace(/BB/g, 'M项目'));
        productTypeSelect.val("合计");//默认展示全部类型
        //endregion
    };

    obj.initTable = function () {
        var month = $.trim($(".queryMonth").val()),
            product = encodeURIComponent($.trim($(".queryProductType").val()));
        var param = "monthId=" + month + "&productType=" + product;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {data: "item", title: "类型", width: 50, className: "dataTableFirstColumns",render:function(data, type, row){
                    if(data === '合计'){
                        return "";
                    }else{
                        return data;
                    }
                }},
                {data: "productname", title: "产品名称", width: 50,render:function(data,row,type){
                    if(data === "合计"){
                        return "<span style='color: red;font-weight: bold '>合计</span>"
                    }else{
                        return data;
                    }
                }},
                {data: "cz_user_num", title: "出账用户", width: 70},
                {data: "cz_user_rate", title: "出账用户占比", width: 80},
                {data: "arpu", title: "ARPU", width: 40},
                {data: "mou", title: "MOU", width: 40},
                {data: "dou", title: "DOU", width: 40},
                {data: "rate_4g", title: "4G登网率", width: 60},
                {data: "rate_4g_1st", title: "4G首充登网率", width: 70},
                {data: "stop_rate", title: "停机率", width: 50},
                {data: "cash_1st_stop_rate", title: "已首充停机率", width: 70},
                {data: "churn_rate", title: "离网率", width: 50},
                {data: "cash_1st_churn_rate", title: "已首充离网率", width: 70}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    obj.initEvent = function () {
        /**
         * 查询
         */
        $("#tdcmQueryBtn").click(function () {
            var month = $.trim($(".queryMonth").val()),
                product = encodeURIComponent($.trim($(".queryProductType").val()));
            var param = "monthId=" + month + "&productType=" + product;
            dataTable.ajax.url(getUrl + "?" + param);
            dataTable.ajax.reload();
        });
        /**
         * 指标
         */
        $("#btnDescription").click(function () {
            $plugin.iModal({
                title: '指标说明',
                content: $("#dialogDescription"),
                offset: '100px',
                area: ["600px", "550px"]
            }, null, null, function () {
                $(".layui-layer-btn0").css("cssText", "display:none !important");
            });
        });
        /**
         * 导出报表
         */
        $("#exportBaseButton").click(function () {
            var param = obj.getParam();
            $util.exportFile("downloadB2IProductReport.view", param);
        });
    };


    obj.getParam = function () {
        return {
            monthId: $.trim($(".queryMonth").val()),
            productType: encodeURIComponent($.trim($(".queryProductType").val()))
        };
    };


    //导出数据
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

function onLoadBody() {
    tdcmProductReport.initData();
    tdcmProductReport.initTable();
    tdcmProductReport.initEvent();

}