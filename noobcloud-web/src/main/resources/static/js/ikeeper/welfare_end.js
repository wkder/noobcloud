var welfare_end = function () {
    var obj = {}, dataTable = {};

    obj.iniData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: null, className: "dataTableFirstColumns details-control", defaultContent: "", width: "5%",},
                {data: "welfareName", title: "福利名称"},
                {
                    data: "typeId", title: "福利类型",
                    render: function (data, type, row) {
                        return obj.getWelfareType(data);
                    }
                },
                {data: "areaNames", title: "区域"},
                {data: "effDate", title: "生效时间"},
                {data: "expDate", title: "失效时间"},
                {
                    title: "操作", width: "12%",
                    render: function (data, type, row) {
                        var detailBtnHtml = "<a title='详情' class='btn btn-primary btn-preview' href='javascript:void(0)' onclick='welfare_end.details(\"{0}\")' ><i class=\"fa fa-eye\"></i></a>".autoFormat(row.welfareId);
                        var sendBtnHtml = "<a title='赠送' class='btn btn-info btn-gift' href='javascript:void(0)' onclick='welfare_end.send(\"{0}\",\"{1}\")'><i class=\"fa fa-gift\"></i></a>".autoFormat(row.welfareId, row.welfareName);
                        return detailBtnHtml + sendBtnHtml;
                    }
                }
            ],
            drawCallback: function (settings, json) {
                $('#dataTable thead tr th:first-child').removeClass("details-control");
            }
        };
        dataTable = $plugin.iCompaignTable(options);

        /**
         * 点击查看详情
         */
        $("#dataTable tbody").on("click", "td.details-control", function () {
            var $tr = $(this).closest('tr');
            var $row = dataTable.row($tr);
            var rowData = $row.data();
            if ($row.child.isShown()) {
                $row.child.hide();
                $tr.removeClass('shown');
            }
            else {
                globalRequest.iKeeper.queryProductListByCompositId(true, {welfareId: rowData.welfareId}, function (data) {
                    if (!data) {
                        layer.alert("数据异常,请刷新重试", {icon: 5});
                        return;
                    }
                    $row.child(format(data)).show();
                    var $newTr = $tr.next();
                    $newTr.addClass("backColor").children("td").attr("colspan", 5).addClass("dataTableFirstColumns");
                    $newTr.prepend("<td></td>");
                    $tr.addClass('shown');
                })
            }
        })

        function format(data) {
            var html = '<div class="row ">';
            for (var i = 0; i < data.length; i++) {
                html += '<div class="col-md-12">'
                html += '<div class="col-md-2 title">产品名称</div>'
                html += '<div class="col-md-2 content">{productName}</div>'.autoFormat({productName: data[i].productName})
                html += '<div class="col-md-2 title">产品编码</div>'
                html += '<div class="col-md-2 content">{productCode}</div>'.autoFormat({productCode: data[i].productCode})
                html += '<div class="col-md-2 title">产品类型</div>'
                html += '<div class="col-md-2 content">{productType}</div>'.autoFormat({productType: obj.getProductType(data[i].productType)})
                html += '<div class="col-md-2 title">区域</div>'
                html += '<div class="col-md-2 content">{areaNames}</div>'.autoFormat({areaNames: data[i].areaNames})
                html += '</div>'
            }
            html += '</div>'
            return html;
        }

    }

    obj.initEvent = function () {
        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })
    }

    /**
     * 赠送事件
     * @param id
     */
    obj.send = function (welfareId, welfareName) {
        var $dialog = $("#send_welfare_dialog");
        obj.initDialog($dialog, 1);
        var $all = $dialog.find("div.sendInfo");
        $all.find("[name='welfareId']").val(welfareId);
        $all.find("[name='welfareName']").val(welfareName);
        $plugin.iModal({
            title: "福利赠送",
            content: $("#send_welfare_dialog"),
            area: '550px',
            btn: ['确定', '取消']
        }, function (index) {
            save(index);
        })

        function save(index) {
            if (!$all.autoVerifyForm()) {
                return;
            }
            var oData = $all.autoSpliceForm();
            oData.userId = globalConfigConstant.loginUser.id.toString();
            globalRequest.iKeeper.giveCustWelfare(true, oData, function (data) {
                if (!data || data.resultCode !== "0000") {
                    layer.alert(data.resultMsg, {icon: 5});
                    return;
                }
                layer.msg("赠送成功", {time: 1000});
                layer.close(index);
            })
        }
    }

    /**
     * 详情 事件
     * @param id
     */
    obj.details = function (id) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var $dialog = $("#details_dialog");
        obj.initDialog($dialog, 2);
        var options = {
            ele: $dialog.find('.detailsInfoTable'),
            ajax: {
                url: "queryKeeperPhonelist.view?welfareId=" + id + "&userId=" + globalConfigConstant.loginUser.id,
                type: "POST"
            },
            columns: [
                {data: "phone", title: "用户号码", className: "dataTableFirstColumns"},
                {data: "welfareName", title: "赠送福利"},
                {data: "userName", title: "操作人",}
            ]
        };
        $plugin.iCompaignTable(options);
        $plugin.iModal({
            title: "福利详情",
            content: $("#details_dialog"),
            area: '750px',
            btn: ['确定', '取消']
        }, function (index) {
            layer.close(index);
        })
    }

    /**
     * 初始化弹窗
     * @param $dialog
     * @param type
     */
    obj.initDialog = function ($dialog, type) {
        switch (type) {
            case 1:
                var $sendInfo = $("div.iMarket_Content").find("div.sendInfo").clone();
                $dialog.empty().append($sendInfo);
                break;
            case 2:
                var $detailsInfo = $("div.iMarket_Content").find("div.detailsInfo").clone();
                $dialog.empty().append($detailsInfo);
                break;
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var welfareName = encodeURIComponent($(".queryName").val());
        return "queryWelfareOfShopKeeper.view?welfareName=" + welfareName;
    }

    /**
     * 获取福利类型
     * @param type
     */
    obj.getWelfareType = function (type) {
        switch (parseInt(type)) {
            case 1:
                return "生日维系"
            case 2:
                return "2转4维系"
            case 3:
                return "场景关怀"
            case 4:
                return "优惠到期"
            case 5:
                return "普通福利"
            default:
                return "未知"
        }
    }

    /**
     * 获取产品类型名称
     * @param type
     */
    obj.getProductType = function (type) {
        switch (parseInt(type)) {
            case 1:
                return "流量包"
            case 2:
                return "语音"
            case 3:
                return "非现"
            case 4:
                return "第三方福利"
            default:
                return "未知"
        }
    }

    return obj;
}()

function onLoadBody() {
    welfare_end.iniData();
    welfare_end.initEvent();
}