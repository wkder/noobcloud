/**
 * Created by chang on 2017/7/24.
 */
var $ActivityObj = new function () {
    var obj = {}
    var loginUser = {}
    var get_list_api = 'queryDixiaoTaskByPage.view'
    var onlineUserRoleId = '200000' // 线上省级管理员的id
    var offlineUserRoleId = '200001' // 线下省级管理员的id
    var cityAdminRoleId = ['100030 ', '100031', '100018'] // 地市管理员Id
    obj.initPage = function (status) {
        $('#monthCode').val(new Date().Format('yyyyMM'))
        // 取登录人信息
        obj.getLoginUser(status)
        $('#queryActivity').click(function () {
            obj.queryActivity()
        })
    }
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function (status) {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
            obj.initDataTable(status)
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    /**
     * 初始化活动列表
     */
    obj.initDataTable = function (status) {
        var monthcode = $('#monthCode').val()
        var activityName = $('#activityName').val()
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: get_list_api + '?salename=' + activityName + '&monthcode=' + monthcode,
                type: "POST"
            },
            columns: [
                {data: "taskid", title: "活动ID", className: "centerColumns", width: 120, visible: false},
                {data: "saleid", title: "活动编码", className: "centerColumns", width: 120},
                {data: "salename", title: "活动名称", className: "centerColumns", width: 120},
                {data: "boid", title: "波次编码", className: "centerColumns", width: 100},
                {data: "aim_sub_name", title: "目标客户群", className: "centerColumns", width: 130},
                {
                    data: "status", width: 120, title: "活动状态", className: "centerColumns",
                    render: function (data, type, row) {
                        switch (row.status.toString()) {
                            case '0':
                                return '<span>初始</span>'
                                break
                            case '1':
                                return '<span>已入库</span>'
                                break
                            case '-1':
                                return '<span>入库失败</span>'
                                break
                            case '2':
                                return '<span>档位类型成功</span>'
                                break
                            case '-2':
                                return '<span>档位类型失败</span>'
                                break
                            case '3':
                                return '<span>待分配</span>'
                                break
                            case '-3':
                                return '<span>待分配失败</span>'
                                break
                            case '4':
                                return '<span>已锁定</span>'
                                break
                            case '-4':
                                return '<span>锁定失败</span>'
                                break
                            case '5':
                                return '<span>线下推送话+过程中</span>'
                                break
                            case '-5':
                                return '<span>线下推送话+失败</span>'
                                break
                            case '6':
                                return '<span>线下分配已结束，推送话+成功</span>'
                                break
                            case '-6':
                                return '<span>线下分配错误</span>'
                                break
                            case '7':
                                return '<span>线上推送话+过程中</span>'
                                break
                            case '-7':
                                return '<span>线上推送话+失败</span>'
                                break
                            case '8':
                                return '<span>线上推送话+成功</span>'
                                break
                            case '-8':
                                return '<span>线上推送话+失败</span>'
                                break
                            default:
                                return '<span>任务失效</span>'
                                break
                        }
                    }
                },
                {
                    width: 160, className: "centerColumns", title: "操作",
                    render: function (data, type, row) {
                        var $buttons = "";
                        var rowStr = JSON.stringify(row) + ''
                        var $queryBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='档位分配' onclick='$ActivityObj.handleRnakByActivity(" + rowStr + ")'>档位分配</a>";
                        var $updateBtnHtml = "<a id='btnEdit' class='btn btn-warning btn-edit btn-sm' title='修改类型' onclick='$ActivityObj.updateRankType(" + row.taskid + ")'>修改类型</a>";
                        var $cantBtnHtml = "<a id='btnEdit' style='cursor:not-allowed;background-color: #CCCCCC;border: 0;' class='btn btn-info disabled btn-edit btn-sm' title='不可操作'>不可操作</a>";
                        var $parnterListBtnHtml = "<a id='btnEdit' class='btn btn-warning btn-edit btn-sm' title='分配预览' onclick='$ActivityObj.handleParnterList(" + rowStr + ")'>分配预览</a>";

                        if (loginUser.roleIds || loginUser.roleIds.indexOf(offlineUserRoleId) != -1) {
                            if (row.status == '1') {
                                $buttons = $buttons + $updateBtnHtml
                            } else if (row.status == '2'
                                || row.status == '3' || row.status == '-3'
                                || row.status == '4' || row.status == '-4'
                                || row.status == '5' || row.status == '-5'
                                || row.status == '6' || row.status == '-6'
                                || row.status == '7' || row.status == '-7'
                                || row.status == '8' || row.status == '-8') {
                                $buttons = $buttons + $queryBtnHtml
                            } else {
                                $buttons = $buttons + $cantBtnHtml
                            }
                        } else if (loginUser.roleIds || loginUser.roleIds.indexOf(onlineUserRoleId)) {
                            if (row.status == '6' || row.status == '-6' || row.status == '7' || row.status == '-7' || row.status == '-8') {
                                $buttons = $buttons + $queryBtnHtml
                            } else if (row.status == '8') {
                                $buttons = $buttons + $queryBtnHtml
                                $buttons = $buttons + $parnterListBtnHtml
                            } else {
                                $buttons = $buttons + $cantBtnHtml
                            }
                        } else if (chenckIsContain(cityAdminRoleId,loginUser.roleIds)) {
                            if (row.status != '0' && row.status != '1' && row.status != '-1' && row.status != '2' && row.status != '10') {
                                $buttons = $buttons + $queryBtnHtml
                            } else {
                                $buttons = $buttons + $cantBtnHtml
                            }
                        }
                        else {
                            $buttons = $buttons + $cantBtnHtml
                        }
                        return $buttons
                    }
                }
            ]
        }
        dataTable = $plugin.iCompaignTable(option)

        // 遍历地市管理员角色，确认当前登录人是否包含该角色
        function chenckIsContain(cityAdminRoleId,userRoleIds)
        {
            if(cityAdminRoleId && userRoleIds)
            {
                for(var i = 0,k =cityAdminRoleId.length;i<k;i++)
                {
                     if(userRoleIds.indexOf(cityAdminRoleId[i]) != -1){return true;}
                }
            }
            else
            {
                return false;
            }
        }
    }
    /**
     * 数据筛选
     */
    obj.queryActivity = function () {
        var monthcode = $('#monthCode').val()
        var activityName = $('#activityName').val()
        dataTable.ajax.url(get_list_api + '?salename=' + activityName + '&monthcode=' + monthcode);
        dataTable.ajax.reload();
    }
    /**
     * 更改任务的类型  0-流量 1-语音
     */
    obj.updateRankType = function (id) {
        var $template = $('#template').find('.updateRankType').clone()
        var $dialogHtml = $('#dialog').find('.updateRankType')
        $dialogHtml.empty()
        $template.find('#flow')[0].checked = true;
        $dialogHtml.append($template)
        layer.open({
            type: 1,
            title: '任务类型选择',
            closeBtn: 1,
            skin: 'markBackGroundColor',
            shadeClose: false,
            area: ['320px', '280px'],
            offset: '60px',
            shift: 6,
            btn: ['确定'],
            content: $dialogHtml,
            yes: function (index) {
                // 判断用户选择的BSS/CBSS
                var rankType = '0'
                var radio = document.getElementsByName("rankType")
                for (var i = 0; i < radio.length; i++) {
                    if (radio[i].checked) {
                        rankType = $(radio[i]).val()
                    }
                }
                submitRankType(id, rankType, index)
            }
        })
        function submitRankType(id, rankType, index) {
            if (!rankType) {
                layer.msg('请选择任务的类型！', {time: 2000})
                return false
            }
            layer.close(index)
            post('updateDixiaoRankType.view', true, {'taskid': id, 'ranktype': rankType}, function (res) {
                if (res.retValue == '0') {
                    obj.updateActivityStatu(2, '修改成功', id)
                } else {
                    layer.alert(res.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常，请稍后重试", {icon: 6});
            })
        }
    }
    /**
     * 用接口更新活动状态，刷新档位信息和操作按钮，同时需要修改当前活动状态
     * @param activityStatus
     */
    obj.updateActivityStatu = function (curr_activity_status, msg, id) {
        post('modifyTaskStatus.view', true, {'status': curr_activity_status, 'taskid': id}, function (res) {
            if (res && res.retValue == '0') {
                obj.queryActivity()
                layer.msg(msg, {time: 2000})
            } else {
                layer.msg(res.desc, {time: 2000})
            }
        }, function () {
            layer.alert("系统异常，请稍后再试", {icon: 6});
        })
    }
    /**
     * 根据活动，前往该活动的档位分配页面
     * @param model
     */
    obj.handleRnakByActivity = function (model) {
        // 判断当前用户 为 省级管理员 / 市级管理员
        var url = 'iconsumption/cityAllotStall.requestHtml'
        if (loginUser.areaCode == '99999') {
            url = 'iconsumption/allotStall.requestHtml'
        }
        model.isfromparnter = 0
        $("#coreFrame").load(url + "?time" + new Date().getTime(), function (response, sts, xhr) {
            if (xhr.status == 200) {
                // 将活动对象传递到下一页
                onLoadBody(model);
            } else if (xhr.status == 911) {
                var redirectUrl = xhr.getResponseHeader("redirectUrl");
                layer.alert('会话超时，请重新登录', function (index) {
                    window.location.href = redirectUrl;
                    layer.close(index);
                    return;
                });
            }
        });
    }
    /**
     * 根据活动，前往该活动的线上分配团队信息页面
     * @param model
     */
    obj.handleParnterList = function (model) {
        $("#coreFrame").load("iconsumption/parnterList.requestHtml?time" + new Date().getTime(), function (response, sts, xhr) {
            if (xhr.status == 200) {
                // 将活动对象传递到下一页
                onLoadBody(model);
            } else if (xhr.status == 911) {
                var redirectUrl = xhr.getResponseHeader("redirectUrl");
                layer.alert('会话超时，请重新登录', function (index) {
                    window.location.href = redirectUrl;
                    layer.close(index);
                    return;
                });
            }
        });
    }
    return obj
}

function onLoadBody(status) {
    $ActivityObj.initPage(status)
}
// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}