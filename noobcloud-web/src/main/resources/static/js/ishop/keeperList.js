/**
 * Created by hale on 2017/4/24.
 */

var keeperList = function () {
    var loginUser, loginUserDignity = 0, obj = {};

    obj.initialize = function () {
        var $ranking = $(".ranking");   // 当前排名
        var $selectQueryBaseAreas = $("#selectQueryBaseAreas"); // 地市下拉框
        var $selectQueryBase = $("#selectQueryBase");  // 营业厅下拉框
        var $areaTop = $(".area-top");  // 地市排行榜
        var $locationTop = $(".location-top");  // 渠道排行榜
        switch (loginUserDignity) {
            case 1: // 省级管理员
                $ranking.hide();
                $selectQueryBase.hide();
                break;
            case 2: // 地市管理员
                $selectQueryBaseAreas.hide();
                $ranking.show();
                break;
            case 3: // 营业厅管理员
                $selectQueryBaseAreas.hide();
                $areaTop.hide();
                $locationTop.css({"width": "100%", "margin-left": "0"});
                $selectQueryBase.show();
                // $ranking.show();
                break;
        }
    }

    /**
     * 加载数据
     */
    obj.initData = function (type) {
        if (loginUserDignity == 1) {
            if (type !== "query") {
                obj.initDateTime();         // 时间初始化
                obj.initAreaSelect();       // 地市下拉框
                obj.initSceneSelect();      // 场景下拉框
            }
            obj.getFetchFeeOverview();      // 业务累计笔数、总额
            obj.fetchAreaRank();            // 地市排行榜
            obj.fetchChannelRank();         // 渠道排行榜
        } else if (loginUserDignity == 2) {
            if (type !== "query") {
                obj.initDateTime();         // 时间初始化
                obj.initSceneSelect();      // 场景下拉框
            }
            obj.getFetchFeeOverview();      // 业务累计笔数、总额
            obj.fetchAreaRank();            // 地市排行榜
            obj.fetchChannelRank();         // 渠道排行榜
        } else {
            if (type !== "query") {
                obj.initDateTime();         // 时间初始化
                obj.initBaseSelect();       // 营业厅下拉框
                obj.initSceneSelect();      // 场景下拉框
            }
            obj.getFetchFeeOverview();      // 业务累计笔数、总额
            obj.fetchChannelRank();         // 渠道排行榜
        }
    }

    /**
     * 加载事件
     */
    obj.initEvent = function () {
        $("#btnQuery").click(function () {
            obj.initData("query");
        });
    }

    /**
     * 时间控件初始化
     */
    obj.initDateTime = function () {
        $("#startTime").val(new Date().getDelayDay(-1).format("yyyy-MM-dd"));
        $("#endTime").val(new Date().getDelayDay(0).format("yyyy-MM-dd"));
    }

    /**
     * 搜索栏 地市下拉框
     */
    obj.initAreaSelect = function () {
        var $baseAreaSelect = $("#selectQueryBaseAreas");
        globalRequest.iKeeper.fetchAreaOverview(false, {}, function (data) {
            $baseAreaSelect.empty();
            $baseAreaSelect.append("<option value='A'>B</option>".replace(/A/g, "").replace(/B/g, "请选择地市"));
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    $baseAreaSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].value).replace(/B/g, data[i].name));
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    }

    /**
     * 搜索栏 场景下拉框
     */
    obj.initSceneSelect = function () {
        var $SceneSelect = $("#selectQueryScene");
        globalRequest.iKeeper.fetchActivityOverview(false, {}, function (data) {
            $SceneSelect.empty();
            $SceneSelect.append("<option value='A'>B</option>".replace(/A/g, "").replace(/B/g, "请选择场景"));
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    $SceneSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].value).replace(/B/g, data[i].name));
                }
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    }

    /**
     * 搜索栏 营业厅下拉框
     */
    obj.initBaseSelect = function () {
        var $baseSelect = $("#selectQueryBase");
        globalRequest.iKeeper.fetchChannelOverview(false, {}, function (data) {
            $baseSelect.empty();
            $baseSelect.append("<option value='A'>B</option>".replace(/A/g, "").replace(/B/g, "请选择营业厅"));
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    $baseSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].value).replace(/B/g, data[i].name));
                }
            }
        }, function () {
            layer.alert("系统异常，获取营业厅失败", {icon: 6});
        });
    }

    /**
     * 业务累计笔数、总额
     */
    obj.getFetchFeeOverview = function () {
        var $shopKeeperCount = $("#shopKeeperCount"),
            shopKeeperAmount = $("#shopKeeperAmount");

        var params = obj.getParams(1);
        if (params["startDate"].getDateNumber() - params["endDate"].getDateNumber() > 0) {
            layer.alert("开始时间不能大于结束时间", {icon: 5});
            return;
        }
        globalRequest.iKeeper.fetchFeeOverview(false, params, function (data) {
            if (data) {
                $shopKeeperCount.text(data.shopKeeperCount);
                shopKeeperAmount.text(data.shopKeeperAmount);
            }
        }, function () {
            $shopKeeperCount.text(0);
            shopKeeperAmount.text(0);
        })
    }

    /**
     * 地市排行榜
     */
    obj.fetchAreaRank = function () {
        var $cityTable = $(".cityRankingTable"),
            $cityTableBody = $cityTable.find("tbody"),
            $ranking = $(".ranking"),
            $rankText = $("#currentRanking");

        var params = obj.getParams(2);
        if (params["startDate"].getDateNumber() - params["endDate"].getDateNumber() > 0) {
            layer.alert("开始时间不能大于结束时间", {icon: 5});
            return;
        }
        globalRequest.iKeeper.fetchAreaRank(false, params, function (data) {
            $cityTableBody.empty();
            var $tr = "";
            if (data && data.dataList.length > 0) {
                var list = data.dataList;
                var rank = data.rank;

                console.log("fetchAreaRank rank:" + rank);

                for (var i = 0; i < list.length; i++) {
                    var className = rank == list[i].rank ? "active" : "";
                    $tr += "<tr class='" + className + "'><td>" + list[i].rank + "</td><td data-areaCode=" + list[i].areaCode + ">" + list[i].areaName + "</td><td>" + list[i].totalNum + "</td></tr>";
                }
                $cityTableBody.append($tr);

                if (loginUserDignity == 2) {
                    if (rank) {
                        if (rank == -1) {
                            $rankText.text("尚未发展");
                        } else {
                            $rankText.text(rank);
                        }
                        $ranking.show();
                    } else {
                        $rankText.text(0);
                        $ranking.hide();
                    }
                }
            } else {
                $tr += "<tr><td colspan='3'>暂无业务记录</td></tr>";
                $cityTableBody.append($tr);
            }
        }, function () {
        })
    }

    /**
     * 渠道排行榜（前10）
     */
    obj.fetchChannelRank = function () {
        var $channelTable = $(".channelRankingTable"),
            $channelTableBody = $channelTable.find("tbody"),
            $ranking = $(".ranking"),
            $rankText = $("#currentRanking");

        var params = obj.getParams(3);
        if (params["startDate"].getDateNumber() - params["endDate"].getDateNumber() > 0) {
            layer.alert("开始时间不能大于结束时间", {icon: 5});
            return;
        }
        globalRequest.iKeeper.fetchChannelRank(false, params, function (data) {
            $channelTableBody.empty();
            var $tr = "";
            if (data) {
                var rank = data.rank;

                //数据显示部分
                if (data.dataList.length > 0) {
                    var list = data.dataList;
                    for (var i = 0; i < list.length; i++) {
                        var className = rank == list[i].rank ? "active" : "";
                        $tr += "<tr class='" + className + "'><td>" + list[i].rank + "</td><td data-areaCode=" + list[i].areaCode + ">" + list[i].channeName + "</td><td>" + list[i].channelCode + "</td></tr>";
                    }
                    $channelTableBody.append($tr);
                } else {
                    $tr += "<tr><td colspan='3'>暂无业务记录</td></tr>";
                    $channelTableBody.append($tr);
                }

                //排名显示部分
                if (loginUserDignity == 3) {
                    if (rank) {
                        if (rank == -1) {
                            $rankText.text("尚未发展");
                        } else {
                            $rankText.text(rank);
                        }
                        $ranking.show();
                    } else {
                        $rankText.text(0);
                        $ranking.hide();
                    }
                }
            }

            obj.setLocationTitle();
        }, function () {
        })
    }

    /**
     * 设置渠道排名标题
     */
    obj.setLocationTitle = function () {
        var $selectQueryBaseAreas = $("#selectQueryBaseAreas"),
            $label = $(".location-top label");
        if (loginUserDignity == 1) {
            var cityName = $selectQueryBaseAreas.val() ? $selectQueryBaseAreas.find("option:selected").text() : "";
            $label.text(cityName + "渠道排行榜(前10)")
        } else if (loginUserDignity == 2) {
            $(".location-top label").text(loginUser.areaName + "渠道排行榜(前10)");
        }
    }

    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            $("#loginUser").val(data.loginUser.id);
            loginUser = data.loginUser;
            if (loginUser.businessHallIds === '') {
                if (loginUser.areaCode === 99999) { // 省级管理员
                    loginUserDignity = 1;
                } else {    // 地市管理员
                    loginUserDignity = 2;
                }
            } else {    // 营业厅管理员
                loginUserDignity = 3;
            }
            console.log("loginUserDignity:" + loginUserDignity);
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 5});
        });
    }

    /**
     * 获取请求参数
     * @param type
     */
    obj.getParams = function (type) {
        var startTime = $("#startTime").val(),
            endTime = $("#endTime").val(),
            baseAreaId = $("#selectQueryBaseAreas").val(),
            baseId = $("#selectQueryBase").val(),
            activityId = $("#selectQueryScene").val(),
            orgType = "",
            params = {};

        if (loginUserDignity == 1) {
            if ($("#selectQueryBaseAreas").val()) {
                orgType = 2;
            } else {
                orgType = 1;
            }
        } else if (loginUserDignity == 3) {
            orgType = 3;
        }

        // orgType
        switch (type) {
            case 1: // 业务累计笔数、总额
                params["startDate"] = startTime;
                params["endDate"] = endTime;
                params["orgType"] = orgType;
                params["activityId"] = activityId;

                if (loginUserDignity == 1) {
                    params["orgCode"] = baseAreaId;
                } else if (loginUserDignity == 2) {
                    params["orgCode"] = "";
                } else {
                    params["orgCode"] = baseId;
                }
                return params;
            case 2:     // 地市排行榜
                params["startDate"] = startTime;
                params["endDate"] = endTime;
                params["activityId"] = activityId;

                if (loginUserDignity == 1) {
                    params["areaCode"] = baseAreaId;
                } else if (loginUserDignity == 2) {
                    params["areaCode"] = "";
                } else {
                    params["areaCode"] = baseId;
                }
                return params;
            case 3: // 渠道排行榜（前10）
                params["startDate"] = startTime;
                params["endDate"] = endTime;
                params["channelCode"] = baseId;
                params["activityId"] = activityId;

                if (loginUserDignity == 1) {
                    params["areaCode"] = baseAreaId;
                    params["channelCode"] = "";
                } else if (loginUserDignity == 2) {
                    params["areaCode"] = "";
                    params["channelCode"] = "";
                } else {
                    params["areaCode"] = "";
                    params["channelCode"] = baseId;
                }
                return params;
        }
    }

    /**
     * loading框
     * @param flag
     */
    obj.loading = function (flag) {
        $html.loading(flag);
    }

    /**
     * 页面元素显示
     */
    obj.show = function () {
        $(".query-row").show();
        $(".list-row").show();
        $(".table-row").show();
        $(".channelRankingTable").height(($(".cityRankingTable").height() + 7));
    }

    return obj;
}()

function onLoadBody() {
    keeperList.loading(true);
    keeperList.getLoginUser();
    keeperList.initialize();
    keeperList.initData();
    keeperList.initEvent();
    keeperList.loading(false);
    keeperList.show();
}




