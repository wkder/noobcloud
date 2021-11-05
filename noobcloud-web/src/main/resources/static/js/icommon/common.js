/**
 * Created by hale on 2017/1/1.
 */
var $plugin = {
    /**
     * dataTables.js 封装
     * @param option dataTables配置项
     * @desc 详细api文档说明 http://www.datatables.club/
     * @returns {jQuery} dataTables实例对象
     */
    iCompaignTable: function (option) {
        // 必填参数
        if (!option.ele || typeof option.ele === "undefined" || !option.ajax || typeof option.ajax === "undefined" || !option.columns || typeof option.columns === "undefined") {
            return;
        }

        // 可选参数
        if (option.pageLength <= 0) {
            option.pageLength = 10;
        }

        if (typeof option.paging === "") {
            option.paging = true;
        }

        if (typeof option.lengthChange === "undefined") {
            option.lengthChange = false;
        }

        if (typeof option.info === "undefined") {
            option.info = true;
        }

        if (typeof option.ordering === "undefined") {
            option.ordering = false;
        }

        if (typeof option.processing === "undefined") {
            option.processing = true;
        }

        if (typeof option.headerCheckbox === "undefined") {
            option.headerCheckbox = false;
        }

        if (typeof option.serverSide === "undefined") {
            option.serverSide = true;
        }

        if (typeof option.language === "undefined") {
            option.language = {
                "sLengthMenu": "每页显示 _MENU_ 条",
                "sZeroRecords": "暂无相关数据",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": "",
                "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                "processing": "加载中...",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": "上一页",
                    "sNext": "下一页",
                    "sLast": "尾页"
                }
            }
        }

        var config = {
            ajax: option.ajax,
            language: option.language,
            dom: 'frtilp',                      // 表格控件的显示顺序
            deferRender: true,                  // 控制Datatables的延迟渲染，可以提高初始化的速度
            searching: false,                   // 是否允许开启本地搜索
            paging: option.paging,              // 是否开启本地分页
            ordering: option.ordering,          // 是否开启排序
            lengthChange: option.lengthChange,  // 是否允许用户改变表格每页显示的记录数
            lengthMenu: [10, 25, 50, 100, 500], // 更改页面显示条数的下拉框选项
            serverSide: option.serverSide,      // 是否开启服务器模式
            processing: option.processing,      // 是否显示处理状态
            info: option.info,                  // 控制是否显示表格左下角的信息
            pageLength: option.pageLength,
            columns: option.columns,
            orderCellsTop: true,
            headerCallback: function (thead) {
                $(thead).css({"background": "#F7F7F7", "font-size": "16px", "color": "black"});
                if (option.headerCheckbox) {
                    if ($(thead).find('th').eq(0).find("[type='checkbox']").length <= 0) {
                        var checkBoxId = option.ele.selector.substr(1, option.ele.selector.length) + "_chkAll";
                        $(thead).find('th').eq(0).prepend($("<input id='" + checkBoxId + "' type='checkbox'/>"));
                    }
                }
            }
        }

        if (option.scrollY > 50) {
            config.scrollY = option.scrollY;
        }

        if (typeof option.drawCallback === "function") {
            config.drawCallback = option.drawCallback;
        }

        if (typeof option.initComplete === "function") {
            config.initComplete = option.initComplete;
        }

        if (typeof option.createdRow === "function") {
            config.createdRow = option.createdRow;
        }

        return $(option.ele).DataTable(config);
    },

    /**
     * dataTable 刷新方法
     * @param table dataTables实例对象
     * @param url 与后台交互的地址
     */
    iCompaignTableRefresh: function (table, url) {
        table.ajax.url(url);
        table.ajax.reload();
    },

    /**
     * 默认弹窗
     * @param option 配置项参数
     * @param confirmFunc 确定按钮回调方法
     * @param cancelFunc 右上角关闭按钮触发的回调
     * @param successFunc 层弹出后的成功回调方法
     * @param endFunc 层销毁后触发的回调
     * @returns {boolean}
     */
    iModal: function (option, confirmFunc, cancelFunc, successFunc, endFunc) {
        // 必填参数
        if (!option.content) return false;
        // 可选参数
        if (!option.title) option.title = '';
        if (!option.shift && option.shift !== 0) option.shift = 6;
        if (!option.closeBtn && option.closeBtn !== 0) option.closeBtn = 1;
        if (!option.move) option.move = '.layui-layer-title';
        if (!option.shadeClose) option.shadeClose = false;
        if (!option.area) option.area = '700px';
        if (!option.offset) option.offset = '70px';
        if (!option.btn || Object.prototype.toString.call(option.btn) != '[object Array]') option.btn = ['确定', '取消'];

        return layer.open({
            type: 1,
            shift: option.shift,
            shade: 0.3,
            title: option.title,
            closeBtn: option.closeBtn,
            move: option.move,
            shadeClose: option.shadeClose,
            area: option.area,
            offset: option.offset,
            btn: option.btn,
            content: option.content,
            yes: function (index, layero) {
                if (confirmFunc) {
                    confirmFunc(index, layero);
                }
            },
            cancel: function (index, layero) {
                if (cancelFunc) {
                    cancelFunc(index, layero);
                } else {
                    layer.close(index);
                }
            },
            success: function (layero, index) {
                if (successFunc) {
                    successFunc(layero, index);
                }
            },
            end: function (index) {
                if (endFunc) {
                    endFunc(index);
                }
            }
        });
    }
}

