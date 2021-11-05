var policy_end = function () {
    var obj = {}, dataTable = {}, menuId = 0;

    /**
     * 初始化表格数据
     */
    obj.iniData = function () {
        var catalogName = encodeURIComponent($(".queryCatalogName").val());
        globalRequest.iKeeper.queryKeeperPolicyMenu(false, {menuName: catalogName}, function (data) {
            if (data && data.length) {
                obj.sliceTable(data, $("#catlogTable"));
            }
        })
    }

    /**
     * 初始化事件
     */
    obj.initEvent = function () {
        /**
         * 查询目录
         */
        $(".searchBtn").click(function () {
            obj.iniData();
        })

        /**
         * 查询政策
         */
        $(".searchBtn").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        })

        /**
         * 返回
         */
        $(".returnBtn").click(function () {
            $(".queryPolicyName").val("");
            $(".policyContainer").hide();
            $(".catalogContainer").show();
            dataTable.destroy();
        })
    }

    /**
     * 进入详情页查看
     */
    obj.intoDetail = function (_menuId) {
        menuId = _menuId
        initTable();

        function initTable() {
            var options = {
                ele: $('#policyTable'),
                ajax: {url: obj.getAjaxUrl(), type: "POST"},
                columns: [
                    {data: "policyName", title: "政策名称", className: "dataTableFirstColumns"},
                    {data: "productNames", title: "产品名称", width: "15%"},
                    {data: "productIds", title: "产品Id"},
                    {data: "orgNames", title: "区域"},
                    {data: "applyTime", title: "开始时间"},
                    {data: "expireTime", title: "结束时间"},
                    {
                        title: "操作", width: "12%",
                        render: function (data, type, row) {
                            return "<a title='详情' class='btn btn-primary btn-preview' href='javascript:void(0)' onclick='policy_end.detailPolicy(\"{0}\")'><i class=\"fa fa-eye\"></i></a>".autoFormat(row.policyId);
                        }
                    }
                ]
            };
            dataTable = $plugin.iCompaignTable(options);
        }

        $(".catalogContainer").hide();
        $(".policyContainer").show();
    }

    /**
     * 查看 政策详情
     * @param policyContent
     */
    obj.detailPolicy = function (policyId) {
        if (!policyId || policyId <= 0) {
            layer.alert("未找到该数据，请稍后重试", {icon: 6});
            return;
        }

        obj.initDialog(4);
        var $all = $("#detail_policy_dialog").find("div.policyDetailInfo");
        globalRequest.iKeeper.queryKeeperPolicyDetail(true, {policyId: policyId}, function (data) {
            if (!data) {
                layer.alert("根据ID查询政策详情失败", {icon: 6});
                return;
            }
            $all.find(".detail_policyContent").text(data.policyContent || "空");
        }, function () {
            layer.alert("根据ID查询政策详情失败", {icon: 6});
        })
        $plugin.iModal({
            title: "政策详情",
            content: $("#detail_policy_dialog"),
            area: '600px'
        }, function (index) {
            layer.close(index)
        })

    }

    /**
     * 初始化弹窗
     * @param type
     */
    obj.initDialog = function (type) {
        switch (type) {
            case 4: // 查看政策详情
                var $all = $("div.iMarket_Content").find("div.policyDetailInfo").clone();
                $("#detail_policy_dialog").empty().append($all);
                break;
        }
    }

    /**
     * 拼接Table
     * @param data
     */
    obj.sliceTable = function (data, $table) {
        var html = "";
        $table.find("thead").empty();
        $table.find("tbody").empty();
        data.forEach(function (item, index) {
            html += '<tr lang="{id:{menuId},pid:{pId},level:{level}}">'.autoFormat({
                menuId: item.menuId,
                pId: item.pId,
                level: item.menuLevel
            });
            html += '<td>{menuName}</td>'.autoFormat({menuName: item.menuName});
            html += '<td>{createTime}</td>'.autoFormat({createTime: item.createTime});
            html += '<td>{policyNum}</td>'.autoFormat({policyNum: item.policyNum || 0});
            html += "<td class='centerColumns'>";
            html += "<a class='btn btn-warning btn-below' title='进入' onclick='policy_end.intoDetail({0},{1},{2})'><i class='fa fa-chevron-down'></i></a>".autoFormat(item.menuId, item.pId, item.menuLevel);
            html += "</td>";
        })
        $table.append(html);

        initTreeTable();

        function initTreeTable() {
            new oTreeTable($table.eq(0).attr("id"), $table[0], {
                showIcon: false,
                iconPath: 'ext/otreetable/imgs/default/'
            });
            $table.prepend("<thead><tr><th>目录名称</th><th>创建时间</th><th>已有政策数</th><th>操作</th></tr></thead>")
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        var queryPolicyName = encodeURIComponent($(".queryPolicyName").val());
        console.log("menuId:" + menuId, "queryPolicyName:" + queryPolicyName)
        return "queryKeeperPolicyInfoByPage.view?policyName=" + queryPolicyName + "&menuId=" + menuId;
    }

    return obj;
}()

function onLoadBody() {
    console.log('loginUser.areaCode:', globalConfigConstant.loginUser.areaCode)
    policy_end.iniData();
    policy_end.initEvent();
}