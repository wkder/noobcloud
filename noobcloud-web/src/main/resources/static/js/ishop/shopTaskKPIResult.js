var shopTaskKPIResult = function () {
    var obj = {};
    var date;//全局的保存查询之后的时间维度
    var businessHallName;//全局保存的营业厅名称
    var viewIndex, pageCount, perPage, firstLoadCount,counts;
    var cityCode;//城市代码
    //初始化变量值
    var initData = function () {
        counts = 0;//共0条记录
        viewIndex = 1;
        pageCount = 1;
        perPage = 10;//每页10条数据
    };
    //加载时间参数
    obj.initDate = function () {
        $('.executeTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    };
    //加载查询条件
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $(".qryBaseAreas");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    };

    //加载主页数据
    obj.initBody = function () {
        initData();
        var paras = getParams();
        date = paras.date;
        $(".table_element_body").css("display", "inline");
        $(".table_business_hall_body").css("display", "none");
        globalRequest.queryShopTaskKPI(true, paras, function (data) {
            initChart(data);
            initTable(data);
        }, function () {
            layer.alert("系统异常", {icon: 6});
        });

        function getParams() {
            return {
                date: $(".iMarket_ShopTaskKPI_Body").find(".executeTime").val().replace(/-/g, ""),
                areaCode: $(".iMarket_ShopTaskKPI_Body").find(".qryBaseAreas").val()
            }
        }

        function queryHalls() {
            return {
                date: $(".iMarket_ShopTaskKPI_Body").find(".executeTime").val().replace(/-/g, ""),
                businessHallName: $.trim($("#businessHall").val())
            }
        }

        function initChart(data) {
            
            //1、初始化
            require.config({paths: {echarts: 'ext/echarts'}});
            var yAxisData = ['任务量', '任务执行量'];
            //var paras = getParams();
            var barDataArray = [], previousNum;
            //$.each(data.items, function (idx, val) {
            //    if (val.code == paras.areaCode) {
            //        barDataArray.push(val.num);
            //        barDataArray.push(val.executeNum);
            //        previousNum = (val.executeNum / val.num * 100).toFixed(2);
            //    }
            //});

            if (data.items) {
                var paras = getParams();
                $.each(data.items, function (idx, val) {
                    if (val.code == paras.areaCode) {
                        barDataArray.push(val.num);
                        barDataArray.push(val.executeNum);
                        previousNum = (val.executeNum / val.num * 100).toFixed(2);
                    }
                });
            } else if (data.pageCount) {
                barDataArray.push(data.pageCount.allNum);
                barDataArray.push(data.pageCount.allExecuteNum);
                previousNum = (data.pageCount.allExecuteNum / data.pageCount.allNum * 100).toFixed(2);
            }

            var barData = [{
                name: '数量',
                data: barDataArray
            }];
            var funnelData = [{
                name: '上一步转化率',
                data: [{name: '任务量', value: 100}, {name: '任务执行量', value: previousNum}]
            }, {
                name: '总体转化率',
                data: [{name: '任务量', value: 100}, {name: '任务执行量', value: previousNum}]
            }];

            $.funnel('chart_fual', {yAxisData: yAxisData, barData: barData, funnelData: funnelData});
        }

        //切换到营业厅级信息
        obj.change = function (order) {
            firstLoadCount = 1;
            //修改搜索栏布局
            $("#executeTime").css("width", "160px");
            $(".qryBaseAreas").val(order).attr("disabled", "disabled").css("width", "120px");
            $("#businessHall").css("display", "inline-block");
            $("#query").unbind("click").bind("click", function () {
                //TODO 这里需要加上对输入框的正则验证
                firstLoadCount = 1;
                var queryData = queryHalls();
                firstLoad(order, queryData);

            });

            //更换表头
            $(".table_element_body").css("display", "none");
            $(".table_business_hall_body").css("display", "inline");
            $("#return").css("display", "inline-block");
            cityCode = order;
            //加载数据
            firstLoad(order);

        };

        function firstLoad(order, queryData) {
            /**
             * cityCode/order  城市代码
             * date      查询的时间维度，根据点击上一步的时间维度锁定过来的
             * offset    分页查询需要计算每次的偏移位置，当前是点击城市后第一次查询展示
             * limit     每个页面展示的条数
             */
            var data;
            if (queryData) {
                data = JSON.stringify({
                    cityCode: order,
                    date: queryData.date,
                    businessHallName: queryData.businessHallName,
                    offset: 0,
                    limit: perPage
                });
                date = queryData.date;
                businessHallName = queryData.businessHallName;

            } else {
                data = JSON.stringify({
                    cityCode: order,
                    date: date,
                    offset: 0,
                    limit: perPage
                })
            }
            $util.ajaxPost("queryBusinessHall.view", data, function (data) {
                initData();
                if (data.pageCount.counts > 0) {
                    var count = data.pageCount.counts;
                    counts = count;
                    pageCount = Math.floor(count / perPage);
                    pageCount += count % perPage > 0 ? 1 : 0;
                } else {
                    pageCount = 1;
                }
                if (firstLoadCount == 1) {
                    initChart(data);//加载图表
                    firstLoadCount ++;
                }
                page(data, cityCode);//加载表格和分页
            }, function () {
                layer.alert("系统异常", {icon: 6});
            })
        }

        //分页
        var page = function (data, order) {
            initTable(data);
            //绑定点击事件
            $("#page").delegate("a", "click", function () {
                
                if ($(this).hasClass('previous')) {
                    viewIndex--;
                } else if ($(this).hasClass('next')) {
                    viewIndex++;
                } else {
                    return;
                }
                var offset = (viewIndex - 1) * 10;
                $util.ajaxPost("queryBusinessHall.view", JSON.stringify({
                    cityCode: order,
                    date: date,
                    businessHallName: businessHallName,
                    offset: offset,
                    limit: perPage
                }), function (data) {
                    $("#page").remove();
                    //$(".iTable").find("#page").remove();
                    page(data, order);
                }, function () {
                    layer.alert("系统异常", {icon: 6});
                })
            })
        };

        //返回按钮
        obj.return = function () {
            $("#coreFrame").load("ishop/shopTaskKPIResult.requestHtml?time" + new Date().getTime(), function (response, sts, xhr) {
                if (xhr.status == 200) {
                    onLoadBody();
                } else if (xhr.status == 911) {
                    var redirectUrl = xhr.getResponseHeader("redirectUrl");
                    layer.alert('会话超时，请重新登录', function (index) {
                        window.location.href = redirectUrl;
                        layer.close(index);
                        return;
                    });
                }
            })
        };
        //加载table
        function initTable(data) {
            if (data.items && data.items.length > 0) {
                var html = template('taskSummary', {list: data.items});
                $("#dataTable tbody tr").remove();
                $("#dataTable tbody").append(html);
            }
            if (data.objs && data.objs.length > 0) {
                var html = template('taskHall', {list: data.objs});
                $("#businessTable tbody tr").remove();
                $("#businessTable tbody").append(html);
                var pageTemp = template('pageTemp', {pageCounts: pageCount, viewIndex: viewIndex,counts:counts,perPage:perPage});
                $(".iTable").find("#page").remove();
                $("#businessTable tfoot tr td").append(pageTemp);
            }
            if (data.items && data.items.length == 0) {
                var html = "<tr><td colspan='7'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("#dataTable tbody tr").remove();
                $("#dataTable tbody").append(html);
            }
            if (data.objs && data.objs.length == 0) {
                var html = "<tr><td colspan='5'><div class='noData'>暂无相关数据</div></td></tr></li>";
                $("#businessTable tbody tr").remove();
                $("#businessTable tbody").append(html);
                $("#businessTable tfoot").remove();
                //$(".iTable").find("#page").remove();
            }
        }
    };
    //加载事件
    obj.initEvent = function () {
        $(".iMarket_ShopTaskKPI_Body").find(".search").click(function () {
            obj.initBody();
        })
    };
    return obj;
}();

function onLoadBody(status) {
    shopTaskKPIResult.initAreaSelect();
    shopTaskKPIResult.initDate();
    shopTaskKPIResult.initBody();
    shopTaskKPIResult.initEvent();
}