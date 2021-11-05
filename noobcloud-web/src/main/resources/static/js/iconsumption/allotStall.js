/**
 * Created by chang on 2017/7/19.
 */
var allotStallObj = new function () {
    var obj = {}
    var loginUser = {}
    var activityId = '' // 活动编码
    var activityStatus = '' // 活动状态
    var curr_select_stall_list = [] // 当前用户选中的档位项
    var pre_haved_select_stall_list = [] // 之前已经选中的档位项
    var onlineUserRoleId = '200000' // 线上省级管理员的id
    var offlineUserRoleId = '200001' // 线下省级管理员的id
    var activityStatuModel = {
        initStatus: '0', // 0-初始（用户文件未入库）
        intoDB: '1', // 1-入库(-1入库失败)
        rankTypeSelect: '2', // 档位类型选择完毕
        cityReadyAllot: '3', // 3-市级待分配（-3市级待分配失败）
        lockStatus: '4', // 4-市级分配锁定(-4市级分配失败)
        confirmStatus: '5',// 5一键通知话+(-5通知话+失败)
        confirmFailStatus: '-5',// (-5通知话+失败)
        offlineEnd: '6', // 6-线下分配结束(-6线下分配错误)
        offlineFailEnd: '-6',// -6线下分配错误
        onlineEnd: '7', // 7-线上分配结束(-7线上分配失败)
        onlineFailEnd: '-7', // -7线上分配失败
        onlineHuaEnd: '8',// 8-线上送话+成功(-8线上送话+失败)
        onlineHuaFailEnd: '-8',// -8线上送话+失败
        provinceCanAllot: '9', // 省级可操作 （临时状态）
        fail: '10' // 失败
    } // 当前任务活动的状态
    var defaultDate = new Date().Format('yyyyMM')
    var stallCount = 0 // 档位的数量
    var isfromparnter = 0  // 是否从外呼团队页面进入
    var ranktype = '0'
    var activityModel = {}
    /**
     * 初始化页面方法
     */
    obj.initPage = function (activity) {
        // 将从活动页面传输的活动ID和活动状态暂时缓存到页面
        activityModel = activity
        activityId = parseInt(activity.taskid)
        activityStatus = activity.status
        ranktype = activity.ranktype
        isfromparnter = activity.isfromparnter
        if (activityId > 0 && activityStatus.toString().length > 0) {
            // 默认页面隐藏，当取到活动参数市，才能对页面进行处理
            $('#allotStallPage').show()
            if (isfromparnter == 0) {
                $('#queryStallTypeSelect').val(ranktype)
            }
            // 取当前登录信息
            obj.getLoginUser()
            // 线上省级管理员，显示团队下拉列表 + 分配预览按钮
            if (loginUser && loginUser.roleIds == onlineUserRoleId) {
                $('#queryTeamSelect').show()
                // 绑定团队筛选列表
                obj.bindSelectTeam(true)
            }
            $('#queryActivitySelect').show()
            // 绑定任务列表筛选列表
            obj.bindActivitySelectData(defaultDate)
            // 日期筛选赋默认值
            $('#updateDateTime').val(defaultDate)
            $('#queryActivitySelect').change(function () {
                obj.selectActivity()
            })
            // 档位筛选按钮
            $('#queryStall').click(function () {
                obj.filterStall()
            })
            // 开始分配 按钮
            $('#allotStall').click(function () {
                // 修改活动状态为 9（临时状态，不同步到数据库），说明低档位可调整分配
                obj.trimStall()
            })
            // 取消分配 按钮
            $('#exitAllotStall').click(function () {
                // 修改活动状态为 3-市级分配锁定(-3市级分配失败)
                obj.exitTrimStall()
            })
            // 一键通知地市管理员领取档位按钮
            $('#noticeCityManager').click(function () {
                obj.noticeCityManager()
            })
            // 锁定地市产品档位按钮
            $('#LockStall').click(function () {
                obj.lockStall()
            })
            // 确认档位分配按钮
            $('#offlineConfirmAllot').click(function () {
                obj.submitConfirmAllotStall()
            })
            // 线下推送到话+按钮
            $('#offlinePushToHua').click(function () {
                obj.offlinepushToHua()
            })
            // 线上确认分配按钮
            $('#onlineConfirmAllot').click(function () {
                obj.onlineConfirmAllotStall()
            })
            // 线上推送到话+按钮
            $('#onlinePushToHua').click(function () {
                obj.judgePush()
            })
            // 线上取消分配按钮
            $('#exitOnlineAllotStall').click(function () {
                obj.exitTrimStall()
            })
            // 通知风雷按钮
            $('#noticeFl').click(function () {
                obj.noticeFl()
            })
            // 默认带上条件取档位信息
            obj.getStallData()
            // 取统计数据
            obj.queryDixiaoStatistic()
            //根据活动状态，判断操作按钮
            obj.btnShowSwitch()
        } else {
            layer.msg('暂未取到活动信息，请刷新后重试！', {time: 2000})
        }
    }
    /**
     * 活动任务筛选，改变当前活动id和活动状态
     */
    obj.selectActivity = function () {
        activityId = parseInt($('#queryActivitySelect').val())
        var options = $('#queryActivitySelect').find('option')
        for (var i = 0; i < options.length; i++) {
            if (options[i].selected) {
                activityStatus = $(options[i]).attr('data-status')
            }
        }
    }
    /**
     * 团队筛选，改变当前团队的id
     */
    obj.bindSelectTeam = function (haveAll) {
        var $selectTeamElement = $('#queryTeamSelect')
        $selectTeamElement.empty()
        post('queryPartnerCodeByPage.view', false, {'code': '', 'name': '', 'taskid': activityId}, function (res) {
            if (res && res.data) {
                var teamList = res.data
                teamList = teamList.filter(function (item) {
                    return item.isallocate == '1'
                })
                if (haveAll) {
                    $selectTeamElement.append("<option value='A' selected>B</option>".replace(/A/g, '').replace(/B/g, '全部团队'));
                }
                if (teamList.length > 0) {
                    for (var i = 0; i < teamList.length; i++) {
                        // 将从外呼团队带过来的团队code赋值给团队下拉列表，用户数据筛选
                        if (activityModel.isfromparnter == '1') {
                            if (activityModel.partnercode == teamList[i].code) {
                                $selectTeamElement.append("<option value='" + teamList[i].code + "' selected>" + teamList[i].name + "</option>");
                            }
                        }
                        $selectTeamElement.append("<option value='" + teamList[i].code + "'>" + teamList[i].name + "</option>");
                    }
                } else {
                    layer.alert("暂无外呼团队提供选择，请先分配外呼团队", {icon: 6});
                }
            } else {
                layer.alert("暂无外呼团队提供选择，请先分配外部团队", {icon: 6});
            }
        }, function () {
            layer.alert("系统异常，请稍后再试", {icon: 6});
        })
    }
    /**
     * 数据筛选，除了要重新取档位数据，还要刷新按钮状态
     */
    obj.filterStall = function () {
        obj.btnShowSwitch()
        // 分配时点击查询，不需要带
        obj.getStallData()
        // 更新当前活动统计数据
        obj.queryDixiaoStatistic()
    }
    /**
     * 根据活动状态，判断操作按钮
     */
    obj.btnShowSwitch = function () {
        // 初始化隐藏所有按钮
        var btns = $('.notice-city-manager')
        for (var i = 0; i < btns.length; i++) {
            $(btns[i]).hide()
        }
        // 隐藏取消分配按钮
        $('#exitAllotStall').hide()
        //　隐藏　开始分配　按钮
        $('#allotStall').hide()
        // 线上低消管理员
        if (loginUser && loginUser.roleIds == onlineUserRoleId) {
            //线下分配结束---线上分配按钮
            if (activityStatus.toString() === activityStatuModel.offlineEnd //线下分配结束
                || activityStatus.toString() === activityStatuModel.onlineEnd //线上分配结束
                || activityStatus.toString() === activityStatuModel.onlineFailEnd // 线上分配失败
                || activityStatus.toString() === activityStatuModel.onlineHuaEnd // 线上推送到话+
                || activityStatus.toString() === activityStatuModel.onlineHuaFailEnd) {
                //　同时显示　开始分配　按钮
                $('#allotStall').show()
                // 5线下分配结束---线上确认分配按钮
                $('#btnArea').find('#onlinePushToHua').css('display', 'block')
            } else if (activityStatus.toString() === activityStatuModel.provinceCanAllot) {
                $('#btnArea').find('#onlineConfirmAllot').css('display', 'block')
                $('#exitAllotStall').show()
            }
        } else if (loginUser && loginUser.roleIds == offlineUserRoleId) {
            switch (activityStatus.toString()) {
                case activityStatuModel.initStatus:
                    break
                case activityStatuModel.rankTypeSelect: // 已入库，省级通知按钮
                    $('#btnArea').find('#noticeCityManager').css('display', 'block')
                    break
                case activityStatuModel.cityReadyAllot: // 市级待分配---省级锁定按钮
                    $('#btnArea').find('#LockStall').css('display', 'block')
                    //　显示通知风雷　按钮
                    $('#btnArea').find('#noticeFl').show()
                    break
                case activityStatuModel.lockStatus: // 市级分配锁定---推送给话+按钮
                case activityStatuModel.confirmFailStatus: // 推送话+失败
                case activityStatuModel.offlineFailEnd: // 线下分配失败
                    $('#btnArea').find('#offlinePushToHua').css('display', 'block')
                    //　显示通知风雷　按钮
                    $('#btnArea').find('#noticeFl').show()
                    //　同时显示　开始分配　按钮
                    $('#allotStall').show()
                    break
                case activityStatuModel.provinceCanAllot:
                    $('#btnArea').find('#offlineConfirmAllot').css('display', 'block')
                    // 显示 取消分配 按钮
                    $('#exitAllotStall').show()
                    //　显示通知风雷　按钮
                    $('#btnArea').find('#noticeFl').show()
                    break
                default:
                    //　显示通知风雷　按钮
                    $('#btnArea').find('#noticeFl').show()
                    break
            }
        }
    }
    /**
     * 绑定活动列表信息
     */
    obj.bindActivitySelectData = function (monthcode) {
        var $activitySelectElement = $('#queryActivitySelect');
        $activitySelectElement.empty()
        // 添加默认
        post('queryDixiaoTaskByPage.view', true, {
            'salename': '',
            'monthcode': monthcode,
            'taskid': activityId
        }, function (res) {
            if (res && res.data) {
                var activityList = res.data
                for (var i = 0; i < activityList.length; i++) {
                    if (activityList[i].taskid === activityId) {
                        $activitySelectElement.append("<option value='" + activityList[i].taskid + "' data-status='" + activityList[i].status + "' selected>" + activityList[i].salename + "</option>");
                    } else {
                        $activitySelectElement.append("<option value='A' data-status='C'>B</option>".replace(/A/g, activityList[i].taskid).replace(/B/g, activityList[i].salename).replace(/C/g, activityList[i].status));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，请稍后再试", {icon: 6});
        })
    }
    /**
     * 取各地市全量档位信息
     */
    obj.getStallData = function () {
        var source = '0'
        source = loginUser.roleIds == onlineUserRoleId ? '1' : '0' // 线上分配还是线下分配
        var $table = $('#TableData')
        var typeId = $('#queryStallTypeSelect').val()
        var monthcode = $('#updateDateTime').val()
        if (!monthcode) {
            monthcode = defaultDate
            $('#updateDateTime').val(defaultDate)
        }
        // 判断，当未取到活动id时，直接退出
        if (!activityId || activityId === '0') {
            return false
        }
        post('queryDixiaoResult.view', true, {
            'taskid': activityId,
            'monthcode': monthcode,
            'area': loginUser.areaCode,
            'partnercode': '',
            'rankid': '',
            'isonline': source,
            'ranktype': typeId
        }, function (data) {
            $table.empty()
            stallCount = data.length
            if (data && stallCount > 0) {
                $('#btnArea').show()
                joinHtml(data)
            } else {
                $('#btnArea').hide()
            }
        }, function () {
            layer.alert("系统异常，获取低消档位信息异常", {icon: 6});
        })
        /**
         * 格式化处理档位信息
         * @param list 全量集合
         * @returns {Array}
         */
        function formatList(list) {
            var tempList = [] // 定义一个临时集合
            if (list.length > 0) {
                for (var i = 0; i < list.length; i++) {
                    // 定义一个当前临时变量
                    var tempModel = {
                        id: list[i].id, // id
                        rankid: list[i].rankid,// 档位
                        area: list[i].area,// 地市
                        matchno: list[i].matchno, // 匹配人数
                        status: list[i].status, // 当前状态
                        method: list[i].method, // 推送方式
                        partnercode: list[i].partnercode, // 当前所属团队
                        ftpflag: list[i].ftpflag // 推送话+flag
                    }
                    // 循环临时集合，判断当前档位是否存在
                    if (tempList.length > 0) {
                        var haveRank = tempList.find(function (x) {
                            return x.rankid === tempModel.rankid
                        })
                        // 如果当前临时集合中存在当前档位，则以当前对象的地市 + 当前对象的匹配人数
                        if (haveRank) {
                            haveRank[tempModel.area] = {
                                'matchno': tempModel.matchno,
                                'status': tempModel.status,
                                'method': tempModel.method,
                                'id': tempModel.id,
                                'partnercode': tempModel.partnercode,
                                'ftpflag': tempModel.ftpflag
                            }
                        } else {
                            // 如果临时集合中不存在当前档位，则新增一个当前档位的对象
                            var newRank = {}
                            newRank[tempModel.area] = {
                                'matchno': tempModel.matchno,
                                'status': tempModel.status,
                                'method': tempModel.method,
                                'id': tempModel.id,
                                'partnercode': tempModel.partnercode,
                                'ftpflag': tempModel.ftpflag
                            }
                            newRank['rankid'] = tempModel.rankid
                            tempList.push(newRank)
                        }
                    } else {
                        var newRank = {}
                        newRank[tempModel.area] = {
                            'matchno': tempModel.matchno,
                            'status': tempModel.status,
                            'method': tempModel.method,
                            'id': tempModel.id,
                            'partnercode': tempModel.partnercode,
                            'ftpflag': tempModel.ftpflag
                        }
                        newRank['rankid'] = tempModel.rankid
                        tempList.push(newRank)
                    }
                }
            }
            return tempList
        }

        /**
         * 拼接数据html
         * @param list
         */
        function joinHtml(list) {
            // 按照table表格中的顺序组织一个地市集合，方便下面的循环绑定
            var cityData = ['0025', '0512', '0510', '0519', '0514', '0511', '0513', '0516', '0523', '0515', '0517', '0518', '0527']
            var formaData = formatList(list)
            var html = ''
            if (formaData.length > 0) {
                formaData.sort(function (a, b) {
                    return parseInt(a.rankid) - parseInt(b.rankid)
                })
                // 线上管理员，不需要展示推送方式
                if (loginUser.roleIds == offlineUserRoleId) {
                    var pushTypeHtml = '<tr style="background-color: #ECECEC;">'
                    pushTypeHtml += '<td class="bold" style="line-height: 49px;">推送方式</td>'

                    // 循环地市集合，分别赋值，根据状态判断推送方式是否可选
                    for (var j = 0; j < cityData.length; j++) {
                        // 因为推送方式是以地市为单位，只需要取该地市第一个档位的推送方式即可
                        var methodObj = formaData.find(function (a) {
                            var temp = '0'
                            temp = a[cityData[j]] ? a[cityData[j]].method : 0
                            return temp == '1'
                        })
                        var method = '0'
                        if (methodObj) {
                            method = 1
                        }
                        pushTypeHtml += formatPushTypeHtmls(cityData[j], method)
                    }
                    pushTypeHtml += '</tr>'

                    // 根据状态判断是否需要添加推送方式
                    if (activityStatus.toString() === activityStatuModel.lockStatus || activityStatus.toString() === activityStatuModel.confirmStatus || activityStatus.toString() === activityStatuModel.provinceCanAllot || activityStatus.toString() === activityStatuModel.cityReadyAllot) {
                        html = html + pushTypeHtml
                    }
                }
                pre_haved_select_stall_list = []
                curr_select_stall_list = []
                for (var i = 0; i < formaData.length; i++) {
                    var tempHtml = ''
                    tempHtml += '<tr>'

                    // 档位
                    tempHtml += '<td class="bold">' + formaData[i]['rankid'] + '</td>'

                    // 循环地市集合，分别赋值
                    for (var j = 0; j < cityData.length; j++) {
                        tempHtml += formatHtmls(formaData[i][cityData[j]])
                    }
                    tempHtml += '</tr>'
                    html = html + tempHtml
                }
                $table.html(html)
            }
        }

        /**
         * 根据产品档位和地市组织html
         * @param list 当前地市对象
         */
        function formatHtmls(model) {
            var tempHtml = ''
            if (model) {
                // 根据当前活动的状态，判断是否可操作（线下可分配操作）
                // 省级管理员 9：临时操作状态，可操作
                //　低消线下省级管理员
                if (loginUser.roleIds == offlineUserRoleId && activityStatus.toString() === activityStatuModel.provinceCanAllot) {
                    // 0-未分配  1-已分配
                    if (parseInt(model.status) === 0) {
                        tempHtml += '<td class="canAllot" data-id="' + model.id + '" data-status="' + model.status + '" onclick="allotStallObj.allotStall(this)">' + model.matchno + '</td>'
                    } else if (parseInt(model.status) === 1) {
                        // 将之前已经分配的档位项存入全局变量，方便确认分配的时候，组织增量和减量
                        pre_haved_select_stall_list.push(model.id.toString())
                        curr_select_stall_list.push(model.id.toString())
                        tempHtml += '<td class="haveCanAllot"  data-id="' + model.id + '" data-status="' + model.status + '" onclick="allotStallObj.allotStall(this)">' + model.matchno + '</td>'
                    } else {
                        tempHtml += '<td class="notCanAllot">' + model.matchno + '</td>'
                    }
                } else if (loginUser.roleIds == onlineUserRoleId) {
                    if (activityStatus.toString() === activityStatuModel.provinceCanAllot) {
                        // 取当前团队，根据当前团队筛选已经选中的档位
                        var teamOption = $('#queryTeamSelect').val()
                        if (parseInt(model.status) === 0) {
                            tempHtml += '<td class="canAllot" data-id="' + model.id + '" data-status="' + model.status + '" onclick="allotStallObj.allotStall(this)">' + model.matchno + '</td>'
                        } else if (parseInt(model.status) === 1) {
                            // 已经推送到话+，不能再分配
                            if (parseInt(model.ftpflag) === 1) {
                                tempHtml += '<td class="notCanAllot">' + model.matchno + '</td>'
                            } else {
                                if ((teamOption != '' && model.partnercode == teamOption) || teamOption == '') {
                                    // 将之前已经分配的档位项存入全局变量，方便确认分配的时候，组织增量和减量
                                    pre_haved_select_stall_list.push(model.id.toString())
                                    curr_select_stall_list.push(model.id.toString())
                                    tempHtml += '<td class="haveCanAllot"  data-id="' + model.id + '" data-status="' + model.status + '" onclick="allotStallObj.allotStall(this)">' + model.matchno + '</td>'
                                } else {
                                    tempHtml += '<td class="canAllot" data-id="' + model.id + '" data-status="' + model.status + '" onclick="allotStallObj.allotStall(this)">' + model.matchno + '</td>'
                                }
                            }
                        } else {
                            tempHtml += '<td class="notCanAllot">' + model.matchno + '</td>'
                        }
                    } else {
                        // 取当前团队，根据当前团队筛选已经选中的档位
                        var teamOption = $('#queryTeamSelect').val()
                        if (parseInt(model.status) === 1) {
                            if ((teamOption != '' && model.partnercode == teamOption) || teamOption == '') {
                                tempHtml += '<td class="haveCanAllot">' + model.matchno + '</td>'
                            } else {
                                tempHtml += '<td class="canAllot">' + model.matchno + '</td>'
                            }
                        } else {
                            tempHtml += '<td class="canAllot">' + model.matchno + '</td>'
                        }
                    }
                } else {
                    if (parseInt(model.status) === 1) {
                        tempHtml += '<td class="haveCanAllot">' + model.matchno + '</td>'
                    } else {
                        tempHtml += '<td class="canAllot">' + model.matchno + '</td>'
                    }
                }
            } else {
                // 省级管理员不能选择的部分不展示任何数据
                if (loginUser.roleIds == onlineUserRoleId) {
                    tempHtml += '<td class="notCanAllot"></td>'
                } else {
                    tempHtml += '<td class="notCanAllot">0</td>'
                }
            }
            return tempHtml
        }

        function formatPushTypeHtmls(area, pushType) {
            var pushTypeHtml = ''
            pushTypeHtml += '<td>'
            console.log('activityStatus:', activityStatus)
            if (activityStatus.toString() === activityStatuModel.lockStatus || activityStatus.toString() === activityStatuModel.confirmStatus || activityStatus.toString() === activityStatuModel.cityReadyAllot) {
                if (parseInt(pushType) === 0) {
                    pushTypeHtml += '<div>话+</div>'
                } else if (parseInt(pushType) === 1) {
                    pushTypeHtml += '<div>下载</div>'
                } else {
                    pushTypeHtml += '<div>未知</div>'
                }
            } else if (activityStatus.toString() === activityStatuModel.provinceCanAllot) {
                if (parseInt(pushType) === 0) {
                    pushTypeHtml += '<div><label><input type="radio" name="pushType_' + area + '" checked value="0" data-area="' + area + '"/>&nbsp;<span>话+</span></label></div>'
                    pushTypeHtml += '<div><label><input type="radio" name="pushType_' + area + '" value="1" data-area="' + area + '"/>&nbsp;<span>下载</span></label></div>'
                } else {
                    pushTypeHtml += '<div><label><input type="radio" name="pushType_' + area + '" checked value="0" data-area="' + area + '"/>&nbsp;<span>话+</span></label></div>'
                    pushTypeHtml += '<div><label><input type="radio" name="pushType_' + area + '" checked value="1" data-area="' + area + '"/>&nbsp;<span>下载</span></label></div>'
                }
            }
            pushTypeHtml += '</td>'
            return pushTypeHtml
        }
    }
    /**
     * 分配档位
     * @param dom 当前对象
     */
    obj.allotStall = function (dom) {
        // 首先取点击对象的状态，判断是已经选择的还是未选择的
        var objStatus = $(dom).attr('data-status')
        var objId = $(dom).attr('data-id')

        // 判断当前档位项是否在集合中存在
        var ObjIndex = curr_select_stall_list.findIndex(function (item) {
            return parseInt(item) === parseInt(objId)
        })
        // 未选中---已选中
        if (parseInt(objStatus) === 0) {
            $(dom).removeClass('canAllot').addClass('haveCanAllot')
            $(dom).attr('data-status', '1')
            // 首先判断集合中是否存在当前档位项，如果不存在，加入集合
            if (ObjIndex === -1) {
                curr_select_stall_list.push(objId)
            }
        } else {
            // 已选中 --- 取消选中
            $(dom).removeClass('haveCanAllot').addClass('canAllot')
            $(dom).attr('data-status', '0')
            // 判断当前集合中是否存在当前档位项，如果存在，从集合中删除
            if (ObjIndex > -1) {
                curr_select_stall_list.splice(ObjIndex, 1)
            }
        }
    }
    /**
     * 线下---省级管理员重新分配档位
     */
    obj.submitConfirmAllotStall = function () {
        layer.confirm('确认重新调整当前档位？', {
            btn: ['确认', '再看看'] //按钮
        }, function () {
            layer.close()
            submitAllotStall()
        }, function () {
            layer.close()
        });
        function submitAllotStall() {
            // 首先组织每个地市的推送方式
            try {
                var methodmap = {}
                var pushTypeRadios = $('#TableData').find("[type='radio']")
                for (var i = 0; i < pushTypeRadios.length; i++) {
                    var pushType = {}
                    if (pushTypeRadios[i].checked) {
                        var areaId = $(pushTypeRadios[i]).attr('data-area')
                        methodmap[areaId.toString()] = parseInt($(pushTypeRadios[i]).val())
                    }
                }
                var addedlist = [] // 增量
                var deletedlist = [] // 减量
                // 匹配增量， pre_haved_select_stall_list 中不存在，curr_select_stall_list 中存在
                for (var i = 0; i < curr_select_stall_list.length; i++) {
                    function diff(item) {
                        return parseInt(item) === parseInt(curr_select_stall_list[i])
                    }

                    if (pre_haved_select_stall_list.findIndex(diff) === -1) {
                        addedlist.push(curr_select_stall_list[i])
                    }
                }
                //匹配减量，pre_haved_select_stall_list 中存在，curr_select_stall_list 中不存在
                for (var i = 0; i < pre_haved_select_stall_list.length; i++) {
                    function diff(item) {
                        return parseInt(item) === parseInt(pre_haved_select_stall_list[i])
                    }

                    if (curr_select_stall_list.findIndex(diff) === -1) {
                        deletedlist.push(pre_haved_select_stall_list[i].toString())
                    }
                }
                var strAdd = addedlist.join(',')
                var strDelete = deletedlist.join(',')
                // 提交线下省级管理员重新调整分配的档位项 + 分配方式
                post('allocateDixiaoOfflineforProvince.view', true, {
                    'addedlist': strAdd,
                    'deletedlist': strDelete,
                    'methodmap': methodmap,
                    'taskid': activityId
                }, function (res) {
                    if (res.retValue == '0') {
                        // 省级管理员调整分配档位信息之后，调用修改状态接口，将当前任务状态锁定状态
                        obj.updateActivityStatu(activityStatuModel.lockStatus, '调整分配成功')
                    } else {
                        layer.alert(res.desc, {icon: 6});
                    }
                }, function () {
                    layer.alert("系统异常，请稍后再试", {icon: 6});
                })

            } catch (ex) {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            }
        }
    }
    /**
     * 线下---省级管理员通知地市级管理员
     */
    obj.noticeCityManager = function () {
        layer.confirm('确定当前档位，并一键通知地市领取档位？', {
            btn: ['通知', '再看看'] //按钮
        }, function () {
            layer.close()
            post('notifyToOperatorForDixiao.view', true, {'taskid': activityId}, function (res) {
                if (res.retValue == '0') {
                    // 省级管理员通知地市管理员成功之后，调用修改状态接口，将当前任务状态修改为 3-市级待分配（-3市级待分配失败）
                    obj.updateActivityStatu(activityStatuModel.cityReadyAllot, '通知地市管理员成功')
                } else {
                    layer.msg(res.desc, {time: 2000})
                }
            }, function () {
                layer.msg('通知地市管理员失败', {time: 2000})
            })
        }, function () {
            layer.close()
        });
    }
    /**
     * 线下---省级管理员锁定当前档位信息和活动
     */
    obj.lockStall = function () {
        // 线下省级管理员锁定当前活动和当前档位信息，3-市级分配锁定(-3市级分配失败)
        layer.confirm('确认锁定当前低消档位信息？', {
            btn: ['确认', '再看看'] //按钮
        }, function () {
            layer.close()
            obj.updateActivityStatu(activityStatuModel.lockStatus, '锁定当前低消档位信息成功')
        }, function () {
            layer.close()
        });
    }
    /**
     * 线下---省级管理员点击开始分配档位信息按钮
     */
    obj.trimStall = function () {
        if (stallCount > 0) {
            // 首先判断当前活动的状态,为6、8的时候才可以操作
            post('queryDixiaoStatus.view', true, {taskid: parseInt(activityId)}, function (res) {
                if (res) {
                    if (loginUser && loginUser.roleIds == onlineUserRoleId) {
                        if (parseInt(res.status) == 6 || parseInt(res.status) == 8) {
                            obj.bindSelectTeam(false)
                            activityStatus = activityStatuModel.provinceCanAllot
                            obj.btnShowSwitch()
                            obj.getStallData()
                            layer.msg('可以开始调整', {time: 2000})
                        } else {
                            layer.alert("当前档位正在推送，请稍等", {icon: 6});
                        }
                    } else if (loginUser && loginUser.roleIds == offlineUserRoleId) {
                        if (parseInt(res.status) == 4 || parseInt(res.status) == -5) {
                            obj.bindSelectTeam(false)
                            activityStatus = activityStatuModel.provinceCanAllot
                            obj.btnShowSwitch()
                            obj.getStallData()
                            layer.msg('可以开始调整', {time: 2000})
                        } else {
                            layer.alert("当前档位正在推送，请稍等", {icon: 6});
                        }
                    }
                } else {
                    layer.alert("系统异常，请稍后再试", {icon: 6});
                }
            }, function () {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            })
        } else {
            layer.msg('当前低消产品低消档位数量为0，不可分配', {time: 2000})
        }
    }
    /**
     * 线下---省级管理员点击取消分配档位信息按钮
     */
    obj.exitTrimStall = function () {
        if (loginUser && loginUser.roleIds == onlineUserRoleId) {
            activityStatus = activityStatuModel.offlineEnd
            obj.bindSelectTeam(true)
            // 重置 是否从团队列表 进入 参数
            activityModel.isfromparnter = 0
        } else {
            activityStatus = activityStatuModel.lockStatus
        }
        obj.btnShowSwitch()
        obj.getStallData()
    }
    /**
     * 线下---确认分配后推送给话+
     */
    obj.offlinepushToHua = function () {
        layer.confirm('确认推送到话+？', {
            btn: ['确认', '再看看'] //按钮
        }, function () {
            layer.close()
            pushToHua()
        }, function () {
            layer.close()
        });
        function pushToHua() {
            post('sendToVoiceplusOffline.view', true, {'taskid': activityId}, function (res) {
                if (res.retValue == '0') {
                    activityStatus = activityStatuModel.offlineEnd
                    obj.btnShowSwitch()
                    obj.getStallData()
                    layer.msg('低消档位推送话+操作成功，具体结果敬请等待后台处理！', {time: 2000})
                } else {
                    layer.alert(res.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            })
        }
    }
    /**
     * 线上---省级管理员确认分配
     */
    obj.onlineConfirmAllotStall = function () {
        var partnercode = $('#queryTeamSelect').val()
        var partnerName = $('#queryTeamSelect').find('option:selected').text()
        if (partnercode == '' || partnerName == '') {
            layer.alert("请选择外呼团队", {icon: 6});
            return false
        }
        layer.confirm('确认为团队【' + partnerName + '】分配当前档位？', {
            btn: ['确认', '再看看'] //按钮
        }, function (index) {
            layer.close(index)
            submitAllotStall()
        }, function (index) {
            layer.close(index)
        });
        function submitAllotStall() {
            // 首先组织每个地市的推送方式
            try {
                var methodmap = {}
                var pushTypeRadios = $('#TableData').find("[type='radio']")
                for (var i = 0; i < pushTypeRadios.length; i++) {
                    var pushType = {}
                    if (pushTypeRadios[i].checked) {
                        var areaId = $(pushTypeRadios[i]).attr('data-area')
                        methodmap[areaId.toString()] = parseInt($(pushTypeRadios[i]).val())
                    }
                }
                var addedlist = [] // 增量
                var deletedlist = [] // 减量
                // 匹配增量， pre_haved_select_stall_list 中不存在，curr_select_stall_list 中存在
                for (var i = 0; i < curr_select_stall_list.length; i++) {
                    function diff(item) {
                        return parseInt(item) === parseInt(curr_select_stall_list[i])
                    }

                    if (pre_haved_select_stall_list.findIndex(diff) === -1) {
                        addedlist.push(curr_select_stall_list[i])
                    }
                }
                //匹配减量，pre_haved_select_stall_list 中存在，curr_select_stall_list 中不存在
                for (var i = 0; i < pre_haved_select_stall_list.length; i++) {
                    function diff(item) {
                        return parseInt(item) === parseInt(pre_haved_select_stall_list[i])
                    }

                    if (curr_select_stall_list.findIndex(diff) === -1) {
                        deletedlist.push(pre_haved_select_stall_list[i].toString())
                    }
                }
                var strAdd = addedlist.join(',')
                var strDelete = deletedlist.join(',')
                // 提交
                post('allocateDixiaoOnline.view', true, {
                    'addedlist': strAdd,
                    'deletedlist': strDelete,
                    'partnercode': partnercode,
                    'taskid': activityId
                }, function (res) {
                    if (res.retValue == '0') {
                        // 取统计数据
                        obj.queryDixiaoStatistic()
                        // 线上省级管理员分配完成之后，可以支持多次分配，状态还要更新为
                        obj.bindSelectTeam(true)
                        activityStatus = activityStatuModel.offlineEnd
                        obj.btnShowSwitch()
                        obj.getStallData()
                        layer.alert("分配成功", {icon: 6});
                        // layer.msg('分配成功', {time: 2000})
                    } else {
                        layer.alert(res.desc, {icon: 6});
                    }
                }, function () {
                    layer.alert("系统异常，请稍后再试", {icon: 6});
                })

            } catch (ex) {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            }
        }
    }
    /**
     * 线上---确认分配后推送给话+
     */
    obj.judgePush = function () {
        // 首先判断当前活动的状态,为6、8的时候才可以操作
        post('queryDixiaoStatus.view', true, {taskid: parseInt(activityId)}, function (res) {
            if (res) {
                if (parseInt(res.status) == 6 || parseInt(res.status) == 8) {
                    obj.onlinepushToHua()
                } else {
                    layer.alert("当前档位正在推送，请稍等", {icon: 6});
                }
            } else {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            }
        }, function () {
            layer.alert("系统异常，请稍后再试", {icon: 6});
        })

    }
    obj.onlinepushToHua = function () {
        obj.queryDixiaoStatistic()
        var $PushViewInfo = $('#dialog').find('.dialog-push-view')
        var template = $('#templete').find('.push-view-info').clone()
        $PushViewInfo.empty()
        $PushViewInfo.append(template)
        $plugin.iModal({
            title: '一键推送给话+',
            content: $PushViewInfo,
            area: '350px'
        }, function (index, layero) {
            pushToHua(index)
        }, function (index) {
            layer.close(index);
        }, null, function (index) {
            layer.close(index);
        })

        function pushToHua(index) {
            post('sendToVoiceplusOnline.view', true, {'taskid': activityId}, function (res) {
                layer.close(index)
                if (res.retValue == '0') {
                    layer.msg('低消档位推送话+操作成功，具体结果敬请等待后台处理！', {time: 2000})
                } else {
                    layer.alert(res.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            })
        }
    }
    /**
     * 通知风雷
     */
    obj.noticeFl = function () {
        layer.confirm('确认通知风雷？', {
            btn: ['确认', '再看看'] //按钮
        }, function () {
            layer.close()
            notice()
        }, function () {
            layer.close()
        });
        function notice() {
            post('sendToFenglei.view', true, {'taskid': activityId}, function (res) {
                if (res.retValue == '0') {
                    layer.msg('一键通知风雷成功', {time: 2000})
                } else {
                    layer.alert(res.desc, {icon: 6});
                }
            }, function () {
                layer.alert("系统异常，请稍后再试", {icon: 6});
            })
        }
    }
    /**
     * 省级管理员操作后，调用接口更新活动状态，刷新档位信息和操作按钮，同时需要修改当前活动状态
     * @param activityStatus
     */
    obj.updateActivityStatu = function (curr_activity_status, msg) {
        post('modifyTaskStatus.view', true, {'status': curr_activity_status, 'taskid': activityId}, function (res) {
            if (res && res.retValue == '0') {
                activityStatus = curr_activity_status
                obj.btnShowSwitch()
                obj.getStallData()
                layer.msg(msg, {time: 2000})
            } else {
                layer.msg(res.desc, {time: 2000})
            }
        }, function () {
            layer.alert("系统异常，请稍后再试", {icon: 6});
        })
    }
    /**
     * 取低销统计数据
     */
    obj.queryDixiaoStatistic = function () {
        post('queryDixiaoStatistic.view', true, {'taskid': parseInt(activityId)}, function (res) {
            var $CountPanel = $('.count-item')
            $CountPanel.find('.total').text(res.total)
            $CountPanel.find('.totalAllocateOffline').text(res.totalAllocateOffline)
            $CountPanel.find('.totalUnallocateOnline').text(res.totalUnallocateOnline)
            $CountPanel.find('.totalAllocateOnline').text(res.totalAllocateOnline)

            var $HuaDialog = $('#templete').find('.push-view-info')
            $HuaDialog.find('.online-total-count').text(parseInt(res.totalAllocateOnline) + parseInt(res.totalUnallocateOnline))
            $HuaDialog.find('.already-allot').text(res.totalAllocateOnline)
            $HuaDialog.find('.not-allot').text(res.totalUnallocateOnline)
            var teamHtml = ''
            for (var i = 0; i < res.partnerAllocate.length; i++) {
                if (res.partnerAllocate[i].partnername) {
                    teamHtml += '<p class="item">' + res.partnerAllocate[i].partnername + '[' + res.partnerAllocate[i].partnercode + ']：<span class="item-count">' + res.partnerAllocate[i].totalnum + '</span>人</p>'
                }
            }
            $HuaDialog.find('.item-list').html(teamHtml)
        }, function () {
            layer.alert("系统异常，获取统计数据失败", {icon: 6});
        })
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
    return obj
}

function onLoadBody(activity) {
    allotStallObj.initPage(activity)
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
