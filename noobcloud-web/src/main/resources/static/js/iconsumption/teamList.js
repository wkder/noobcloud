/**
 * Created by chang on 2017/7/27.
 */
var teamList = new function () {
    var obj = {}
    var loginUser = {}
    var get_list_api = 'queryPartnerCodeByPage.view'
    var pre_have_allot_team_list = [] // 之前已经分配好的团队列表

    /**
     * 初始化页面
     */
    obj.initPage = function () {
        obj.getLoginUser()
        // 筛选团队列表
        $('#queryTeam').click(function () {
            obj.queryTeam()
        })
        // 分配团队信息
        $('#allotTeam').click(function () {
            obj.openAllotTeamDialog()
        })
        obj.initDataTable()
    }
    /**
     * 初始化团队列表
     */
    obj.initDataTable = function () {
        var teamName = $('#teamName').val()
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: get_list_api + "?code=&name=" + teamName,
                type: "POST"
            },
            columns: [
                {data: "name", title: "团队", className: "centerColumns", width: 140},
                {data: "code", title: "渠道编码", className: "centerColumns", width: 140},
                {data: "createtime", title: "更新时间", className: "centerColumns", width: 130},
                {
                    data: "isallocate", width: 120, title: "状态", className: "centerColumns",
                    render: function (data, type, row) {
                        if (row.isallocate === '1') {
                            return '<span style="color: #00B83F;">已分配</span>'
                        } else {
                            return '<span>未分配</span>'
                        }
                    }
                }
            ]
        }
        dataTable = $plugin.iCompaignTable(option)
    }
    /**
     * 筛选团队信息
     */
    obj.queryTeam = function () {
        var teamName = $('#teamName').val()
        dataTable.ajax.url(get_list_api + "?name=" + teamName + "&code=");
        dataTable.ajax.reload();
    }
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    /**
     * 初始化分配团队弹窗
     */
    obj.openAllotTeamDialog = function () {
        // 复制分配团队模板
        var $TeamDialog = $('#dialogTeam').find('.team-allot')
        var template = $('#templateTeam').find('.allotProductInfoDialog').clone()
        $TeamDialog.empty()
        $TeamDialog.append(template)
        getallotTeamData()
        $plugin.iModal({
            title: '线上团队分配',
            content: $TeamDialog,
            area: '750px'
        }, function (index, layero) {
            obj.allotTeam(index)
        }, function (index) {
            layer.close(index);
        }, null, function (index) {
            layer.close(index);
        })
        // 初始化穿梭框的选择事件
        $('.js-multiselect').multiselect({
            right: '#multiselectRight',
            rightAll: '#btnRightAll',
            rightSelected: '#btnRightSign',
            leftSelected: '#btnLeftSign',
            leftAll: '#btnLeftAll',
            beforeMoveToLeft: function ($left, $right, $options) {
                return true;
            },
            beforeMoveToRight: function ($left, $right, $options) {
                return true
            }
        })
        // 给搜索事件赋值
        $('#QueryAllotTeam').click(function () {
            getallotTeamData()
        })
        /**
         * 取 分配 和 待分配 团队列表
         */
        function getallotTeamData() {
            var teamDataList = [] // 总的团队列表
            var can_team_data = [] // 可分配的团队列表
            var have_team_data = [] // 已经分配的团队列表
            var name = $('#teamAllotName').val();
            post(get_list_api + '?code=&name=' + name, true, {code: '', name: name}, function (res) {
                if (res && res.data) {
                    teamDataList = res.data
                    // 取可分配的团队列表
                    can_team_data = teamDataList.filter(function (item) {
                        return item.isallocate == '0'
                    })
                    // 取已经分配的团队列表
                    have_team_data = teamDataList.filter(function (item) {
                        return item.isallocate == '1'
                    })
                    // 给全局变量，已经分配的团队列表赋值，方便后面提交时筛选 本次新增的团队信息 本次删除的团队信息
                    pre_have_allot_team_list = have_team_data
                    // 赋值 左边 可选团队
                    var $leftSelectForm = $TeamDialog.find('.selectLeft').find('.js-multiselect')
                    $leftSelectForm.empty()
                    if (can_team_data.length > 0) {
                        for (var i = 0; i < can_team_data.length; i++) {
                            $leftSelectForm.append("<option value='" + can_team_data[i].code + "' title='" + can_team_data[i].name + "' data-status='" + can_team_data[i].isallocate + "'>" + can_team_data[i].name + "[" + can_team_data[i].code + "]</option>")
                        }
                    }
                    // 赋值 右边 已选团队
                    // 赋值 右边 已选档位
                    var $RightSelectForm = $TeamDialog.find('#multiselectRight')
                    $RightSelectForm.empty()
                    if (have_team_data.length > 0) {
                        for (var i = 0; i < have_team_data.length; i++) {
                            $RightSelectForm.append("<option value='" + have_team_data[i].code + "' title='" + have_team_data[i].name + "' data-status='" + have_team_data[i].isallocate + "'>" + have_team_data[i].name + "[" + have_team_data[i].code + "]</option>")
                        }
                    }

                } else {
                    layer.msg("暂无可分配的团队信息！", {time: 2000});
                }
            }, function () {
                layer.alert("分配异常，请稍后再试！", {icon: 6});
            })
        }
    }
    /**
     * 提交团队分配
     */
    obj.allotTeam = function (index) {
        try {
            var curr_select_team_data = []
            var addedlist = []
            var deletedlist = []
            var strAdd = ''
            var strDelete = ''
            var $TeamDialog = $('#dialogTeam').find('.team-allot')
            // 获取用户当前已经分配的团队信息
            var curr_select_team_options = $TeamDialog.find('#multiselectRight option')
            for (var i = 0; i < curr_select_team_options.length; i++) {
                curr_select_team_data.push({'code': $(curr_select_team_options[i]).val()})
            }

            // 取 本次新增的列表 addedlist 之前的 pre_have_allot_team_list 中没有， curr_select_team_data 中存在
            for (var i = 0; i < curr_select_team_data.length; i++) {
                function diff(item) {
                    return item.code == curr_select_team_data[i].code
                }

                // 将用户新选择的团队 id 加入 addedlist
                if (pre_have_allot_team_list.findIndex(diff) === -1) {
                    addedlist.push(curr_select_team_data[i].code)
                }
            }
            // 取 本次删除的列表 addedlist 之前的 curr_select_team_data 中没有， pre_have_allot_team_list 中存在
            for (var i = 0; i < pre_have_allot_team_list.length; i++) {
                function diff(item) {
                    return item.code == pre_have_allot_team_list[i].code
                }

                if (curr_select_team_data.findIndex(diff) === -1) {
                    deletedlist.push(pre_have_allot_team_list[i].code)
                }
            }
            if (addedlist.length > 0) {
                strAdd = addedlist.join(',')
            }
            if (deletedlist.length > 0) {
                strDelete = deletedlist.join(',')
            }
            post('allocatePartner.view', true, {'addedlist': strAdd, 'deletedlist': strDelete}, function (res) {
                if (res.retValue == '0') {
                    layer.close(index)
                    obj.queryTeam()
                    layer.msg("团队分配成功！", {time: 2000});
                } else {
                    layer.alert(res.desc, {icon: 6});
                }
            }, function () {
                layer.close(index)
                layer.alert("分配异常，请稍后再试！", {icon: 6});
            })

        } catch (ex) {
        }
    }
    return obj
}
function onLoadBody(status) {
    teamList.initPage()
}