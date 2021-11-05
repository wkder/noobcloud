/**
 * Created by hale on 2017/3/18.
 */

var testInterface = function () {
    var obj = {};

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
    }

    // 查询
    obj.evtOnQuery = function () {
        var phone = $("#txtQuery").val();
        var accessNumber = $("#txtAccessNumber").val();
        var taskId = $("#txtTaskId").val();
        var smsContent = $("#smsContent").val();

        if (!phone) {
            $html.warning("请输入手机号");
            return;
        } else if (!/^1[3|4|5|6|7|8|9]\d{9}$/.test(val) || /^(0[0-9]{2,3}[-])?([2-9][0-9]{6,7})+([-][0-9]{1,4})?$/.test(phone)) {
            $html.warning("请输入正确的手机号格式");
            return;
        }
        if (!accessNumber) {
            $html.warning("请输入接入号");
            return;
        }
        if (!taskId) {
            $html.warning("请输入任务ID");
            return;
        }
        if (!smsContent) {
            $html.warning("请输入短信内容");
            return;
        }

        globalRequest.getInterfacePhone(true, {phone: phone}, function (res) {
            if (res) {
                $("#result").val(res);

                $("#txtQuery").val("")
                $("#txtAccessNumber").val("")
                $("#txtTaskId").val("")
                $("#smsContent").val("")
            }
        }, function () {
        })
    }

    return obj;
}()

function onLoadBody() {
    testInterface.initEvent();
}





