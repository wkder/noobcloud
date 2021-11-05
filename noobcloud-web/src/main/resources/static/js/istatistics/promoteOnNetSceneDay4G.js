/**
 * Created by dtt on 2017/8/8.
 */

var promoteOnNetSceneDay4G = function () {
    var getUrl = "queryPromoteOnNetSceneDay4GByPage.view", obj = {}, dataTable;

    //初始化时间 事件
    obj.initDate = function () {
        $('#startTime').val(new Date().getDelayDay(-7).format('yyyy-MM-dd'));
        $('#endTime').val(new Date().getDelayDay(-1).format('yyyy-MM-dd'));
    };

    //初始化表格
    obj.initDataTable = function () {
        var params = getParam();
        var param = "startTime=" + params.startTime + "&endTime=" + params.endTime;
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: getUrl + "?" + param,
                type: "POST"
            },
            columns: [
                {title: "日期", width: "10%",
                    render: function (data, type, row) {
                        var show_date ;
                        if (row["timest"] == '' || row["timest"] == null) {
                            show_date = "--";
                        }else{
                            show_date=row["timest"];
                        }
                        return show_date;
                    }
                },
                {
                    title: "场景类型", width: "10%",
                    render: function (data, type, row) {
                        var sceneTypeName = "--";
                        if (row["scene_type"] == 2) {
                            sceneTypeName = "4G促登网";
                        }
                        return sceneTypeName;
                    }
                },
                {data: "scene_condition", title: "场景条件", width: "10%"},
                //{data: "catch_2guser_num", title: "捕捉短信营销用户数", width: "17%"},
                {
                    title: "捕捉短信营销用户数", width: "17%",
                    render: function (data, type, row) {
                        if (row["catch_2guser_num"] == '' || row["catch_2guser_num"] == null) {
                            return 0;
                        } else {
                            return row["catch_2guser_num"];
                        }
                    }
                },
                {
                    title: "捕捉4G登网用户数", width: "15%",
                    render: function (data, type, row) {
                        if (row["catch_user_num"] == '' || row["catch_user_num"] == null) {
                            return 0;
                        } else {
                            return row["catch_user_num"];
                        }
                    }
                },
                {
                    title: "产品赠送用户数", width: "15%",
                    render: function (data, type, row) {
                        if (row["gift_user_num"] == '' || row["gift_user_num"] == null) {
                            return 0;
                        } else {
                            return row["gift_user_num"];
                        }
                    }
                },

                {
                    title: "短信通知用户数", width: "15%",
                    render: function (data, type, row) {
                        if (row["send_user_num"] == '' || row["send_user_num"] == null) {
                            return 0;
                        } else {
                            return row["send_user_num"];
                        }
                    }
                },
                {
                    title: "分析", width: "8%",
                    render: function (data, type, row) {
                        var analyseHtml = "<a  title='跟踪分析' style='cursor:pointer' onclick='promoteOnnetSceneDay4G.viewItem(" + JSON.stringify(row.task_id) + " )'>跟踪分析</a>";
                        return analyseHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    //初始化 事件
    obj.initEvent = function () {
        //查询
        $("#btnQuery").click(function () {
            verifyDate();
            obj.evtOnQuery();
        });

        //指标
        $("#btnDescription").click(function () {
            obj.evtOnDescription();
        });
    }

    //查询 事件
    obj.evtOnQuery = function () {
        var param = getParam();
        var params = "startTime=" + param.startTime + "&endTime=" + param.endTime;
        $plugin.iCompaignTableRefresh(dataTable, getUrl + "?" + params);
    }

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
    }

    //跟踪分析 事件
    obj.viewItem = function () {

    }

    //日期校验
    function verifyDate() {
        var param = getParam();
        var startTime = param.startTime,
            endTime = param.endTime;
        if (startTime.getDateNumber() - endTime.getDateNumber() > 0) {
            layer.alert("起始日期请勿大于截止日期", {icon: 6});
            return;
        }
    }

    //获取时间参数
    function getParam() {
        return {
            startTime: $("#startTime").val().replace(/-/g, ""),
            endTime: $("#endTime").val().replace(/-/g, "")
        }
    }

    return obj;
}()

function onLoadBody() {
    promoteOnNetSceneDay4G.initDate();
    promoteOnNetSceneDay4G.initDataTable();
    promoteOnNetSceneDay4G.initEvent();
}