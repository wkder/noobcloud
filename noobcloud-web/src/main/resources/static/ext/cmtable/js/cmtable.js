;
(function ($, window, document, undefined) {

    /************************表格类、方法*******************************/
    var Table = function (el, opt) {
        this.$element = el,
            this.defaults = {
                'validate': false,
                'columns': [],
                'toolbtns': []
            },
            this.options = $.extend({}, this.defaults, opt)
    }
    // 定义Table的方法
    Table.prototype = {
        // 创建表格
        createTable: function () {
            var cmObj = {
                // 创建表格
                createTableTr: function (option) {
                    var table = $('<table class="table table-hover table-bordered cmTable"></table>'),
                        column = option.columns, trLength = column.length, i = 0;
                    for (i; i < trLength; i++) {
                        var input = [], alertEle = [],
                            tr = $('<tr class="tdBg"></tr>'),   // 行（存在2个单元格）
                            descTd = $('<td class="td-title"><strong>' + column[i].desc + '：</strong></td>'),   // 描述的单元格
                            inputTd = $('<td colspan="3" class="td-content"></td>');    // 输入框的单元格
                        switch (column[i].type) {
                            // text
                            case this.inputType(0):
                                input = this.inputDefault(column[i]);
                                break;
                            // password
                            case this.inputType(1):
                                input = this.inputDefault(column[i]);
                                break;
                            // select
                            case this.inputType(2):
                                input = $('<select id="' + column[i].id + '" class="form-control"></select>');
                                // disable
                                if (Table.prototype.isBoolean(column[i].disabled) && column[i].disabled == true) {
                                    input.attr("disabled", true);
                                }
                                // 判断下拉框数据来源
                                if (Table.prototype.isBoolean(column[i].client) && column[i].client) {  // 客户端绑定 参数option[]
                                    if (Table.prototype.isArray(column[i].options)) {
                                        var options = column[i].options, optionInpt = "";
                                        for (var j = 0; j < options.length; j++) {
                                            optionInpt = $("<option value='" + options[j].id + "'>" + options[j].value + "</option>");
                                            if (Table.prototype.isBoolean(options[j].checked) && options[j].checked == true) {
                                                optionInpt.attr("checked", true);
                                            }
                                            input.append(optionInpt);
                                        }

                                        inputTd.append(input);

                                        // 告警框
                                        if (Table.prototype.isArray(column[i].alert)) {
                                            alertEle = cmObj.createAlert(column[i].alert);
                                        }

                                        inputTd.append(alertEle);
                                        tr.append(descTd, inputTd);
                                        table.append(tr);
                                    }
                                } else {     // 发起AJax后端绑定
                                    cmObj.ajaxGetSelect(column[i].url, input, inputTd, descTd, tr, table);
                                }
                                break;
                            // time 依赖My97DatePicker
                            case this.inputType(3):
                                input = $('<input type="text" id="' + column[i].id + '" class="form-control" ' + column[i].event + '="' + column[i].fn + '" />');
                                break;
                            // textarea
                            case this.inputType(4):
                                input = $('<textarea id="' + column[i].id + '" maxlength="200" class="form-control" rows="' + column[i].rows + '" placeholder="' + (Table.prototype.isNullOrEmpty(column[i].placeholder) ? column[i].desc : column[i].placeholder) + '"></textarea>');
                                break;
                            // file
                            case this.inputType(5):
                                input = $('<input type="file" id="' + column[i].id + '"  class="form-control">');
                                if (Table.prototype.isArray(column[i].hideDom)) {
                                    var hideImg = $('<image id="' + column[i].hideDom.id + '" />');
                                    if (Table.prototype.isBoolean(column[i].hideDom.visible) && column[i].hideDom.visible == false) {
                                        hideImg.hide();
                                    }

                                    // className
                                    if (!Table.prototype.isNullOrEmpty(column[i].className)) {
                                        input.addClass(column[i].className);
                                    }
                                }
                                inputTd.append(input, hideImg);
                                tr.append(descTd, inputTd);
                                table.append(tr);
                                break;
                            // group
                            case this.inputType(6):
                                if (Table.prototype.isArray(column[i].group)) {
                                    var groups = column[i].group, radioInpt = "";
                                    for (var j = 0; j < groups.length; j++) {
                                        radioInpt = $("<input>", {
                                            type: 'radio',
                                            id: groups[j].id,
                                            name: groups[j].name
                                        });

                                        if (Table.prototype.isArray(groups[j].attribute)) {
                                            radioInpt.attr(groups[j].attribute[0], groups[j].attribute[1]);
                                        }
                                        if (Table.prototype.isBoolean(groups[j].checked) && groups[j].checked == true) {
                                            radioInpt.attr("checked", true);
                                        }
                                        if (!Table.prototype.isNullOrEmpty(groups[j].className)) {
                                            radioInpt.addClass(groups[j].className);
                                        }

                                        inputTd.append(radioInpt);

                                        if (!Table.prototype.isNullOrEmpty(groups[j].appendDom)) {
                                            inputTd.append(groups[j].appendDom)
                                        }
                                    }
                                    // 告警框
                                    if (Table.prototype.isArray(column[i].alert)) {
                                        alertEle = cmObj.createAlert(column[i].alert);
                                    }

                                    inputTd.append(alertEle);
                                    tr.append(descTd, inputTd);
                                    table.append(tr);
                                }
                                break;
                            // image
                            case this.inputType(7):
                                input = $('<image id="' + column[i].id + '" />');
                                inputTd.append(input);
                                if (!Table.prototype.isNullOrEmpty(column[i].appendDom)) {
                                    inputTd.append(column[i].appendDom)
                                }
                                // 告警框
                                if (Table.prototype.isArray(column[i].alert)) {
                                    alertEle = cmObj.createAlert(column[i].alert);
                                }
                                inputTd.append(alertEle);
                                tr.append(descTd, inputTd);
                                table.append(tr);
                                break;
                            // button
                            case this.inputType(8):
                                var btnClass = "btn btn-primary";
                                if (column[i].className) {
                                    btnClass = column[i].className;
                                }
                                input = $('<button id="' + column[i].id + '"  class="' + btnClass + '" >' + (Table.prototype.isNullOrEmpty(column[i].placeholder) ? column[i].desc : column[i].placeholder) + '</button>');
                                break;
                            // div
                            case this.inputType(9):
                                input = $('<div id="' + column[i].id + '"  class="col-md-12" ></div>');
                                break;
                            // span
                            case this.inputType(10):
                                input = $('<span id="' + column[i].id + '" class="form-control" placeholder="' + (Table.prototype.isNullOrEmpty(column[i].placeholder) ? column[i].desc : column[i].placeholder) + '"></span>');
                                break;
                            // ul
                            case this.inputType(11):
                                input = $('<ul id="' + column[i].id + '"></ul>');
                                break;
                            // table
                            case this.inputType(12):
                                input = $('<table id="' + column[i].id + '" class="' + column[i].className + '"></table>');
                                break;
                            // text (default type)
                            default:
                                input = $('<input type="text" id="' + column[i].id + '" class="form-control" placeholder="' + (Table.prototype.isNullOrEmpty(column[i].placeholder) ? column[i].desc : column[i].placeholder) + '"/>');
                                break;
                        }

                        if (column[i].type != "select" && column[i].type != "file" && column[i].type != "radio" && column[i].type != "image") {
                            // 告警框
                            if (Table.prototype.isArray(column[i].alert)) {
                                alertEle = cmObj.createAlert(column[i].alert);
                            }
                            // 验证
                            if (Table.prototype.isArray(column[i].validate)) {
                                input.attr({
                                    "cvalidate": "yes",
                                    "cexpression": column[i].validate.expression,
                                    "err": column[i].desc
                                });
                            }
                            // disable
                            if (Table.prototype.isBoolean(column[i].disabled) && column[i].disabled == true) {
                                input.attr("disabled", true);
                            }
                            // readonly
                            if (Table.prototype.isBoolean(column[i].readonly) && column[i].readonly == true) {
                                input.attr("readonly", true);
                            }
                            // className
                            if (!Table.prototype.isNullOrEmpty(column[i].className)) {
                                input.addClass(column[i].className);
                            }

                            inputTd.append(input, alertEle);
                            tr.append(descTd, inputTd);
                            table.append(tr);
                        }

                        /**
                         * 表格行
                         * 是否显示 visible：false 隐藏
                         */
                        if (Table.prototype.isBoolean(column[i].visible) && column[i].visible == false) {
                            tr.hide();
                        }
                        if (!Table.prototype.isNullOrEmpty(column[i].trId)) {   // 是否有ID字段
                            tr.attr("id", column[i].trId);
                        }
                    }
                    return table;
                },
                // 创建工具行
                createToolTr: function (html, ele, option) {
                    var tableTr = $('<div class="cmTableContent"></div>').append(html),  // 将Table放入tableTr中
                        toolTr = $('<div class="cmButtonTr"></div>'),
                        column = option.toolbtns,
                        trLength = column.length,
                        i = 0;
                    for (i; i < trLength; i++) {
                        switch (column[i].type) {
                            case "confirm":
                                toolTr.append($('<button class="btn btn-primary" id="' + column[i].id + '">' + column[i].text + '</button>'));
                                break;
                            case "cancel":
                                toolTr.append($('<button class="btn btn-default btnRight" id="' + column[i].id + '">' + column[i].text + '</button>'));
                                break;
                            default:    // 默认为取消按钮
                                toolTr.append($('<button class="btn btn-default btnRight" id="' + column[i].id + '">' + column[i].text + '</button>'));
                                break;
                        }
                    }
                    return ele.append(tableTr, trLength <= 0 ? "" : toolTr);
                },
                // 创建警告框
                createAlert: function (alert) {
                    return $('<div class="' + alert.className + '" role="alert">' + alert.text + '</div>');
                },
                // ajax下拉框同步请求
                ajaxGetSelect: function (url, input, inputTd, descTd, tr, table) {
                    $.ajax({
                        type: "post",
                        async: false,
                        url: url,
                        dataType: "json",
                        success: function (d) {
                            input.append(d.message);
                            inputTd.append(input);
                            tr.append(descTd, inputTd);
                            table.append(tr);
                        },
                        error: function () {
                            console.log("get select error");
                        }
                    });
                },
                // 获取输入框类型
                inputType: function (type) {
                    var input = ['text', 'password', 'select', 'datetime', 'textarea', 'file', 'radio', 'image', 'button', 'div', 'span', 'ul', 'table'];
                    return input[type];
                },
                // 获取默认类型输入框
                inputDefault: function (col) {
                    return $('<input type="' + col.type + '" id="' + col.id + '" class="form-control" placeholder="' + col.desc + '" value="" />');
                }
            }
            return cmObj.createToolTr(cmObj.createTableTr(this.options), this.$element, this.options);
        },
        // 是否是数组
        isArray: function (val) {
            return typeof val === "object" || Array == val;
        },
        // 是否是字符串
        isString: function (val) {
            return typeof val === "string" || String == val;
        },
        // 是否是布尔值
        isBoolean: function (val) {
            return typeof val === "boolean";
        },
        // 是否为空
        isNullOrEmpty: function (val) {
            return val == undefined || val == "" || val == 'null';
        }
    };
    /******************************End******************************************/


    /************************验证类、方法*******************************/

    var verify = function (el) {
        this.$element = el;
    }

    verify.prototype = {
        validate: function () {
            var validateMsg = "", validateFlag = true, ele = this.$element, verifyObj = this;
            ele.find("[cvalidate=yes]").each(function () {
                if ($(this).attr("cexpression") != undefined && ($(this).css("display") != "none" && $(this).parent().css("display") != "none" && $(this).parent().parent().css("display") != "none") && $(this).attr("disabled") != "disabled") {
                    var methodObj = verifyObj.methods(), value = $(this).val();
                    switch ($(this).attr("cexpression")) {
                        case "NotNull":
                            if (!methodObj.notNull(value)) {
                                validateMsg = $(this).attr("err") + "不能为空！\n";
                                validateFlag = false;
                                tip(validateMsg, $(this))
                                return false;
                            }
                            break;
                        case "IsPhone":
                            if (!methodObj.isPhone(value)) {
                                validateMsg = $(this).attr("err") + "格式不正确！\n";
                                validateFlag = false;
                                tip(validateMsg, $(this))
                                return false;
                            }
                            break;
                        case "IsNum":
                            if (!methodObj.isNum(value)) {
                                validateMsg = $(this).attr("err") + "必须为正整数！\n";
                                validateFlag = false;
                                tip(validateMsg, $(this))
                                return false;
                            }
                            break;
                        default:
                            break;
                    }
                }
            });
            if (validateMsg.length > 0) {
                return validateFlag;
            }
            return validateFlag;
        },
        methods: function () {
            var obj = {
                notNull: function (val) {
                    var cval = $.trim(val);
                    if (cval.length == 0 || cval == null || cval == undefined) {
                        return false;
                    }
                    return true;
                },
                isPhone: function (val) {
                    var reg = /^1[3|4|5|7|8]\d{9}$/;
                    if (!reg.test(val)) {
                        return false;
                    }
                    return true;
                },
                isNum: function (val) {
                    var reg = /^\+?[1-9][0-9]*$/;
                    if (!reg.test(val)) {
                        return false;
                    }
                    return true;
                }
            };
            return obj;
        }
    };

    // 提示窗 使用提示窗前需要先引用layer组件
    var tip = function (message, element) {
        element.focus();
        layer.tips(message, element, {tips: 3});
    }

    /******************************End******************************************/

    $.fn.cmTable = function (options) {
        var table = new Table(this, options);
        return table.createTable();
    }
    $.fn.cmValidate = function () {
        var ver = new verify(this);
        return ver.validate();
    }
})(jQuery, window, document);
