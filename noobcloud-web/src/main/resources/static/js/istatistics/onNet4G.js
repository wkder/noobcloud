/**
 * Created by Chris on 2017/10/17.
 */
var onNet4G = function () {
    var getOnNet4G = "queryOnNet4G.view";
    var obj = {};
    var dataTable;

    // 初始化时间
    obj.initDate = function () {
        $('#startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('#endTime').val(new Date().getDelayDay(0).format('yyyy-MM-dd'));
    };

    //初始化按钮操作
    obj.initEvent = function () {
        //查询
        $("#onNetQueryBtn").click(obj.evtOnRefresh);

        //指标
        $("#btnDescription").click(function () {
            obj.evtOnDescription();
        });

        // 跟踪分析弹窗 查询
        $("#followingQueryBtn").click(function () {
            obj.queryFollowingAnalysisPopUp();
        });
        // 导出
        // $("#exportBaseButton").click(function () {
        //     var param = obj.getParam();
        //     $util.exportFile("downloadPromoteOnNetMarket", param);
        // });
    };

    //初始化表格
    obj.dataTableInit = function () {
        var param = getParam();
        var data1 = "startTime=" + param.startTime + "&endTime=" + param.endTime + "&sceneName=" + param.sceneName;
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getOnNet4G + "?" + data1,
                type: "POST"
            },
            columns: [
                {data: "date", title: "日期", width: 400, className: "dataTableFirstColumns"},
                {data: "type", title: "场景类型", width: 300, className: "centerColumns"},
                {data: "condition", title: "场景条件", width: 800, className: "centerColumns"},
                {data: "catchnum", title: "捕捉用户数", width: 600, className: "centerColumns"},
                {data: "giftnum", title: "产品赠送用户数", width: 600, className: "centerColumns"},
                {data: "sendnum", title: "短信下发用户数", width: 600, className: "centerColumns"},
                {
                    title: "分析", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var followingHtml = "<a title='跟踪分析'  class='assignBtn btn btn-info btn-edit btn-sm' href='javascript:void(0)' " +
                            "onclick='onNet4G.followingAnalysisPopUp(\"" + row.date + "\",\"" + row.type + "\",\"" + row.condition + "\")' >跟踪分析</a>";
                        return followingHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询、时间校验事件
    obj.evtOnRefresh = function () {
        var param = getParam();
        var data1 = "startTime=" + param.startTime + "&endTime=" + param.endTime + "&sceneName=" + param.sceneName;
        if (param.startTime.getDateNumber() - param.endTime.getDateNumber() > 0) {
            layer.alert("开始日期请勿大于结束日期", {icon: 6});
            return;
        }
        dataTable.ajax.url(getOnNet4G + "?" + data1);
        dataTable.ajax.reload();
    };

    //指标 事件
    obj.evtOnDescription = function () {
        $plugin.iModal({
            title: '指标说明',
            content: $("#dialogDescription"),
            offset: '100px',
            area: ["600px", "400px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };

    // 跟踪分析弹窗
    obj.followingAnalysisPopUp = function (date, type, condition) {
        // 指标说明
        $("#followingBtnDescription").unbind('click').click(function () {
            $plugin.iModal({
                title: '指标说明',
                content: $(".followingAnalysisDescription"),
                offset: '100px',
                area: ["800px", "500px"]
            }, null, null, function () {
                $(".layui-layer-btn0").css("cssText", "display:none !important");
            });
        });
        //弹窗搜索栏 时间初始化
        $('#queryTime').val(obj.formatDate(date));

        //弹窗内搜索栏 查询条件判断
        var $sceneConditionSelect = $(".querySceneCondition");
        $sceneConditionSelect.empty();

        $(".querySceneNamePopUp").val(type);//场景类型初始化
        // $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, condition).replace(/B/g, condition));

        if (type == "4G促登网") {
            $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "持2G终端").replace(/B/g, "持2G终端"));
            $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "持4G终端").replace(/B/g, "持4G终端"));
            $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "持TD终端").replace(/B/g, "持TD终端"));
        }
        else if (type == "4G首登网") {
            $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "未有历史终端").replace(/B/g, "未有历史终端"));
            $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "历史上一款持2G终端").replace(/B/g, "历史上一款持2G终端"));
            $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "历史上一款持3G/4G终端").replace(/B/g, "历史上一款持3G/4G终端"));
        }
        $sceneConditionSelect.val(condition);//传入当前值

        $(".querySceneNamePopUp").unbind('change').change(function () {//动态更改下拉列表
            var sceneName = $(this).children('option:selected').val();
            $sceneConditionSelect.empty();
            if (sceneName == "4G促登网") {
                $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "持2G终端").replace(/B/g, "持2G终端"));
                $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "持4G终端").replace(/B/g, "持4G终端"));
                $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "持TD终端").replace(/B/g, "持TD终端"));
            }
            else if (sceneName == "4G首登网") {
                $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "未有历史终端").replace(/B/g, "未有历史终端"));
                $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "历史上一款持2G终端").replace(/B/g, "历史上一款持2G终端"));
                $sceneConditionSelect.append("<option value='A'>B</option>".replace(/A/g, "历史上一款持3G/4G终端").replace(/B/g, "历史上一款持3G/4G终端"));
            }
        });

        globalRequest.queryFollowingAnalysisChart(true, {
            "date": date,
            "type": type,
            "condition": condition
        }, function (data) {
            var $followingAnalysisUserNum = $(".followingAnalysisPopUp .followingAnalysisUserNum");
            var a = data.shift();

            $followingAnalysisUserNum.find("#followingAnalysisUserNum").text((a && !isNaN(a["trackingnum"])) ? a["trackingnum"] : "0");//标题人数
            var FollowingAnalysisData = data;
            var onNet4GRateDate = [];
            var onNet4GRateValueNum = [];

            var fall4GAnalysisDate = [];
            var fall4GAnalysisValueNum = [];

            //4G登网附着率 折线图取值
            for (var i = 0, y = FollowingAnalysisData.length; i < y; i++) {

                if (FollowingAnalysisData[i].onnet4gratenum == null) {
                    onNet4GRateDate.push(FollowingAnalysisData[i].cyclename);
                    onNet4GRateValueNum.push("0");
                }
                else {
                    onNet4GRateDate.push(FollowingAnalysisData[i].cyclename);
                    onNet4GRateValueNum.push(FollowingAnalysisData[i].onnet4gratenum);
                }
            }

            //4G疑似回落分析 饼状图+饼状图取值
            for (var i = 0, y = FollowingAnalysisData.length; i < y; i++) {
                fall4GAnalysisDate = [];
                fall4GAnalysisValueNum = [];
                if (FollowingAnalysisData[i].fall4gratenum == null) {
                    fall4GAnalysisValueNum.push("0");
                    fall4GAnalysisDate.push(FollowingAnalysisData[i].cyclename);
                }
                else {
                    fall4GAnalysisDate.push(FollowingAnalysisData[i].cyclename);
                    fall4GAnalysisValueNum.push(FollowingAnalysisData[i].fall4gratenum);
                }

                var $element = $(".fall4GAnalysisChart_" + (i + 1) + "")//随数据动态加载饼状图
                if ($element) {
                    $element.show();
                    var fall4GAnalysisChart = echarts.init($element[0]);
                    var i1 = 100;
                    var fall4GAnalysisOption = {
                        title: {
                            text: fall4GAnalysisDate,
                            x: 'center',
                            padding: 5,
                            textStyle: {
                                fontSize: 14,
                                fontWeight: 500
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                //对应value值的index
                                if (params.dataIndex === 0) {
                                    return params.name + ":" + params.value + "%";
                                } else {
                                    return ""
                                }
                            }
                        },
                        series: [
                            {
                                name: '回落',
                                type: 'pie',
                                radius: '50%',
                                center: ['47%', '50%'],
                                label: {
                                    normal: {
                                        formatter: ' {b}：{c}%  ',
                                        backgroundColor: '#eee',
                                        borderColor: '#aaa',
                                        borderWidth: 1,
                                        borderRadius: 4,
                                        rich: {
                                            b: {
                                                fontSize: 16,
                                                lineHeight: 33,
                                                padding: [2, 4]
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
                                data: [
                                    {
                                        value: fall4GAnalysisValueNum, name: '回落',
                                        itemStyle: {
                                            normal: {
                                                labelLine: {
                                                    length: 0,
                                                    length2: 2
                                                }
                                            }
                                        }
                                    },
                                    {
                                        value: i1, itemStyle: {
                                        normal: {
                                            label: {
                                                show: function () {
                                                    if (i1 === 100) {
                                                        return false;
                                                    }
                                                    return true
                                                }()
                                            },
                                            labelLine: {
                                                show: function () {
                                                    if (i1 === 100) {
                                                        return false;
                                                    }
                                                    return true

                                                }(),
                                                length: -10
                                            },
                                        }
                                    }
                                    }
                                ],
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ],
                        color: ['#ee8129', '#1398bc']
                    };
                    fall4GAnalysisChart.setOption(fall4GAnalysisOption);
                }
            }

            //4G登网登网附着率 折线图
            var onNet4GRateChart = echarts.init($('div.onNet4GRateChart')[0]);

            var onNet4GRateOption = {
                title: {
                    text: '附着率',
                    padding: 4,
                    left: 230,
                    textStyle: {
                        fontWeight: 600
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>附着率：{c}%'
                },
                grid: {
                    left: '10%',
                    right: '20%',
                    bottom: '20%',
                    top: '20%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
                    data: onNet4GRateDate,
                    name: "跟踪周期",
                    linkSymbol: "arrow",
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {
                    type: 'value',
                    name: "%"
                },
                series: [
                    {
                        type: 'line',
                        name: '附着率',
                        data: onNet4GRateValueNum,
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    return "#587BBD"
                                },
                                lineStyle: {
                                    color: '#ee8129'
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
                    }
                ]
            };
            onNet4GRateChart.setOption(onNet4GRateOption);

            //浏览器适配
            window.onresize = function () {
                onNet4GRateChart.resize();
                fall4GAnalysisChart.resize();
            };

            if (data && data.length > 0) {
                var html = template('onNet4GRateTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #onNet4GRate tbody tr").empty();
                $("div.followingAnalysisPopUp #onNet4GRate tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #onNet4GRate tbody tr").remove();
                $("div.followingAnalysisPopUp #onNet4GRate tbody ").append(html);
            }

            //4G疑似回落分析
            if (data && data.length > 0) {
                var html = template('fall4GAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody ").append(html);
            }

            //终端分析
            if (data && data.length > 0) {
                var html = template('terminalAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #terminalAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #terminalAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #terminalAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #terminalAnalysis tbody ").append(html);
            }

            //三无分析
            if (data && data.length > 0) {
                var html = template('silenceAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #silenceAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #silenceAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #silenceAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #silenceAnalysis tbody ").append(html);
            }

            //停机分析
            if (data && data.length > 0) {
                var html = template('machineHaltAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody ").append(html);
            }

        }, function () {
            $html.warning("遇到异常，数据加载失败");
        });
        // });


        $plugin.iModal({
            title: '跟踪分析',
            content: $(".followingAnalysisPopUp"),
            offset: '50px',
            area: ["1100px", "650px"]
        }, null, null, function () {
            $(".layui-layer-btn0").css("cssText", "display:none !important");
        });
    };

    // 跟踪分析弹窗内部查询事件
    obj.queryFollowingAnalysisPopUp = function () {
        var date = $("#queryTime").val().replace(/-/g, "");
        var type = $(".querySceneNamePopUp").val();
        var condition = $(".querySceneCondition").val();

        globalRequest.queryFollowingAnalysisChart(true, {
            "date": date,
            "type": type,
            "condition": condition
        }, function (data) {
            var $followingAnalysisUserNum = $(".followingAnalysisPopUp .followingAnalysisUserNum");
            var a = data.shift();

            $followingAnalysisUserNum.find("#followingAnalysisUserNum").text((a && !isNaN(a["trackingnum"])) ? a["trackingnum"] : "0");//标题人数
            var FollowingAnalysisData = data;
            var onNet4GRateDate = [];
            var onNet4GRateValueNum = [];

            var fall4GAnalysisDate = [];
            var fall4GAnalysisValueNum = [];

            //4G登网附着率 折线图取值
            for (var i = 0, y = FollowingAnalysisData.length; i < y; i++) {

                if (FollowingAnalysisData[i].onnet4gratenum == null) {
                    onNet4GRateDate.push(FollowingAnalysisData[i].cyclename);
                    onNet4GRateValueNum.push("0");
                }
                else {
                    onNet4GRateDate.push(FollowingAnalysisData[i].cyclename);
                    onNet4GRateValueNum.push(FollowingAnalysisData[i].onnet4gratenum);
                }
            }

            //4G疑似回落分析 饼状图+饼状图取值
            for (var i = 0, y = FollowingAnalysisData.length; i < y; i++) {
                fall4GAnalysisDate = [];
                fall4GAnalysisValueNum = [];
                if (FollowingAnalysisData[i].fall4gratenum == null) {
                    fall4GAnalysisValueNum.push("0");
                    fall4GAnalysisDate.push(FollowingAnalysisData[i].cyclename);
                }
                else {
                    fall4GAnalysisDate.push(FollowingAnalysisData[i].cyclename);
                    fall4GAnalysisValueNum.push(FollowingAnalysisData[i].fall4gratenum);
                }

                var $element = $(".fall4GAnalysisChart_" + (i + 1) + "")//随数据动态加载饼状图
                if ($element) {
                    $element.show();
                    var fall4GAnalysisChart = echarts.init($element[0]);
                    var i1 = 100;
                    var fall4GAnalysisOption = {
                        title: {
                            text: fall4GAnalysisDate,
                            x: 'center',
                            padding: 5,
                            textStyle: {
                                fontSize: 14,
                                fontWeight: 500
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                //对应value值的index
                                if (params.dataIndex === 0) {
                                    return params.name + ":" + params.value + "%";
                                } else {
                                    return ""
                                }
                            }
                        },
                        series: [
                            {
                                name: '回落',
                                type: 'pie',
                                radius: '50%',
                                center: ['47%', '50%'],
                                label: {
                                    normal: {
                                        formatter: ' {b}：{c}%  ',
                                        backgroundColor: '#eee',
                                        borderColor: '#aaa',
                                        borderWidth: 1,
                                        borderRadius: 4,
                                        rich: {
                                            b: {
                                                fontSize: 16,
                                                lineHeight: 33,
                                                padding: [2, 4]
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
                                data: [
                                    {
                                        value: fall4GAnalysisValueNum, name: '回落',
                                        itemStyle: {
                                            normal: {
                                                labelLine: {
                                                    length: 0,
                                                    length2: 2
                                                }
                                            }
                                        }
                                    },
                                    {
                                        value: i1, itemStyle: {
                                        normal: {
                                            label: {
                                                show: function () {
                                                    if (i1 === 100) {
                                                        return false;
                                                    }
                                                    return true
                                                }()
                                            },
                                            labelLine: {
                                                show: function () {
                                                    if (i1 === 100) {
                                                        return false;
                                                    }
                                                    return true

                                                }(),
                                                length: -10
                                            },
                                        }
                                    }
                                    }
                                ],
                                itemStyle: {
                                    emphasis: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
                            }
                        ],
                        color: ['#ee8129', '#1398bc']
                    };
                    fall4GAnalysisChart.setOption(fall4GAnalysisOption);
                }
            }

            //4G登网登网附着率 折线图
            var onNet4GRateChart = echarts.init($('div.onNet4GRateChart')[0]);

            var onNet4GRateOption = {
                title: {
                    text: '附着率',
                    padding: 4,
                    left: 230,
                    textStyle: {
                        fontWeight: 600
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b}<br/>附着率：{c}%'
                },
                grid: {
                    left: '10%',
                    right: '20%',
                    bottom: '20%',
                    top: '20%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
                    data: onNet4GRateDate,
                    name: "跟踪周期",
                    linkSymbol: "arrow",
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {
                    type: 'value',
                    name: "%"
                },
                series: [
                    {
                        type: 'line',
                        name: '附着率',
                        data: onNet4GRateValueNum,
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    return "#587BBD"
                                },
                                lineStyle: {
                                    color: '#ee8129'
                                }
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        }
                    }
                ]
            };
            onNet4GRateChart.setOption(onNet4GRateOption);

            //浏览器适配
            window.onresize = function () {
                onNet4GRateChart.resize();
                fall4GAnalysisChart.resize();
            };

            if (data && data.length > 0) {
                var html = template('onNet4GRateTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #onNet4GRate tbody tr").empty();
                $("div.followingAnalysisPopUp #onNet4GRate tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #onNet4GRate tbody tr").remove();
                $("div.followingAnalysisPopUp #onNet4GRate tbody ").append(html);
            }

            //4G疑似回落分析
            if (data && data.length > 0) {
                var html = template('fall4GAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #fall4GAnalysis tbody ").append(html);
            }

            //终端分析
            if (data && data.length > 0) {
                var html = template('terminalAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #terminalAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #terminalAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #terminalAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #terminalAnalysis tbody ").append(html);
            }

            //三无分析
            if (data && data.length > 0) {
                var html = template('silenceAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #silenceAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #silenceAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #silenceAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #silenceAnalysis tbody ").append(html);
            }

            //停机分析
            if (data && data.length > 0) {
                var html = template('machineHaltAnalysisTemplate', {list: data});//artTemplate
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody tr").empty();
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody ").append(html);
            }

            if (data && data.length == 0) {
                var html = "<tr><td colspan='22'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody tr").remove();
                $("div.followingAnalysisPopUp #machineHaltAnalysis tbody ").append(html);
            }

        }, function () {
            $html.warning("遇到异常，数据加载失败");
        });
        // });
    };

    /**
     * 时间格式化
     * @param val
     * @returns {*}
     */
    obj.formatDate = function (val) {

        var valLen = val.length
        if (!val || !valLen || valLen !== 8) {
            return;
        }
        var year = val.substring(0, 4);
        var month = val.substring(4, 6);
        var day = val.substring(6, 8);
        return year + "-" + month + "-" + day;
    };

    //获取时间参数
    function getParam() {
        return {
            startTime: $("#startTime").val().replace(/-/g, ""),
            endTime: $("#endTime").val().replace(/-/g, ""),
            sceneName: $("#querySceneName").val()
        }
    }

    return obj;
}();

function onLoadBody() {
    onNet4G.initDate();
    onNet4G.initEvent();
    onNet4G.dataTableInit();

}