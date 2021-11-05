/**
 * Created by Frank on 2021/7/6.
 */
function login() {
    var $vCode = $("div.login-table.show input.verificationText");
    var $userName = $("#loginName");
    var $userPwd = $("#password");
    var userName = $userName.val();
    var userPwd = $userPwd.val();
    var vCode = $vCode.val();
    if (!/^(\+86|86)?1\d{10}$/.test($userName.val())) {
        layer.tips("手机号码为空或无效", $userName, {time: 1000});
        $userName.focus();
        return;
    }
    if (userPwd == "") {
        layer.tips($userPwd.attr("title"), $userPwd, {time: 1000});
        $userPwd.focus();
        return;
    }
    if (vCode == "") {
        layer.tips($vCode.attr("title"), $vCode, {time: 1000});
        $vCode.focus();
        return;
    }

    globalRequest.loginByName(true, {userName: userName, password: userPwd, vCode: vCode}, function (data) {
        if (data.msg === "success") {
            window.location.href = "index.html";
        } else {
            layer.alert(data.desc, {icon: 6}, function (index) {
                $("div.login-main div.login-table.show .vCodeImg").trigger("click");
                layer.close(index);
            });
        }
    }, function () {
        layer.alert("系统异常");
    });
}

$(function () {

    $("div.login-main").on("click", "div.login-table.show img.login-change-icon", function () {
        $("div.login-main div.login-table").toggleClass("show");
        $("div.login-main").find("div.login-table.show .vCodeImg").trigger("click");
    });

    $("div.login-main").on("click", 'div.login-table.show .vCodeImg', function () {
        $(this).attr("src", "consumer/getVerifyCode?timestamp=" + (new Date()).valueOf());
    });

    $("body").keydown(function () {
        if (event.keyCode == "13") {
            login();
        }
    });
})

