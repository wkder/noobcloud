var icecreamSmsStatistics = function () {
    var obj = {}, dataTable = {}, pieChart = {}, funnelChart = {};

    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        $(".searchBtn").click(function () {var phone = $.trim($('#queryPhone').val())
            if (phone) {
                if (obj.ifPhone(phone)) {
                    $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                } else {
                    layer.alert("请输入正确的手机号码", {icon: 5})
                }
            } else {
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                obj.initEChatData();
            }
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
                {data: "phone", title: "手机号", className: "dataTableFirstColumns"},
                {
                    data: "status", title: "状态",
                    render: function (data, type, row) {
                        return obj.getStatusType(data);
                    }
                },
                {data: "addtime", title: "时间"}
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    /**
     * 加载echart数据
     */
    obj.initEChatData = function () {
        var date = obj.getQueryDate();
        globalRequest.iIceCream.queryIceCreamSmsStatisticsByChart(false, {date: date}, function (data) {
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
                text: '短信统计-饼图',
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
                    name: '短信统计',
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
            // tooltip: {
            //     trigger: 'item',
            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
            // },
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
     * 获取状态类型
     * @param type
     * @returns {string}
     */
    obj.getStatusType = function (type) {
        switch (type) {
            case 0:
                return "短信发送"
            case 1:
                return "短信到达"
            case 2:
                return "短信首次回复"
            case 3:
                return "短信二次确认"
            case 4:
                return "开通成功"
            default:
                return "未知"
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        return "queryIceCreamSmsStatisticsByPage.view?date=" + obj.getQueryDate() + '&' + obj.getPhone();
    }

    /**
     * 获取输入的电话号码
     */
    obj.getPhone = function () {
        return 'phone=' + $.trim($('#queryPhone').val())
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

    /**
     * 电话号码验证
     * @return {bool}
     */
    obj.ifPhone = function (phone) {
        var re = /^(?=\d{11}$)^1(?:3\d|4[57]|5[^4\D]|66|7[^249\D]|8\d|9[89])\d{8}$/
        return re.test(phone)
    }

    return obj;
}()

function onLoadBody() {
    icecreamSmsStatistics.dateInit();
    icecreamSmsStatistics.iniTableData();
    icecreamSmsStatistics.initEChatData();
    icecreamSmsStatistics.initEvent();
}