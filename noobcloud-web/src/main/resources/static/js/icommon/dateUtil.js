$(function () {
    /**
     * 格式下日期
     * 格式 YYYY/yyyy/YY/yy 表示年份
     * MM/M 月份
     *  W/w 星期
     *  dd/DD/d/D 日期
     *  hh/HH/h/H 时间
     *  mm/m 分钟
     *  ss/SS/s/S 秒
     * @param formatStr
     * @returns 格式化后的字符串
     */
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/([y|Y]+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    /**
     * 获取指定日期的前N年的此天或推后N年的此天
     * @param delayYear 整数类型，delayYear>0向后推，delayYear<0向前推
     * @returns Date对象
     */
    Date.prototype.getDelayYear = function (delayYear) {
        var curDate = this,
            curYear = curDate.getFullYear();
        delayYear = delayYear ? delayYear : 0;
        curDate.setFullYear(curYear + delayYear, curDate.getMonth(), curDate.getDate());
        return curDate;
    };

    /**
     * 获取指定日期的前N个月的第一天或推后N个月的第一天
     * @param delayMonth 整数类型，delayMonth>0向后推，delayMonth<0向前推
     * @returns Date对象
     */
    Date.prototype.getDelayMonth = function (delayMonth) {
        var curDate = this,
            curMonth = curDate.getMonth(),
            curYear = curDate.getFullYear();
        if (curMonth == 0) {//如果是1月，则推到去年的12月
            curYear = curYear - 1;
            curMonth = 12;
        }
        delayMonth = delayMonth ? delayMonth : 0;
        curDate.setFullYear(curYear, curMonth + delayMonth, 1);
        return curDate;
    };

    /**
     * 获取指定日期的前N天（delayDay<0）或推后N天（delayDay>0）的日期
     * @returns Date对象
     */
    Date.prototype.getDelayDay = function (delayDay) {
        var curDate = this;
        curDate.setDate(curDate.getDate() + delayDay);
        return curDate;
    };

    /**
     * 获取某月的天数
     * @param currYearMonth 年月，例如：'201502'即为获取2月的天数，若不传值默认是当前年月
     * @returns Date对象
     */
    Date.prototype.getCurrMonthLastDay = function (currYearMonth) {
        var curDate = this;
        currYearMonth = currYearMonth ? currYearMonth : curDate.format('yyyyMM');
        currYearMonth = currYearMonth.length >= 6 ? currYearMonth : curDate.format('yyyyMM');

        curDate.setFullYear(parseInt(currYearMonth.substring(0, 4)), parseInt(currYearMonth.substring(4)), 0);
        return curDate;
    };

    /**
     * 返回时间的数字类型 用于比较2个时间大小
     * @returns {string}
     */
    String.prototype.getDateNumber = function () {
        var dates = this.split("-"),
            dateReturn = "";
        for (var i = 0; i < dates.length; i++) {
            dateReturn += dates[i];
        }
        return parseInt(dateReturn);
    }


});

var dateUtil = {
    /**
     *
     * @param start 开始时间
     * @param end 结束时间
     * @returns {number} 日期之差
     */
    getDifferenceDay: function (start, end) {
        var eArr = end.split("-"),
            sArr = start.split("-"),
            sRDate = new Date(sArr[0], sArr[1], sArr[2]),
            eRDate = new Date(eArr[0], eArr[1], eArr[2]);
        return (eRDate - sRDate) / (24 * 60 * 60 * 1000);
    }
}