var iceCreamTask = function () {
    var obj = {}, dataTable = {};

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

    obj.iniData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "monthId", title: "月份", className: "dataTableFirstColumns", width: 40},
                {data: "productId", title: "产品编码", width: 60},
                {data: "productName", title: "产品名称", width: 80},
                {data: "numCount", title: "用户数", width: 60, className: "centerColumns"},
                {data: "succeedCount", title: "成功发送量", width: 80, className: "centerColumns"},
                {data: "content", title: "短信内容", width: 100},
                {
                    data: "status", title: "状态", width: 60,
                    render: function (data) {
                        return obj.getStatusType(data);
                    }
                },
                {
                    title: "操作", width: "12%", className: "centerColumns",
                    render: function (data, type, row) {
                        var executeBtnHtml = "", editBtnHtml = "";
                        if (row.status === "0") {
                            executeBtnHtml = "<a title='执行' class='btn btn-primary btn-execute' href='javascript:void(0)' onclick='iceCreamTask.execute(\"{0}\")' ><i class=\"fa fa-wrench\"></i></a>".autoFormat(row.id);
                            editBtnHtml = "<a title='编辑' class='btn btn-info btn-edit' href='javascript:void(0)' onclick='iceCreamTask.edit(\"{0}\")' ><i class=\"fa  fa-pencil-square-o\"></i></a>".autoFormat(row.id);
                        }
                        return executeBtnHtml + editBtnHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function () {
        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })
    }

    /**
     * 执行、修改事件
     * @param operate
     */
    obj.edit = function (id) {
        var $all = $("div.iMarket_Content").find("div.taskInfo").clone();
        $("#edit_task_dialog").empty().append($all);
        obj.initElementValue(id);
        $plugin.iModal({
            title: "修改任务",
            content: $("#edit_task_dialog"),
            area: '750px',
            btn: ['确定', '取消']
        }, function () {
            obj.save();
        }, null, function (layero, index) {
            layero.find(".operate").attr("index", index);
        })
    }

    /**
     * 保存
     */
    obj.save = function () {
        var $all = $("#edit_task_dialog").find("div.taskInfo");
        var index = $all.find(".operate").attr("index");
        var oData = {};
        oData.id = $.trim($all.find("[name=id]").val());
        oData.smsContent = $.trim($all.find("[name=content]").val());
        if (!$all.autoVerifyForm()) {
            return;
        }
        globalRequest.iIceCream.updateIcecreamSmsContent(true, oData, function (data) {
            if (data.retValue !== 0) {
                layer.alert("修改失败", {icon: 6});
                return;
            }
            layer.msg("修改成功", {time: 1000});
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
            layer.close(index);
        })
    }

    /**
     * 执行任务
     * @param id
     */
    obj.execute = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定执行该任务吗？', function () {
            globalRequest.iIceCream.executeIcecreamSmsTask(true, {id: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert('执行失败', {icon: 6});
                    return;
                }
                layer.msg('执行成功', {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(confirmIndex);

            }, function () {
                layer.alert("执行失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        globalRequest.iIceCream.queryIcecreamSmsById(false, {id: id}, function (data) {
            if (!data) {
                layer.alert("数据异常,请刷新重试", {icon: 5});
                return;
            }
            $("#edit_task_dialog").find("div.taskInfo").autoAssignmentForm(data);
        })
    }

    /**
     *
     * @param type
     * @returns {string}
     */
    obj.getStatusType = function (type) {
        switch (type) {
            case"0":
                return "初始状态";
            case"1":
                return "待发送";
            case"2":
                return "已发送";
            default:
                return "未知";
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var date = new Date().format('yyyy-MM');
        var nowYear = (date.split('-')[0]);
        var year = $.trim($(".queryYear").val());
        var month = $.trim($(".queryMonth").val());
        if (isNaN(year) || isNaN(month)) {
            layer.alert("查询日期格式错误", {icon: 5});
            return;
        }
        if (parseInt(year) < 1900 || parseInt(year) > (parseInt(nowYear) + 1)) {
            layer.alert("查询日期年份超过范围", {icon: 5});
            return;
        }
        if (parseInt(month) <= 0 || parseInt(month) > 12) {
            layer.alert("查询日期月份超过范围", {icon: 5});
            return;
        }
        if (month < 10 && month.length == 1) {
            month = "0" + month
        }
        var monthId = year + month,
            productName = encodeURIComponent($(".queryName").val()),
            status = $.trim($(".queryStatus").val());
        return "queryIcecreamSmsTask.view?monthId=" + monthId + "&productName=" + productName + "&status=" + status;
    }

    return obj;
}()

function onLoadBody() {
    iceCreamTask.dateInit();
    iceCreamTask.iniData();
    iceCreamTask.initEvent();
}