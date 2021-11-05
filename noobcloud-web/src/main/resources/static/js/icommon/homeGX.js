/**
 * Created by Administrator on 2016/11/28.
 */
function onLoadBody(){
    initMarketCharts();

    loadWillDoData();

    initEvent();
    //保持显示框位置
    $(window).trigger("resize");
}

function initMarketCharts(){
    var userCountChart = echarts.init($('div.userCountChart')[0]);
    var userProportionChart = echarts.init($('div.userProportionChart')[0]);
    var user4GProportionChart = echarts.init($('div.user4GProportionChart')[0]);
    var result = [];
    var defaultData = {};
    var max = 2500;

    globalRequest.queryUserDistribution(true,{},function(data){

        for (var i=0;i<data.length;i++){
            var marketUserInfo = {name:data[i].name,value:data[i].value,rate:data[i].userCountRate,rate4G:data[i].userCount4GRate};
            result.push(marketUserInfo);
            max = max < data[i].value?data[i].value:max;
            if (data[i].name == "南宁市"){
                defaultData = marketUserInfo;
                marketUserInfo["selected"] = true;
            }
        }
        initGxUserDistribution(result);
    });

    function initGxUserDistribution(data){
        var userCountOption = {
            title : {
                text: '广西省存量用户分布',
                x:'left'
            },
            tooltip : {
                trigger: 'item'
            },
            dataRange: {
                min: 0,
                max: parseInt(max),
                x: 'left',
                y: 'bottom',
                text:['高','低'],
                calculable : true
            },
            series : [
                {
                    name: '用户数',
                    type: 'map',
                    mapType: '广西',
                    roam: false,
                    selectedMode : 'single',
                    itemStyle:{
                        normal:{label:{show:true}},
                        emphasis:{label:{show:true}}
                    },
                    data:data
                }
            ],
            animation: false
        };
        userCountChart.on(echarts.config.EVENT.MAP_SELECTED, function (param){
            var datas = this.getSeries()[0].data;
            for (var i=0;i<datas.length;i++){
                 if (datas[i].name == param.target){
                    initUserProportion(datas[i]);
                }
            }
        });

        userCountChart.setOption(userCountOption);

        initUserProportion(defaultData);

        function initUserProportion(data){
            var width = $("div.userDataShow").width();
            var userProportionOption = {
                tooltip : {
                    formatter: "{b} : {c}%"
                },
                series : [
                    {
                        type:'gauge',
                        startAngle: 180,
                        endAngle: 0,
                        center : ['50%', '93%'],
                        radius : width*0.38,
                        axisLine: {
                            lineStyle: {
                                width: width*0.38*0.25
                            }
                        },
                        axisTick: {
                            show:false
                        },
                        splitLine:{
                            show:false
                        },
                        axisLabel: {
                            formatter: function(v){
                                return '';
                            },
                            textStyle: {
                                color: '#fff',
                                fontSize: 15,
                                fontWeight: 'bolder'
                            }
                        },
                        pointer: {
                            width:20,
                            length: '90%',
                            color: 'rgba(200, 200, 200, 0.8)'
                        },
                        title : {
                            show : true,
                            offsetCenter: [0, '-40%'],
                            textStyle: {
                                color: '#000',
                                fontSize: 25
                            }
                        },
                        detail : {
                            show : true,
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderWidth: 0,
                            borderColor: '#ccc',
                            width: 100,
                            height: 40,
                            offsetCenter: [0, -20],
                            formatter:'{value}%',
                            textStyle: {
                                fontSize : 25
                            }
                        },
                        data:[{value: data.rate, name: data.name}]
                    }
                ]
            };

            var userProportion4GOption = {
                tooltip : {
                    formatter: "{b} : {c}%"
                },
                series : [
                    {
                        type:'gauge',
                        startAngle: 180,
                        endAngle: 0,
                        center : ['50%', '93%'],
                        radius : width*0.38,
                        axisLine: {
                            lineStyle: {
                                width: width*0.38*0.25
                            }
                        },
                        axisTick: {
                            show:false
                        },
                        splitLine:{
                            show:false
                        },
                        axisLabel: {
                            formatter: function(v){
                                return '';
                            },
                            textStyle: {
                                color: '#fff',
                                fontSize: 15,
                                fontWeight: 'bolder'
                            }
                        },
                        pointer: {
                            width:20,
                            length: '90%',
                            color: 'rgba(200, 200, 200, 0.8)'
                        },
                        title : {
                            show : true,
                            offsetCenter: [0, '-40%'],
                            textStyle: {
                                color: '#000',
                                fontSize: 25
                            }
                        },
                        detail : {
                            show : true,
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderWidth: 0,
                            borderColor: '#ccc',
                            width: 100,
                            height: 40,
                            offsetCenter: [0, -20],
                            formatter:'{value}%',
                            textStyle: {
                                fontSize : 25
                            }
                        },
                        data:[{value: data.rate4G, name:data.name}]
                    }
                ]
            };

            userProportionChart.setOption(userProportionOption);
            user4GProportionChart.setOption(userProportion4GOption);
        }
    }
}

