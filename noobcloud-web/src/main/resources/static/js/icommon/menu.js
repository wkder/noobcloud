(function () {
    var methods = {
        init: function (data) {
            return methods.renderMenu.call(this, data);
        },
        renderMenu: function (data) {
            for (var index = 0; index < data.length; index++) {
                var menu = data[index],
                    navaLevel = "nav-" + data[index].level + "-level",icon = menu.icon;

                var $li = $("<li>" +
                    "<a id='" + menu.menu_id + "' class=' menu_" + menu.menu_id + "' title='" + menu.name + "' " +
                    "url='" + menu.url + "'>" +
                    "<i class='" + icon + "'></i>" + menu.name +
                    "</a>" +
                    "</li>");

                $(this).append($li);

                $li.on("click", "a", function (e, params) {
                    e.stopPropagation();
                    methods.menuClick.call(this, params);
                });

                if (menu.childMenu.length > 0) {
                    var $childMenuRoot = $("<ul class='nav " + navaLevel + " collapse'></ul>"),
                        $menu = $li.find("a");
                    $menu.append("<span class='fa arrow'></span>");
                    $li.append($childMenuRoot);
                    methods.renderMenu.call($childMenuRoot, menu.childMenu);
                }
            }
        },
        menuClick: function (params) {
            var $this = $(this), $parentLi = $this.parent("li");
            if ($this.parent("li").has("ul").length > 0) {
                $parentLi.toggleClass('active').children('ul').collapse('toggle');
                $parentLi.siblings().removeClass('active').children('ul.in').collapse('hide');
            } else {
                //点击的叶子节点，确保向上都是展开的
                openMenu($parentLi);

                var url = $this.attr("url");
                /*if (url.indexOf("?") > -1) {
                    status = url.split("?")[1].split("=")[1];
                }*/

                $("#menuTree").find("a").removeClass("active-menu");
                $this.addClass("active-menu");
                /*var locationArray = [];
                for (var i = 0; i < locationItem.length; i++) {
                    locationArray.push("<li><span>" + locationItem[i] + "</span></li>");
                }*/
                /*$("#location").find("ol.breadcrumb").empty().append(locationArray.join(""));
                $("#location").find(".page-header").text(locationItem[locationItem.length - 1].trim());*/

                /*if (!/[\w\d]+(.)requestHtml/.test(url)) {
                    $("#coreFrame").html("<div class='iMarket_Unable_Content_Warn'>Content In Construction......</div>");
                    return;
                }*/
                $("#coreFrame").load(url + "?time" + new Date().getTime(), function (response, sts, xhr) {
                    if (xhr.status == 200) {
                        onLoadBody(status);
                        // 全局代理事件 监控所有搜索框 当搜索框输入危险字符时 自动给replace掉
                        $(document).on('keyup', '.query-row :input', function (e) {
                            filterDangerChars($(this), "search")
                        })

                        $(document).on('keyup', ':input:not([type=time])', function (e) {
                            filterDangerChars($(this), "content")
                        })

                        if (params) $(this).find(params.button).trigger("click", params);
                    } else if (xhr.status == 911) {
                        var redirectUrl = xhr.getResponseHeader("redirectUrl");
                        layer.alert('会话超时，请重新登录', function (index) {
                            window.location.href = redirectUrl;
                            layer.close(index);
                            return;
                        });
                    }
                });

                function openMenu($elem) {
                    $elem.siblings().removeClass('active').children('ul.in').collapse('hide');
                    if ($elem.closest("ul").attr("id") == undefined || $elem.closest("ul").attr("id") != "menuTree") {
                        if (!$elem.closest("ul").hasClass("in")) {
                            $elem.closest("ul").collapse('show');
                        }
                        openMenu($elem.closest("ul").closest("li"));
                    }
                    return;
                }

                /**
                 *  百分号、*号、单引号、花括号、脚本关键字等
                 * @param $ele 元素
                 * @param type 类型
                 */
                function filterDangerChars($ele, type) {
                    if (type === "search") {
                        $ele.val($ele.val().replace(/(<)|(>)|(&lt;)|(&gt;)|(script)|(%)|(#)|(')|(})|({)|(\*)|(&)|(\^)|'|"/g, ""))
                    } else if (type === "content") {
                        $ele.val($ele.val().replace(/(<)|(>)|(&lt;)|(&gt;)|(script)|'|"/g, ""))
                    }
                }

            }
        }
    };

    $.fn.menu = function (data) {
        var list=data.data.menuList;
        if (list.length > 0) {
            methods.init.call(this, list);
        }
    }
})(jQuery);
	
