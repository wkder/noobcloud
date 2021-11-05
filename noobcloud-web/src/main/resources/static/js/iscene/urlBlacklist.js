var urlBlacklist = function () {
    var getUrl = "queryUrlBlacklist.view", dataTable = {}, obj = {};

    obj.initData = function () {
        obj.dataTableInit();
    }

    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);
        $("#btnAdd").click(obj.evtOnAddUrlBlacklist);
    }

    // 表格初始化
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getUrl + "?url=" + $("#txtQuery").val(), type: "POST"},
            columns: [
                {data: "host", title: "网址", width: 500, className: "dataTableFirstColumns"},
                {
                    title: "操作", width: 80, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class='btn btn-danger btn-delete' title='删除' onclick='urlBlacklist.evtOnDelete(\"" + row.host + "\");'><i class=\"fa fa-trash-o \"></i></a>"
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getUrl + "?url=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

    // 创建网址黑名单
    obj.evtOnAddUrlBlacklist = function () {
        // 清空表单内容
        $('#divUrlBlacklist').autoEmptyForm();
        $plugin.iModal({
            title: '新增网址黑名单',
            content: $("#divUrlBlacklist"),
            area: ['700px', '650px']
        }, obj.evtOnSave);
    }

    // 保存黑名单
    obj.evtOnSave = function (index) {
        if (!$('#divUrlBlacklist').autoVerifyForm()) return;
        globalRequest.iScene.addOrDeleteUrlBlacklist(true, {type: 1, url: $("#txtBlackUrl").val()},
            function (data) {
                if (!data.state) {
                    $html.warning(data.message);
                    return;
                }
                $html.success(data.message);
                dataTable.ajax.reload();
                layer.close(index);
            });
    }

    // 删除黑名单
    obj.evtOnDelete = function (url) {
        var confirmIndex = $html.confirm('确定删除该数据吗？', function () {
            globalRequest.iScene.addOrDeleteUrlBlacklist(true, {type: 2, url: url},
                function (data) {
                    if (!data.state) {
                        $html.warning(data.message);
                        return;
                    }
                    $html.success(data.message);
                    dataTable.ajax.reload();
                });
        }, function () {
            layer.close(confirmIndex);
        });
    }

    return obj;
}()

function onLoadBody() {
    urlBlacklist.initData();
    urlBlacklist.initEvent();
}



