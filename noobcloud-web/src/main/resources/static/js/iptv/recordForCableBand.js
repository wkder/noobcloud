/**
 * Created by DELL on 2018/5/14.
 */
var RecordForCableBand = function () {
    var obj = {}, dataTable = {};

    // 初始化表格
    obj.initDataTable = function () {
        var option = {
            ele: $("#dataTable"),
            ajax: {
                url: obj.getAjaxUrl(),
                type: "POST"
            },
            columns: [
                {data: "id", title: "记录id", width: 400, className: "dataTableFirstColumns"},
                {data: "areaName", title: "地市", width: 400, className: "centerColumns"},
                {data: "cableBandAccount", title: "宽带账号", width: 800, className: "centerColumns"},
                {data: "staffImportBussinessHallCode", title: "渠道编码", width: 600, className: "centerColumns"},
                {data: "staffPhone", title: "员工手机号", width: 600, className: "centerColumns"},
                {data: "recordTimest", title: "记录时间", width: 600, className: "centerColumns",render: function (data, type, row)
                {
                    if(data)
                    {
                        return data.substring(0,data.length-2);
                    }
                    else
                    {
                        return "-"
                    }
                }}
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    };

    // 初始化事件
    obj.initEvent = function () {
        var dialog = $("#dialogMiddle")

        // 查询事件
        $("#recordQueryBtn").click(function () {
            dataTableRefresh();
        });

        // 新增按钮
        $("#recordAddBtn").click(function ()
        {
            dialog.empty();
            dialog.append($(".cableBandRecordContent").find(".cableBandRecordWindow").clone());
            var channelCoding = dialog.find("#channelCoding"),// 员工手输渠道编码
                employeeNumber = dialog.find("#employeeNumber"),// 员工手输手机号
                cableBandRecordImport = dialog.find("#cableBand"); // 宽固账号记录

            layer.open({
                type: 1,
                shade: 0.3,
                title: "宽固账号记录",
                offset: '300px',
                area: ['580px', '400px'],
                content: dialog,
                btn: ['记录', '取消'],
                yes: function (index) {
                    recordCableBandAction(index)
                },
                cancel: function (index) {
                    layer.close(index);
                }
            });

            /**
             * 记录宽固账号
             * @param index 弹窗id
             */
            function recordCableBandAction(index)
            {
                var channelCodingVal = $.trim(channelCoding.val()),
                    employeeNumberVal = $.trim(employeeNumber.val()),
                    cableBandRecordImportVal = $.trim(cableBandRecordImport.val()),
                    channelCodingReg = /^[A-Za-z0-9]+$/,
                    employeeNumberReg = /^[0-9]+$/,
                    phoneReg = /^[1][3,4,5,6,7,8][0-9]{9}$/,
                    insertDataObj = {};

                // 数据校验
                if(!channelCodingVal || !channelCodingReg.test(channelCodingVal))
                {
                    layer.tips("请输入正确格式的渠道编码",channelCoding,{time:1000});
                    return ;
                }
                if(!employeeNumberVal || !phoneReg.test(employeeNumberVal))
                {
                    layer.tips("请输入正确格式的员工手机号",employeeNumber,{time:1000});
                    return ;
                }
                if(!cableBandRecordImportVal || !channelCodingReg.test(employeeNumberVal))
                {
                    layer.tips("请输入正确格式的宽带账号",cableBandRecordImport,{time:1000});
                    return ;
                }

                // 数据处理
                insertDataObj.channelCoding = channelCodingVal;
                insertDataObj.employeeNumber = employeeNumberVal;
                insertDataObj.cableBandRecordImport = cableBandRecordImportVal;
                console.log(insertDataObj.toString());
                // 新增
                globalRequest.iPtv.recordCableBandMessage(true,insertDataObj,function(data)
                {
                    if(data && data.retValue == 0)
                    {
                        layer.close(index);
                        $html.success("记录宽固账号成功");
                        dataTableRefresh();
                    }
                    else
                    {
                        $html.warning(data.desc);
                    }
                }, function () {
                    layer.close(index);
                    $html.warning("记录宽固账号异常,请联系管理员");
                });
            }
        })

    };



    // 刷新dataTable
    function dataTableRefresh()
    {
        dataTable.ajax.url(obj.getAjaxUrl());
        dataTable.ajax.reload();
    }

    // 初始化地区选择
    obj.initAreaSelect = function () {
        var $baseAreaTypeSelect = $(".areaSelect");
        globalRequest.queryPositionBaseAreas(false, {}, function (data) {
            $baseAreaTypeSelect.empty();
            if (data) {
                var areaCode = globalConfigConstant.loginUser.areaCode;
                for (var i = 0; i < data.length; i++) {
                    if (areaCode != 99999 && data[i].id == areaCode) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    } else if (areaCode == 99999) {
                        $baseAreaTypeSelect.append("<option value='A' selected>B</option>".replace(/A/g, data[i].id).replace(/B/g, data[i].name));
                    }
                }
                $baseAreaTypeSelect.val(areaCode);
            }
        }, function () {
            layer.alert("系统异常，获取地市失败", {icon: 6});
        });
    };

    obj.getAjaxUrl = function () {
        var queryCableBandRecord = "queryCableBandRecord.view",
            $areaSelect = $(".areaSelect"),
            $cableBand = $("#cableBandRecord");
        return queryCableBandRecord + "?" + "areaSelect=" + $areaSelect.val() + "&" + "cableBandAccount=" + $cableBand.val();
    };

    return obj;
}();


function onLoadBody() {

    RecordForCableBand.initAreaSelect();
    RecordForCableBand.initDataTable();
    RecordForCableBand.initEvent();
}
