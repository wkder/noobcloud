var positionSummary = function () {
    var obj = {};
    //加载时间参数
    obj.initDate = function () {
        $('.executeTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    }
    //加载主页数据
    obj.initContact = function () {
        var paras = getParams();
        globalRequest.queryPositionSummary(true, paras, function (data) {
            intCharts(data);
            initTable(data);
        }, function () {
            layer.alert("系统异常", {icon: 6});
        });

        function getParams() {
            return {
                flag: $(".iMarket_PosiSummary_Body").find(".day_report").hasClass("active") == true ? 'day' : 'month',
                executeTime: $(".iMarket_PosiSummary_Body").find(".executeTime").val().replace(/-/g, ""),
                survey: $(".iMarket_PosiSummary_Body").find(".survey_deep").hasClass("active") == true ? 'deep' : 'task'
            }
        }

        //加载图表
        function intCharts(data) {
            //1、初始化
            require.config({paths: {echarts: 'ext/echarts'}});
            //定义渗透率概况
            deepData = {names: ['经分中活跃渠道', '配置网点数', '渗透率'], series: [], titles: [], text: '地市网点"炒店"渗透率图'};
            var hallData = {name: '经分中活跃渠道', type: 'bar', data: []};
            var confData = {name: '配置网点数', type: 'bar', data: []};
            var seepData = {
                name: '渗透率',
                type: 'line',
                yAxisIndex: 1,
                data: [],
                itemStyle: {normal: {label: {show: true}}}
            };
            taskData = {names: ['任务量', '短信推送量'], series: [], titles: [], text: '地市网点"炒店"任务营销图'};
            var tData = {name: '任务量', type: 'bar', barWidth: 40, data: []};
            var smsSend = {
                name: '短信推送量',
                type: 'line',
                yAxisIndex: 1,
                data: [],
                itemStyle: {normal: {label: {show: true}}}
            };

            $.each(data.items, function (idx, val) {
                if (idx < data.items.length) {
                    hallData.data.push(val.zyhall + val.hzhall);
                    confData.data.push(val.confhall);
                    seepData.data.push(val.seep);
                    deepData.titles.push(val.name);
                    taskData.titles.push(val.name);
                    tData.data.push(val.taskNum);
                    smsSend.data.push(val.smsSendNum);
                }
            });

            deepData.series.push(hallData);
            deepData.series.push(confData);
            deepData.series.push(seepData);
            taskData.series.push(tData);
            taskData.series.push(smsSend);
            //定义渗透率概况
            $.lines('chart_deep', deepData);

            $(".chart_title span").click(function () {
                $(this).siblings().removeClass("active");
                $(this).addClass("active");
                $(".chart_element_body .chart_deep").empty();
                if ($(".chart_title .survey_deep").hasClass("active")) {
                    //定义渗透率概况
                    $.lines('chart_deep', deepData);
                } else {
                    //定义任务营销概况
                    $.lines('chart_deep', taskData);
                }
            })
        }

        //加载table
        function initTable(data) {
            var html = "<tr><td colspan='9'><div class='noData'>暂无相关数据</div></td></tr></li>";
            if (data.items.length > 0) {
                var html = template('posiSummary', {list: data.items});
            }
            $("#dataTable tbody tr").remove();
            $("#dataTable tbody").append(html);
        }
    }
    //加载事件
    obj.initEvent = function () {
        //查询
        $(".iMarket_PosiSummary_Body .conditionSearch span").click(function () {
            $(this).siblings("span").removeClass("active");
            $(this).addClass("active");
            obj.initContact();
        });
    }

    return obj;

}();

//入口方法
function onLoadBody() {
    positionSummary.initDate();
    positionSummary.initContact();
    positionSummary.initEvent();

}