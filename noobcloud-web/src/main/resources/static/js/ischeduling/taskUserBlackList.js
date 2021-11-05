/**
 * Created by hale on 2017/4/10.
 */

var taskUserBlacklist = function () {
    var fileId = {}, dataTable = {}, obj = {};

    /**
     * 加载数据
     */
    obj.initData = function () {
        obj.initAccessNumber($("#queryAccessNumber"),"queryRow");
        obj.dataTableInit();
    }

    /**
     * 加载事件
     */
    obj.initEvent = function () {
        /**
         * 查询
         */
        $("#btnQuery").click(function () {
            var url = obj.getAjaxUrl();
            if(url)
            {
                $plugin.iCompaignTableRefresh(dataTable,url);
            }
        });

        /**
         * 新增免服务用户
         */
        $("#btnAdd").click(function () {
            obj.createTaskUserBlackList();
        });

        /**
         * 导入免服务用户
         */
        $("#importBtn").click(function () {
            obj.importTaskUserBlackList();
        });

        /**
         * 导出免服务用户
         */
        $("#exportBtn").click(function () {
            obj.exportTaskUserBlackList();
        });
    }

    /**
     * 时间控件初始化
     */
    obj.initDateTime = function () {
        $("#queryDate").val(new Date().format("yyyy-MM-dd"));
    }

    /**
     * 表格初始化
     */
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {
                    data: "phone", title: "手机号", className: "dataTableFirstColumns",
                    render: function (data, type, row) {
                        if (data) {
                            return data.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2')
                        }
                        return data;
                    }
                },
                {data: "date", title: "屏蔽时间",defaultContent : ""},
                {
                    title: "接入号",
                    render: function (data, type, row) {
                        if (row.spNum) {
                            return row.spNum;
                        } else {
                            return "-";
                        }
                    }
                },
                {data: "addManName", title: "创建人", defaultContent: "-"},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        var spNum = row.spNum?row.spNum:"-1";
                        return "<a class='btn btn-danger btn-delete' title='删除' onclick='taskUserBlacklist.deleteTaskUserBlackList(\"" + row.phone + "\",\""+spNum+"\");'><i class=\"fa fa-trash-o \"></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    /**
     * 新增免服务用户
     */
    obj.createTaskUserBlackList = function () {
        var $all = $("div.iMarket_Content").find("div.userBlackListInfo").clone();
        $("#add_userBlackListInfo_dialog").empty().append($all);
        obj.initElementValue();
        $plugin.iModal({
            title: '新增免服务用户',
            content: $("#add_userBlackListInfo_dialog"),
            area: ['650px', '500px']
        }, function (index) {
            saveTaskUserBlackList(index);
        });

        /**
         * 保存
         * @param index 弹窗索引
         */
        function saveTaskUserBlackList(index) {
            var saveDate = getCreateData($("#add_userBlackListInfo_dialog"));
            if(!saveDate)
            {
                return;
            }
            globalRequest.iScheduling.createTaskUserBlackList(true, saveDate, function (data) {
                if (data.retValue != 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                dataTable.ajax.reload();
                layer.close(index);
            }, function () {
                layer.alert("新增免服务用户失败", {icon: 5});
            })
        }


        function getCreateData($ele) {
            var data = {},
                phones = $ele.find(".phoneList").val().replace(/\r\n/g,",").replace(/\n/g,","),
                isSpNum = $ele.find("input:radio[name='accessNumberRadio']:checked").val();
                data["isSpNum"] = isSpNum;
            if (isSpNum && isSpNum == 1) {
                data["spNum"] = $ele.find("[name='accessNumber']").val();
            }
            if (phones.length == 0) {
                layer.alert("手机号码不能为空");
                return false;
            }
            if(phones.split(",").length>20){$html.warning("单次创建请勿超过20个手机号");return false;}
            if(!checkPhones(phones))
            {
                return false;
            }
            data["phones"] = phones;
            return data
        }

        /**
         * 校验手机号
         * @param phones
         * @returns {boolean}
         */
        function checkPhones(phones)
        {
            var phoneArray = phones.split(","),
                errorRow = "";

            for(var i = 0;i<phoneArray.length;i++)
            {
                if(!isPhoneNo(phoneArray[i]))
                {
                    errorRow += (i+1)+",";
                }
            }
            if(errorRow.length > 0)
            {
                layer.alert("您创建的手机号格式错误，请查看第"+errorRow.substring(0,errorRow.length-1)+"行的数据格式");
                return false;
            }
            else
            {
                return true;
            }

        }
    }

    /**
     * 导入营销用户黑名单
     */
    obj.importTaskUserBlackList = function () {
        fileId = null;
        var $dialog = $("#import_dialog");
        $dialog.empty();
        $dialog.append($(".iMarket_Content").find(".importUserBlackList").clone());
        $plugin.iModal({
            title: '导入免服务用户',
            content: $dialog,
            area: '550px',
            btn: []
        });

        $("#import_dialog .importUserBlackList").find(".importForm").find("input[type=file]").click(function (e) {
            $(this).val("");
            $("#import_dialog .fileUploadName").val("");
        }).change(function (e) {
            try {
                $("#import_dialog .fileUploadName").val("");
                var src = e.target.value;
                var fileName = src.substring(src.lastIndexOf('\\') + 1);
                var fileExt = fileName.replace(/.+\./, "");
                if (fileExt !== "txt" && fileExt !== "zip") {
                    layer.msg("请使用txt格式文件!");
                    return;
                }
                $("#import_dialog .fileUploadName").val(fileName);
            } catch (e) {
                console.log("file selected error");
            }
        });

        $(".importForm .meatOperate .btnUpload").click(function () {
            submitFile();
        });

        function submitFile() {
            var $form = $("#import_dialog .importUserBlackList").find(".importForm");
            var $file = $form.find("input[type=file]");
            var $message = $("#import_dialog").find(".retMessage .message");
            if ($file.val() == "") {
                layer.msg("请选择文件!");
                return;
            }
            else if ($file.val().indexOf(".txt") < 0 && $file.val().indexOf(".txt") < 0) {
                layer.msg("请使用txt格式文件!");
                return;
            }
            var options = {
                type: 'POST',
                url: 'importTaskBlackUserList.view',
                dataType: 'json',
                beforeSubmit: function () {
                    $html.loading(true)
                },
                success: function (data) {
                    $html.loading(false);
                    if (data.retValue == 0) {
                        fileId = data.fileId;
                        dataTable.ajax.reload();
                        layer.closeAll();
                        layer.msg(data.desc, {time: 1000});
                    } else {
                        layer.alert("免服务用户文件导入失败:" + data.desc, {icon: 5});
                    }
                },
                error: function (error) {
                    $html.loading(false);
                    layer.alert("免服务用户文件导入失败");
                    console.log('error:', error);
                }
            };
            $form.ajaxSubmit(options);
        }
    }

    /**
     * 导出免服务用户
     */
    obj.exportTaskUserBlackList = function () {
        var oData = {};
        oData["phone"] = $.trim($("#txtQueryPhone").val());
        oData["spNum"] = $("#queryAccessNumber").val();
        oData["date"] = $.trim($("#queryDate").val());
        $util.exportFile('exportTaskBlackUserListData.view', oData);
    }

    /**
     * 删除免服务用户
     * @param phone 手机号
     */
    obj.deleteTaskUserBlackList = function (phone,spNum) {
        if (!phone || phone.length != 11) {
            layer.alert("未找到该数据，请稍后重试", {icon: 5});
            return;
        }
        var confirmIndex = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iScheduling.deleteTaskUserBlackList(true, {phone: phone,spNum:spNum}, function (data) {
                if (data.retValue != 0) {
                    layer.alert(data.desc, {icon: 6});
                    return;
                }
                layer.msg(data.desc, {time: 1000});
                dataTable.ajax.reload();
                layer.close(confirmIndex);
            }, function () {
                layer.alert("删除免服务用户失败", {icon: 5});
            })
        }, function () {
            layer.close(confirmIndex);
        });
    }


    /**
     * 表单控件赋值
     * @param id
     */
    obj.initElementValue = function () {
        var $all = $("#add_userBlackListInfo_dialog").find("div.userBlackListInfo"),
            $phone = $all.find("[name='phone']"),
            $accessNumber = $all.find("[name='accessNumber']"),
            $accessNumberRadio = $all.find("[name='accessNumberRadio']"),
            $accessNumberRow = $all.find(".accessNumberRow");

        initData();
        initEvent();

        function initData() {
            obj.initAccessNumber($accessNumber);  // 初始化接入号下拉框
            // 初始化,选中
            $accessNumberRadio.each(function () {
                if ($(this).val() == 1) {
                    $(this).eq(0).attr("checked", "checked");
                    $(this).eq(0).click();
                }
            })
        }

        function initEvent() {
            /**
             * 指定接入号 切换事件
             */
            $accessNumberRadio.click(function () {
                var value = $(this).val();
                if (value == 1) {
                    $accessNumberRow.show();
                } else {
                    $accessNumberRow.hide();
                }
            })
        }
    }

    /**
     * 初始化接入号下拉框
     */
    obj.initAccessNumber = function ($ele,type) {
        var accessNumbers = globalConfigConstant.smsAccessNumber;
        $ele.empty();
        if(type && type == 'queryRow')
        {
            $ele.append("<option value='A' selected>B</option>".replace(/A/g, '0').replace(/B/g, "无接入号"));
            $ele.append("<option value='A'>B</option>".replace(/A/g, '1').replace(/B/g, "所有接入号"));
        }
        for (var i = 0; i < accessNumbers.length; i++) {
            $ele.append("<option value='A'>B</option>".replace(/A/g, accessNumbers[i].accessNumber + "").replace(/B/g, accessNumbers[i].accessNumber + ""));
        }
    };

    /**
     * 获取查询参数
     * @returns {string}
     */
    obj.getAjaxUrl = function () {
        var phone = $.trim($("#queryPhone").val()),
            accessNumber = $("#queryAccessNumber").val(),
            date = $.trim($("#queryDate").val());
        if(phone.length > 0 && !isPhoneNo(phone))
        {
            $html.warning("请输入正确格式的手机号");
            return null;
        }
        return "queryTaskUserBlackListByPage.view?phone=" + phone + "&spNum=" + accessNumber + "&date=" + date;

    };

    /**
     * 手机号正则校验
     * @param phone
     * @returns {boolean}
     */
    function isPhoneNo(phone) {
        var pattern = /^1[34578]\d{9}$/;
        return pattern.test(phone);
    }

    return obj;
}()

function onLoadBody() {
    taskUserBlacklist.initDateTime();
    taskUserBlacklist.initData();
    taskUserBlacklist.initEvent();
}




