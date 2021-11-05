var icecreamStatistics = function () {
    var obj = {}, dataTable = {}, pieChart = {}, funnelChart = {};

    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        $(".searchBtn").click(function () {
            var phone = $.trim($('#queryPhone').val())
            if (phone) {
                if (obj.ifPhone(phone)) {
                    // obj.query()
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
                {data: "mob", title: "手机号", className: "dataTableFirstColumns"},
                {data: "ip", title: "IP地址"},
                {
                    data: "tag", title: "操作行为",
                    render: function (data, type, row) {
                        return obj.getTagType(data);
                    }
                },
                {data: "ctime", title: "时间"}
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    /**
     * 加载echart数据
     */
    obj.initEChatData = function () {
        var date = obj.getQueryDate()
        globalRequest.iIceCream.queryIceCreamStatisticsByChart(false, {date: date}, function (data) {
            // var res = JSON.parse(JSON.stringify(data))
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
                text: '用户行为统计-饼图',
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
                    name: '用户行为统计',
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
            item["value"] = 20 * (index + 1);
            item["displayValue"] = temp;
        })
        var option = {
            title: {
                text: '用户行为统计-漏斗图',
                x: 'left',
                top: 20,
                left: 20,
                textStyle: {color: '#606060'},
                borderWidth: 1,
                borderRadius: 2
            },
            // tooltip: {
            //     trigger: 'item',
            //     formatter: "{b} <br/>{c} : {d}%"
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
     * 获取标签类型
     * @param type
     * @returns {string}
     */
    obj.getTagType = function (type) {
        switch (type) {
            case "loadIndex":
                return "加载首页"
            case "loadApply":
                return "加载申请页"
            case "ApplyNow":
                return "立即申请"
            case "ConfirmLogin":
                return "登录"
            case "SendCode":
                return "发送验证码"
            case "ConfirmApply":
                return "二次确认"
            case "Confirm":
                return "最终提交申请"
            default:
                return "未知"
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        return "queryIceCreamStatisticsByPage.view?date=" + obj.getQueryDate() + "&" + obj.getPhone();
    }

    /**
     *  日期验证
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

    /**
     * 获取输入的电话号码
     */
    obj.getPhone = function () {
        return 'phone=' + $.trim($('#queryPhone').val())
    }

    /**
     * 初始化弹框
     */
    obj.initDialog = function () {
        var $all = $('div.iModalContent').find('.detailInfo').clone();
        $('#container').empty().append($all)
    }

    /**
     * 加载弹框中数据
     */
    obj.query = function () {
        $('#form').find("input[name='start']").val(0);
        $('#form').find("input[name='length']").val(100);
        var url = obj.getAjaxUrl()
        var options = {
            type: 'POST',
            url: url,
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (res) {
                $html.loading(false)
                var data = res.data
                if (data.length > 0) {
                    obj.showDialog()
                    obj.createTable(data)
                } else {
                    layer.alert('无此号码的数据。')
                }
            },
            error: function (error) {
                $html.loading(false)
                layer.alert('请求异常，请重试。')
            }
        }
        $('#form').ajaxSubmit(options)
    }

    /**
     * 展示弹框
     */
    obj.showDialog = function () {
        obj.initDialog()
        $plugin.iModal({
            title: $.trim($('#queryPhone').val()) + '统计结果：',
            content: $("#container"),
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            // layero.find('.layui-layer-btn').remove();
            // layero.find("div.data").attr("index", index).attr("operate", "preview");
        })
    }

    /**
     * 弹框数据
     */
    obj.createTable = function (data) {
        var str = '';
        for(var i = 0; i < data.length; i++) {
            var item = data[i]
            str += "<div class=\'data\'>"+
                "<div class=\'phone\'>"+item.mob+"</div>"+
                "<div class=\'address\'>"+item.ip+"</div>"+
                "<div class=\'action\'>"+item.obligate1+"</div>"+
                "<div class=\'time\'>"+item.ctime+"</div>"+
                "</div>";
        }
        $('.iceCream_Dialog').find('.dataContainer').html(str)
    }
    return obj;
}()

function onLoadBody() {
    icecreamStatistics.dateInit();
    icecreamStatistics.iniTableData();
    icecreamStatistics.initEChatData();
    icecreamStatistics.initEvent();
}