var command = function () {
    var getUrl = "getCommandContent.view";
    var obj = {};

    obj.initData = function () {
        obj.pageHeightInit();
    };

    obj.initEvent = function () {
        $("#btnConfirm").click(obj.evtOnConfirm);

        $(document).keydown(function (event) {
            if (event.keyCode == 13) {
                obj.evtOnConfirm();
            }
        });
    };

    obj.pageHeightInit = function () {
        var mainH = $("#coreFrame").height();
        $("#result").height(mainH - 180);
    };

    obj.evtOnConfirm = function () {
        var inputValue = $("#import textarea").val();

        if (!inputValue || inputValue == "" || inputValue == undefined || inputValue == null) {
            $html.warning("请输入内容！");
            return;
        }

        $util.ajaxPost(getUrl, JSON.stringify({content: inputValue}), function (res) {
                if (res.state) {
                    $("#result textarea").val(res.message);
                } else {
                    $html.warning(res.message);
                }
            },
            function () {
                $html.warning("执行失败，请稍后重试！");
            });
    };
    return obj;
}();

function onLoadBody() {
    command.initData();
    command.initEvent();
}