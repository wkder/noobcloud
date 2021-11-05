/**
 * Created by xuan on 2016/12/22.
 */
var imageMgr = function () {
    var dataTable,
        getListUrl = "queryImageMgrList.view",
        editPicUrl = "addImage.view",
        deletePicUrl = "deleteImage.view",
        uploadUrl = "uploadCommon.view",
        getTempleTypeUrl = "getSelectTempleType.view",
        obj = {};

    var fileArray = {
        fileName: "",
        serverPath: ""
    }

    obj.initData = function () {
        obj.dataTableInit();
        obj.cmTableInit();
        obj.uploadInit();
    }

    //绑定事件
    obj.initEvent = function () {
        $("#btnQuery").click(obj.evtOnQuery);                   //查询
        $("#btnRefresh").click(obj.evtOnRefresh);               //刷新
        $("#btnAdd").click(obj.evtOnAddOrEdit);                 //新增
        $("#btnDelete").click(obj.evtOnDelete);                 //删除
    }

    //绑定列表
    obj.dataTableInit = function () {
        var option = {
            ele: $('#dataTable'),
            ajax: {url: getListUrl + "?name=" + $('#txtQuery').val() + "", type: "POST"},
            columns: [
                {data: "id", title: "序号", width: 40, className: "dataTableFirstColumns"},
                {data: "title", title: "名称", width: 100},
                {
                    data: "pictureByte", title: "图片", width: 100,
                    render: function (data, type, row) {
                        return '<img class="imgMgr" src="' + (row.pictureByte) + '"></img>';
                    }
                },
                {data: "typeName", title: "模型", width: 80},
                {
                    title: "操作", width: 40, className: "centerColumns",
                    render: function (data, type, row) {
                        return "<a class='btn btn-danger btn-delete' title='删除' onclick='imageMgr.evtOnDelete(\"" + row.id + "\",\"" + row.pictureByte + "\")'><i class=\"fa fa-trash-o\"></i></a>";
                    }
                }
            ]
        };
        dataTable = $plugin.iCompaignTable(option);
    }

    // 弹窗表格初始化
    obj.cmTableInit = function () {
        $("#popupAddOrEdit").cmTable({
            columns: [
                {id: "selTemplates", type: "select", desc: "模型", client: false, url: getTempleTypeUrl},
                {
                    id: "uploadImg", type: "div", desc: "上传图片", className: "zyupload"
                }
            ]
        });
    }

    //上传
    obj.uploadInit = function () {
        $("#uploadImg").zyUpload({
            width: "500px",                                 // 宽度
            height: "300px",                                // 宽度
            itemWidth: "140px",                             // 文件项的宽度
            itemHeight: "115px",                            // 文件项的高度
            url: uploadUrl,                                // 上传文件的路径
            fileType: ["jpg", "png", "jpeg", "gif", "bmp"], // 上传文件的类型
            fileSize: 51200000,                             // 上传文件的大小
            multiple: false,                                // 是否可以多个文件上传
            dragDrop: false,                                // 是否可以拖动上传文件
            tailor: false,                                  // 是否可以裁剪图片
            del: true,                                      // 是否可以删除文件
            finishDel: false,  				                // 是否在上传文件完成后删除预览
            /* 外部获得的回调接口 */
            onSelect: function (selectFiles, allFiles) {    // 选择文件的回调方法  selectFile:当前选中的文件  allFiles:还没上传的全部文件
                console.info("当前选择了以下文件：" + selectFiles);
            },
            onDelete: function (file, files) {              // 删除一个文件的回调方法 file:当前删除的文件  files:删除之后的文件
                fileArray = {
                    fileName: "",
                    serverPath: ""
                }
                console.info("当前删除了此文件：" + file.name);
            },
            onSuccess: function (file, response) {          // 文件上传成功的回调方法
                console.info("此文件上传成功：" + file.name);
                console.info("此文件上传到服务器地址：" + response);
                fileArray.fileName = obj.getFileName(file.name);
                fileArray.serverPath = response;
            },
            onFailure: function (file, response) {          // 文件上传失败的回调方法
                console.info("此文件上传失败：");
                console.info(file.name);
            },
            onComplete: function (response) {
            } // 上传完成的回调方法
        });
    }

// 上传图片 弹窗
    obj.evtOnAddOrEdit = function () {
        layer.open({
            type: 1,
            title: '图片管理',
            closeBtn: 0,
            move: false,
            shadeClose: true,
            area: ['700px', '650px'],
            offset: '60px',
            shift: 6,
            btn: ['确定', '取消'],
            content: $('#popupAddOrEdit'),
            yes: function (index, layero) {
                obj.evtOnSave(index);
            },
            cancel: function (index, layero) {
                layer.close(index);
            }
        });
        $('#uploadImage_0')[0].src="ext/zyupload/skins/images/add_img.png";
        $("#uploadSuccess_1").hide();
        $(".file_bar").hide();
        fileArray = {
            fileName: "",
            serverPath: ""
        }
    }

// 保存图片
    obj.evtOnSave = function (index) {
        var tempId = $('#selTemplates').val();
        if (!tempId) {
            $html.warning("模型不能为空！");
            return;
        }
        if (fileArray.fileName.length <= 0 || fileArray.serverPath.length <= 0) {
            $html.warning("图片上传不能为空！");
            return;
        }

        setTimeout(function () {
            var oData = {};
            oData["tempId"] = $.trim(tempId); //模型id
            oData["name"] = $.trim(fileArray.fileName);
            oData["pictureByte"] = $.trim(fileArray.serverPath);

            $util.ajaxPost(editPicUrl, JSON.stringify(oData), function (res) {
                if (res.state) {
                    $html.success(res.message);
                    layer.close(index);
                    dataTable.ajax.reload();
                } else {
                    $html.warning(res.message);
                }
            }, function () {
                $html.warning("操作失败！");
            });
        }, 200);
    }

// 删除图片
    obj.evtOnDelete = function (id, pictureByte) {
        if (id <= 0) {
            $html.warning("没有选中项！");
            return;
        }

        var dspConfirm = $html.confirm("确定删除该图片吗？", function () {
            $util.ajaxPost(deletePicUrl, JSON.stringify({id: id, pictureByte: pictureByte}), function (res) {
                    if (res.state) {
                        $html.success(res.message);
                        dataTable.ajax.url(getListUrl);
                        dataTable.ajax.reload();
                    } else {
                        $html.warning(res.message);
                    }
                },
                function () {
                    $html.warning("删除失败！");
                });
        }, function () {
            layer.close(dspConfirm);
        });
    }

// 查询
    obj.evtOnQuery = function () {
        dataTable.ajax.url(getListUrl + "?name=" + encodeURIComponent($("#txtQuery").val()));
        dataTable.ajax.reload();
    }

// 刷新
    obj.evtOnRefresh = function () {
        $("#txtQuery").val("");
        dataTable.ajax.url(getListUrl);
        dataTable.ajax.reload();
    }


// 获取文件名
    obj.getFileName = function (o) {
        var filename = o.replace(/.*(\/|\\)/, "");
        var i = filename.lastIndexOf(".");
        if (i >= 0)
            return filename.substring(0, i);
        else
            return filename;
    }
    return obj;
}()

function onLoadBody() {

    imageMgr.initData();
    imageMgr.initEvent();

}

