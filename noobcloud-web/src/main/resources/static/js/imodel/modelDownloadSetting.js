var modelDownloadSetting = function () {
    var dataTable,url = "queryModelDownloadSettingByPage.view",obj = {};
    obj.initBody = function () {
        var options = {
            ele: $('table.modelDownloadSettingTab'),
            ajax: {url: url, type: "POST"},
            columns: [
                {data: "modelName", title: "客户群", width: "20%", className: "dataTableFirstColumns"},
                {data: "metaPropertyNames", title: "下载属性", width: "40%"},
                {data: "remarks", title: "备注", width: "20%"},
                {
                    title: "操作", width: "20%",
                    render: function (data, type, row) {
                        return "<a type='button' class='editBtn btn btn-info btn-sm btn-edit' href='#' onclick=modelDownloadSetting.editItem(" + row.id + "," +row.modelId + ") ><i class='fa fa-edit'></i></a>" +
                            "<a type='button' class='btn btn-success btn-sm btn-copy' href='#' onclick=modelDownloadSetting.copyItem(" + row.id + ") ><i class='fa fa-copy'></i></a>"+
                            "<a type='button' class='btn btn-danger btn-sm btn-delete' href='#' onclick=modelDownloadSetting.deleteItem(" + row.id + ") ><i class='fa fa-trash-o'></i></a>";
                    }
                },
                {data: "modelId", visible: false},
                {data: "metaPropertyIds", visible: false},
                {data: "id", visible: false}
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    };

    //编辑
    obj.editItem = function (id){
        var $dialog = $('#dialogPrimary').empty();
        $dialog.append($(".iMarket_Content .modelDownloadSettingInfo").clone());
        var $modelList = $dialog.find("select.modelList");
        var $propertyTree = $dialog.find("ul#modelDownloadSettingPropertyTree");
        var $selectedProperties = $dialog.find("ul.selectedProperties");
        var $remarks = $dialog.find("textarea.remarks");
        globalRequest.iModel.queryModelDownloadSettingById(true,{settingId: id},function(model){
            // 查询所有我能处理的模型信息
            globalRequest.iModel.queryModelsUnderMe(true,{currentModelId: model.modelId},function(data){
                var modelArray = [];
                for (var i=0;i<data.length;i++){
                    modelArray.push("<option value='A'>B - C</option>".replace(/A/g,data[i].id).replace(/B/g,data[i].userName).replace(/C/g,data[i].name));
                }
                $modelList.append(modelArray.join(""));
                $modelList.val(model.modelId);
            });

            // 显示选中的属性
            var selectedPropertiesIdName = model.metaProperties;
            var selectedProperties = [];
            for (var i = 0 ;i <selectedPropertiesIdName.length;i++)
            {
                selectedProperties.push(("<li class='property_AA'>" +
                    "<span class='propertyName' property='AA' title='BB'>BB</span>" +
                    "<div class='propertyOperate'>"+
                        "<a type='button' class='upBtn btn btn-primary btn-xs' href='#' onclick=modelDownloadSetting.upSelectedProperty(AA,this) ><i class='fa fa-chevron-up'></i></a>"+
                        "<a type='button' class='downBtn btn btn-warning btn-xs' href='#' onclick=modelDownloadSetting.downSelectedProperty(AA,this) ><i class='fa fa-chevron-down'></i></a>"+
                        "<a type='button' class='deleteBtn btn btn-danger btn-xs' href='#' onclick=modelDownloadSetting.removeSelectedProperty(AA,this) ><i class='fa fa-trash-o'></i></a>"+
                    "</div>"+
                    "</li>").replace(/AA/g,selectedPropertiesIdName[i].id).replace(/BB/g,selectedPropertiesIdName[i].name));
            }
            $selectedProperties.append(selectedProperties);

            //查询所有属性
            obj.loadMetaPropertiesTree($propertyTree,$selectedProperties,model.metaPropertyIds);

            // 设置备注信息
            $remarks.val(model.remarks);

            $plugin.iModal({
                title: "编辑模型下载配置",
                content: $dialog,
                area: ['950px',"620px"],
            }, obj.saveModelDownloadSetting, null, function (layero, index) {
                layero.find(".modelDownloadSettingHandel").attr("type","edit").attr("id",id);
            }, null);

        });
    };

    // 加载所有属性的目录树
    obj.loadMetaPropertiesTree = function ($treeObj,$selectedProperties,propertyIds) {
        var setting = {
            edit: {
                enable: false,
                showRemoveBtn: false,
                showRenameBtn: false
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onDblClick: function(event, treeId, treeNode){
                    if (!treeNode.isParent){
                        $selectedProperties.append(("<li class='property_AA'>" +
                            "<span class='propertyName' property='AA' title='BB'>BB</span>" +
                            "<div class='propertyOperate'>"+
                                "<a type='button' class='upBtn btn btn-primary btn-xs' href='#' onclick=modelDownloadSetting.upSelectedProperty(AA,this) ><i class='fa fa-chevron-up'></i></a>"+
                                "<a type='button' class='downBtn btn btn-warning btn-xs' href='#' onclick=modelDownloadSetting.downSelectedProperty(AA,this) ><i class='fa fa-chevron-down'></i></a>"+
                                "<a type='button' class='deleteBtn btn btn-danger btn-xs' href='#' onclick=modelDownloadSetting.removeSelectedProperty(AA,this) ><i class='fa fa-trash-o'></i></a>"+
                            "</div>"+
                            "</li>").replace(/AA/g,treeNode.id).replace(/BB/g,treeNode.name));

                        //选过的属性隐藏了，不能再被选择
                        var treeObj = $.fn.zTree.getZTreeObj(treeId);
                        treeObj.hideNode(treeNode);
                    }
                }
            }
        };
        globalRequest.iModel.queryAllPropertiesUnderCategory(true, {}, function (data) {
            if (data && data.length > 0) {
                if (propertyIds) {
                    var propertyIdArray = propertyIds.split(","),result = [];;
                    for (var i=0;i<data.length;i++) {
                        if (propertyIdArray.indexOf(data[i].id + "") < 0) {
                            result.push(data[i]);
                        }
                    }
                    data = result;
                }
                $.fn.zTree.init($treeObj, setting, data);
            } else {
                var properties = [{id: '0', pId: '-1', name: "暂未配置相关元数据属性", isParent: true, nocheck: true}];
                $.fn.zTree.init($treeObj, setting, properties);
            }
        }, function () {
            layer.alert("系统异常：查询元属性错误");
        });
    };

    // 保存数据 编辑或修改
    obj.saveModelDownloadSetting = function (index, layero){
        var modelDownloadSettingObj = {};
        if (!obj.packageDomain(modelDownloadSettingObj,layero)){
            return ;
        }
        var type = layero.find(".modelDownloadSettingHandel").attr("type");
        if (type == "create") {
            globalRequest.iModel.insertModelDownloadSetting(true,modelDownloadSettingObj,function(data){
                if (data.retValue !== 0){
                    $html.warning(data.desc);
                    return;
                }
                $html.success("模型下载配置新增成功！");
                layer.close(index);
            });
        } else if (type == "edit"){
            modelDownloadSettingObj["id"] = layero.find(".modelDownloadSettingHandel").attr("id");;
            globalRequest.iModel.updateModelDownloadSetting(true,modelDownloadSettingObj,function(data){
                if (data.retValue !== 0){
                    $html.warning(data.desc);
                    return;
                }
                $html.success("模型下载配置编辑成功！");
                layer.close(index);
            });
        }
        globalLocalRefresh.refreshModelDownloadSetting();
    };

    // 拼接对象
    obj.packageDomain = function (domain,$settingObj) {
        var modelSelectId = $settingObj.find("select.modelList").val();
        var remarks = $settingObj.find("textarea.remarks").val();
        var $selectedProperties = $settingObj.find("ul.selectedProperties li");
        var selectedPropertyIds = [];
        if (!modelSelectId || modelSelectId == -1) {
            $html.warning("请选择需要配置下载属性的模型！");
            return false;
        }
        domain['modelId'] = modelSelectId;
        domain['remarks'] = remarks;
        $selectedProperties.each(function(){
            selectedPropertyIds.push($(this).find("span").attr("property"));
        });
        if (selectedPropertyIds.length == 0){
            $html.warning("请配置需要下载的属性！");
            return false;
        }
        domain["metaPropertyIds"] = selectedPropertyIds.join(",");
        return true;
    };

    //复制
    obj.copyItem = function (id){
        var $dialog = $('#dialogPrimary').empty();
        $dialog.append("<select class='form-control' style= 'width: 80%;margin: 20px auto;'></select>");
        globalRequest.iModel.queryModelsUnderMe(true,{},function(data){
            var modelArray = [];
            for (var i=0;i<data.length;i++){
                modelArray.push("<option value='A'>B - C</option>".replace(/A/g,data[i].id).replace(/B/g,data[i].userName).replace(/C/g,data[i].name));
            }
            $dialog.find("select").append(modelArray.join(""));
        });

        $plugin.iModal({
            title: "客户群选择",
            content: $dialog,
            area: ['500px',"250px"]
        }, obj.handelCopy, null, function (layero, index) {
            layero.find("select").attr("copyItemId", id);
        }, null);
    };

    // 复制的处理方法
    obj.handelCopy = function (index, layero) {
        var modelId = layero.find("select").val();
        var copyItemId = layero.find("select").attr("copyItemId")
        globalRequest.iModel.copyModelDownloadSetting(true,{copyItemId: copyItemId,modelId: modelId},function(data){
            if(data.retValue === 0){
                globalLocalRefresh.refreshModelDownloadSetting();
                layer.close(index);
                $html.success("复制成功");handelCopy
            }else{
                $html.warning("复制失败,"+ data.desc);
            }
        });
    }

    //删除
    obj.deleteItem = function (id){
        if (id <= 0) {
            $html.warning("此数据不存在，请联系管理员");
            return;
        }

        var index = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iModel.deleteModelDownloadSetting(true, {id: id}, function (data) {
                if (data.retValue !== 0) {
                    $html.warning(data.desc);
                    return;
                }
                $html.success("删除成功！");
                globalLocalRefresh.refreshModelDownloadSetting();
            });
        }, function () {
            layer.close(index);
        });
    };

    /** ************* 属性处理方法 ************ */
    // 属性上移
    obj.upSelectedProperty = function (id,_this) {
        var $currentLi = $(_this).closest("li.property_"+id);
        var $prevLi = $currentLi.prev();
        if ($prevLi.length >0){
            $currentLi.insertBefore($prevLi);
        }
    };

    //属性下移
    obj.downSelectedProperty = function (id, _this) {
        var $currentLi = $(_this).closest("li.property_"+id);
        var $nextLi = $currentLi.next();
        if ($nextLi.length >0){
            $currentLi.insertAfter($nextLi);
        }
    };

    // 属性移除
    obj.removeSelectedProperty = function (id,_this) {
        var $currentLi = $(_this).closest("li.property_"+id);
        $currentLi.remove();
        var treeObj = $.fn.zTree.getZTreeObj("modelDownloadSettingPropertyTree");
        var nodes = treeObj.getNodesByParam("isHidden", true);
        for (var i=0;i<nodes.length;i++) {
            if (nodes[i].id == id) {
                treeObj.showNode(nodes[i]);
                break;
            }
        }
    };

    obj.initEvent = function () {
        $("div.modelDownloadSettingRefreshBtn").click(function (e, condition) {
            //dataTable.ajax.url(url + (condition ? condition : ""));
            dataTable.ajax.reload();
        });

        $(".modelDownloadSettingAddBtn").click(function(){
            var $dialog = $('#dialogPrimary').empty();
            $dialog.append($(".iMarket_Content .modelDownloadSettingInfo").clone());
            var $modelList = $dialog.find("select.modelList");
            var $propertyTree = $dialog.find("ul#modelDownloadSettingPropertyTree");
            var $selectedProperties = $dialog.find("ul.selectedProperties");
            globalRequest.iModel.queryModelsUnderMe(true,{},function(data){
                var modelArray = [];
                for (var i=0;i<data.length;i++){
                    modelArray.push("<option value='A'>B - C</option>".replace(/A/g,data[i].id).replace(/B/g,data[i].userName).replace(/C/g,data[i].name));
                }
                $modelList.append(modelArray.join(""));
            });

            //查询所有属性
            obj.loadMetaPropertiesTree($propertyTree,$selectedProperties);

            $plugin.iModal({
                title: "创建模型下载配置",
                content: $dialog,
                area: ['950px',"620px"],
            }, obj.saveModelDownloadSetting, null, function (layero, index) {
                layero.find(".modelDownloadSettingHandel").attr("type","create");
            }, null);
        });
    };
    return obj;
}()

function onLoadBody() {
    modelDownloadSetting.initBody();
    modelDownloadSetting.initEvent()
}
