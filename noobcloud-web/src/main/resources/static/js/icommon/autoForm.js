/**
 * Created by ShaoWei And Hale on 2017/01/18.
 */

var rsubmittable = /^(?:input|select|textarea|keygen|label)/i;
$.fn.extend({
    // 拼接表单参数
    autoSpliceForm: function (objData) {
        var ob = {};
        this.find("[name]").each(function (index, element) {
            if (rsubmittable.test(this.nodeName)) {
                if ($(element).is("[notcapture]")) {
                    return true;
                }
                if (element.type == 'checkbox' || element.type == 'radio') {
                    ob[element.name] = (element.checked ? 1 : 0);
                }
                else {
                    if (ob[element.name] == "catalogId") {
                        console.log("value:" + element.value);
                    }
                    ob[element.name] = element.value;
                }
            }
        });
        if (objData) {
            jQuery.each(objData, function (index, value) {
                ob[index] = value;
            });
        }
        return ob;
    },
    // 清空表单
    autoEmptyForm: function () {
        this.find("[name]").each(function (index, element) {
            if (rsubmittable.test(this.nodeName)) {
                if (element.type == 'checkbox') {
                    element.checked = false;
                } else if (element.type == 'radio') {
                    if (element.getAttribute("autoCheck") && element.getAttribute("autoCheck") == "true") {
                        element.checked = true;
                    } else {
                        element.checked = false;
                    }
                } else if (element.type == 'select-one') {
                    jQuery.each(element.options, function (indexs, values) {
                        element.selectedIndex = values.key;
                        return false;
                    });
                }
                else {
                    element.value = "";
                }
            }
        });
    },
    // 表单赋值
    autoAssignmentForm: function (jsonData) {
        if (!jsonData) return;
        this.find("[name]").each(function (index, element) {
            if (rsubmittable.test(this.nodeName)) {
                if (element.type == 'checkbox') {
                    element.checked = jsonData[element.name] == 1;
                } else if (element.type == 'radio') {
                    element.checked = element.value == jsonData[element.name];
                }
                else if (element.tagName == 'LABEL') {
                    element.textContent = jsonData[element.getAttribute("name")] || "";
                }
                else {
                    try {
                        if (parseInt(jsonData[element.name]) === 0) {
                            element.value = jsonData[element.name]
                        } else {
                            element.value = jsonData[element.name] || "";
                        }
                    } catch (e) {
                    }
                }
            }
        });
    },
    // 表单验证
    autoVerifyForm: function () {
        var result = true;

        // 正则表达式
        var regExp = {
            isEmpty: function (val) {
                if (!val) {
                    return false;
                }
                return true;
            },
            isMob: function (val) {
                return /^1[3|4|5|6|7|8|9]\d{9}$/.test(val);
            },
            isPhone: function (val) {
                //固话或者移动手机
                return /^1[3|4|5|6|7|8|9]\d{9}$/.test(val) || /^(0[0-9]{2,3}[-])?([2-9][0-9]{6,7})+([-][0-9]{1,4})?$/.test(val);
            },
            isNumber: function (val) {  //正整数
                return /^[0-9]+$/.test(val) && val > 0;
            },
            isEMail: function (val) {
                return /^[\w\+\-]+(\.[\w\+\-]+)*@[a-z\d\-]+(\.[a-z\d\-]+)*\.([a-z]{2,4})$/i.test(val);
            },
            isUrl: function (val) {
                return /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(val);
            },
            isIp: function (val) {
                return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(val);
            },
            isChinese: function (val) {
                return /([\u4e00-\u9fa5])+/.test(val);
            },
            isIdCard: function (val) {
                return /\d{17}[\d|x]|\d{15}/.test(val);
            },
            isNotChar: function (val) {
                return /^[A-Za-z0-9]+$/.test(val);
            },
            //下划线、英文、数字组合
            isEnglishNumber: function (val) {
                return /^[_a-zA-Z0-9]+$/.test(val);
            },
            //下划线、英文、中文、数字组合
            isEnglishChineseNumber: function (str) {
                return /^[_a-zA-Z0-9\u4E00-\u9FA5-\[\]【】]+$/.test(str);
            },
            isChars: function (val) {
                return /^\S+$/.test(val);
            },
            isNumberNotZero: function (val) {  //正整数
                return /^[1-9]\d*$/.test(val) && val > 0;
            },
            isDecimal: function (val) {  //正整数
                return /^\d+(\.\d+)?$/.test(val) && val > 0;
            }
        }

        // 提示窗 使用提示窗前需要先引用layer组件
        var tip = function (message, element) {
            element.focus();
            layer.tips(message, element, {tips: 3});
        }

        // 验证函数
        var verify = function (element) {
            var value = $.trim(element.val());
            var errorMessage = element.attr("data-error");

            switch (element.attr("data-expression")) {
                case "isEmpty":
                    if (!regExp.isEmpty(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isMob":
                    if (!regExp.isMob(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isPhone":
                    if (!regExp.isPhone(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isNumber":
                    if (!regExp.isNumber(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isEMail":
                    if (!regExp.isEMail(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isIp":
                    if (!regExp.isIp(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break
                case "isUrl":
                    if (!regExp.isUrl(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isChinese":
                    if (!regExp.isChinese(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isIdCard":
                    if (!regExp.isIdCard(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isNotChar":
                    if (!regExp.isNotChar(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isChoose":
                    var domElement = element[0]; //转dom对象
                    if (domElement.type == "select-one") {
                        if (domElement.value == "" || domElement.value == "-1") {
                            tip(errorMessage, element);
                            return false;
                        }
                    } else if (domElement.type == "radio" || domElement.type == "checkbox") {
                        // var chkEle = $("[name=" + element.name + "]");
                        // var chooseArray = [];
                        // for (var i = 0; i < chkEle.length; i++) {
                        //     if (chkEle[i].checked) {
                        //         chooseArray = [];
                        //         break;
                        //     }
                        //     chooseArray.push(chkEle[i].checked);
                        // }
                        //
                        // if (chooseArray.length == chkEle.length) {
                        //     tip(errorMessage, element);
                        // }
                    }
                    break;
                case "isEnglishNumber":
                    if (!regExp.isEnglishNumber(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isEnglishChineseNumber":
                    if (!regExp.isEnglishChineseNumber(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break
                case "isChars":
                    if (!regExp.isChars(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isNumberNotZero":
                    if (!regExp.isNumberNotZero(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                case "isDecimal":
                    if (!regExp.isDecimal(value)) {
                        tip(errorMessage, element);
                        return false;
                    }
                    break;
                default:
                    return true;
                    break;
            }
            return true;
        }

        if (this.attr("data-autoVerify") == "true") {
            this.find("[name]").each(function () {
                if (!verify($(this))) {
                    result = false;
                    return false;
                }
            });
            return result;
        }
    }
});