/**
 * Created by chang on 2017/6/29.
 * 低消产品列表页面
 */
// 用户当前波次
var boCurrSelected = ''
var iConsumptionPorduct = new function () {
    var obj = {} // 全局的对象
    var get_list_api = 'queryPINResultByPage.view' // 取低消产品数据列表
    obj.loginUser = {} // 当前登录用户
    var provinceList = [] // 地市
    /**
     * 初始化当前页面
     */
    obj.initPage = function (status) {
        // 默认筛选日期为当前月份
        $('#updateDateTime').val(new Date().Format('yyyyMM'))
        $('#queryProduct').click(function () {
            obj.queryDataTable()
        })
        $('#AllotProduct').click(function () {
            obj.AllotProductToCity()
        })
        obj.getLoginUser()
        obj.bindWaveCount(status)
        obj.getCityDate()
    }
    /**
     * 初始化表格数据
     */
    obj.initDataTable = function (data) {
        var productId = $('#qrybaseId').val() || '' // id
        var projectName = $('#qrybaseId').val() || ''// 产品名称
        var qryBaseAreas = $('#qryBaseAreas').val() || '' // 地市
        var qryWaveCount = $('#qryWaveCount').val() || '' // 波次
        var updateDateTime = $('#updateDateTime').val() || ''// 更新时间
        var productType = $('#qryProductType').val() || ''// 档位类型
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: get_list_api + "?productId=" + productId + "&rankname=" + projectName + "&area=" + qryBaseAreas + "&batchno=" + qryWaveCount + "&monthcode=" + updateDateTime + "&rankType=" + productType,
                type: "POST"
            },
            columns: [
                {data: "id", title: "档位ID", className: "dataTableFirstColumns", visible: false},
                {data: "rankId", title: "档位ID", className: "dataTableFirstColumns", visible: false},
                {data: "rankname", title: "档位名称", className: "centerColumns", width: 100},
                {data: "ranktype", title: "档位类型", className: "centerColumns", width: 80},
                {
                    data: "area", width: 100, title: "地市", className: "centerColumns",
                    render: function (data, type, row) {
                        var name = ''
                        for (var i = 0; i < provinceList.length; i++) {
                            if (provinceList[i].id == row.area) {
                                name = provinceList[i].name
                            }
                        }
                        return "<sapn>" + name + "</sapn>";
                    }
                },
                {
                    data: "isallocate",
                    width: 100,
                    title: "分配情况",
                    className: "centerColumns",
                    visible: parseInt(obj.loginUser.areaId) === 99999,
                    render: function (data, type, row) {
                        if (row.isallocate == '1') {
                            return "<sapn style='color: #00B83F;'>已分配</sapn>";
                        } else {
                            return "<sapn>未分配</sapn>";
                        }
                    }
                },
                {data: "matchno", title: "匹配人数", className: "centerColumns peopleTotal", width: 80},
                {data: "batchno", title: "波次", className: "centerColumns", width: 120},
                {data: "updatetime", title: "更新时间", className: "centerColumns", width: 120},
                {
                    width: 160, className: "centerColumns", title: "操作",
                    render: function (data, type, row) {
                        var $buttons = "";
                        var rowStr = JSON.stringify(row) + ''
                        var $queryBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='查询' onclick='iConsumptionPorduct.goUserList(" + rowStr + ")'>查询</a>";
                        $buttons = $buttons + $queryBtnHtml
                        var $downloadBtnHtml = "<a id='btnEdit' class='btn btn-warning btn-edit btn-sm' title='下载' onclick='iConsumptionPorduct.openDownFileType(" + rowStr + ")'>下载</a>";
                        $buttons = $buttons + $downloadBtnHtml
                        return $buttons
                    }
                }
            ]
        }
        dataTable = $plugin.iCompaignTable(option)
        obj.getPeopleTotal()
    }
    /**
     * 数据筛选
     */
    obj.queryDataTable = function () {
        var productId = $('#qrybaseId').val() || ''// id
        var projectName = $('#projectName').val() || '' // 产品名称
        var qryBaseAreas = $('#qryBaseAreas').val() || '' // 地市
        var qryWaveCount = $('#qryWaveCount').val() || '' // 波次
        var updateDateTime = $('#updateDateTime').val() || new Date().Format('yyyyMM')// 更新时间，当用户清空筛选日期时，默认为当前月
        var productType = $('#qryProductType').val() || ''// 档位类型
        if (!updateDateTime) {
            updateDateTime = new Date().Format('yyyyMM')
            $('#updateDateTime').val(updateDateTime)
        }
        // 取匹配总人数
        obj.getPeopleTotal()
        dataTable.ajax.url(get_list_api + "?productId=" + productId + "&rankname=" + projectName + "&area=" + qryBaseAreas + "&batchno=" + qryWaveCount + "&monthcode=" + updateDateTime + "&rankType=" + productType);
        dataTable.ajax.reload();
    }
    /**
     * 取匹配人数总数
     */
    obj.getPeopleTotal = function () {
        var projectName = $('#projectName').val() || '' // 产品名称
        var qryBaseAreas = $('#qryBaseAreas').val() || '' // 地市
        var qryWaveCount = $('#qryWaveCount').val() || '' // 波次
        var updateDateTime = $('#updateDateTime').val() || new Date().Format('yyyyMM')// 更新时间，当用户清空筛选日期时，默认为当前月
        var productType = $('#qryProductType').val() || ''// 档位类型
        var param = {
            'rankname': projectName,
            'area': qryBaseAreas,
            'batchno': qryWaveCount,
            'monthcode': updateDateTime,
            'rankType': productType
        }
        post('queryPINResultMatchTotal.view', true, param, function (res) {
            $('thead').find('.peopleTotal').html('匹配人数<span style="color:#ff0000;">(' + res.matchcount + ')')

        }, function () {
            $('thead').find('.peopleTotal').html('匹配人数<span style="color:#ff0000;">(' + 0 + ')')
            layer.alert("数据获取异常，请稍后再试！", {icon: 6});
        })
    }
    /**
     * 绑定地市列表---数据筛选
     */
    obj.getCityDate = function () {
        var $baseAreaTypeSelect = $("#qryBaseAreas")
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            provinceList = data
            if (provinceList) {
                for (var i = 0; i < provinceList.length; i++) {
                    if (i === 0) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, provinceList[i].id).replace(/B/g, provinceList[i].name));
                    } else {
                        $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, provinceList[i].id).replace(/B/g, provinceList[i].name));
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取位置场景营业厅类型失败", {icon: 6});
        });
    }
    /**
     * 取本月的波次号   
     */
    obj.bindWaveCount = function (status) {
        var $waveCount = $('#qryWaveCount')
        //月份
        var month = $('#updateDateTime').val()
        post('queryLatesBatchByMonth.view', true, {monthcode: month}, function (data) {
            $waveCount.empty()
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    if (parseInt(data[i].status) === 0) {
                        boCurrSelected = data[i].batchno
                        $waveCount.append("<option value='A' data-status='C' selected>B</option>".replace(/A/g, data[i].batchno).replace(/B/g, data[i].batchno).replace(/C/g, data[i].status));
                    } else {
                        $waveCount.append("<option value='A' data-status='C'>B</option>".replace(/A/g, data[i].batchno).replace(/B/g, data[i].batchno).replace(/C/g, data[i].status));
                    }
                }
                obj.initDataTable(status)
            }
        }, function () {
            layer.alert("系统异常，获取本月波次信息失败", {icon: 6});
        })
    }
    /**
     * 绑定地市列表---产品分配
     */
    obj.getAllotCityDate = function () {
        var $baseAreaTypeSelect = $("#AllotCitySelect")
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            provinceList = provinceList.sort(function (a, b) {
                if (a.id > b.id) {
                    return 1
                }
            })
            if (provinceList) {
                for (var i = 0; i < provinceList.length; i++) {
                    if (provinceList[i].id !== 99999) {
                        if (i === 0) {
                            $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, provinceList[i].id).replace(/B/g, provinceList[i].name));
                        } else {
                            $baseAreaTypeSelect.append("<option value='A'>B</option>".replace(/A/g, provinceList[i].id).replace(/B/g, provinceList[i].name));
                        }
                    }
                }
            }
        }, function () {
            layer.alert("系统异常，获取位置场景营业厅类型失败", {icon: 6});
        });
    }
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            obj.loginUser = data.loginUser;
            // 只有省级管理员才有‘分配’按钮权限
            if (parseInt(obj.loginUser.areaId) === 99999) {
                $('#AllotProduct').show()
            }
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    /**
     * 分配产品到地市
     * @constructor
     */
    obj.AllotProductToCity = function () {
        obj.getAllotCityDate()
        obj.getAllotProductData()
        $plugin.iModal({
            title: '产品档位分配',
            content: $("#AllotProductInfoDialog"),
            area: '750px'
        }, function (index, layero) {
            obj.submitProductData(index)
        }, function (index) {
            isSearch = false;
            layer.close(index);
        }, null, function (index) {
            isSearch = false;
            searchType = -1;
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
        $('#QueryAllotProduct').click(function () {
            obj.queryAllotProductData()
        })
    }
    /**
     * 取   待分配/已分配   产品列表信息
     */
    obj.getAllotProductData = function () {
        var areaId = $('#AllotCitySelect').val() // 地市
        var productType = $('#ProductTypeSelect').val() // 产品类型
        // 波次
        var batchno = $('#qryWaveCount').val()
        post('queryAllocated.view', true, {
            'area': areaId,
            'ranktype': productType,
            'batchno': batchno
        }, function (data) {
            try {
                if (data) {
                    allocated = data.allocated //已选档位
                    unallocated = data.unallocated // 可选档位
                    // 赋值 左边 可选档位
                    var $leftSelectForm = $('#AllotProductInfoDialog .selectLeft').find('.js-multiselect')
                    $leftSelectForm.empty()
                    if (unallocated.length > 0) {
                        for (var i = 0; i < unallocated.length; i++) {
                            $leftSelectForm.append("<option value='" + unallocated[i].rankid + "' title='" + unallocated[i].rankname + "' data-matchno='" + unallocated[i].matchno + "'>" + "档位[" + unallocated[i].rankname + "]&nbsp;&nbsp;人数[" + unallocated[i].matchno + "]</option>")
                        }
                    }
                    else {
                        layer.msg('本地市暂无可选档位！')
                    }
                    // 赋值 右边 已选档位
                    var $RightSelectForm = $('#AllotProductInfoDialog').find('#multiselectRight')
                    $RightSelectForm.empty()
                    if (allocated.length > 0) {
                        for (var i = 0; i < allocated.length; i++) {
                            $RightSelectForm.append("<option value='" + allocated[i].rankid + "' data-locationTypeId='" + allocated[i].rankid + "' title='" + allocated[i].rankname + "'>" + "档位[" + allocated[i].rankname + "]&nbsp;&nbsp;人数[" + allocated[i].matchno + "]</option>")
                        }
                    }
                }
            } catch (ex) {
                layer.alert("系统异常", {icon: 6});
            }

        }, function () {
            layer.alert("系统异常", {icon: 6});
        })
    }
    /**
     * 搜索    待分配/已分配   产品列表信息
     */
    obj.queryAllotProductData = function () {
        obj.getAllotProductData()
    }
    /**
     * 提交产品档位
     */
    obj.submitProductData = function (index) {
        // 当前的已选档位集合
        var curr_have_select_data = []
        var addedlist = [] // 新增集合
        var deletedlist = [] // 删除集合
        var $selectObjList = $('#multiselectRight option')
        for (var i = 0; i < $selectObjList.length; i++) {
            var optionVal = {
                'rankid': $($selectObjList[i]).val(),
                'rankname': $($selectObjList[i]).text().trim()
            }
            curr_have_select_data.push(optionVal)
        }
        // 先组装新选择的产品即，原来的 allocated 没有，当前已经选择的 curr_have_select_data 中存在
        // 循环 当前 curr_have_select_data
        for (var i = 0; i < curr_have_select_data.length; i++) {
            function diff(item) {
                return parseInt(item.rankid) === parseInt(curr_have_select_data[i].rankid)
            }

            // 将用户新选择的产品 id 加入 addedlist
            if (allocated.findIndex(diff) === -1) {
                addedlist.push(curr_have_select_data[i].rankid)
            }
        }
        // 在组装删除的产品，即原来的 allocated 存在，当前已经选择的 curr_have_select_data 中没有
        for (var i = 0; i < allocated.length; i++) {
            function diff(item) {
                return parseInt(item.rankid) === parseInt(allocated[i].rankid)
            }

            if (curr_have_select_data.findIndex(diff) === -1) {
                deletedlist.push(allocated[i].rankid)
            }
        }
        // 取地市
        var cityCode = $('#AllotCitySelect').val()
        // 取类型
        var type = $('#ProductTypeSelect').val()
        //月份
        var month = $('#updateDateTime').val()
        // 波次
        var batchno = $('#qryWaveCount').val()
        // 将用户新增产品集合  和  已经删除的产品集合 组装成  ， 分割的字符串
        var addedlistStr = addedlist.join(',')
        var deletedlistStr = deletedlist.join(',')
        var param = {
            area: cityCode || 0,
            batchno: batchno || 0,
            monthcode: month || '',
            ranktype: type || 0,
            addedlist: addedlistStr || '',
            deletedlist: deletedlistStr || ''
        }
        post('allocatedRank.view', true, param, function (data) {
            if (data && parseInt(data.retValue) === 0) {
                // 关闭当前弹窗
                layer.close(index);
                layer.msg("分配成功！", {time: 1000});
            }
        }, function () {
            layer.alert("分配异常，请稍后再试！", {icon: 6});
        })
    }
    /**
     * 查询单个低消档位用户信息
     * @param id
     */
    obj.goUserList = function (model) {
        if (model.rankId && model.area) {
            if (boCurrSelected === model.batchno) {
                htmlHandle.handleGoUserListByProductId({proId: model.rankId, area: model.area});
            } else {
                layer.msg("当前波次不能查询！", {time: 2000});
            }
        }
    }
    /**
     * 选择文件下载类型
     */
    obj.openDownFileType = function (model) {
        if (boCurrSelected === model.batchno) {
            var chooseDownloadFile = $('#fileDownDialog')
            chooseDownloadFile.show()
            layer.open({
                type: 1,
                title: '低消档位文件下载',
                closeBtn: 1,
                skin: 'markBackGroundColor',
                shadeClose: false,
                area: ['520px', '320px'],
                offset: '60px',
                shift: 6,
                btn: ['确定'],
                content: chooseDownloadFile,
                yes: function (index) {
                    // 判断用户选择的BSS/CBSS
                    var systemType = 'BSS'
                    var radio = document.getElementsByName("systemType")
                    for (var i = 0; i < radio.length; i++) {
                        if (radio[i].checked) {
                            systemType = $(radio[i]).val()
                        }
                    }
                    obj.downFile(systemType, model, index)
                }
            });
        } else {
            layer.msg("当前波次不能下载！", {time: 2000});
        }
    }
    /**
     * 文件下载
     * @param systemType
     * @param model
     * @param index
     */
    obj.downFile = function (systemType, model, index) {
        var param = {
            'sysname': systemType || '',
            'boid': model.batchno,
            'area': model.area,
            'rankid': model.rankId,
            'ranktype': model.ranktype
        }

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
            ["boid", param.boid],
            ["area", param.area],
            ["rankid", param.rankid],
            ["ranktype", param.ranktype]
        ];
        return paramList;
    }
    return obj
}
function onLoadBody(status) {
    iConsumptionPorduct.initPage(status)
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
/**
 *  日期月份/天的显示，如果是1位数，则在前面加上'0'
 * @param arg
 * @returns {*}
 */
function getFormatDate(arg) {
    if (arg == undefined || arg == '') {
        return '';
    }

    var re = arg + '';
    if (re.length < 2) {
        re = '0' + re;
    }

    return re;
}
/**
 * 波次触发
 */
$('#productList').find('#qryWaveCount').change(function () {
    var selected = this.options[this.selectedIndex]
    var selectedStatus = selected.getAttribute('data-status')
    if (parseInt(selectedStatus) === -1) {
        $('#AllotProduct').hide()
    } else {
        boCurrSelected = $(selected).val()
        // 只有省级管理员才有‘分配’按钮权限
        if (parseInt(iConsumptionPorduct.loginUser.areaId) === 99999) {
            $('#AllotProduct').show()
        }
    }
})