function loadWillDoData(){
    var modelWaitingAuditTab,taskWaitingAuditTab,toBeExecutedTab,todayModelTab;
    var names = {"1":["modelWaitingAudit","待审批模型"],"2":["taskWaitingAudit","待审批任务"],"3":["toBeExecuted","待执行任务"],"4":["todayModel","今日客户群"]};
    var buttons = [];
    globalRequest.queryMyTodoTaskColumn(true,{},function(data){
        for (var i = 0;i< data.length; i++)
        {
            buttons.push("<div class='"+names[data[i]][0]+"Button' refDiv='"+names[data[i]][0]+"Info' data-value='"+data[i]+"' refTab='"+names[data[i]][0]+"Tab'><span>"+names[data[i]][1]+"</span></div><span class='btnSplit'></span>");
            $(".detailInfos").append("<div class='detailInfo "+names[data[i]][0]+"Info col-md-12'><table class='"+names[data[i]][0]+"Tab iDataTable table table-hover table-condensed table-bordered dataTable no-footer' width='100%'></table></div>");
            //eval("initData_"+data[i])($("div.jobDetailBtn div[data-value = "+data[i]+"]").attr("refTab"));
            eval("initData_"+data[i])(names[data[i]][0]+"Tab",data[i]);
        }
        $(".jobDetailBtn").append(buttons.join(""));
        initSubEvent();
        $(".jobDetailBtn").find("div:first").trigger("click");
    });

    function initData_1(refTab,refVal) {
        var options = {
            ele: $("div.detailInfo table."+refTab),
            ajax: {url: "queryMyTodoTask.view?type="+refVal, type: "POST"},
            columns: [
                {data: "name", title: "客户群名称", width: 60, className: "dataTableFirstColumns"},
                {data: "id", visible: false},
                {
                    data: "createType", title: "创建类型", width: 60, render: function (data, type, row) {
                    if (data == "rule") {
                        return "规则创建"
                    } else if (data == "localImport") {
                        return "本地导入创建"
                    } else if (data == "remoteImport") {
                        return "远程导入创建"
                    }
                }
                },
                {data: "catalogName", title: "目录", width: 60},
                {
                    data: "createTime", title: "创建时间", width: 60,
                    render: function (data, type, row) {
                        var str = row.createTime;
                        var date = new Date(str);
                        return date.format("yyyy-MM-dd");
                    }
                },
                {data: "remarks", title: "备注", width: 90, defaultContent: ""},
                {
                    data: "status", title: "状态", width: 60,
                    render: function (data, type, row) {
                        return row.status == 2 ? "待审批" : "审核完成";
                    }
                }/*,
                {
                    title: "操作", width: 80,
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-info\" title='审批' onclick=\"auditModel.evtOnShow('" + row.name + "','" + row.id + "')\">审批</a>"
                    }
                }*/
            ]
        };
        modelWaitingAuditTab = $plugin.iCompaignTable(options);
    }

    function initData_2(refTab,refVal) {
        var option = {
            ele: $("div.detailInfo table."+refTab),
            ajax: {url: "queryMyTodoTask.view?type="+refVal, type: "POST"},
            columns: [
                {data: "name", title: "任务名称", className: "dataTableFirstColumns"},
                {
                    data: "marketType", title: "来源",
                    render: function (data, type, row) {
                        return getMarketType(data);
                    }
                },
                {
                    data: "businessType", title: "业务类别",
                    render: function (data, type, row) {
                        return getBusinessType(data);
                    }
                },
                {data: "startTime", title: "开始时间"},
                {data: "stopTime", title: "结束时间"},
                {data: "createTime", title: "配置时间"},
                {data: "marketSegmentNames", title: "目标用户", width: "10%"},
                {
                    data: "status", title: "状态", className: "centerColumns", width: "6%",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa'>草稿</i>";
                        } else if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>待审核</i>";
                        } else if (row.status == 2) {
                            return "<i class='fa' style='color: green;'>审核成功</i>";
                        } else if (row.status == 3) {
                            return "<i class='fa' style='color: red;'>审核拒绝</i>";
                        } else if (row.status == 4) {
                            return "<i class='fa' style='color: blue;'>已暂停</i>";
                        } else if (row.status == 5) {
                            return "<i class='fa' style='color: blue;'>已失效</i>";
                        } else if (row.status == 6) {
                            return "<i class='fa' style='color: red;'>已终止</i>";
                        } else if (row.status == 20 || row.status == 30) {
                            return "<i class='fa' style='color: blue;'>营销处理中</i>";
                        } else if (row.status == 35) {
                            return "<i class='fa' style='color: green;'>营销成功</i>";
                        } else if (row.status == 36) {
                            return "<i class='fa' style='color: red;'>营销失败</i>";
                        } else if (row.status == -1) {
                            return "<i class='fa' style='color: red;'>已删除</i>";
                        } else {
                            return "<i class='fa'>未知</i>";
                        }
                    }
                }/*,
                {
                    title: "操作",
                    render: function (data, type, row) {
                        return "<a id='\"sp\"' class=\"btn btn-primary btn-preview btn-sm\" style='background-color:#00B38B;border-color:#00B38B;color:#fff' title='审批' onclick=\"auditMarket.evtOnShow('" + row.name + "','" + row.id + "')\">审批</a>"
                    }
                }*/
            ]
        };
        taskWaitingAuditTab = $plugin.iCompaignTable(option);
    }

    function initData_3(refTab,refVal){
        var options = {
            ele: $("div.detailInfo table."+refTab),
            ajax: {url: "queryMyTodoTask.view?type="+refVal, type: "POST"},
            columns: [
                {data: "name", title: "任务名称", className: "dataTableFirstColumns"},
                {
                    data: "marketType", title: "来源",
                    render: function (data, type, row) {
                        return getMarketType(data);
                    }
                },
                {
                    data: "businessType", title: "业务类别",
                    render: function (data, type, row) {
                        return getBusinessType(data);
                    }
                },
                {data: "startTime", title: "开始时间"},
                {data: "stopTime", title: "结束时间"},
                {data: "createTime", title: "配置时间"},
                {data: "marketSegmentNames", title: "目标用户"},
                {
                    data: "status", title: "状态", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 0) {
                            return "<i class='fa'>草稿</i>";
                        } else if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>待审核</i>";
                        } else if (row.status == 2 || row.status == 40) {
                            return "<i class='fa' style='color: green;'>审核成功</i>";
                        } else if (row.status == 3) {
                            return "<i class='fa' style='color: red;'>审核拒绝</i>";
                        } else if (row.status == 4) {
                            return "<i class='fa' style='color: blue;'>已暂停</i>";
                        } else if (row.status == 5) {
                            return "<i class='fa' style='color: blue;'>已失效</i>";
                        } else if (row.status == 6) {
                            return "<i class='fa' style='color: red;'>已终止</i>";
                        } else if (row.status == 20 || row.status == 30 ) {
                            return "<i class='fa' style='color: blue;'>营销处理中</i>";
                        } else if (row.status == 35) {
                            return "<i class='fa' style='color: green;'>营销触发成功</i>";
                        } else if (row.status == 36) {
                            return "<i class='fa' style='color: red;'>营销失败</i>";
                        }
                        else if (row.status == -1) {
                            return "<i class='fa' style='color: red;'>已删除</i>";
                        } else {
                            return "<i class='fa'>未知</i>";
                        }
                    }
                }/*,
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var buttons = "", executeHtml = "",firstExecuteHtml = "",
                            viewBtnHtml = "<a  title='预览' class='viewBtn btn btn-primary btn-preview btn-sm' href='javascript:void(0)' onclick='taskMgr.viewItem(" + JSON.stringify(row) + "," + status + " )'>预览</a>";
                        if (globalConfigConstant.loginUser.id == row.createUser) {
                            executeHtml = "<a title='执行' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.executeTask(" + row.id + ",\"" + row.name + "\")' >执行</a>";
                            firstExecuteHtml = "<a title='首次执行确认' class='manuBtn btn btn-success btn-edit btn-sm' href='javascript:void(0)' onclick='taskMgr.executeTask(" + row.id + ",\"" + row.name + "\")' >首次执行确认</a>";
                        }

                        buttons = viewBtnHtml;
                        if (row.scheduleType == 'manu') {
                            if (row.status == 2) {
                                buttons += executeHtml;
                            }
                        }
                        if (row.scheduleType == 'single') {
                            if (row.isFistStatus == 2 && row.status == 2) {
                                buttons += firstExecuteHtml;
                            }
                        }
                        return buttons;
                    }
                },
                {data: "id", visible: false}*/
            ]
        };
        toBeExecutedTab = $plugin.iCompaignTable(options);
    }

    function initData_4(refTab,refVal){
        var option = {
            ele: $("div.detailInfo table."+refTab),
            ajax: {url: "queryMyTodoTask.view?type="+refVal, type: "POST"},
            columns: [
                {
                    data: "name", title: "模型名称", className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        return "<span title='" + row.name + "' style='width:100px;word-break: break-all;display: -webkit-box;overflow: hidden;-webkit-line-clamp: 2;-webkit-box-orient: vertical;'>" + row.name + "</span>";
                    }
                },
                {
                    data: "createType", title: "创建类型",
                    render: function (data, row) {
                        if ('localImport' == data){
                            return '本地导入';
                        } else if ('rule' == data) {
                            return '规则创建';
                        }
                    }
                },
                {data: "catalogName", title: "目录"},
                {data: "createUserName", title: "创建人"},
                {data: "createTime", title: "创建时间"},
                {data: "lastRefreshSuccessTime", title: "刷新时间"},
                {data: "lastRefreshCount", title: "人数"},
                {data: "rule", visible: false}
            ]
        };
        todayModelTab = $plugin.iCompaignTable(option);
    }

    function initSubEvent(){
        $("div.iMarket_Home_Body .jobDetailBtn div").click(function(){
            var refMap = {"modelWaitingAuditInfo":modelWaitingAuditTab,"taskWaitingAuditInfo":taskWaitingAuditTab,"toBeExecutedInfo":toBeExecutedTab,"todayModelInfo":todayModelTab}
            var $this = $(this),ref = $this.attr("refDiv");
            $this.addClass("active").siblings("div").removeClass("active");
            $(".detailInfos div.detailInfo").hide();
            $(".detailInfos div."+ref).show();
            refMap[ref].ajax.reload();
        });
    }

    var getMarketType = function (type) {
        switch (type) {
            case "sms":
                return "周期任务";
            case "scenesms":
                return "场景任务";
            case "jxhscene":
                return "精细化实时任务";
            case "jxhsms":
                return "精细化周期任务";
            default:
                return "未知";
        }
    };

    var getBusinessType = function (_type) {
        var type = parseInt(_type)
        switch (type) {
            case 1:
                return "互联网综合业务";
            case 2:
                return "内容营销";
            case 3:
                return "流量经营";
            case 4:
                return "APP场景营销";
            default:
                return "未知";
        }
    }
}

function initEvent(){
    $(window).resize(function(){
        var width = $("div.iMarket_Home_Body div.urgentCall").outerWidth();
        $("div.iMarket_Home_Body div.urgentCall div.urgentCall_reminder").css("top",((435-width)/10-30)+"%")
    });

    $("div.iMarket_Home_Body div.reminder_content").on("click","b",function(){
        var className = $(this).attr("class");
        $("#menuTree").find("a."+className).trigger("click");
    });
}