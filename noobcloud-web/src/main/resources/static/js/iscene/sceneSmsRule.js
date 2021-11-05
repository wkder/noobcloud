var sceneSmsObj = function () {
    var getUrl = "querySenceSmsRuleByPage.view", dataTable, obj = {};

    //主页table初始化
    obj.dataTableInit = function () {
        var sceneceName = $("#qryscenceName").val();
        var scenceStatus = $("#qryscenceStau").val();
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?sceneceName=" + sceneceName + "&scenceStatus=" + scenceStatus, type: "POST"},
            columns: [
                {data: "scenceName", width: 200, className: "dataTableFirstColumns"},
                {data: "scenceTypeName", width: 100, rowspan: 2},
                {data: "channelName", width: 100, rowspan: 2},
                {
                    data: "matchClient", width: 120, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.matchClient == 1) {
                            return "<i class='fa' style='color: green;'>是</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>否</i>";
                        }
                    }
                },
                {
                    data: "matchKeywords", width: 120, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.matchKeywords == 1) {
                            return "<i class='fa' style='color: green;'>是</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>否</i>";
                        }
                    }
                },
                {
                    data: "matchPosition", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.matchPosition == 1) {
                            return "<i class='fa' style='color: green;'>是</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>否</i>";
                        }
                    }
                },
                {
                    data: "matchSite", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.matchSite == 1) {
                            return "<i class='fa' style='color: green;'>是</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>否</i>";
                        }
                    }
                },
                {
                    data: "matchTerminal", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.matchTerminal == 1) {
                            return "<i class='fa' style='color: green;'>是</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>否</i>";
                        }
                    }
                },
                {
                    data: "status", width: 100, className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.status == 1) {
                            return "<i class='fa' style='color: green;'>生效</i>";
                        } else {
                            return "<i class='fa' style='color: red;'>失效</i>";
                        }
                    }
                },
                {
                    width: 120, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a id='btnEdit' class='btn btn-info btn-edit' title='编辑' onclick='sceneSmsObj.editSceneSms(\"" + row.id + "\")'><i class=\"fa fa-pencil-square-o\"></i></a>" +
                            "<a id='btndel' class='btn btn-danger btn-delete' title='删除' onclick='sceneSmsObj.deleteSceneSms(\"" + row.id + "\")'><i class=\"fa fa-trash-o\"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    obj.initEvent = function () {
        $("#scenceRuleButton").click(obj.querySceneSms);
        $("#createScenceRuleButton").click(
            obj.createSceneSms
        );
    }

    // 查询
    obj.querySceneSms = function () {
        dataTable.ajax.url(getUrl + "?sceneceName=" + encodeURIComponent($("#qryscenceName").val()) + "&scenceStatus=" + $("#qryscenceStau").val());
        dataTable.ajax.reload();
    }

    //删除
    obj.deleteSceneSms = function (id) {
        layer.confirm("确定删除？", {icon: 3, title: '提示'}, function () {
            globalRequest.deleteSenceSmsRuleById(true, {"id": id}, function (data) {
                if (data.retValue === 0) {
                    obj.querySceneSms();
                    layer.msg("删除成功", {timeout: 800});
                } else {
                    layer.alert("系统异常", {icon: 6});
                }
            });
        });
    }
    //修改
    obj.editSceneSms = function (id) {
        obj.updateScenceRule();
        obj.initDialogEvent();
        obj.initUpdateData(id);
    }
    //新增场景规则
    obj.createSceneSms = function () {
        obj.createDialog();
        obj.initDialogEvent();
    }
    //打开新增对话框
    obj.createDialog = function () {
        obj.initScenceRuleElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "新建场景规则",
            offset: '50px',
            area: ['700px', '700px'],
            content: $("#createScenceRuleDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                //保存场景规则
                obj.saveSceneRuleData(index, "新增");
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //初始化对话框里的事件
    obj.initDialogEvent = function () {
        //场景规则可选匹配规则
        obj.initCheckItem()
        //客户端选择
        obj.clientClickEvent();
        //终端选择
        obj.terminalClickEvent();
    }
    //初始化场景规则可选匹配规则
    obj.initCheckItem = function () {
        $("#createScenceRuleDialog .addmatchClient").click(function () {
            var $this = $(this).find("i");
            $this.toggleClass("fa-check-square-o").toggleClass("fa-square-o");
            $("#createScenceRuleDialog div.addclientIdElement").toggle();
        });

        $("#createScenceRuleDialog .addmatchkeywords").click(function () {
            var $this = $(this).find("i");
            $this.toggleClass("fa-check-square-o").toggleClass("fa-square-o");
            $("#createScenceRuleDialog div.addkeywords").toggle();
        });

        $("#createScenceRuleDialog .addmatchPosition").click(function () {
            var $this = $(this).find("i");
            $this.toggleClass("fa-check-square-o").toggleClass("fa-square-o");
            $("#createScenceRuleDialog div.addpositionsElement").toggle();
        })

        $("#createScenceRuleDialog .addmatchSite").click(function () {
            var $this = $(this).find("i");
            $this.toggleClass("fa-check-square-o").toggleClass("fa-square-o");
            $("#createScenceRuleDialog div.addwebSits").toggle();
        })

        $("#createScenceRuleDialog .addmatchTerminal").click(function () {
            var $this = $(this).find("i");
            $this.toggleClass("fa-check-square-o").toggleClass("fa-square-o");
            $("#createScenceRuleDialog div.addterminalElement").toggle();
        });
    }
    ////客户端选择事件
    obj.clientClickEvent = function () {
        $("#createScenceRuleDialog .clientIdsSelectBtn").click(function () {
            var scenceClientArray = [];
            var scenceClientNamesArray = [];
            obj.initSceneceClientElement(scenceClientArray, scenceClientNamesArray);
            obj.onLoadScenceClientBody(scenceClientArray, scenceClientNamesArray);
            layer.open({
                type: 1,
                shade: 0.3,
                title: "选择客户端",
                offset: '70px',
                area: ['650px', '680px'],
                content: $("#createScenceClientDialog"),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    $("#createScenceRuleDialog .createScenceSegment").find(".addclientIds").val(scenceClientArray.join(","));
                    $("#createScenceRuleDialog .createScenceSegment").find(".addclientNames").val(scenceClientNamesArray.join(","));
                    layer.close(index);
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        })
    }
    //终端选择事件
    obj.terminalClickEvent = function () {
        $("#createScenceRuleDialog .terminalSelectBtn").click(function () {
            var scenceTerminalArray = [];
            var scenceTerminalnamesArray = [];
            obj.initSceneceTerminalElement(scenceTerminalArray, scenceTerminalnamesArray);
            obj.onLoadScenceTerminalBody(scenceTerminalArray, scenceTerminalnamesArray);
            layer.open({
                type: 1,
                shade: 0.3,
                title: "选择终端",
                offset: '70px',
                area: ['650px', '680px'],
                content: $("#createScenceTerminalDialog"),
                btn: ['确定', '取消'],
                yes: function (index, layero) {
                    $("#createScenceRuleDialog .createScenceSegment").find(".addterminals").val(scenceTerminalArray.join(","));
                    $("#createScenceRuleDialog .createScenceSegment").find(".addterminalNames").val(scenceTerminalnamesArray.join(","));
                    layer.close(index);
                },
                cancel: function (index, layero) {
                    layer.close(index);
                }
            });
        })
    }
    //初始化匹配客户端
    obj.initSceneceClientElement = function (scenceClientArray, scenceClientNamesArray) {
        var $clientDialog = $("#createScenceClientDialog");
        var $clientPanel = $(".iMarket_Scenesms_EditHtml .createScenceClientSegment").clone();
        $clientDialog.find("div.createScenceClientSegment").remove();
        $clientDialog.append($clientPanel);

        var $scenceClientSelect1 = $clientDialog.find("#d-sceneClientType");
        globalRequest.querySenceClientTypeOne(true, {}, function (data) {
            $scenceClientSelect1.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $scenceClientSelect1.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $scenceClientSelect1.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取客户端类别失败", {icon: 6});
        });
        obj.loadScenceClientTypeTwo($clientDialog);

        $scenceClientSelect1.change(function () {
            obj.loadScenceClientTypeTwo($clientDialog);
        });

        //客户端搜索事件
        $("#createScenceClientDialog .createScenceClientSegment .searchButton").click(function () {
            obj.onLoadScenceClientBody(scenceClientArray, scenceClientNamesArray);
        });
    }
    //加载匹配客户端数据
    obj.onLoadScenceClientBody = function (scenceClientArray, scenceClientNamesArray) {
        var clientName = $("#d-sceneClientName").val();
        var clientType = $("#d-sceneClientType").val();
        var clientType2 = $("#d-sceneClientType-2").val();

        var pageInfo = {
            itemCounts: 0,
            items: {}
        };

        var paras = {
            curPage: 1,
            countsPerPage: 40,
            clientName: clientName,
            clientType: clientType,
            clientType2: clientType2
        };

        globalRequest.querySenceClientByPage(true, paras, function (data) {
            pageInfo.itemCounts = data.itemCounts;
            pageInfo.items = data.items;
            createClientBody(scenceClientArray, scenceClientNamesArray);
            initClientPagination();
        }, function () {
            layer.alert("系统异常", {icon: 6});
        });

        function initClientPagination() {
            $("#createScenceClientDialog .createScenceClientSegment .clientinfo .pagination").pagination({
                items: pageInfo.itemCounts,
                itemsOnPage: 40,
                cssStyle: 'light-theme',
                prevText: "<上一页",
                nextText: "下一页>",
                onPageClick: function (pageNumber) {
                    paras.curPage = pageNumber;
                    globalRequest.querySenceClientByPage(true, paras, function (data) {
                        pageInfo.itemCounts = data.itemCounts;
                        pageInfo.items = data.items;
                        createClientBody(scenceClientArray, scenceClientNamesArray);
                    });
                }
            });
        }

        function createClientBody(scenceClientArray, scenceClientNamesArray) {
            var $html = "<tr><td colspan='9'><div class='noData'>暂无相关数据</div></td></tr></li>";
            $("#createScenceClientDialog .createScenceClientSegment .clientinfo tbody tr").remove();
            var $tbody = $("#createScenceClientDialog .createScenceClientSegment .clientinfo tbody");
            if (pageInfo.items.length > 0) {
                var array = [];
                $.each(pageInfo.items, function (idx, val) {
                    var num = idx % 4;
                    if (num == 0) {
                        array.push("<tr>")
                    }
                    array.push("<td><div class='tdpanel'><i class='fa fa-square-o' value = " + val.id + ">" + val.name + "</i></div></td>");
                    if (num == 3) {
                        array.push("</tr>")
                    }
                });
                $tbody.append(array.join(""));
            } else {
                $tbody.append($html);
            }

            $(".createScenceClientSegment .clientinfo div.tdpanel").click(function () {
                var $this = $(this).find("i");
                if ($this.hasClass("fa-check-square-o")) {
                    $this.removeClass("fa-check-square-o").addClass("fa-square-o");
                    scenceClientArray.removevalue($this.attr("value"));
                    scenceClientNamesArray.removevalue($this.text());
                } else {
                    $this.removeClass("fa-square-o").addClass("fa-check-square-o");
                    scenceClientArray.push($this.attr("value"));
                    scenceClientNamesArray.push($this.text());
                }
            });
        }
    }
    //初始化匹配终端
    obj.initSceneceTerminalElement = function (scenceTerminalArray, scenceTerminalnamesArray) {
        var $terminalDialog = $("#createScenceTerminalDialog");
        var $clientPanel = $(".iMarket_Scenesms_EditHtml .createScenceTerminalSegment").clone();
        $terminalDialog.find("div.createScenceTerminalSegment").remove();
        $terminalDialog.append($clientPanel);

        //终端搜索事件
        $("#createScenceTerminalDialog .createScenceTerminalSegment .searchButton").click(function () {
            obj.onLoadScenceTerminalBody(scenceTerminalArray, scenceTerminalnamesArray);
        });
    }
    //加载匹配终端数据
    obj.onLoadScenceTerminalBody = function (scenceTerminalArray, scenceTerminalnamesArray) {
        var terminalName = $("#d-sceneTerminalName").val();

        var pageInfo = {
            itemCounts: 0,
            items: {}
        };

        var paras = {
            curPage: 1,
            countsPerPage: 40,
            terminalName: terminalName
        };

        globalRequest.querySenceTerminalByPage(true, paras, function (data) {
            pageInfo.itemCounts = data.itemCounts;
            pageInfo.items = data.items;
            createTerminalBody(scenceTerminalArray, scenceTerminalnamesArray);
            initTerminalPagination();
        }, function () {
            layer.alert("系统异常", {icon: 6});
        });

        function initTerminalPagination() {
            $("#createScenceTerminalDialog .createScenceTerminalSegment .terminalinfo .pagination").pagination({
                items: pageInfo.itemCounts,
                itemsOnPage: 40,
                cssStyle: 'light-theme',
                prevText: "<上一页",
                nextText: "下一页>",
                onPageClick: function (pageNumber) {
                    paras.curPage = pageNumber;
                    globalRequest.querySenceTerminalByPage(true, paras, function (data) {
                        pageInfo.itemCounts = data.itemCounts;
                        pageInfo.items = data.items;
                        createTerminalBody(scenceTerminalArray, scenceTerminalnamesArray);
                    });
                }
            });
        }

        function createTerminalBody(scenceTerminalArray, scenceTerminalnamesArray) {
            var $html = "<tr><td colspan='4'><div class='noData'>暂无相关数据</div></td></tr></li>";
            $("#createScenceTerminalDialog .createScenceTerminalSegment .terminalinfo tbody tr").remove();
            var $tbody = $("#createScenceTerminalDialog .createScenceTerminalSegment .terminalinfo tbody");
            if (pageInfo.items.length > 0) {
                var array = [];
                $.each(pageInfo.items, function (idx, val) {
                    var num = idx % 4;
                    if (num == 0) {
                        array.push("<tr>");
                    }
                    array.push("<td><div class='tdpanel'><i class='fa fa-square-o' value = " + val.id + ">" + val.name + "</i></div></td>");
                    if (num == 3) {
                        array.push("</tr>");
                    }
                });
                $tbody.append(array.join(""));
            } else {
                $tbody.append($html);
            }

            $(".createScenceTerminalSegment .terminalinfo div.tdpanel").click(function () {
                var $this = $(this).find("i");
                if ($this.hasClass("fa-check-square-o")) {
                    $this.removeClass("fa-check-square-o").addClass("fa-square-o");
                    scenceTerminalArray.removevalue($this.attr("value"));
                    scenceTerminalnamesArray.removevalue($this.text());
                } else {
                    $this.removeClass("fa-square-o").addClass("fa-check-square-o");
                    scenceTerminalArray.push($this.attr("value"));
                    scenceTerminalnamesArray.push($this.text());
                }
            });
        }
    }
    //初始化新增，变更场景规则对话框
    obj.initScenceRuleElement = function () {
        var $dialog = $("#createScenceRuleDialog");
        var $panel = $(".iMarket_Scenesms_EditHtml").find("div.createScenceSegment").clone();
        $dialog.find("div.createScenceSegment").remove();
        $dialog.append($panel);

        var $scenceTypeSelect = $dialog.find("select.scenceTypeSelect");
        globalRequest.querySenceRuleType(true, {}, function (data) {
            $scenceTypeSelect.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $scenceTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $scenceTypeSelect.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }

        }, function () {
            layer.alert("系统异常，获取场景规则类型失败", {icon: 6});
        });
    }
    //保存场景规则
    obj.saveSceneRuleData = function (index, msg) {
        var sceneRuleObj = getSceneRuleObj();
        if (valiteSceneRuleObj(sceneRuleObj)) {
            globalRequest.createOrUpdateSceneRule(true, sceneRuleObj, function (data) {
                if (data.retValue == 0) {
                    layer.close(index);
                    obj.querySceneSms();
                    layer.msg(msg + "成功", {time: 1000});
                } else {
                    layer.alert(msg + "失败，" + data.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常", {icon: 6});
            });
        } else {
            return;
        }

        /*
         返回场景规则对象
         */
        function getSceneRuleObj() {
            var $obj = $("#createScenceRuleDialog .createScenceSegment");
            return {
                id: $obj.find(".id").val(),
                scenceName: $obj.find(".sceneRuleName").val(),
                scenceType: $obj.find(".scenceTypeSelect").val(),
                matchClient: $("#createScenceRuleDialog .createScenceSegment .addmatchClient").find("i").hasClass("fa-check-square-o") == true ? '1' : '0',
                clientIds: $obj.find(".addclientIds").val(),
                clientNames: $obj.find(".addclientNames").val(),
                matchKeywords: $("#createScenceRuleDialog .createScenceSegment .addmatchkeywords").find("i").hasClass("fa-check-square-o") == true ? '1' : '0',
                keywords: $obj.find(".keywords").val(),
                matchPosition: $("#createScenceRuleDialog .createScenceSegment .addmatchPosition").find("i").hasClass("fa-check-square-o") == true ? '1' : '0',
                positions: $obj.find(".positions").val(),
                matchSite: $("#createScenceRuleDialog .createScenceSegment .addmatchSite").find("i").hasClass("fa-check-square-o") == true ? '1' : '0',
                webSits: $obj.find(".webSits").val(),
                matchTerminal: $("#createScenceRuleDialog .createScenceSegment .addmatchTerminal").find("i").hasClass("fa-check-square-o") == true ? '1' : '0',
                terminals: $obj.find(".addterminals").val(),
                terminalNames: $obj.find(".addterminalNames").val(),
                status: $obj.find(".scenceStatusSelect").val(),
                accessNum: $obj.find(".accessNums").val(),
                beginTime: $obj.find(".addBeginTime").val(),
                endTime: $obj.find(".addendTime").val()
            };
        }

        /*
         校验场景规则
         */
        function valiteSceneRuleObj(obj) {
            var $html = $("#createScenceRuleDialog .createScenceSegment");
            if (obj.scenceName == "") {
                layer.tips('场景规则名称不能为空!', $html.find(".sceneRuleName"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.accessNum == "") {
                layer.tips('发送次数不能为空!', $html.find(".accessNums"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            } else {
                var reg = /^\d+$/;
                if (!reg.test(obj.accessNum)) {
                    layer.tips('发送次数只能为整数!', $html.find(".accessNums"), {time: 1000, tips: [2, "#71bff2"]});
                    return false;
                }
            }

            if (obj.beginTime == "") {
                layer.tips('开始时间不能为空!', $html.find(".addBeginTime"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.endTime == "") {
                layer.tips('结束时间不能为空!', $html.find(".addendTime"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }

            if (obj.matchClient == "1" && obj.clientIds == "") {
                layer.tips('请选择客户端!', $html.find(".addclientNames"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.matchKeywords == "1" && obj.keywords == "") {
                layer.tips('请输入关键字!', $html.find(".keywords"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.matchPosition == "1" && obj.positions == "") {
                layer.tips('请输入位置!', $html.find(".positions"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.matchSite == "1" && obj.webSits == "") {
                layer.tips('请输入网站地址!', $html.find(".webSits"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            if (obj.matchTerminal == "1" && obj.terminals == "") {
                layer.tips('请选择终端!', $html.find(".addterminalNames"), {time: 1000, tips: [2, "#71bff2"]});
                return false;
            }
            return true;
        }
    }
    //加载匹配客户端二级类型
    obj.loadScenceClientTypeTwo = function (dialog) {
        var scenceClientType = $("#d-sceneClientType").val();
        var $scenceClientSelect2 = dialog.find("#d-sceneClientType-2");
        globalRequest.querySenceClientTypeTwo(true, {scenceClientType: scenceClientType}, function (data) {
            $scenceClientSelect2.empty();
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (i === 0) {
                        $scenceClientSelect2.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else {
                        $scenceClientSelect2.append("<option value='A'>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取客户端二级类别失败", {icon: 6});
        });
    }
    //修改场景规则
    obj.updateScenceRule = function () {
        obj.initScenceRuleElement();
        layer.open({
            type: 1,
            shade: 0.3,
            title: "编辑场景规则",
            offset: '50px',
            area: ['700px', '660px'],
            content: $("#createScenceRuleDialog"),
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                //保存场景规则
                obj.saveSceneRuleData(index, "编辑");
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
    }
    //初始化编辑框数据
    obj.initUpdateData = function (id) {
        globalRequest.querySenceRuleById(true, {id: id}, function (data) {
            var scenceSmsRuleDomain = data.scenceSmsRuleDomain;
            var $obj = $("#createScenceRuleDialog .createScenceSegment");
            $obj.find(".id").val(scenceSmsRuleDomain.id);
            $obj.find(".sceneRuleName").val(scenceSmsRuleDomain.scenceName);
            $obj.find(".sceneRuleName").attr("disabled", true);
            $obj.find(".scenceTypeSelect").val(scenceSmsRuleDomain.scenceType);
            $obj.find(".accessNums").val(scenceSmsRuleDomain.accessNum);
            $obj.find(".addBeginTime").val(scenceSmsRuleDomain.beginTime);
            $obj.find(".addendTime").val(scenceSmsRuleDomain.endTime);
            if (scenceSmsRuleDomain.matchClient == '0') {
                $("#createScenceRuleDialog .createScenceSegment .addmatchClient").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
                $obj.find(".addclientIdElement").hide();
            } else {
                $obj.find(".addclientIds").val(scenceSmsRuleDomain.clientIds);
                $obj.find(".addclientNames").val(scenceSmsRuleDomain.clientNames);
            }
            if (scenceSmsRuleDomain.matchKeywords == '0') {
                $("#createScenceRuleDialog .createScenceSegment .addmatchkeywords").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
                $obj.find(".addkeywords").hide();
            } else {
                $obj.find(".keywords").val(scenceSmsRuleDomain.keywords);
            }
            if (scenceSmsRuleDomain.matchPosition == '0') {
                $("#createScenceRuleDialog .createScenceSegment .addmatchPosition").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
                $obj.find(".addpositionsElement").hide();
            } else {
                $obj.find(".positions").val(scenceSmsRuleDomain.positions);
            }
            if (scenceSmsRuleDomain.matchSite == '0') {
                $("#createScenceRuleDialog .createScenceSegment .addmatchSite").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
                $obj.find(".addwebSits").hide();
            } else {
                $obj.find(".webSits").val(scenceSmsRuleDomain.webSits);
            }
            if (scenceSmsRuleDomain.matchTerminal == '0') {
                $("#createScenceRuleDialog .createScenceSegment .addmatchTerminal").find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
                $obj.find(".addterminalElement").hide();
            } else {
                $obj.find(".addterminals").val(scenceSmsRuleDomain.terminals);
                $obj.find(".addterminalNames").val(scenceSmsRuleDomain.terminalNames);
            }
            $obj.find(".scenceStatusSelect").val(scenceSmsRuleDomain.status);
            //刷新数据
            //globalLocalRefresh.refreshSenceRule();

        }, function () {
            layer.alert("根据ID查询业务规则数据失败", {icon: 6});
        });
    }

    return obj;
}();
//入口
function onLoadBody() {

    sceneSmsObj.dataTableInit();
    sceneSmsObj.initEvent();
    /*
     *  方法:Array.remove(dx)
     *  功能:根据元素值删除数组元素.
     *  参数:元素值
     *  返回:在原数组上修改数组
     */
    Array.prototype.removevalue = function (val) {
        var index = -1;
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) {
                index = i;
                break;
            }
        }
        if (index > -1) {
            this.splice(index, 1);
        }
    };
}