var iptvTask = function () {
    var obj = {}, dataTable = {}, appointFileId = {};
    var iptvTask_constant = {
        operate: {
            create: "create",
            update: "update"
        }
    }

    obj.iniData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "name", title: "内容名称", className: "dataTableFirstColumns", width: 100},
                {data: "content", title: "推送内容", width: 100},
                {data: "remarks", title: "备注信息", width: 100},
                {
                    data: "status", title: "状态", width: 60,
                    render: function (data, type, row) {
                        return obj.getTaskStatus(data)
                    }
                },
                {
                    title: "操作", width: 130,
                    render: function (data, type, row) {
                        var btns = "";
                        var viewBtnHtml = "<a title='预览' class='btn btn-primary btn-preview' href='javascript:void(0)' onclick='iptvTask.preview(\"{0}\")'><i class='fa fa-eye'></i></a>".autoFormat(row.id);
                        var editBtnHtml = "<a title='编辑' class='btn btn-info btn-edit' href='javascript:void(0)' onclick='iptvTask.addOrEdit(\"{0}\",\"{1}\")' ><i class=\"fa fa-pencil-square-o\"></i></a>".autoFormat("update", row.id);
                        var devareBtnHtml = "<a title='删除' class='btn btn-danger btn-devare " + (row.status === 1 ? 'onUse' : '') + "' href='javascript:void(0)' onclick='iptvTask.devare(\"{0}\",\"{1}\")'><i class=\"fa fa-trash-o\"></i></a>".autoFormat(row.id,row.status);
                        if (row.status == 1) {

                        }
                        // 本人且状态不是生效中,可以编辑
                        if ((row.createUser == globalConfigConstant.loginUser.id) && (row.status != 1)) {
                            btns = viewBtnHtml + editBtnHtml + devareBtnHtml
                        } else {
                            btns = viewBtnHtml
                        }
                        return btns;
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    }

    obj.initEvent = function () {
        $(".addBtn").click(function () {
            obj.addOrEdit("create");
        })

        $(".searchBtn").click(function () {
            var name = $('.iMarket_Body input.queryName').val()
            var url = obj.getAjaxUrl()
            if (name) {
                url += '?name=' + name
            }
            $plugin.iCompaignTableRefresh(dataTable, url);
        })
    }

    /**
     * 新增、修改事件
     * @param operate
     */
    obj.addOrEdit = function (operate, id) {
        obj.initDialog(1);
        obj.initElementValue(operate, id);
        $plugin.iModal({
            title: operate === iptvTask_constant.operate.create ? "新建消息推送内容" : "编辑消息推送内容",
            content: $("#addOrEdit_task_dialog"),
            area: '900px',
            btn: ['确定', '取消']
        }, null, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find(".operate").attr("index", index).attr("operate", operate);
        })
        $('.step').find('.confirm').click(function () {
            obj.save(operate)
        });
        $('.step').find('.pre').click(function () {
            obj.editPreview(operate)
        });
        // 更换图片
        $('#addOrEdit_task_dialog [name="qrcodeFile"]').change(function () {
            var dialog = $('#addOrEdit_task_dialog .dialogLeft')
            var imgObj = this.files[0];
            var reader = new FileReader();
            reader.onload = function () {
                dialog.find('#qrcode').attr('src', reader.result);
                var img = new Image();
                img.onload = function () {
                    dialog.find('.qrWid').text(img.width);
                    dialog.find('.qrHei').text(img.height)
                }
                img.src = this.result;
            }
            if (imgObj) {
                reader.readAsDataURL(imgObj);
            }
        });
        // 更换背景
        $('#addOrEdit_task_dialog [name="bgdFile"]').change(function () {
            var dialog = $('#addOrEdit_task_dialog .dialogLeft')
            var imgObj = this.files[0];
            var reader = new FileReader();
            reader.onload = function () {
                $('#addOrEdit_task_dialog #bgP').attr('src', reader.result);
                var img = new Image();
                img.onload = function () {
                    dialog.find('.bgWid').text(img.width);
                    dialog.find('.bgHei').text(img.height)
                }
                img.src = this.result;
            }
            if (imgObj) {
                reader.readAsDataURL(imgObj);
            }
        });
        if (operate === 'create') {
            $('#addOrEdit_task_dialog [name="qrcodeFile"]').click(function (e) {
                $('#addOrEdit_task_dialog #qrcode').attr('src', './images/add_img.png')
            });
            $('#addOrEdit_task_dialog [name="bgdFile"]').click(function () {
                $('#addOrEdit_task_dialog #bgP').attr('src', './images/add_img.png')
            })
        }
    };

    /**
     * 保存
     */
    obj.save = function (operate) {
        var index=$("#addOrEdit_task_dialog .operate").attr("index");
        var url = ''
        if (operate === iptvTask_constant.operate.create) {
            url = 'createMessagePageContent.view'
        } else {
            url = 'updateMessagePageContent.view'
        }
        var options = {
            type: 'POST',
            url: url,
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (data) {
                $html.loading(false)
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg('保存成功', {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(index);
            },
            error: function (a,b,c,d) {
                $html.loading(false)
                layer.alert('请求异常，请重试。')
            }
        }
        if (obj.verification(operate)) {
            obj.submit(options)
        }
    }

    /**
     * 编辑时的预览
     */
    obj.editPreview = function (operate) {
        // 提交预览窗口高度，后台通过此高度返回缩放后适应该窗口的页面
        $('#addOrEdit_task_dialog #divHeight').val(240)

        var options = {
            type: 'POST',
            url: 'preCompilePageContent.view',
            beforeSubmit: function () {
                $html.loading(true)
            },
            success: function (res) {
                $html.loading(false)
                if (res) {
                    var preHtml = res
                    $('.preHtml').html(preHtml)
                } else {
                    layer.alert('没有数据。')
                }
            },
            error: function (a,b,c,d) {
                $html.loading(false)
                layer.alert('请求异常，请重试。')
            }
        }

        if (obj.verification(operate)) {
            obj.submit(options)
        }
    }

    /**
     * 提交表单
     */
    obj.submit = function (options) {
        var $config = $('#addOrEdit_task_dialog .config')
        // 图片样式
        var $setWidth = $config.find('.setWidth')
        var $setTop = $config.find('.setTop')
        var $setLeft = $config.find('.setLeft')
        // 设置文字样式
        var $setColor = $config.find('.setColor')
        var $setFont = $config.find('.setFontSize')
        var $setFontTop = $config.find('.setFontTop')
        var $setFontLeft = $config.find('.setFontLeft')
        var $positionRule = $config.find('#positionRule')
        var $setFontRight = $config.find('.setFontRight')
        var $setFontIndent = $config.find('.setFontIndent')
        var $setFontLineHeight = $config.find('.setFontLineHeight')

        var positionRule = {
            "img": {
                "width": $setWidth.val() + "px",
                "margin-left": $setLeft.val() + 'px',
                "margin-top": $setTop.val() + 'px'
            },
            "content": {
                "color": $setColor.val(),
                "font-size": $setFont.val() + "px",
                "padding-top": $setFontTop.val() + "px",
                "padding-left": $setFontLeft.val() + "px",
                "padding-right": $setFontRight.val() + "px",
                "line-height": $setFontLineHeight.val() + "px",
                "text-indent": $setFontIndent.val() + "em"
            }
        }
        $positionRule.val(JSON.stringify(positionRule))
        var $form = $('#addOrEdit_task_dialog #form')
        $form.ajaxSubmit(options)
    }

    /**
     * 删除事件
     * @param id
     */
    obj.devare = function (id, status) {
        if (id <= 0) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }

        var confirmIndex = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iPtv.deleteMessagePageContent(true, {contentId: id}, function (data) {
                if (data.retValue !== 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg('删除成功', {time: 1000});
                $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
                layer.close(confirmIndex);

            }, function () {
                layer.alert("删除失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }

    /**
     * 预览 事件
     * @param id
     */
    obj.preview = function (id) {
        obj.initDialog(2);
        obj.initDetailValue(id, "preview");
        $plugin.iModal({
            title: '预览',
            content: $("#preview_dialog"),
            area: '750px',
            btn: []
        }, function () {
            layer.close()
        }, null, function (layero, index) {
            layero.find('.layui-layer-btn').remove();
            layero.find("div.data").attr("index", index).attr("operate", "preview");
        })
    }

    /**
     * 表单验证
     */
    obj.verification = function (operate) {
        var $config = $('#addOrEdit_task_dialog .config'),
            $setWidth = $config.find('.setWidth'),
            $setTop = $config.find('.setTop'),
            $setLeft = $config.find('.setLeft'),
            $setColor = $config.find('.setColor'),
            $setFont = $config.find('.setFontSize'),
            $setFontTop = $config.find('.setFontTop'),
            $setFontLeft = $config.find('.setFontLeft')
        var $all = $("#addOrEdit_task_dialog").find("div.contentInfo"),
            $contentName = $all.find('[name="name"]'),
            $content = $all.find('[name="content"]'),
            $remarks = $all.find('[name="remarks"]'),
            $positionRule = $all.find('[name="positionRule"]'),
            $qrcodeUp = $all.find('#fileUpload'),
            $bgPUp = $all.find('#bgUpload')

        if (!$contentName.val() || $.trim($contentName.val()).length < 1) {
            layer.tips('消息内容名称不能为空!', $contentName, {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (!$content.val() || $.trim($content.val()).length < 1) {
            layer.tips('消息内容不能为空!', $content, {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        if (operate === iptvTask_constant.operate.create) {
            if (!$qrcodeUp.val()) {
                layer.tips('必须选择图片!', $qrcodeUp, {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
            if (!$bgPUp.val()) {
                layer.tips('请先选择背景!', $bgPUp, {time: 2000, tips: [2, "#FF9800"]})
                return false
            }
        }
        if (!$setFont.val() || !$setColor.val() || !$setWidth.val() || !$setFontTop.val() || !$setFontLeft.val() ) {
            layer.tips('请完善配置信息!', $config, {time: 2000, tips: [2, "#FF9800"]})
            return false
        }
        return true
    }

    /**
     * 初始化弹窗
     */
    obj.initDialog = function (type) {
        switch (type) {
            case 1:
                var $all = $("div.iMarket_Content").find('.wrap').clone();
                $all.find('.preHtml').empty()
                $("#addOrEdit_task_dialog").empty().append($all);
                break;
            case 2:
                var $preview = $("div.iMarket_Content").find("div.prevRow").clone();
                $("#preview_dialog").empty().append($preview);
                break;
        }
    }

    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function (operate, id) {
        if (!operate) {
            layer.alert("数据异常,请刷新重试", {icon: 5});
            return;
        }
        var $all = $("#addOrEdit_task_dialog").find("div.contentInfo"),
            $id = $all.find('[name="id"]')
            $contentName = $all.find('[name="name"]'),
            $content = $all.find('[name="content"]'),
            $remarks = $all.find('[name="remarks"]'),
            $positionRule = $all.find('[name="positionRule"]'),
            $qrcode = $all.find('#qrcode'),
            $bgP = $all.find('#bgP'),
            $qrImg = $all.find('.qrImg'),
            $bgImg = $all.find('.bgImg')
        var $editPrevi = $('#addOrEdit_task_dialog').find('.preHtml')
        var $ifShowTip = $('#addOrEdit_task_dialog .previewContainer').find('.ifShowTip')

        // 配置赋值
        var $config = $('#addOrEdit_task_dialog .config')
        var $setWidth = $config.find('.setWidth')
        var $setTop = $config.find('.setTop')
        var $setLeft = $config.find('.setLeft')
        var $setColor = $config.find('.setColor')
        var $setFont = $config.find('.setFontSize')
        var $positionRule = $config.find('#positionRule')
        var $setFontTop = $config.find('.setFontTop')
        var $setFontLeft = $config.find('.setFontLeft')
        var $setFontRight = $config.find('.setFontRight')
        var $setFontIndent = $config.find('.setFontIndent')
        var $setFontLineHeight = $config.find('.setFontLineHeight')


        if (operate === 'update') {
            assignment()
            $ifShowTip.css('display', 'none')
        } else {
            // 图片配置默认属性
            $setWidth.val(248);
            $setTop.val(50);
            $setLeft.val(50);
            //字体设置默认值
            $setColor.val('#c0c0c0');
            $setFont.val(20);
            $setFontTop.val(100);
            $setFontLeft.val(15);
            $setFontRight.val(5);
            $setFontIndent.val(1);
            $setFontLineHeight.val(28)
        }
        function assignment() {
            globalRequest.iPtv.queryMessagePushContentDetail(false,{contentId: id,showDivHeight: 240},function (res) {
                if (id <= 0) {
                    layer.alert("数据异常,请刷新重试", {icon: 5});
                    return;
                }
                var data = res
                $id.val(data.id);
                $contentName.val(data.name);
                $content.val(data.content);
                $remarks.val(data.remarks);
                $qrImg.attr('src', 'data:image/jpeg;base64,' + data.qrcodeData);
                $bgImg.attr('src', 'data:image/jpeg;base64,' + data.backgroundImgData);
                $positionRule.val(data.positionRule)
                // 配置赋值
                if (data.positionRule) {

                    var imgInfo = JSON.parse(data.positionRule).img;
                    var fontInfo = JSON.parse(data.positionRule).content;
                    if (imgInfo) {
                        $setWidth.val(parseInt(imgInfo['width']) || 50);
                        $setTop.val(parseInt(imgInfo['margin-top'])  || 0);
                        $setLeft.val(parseInt(imgInfo['margin-left']) || 0);
                    }
                    if (fontInfo) {
                        $setColor.val(fontInfo.color);
                        $setFont.val(parseInt(fontInfo['font-size']) || 16);
                        $setFontTop.val(parseInt(fontInfo['padding-top']) || 0);
                        $setFontLeft.val(parseInt(fontInfo['padding-left']) || 0);
                        $setFontRight.val(parseInt(fontInfo['padding-right']) || 0);
                        $setFontIndent.val(parseInt(fontInfo['text-indent']) || 0);
                        $setFontLineHeight.val(parseInt(fontInfo['line-height']) || 0)
                    }
                }
                $editPrevi.html(data.backHtmlContent)
            }, function () {
                layer.alert("根据ID查询数据失败", {icon: 6});
            })
        }
    }

    /**
     * 初始化对话框元素内容-预览
     * @param id
     * @param type
     * @param status
     */
    obj.initDetailValue = function (id, type) {
            if (!id || id <= 0) {
                layer.alert("未找到该数据，请稍后重试", {icon: 6});
                return;
            }
            globalRequest.iPtv.queryMessagePushContentDetail(true, {contentId: id, showDivHeight: 240}, function (res) {
                if (!res) {
                    layer.alert("根据ID查询任务数据失败", {icon: 6});
                    return;
                }
                var data = res;
                var $allPre = $("#preview_dialog").find('.prevRow');
                var $name = $allPre.find('.name')
                var $content = $allPre.find('.words')
                var $remarks = $allPre.find('.remarks')
                var $setWidth = $allPre.find('.imgWid')
                var $setTop = $allPre.find('.imgTop')
                var $setLeft = $allPre.find('.imgLeft')
                var $setColor = $allPre.find('.fontColor')
                var $setFont = $allPre.find('.fontSize')
                var $setFontTop = $allPre.find('.fontTop')
                var $setFontLeft = $allPre.find('.fontLeft')
                var $setFontLineHeight = $allPre.find('.fontLineHeight')
                var $page = $allPre.find('.page')
                if (data.positionRule) {
                    var positionRule = JSON.parse(data.positionRule)
                    // 赋值规则
                    var imgInfo = positionRule.img;
                    var fontInfo = positionRule.content;
                    if (imgInfo) {
                        $setWidth.text(imgInfo['width']);
                        $setTop.text(imgInfo['margin-top']);
                        $setLeft.text(imgInfo['margin-left']);
                    }
                    if (fontInfo) {
                        $setColor.css('background-color', fontInfo.color)
                        $setFont.text(fontInfo['font-size']);
                        $setFontTop.text(fontInfo['padding-top'])
                        $setFontLeft.text(fontInfo['padding-left'])
                        $setFontLineHeight.text(fontInfo['line-height'])
                    }
                }
                $name.text(data.name);
                $content.text(data.content);
                $remarks.text(data.remarks);
                $page.html(data.backHtmlContent);
            }, function () {
                layer.alert("根据ID查询任务数据失败", {icon: 6});
            })
    }

    /**
     * 获取任务状态
     * @param status
     */
    obj.getTaskStatus = function (status) {
        if (status == -1) {
            return "<i class='fa'>无效</i>";
        } else if (status == 1) {
            return "<i class='fa' style='color: green;'>生效中</i>";
        }  else if (status == 3) {
            return "<i class='fa' style='color: orange;'>审批中</i>";
        } else if (status == 4) {
            return "<i class='fa' style='color: red;'>审批拒绝</i>";
        }  else {
            return "<i class='fa'>未知</i>";
        }
    }

    /**
     * 获取dataTable请求地址
     * @returns {string} AjaxUrl
     */
    obj.getAjaxUrl = function () {
        return "queryMessagePushContentsByPage.view";
    }
    /**
     * 显示本地图片
     */
    obj.localViewImg = function (input, img) {
        var imgObj = document.querySelector('#' + input).files[0];
        var reader = new FileReader();
        console.log(reader);
        reader.onload = function () {
            console.log(reader.result);
            $('#' + img).attr('src', reader.result);
            $("#dataBase").val(this.result);
        }
        reader.readAsDataURL(imgObj);
    }
    return obj;
}()

function onLoadBody() {
    iptvTask.iniData();
    iptvTask.initEvent();
}