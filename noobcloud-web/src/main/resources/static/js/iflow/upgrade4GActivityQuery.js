/**
 * Created by DELL on 2017/11/14.
 */
var upgrade4GActivityQuery = function () {
    var getMatchedActivityList = "queryUpGrate4GMatchedActivityByPhone.view";
    var obj = {};
    var dataTable;

    // 初始化事件
    obj.initEvent = function () {
        //查询事件
        $("#activityListQueryBtn").click(obj.evtOnRefresh);
    };

    //初始化表格
    obj.dataTableInit = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: getMatchedActivityList,
                type: "POST"
            },
            columns: [
                {data: "businessName", title: "业务名称", width: 500, className: "dataTableFirstColumns"},
                {data: "activityName", title: "活动名称", width: 500, className: "centerColumns"},
                {data: "businessDesc", title: "业务说明", width: 800, className: "centerColumns"},
                {data: "productName", title: "赠送产品", width: 600, className: "centerColumns"},
                {
                    data: "openStatus",
                    title: "开通状态",
                    width: 500,
                    className: "centerColumns",
                    render: function (data, type, row) {
                        switch (data) {
                            case 0 :
                                return "待开通";
                            case 1 :
                                return "已开通";
                            case 3 :
                                return "开通失败";
                            case 40 :
                                return "优惠已办理";
                            default :
                                return "未知";
                        }
                    }
                },
                {
                    title: "操作", width: 600, className: "centerColumns",
                    render: function (data, type, row) {
                        var openBusinessHtml = "";
                        if (row.openStatus == 0 || row.openStatus == 3) {
                            openBusinessHtml = "<a title='开通'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' " +
                                "onclick='upgrade4GActivityQuery.evtOnOpen(" + row.id + ",\"" + row.custPhone + "\"," + row.appointUserId + ")' >开通</a>";
                        } else if (row.openStatus == 40) {
                            openBusinessHtml = "<a title='辅助登网'  class='assignBtn btn btn-primary btn-edit btn-sm' href='javascript:void(0)' " +
                                "onclick='upgrade4GActivityQuery.eventOnAssistNetworkJobs(" + row.id + ",\"" + row.custPhone + "\"," + row.appointUserId + ")' >辅助登网</a>";
                        }
                        return openBusinessHtml;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 查询事件
    obj.evtOnRefresh = function () {
        var customerPhone = $("#customerPhone").val();
        var phone = utils.isPhone(customerPhone) ? customerPhone : function () {
            $html.warning("请输入正确格式的手机号码");
            return ""
        }();
        var data = "customerPhone=" + phone;
        dataTable.ajax.url(getMatchedActivityList + "?" + data);
        dataTable.ajax.reload();
    };

    //开通事件
    obj.evtOnOpen = function (activityId, custPhone, appointUserId) {
        //var openProductConfirm = $html.confirm('确定开通吗？', function () {
        //    layer.close(openProductConfirm);
        //    globalRequest.iUpgrade4G.openProductByPhone(true, {
        //        "activityId": activityId,
        //        "custPhone": custPhone,
        //        "appointUserId": appointUserId
        //    }, function (data) {
        //        if (data.retValue != 0) {
        //            layer.alert(data.desc);
        //        } else {
        //            layer.alert("开通成功");
        //        }
        //        dataTable.ajax.reload();
        //    });
        //}, function () {
        //    layer.close(openProductConfirm);
        //});

        var dialog = $(".assistNetworkDialog");
        dialog.empty();
        dialog.append($(".assistNetworkContent").find(".assistNetwork").clone());
        dialog.find(".assistNetworkCode").hide();// 隐藏辅助登网验证码

        var channelCoding = dialog.find("#channelCoding"),// 员工手输渠道编码
            employeeNumber = dialog.find("#employeeNumber");// 员工手输手机号

        layer.open({
            type: 1,
            shade: 0.3,
            title: "业务开通",
            offset: '300px',
            area: ['580px', '400px'],
            content: dialog,
            btn: ['开通', '取消'],
            yes: function (index) {
                openProduct(index);
            },
            cancel: function (index) {
                layer.close(index);
            }
        });

        /**
         * 开通产品
         * @param index
         */
        function openProduct(index) {
            var obj =
                {
                    "activityId": activityId,
                    "custPhone": custPhone,
                    "appointUserId": appointUserId
                },
                channelCodingVal = $.trim(channelCoding.val()),
                employeeNumberVal = $.trim(employeeNumber.val()),
                channelCodingReg = /^[A-Za-z0-9]+$/,
                employeeNumberReg = /^[0-9]+$/;

            // 校验渠道编码
            if (!channelCodingVal || !channelCodingReg.test(channelCodingVal)) {
                layer.tips("请输入正确格式的渠道编码", channelCoding, {time: 1000});
                return;
            }
            // 校验员工工号
            if (!employeeNumberVal || !utils.isPhone(employeeNumberVal) ) {
                layer.tips("请输入正确格式的手机号", employeeNumber, {time: 1000});
                return;
            }

            obj["channelCoding"] = channelCodingVal;
            obj["employeeNumber"] = employeeNumberVal;


            globalRequest.iUpgrade4G.openProductByPhone(true,obj, function (data) {
                layer.close(index);
                if (data.retValue != 0) {
                    layer.alert(data.desc);
                } else {
                    layer.alert("开通成功");
                }
                dataTable.ajax.reload();
            });
        }


    };


    //辅助登网功能
    obj.eventOnAssistNetworkJobs = function (activityId, custPhone, appointUserId) {
        var dialog = $(".assistNetworkDialog");
        dialog.empty();
        dialog.append($(".assistNetworkContent").find(".assistNetwork").clone());
        dialog.find(".assistNetworkCode").show();// 展示辅助登网验证码

        var sendVerification = dialog.find(".sendVerification"),
            verificationCode = dialog.find("#verificationCode"),
            channelCoding = dialog.find("#channelCoding"),
            employeeNumber = dialog.find("#employeeNumber");


        layer.open({
            type: 1,
            shade: 0.3,
            title: "辅助登网",
            offset: '300px',
            area: ['580px', '400px'],
            content: dialog,
            btn: ['提交', '取消'],
            yes: function (index) {
                submitAssistNetworkCode(index)
            },
            cancel: function (index) {
                layer.close(index);
            }
        });

        // 提交验证码
        function submitAssistNetworkCode(index) {
            var dataObj = {},
                assistNetworkCode = $.trim(verificationCode.val()),
                channelCodingVal = $.trim(channelCoding.val()),
                employeeNumberVal = $.trim(employeeNumber.val()),
                assistNetworkCodeReg = /^[0-9]{6}$/,
                channelCodingReg = /^[A-Za-z0-9]+$/,
                employeeNumberReg = /^[0-9]+$/;
            // 校验验证码
            if (!assistNetworkCode || !assistNetworkCodeReg.test(assistNetworkCode)) {
                layer.tips("请输入正确格式验证码", verificationCode, {time: 1000});
                return;
            }
            // 校验渠道编码
            if (!channelCodingVal || !channelCodingReg.test(channelCodingVal)) {
                layer.tips("请输入正确格式的渠道编码", channelCoding, {time: 1000});
                return;
            }
            // 校验员工工号
            if (!employeeNumberVal || !employeeNumberReg.test(employeeNumberVal)) {
                layer.tips("请输入正确格式的员工工号", employeeNumber, {time: 1000});
                return;
            }

            dataObj["assistNetworkCode"] = assistNetworkCode;
            dataObj["channelCoding"] = channelCodingVal; // 渠道编码
            dataObj["employeeNumber"] = employeeNumberVal; // 员工工号
            dataObj["custPhone"] = custPhone;
            dataObj["appointUserId"] = appointUserId;
            dataObj["activityId"] = activityId;

            globalRequest.iUpgrade4G.submitAssistNetworkCode(true, dataObj, function (data) {
                if (data && data.retValue === 0) {
                    layer.close(index);
                    $html.success("辅助登网成功", 200);
                } else {
                    $html.warning(data.desc, 200);
                }
                dataTable.ajax.reload();
            }, function () {
                layer.alert("异常:提交短信验证码异常，请稍后重试", {icon: 6})
            });
        }


        // 点击发送验证码
        sendVerification.click(function () {
            var $this = $(this);
            if (!custPhone) {
                layer.alert("无法获取客户手机号!");
                return;
            }
            $this.addClass("disabled");
            globalRequest.iUpgrade4G.sendAssistNetworkVerificationCode(true, {phone: custPhone}, function (data) {
                if (data.retValue === 0) {
                    countDown($this, 60);
                } else {
                    $this.text("获取验证码");
                    $this.removeClass("disabled");
                    layer.alert(data.desc, {icon: 6});
                }

                function countDown($this, second) {
                    if (second == 0) {
                        $this.text("获取验证码");
                        $this.removeClass("disabled");
                        return;
                    }
                    $this.text(second + "秒后重试");
                    setTimeout(function () {
                        countDown($this, second - 1)
                    }, 1000);
                }
            }, function () {
                layer.alert("获取验证码异常", {icon: 6});
            });
        });

    };


    return obj;
}();

function onLoadBody() {
    upgrade4GActivityQuery.initEvent();
    upgrade4GActivityQuery.dataTableInit();
}