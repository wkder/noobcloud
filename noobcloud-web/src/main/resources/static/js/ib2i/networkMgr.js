/**
 * Created by Hale on 2017年12月25日11:11:49
 */
var networkMgr = function () {
    var obj = {}, fileId = {}, dataTable = {};

    obj.initQuery = function () {
        $(".queryDate").val(new Date().format('yyyy-MM-dd'))
    }

    obj.initData = function () {
        var options = {
            ele: $('#dataTable'),
            ajax: {url: obj.getAjaxUrl(), type: "POST"},
            columns: [
                {data: "date", title: "日期", className: "dataTableFirstColumns"},
                {data: "fileName", title: "文件名"},
                {data: "fileSize", title: "导入数据量"},
                {data: "successNum", title: "成功数"},
                {data: "failedNum", title: "失败数"},
                {data: "userName", title: "创建人"}
            ]
        };
        dataTable = $plugin.iCompaignTable(options);
    };

    obj.initEvent = function () {
        /**
         * 查询 事件
         */
        $("#btnQuery").click(function () {
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
        });

        /**
         * 导入 事件
         */
        $("#btnUpload").click(function () {
            obj.initUpload();
        })
    };

    /**
     * 导入 事件
     */
    obj.initUpload = function () {
        fileId = null;
        var $dialog = $("#importDialog");
        $dialog.empty();
        $dialog.append($(".iMarket_networkMgr_content").find(".importNetworkMgr").clone());
        $dialog.find(".importNetworkMgr").prepend('<div id="upload">上传</div>');
        var index = $plugin.iModal({
            title: '导入王卡信息',
            content: $dialog,
            area: '550px',
            btn: []
        });
        obj.plupload(index);
    };

    obj.plupload = function (index) {
        var uploader = $("#upload").pluploadQueue({
            url: "importWangCardUserData.view",
            chunk_size: '10mb',
            dragdrop: false,
            filters: {
                // Maximum file size
                max_file_size: '300mb',
                // Specify what files to browse for
                mime_types: [
                    {title: "csv files", extensions: "csv"}
                ]
            }
        }, function (response) {
            layer.msg('上传成功', {time: 2000});
            $plugin.iCompaignTableRefresh(dataTable, obj.getAjaxUrl());
            layer.close(index);
        });
    }

    /**
     * 获取查询参数
     * @returns {string}
     */
    obj.getAjaxUrl = function () {
        var date = $.trim($(".queryDate").val()); // 日期
        return "queryWangCardImportRecord.view?date=" + date;
    };

    return obj
}();

function onLoadBody() {
    networkMgr.initQuery();
    networkMgr.initData();
    networkMgr.initEvent();
}