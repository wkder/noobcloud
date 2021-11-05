/**
 * Created by chang on 2017/7/25.
 */
var $CityAllotStall = new function () {
    var obj = {}
    var loginUser = {}
    var haveAllotedList = [] // 已经分配的集合
    obj.initPage = function (activity) {
        // 默认日期
        var defaultDate = new Date().Format('yyyyMM')
        // 日期筛选赋默认值
        $('#monthCode').val(defaultDate)
        obj.getLoginUser(activity)
        // 档位筛选按钮
        $('#queryStall').click(function () {
            obj.bindDataTable(activity)
        })
        // 判断显示 档位分配按钮
        if (activity.status == '3') {
            $('#allot').show()
        }
        // 判断显示下载按钮
        if (activity.status == '5' || activity.status == '6' || activity.status == '7' || activity.status == '8') {
            $('#downloadFile').show()
        }
        // 下载按钮
        $('#downloadFile').click(function () {
            obj.downloadCheckBox()
        })
        //  确认下载按钮
        $('#confirmDownloadFile').click(function () {
            obj.openDownFileType(activity)
        })
        // 档位分配按钮
        $('#allot').click(function () {
            obj.allotCheckBox()
        })
        // 确认档位分配按钮
        $('#confirmAllot').click(function () {
            obj.choosePushType(activity)
        })
    }
    obj.bindDataTable = function (activity) {
        // 默认隐藏复选框
        $('.allot-stall').find('.check-box-th').hide()
        $('.allot-stall').find('.check-box-th-download').hide()
        var $table = $('#TableData')
        var monthcode = $('#monthCode').val()
        var typeId = $('#queryStallTypeSelect').val()
        post('queryDixiaoResult.view', true, {
            'taskid': activity.taskid,
            'monthcode': monthcode,
            'area': loginUser.areaCode,
            'rankid': '',
            'isonline': '0',// 线下分配
            'ranktype': typeId
        }, function (data) {
            haveAllotedList = []
            if (data && data.length > 0) {
                joinHtml(data)
                // 下载全选 / 全不选
                $('#downloadAllCheck').click(function () {
                    var _this = this
                    var $downloadCheckBoxList = $('.allot-stall').find('.download-checkbox')
                    for (var i = 0; i < $downloadCheckBoxList.length; i++) {
                        var checkboxItem = $($downloadCheckBoxList[i]).find("[type='checkbox']")
                        if (_this.checked) {
                            checkboxItem[0].checked = true
                        } else {
                            checkboxItem[0].checked = false
                        }
                    }
                })
                // 分配全选 / 全不选
                $('#allotAllCheck').click(function () {
                    var _this = this
                    var $downloadCheckBoxList = $('.allot-stall').find('.allot-checkbox')
                    for (var i = 0; i < $downloadCheckBoxList.length; i++) {
                        var checkboxItem = $($downloadCheckBoxList[i]).find("[type='checkbox']")
                        if (_this.checked) {
                            checkboxItem[0].checked = true
                        } else {
                            checkboxItem[0].checked = false
                        }
                    }
                })
            } else {
                $table.empty()
                layer.msg('暂无数据', {time: '2000'})
            }
        }, function () {
            layer.alert("系统异常，获取低消档位信息异常", {icon: 6});
        })
        /**
         * 拼接html列表
         * @param stallList
         */
        function joinHtml(stallList) {
            var tablehtml = ''
            if (stallList.length > 0) {
                for (var i = 0; i < stallList.length; i++) {
                    var trHtml = '<tr role="row" class="odd">'
                    trHtml += '<td class="centerColumns allot-checkbox" >'
                    if (parseInt(stallList[i].status) === 1) {
                        trHtml += '<input type="checkbox" checked value="' + stallList[i].id + '"/>'
                    } else {
                        trHtml += '<input type="checkbox" value="' + stallList[i].id + '"/>'
                    }
                    trHtml += '</td>'
                    trHtml += '<td class="centerColumns download-checkbox" >'
                    trHtml += '<input type="checkbox" value="' + stallList[i].id + '" data-ranktype="' + stallList[i].ranktype + '" data-rankid="' + stallList[i].rankid + '"/>'
                    trHtml += '</td>'
                    trHtml += '<td class="centerColumns">' + stallList[i].rankid + '</td>'
                    if (stallList[i].ranktype == '0') {
                        trHtml += '<td class="centerColumns">流量</td>'
                    } else if (stallList[i].ranktype == '1') {
                        trHtml += '<td class="centerColumns">语音</td>'
                    }
                    trHtml += '<td class="centerColumns">' + stallList[i].matchno + '</td>'
                    if (parseInt(stallList[i].status) === 1) {
                        // 筛选出已经分配的集合
                        haveAllotedList.push(stallList[i].id)
                        trHtml += '<td class="centerColumns color-green">已分配</td>'
                    } else {
                        trHtml += '<td class="centerColumns">未分配</td>'
                    }
                    trHtml += '<td class="centerColumns">' + stallList[i].taskid + '</td>'
                    trHtml += '<td class="centerColumns">' + stallList[i].updatetime + '</td>'
                    var strData = JSON.stringify(stallList[i]) + ''
                    trHtml += "<td class='centerColumns'><a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='查询' onclick='$CityAllotStall.goUserList(" + strData + ")'>查询</a>"
                    // 文件下载按钮,当任务状态为 5-线下分配结束, 6-线下推送话+成功 ,7-线上分配结束，等待通知话+， 8-线上推送话+成功，且该地市的推送方式是 下载
                    /*if (stallList[i].method == '1' && (activity.status == '5' || activity.status == '6' || activity.status == '7' || activity.status == '8')) {
                     trHtml += "<a id='btnDownload' class='btn btn-warning btn-edit btn-sm' title='下载' onclick='$CityAllotStall.openDownFileType(" + strData + ")'>下载</a>"
                     }*/
                    trHtml += '</td></tr>'
                    tablehtml = tablehtml + trHtml
                }
            } else {
                var trHtml = '<tr role="row" class="odd">'
                trHtml += '<td class="centerColumns"><div>暂无数据</div></td>'
                trHtml += '</tr>'
                tablehtml = tablehtml + trHtml
            }
            $table.html(tablehtml)
        }
    }
    /**
     * 分配选择
     */
    obj.allotCheckBox = function () {
        var $checkBoxHeader = $('.allot-stall').find('.check-box-th')
        var $checkBoxList = $('.allot-stall').find('.allot-checkbox')
        // 显示复选框
        // $($checkBoxList[0]).find("[type='checkbox']").val()
        if ($checkBoxList.length > 0) {
            // 显示标题  和 确认分配按钮
            $checkBoxHeader.show()
            $('#confirmAllot').show()
            for (var i = 0; i < $checkBoxList.length; i++) {
                $($checkBoxList[i]).show()
            }
        }
    }
    /**
     * 下载选择
     */
    obj.downloadCheckBox = function () {
        var $checkBoxHeader = $('.allot-stall').find('.check-box-th-download')
        var $checkBoxList = $('.allot-stall').find('.download-checkbox')
        // 显示复选框
        // $($checkBoxList[0]).find("[type='checkbox']").val()
        if ($checkBoxList.length > 0) {
            // 显示标题  和 确认下载按钮
            $checkBoxHeader.show()
            $('#confirmDownloadFile').show()
            for (var i = 0; i < $checkBoxList.length; i++) {
                $($checkBoxList[i]).show()
            }
        }
    }
    /**
     * 选择本次号池的推送方式
     */
    obj.choosePushType = function (activity) {
        var $ChoosePushType = $('.dialog-layer').find('.push-type')
        var template = $('.dialog-templete').find('.push-type').clone();
        $ChoosePushType.empty()
        $ChoosePushType.append(template)
        layer.open({
            type: 1,
            title: '请选择本地市低消号池推送方式',
            closeBtn: 1,
            skin: 'markBackGroundColor',
            shadeClose: false,
            area: ['520px', '240px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $ChoosePushType,
            yes: function (index) {
                var pushType = ''
                var radioPushType = $('.dialog-layer').find("[type='radio']")
                for (var i = 0; i < radioPushType.length; i++) {
                    if (radioPushType[i].checked) {
                        pushType = $(radioPushType[i]).val()
                    }
                }
                if (!pushType) {
                    layer.msg('请选择本地市号池推送方式', {time: '2000'})
                    return false
                }
                layer.close(index)
                obj.confirmAllot(pushType, index, activity)
            },
            cancel: function (index) {
                layer.close(index)
            }
        });
    }
    /**
     * 提交地市管理员分配档位
     */
    obj.confirmAllot = function (method, index, activity) {
        var $checkBoxList = $('.allot-stall').find('.allot-checkbox')
        var checkStallList = []
        $('#confirmAllot').hide()
        if ($checkBoxList.length > 0) {
            for (var i = 0; i < $checkBoxList.length; i++) {
                var $checkboxObj = $($checkBoxList[i]).find("[type='checkbox']")
                if ($checkboxObj[0].checked) {
                    checkStallList.push($checkboxObj.val())
                }
            }
            // 本次新增的数据：在 checkStallList 且 不在 haveAllotedList
            // 本次删除的数据：不在 checkStallList 且 在 haveAllotedList
            var addList = [] // 本次新增的集合
            var deleteList = [] //本次删除的集合
            // 组装新增集合
            for (var i = 0; i < checkStallList.length; i++) {
                function diff(item) {
                    return parseInt(item) === parseInt(checkStallList[i])
                }

                // 将用户新选择的档位 id 加入 addedlist
                if (haveAllotedList.findIndex(diff) === -1) {
                    addList.push(checkStallList[i])
                }
            }
            // 组装删除集合
            for (var i = 0; i < haveAllotedList.length; i++) {
                function diff(item) {
                    return parseInt(item) === parseInt(haveAllotedList[i])
                }

                // 将用户新选择的档位 id 加入 addedlist
                if (checkStallList.findIndex(diff) === -1) {
                    deleteList.push(haveAllotedList[i])
                }
            }
            var strAdd = addList.join(',')
            var strDelete = deleteList.join(',')
            $html.loading(true);
            post('allocateDixiaoOffline.view', true, {
                'addedlist': strAdd,
                'deletedlist': strDelete,
                'taskid': activity.taskid,
                'method': parseInt(method)
            }, function (res) {
                if (res.retValue == '0') {

                    // 市级管理员分配档位成功后，需要调用通知接口，通知升级管理员
                    post('notifyToOperatorForDixiao.view', false, {'taskid': activity.taskid}, function (res) {
                        $html.loading(false);
                        if (res.retValue == '0') {
                            obj.bindDataTable(activity)
                            layer.msg('该地市低消档位分配成功', {time: '2000'})
                        } else {
                            layer.alert(res.desc, {icon: 6});
                        }
                    }, function () {
                        layer.alert('分配档位成功，通知省级管理员失败，请手动通知省级管理员', {icon: 6});
                    }, function () {

                    }, true)
                }
            }, function () {
                $html.loading(false);
                layer.msg('系统问题，请稍后重试！', {time: 2000})
            }, function () {

            }, true)
        }
    }
    /**
     * 前往用户详情
     * @param rankId
     * @param area
     */
    obj.goUserList = function (model) {
        if (model) {
            htmlHandle.handleGoUserListByProductId({proId: model.id, area: model.area});
        }
    }
    /**
     * 选择文件下载类型
     */
    obj.openDownFileType = function (activity) {
        var chooseDownloadFile = $('.dialog-templete').find('.download-type').clone()
        var dialogHtml = $('.dialog-layer').find('.download-type')
        dialogHtml.empty()
        dialogHtml.append(chooseDownloadFile)
        chooseDownloadFile.show()
        layer.open({
            type: 1,
            title: '低消档位文件下载',
            closeBtn: 1,
            skin: 'markBackGroundColor',
            shadeClose: false,
            area: ['320px', '280px'],
            offset: '60px',
            shift: 6,
            btn: ['确定'],
            content: dialogHtml,
            yes: function (index) {
                // 判断用户选择的BSS/CBSS
                var systemType = ''
                var radio = document.getElementsByName("systemType")
                for (var i = 0; i < radio.length; i++) {
                    if (radio[i].checked) {
                        systemType = $(radio[i]).val()
                    }
                }
                obj.downFile(systemType, activity, index)
            }
        });
    }
    /**
     * 文件下载
     * @param systemType
     * @param model
     * @param index
     */
    obj.downFile = function (systemType, activity, index) {
        // 取用户现在的档位id
        var $checkBoxList = $('.allot-stall').find('.download-checkbox')
        var checkStallList = []
        var rankIdList = []
        var rankType = ''
        $('#confirmDownloadFile').hide()
        if ($checkBoxList.length > 0) {
            for (var i = 0; i < $checkBoxList.length; i++) {
                var $checkboxObj = $($checkBoxList[i]).find("[type='checkbox']")
                if ($checkboxObj[0].checked) {
                    checkStallList.push($checkboxObj.val())
                    rankIdList.push($checkboxObj.attr('data-rankid'))
                    if (i === 0) {
                        rankType = $checkboxObj.attr('data-ranktype')
                    }
                }
            }
        }
        if (!systemType || systemType == '') {
            layer.alert("请选择文件下载类型！", {icon: 6});
            return false
        }
        if (checkStallList.length < 1) {
            layer.alert("请选择需要下载的产品数据！", {icon: 6});
            return false
        }
        var ids = checkStallList.join(',')
        var rankids = rankIdList.join(',')
        debugger
        var param = {
            'sysname': systemType || '',
            'taskid': activity.taskid,
            'area': loginUser.areaCode,
            'rankid': rankids,
            'ranktype': rankType,
            'id': ids
        }
        layer.close(index)
        obj.exportData("exportDixiao.view", obj.getParams(param));
    }
    // 导出数据
    obj.exportData = function (url, params) {
        var tempForm = document.createElement("form");
        tempForm.id = "tempForm";
        tempForm.method = "POST";
        tempForm.action = url;
        $.each(params, function (idx, value) {
            input = document.createElement("input");
            input.type = "hidden";
            input.name = value[0];
            input.value = value[1];
            tempForm.appendChild(input);
        });
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
    };
    // 获取请求参数
    obj.getParams = function (param) {
        var paramList = [
            ["sysname", param.sysname],
            ["taskid", param.taskid],
            ["area", param.area],
            ["rankid", param.rankid],
            ["ranktype", param.ranktype],
            ['id', param.id]
        ];
        return paramList;
    }
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function (activity) {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
            // 格式化地市编码为4位
            if (loginUser.areaCode != '99999') {
                if (loginUser.areaCode.toString().length === 2) {
                    loginUser.areaCode = '00' + loginUser.areaCode
                } else if (loginUser.areaCode.toString().length === 3) {
                    loginUser.areaCode = '0' + loginUser.areaCode
                }
            }
            obj.bindDataTable(activity)
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    return obj
}
function onLoadBody(activity) {
    $CityAllotStall.initPage(activity)
}