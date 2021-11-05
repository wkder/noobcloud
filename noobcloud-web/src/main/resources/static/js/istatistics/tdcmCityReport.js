/**
 * Created by DELL on 2017/6/26.
 */


var tdcmCityReport = function () {
    var obj = {},
        dataTable,
        getUrl = "queryB2ICityReport.view";
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
        //region初始化城市
        var citySelect = $(".queryCity");
        var city = '<option value="BB">AA</option>';
        citySelect.append(city.replace(/AA/g, '全省').replace(/BB/g, '合计'));
        citySelect.append(city.replace(/AA/g, '南京市').replace(/BB/g, '南京'));
        citySelect.append(city.replace(/AA/g, '苏州市').replace(/BB/g, '苏州'));
        citySelect.append(city.replace(/AA/g, '无锡市').replace(/BB/g, '无锡'));
        citySelect.append(city.replace(/AA/g, '徐州市').replace(/BB/g, '徐州'));
        citySelect.append(city.replace(/AA/g, '南通市').replace(/BB/g, '南通'));
        citySelect.append(city.replace(/AA/g, '常州市').replace(/BB/g, '常州'));
        citySelect.append(city.replace(/AA/g, '盐城市').replace(/BB/g, '盐城'));
        citySelect.append(city.replace(/AA/g, '扬州市').replace(/BB/g, '扬州'));
        citySelect.append(city.replace(/AA/g, '泰州市').replace(/BB/g, '泰州'));
        citySelect.append(city.replace(/AA/g, '宿迁市').replace(/BB/g, '宿迁'));
        citySelect.append(city.replace(/AA/g, '镇江市').replace(/BB/g, '镇江'));
        citySelect.append(city.replace(/AA/g, '连云港市').replace(/BB/g, '连云港'));
        citySelect.append(city.replace(/AA/g, '淮安市').replace(/BB/g, '淮安'));
        citySelect.val("合计");//默认全省
        //endregion
    };

    obj.initTable = function () {
        var month = $.trim($(".queryMonth").val()),
            city = encodeURIComponent($.trim($(".queryCity").val()));
        var param = "monthId=" + month + "&cityName=" + city;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            paging:false,
            info:false,
            columns: [
                {data: "cityname", title: "地市", width: 40, className: "dataTableFirstColumns",render:function(data, type, row){
                    if(data == "合计"){
                        return "<span style='color: red;font-weight: bold '>合计</span>"
                    }else{
                        return data;
                    }
                }},
                {data:"cz_user_num",title:"出账用户数",width:50,defaultContent:"-"},
                {data:"cz_user_rate",title:"出账用户占比",width:80},
                {data: "arpu", title: "ARPU", width: 50,defaultContent:"-"},
                {data: "mou", title: "MOU", width: 50,defaultContent:"-"},
                {data: "dou", title: "DOU", width: 50,defaultContent:"-"},
                {data: "rate_4g", title: "4G登网率", width: 60},
                {data: "rate_4g_1st", title: "4G首充登网率", width: 80},
                {data: "stop_rate", title: "停机率", width: 50},
                {data: "cash_1st_stop_rate", title: "已首充停机率", width: 80},
                {data: "churn_rate", title: "离网率", width: 50},
                {data: "cash_1st_churn_rate", title: "已首充离网率", width: 80}
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
                city = encodeURIComponent($.trim($(".queryCity").val()));
            var param = "monthId=" + month + "&cityName=" + city;
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
                area: ["1000px", "450px"]
            }, null, null, function () {
                $(".layui-layer-btn0").css("cssText", "display:none !important");
            });
        });
        /**
         * 导出报表
         */
        $("#exportBaseButton").click(function () {
            var param = obj.getParam();
            $util.exportFile("downloadB2ICityReport.view", param);
        });
    };


    obj.getParam = function () {
        return {
            monthId: $.trim($(".queryMonth").val()),
            cityName: encodeURIComponent($.trim($(".queryCity").val()))
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
    tdcmCityReport.initData();
    tdcmCityReport.initTable();
    tdcmCityReport.initEvent();

}