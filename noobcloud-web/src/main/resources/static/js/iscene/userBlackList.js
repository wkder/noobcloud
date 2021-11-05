var userBlackList = function () {
    var dataTable, taskdataTable;
    var getGetUserbltUrl = "getUserBlackList.view";
    var deleteUrl = "deleteUserBlackList.view";
    var createUrl = "addUserBlackList.view";
    var getTaskListUrl = "getTaskListForUserBlack.view";
    var obj = {};

    obj.initData = function () {
        obj.dataTableInit();

    };

    obj.initEvent = function () {
        $("#btnAdd").click(obj.evtOnAdd);                       //弹窗 新增 用户黑名单
        $("#btnAddOrEdit").click(obj.evtOnAddOrEdit);           //保存 用户黑名单
        $("#btnQuery").click(obj.evtOnQuery);                   //查询 手机号
        $("#btnRefresh").click(obj.evtOnRefresh);               //刷新
        $("#btnQuerySecond").click(obj.evtOnQuerySecond);       //查询 任务
        $("#btnConfirm").click(obj.evtOnConfirm);               //确认选择 任务列表
        $("#shieldtype").change(obj.changeType);                //屏蔽类型 下拉菜单 切换
        $("#selIsShielding").change(obj.IsShielding);
        $("#navname").click(obj.evtOnOpenTask);                 //弹窗 选择任务
    };

    obj.dataTableInit = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {url: getGetUserbltUrl + "?mob=" + $('#txtQuery').val() + "", type: "Post"},
            columns: [
                {data: "mobile", title: "手机号码", width: 200, className: "dataTableFirstColumns"},
                {
                    title: "任务名称", width: 300,
                    render: function (data, type, row) {
                        var names = row.taskName;
                        if (names.length > 0) {
                            if (names.split(',').length > 3) {
                                names = "";
                                for (var i = 0; i < 3; i++) {
                                    names += row.taskName.split(',')[i] + "，";
                                }
                                names = names + "...";
                            }
                        }
                        return "<span title='" + row.taskName + "'>" + names + "</span>";
                    }
                },
                {
                    title: "开始时间", width: 160,
                    render: function (data, type, row) {
                        if (row.blockStart == null || row.blockStart === "") {
                            return "";
                        }
                        return row.blockStart.replace("T", " ");
                    }
                },
                {
                    title: "结束时间", width: 160,
                    render: function (data, type, row) {
                        if (row.blockEnd == null || row.blockEnd === "") {
                            return "";
                        }
                        return row.blockEnd.replace("T", " ");
                    }
                },
                {
                    title: "操作", width: 80,
                    render: function (data, type, row) {
                        return "<a type='button' class='btn btn-danger btn-edit' title='删除' onclick='userBlackList.evtOnDelUserBlack(\"" + row.id + "\")'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    //查询手机号码
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getGetUserbltUrl + "?mob=" + encodeURIComponent($('#txtQuery').val()) + "");
        dataTable.ajax.reload();
    };

    // 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getGetUserbltUrl);
        dataTable.ajax.reload();
    };

    // 新增 黑名单用户
    obj.evtOnAdd = function () {
        //layerIndex = dspLayer(dspWindowH, $('#popupAddOrEdit'), reset);
        layer.open({
            type: 1,
            title: "新增黑名单用户",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                //var id = 0;
                //var name = $("#txtName").val();
                obj.evtOnAddOrEdit(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        obj.reset();
    };

    // 保存 黑名单用户
    obj.evtOnAddOrEdit = function (index) {
        //验证
        if (!$("#popupAddOrEdit").autoVerifyForm())return;

        var mob = $('#txtmob').val();
        var blockstm = "", blocketm = "";
        var taskid = $('#navid').val();          //导航任务名称
        if ($("#selIsShielding").val() == "0") {    //不屏蔽任务 taskid为-1
            taskid = "-1";
        }
        var type = $('#shieldtype option:selected').val(); //屏蔽类型
        var time = $('#shieldtime option:selected').val(); //周期屏蔽时间
        if (type === "2") {
            blockstm = $('#d4311').val();
            blocketm = $('#d4312').val();
        }

        setTimeout(function () {
            var oData = {};
            oData["Mob"] = $.trim(mob);
            oData["TaskId"] = $.trim(taskid);
            oData["BlockStartTime"] = $.trim(blockstm);
            oData["BlockEndTime"] = $.trim(blocketm);
            oData["BlockType"] = $.trim(type);
            oData["Time"] = $.trim(time);//周期屏蔽时间

            $util.ajaxPost(createUrl, JSON.stringify(oData),
                function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        dataTable.ajax.reload();
                        layer.close(index);
                    }
                    else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning('操作失败！');
                });
        });
        layer.close(index);
    };

    // 屏蔽类型 下拉菜单 切换
    obj.changeType = function () {
        var value = $('#shieldtype').val();
        if (value === '1') {
            $("#trStartTime").hide();
            $("#trEndTime").hide();
            $("#trTimeShielding").show();
        }
        else {
            $("#trTimeShielding").hide();
            $("#trStartTime").show();
            $("#trEndTime").show();
        }
    };

    // 是否屏蔽 下拉菜单 切换
    obj.IsShielding = function () {
        var value = $('#selIsShielding').val();
        if (value === '0') { //不屏蔽
            $("#trTask").hide();
        }
        else {  //屏蔽
            $("#trTask").show();
        }
    };

    // 复选框选中
    obj.taskCheck = function () {
        var checked = $('#ischeck')[0].checked;
        if (checked) {
            $('#navname').readonly = false;
            $('#navtask').show();
        }
        else {
            $('#navname').readonly = true;
            $('#navtask').hide();
        }
    };
    // 弹出任务列表
    obj.evtOnOpenTask = function () {

        if (taskdataTable == null) {
            obj.taskdataTableInit();
        }
        //layerIndexTwo = dspLayer(dspWindowH, $('#popTasklist'));
        layer.open({
            type: 1,
            title: "任务列表",
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['1000px', '700px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popTasklist'),
            yes: function (index, layero) {
                //var id = 0;
                //var name = $("#txtName").val();
                //obj.evtOnAddOrEdit();
                obj.evtOnConfirm(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    };

    // 弹出任务列表
    obj.taskdataTableInit = function () {
        var option = {
            ele: $('#taskdatatable'),
            ajax: {url: getTaskListUrl + "?taskName=" + $('#txtQueryNav').val() + "", type: "POST"},
            info: false,
            columns: [
                {
                    title: "<input type='checkbox' id='checkall' name='tasklistChk' style='margin-right:10px' onclick='userBlackList.ChooseAll()'>",
                    width: 30,
                    render: function (data, type, row) {
                        return "<input type='checkbox' id='subcheck' name='tasklistChk' dataid='" + row.id + "' dataname='" + row.taskName + "'>";
                    }
                },
                {data: "id", title: "序号", width: 40},
                {data: "taskName", title: "任务名", width: 120},
                {
                    title: "触发形态", width: 100,
                    render: function (data, type, row) {
                        return "<img src='" + row.imgUrl + "' class='nStyle' />";
                    }
                },
                {data: "sceneSort", title: "优先级", width: 60},
                {
                    title: "起止日期", width: 80,
                    render: function (data, type, row) {
                        return row.startTime.substring(0, 10) + "<br />" + row.endTime.substring(0, 10);
                    }
                },
                {
                    title: "触发时段", width: 80,
                    render: function (data, type, row) {
                        return row.onLineTm + "<br />" + row.offLineTm;
                    }
                },
                {
                    title: "网址分类", width: 100,
                    render: function (data, type, row) {
                        var names = row.urlGroupName;
                        return "<span style='word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;overflow: hidden;' title='" + row.urlGroupName + "'>" + names + "</span>";
                    }
                },
                {
                    title: "用户群", width: 100,
                    render: function (data, type, row) {
                        var names = row.userGroupName;
                        if (names.length > 8) {
                            names = names.substring(0, 8) + '...';
                        }
                        return "<span style='word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;overflow: hidden;' title='" + row.userGroupName + "'>" + names + "</span>";
                    }
                },
                {
                    title: "地理位置", width: 100,
                    render: function (data, type, row) {
                        var names = row.locationGroupName;
                        return "<span style='word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;overflow: hidden;' title='" + row.locationGroupName + "'>" + names + "</span>";
                    }
                },
                {
                    title: "状态", width: 80,
                    render: function (data, type, row) {
                        return "<div id='td_" + row.state + "'><a style='color: green'>正在执行</a></div>";
                    }
                }
            ]
        };
        taskdataTable = $plugin.iCompaignTable(option);
    };

    // 一页任务全选
    obj.ChooseAll = function () {
        var checked = $('#checkall')[0].checked;
        $(" :checkbox").each(function (index, value) {
            value.checked = checked;
        });
    };

    // 确认任务选择
    obj.evtOnConfirm = function (index) {
        var ids = "", names = "";
        var checked = $('#checkall')[0].checked;
        if (checked) {
            $("#taskdatatable :checkbox:checked:not(:eq(0))").each(function (index, obj) { //checkbox遍历
                var id = $(obj).attr("dataid");
                var name = $(obj).attr("dataname");
                ids += id + ",";
                names += name + ",";
            });
        }
        else {
            $("#taskdatatable :checkbox:checked").each(function (index, obj) {
                var id = $(obj).attr("dataid");
                var name = $(obj).attr("dataname");
                ids += id + ",";
                names += name + ",";
            });
        }
        ids = ids.substring(0, ids.length - 1);
        names = names.substring(0, names.length - 1);
        $('#navid').val(ids);
        $('#navname').val(names);
        layer.close(layer.index);
    };

    // 删除黑名单数据
    obj.evtOnDelUserBlack = function (id) {
        var confirmIndex = $html.confirm('确定删除该数据吗？',
            function (index) {
                $util.ajaxPost(deleteUrl, JSON.stringify({id: id}),
                    function (res) {
                        if (res.state) {
                            $html.success(res.message);
                            dataTable.ajax.reload();
                        } else {
                            $html.warning(res.message);
                        }
                    },
                    function () {
                        $html.warning('删除失败！');
                    });
                layer.close(confirmIndex);
            }, function () {
                layer.close(confirmIndex);
            });
    };

    // 查询导航任务
    obj.evtOnQuerySecond = function () {
        taskdataTable.ajax.url(getTaskListUrl + "?taskName=" + $('#txtQueryNav').val() + "");
        taskdataTable.ajax.reload();
    };

    // 清空内容
    obj.reset = function () {
        $("#txtmob").val("");           //手机号
        $("#shieldtype").val("1");      //屏蔽类型 设置为周期屏蔽
        obj.changeType();
        $("#shieldtime").val("1");      //周期屏蔽 设置为1个月
        obj.dateInit();                 //初始化 起始、结束时间
        $("#selIsShielding").val("0");  //是否任务屏蔽 设置为屏蔽所有任务
        obj.IsShielding();

        //任务列表checkbox全清空
        $("input[name='tasklistChk']").attr("checked", false);
        $("#navname").val("");  //导航任务框
        $("#txtQueryNav").val(""); //任务名称搜索框
    };

    // 初始化 起始、结束时间
    obj.dateInit = function () {
        $('#d4311').val(getStartAndEndTiem(3)[0]); //起始时间
        $('#d4312').val(getStartAndEndTiem(3)[1]); //结束时间
    };

    function getStartAndEndTiem(type, zeroFlag) {
        var ddStart = new Date();
        var ddStartMonth = ddStart.getMonth() + 1;
        var ddStartDay = ddStart.getDate();

        var ddEnd = new Date(ddStart);
        var ddEndMonth = ddEnd.getMonth() + 1;
        var ddEndDay = ddEnd.getDate();
        var ddEndDayPlus = ddEnd.getDate() + 7;

        var thisMonthDay = new Date(ddStart.getFullYear(), (ddStart.getMonth() + 1), 0).getDate();
        if (thisMonthDay < ddEndDayPlus) {    //当前月加7天不存在
            var diff = 7 - (thisMonthDay - ddStartDay);
            ddEndMonth = ddEndMonth + 1;
            ddEndDay = diff;
            ddEndDayPlus = diff;
        }

        if (ddStartMonth < 10) {
            ddStartMonth = "0" + ddStartMonth;
        }

        if (ddStartDay < 10) {
            ddStartDay = "0" + ddStartDay;
        }

        if (ddEndMonth < 10) {
            ddEndMonth = "0" + ddEndMonth;
        }

        if (ddEndDay < 10) {
            ddEndDay = "0" + ddEndDay;
        }

        if (ddEndDayPlus < 10) {
            ddEndDayPlus = "0" + ddEndDayPlus;
        }

        var strStart, strEnd = "";
        if (type == 1) {
            strStart = ddStart.getFullYear() + '-' + ddStartMonth + '-' + ddStartDay + " 00:00";
            strEnd = ddEnd.getFullYear() + '-' + ddEndMonth + '-' + ddEndDayPlus + " 00:00";
        } else if (type == 2) {
            strStart = ddStart.getFullYear() + '-' + ddStartMonth;
            strEnd = ddEnd.getFullYear() + '-' + ddEndMonth;
        } else if (type == 3) {
            strStart = ddStart.getFullYear() + '-' + ddStartMonth + '-' + ddStartDay + " 00:00:00";
            strEnd = ddEnd.getFullYear() + '-' + ddEndMonth + '-' + ddEndDayPlus + " 00:00:00";
        } else {
            strStart = ddStart.getFullYear() + '-' + ddStartMonth + '-' + ddStartDay;
            strEnd = ddEnd.getFullYear() + '-' + ddEndMonth + '-' + ddEndDay;
        }
        return [strStart, strEnd];
    }

    return obj;
}();


function onLoadBody() {
    userBlackList.initData();
    userBlackList.initEvent();
}
