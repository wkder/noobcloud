/**
 * Created by chang on 2017/7/4.
 */
var userModelData = new function () {
    var obj = {}
    var get_list_api = 'queryDixiaoListByPage.view'
    var provinceList = [] // 地市
    var productId = ''
    var loginUser = {}
    /**
     * 获取登录人信息
     */
    obj.getLoginUser = function () {
        globalRequest.queryCurrentUserInfoById(false, {}, function (data) {
            loginUser = data.loginUser;
            // 格式化地市编码为4位
            if (loginUser.areaCode != '99999') {
                if (loginUser.areaCode.length === 2) {
                    loginUser.areaCode = '00' + loginUser.areaCode
                } else if (loginUser.areaCode.length === 3) {
                    loginUser.areaCode = '0' + loginUser.areaCode
                }
            }
        }, function () {
            layer.alert("系统异常，获取登录用户信息失败", {icon: 6});
        });
    }
    /**
     * 初始化当前页面
     */
    obj.initPage = function () {
        obj.getLoginUser()
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
                    if (provinceList[i].id.toString().length === 2) {
                        provinceList[i].id = '00' + provinceList[i].id.toString()
                    } else if (provinceList[i].id.toString().length === 3) {
                        provinceList[i].id = '0' + provinceList[i].id.toString()
                    }
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
     * 筛选用户信息
     */
    $("#queryUsers").click(function (event, params) {
        // 将用户从低消分档列表传入的产品id暂时缓存，方便用户联合其他筛选条件查询
        if (params && params.proId && params.area) {
            $('#qryProductId').val(params.proId)
            $('#qryBaseAreas').val(params.area)
        }
        // 当用户点击查询按钮时，首先从传参中获取产品id，如果获取不到，则从缓存中取
        productId = params ? params.proId : ''
        if (!productId) {
            productId = $('#qryProductId').val()
        }
        var userPhone = $('#userPhone').val() // 用户手机号
        var areaId = $('#qryBaseAreas').val() // 地区
        if (userPhone.length !== 11 && userPhone.length > 0) {
            layer.msg("请输入正确的用户手机号码！", {time: 2000});
            return false
        }
        dataTable.ajax.url(get_list_api + "?rankid=&phone=" + userPhone + "&area=" + areaId + "&id=" + productId);
        dataTable.ajax.reload();
    })
    /**
     * 初始化用户信息表格
     * @param data
     */
    obj.initUserListDataTable = function (data) {
        var userPhone = $('#userPhone').val() // 用户手机号
        var areaId = $('#qryBaseAreas').val() // 地区
        var option = {
            ele: $('#dataTable'),
            ajax: {
                url: get_list_api + "?rankid=" + productId + "&phone=" + userPhone + "&area=" + areaId,
                type: "POST"
            },
            columns: [
                {
                    data: "phone", width: 120, title: "手机号码", className: "centerColumns",
                    render: function (data, type, row) {
                        return "<sapn>" + strPhone(row.phone) + "</sapn>";
                    }
                },
                {
                    data: "area", width: 100, title: "地市", className: "centerColumns",
                    render: function (data, type, row) {
                        return "<sapn>" + obj.cityNameByCode(row.area) + "</sapn>";
                    }
                },
                {data: "name", title: "姓名", className: "centerColumns", width: 120},
                {data: "mainProductName", title: "主产品名称", className: "centerColumns", width: 140},
                {data: "rankID", title: "匹配档位", className: "centerColumns", width: 100},
                {data: "productId", title: "低消产品ID", className: "centerColumns", width: 120},
                {data: "chargeId", title: "资费ID", className: "centerColumns", width: 120},
                {
                    data: "feeLast1", width: 140, title: "上月出账金额", className: "centerColumns",
                    render: function (data, type, row) {

                        return "<sapn>" + GetRound(row.feeLast1, 2) + "元</sapn>";
                    }
                },
                {
                    data: "nettime", width: 140, title: "入网时间", className: "centerColumns",
                    render: function (data, type, row) {

                        return "<sapn>" + DateStr(row.nettime) + "</sapn>";
                    }
                },
                {data: "netType", title: "归属系统", className: "centerColumns", width: 120},
                {
                    width: 160, className: "centerColumns", title: "操作",
                    render: function (data, type, row) {
                        var $buttons = "";
                        var rowStr = JSON.stringify(row) + ''
                        var $queryBtnHtml = "<a id='btnEdit' class='btn btn-info btn-edit btn-sm' title='查询' onclick='userModelData.viewUserDetail(" + rowStr + ")'>查询详情</a>";
                        $buttons = $buttons + $queryBtnHtml
                        return $buttons
                    }
                }
            ]
        }
        dataTable = $plugin.iCompaignTable(option)
    }
    /**
     * 根据地市编码查询地市名称
     * @param code
     * @returns {*}
     */
    obj.cityNameByCode = function (code) {
        var cityData = {
            '0025': '南京',
            '0512': '苏州',
            '0510': '无锡',
            '0519': '常州',
            '0514': '扬州',
            '0511': '镇江',
            '0513': '南通',
            '0516': '徐州',
            '0523': '泰州',
            '0515': '盐城',
            '0517': '淮安',
            '0518': '连云港',
            '0527': '宿迁'
        }
        if (code) {
            return cityData[code]
        }
        return code
    }
    /**
     * 查询用户详情
     */
    obj.viewUserDetail = function (model) {
        var layerPreviewJq = $('#userList .layerPreview');
        obj.bindUserDetailView(model)
        layerPreviewJq.show()
        layer.open({
            type: 1,
            title: '低消用户信息查询',
            closeBtn: 1,
            skin: 'markBackGroundColor',
            shadeClose: false,
            area: ['710px', '560px'],
            offset: '60px',
            shift: 6,
            btn: ['确定'],
            content: layerPreviewJq,
            yes: function (index) {
                layer.close(index);
            }
        });
    }
    /**
     * 绑定用户详情信息（20个字段）
     */
    obj.bindUserDetailView = function (model) {
        var $viewDialog = $('#userList .layerPreview')
        $viewDialog.find('.userName').text(model.name || '未知') // 用户姓名
        var sexName = '未知'
        if (model.sex == '0') {
            sexName = '男'
        } else if (model.sex == '1') {
            sexName = '女'
        }
        $viewDialog.find('.sex').text(sexName) // 用户性别
        $viewDialog.find('.phone').text(strPhone(model.phone) || '未知') // 用户手机号码
        $viewDialog.find('.packageName').text(model.mainProductName || '未知') // 主产品名称
        $viewDialog.find('.packageCode').text(model.mainProductCode || '未知') // 主产品代码
        $viewDialog.find('.netType').text(model.terminal || '未知') // 终端
        $viewDialog.find('.area').text(obj.cityNameByCode(model.area) || '未知') // 地市
        $viewDialog.find('.areaCode').text(model.area || '未知') // 区号
        $viewDialog.find('.l_arpu').text(GetRound(model.feeLast1, 2) + '元' || '未知') // 上月出账金额
        $viewDialog.find('.ll_arpu').text(GetRound(model.feeLast2, 2) + '元' || '未知') // 上上月出账金额
        $viewDialog.find('.lll_arpu').text(GetRound(model.feeLast3, 2) + '元' || '未知') // 上上上月出账金额
        $viewDialog.find('.a_arpu').text(GetRound(model.feeAvg, 2) + '元' || '未知') // 近3个月的ARPU
        $viewDialog.find('.flow').text(GetRound(model.gprsLast3, 2) + 'MB' || '未知') // 近三个月消耗总流量
        $viewDialog.find('.voice').text(GetRound(model.callLast3, 2) + '分钟' || '未知') // 近三个月消耗语音
        $viewDialog.find('.sysName').text(model.netType || '未知') // 归属系统
        $viewDialog.find('.productName').text(model.rankID || '未知') // 低消档位
        var isRoamName = '未知'
        if (model.isfeiman == '1') {
            isRoamName = '是'
        } else if (model.isfeiman == '0') {
            isRoamName = '否'
        }
        $viewDialog.find('.isRoam').text(isRoamName) // 是否长市漫
        $viewDialog.find('.productId').text(model.productId || '未知') // 低消产品ID
        $viewDialog.find('.time').text(DateStr(model.nettime) || '未知') // 入网时间
        $viewDialog.find('.changeId').text(model.chargeId || '未知') // 低销资费ID
    }
    return obj
}
function onLoadBody(status) {
    userModelData.initPage()
    userModelData.getCityDate()
    userModelData.initUserListDataTable(status)
}
/**
 * 取url中参数
 * @param name
 * @returns {null}
 * @constructor
 */
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)return unescape(r[2]);
    return null;
}
//取得整数时，不保留小数位，如，2.999，保留2位小数，返回 3
//num：待四舍五入数值，len：保留小数位数
function GetRound(num, len) {
    return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
}
/**
 * 时间转换
 * @param str
 * @constructor
 */
function DateStr(str) {
    str = str.indexOf('.00') > -1 ? str.substring(0, str.length - 4) : str
    try {
        return str.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3 $4:$5:$6")
    } catch (e) {
        return str
    }
}
/**
 * 手机号码脱敏处理
 * @param phone
 * @returns {*}
 */
function strPhone(phone) {
    try {
        if (phone.length === 11) {
            return phone.substring(0, 3) + '****' + phone.substring(8, 11)
        } else if (phone.length === 13) {
            return phone.substring(0, 5) + '****' + phone.substring(10, 13)
        }
        return phone
    } catch (ex) {
        return phone
    }
}