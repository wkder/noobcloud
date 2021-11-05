/**
 * Created by chang on 2017/7/12.
 */
var newSceneObject = new function () {
    var get_list_api = 'queryNewSceneRuleByPage.view'
    var obj = {}, loginUser = {}, scenceClientArray = [], scenceClientNamesArray = [], modelArray = [];

    // 获取登录人信息
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            $("#loginUser").val(data.loginUser.id);
            loginUser = data.loginUser;
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }

    /**
     * 初始化场景规则列表
     * @param status
     */
    obj.initDataTable = function (status) {
        var sceneceName = $('#sceneceName').val()
        var sceneTypeID = $("#scenceType").val() === '0' ? '' : $("#scenceType").val()
        var scenceStatus = $('#scenceStatus').val() === '-1' ? '' : $('#scenceStatus').val()
        try {
            var option = {
                ele: $('#dataTable'),
                ajax: {
                    url: get_list_api + "?sceneName=" + sceneceName + "&sceneStatus=" + scenceStatus + "&sceneTypeID=" + sceneTypeID,
                    type: "POST"
                },
                columns: [
                    {data: "id", title: "ID", className: "dataTableFirstColumns", visible: false},
                    {data: "sceneName", title: "场景规则名称", className: "dataTableFirstColumns", width: 160},
                    {data: "sceneTypeName", title: "场景类型", className: "centerColumns", width: 80},
                    {
                        width: 100, className: "centerColumns", title: "操作",
                        render: function (data, type, row) {
                            var $html = '<span>未生效</span>'
                            if (parseInt(row.state) === 1) {
                                $html = '<span style="color: #00B83F;">生效</span>'
                            }
                            return $html
                        }
                    },
                    {data: "code", title: "渠道编码", className: "centerColumns", width: 80},
                    {data: "ruleName", title: "场景参数", className: "centerColumns", width: 180},
                    {data: "updateTime", title: "更新时间", className: "centerColumns", width: 120},
                    {
                        width: 160, className: "centerColumns", title: "操作",
                        render: function (data, type, row) {
                            var $buttons = "";
                            var rowStr = JSON.stringify(row) + ''
                            var $editBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='编辑' onclick='newSceneObject.showAddSceneDialog(" + rowStr + ")'>编辑</a>";
                            var $deleteBtnHtml = "<a id='btnEdit' class='btn btn-warning btn-edit btn-sm' title='删除' onclick='newSceneObject.deleteScene(" + rowStr + ")'>删除</a>";
                            var $ViewHtml = "<a id='btnEdit' class='btn btn-success btn-edit btn-sm' title='预览' onclick='newSceneObject.viewInfo(" + rowStr + ")'>预览</a>";

                            $buttons = $buttons + $ViewHtml

                            if (loginUser.id == row.createUser) {
                                // 本人创建的规则有修改删除权限
                                $buttons = $buttons + $editBtnHtml + $deleteBtnHtml
                            }

                            return $buttons
                        }
                    }
                ]
            }
            dataTable = $plugin.iCompaignTable(option)
        } catch (ex) {
            layer.alert("系统异常，请稍后再试！", {icon: 6});
        }
    }
    /**
     * 取场景规则类型
     */
    obj.getNewSceneType = function () {
        var data = []
        try {
            post('queryNewSceneType.view', false, null, function (res) {
                data = res
            }, function () {
                data = []
            })
        } catch (ex) {
            data = []
        }
        return data
    }
    obj.bindPageEvent = function () {
        $('#addNewScene').click(function () {
            obj.showAddSceneDialog('')
        })
        $('#QueryNewScene').click(function () {
            obj.queryData()
        })
    }
    /**
     * 数据筛选
     */
    obj.queryData = function () {
        var sceneceName = $('#sceneceName').val()
        var scenceStatus = $('#scenceStatus').val() === '-1' ? '' : $('#scenceStatus').val()
        var sceneTypeID = $("#scenceType").val() === '0' ? '' : $("#scenceType").val()
        dataTable.ajax.url(get_list_api + "?sceneName=" + sceneceName + "&sceneStatus=" + scenceStatus + "&sceneTypeID=" + sceneTypeID);
        dataTable.ajax.reload();
    }
    /**
     * 绑定筛选条件  场景规则类型下拉框
     */
    obj.bindQuerySceneType = function () {
        var $SceneTypeObj = $("#scenceType")
        var sceneTypeList = newSceneObject.getNewSceneType()
        if (sceneTypeList) {
            $SceneTypeObj.empty()
            $SceneTypeObj.append("<option value='A' selected>B</option>".replace(/A/g, 0).replace(/B/g, '全部类型'));
            for (var i = 0; i < sceneTypeList.length; i++) {
                $SceneTypeObj.append("<option value='A'>B</option>".replace(/A/g, sceneTypeList[i].id).replace(/B/g, sceneTypeList[i].sceneTypeName));
            }
        } else {
            layer.alert("系统异常，获取场景规则类型失败", {icon: 6});
        }
    }

    /**
     * 显示添加场景规则弹窗
     */
    obj.showAddSceneDialog = function (model) {
        var title = '新建场景规则配置'
        if (model) {
            title = '编辑场景规则配置'
        }
        obj.initAddSceneDialogElement(model)
        var $AddSceneDialog = $('#createSceneRuleDialog')
        $plugin.iModal({
            title: title,
            content: $AddSceneDialog,
            area: '750px',
            btn: []
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "create");
            localStorage.removeItem('scenes_apps');
        })
    }
    /**
     * 初始化添加场景规则弹窗元素
     */
    obj.initAddSceneDialogElement = function (model) {
        var $AddSceneDialog = $('#createSceneRuleDialog')
        // 加载静态页面
        var $panel = $(".iMarket_NewScene_Content").find("div.newSceneInfo").clone();
        $AddSceneDialog.empty()
        $AddSceneDialog.append($panel);

        var $nextStep = $panel.find("span.next");
        var $preStep = $panel.find("span.pre");
        var $confirmStep = $panel.find("span.confirm");
        // 引导图
        var $flowStepA = $panel.find("div.flowStepContainer div.flowStep div.flowStepA");
        var $flowStepB = $panel.find("div.flowStepContainer div.flowStep div.flowStepB");
        var $flowStepC = $panel.find("div.flowStepContainer div.flowStep div.flowStepC");
        // 第一页
        var $sceneBaseInfo = $panel.find(".sceneBaseInfo")
        //第二页
        var $sceneRuleInfo = $panel.find(".sceneRuleInfo");
        //第三页
        var $sceneViewInfo = $panel.find(".sceneViewInfo");

        //字段
        var $sceneName = $AddSceneDialog.find('.sceneName') // 场景规则名称
        var $startTime = $AddSceneDialog.find('.startTime') // 场景触发开始时间
        var $endTime = $AddSceneDialog.find('.endTime') // 场景触发结束时间
        var $sceneState = $AddSceneDialog.find('.sceneState') // 是否生效
        var $appValueIds = $AddSceneDialog.find('.appValueIds') // 匹配客户端ID
        var $appValueVals = $AddSceneDialog.find('.appValueName') // 匹配客户端Value
        var $appModels = $AddSceneDialog.find('.appModel') // 匹配客户端对象
        var $unitTime = $AddSceneDialog.find('.unitTime')// 单位事件
        var $abruptFlow = $AddSceneDialog.find('.abruptFlow')// 突发流量
        var marketSceneType = {} // 营销场景

        if (model) {
            bindSceneInfo()
        }
        initDialogEvent()

        // 编辑 初始化信息
        function bindSceneInfo() {
            $sceneName.val(model.sceneName)
            $sceneName.attr("disabled", true)
            $startTime.val(model.startTime)
            $endTime.val(model.endTime)
            $sceneState.val(model.state)
            marketSceneType = {
                id: model.id,
                code: model.code,
                value: model.sceneTypeName
            }
            if (model.code === 'L001') {
                var tempModel = model.sceneRule != '' ? JSON.parse(model.sceneRule)[0] : {
                    unit_time: 60000,
                    increase_data: 1
                }
                $unitTime.val(tempModel.unit_time / 60000)
                $abruptFlow.val(tempModel.increase_data)
                $sceneRuleInfo.find('.appPanel').hide()
                $sceneRuleInfo.find('.abrupFlowPanel').show()
            } else {
                $appModels.val(model.sceneRule)
                $appValueVals.val(model.ruleName)
                $sceneRuleInfo.find('.appPanel').show()
                $sceneRuleInfo.find('.abrupFlowPanel').hide()
            }
        }

        function validateSceneName(sceneName) {
            var flag = false;
            var paras = {sceneName: sceneName};
            globalRequest.validateSceneName(false, paras, function (data) {
                flag = data.isExists;
            }, function () {
                flag = false
            });
            return flag;
        }

        // 初始化上一步/下一步/返回/完成 事件
        function initDialogEvent() {
            var isHaveBack = false
            // 点击下一步
            $nextStep.click(function (e) {
                var $this = $(this);
                // 第一步 到  第二步
                if ($sceneBaseInfo.hasClass("active")) {
                    // 进行【场景基本信息】数据验证
                    if (!$sceneName.val() || $.trim($sceneName.val()).length < 1) {
                        layer.tips('场景规则名称不能为空!', $sceneName, {time: 2000, tips: [2, "#FF9800"]})
                        return false
                    }
                    if (!model) {
                        if (validateSceneName($.trim($sceneName.val()))) {
                            layer.tips('规则名称不能重复，请重建!', $sceneName, {time: 2000, tips: [2, "#FF9800"]})
                            return false;
                        }
                    }
                    if (!$startTime.val() || $.trim($startTime.val()).length < 1) {
                        layer.tips('触发开始时间不能为空!', $startTime, {time: 2000, tips: [2, "#FF9800"]})
                        return false
                    }
                    if (!$endTime.val() || $.trim($endTime.val()).length < 1) {
                        layer.tips('触发结束时间不能为空!', $endTime, {time: 2000, tips: [2, "#FF9800"]})
                        return false
                    }
                    var startArr = $startTime.val().split(':')
                    var endArr = $endTime.val().split(':')
                    if (startArr[0] > endArr[0] || (startArr[0] === endArr[0] && startArr[1] >= endArr[1])) {
                        layer.tips('触发结束时间必须大于开始时间!', $endTime, {time: 2000, tips: [2, "#FF9800"]})
                        return false
                    }
                    //验证通过之后，切换到第二页
                    // 流程步骤二图片点亮
                    $flowStepA.find("span").removeClass("active");
                    $flowStepB.find("span").addClass("active");
                    // 第二页面显示
                    $sceneBaseInfo.removeClass("active");
                    $sceneRuleInfo.addClass("active");
                    if (!isHaveBack) {
                        bindSceneTypeAdd()
                    }
                    // 绑定营销场景类型

                    // 给所有按钮添加pageB
                    $this.parent().find("span").addClass("pageB");
                    $preStep.addClass("active");
                } else if ($sceneRuleInfo.hasClass("active")) {
                    // 从第二步  到  预览
                    // 进行【场景捕捉规则】数据验证
                    var radia_marketSceneType = $('.sceneTypeAdd').find("[name='marketScene']")
                    for (var i = 0; i < radia_marketSceneType.length; i++) {
                        if (radia_marketSceneType[i].checked) {
                            marketSceneType.id = $(radia_marketSceneType[i]).val()
                            marketSceneType.code = radia_marketSceneType[i].getAttribute('data')
                            marketSceneType.value = radia_marketSceneType[i].getAttribute('data-text')
                        }
                    }
                    if (!marketSceneType) {
                        layer.tips('请选择营销场景!', $('.sceneTypeAdd'), {time: 2000, tips: [2, "#FF9800"]})
                        return false
                    }
                    // 非 突发流量
                    if (marketSceneType.code !== 'L001') {
                        if (!$appValueVals.val() || $.trim($appValueVals.val()).length < 1) {
                            layer.tips('匹配客户端不能为空!', $appValueVals, {time: 2000, tips: [2, "#FF9800"]})
                            return false
                        }
                    }
                    if (marketSceneType.code === 'L001') {
                        if (!$abruptFlow.val() || $.trim($abruptFlow.val()).length < 1 || parseInt($abruptFlow.val()) < 1) {
                            layer.tips('突发流量必须大于0!', $abruptFlow, {time: 2000, tips: [2, "#FF9800"]})
                            return false
                        }
                    }
                    //验证通过之后，切换到第三页
                    // 初始化预览页面数据
                    $sceneViewInfo.find('.viewSceneRuleName').text($sceneName.val()) // 场景规则名称
                    $sceneViewInfo.find('.viewStartTime').text($startTime.val()) //触发开始时间
                    $sceneViewInfo.find('.viewEndTime').text($endTime.val()) //触发结束时间
                    $sceneViewInfo.find('.viewSceneState').text($sceneState.val() == '0' ? '未生效' : '生效') //是否生效
                    $sceneViewInfo.find('.viewSceneMarketType').text(marketSceneType.value) //营销场景
                    if (marketSceneType.code === 'L001') {
                        $sceneViewInfo.find('.viewUnitTime').text($unitTime.val() + '分钟') // 单位时间
                        $sceneViewInfo.find('.viewFlow').text($abruptFlow.val() + 'MB')
                        $sceneViewInfo.find('.market_L001').show()
                        $sceneViewInfo.find('.market_no_L001').hide()
                    } else {
                        $sceneViewInfo.find('.viewSceneMarket').text($appValueVals.val())
                        $sceneViewInfo.find('.market_no_L001').show()
                        $sceneViewInfo.find('.market_L001').hide()
                    }
                    // 流程步骤三图片点亮
                    $flowStepB.find("span").removeClass("active");
                    $flowStepC.find("span").addClass("active");
                    // 第三页面显示
                    $sceneRuleInfo.removeClass("active");
                    $sceneViewInfo.addClass("active");
                    // 给所有按钮添加pageC
                    $this.parent().find("span").addClass("pageC");
                    $confirmStep.addClass("active");
                    $nextStep.removeClass("active");
                }
            })
            // 点击返回
            $preStep.click(function (e) {
                var $this = $(this);
                // 第二步 返回到 第一步
                if ($sceneRuleInfo.hasClass("active")) {
                    isHaveBack = true
                    // 流程步骤一图片点亮
                    $flowStepA.find("span").addClass("active");
                    $flowStepB.find("span").removeClass("active");
                    // 第一页面显示
                    $sceneBaseInfo.addClass("active");
                    $sceneRuleInfo.removeClass("active");
                    // 给所有按钮添加pageA
                    $this.parent().find("span").addClass("pageA");
                    // 隐藏上一步按钮
                    $preStep.removeClass("active");
                }

                // 第三步 返回到 第二步
                if ($sceneViewInfo.hasClass("active")) {
                    // 流程步骤二图片点亮
                    $flowStepB.find("span").addClass("active");
                    $flowStepC.find("span").removeClass("active");
                    // 第二页面显示
                    $sceneRuleInfo.addClass("active");
                    $sceneViewInfo.removeClass("active");
                    // 给所有按钮添加pageB
                    $this.parent().find("span").addClass("pageB");
                    $confirmStep.removeClass("active");
                    $nextStep.addClass("active");
                }
            })
            // 点击确定,新建场景规则配置
            $confirmStep.click(function (e) {
                try {
                    var sceneRule = [] // 场景规则
                    if (marketSceneType.code === 'L001') {
                        sceneRule.push({
                            'unit_time': $unitTime.val() * 60000,
                            'increase_data': $abruptFlow.val()
                        })
                    } else {
                        var appModels = $appModels.val()
                        // 数组去重
                        sceneRule = appModels ? JSON.parse(appModels) : ''//duplicate(sceneRule)
                    }
                    var param = {
                        "id": model.id,
                        "sceneName": $sceneName.val(),
                        "sceneTypeID": marketSceneType.id,
                        "startTime": $startTime.val(),
                        "endTime": $endTime.val(),
                        "state": parseInt($sceneState.val()),
                        "sceneRule": sceneRule
                    }
                    post('createOrUpdateNewSceneRule.view', true, param, function (res) {
                        if (res.retValue == '0') {
                            layer.closeAll()
                            obj.queryData();
                            localStorage.removeItem('scenes_apps');
                            if (model) {
                                layer.msg("编辑成功", {timeout: 800});
                            } else {
                                layer.msg("添加成功", {timeout: 800});
                            }
                        }
                    }, function () {
                        layer.alert("系统异常，请稍后再试！", {icon: 6});
                    })

                } catch (ex) {
                    layer.alert("系统异常", {icon: 6});
                }
            })

            $sceneRuleInfo.find(".appChooseButton").click(function () {
                setTimeout(function () {
                    chooseAppSceneDialog()
                }, 100)
            })

            // 营销场景点击事件
            function radioMarketScene($obj) {
                if ($obj.getAttribute('data') === 'L001') {
                    $sceneRuleInfo.find('.appPanel').hide()
                    $sceneRuleInfo.find('.abrupFlowPanel').show()
                } else {
                    $sceneRuleInfo.find('.appPanel').show()
                    $sceneRuleInfo.find('.abrupFlowPanel').hide()
                }
            }

            // app客户端选择弹窗
            function chooseAppSceneDialog() {
                scenceClientArray = [], scenceClientNamesArray = [], modelArray = []
                var storage = localStorage.getItem("scenes_apps");
                if (storage) {
                    try {
                        storage = JSON.parse(storage);
                        for (var i = 0; i < storage.length; i++) {
                            scenceClientArray.push(storage[i].id);
                            scenceClientNamesArray.push(storage[i].name);
                        }
                        modelArray = storage;
                    } catch (e) {
                        storage = null
                        console.log('JSON.parse(storage) error', e);
                    }
                } else {
                    if (model && model.sceneTypeName == "APP") {
                        scenceClientNamesArray = model.ruleName.split('、');
                        var sceneRule = JSON.parse(model.sceneRule);
                        sceneRule.forEach(function (value, index) {
                            scenceClientArray.push(value.appid)
                            modelArray.push({
                                id: value.appid,
                                name: scenceClientNamesArray[index],
                                type2Id: value.apptype
                            })
                        });
                    }
                }
                obj.initSceneceClientElement(scenceClientArray, scenceClientNamesArray, modelArray);
                obj.onLoadScenceClientBody(scenceClientArray, scenceClientNamesArray, modelArray);
                $plugin.iModal({
                    title: '选择客户端',
                    content: $("#createScenceClientDialog"),
                    area: ['750px', '680px'],
                    btn: ['确定', '取消'],
                }, function (index, layero) {
                    $AddSceneDialog.find(".appValueIds").val(scenceClientArray.join(","));
                    $AddSceneDialog.find(".appValueName").val(scenceClientNamesArray.join(","));
                    var sceneRule = []
                    for (var i = 0; i < modelArray.length; i++) {
                        // 当前二级分类id
                        var type2Id = modelArray[i].type2Id
                        // 属于当前二级分类的客户端集合
                        var tempList = []
                        // tempList[type2Id] = []
                        var item = {
                            apptype: type2Id,
                            appid: ''
                        }
                        for (var j = 0; j < modelArray.length; j++) {
                            if (type2Id === modelArray[j].type2Id) {
                                tempList.push(modelArray[j].id)
                            }
                        }
                        // 将当前二级分类的客户端组装成对应的格式
                        if (tempList.length > 0) {
                            item.appid = tempList.join(',')
                        }
                        sceneRule.push(item)
                    }
                    sceneRule = duplicate(sceneRule)
                    $AddSceneDialog.find(".appModel").val(JSON.stringify(sceneRule));
                    layer.close(index);
                });
            }

            // 绑定营销场景类型
            function bindSceneTypeAdd() {
                var $SceneTypeObj = $(".sceneTypeAdd")
                var sceneTypeList = obj.getNewSceneType()
                if (sceneTypeList) {
                    $SceneTypeObj.empty()
                    var defaultCheck = ''
                    for (var i = 0; i < sceneTypeList.length; i++) {
                        // 优先默认赋值 非 【流量突发】，当循环到最后，还是没有默认值的时候，就只能赋值最后一个了
                        if (sceneTypeList[i].code !== 'L001') {
                            defaultCheck = defaultCheck === '' ? sceneTypeList[i].code : defaultCheck
                        } else if (defaultCheck === '' && i === sceneTypeList.length - 1) {
                            defaultCheck = sceneTypeList[i].code
                        }
                        var $html = '<div class="radio" style="margin-top: 0; margin-left: 5px;">'
                        $html += '<label for="marketScene_' + sceneTypeList[i].code + '"><input id="marketScene_' + sceneTypeList[i].code + '" type="radio" name="marketScene" checked="checked" value="' + sceneTypeList[i].id + '" data-text="' + sceneTypeList[i].sceneTypeName + '" data="' + sceneTypeList[i].code + '"/>' + sceneTypeList[i].sceneTypeName + '</label>'
                        $html += '</div>'
                        $SceneTypeObj.append($html);
                    }
                    var marketSceneType = model.code ? model.code : defaultCheck
                    // 默认选择
                    document.getElementById("marketScene_" + marketSceneType).checked = "checked"
                    // 如果真的之后流量突发，那就只能选择流量突发了
                    if (defaultCheck === 'L001') {
                        $sceneRuleInfo.find('.appPanel').hide()
                        $sceneRuleInfo.find('.abrupFlowPanel').show()
                    }
                    // 给radio赋事件
                    var radios = $(".sceneTypeAdd").find("[name='marketScene']")
                    for (var i = 0; i < radios.length; i++) {
                        $(radios[i]).click(function () {
                            radioMarketScene(this)
                        })
                    }
                } else {
                    layer.alert("系统异常，获取场景规则类型失败", {icon: 6});
                }
            }
        }
    }
    /**
     * 初始化匹配客户端
     * @param scenceClientArray
     * @param scenceClientNamesArray
     * @param modelArray
     */
    obj.initSceneceClientElement = function (scenceClientArray, scenceClientNamesArray, modelArray) {
        var $clientDialog = $("#createScenceClientDialog");
        $clientDialog.empty()
        var $clientPanel = $("#newSceneList .createScenceClientSegment").clone();
        $clientDialog.append($clientPanel);
        $clientDialog.find('.createScenceClientSegment').show()
        var $scenceClientSelect1 = $clientDialog.find("#d-sceneClientType");

        /**
         *  加载匹配搜索下拉框客户端一级类型
         */
        globalRequest.queryNewSceneClientTypeOne(true, {}, function (data) {
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

        /**
         * 客户端搜索事件
         */
        $("#createScenceClientDialog .createScenceClientSegment .searchButton").click(function () {
            obj.onLoadScenceClientBody(scenceClientArray, scenceClientNamesArray, modelArray);
        });
    }
    /**
     * 加载匹配客户端数据
     * @param scenceClientArray
     * @param scenceClientNamesArray
     * @param modelArray
     */
    obj.onLoadScenceClientBody = function (scenceClientArray, scenceClientNamesArray, modelArray) {
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

        globalRequest.queryNewSceneClientByPage(true, paras, function (data) {
            pageInfo.itemCounts = data.itemCounts;
            pageInfo.items = data.items;
            createClientBody(scenceClientArray, scenceClientNamesArray, modelArray);
            initClientPagination();
        }, function () {
            layer.alert("系统异常", {icon: 6});
        });

        function initClientPagination() {
            $("#createScenceClientDialog").find(".pagination").pagination({
                items: pageInfo.itemCounts,
                itemsOnPage: 40,
                cssStyle: 'light-theme',
                prevText: "<上一页",
                nextText: "下一页>",
                onPageClick: function (pageNumber) {
                    paras.curPage = pageNumber;
                    globalRequest.queryNewSceneClientByPage(true, paras, function (data) {
                        pageInfo.itemCounts = data.itemCounts;
                        pageInfo.items = data.items;
                        createClientBody(scenceClientArray, scenceClientNamesArray, modelArray);
                    });
                }
            });
        }

        function createClientBody(scenceClientArray, scenceClientNamesArray, modelArray) {
            $("#createScenceClientDialog .chooseInfo .item").remove();
            var $html = "<tr><td colspan='9'><div class='noData'>暂无相关数据</div></td></tr></li>";
            $("#createScenceClientDialog .createScenceClientSegment .clientinfo tbody tr").remove();
            var $tbody = $("#createScenceClientDialog .createScenceClientSegment .clientinfo tbody");
            var pageItem = pageInfo.items,
                pageItemLength = pageItem ? pageItem.length : 0;
            if (pageItemLength > 0) {
                var array = [], className = "fa-square-o";
                for (var i = 0; i < pageItem.length; i++) {
                    var num = i % 4;
                    if (num == 0) {
                        array.push("<tr>")
                    }
                    if (modelArray && modelArray.length > 0) {
                        for (var j = 0; j < modelArray.length; j++) {
                            if (modelArray[j].id == pageItem[i].id) {
                                className = "fa-check-square-o";
                                break;
                            } else {
                                className = "fa-square-o";
                            }
                        }
                        array.push("<td><div class='tdpanel'><i class='fa " + className + "' value = " + pageItem[i].id + " data-type=" + pageItem[i].type2 + " data-typeId=" + pageItem[i].typeid2 + ">" + pageItem[i].name + "</i></div></td>");
                    } else {
                        array.push("<td><div class='tdpanel'><i class='fa fa-square-o' value = " + pageItem[i].id + " data-type=" + pageItem[i].type2 + " data-typeId=" + pageItem[i].typeid2 + ">" + pageItem[i].name + "</i></div></td>");
                    }

                    if (num == 3) {
                        array.push("</tr>")
                    }
                }
                $tbody.append(array.join(""));


            } else {
                $tbody.append($html);
            }

            for (var j = 0; j < modelArray.length; j++) {
                obj.addSquareClient(modelArray[j].id, modelArray[j].name)
            }

            $(".createScenceClientSegment .clientinfo div.tdpanel").click(function () {
                var $this = $(this).find("i");
                if ($this.hasClass("fa-check-square-o")) {
                    $this.removeClass("fa-check-square-o").addClass("fa-square-o");
                    scenceClientArray.removevalue($this.attr("value"));
                    scenceClientNamesArray.removevalue($.trim($this.text()));

                    for (var i = 0; i < modelArray.length; i++) {
                        if (modelArray[i].id === $this.attr("value")) {
                            modelArray.removevalue(modelArray[i])
                        }
                    }
                    localStorage.setItem('scenes_apps', JSON.stringify(modelArray));
                    obj.removeSquareClient($this.attr("value"));
                } else {
                    $this.removeClass("fa-square-o").addClass("fa-check-square-o");
                    scenceClientArray.push($this.attr("value"));
                    scenceClientNamesArray.push($.trim($this.text()));
                    modelArray.push({
                        id: $this.attr("value"),
                        name: $.trim($this.text()),
                        type2: $this.attr('data-type'),
                        type2Id: $this.attr('data-typeId')
                    })
                    localStorage.setItem('scenes_apps', JSON.stringify(modelArray));
                    obj.addSquareClient($this.attr("value"), $.trim($this.text()));
                }
            });
        }
    }
    /**
     * 加载匹配搜索下拉框客户端二级类型
     * @param dialog
     */
    obj.loadScenceClientTypeTwo = function (dialog) {
        var scenceClientType = $("#d-sceneClientType").val();
        var $scenceClientSelect2 = dialog.find("#d-sceneClientType-2");
        globalRequest.queryNewSceneClientTypeTwo(true, {scenceClientType: scenceClientType}, function (data) {
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
    /**
     * 删除场景规则
     */
    obj.deleteScene = function (model) {
        if (model.id) {
            var text = "确定删除场景规则[{A}]?".replace('{A}', model.sceneName)
            layer.confirm(text, {icon: 3, title: '提示'}, function () {
                layer.closeAll()
                post('deleteNewSceneByID.view', true, {id: model.id}, function (res) {
                    if (res.retValue === 0) {
                        obj.queryData();
                        layer.msg("删除成功", {timeout: 800});
                    } else {
                        layer.alert("系统异常", {icon: 6});
                    }
                })
            })
        }
    }
    /**
     * 预览
     * @param model
     */
    obj.viewInfo = function (model) {
        var $panel = $(".iMarket_NewScene_Content").find("div.newSceneInfo");
        var $sceneViewInfo = $panel.find(".sceneViewInfo").clone();
        var $viewInfoDiv = $('.iMarket_shopTask_Dialog').find('#view-info')
        $viewInfoDiv.empty()
        $viewInfoDiv.append($sceneViewInfo)

        $sceneViewInfo.find('.viewSceneRuleName').text(model.sceneName) // 场景规则名称
        $sceneViewInfo.find('.viewStartTime').text(model.startTime) //触发开始时间
        $sceneViewInfo.find('.viewEndTime').text(model.endTime) //触发结束时间
        $sceneViewInfo.find('.viewSceneState').text(model.state == '0' ? '未生效' : '生效') //是否生效
        $sceneViewInfo.find('.viewSceneMarketType').text(model.sceneTypeName) //营销场景
        if (model.code == 'L001') {
            $sceneViewInfo.find('.viewUnitTime').text(JSON.parse(model.sceneRule)[0].unit_time / 60000 + '分钟') // 单位时间
            $sceneViewInfo.find('.viewFlow').text(JSON.parse(model.sceneRule)[0].increase_data + 'MB')
            $sceneViewInfo.find('.market_L001').show()
            $sceneViewInfo.find('.market_no_L001').hide()
        } else {
            $sceneViewInfo.find('.viewSceneMarket').text(model.ruleName)
            $sceneViewInfo.find('.market_no_L001').show()
            $sceneViewInfo.find('.market_L001').hide()
        }
        layer.open({
            type: 1,
            title: '预览',
            closeBtn: 1,
            skin: 'markBackGroundColor',
            shadeClose: false,
            area: ['710px', '380px'],
            offset: '60px',
            shift: 6,
            btn: ['确定'],
            content: $sceneViewInfo,
            yes: function (index) {
                layer.close(index);
            }
        });
    }

    /**
     *
     * @param id
     * @param text
     */
    obj.addSquareClient = function (id, text) {
        var $chooseInfo = $("#createScenceClientDialog").find(".chooseInfo");
        $chooseInfo.find(".emptyData").hide();
        var $template = $("<div id='" + id + "' class='item'><span>" + text + "</span><i class='fa fa-close' onclick=newSceneObject.removeSelfSquareClient('" + id + "')></i></div>");
        $chooseInfo.append($template);
    }

    /**
     *
     * @param id
     */
    obj.removeSquareClient = function (id) {
        var $chooseInfo = $("#createScenceClientDialog").find(".chooseInfo"),
            $emptyData = $chooseInfo.find(".emptyData");
        $chooseInfo.find("#" + id + "").remove();
        var $item = $chooseInfo.find(".item"),
            itemLength = $item ? $item.length : 0;
        if (!itemLength || itemLength <= 0) {
            $emptyData.show();
        }
    }

    /**
     *
     * @param id
     */
    obj.removeSelfSquareClient = function (id) {
        var $ele = $("#createScenceClientDialog i[value='" + id + "']");
        if ($ele && $ele.length > 0) {
            $ele.click();
        } else {
            var storage = localStorage.getItem("scenes_apps");
            try {
                storage = JSON.parse(storage);
                for (var i = 0; i < storage.length; i++) {
                    if (id == storage[i].id) {
                        $("#" + id + "").remove();
                        scenceClientArray.removevalue(storage[i].id);
                        scenceClientNamesArray.removevalue(storage[i].name);
                        for (var j = 0; j < modelArray.length; j++) {
                            if (id == modelArray[j].id) {
                                modelArray.removevalue(modelArray[j])
                            }
                        }
                        storage.splice(i, 1);
                    }
                }
                localStorage.setItem("scenes_apps", JSON.stringify(storage));
            } catch (e) {
                storage = null
                console.log('JSON.parse(storage) error');
            }
        }
    }

    return obj
}

function onLoadBody(status) {
    newSceneObject.bindPageEvent()
    newSceneObject.bindQuerySceneType()
    newSceneObject.initDataTable(status)
    newSceneObject.getLoginUser()
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

/**
 * 数组去重
 * @param array
 * @returns {Array}
 */
function duplicate(array) {
    var res = []
    var jso = []
    for (var i = 0; i < array.length; i++) {
        if (!jso[JSON.stringify(array[i])]) {
            res.push(array[i])
            jso[JSON.stringify(array[i])] = 1;
        }
    }
    return res
}