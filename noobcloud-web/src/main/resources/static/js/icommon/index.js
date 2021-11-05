/**
 * Created by hale on 2016/12/26.
 */
function onLoadBody() {
    var PROVINCE_ENUM = {
        JS: {
            json: 'json/jiangsu.json',
            name: '江苏省人口密度',
            data: [
                {name: '南京市', value: 48057},
                {name: '苏州市', value: 45477},
                {name: '无锡市', value: 31686},
                {name: '常州市', value: 25992},
                {name: '南通市', value: 19045},
                {name: '泰州市', value: 9689},
                {name: '扬州市', value: 12659},
                {name: '盐城市', value: 16180},
                {name: '宿迁市', value: 6204},
                {name: '淮安市', value: 25992},
                {name: '徐州市', value: 15918},
                {name: '连云港市', value: 19881},
                {name: '镇江市', value: 5178}
            ]
        }
    }
    var currentData = {};
    var province = "江苏";
    switch (province) {
        case "江苏":
            $("#privinceText").text("日志预警监控图");
            currentData = PROVINCE_ENUM.JS;
            break;
    }

    $("div.toggleItem").on("click", ".development", function () {
        var $this = $(this),
            $text = $this.find(".text"),
            $dButton = $this.find(".dButton");

        if ($dButton.hasClass("down")) {
            $this.parent().siblings(".row").slideDown();
            $text.text("收起");
            $dButton.removeClass("down").addClass("up");
        } else {
            $this.parent().siblings(".row").not(":first").slideUp();
            $text.text("展开");
            $dButton.removeClass("up").addClass("down");
        }
    });
    $(".card-content").on("click", function () {
        location.href = "#!";
    });
    $(".gauge-arrow").cmGauge();	//仪表盘插件

    $(".btnRefresh").click(function () {
        $('#gaugeCache .gauge-arrow').trigger('updateGauge', 90);
        $('#gaugeAdaptive .gauge-arrow').trigger('updateGauge', 40);
        $("#catchNum").html("5,123,456");
        $("#adaptiveNum").html("653,276");
    })

    var funObject = {
        eChartInit: function () {
            $.getJSON(currentData.json, function (geoJson) {
                var eChartMap = echarts.init(document.getElementById('eChartMap'));

                echarts.registerMap('JS', geoJson);

                eChartMap.setOption({
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}<br/>{c} (人 / 平方公里)'
                    },
                    visualMap: {
                        min: 5000,
                        max: 50000,
                        text: ['High', 'Low'],
                        realtime: false,
                        calculable: true,
                        left: 20,
                        bottom: 20,
                        inRange: {color: ['lightskyblue', 'yellow', 'orangered']}
                    },
                    series: [
                        {
                            name: currentData.name,
                            type: 'map',
                            mapType: 'JS', // 自定义扩展图表类型
                            itemStyle: {
                                normal: {label: {show: true}},
                                emphasis: {label: {show: true}}
                            },

                            layoutCenter: ['50%', '50%'],
                            layoutSize: 450,
                            data: currentData.data
                        }
                    ]
                });

                //地图点击事件
                eChartMap.on('click', function (params) {
                    console.log("params:", params);

                    //用户预测数据
                    $("#offlineUserNum").html(funObject.formatNum(Math.floor((Math.random() * 999999))));
                    $("#renewalUserNum").html(funObject.formatNum(Math.floor((Math.random() * 999999))));
                    $("#buyUserNum").html(funObject.formatNum(Math.floor((Math.random() * 999999))));
                    $("#changePackageUserNum").html(funObject.formatNum(Math.floor((Math.random() * 999999))));
                    $("#changeMobUserNum").html(funObject.formatNum(Math.floor((Math.random() * 999999))));
                    $("#haltUserNum").html(funObject.formatNum(Math.floor((Math.random() * 999999))));

                    //仪表盘联动
                    var randomNum1 = Math.floor((Math.random() * 100));
                    var randomNum2 = Math.floor((Math.random() * 100));
                    $('#gaugeCache .gauge-arrow').trigger('updateGauge', randomNum1);
                    $('#gaugeAdaptive .gauge-arrow').trigger('updateGauge', randomNum2);
                    $("#catchNum").html(funObject.formatNum(params.value));
                    $("#catchPercentage").html(randomNum1 + '%');
                    $("#adaptiveNum").html(funObject.formatNum(Math.floor(params.value / 2 + 987)));
                    $("#adaptivePercentage").html(randomNum2 + '%');

                })
            });
        },
        formatNum: function (num) {
            var newStr = "";
            var count = 0;
            var str = num.toString();

            for (var i = str.length - 1; i >= 0; i--) {
                if (count % 3 == 0 && count != 0) {
                    newStr = str.charAt(i) + "," + newStr;
                } else {
                    newStr = str.charAt(i) + newStr;
                }
                count++;
            }
            str = newStr;
            return str;
        }
    };
    funObject.eChartInit();
}