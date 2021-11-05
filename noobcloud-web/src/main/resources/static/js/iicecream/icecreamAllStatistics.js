var icecreamAllStatistics = function () {
    var obj = {}, dataTable = {}, pieChart = {}, funnelChart = {};

    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
            obj.initEChatData();
        })
    }

    /**
     * 初始化时间控件
     */
    obj.dateInit = function () {
        var date = new Date().format('yyyy-MM');
        var year = date.split('-')[0];
        var month = date.split('-')[1];
        $(".queryYear").val(year);
        $(".queryMonth").val(month);
    }

    /**
     * 加载表格数据
     */
    obj.iniTableData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "month_id", title: "日期", className: "dataTableFirstColumns"},
                {data: "phone", title: "手机号"},
                {data: "product_id", title: "产品Id"},
                {
                    data: "channel", title: "渠道",
                    render: function (data, type, row) {
                        return obj.getChannelType(data);
                    }
                },
                {
                    data: "status", title: "状态",
                    render: function (data, type, row) {
                        return obj.getStatusType(data);
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    /**
     * 加载echart数据
     */
    obj.initEChatData = function () {
        var date = obj.getQueryDate();
        globalRequest.iIceCream.queryIceCreamAllStatisticsByChart(false, {date: date}, function (data) {
            obj.initPie(data);
            obj.initFunnel(data);
        })
    }

    /**
     * 加载饼图
     * @param data
     */
    obj.initPie = function (data) {
        if (!!pieChart) {
            pieChart = echarts.init(document.querySelector('.pie'), "light");
        }
        if (!data || data.length <= 0) {
            $(".pie-empty-data").show();
        } else {
            $(".pie-empty-data").hide();
        }
        var option = {
            title: {
                text: '全量统计-饼图',
                x: 'left',
                left: 20,
                top: 20,
                textStyle: {color: '#606060'},
                borderWidth: 1
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            series: [
                {
                    name: '全量统计',
                    type: 'pie',
                    radius: '50%',
                    center: ['55%', '60%'],
                    label: {
                        normal: {
                            formatter: '  {b|{b}:} {per|{d}%}  ',
                            backgroundColor: '#eee',
                            borderColor: '#ccc',
                            borderWidth: 1,
                            borderRadius: 2,
                            rich: {
                                b: {
                                    // fontSize: 14,
                                    lineHeight: 33,
                                    color: '#666'
                                },
                                per: {
                                    color: '#eee',
                                    backgroundColor: '#334455',
                                    padding: [2, 4],
                                    borderRadius: 2
                                }
                            }
                        }
                    },
                    data: data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        pieChart.setOption(option);
    }

    /**
     * 加载漏斗图
     * @param data
     */
    obj.initFunnel = function (data) {
        if (!!funnelChart) {
            funnelChart = echarts.init(document.querySelector('.funnel'), "light");
        }
        if (!data || data.length <= 0) {
            $(".funnel-empty-data").show();
        } else {
            $(".funnel-empty-data").hide();
        }
        data.sort(function (a, b) {
            return a.value - b.value
        }).forEach(function (item, index) {
            var temp = item["value"];
            item["displayValue"] = temp;
            item["value"] = 20 * (index + 1);
        })
        var option = {
            title: {
                text: '短信统计-漏斗图',
                x: 'left',
                top: 20,
                left: 20,
                textStyle: {color: '#606060'},
                borderWidth: 1,
                borderRadius: 2
            },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            // color: ['#00B38B', '#FF9F7F', '#37A2DA', '#71F6F9', '#ffb546', '#F66BBF'],
            series: [
                {
                    name: '漏斗图',
                    type: 'funnel',
                    x: '10%',
                    y: 100,
                    y2: 20,
                    width: '80%',
                    min: 0,
                    max: 100,
                    minSize: '0%',
                    maxSize: '100%',
                    sort: 'descending',
                    gap: 2,
                    data: data,
                    roseType: true,
                    label: {
                        normal: {
                            formatter: function (params) {
                                return params.name + ' ' + params.data.displayValue;
                            },
                            position: 'center',
                            color: '#666',
                            fontSize: 16
                        },
                        emphasis: {
                            textStyle: {
                                fontSize: 20
                            }
                        }
                    },
                    itemStyle: {
                        normal: {
                            borderColor: '#fff',
                            borderWidth: 2
                        }
                    }
                }
            ]
        };
        funnelChart.setOption(option);
    }

    /**
     * 获取渠道类型
     * @param type
     * @returns {string}
     */
    obj.getChannelType = function (type) {
        switch (type) {
            case 0:
                return "微信"
            case 1:
                return "短信"
            case 2:
                return "话加"
            default:
                return "未知"
        }
    }

    /**
     * 获取状态类型
     * @param type
     * @returns {string}
     */
    obj.getStatusType = function (type) {
        switch (type) {
            case 0:
                return "初始状态"
            case 1:
                return "订购成功"
            default:
                return "未知"
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        return "queryIceCreamAllStatisticsByPage.view?date=" + obj.getQueryDate();
    }

    /**
     *
     * @returns {string}
     */
    obj.getQueryDate = function () {
        var date = new Date().format('yyyy-MM');
        var nowYear = (date.split('-')[0]);
        var year = $.trim($(".queryYear").val());
        var month = $.trim($(".queryMonth").val());
        if (isNaN(year) || isNaN(month)) {
            layer.alert("查询日期格式错误", {icon: 5});
            return "";
        }
        if (parseInt(year) < 1900 || parseInt(year) > (parseInt(nowYear) + 1)) {
            layer.alert("查询日期年份超过范围", {icon: 5});
            return "";
        }
        if (parseInt(month) <= 0 || parseInt(month) > 12) {
            layer.alert("查询日期月份超过范围", {icon: 5});
            return "";
        }
        if (month < 10 && month.length == 1) {
            month = "0" + month
        }
        return year + "-" + month;
    }

    return obj;
}()

function onLoadBody() {
    icecreamAllStatistics.dateInit();
    icecreamAllStatistics.iniTableData();
    icecreamAllStatistics.initEChatData();
    icecreamAllStatistics.initEvent();
}