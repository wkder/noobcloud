/**
 * Created by yangyang on 2016/3/1.
 */

var utils = {

    any:function(str){
        return true
    },

    notEmpty:function(str){
        if(!str){
            return false;
        }
        if($.trim(str).length !=0){
            return true
        }
        return false;
    },

    isNumber:function(str){
        if(!str){
            return false;
        }
        var reg=/^-?[0-9]+([.][0-9]+)*?$/;
        return reg.test($.trim(str));
    },

    isPostiveNumber:function(str){
        if(!str){
            return false;
        }
        var reg=/^(0|[1-9]{1}\d*)$/;
        return reg.test($.trim(str));
    },
    isPostiveNumberNotZero:function(str){
        if(!str){
            return false;
        }
        var reg = /^[1-9]{1}\d*$/;
        return reg.test($.trim(str));
    },

    isChinese:function(str) {
        if(!str){
            return false;
        }
        var reg=/^[\u4E00-\u9FA5]+$/;
        return reg.test($.trim(str));
    },

    isEnglish:function(str){
        if(!str){
            return false;
        }
        var reg=/^[a-zA-Z]+$/;
        return reg.test($.trim(str));
    },

    //下划线、英文、中文、数字组合
    is_EnglishChineseNumber:function(str){
        if(!str){
            return false;
        }
        var reg=/^[_a-zA-Z0-9\u4E00-\u9FA5-\[\]【】]+$/;
        return reg.test($.trim(str));
    },

    //格式为yyyy-MM-dd HH:mm:ss
    isDate:function(str){
        if(!str){
            return false;
        }
        var reg=/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
        return reg.test($.trim(str));
    },
    // 格式为yyyy-MM-dd
    isDateForYMD:function(str){
        if(!str){
            return false;
        }
        var reg=/\d{4}-\d{2}-\d{2}/;
        return reg.test($.trim(str));
    },
    isPhone:function(str){
        if(!str){
            return false;
        }
        //var reg=/^1[3|4|5|6|7|8|9]\d{9}$/;
        var reg=/^((13[0-9])|(15[0-35-9])|(17[0|1|3|5|6|7|8])|(18[0-9])|(14[5|7|9])|199)[0-9]{8}$/
        var phones = str.split(",");
        for (var i=0;i<phones.length;i++){
            if (!reg.test(phones[i])){
                return false;
            }
        }
        return true;
    },

    isEmail:function(str){
        if (str){
            var reg = /^([a-zA-Z0-9_\-\.])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
            return reg.test(str);
        }
        return true;
    },
    // 至少一个数字，小写字母，大写字母和特殊字符 长度8-16位
    password:function (str) {
        if (str){
            var reg =/^(?![0-9]+$)(?![A-Z]+$)(?![a-z]+$)(?![!@#$%^&*()_\-=+\\?\\.<>/]+$)(?![0-9a-z]+$)(?![0-9A-Z]+$)(?![0-9!@#$%^&*()_\\-\\=+\\?\\.<>/]+$)(?![a-zA-Z]+$)(?![a-z!@#$%^&*()_\\-\\=+\\?\\.<>/]+$)(?![A-Z!@#$%^&*()_\\-\\=+\\?\\.<>/]+$)(?![0-9a-zA-Z]+$)(?![0-9a-z!@#$%^&*()_\\-\\=+\\?\\.<>/]+$)(?![0-9A-Z!@#$%^&*()_\\-\\=+\\?\\.<>/]+$)(?![a-zA-Z!@#$%^&*()_\\-\\=+\\?\\.<>/]+$)[a-z0-9A-Z!@#$%^&*()_\-=+\\?\\.<>/]{8,16}$/
            return reg.test(str);
        } else{
            return false;
        }
        return true;
    },
    //cron表达式校验
    isCronExp:function(str){
        if (!str){
           return false;
        }
        //表达式格式：{秒数} {分钟} {小时} {日期} {月份} {星期} {年份(可为空)}
        var value = [0,1,2,3,4,5];
        var items = str.split(" ");
        if (items.length < 6 || items.length > 7)   return false;
        if (items.length == 7) value.push(6);
        value.push(-1);

        for (var k=0;k<value.length;k++){
            var i = value[k];
            switch(i){
                case 0:
                case 1:
                    if (!(items[i] == "*" || (/^[0-9]|[1-5][0-9](-[0-9]|[1-5][0-9])?(\/[0-9]|[1-5][0-9])?$/).test(items[i])
                            || /^[0-9]|[1-5][0-9]([,][0-9]|[1-5][0-9])*$/.test(items[i])
                            || (/[\\*][/][1-9]|[1-5][0-9]$/).test(items[i]))){
                        return false;
                    }
                    break;
                case 2:
                    if (!(items[i] == "*" || (/^[0-9]|1[0-9]|2[0-3](-[1-9]|1[0-9]|2[0-3])?(\/[0-9]|1[0-9]|2[0-3])?$/).test(items[i])
                        || /^[0-9]|1[0-9]|2[0-3]([,][0-9]|1[0-9]|2[0-3])*$/.test(items[i])
                        || (/[\\*][/][1-9]|1[0-9]|2[0-3]$/).test(items[i]))){
                        return false;
                    }
                    break;
                case 3:
                    if (!(items[i] == "*" || items[i] == "?" || (/^[1-9]|[1-2][0-9]|3[0-1](-[1-9]|[1-2][0-9]|3[0-1])?(\/[1-9]|[1-2][0-9]|3[0-1])?$/).test(items[i])
                        || /^[1-9]|[1-2][0-9]|3[0-1]([,][1-9]|[1-2][0-9]|3[0-1])*$/.test(items[i])
                    || (/^[L]?[W]$/).test(items[i]) || (/[\\*][/][1-9]|[1-2][0-9]|3[0-1]$/).test(items[i]))){
                        return false;
                    }
                    break;
                case 4:
                    if (!(items[i] == "*" || (/^[1-9]|1[0-2](-[1-9]|1[0-2])?(\/[1-9]|1[0-2])?$/).test(items[i]) || /^[1-9]|1[0-2]([,][1-9]|1[0-2])*$/.test(items[i])
                        || (/[\\*][/][1-9]|1[0-2]$/).test(items[i]))){
                        return false;
                    }
                    break;
                case 5:
                    if (!(items[i] == "*" || items[i] == "?" || (/^[1-7]?L$/).test(items[i]) || (/^[1-7]#[1-5]$/).test(items[i]) || (/[\\*][/][1-7]$/).test(items[i])
                        || (/^[1-9]|1[0-2](-[1-9]|1[0-2])?(\/[1-9]|1[0-2])?$/).test(items[i]) || /^[1-9]|1[0-2]([,][1-9]|1[0-2])*$/.test(items[i]))){
                        return false;
                    }
                    break;
                case 6:
                    if (!(items[i] == "*" || (/^(19[7-9][0-9]|20[0-9][0-9])(-(19[7-9][0-9]|20[0-9][0-9]))?(\/[1-9])?$/).test(items[i])
                        || /^(19[7-9][0-9]|20[0-9][0-9])([,](19[7-9][0-9]|20[0-9][0-9]))*$/.test(items[i]))
                        || (/[\\*][/][1-9]$/).test(items[i])){
                        return false;
                    }
                    break;
                default : return true;
            }
        }
    },

    //前端数据权限鉴权
    authButton:function(button,permission){
        var dataPermissionList = globalConfigConstant.dataPermissionList;
        if (dataPermissionList[permission+"_p"] == undefined || dataPermissionList[permission+"_p"]){
            return button;
        }
        return "";
    },

    valid:function($element,checkFunc,domain,savaField){
        try{
            var value = $.trim($element.val().replace(/[\r\n]/g,""));
            if(!checkFunc(value)){
                layer.tips($element.attr("title"),$element);
                $element.focus();
                return false;
            }else{
                if(domain && savaField){
                    domain[savaField] = value;
                }
                return true;
            }
        }catch (e){
            layer.tips($element.attr("title"),$element);
            $element.focus();
            return false;
        }
    }
};