var $html = {
    /**
     * 加载效果
     * @param bool true：显示 false：隐藏
     */
    loading: function (bool) {
        if (bool) {
            $(".loading").css("left", ($('body').width() - $(".loading").width()) / 2);
            $(".loading").show();

        } else {
            $(".loading").hide();
        }
    },
    /**
     * 提示框 失败
     * @param content
     * @param end
     */
    warning: function (content, end) {
        var options = {
            content: content,
            time: 2000,
            shade: false,
            skin: 'dspwarning',
            title: false,
            closeBtn: 0,
            btn: false,
            end: end
        };
        return layer.open(options);
    },
    /**
     * 提示框 成功
     * @param content
     * @param end
     */
    success: function (content, end) {
        var options = {
            content: content,
            time: 2000,
            shade: false,
            skin: 'dspsuccess',
            title: false,
            closeBtn: 0,
            btn: false,
            end: end
        };
        return layer.open(options);
    },
    /**
     * Layer确认框
     * @param content
     * @param yes
     * @param cancel
     * @returns {*}
     */
    confirm: function (content, yes, cancel) {
        var options = {
            btn: ['确定', '取消'],
            skin: 'dspconfirm',
            title: false,
            closeBtn: 0
        };
        return layer.confirm(content, options, yes, cancel);
    }
}

var $util = {
    /**
     * ajaxPost
     * @param url
     * @param data
     * @param successFunc
     * @param errorFunc
     * @param beforeFunc
     * @param completeFunc
     */
    ajaxPost: function (url, data, successFunc, errorFunc, beforeFunc, completeFunc) {
        data = (data == null || data == "" || typeof (data) == "undefined") ? {"date": new Date().getTime()} : data;
        $.ajax({
            type: "post",
            data: data,
            url: url,
            dataType: "json",
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (b) {
                if (beforeFunc) {
                    beforeFunc(b);
                } else {
                    $html.loading(true);
                }
            },
            success: function (d) {
                successFunc(d);
            },
            complete: function (c) {
                if (completeFunc) {
                    completeFunc(c);
                } else {
                    $html.loading(false);
                }
            },
            error: function (e) {
                var sessionStatus = e.getResponseHeader("sessionStatus");
                var redirectUrl = e.getResponseHeader("redirectUrl");
                console.log(redirectUrl);
                if (911 == e.status && "timeout" == sessionStatus) {
                    layer.alert('会话超时，请重新登录', function (index) {
                        window.location.href = redirectUrl;
                        layer.close(index);
                    });
                } else {
                    errorFunc(e);
                }
            }
        });
    },
    /**
     * 下载文件
     * @param url
     * @param params
     */
    exportFile: function (url, params) {
        var temp = document.createElement("form");
        temp.action = url;
        temp.method = "post";
        temp.style.display = "none";
        for (var x in params) {
            var opt = document.createElement("textarea");
            opt.name = x;
            opt.value = params[x];
            temp.appendChild(opt);
        }
        document.body.appendChild(temp);
        temp.submit();
        document.body.removeChild(temp);
    },
    /**
     * 获取guid
     * @returns {string}
     */
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        })
    },
    /**
     * 判断浏览器版本
     * @returns {boolean}
     */
    isChrome: function () {
        // 取得浏览器的userAgent字符串
        var userAgent = navigator.userAgent;
        // 判断Chrome浏览器
        return userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Edge") === -1
    }
}

/**
 * 为string函数增加format方法
 * 创建人:Frank
 * 创建时间:2017年2月20日14:43:14
 * @returns {string}
 */
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function (m, i) {
            return args[i];
        });
};

/**
 * 为string函数增加format方法
 *
 * @param args 替换的参数
 * @author hale
 * @createTime 2017年8月1日17:07:16
 * @example "我是{0}，今年{1}了".format("hale",22)
 * @example "我是{name}，今年{age}了".format({name:"hale",age:22});
 * @returns {String} 拼接好的字符串
 */
String.prototype.autoFormat = function (args) {
    var result = this
    if (arguments.length > 0) {
        if (arguments.length === 1 && typeof (args) === 'object') {
            for (var key in args) {
                if (args[key] !== undefined) {
                    var reg = new RegExp('({' + key + '})', 'g')
                    result = result.replace(reg, args[key])
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] !== undefined) {
                    var reg = new RegExp('({)' + i + '(})', 'g')
                    result = result.replace(reg, arguments[i])
                }
            }
        }
    }
    return result
}

/**
 * 为String增加splitWithoutBlank方法
 * @creater hale
 * @param sign 分隔符
 * @returns {*} 分隔后的数组
 */
String.prototype.splitWithoutBlank = function (sign) {
    var arr = this.split(sign);
    return skipEmptyElementForArray(arr);

    function skipEmptyElementForArray(arr) {
        var a = [];
        $.each(arr, function (i, v) {
            var data = $.trim(v);//$.trim()函数来自jQuery
            if ('' != data) {
                a.push(data);
            }
        });
        return a;
    }
}


