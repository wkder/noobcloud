/**
 * Created by yangyang on 2016/3/18.
 */

function multiRule($root) {

    this.$root = $root;
    //这些类对该组件有影响，增加必须的，删除不能存在的
    this.$root.addClass("multiRule").removeClass("ruleNode").removeClass("logic");

    this.init = function (multiRules) {
        this.$root.empty();

        if (multiRules) {
            var statis = {}, rootNode;
            for (var i = 0; i < multiRules.length; i++) {
                if (multiRules[i].pid == multiRule.ROOT_NODE_PID) {
                    rootNode = multiRules[i];
                }
                if (statis[multiRules[i].pid]) {

                    statis[multiRules[i].pid].push(multiRules[i]);
                } else {
                    statis[multiRules[i].pid] = [];
                    statis[multiRules[i].pid].push(multiRules[i]);
                }
            }

            appendNodes(this.$root, rootNode);

            function appendNodes($pNode, node) {
                if (node.nodeType === "logic") {
                    var $newParentNode = multiRule.buildLogicNode(node)
                    $pNode.append($newParentNode)
                    var childNodes = statis[node.id];
                    if (childNodes) {
                        for (var i = 0; i < childNodes.length; i++) {
                            appendNodes($newParentNode, childNodes[i]);
                        }
                    }
                } else if (node.nodeType === "data") {
                    var newNode = {
                        id: node.operateParams.id,
                        name: node.operateParams.name,
                        valueType: node.operateParams.valueType,
                        element: {
                            dimensionId: node.operateParams.dimensionId
                        }
                    }
                    multiRule.buildDataNode($pNode, newNode, node);
                } else {
                    layer.alert("节点类型错误");
                    throw("节点类型错误：" + node);
                }
            }
        }

        return this;
    };

    this.save = function () {

        $rootNode = this.$root.find(">div.ruleNode.logic");

        if ($rootNode.length == 0) {
            layer.msg("规则不能为空");
            return;
        }
        return savaNode($rootNode);
    };

    initEvents($root);

    function initEvents($root) {

        $root.on("selectstart", function () {
            return false;
        });

        //放置属性
        $root.on("addRuleEvent", function (addRuleEvent, $target, node) {
            if (!multiRule.SUPPORT_VALUE_TYPES[node.valueType]) {
                layer.alert("不支持数据类型:" + node.valueType);
                return;
            }

            var $parentLogic = $target.closest(".ruleNode.logic");
            if ($parentLogic.length == 0) {
                $parentLogic = multiRule.buildLogicNode();
                $root.append($parentLogic);
                if ($root.find(">div.ruleNode.logic").length >= 2) {
                    var joinLogic = multiRule.buildLogicNode();
                    joinLogic.append($root.find(">div.ruleNode.logic"));
                    $root.append(joinLogic);
                }
            } else {
                //放置数据节点时候，如果父逻辑节点已经有子逻辑节点，需要再增加一个新逻辑节点放置该数据节点（而不是直接挂靠在父逻辑节点）
                if ($parentLogic.find(">div.ruleNode.logic").length != 0) {
                    var newarentLogic = multiRule.buildLogicNode();
                    $parentLogic.append(newarentLogic);
                    $parentLogic = newarentLogic;
                }
            }
            multiRule.buildDataNode($parentLogic, node);
        });

        //删除按钮的显示和隐藏
        $root.on("mouseover", function (e) {
            var $ruleNode = $(e.target).closest(".ruleNode", $root);
            if ($ruleNode) {
                $ruleNode.addClass("edit");
            }
        }).on("mouseout", function (e) {
            var $ruleNode = $(e.target).closest(".ruleNode", $root);
            if ($ruleNode) {
                $ruleNode.removeClass("edit");
            }
        })

        $root.on("click", "span.delete", function (e) {
            var $ruleNode = $(e.target).closest(".ruleNode", $root);
            $ruleNode.remove();
            multiRule.simplifyLogicNode($root);
        })

        $root.on("click", "span.refresh", function (e) {
            var $ruleNode = $(e.target).closest(".ruleNode", $root);
            var rules = savaNode($ruleNode);
            if (rules != null) {
                globalRequest.queryMatchRuleUserCounts(false, {rules: JSON.stringify(rules)}, function (data) {
                    if (data >= 0) {
                        layer.alert("满足该规则用户数为：" + data);
                    } else {
                        layer.alert("查询用户数失败");
                    }
                }, function () {
                    layer.alert("查询用户数失败");
                })
            }
        })

    }//initEvents

    function savaNode($rootNode) {

        var rootId = "L0";
        var result = [];

        try {
            savaNodeValue($rootNode, multiRule.ROOT_NODE_PID, rootId);
        } catch (e) {
            console.log('savenode failed:' + e);
            return null;
        }

        return result;

        function savaNodeValue($node, pid, id) {
            result.push(getNodeValue($node, pid, id));
            var childNodes = $node.find(">div.ruleNode");
            if (childNodes != null) {
                for (var i = 0; i < childNodes.length; i++) {
                    savaNodeValue(childNodes.eq(i), id, id + "_L" + i);
                }
            }
        }

        function getNodeValue($node, pid, id) {
            if ($node.hasClass("logic")) {
                return {
                    id: id,
                    pid: pid,
                    nodeType: "logic",
                    operateSymbol: $node.find(">div.logicHeader > select.logic").val()
                };
            } else if ($node.hasClass("data")) {
                var valueType = $node.find(">input.valueType").val();
                var result = multiRule.SUPPORT_VALUE_TYPES[valueType].getValue($node);
                result["id"] = id;
                result["pid"] = pid;
                return result;
            } else {
                layer.alert("节点类型错误");
                throw("节点类型错误：" + $node.html());
            }
        }
    }

    return this;
}

multiRule.ADD_RULE_EVENT = "addRuleEvent";

multiRule.ROOT_NODE_PID = "root";

multiRule.buildLogicNode = function (initValue) {
    var div = "<div class='ruleNode logic'>" +
        "<div class='logicHeader'>" +
        "<select class='logic'>" +
        "<option value='and' selected>交集</option>" +
        "<option value='or'>并集</option>" +
        "<option class='not' value='not'>剔除</option>" +
        "</select>" +
        "<span class='operate delete'><i class='fa fa-remove'></i></span><span class='operate refresh'><i class='fa fa-refresh'></i></span>" +
        "</div>" +
        "</div>";
    var $div = $(div);

    var $select = $div.find("select.logic");
    if (initValue) {
        $select.val(initValue.operateSymbol);
    }
    return $div;
}

multiRule.buildDataNode = function ($pNode, node, initValue) {
    var div = "<div class='ruleNode data'>" +
        "<input class='id' type='hidden'>" +
        "<input class='name' type='hidden'>" +
        "<input class='valueType' type='hidden'>" +
        "<input class='dimensionId' type='hidden'>" +
        "<div class='body'>" +
        "<span class='operate delete'><i class='fa fa-remove'></i></span><span class='operate refresh'><i class='fa fa-refresh'></i></span>" +
        "</div>" +
        "</div>";
    var $div = $(div);
    $pNode.append($div);
    $div.find("input.id").val(node.id);
    $div.find("input.name").val(node.name);
    $div.find("input.valueType").val(node.valueType);
    $div.find("input.dimensionId").val(node.element.dimensionId);

    return multiRule.SUPPORT_VALUE_TYPES[node.valueType].getHtml($div, node, initValue);
}

multiRule.simplifyLogicNode = function ($root) {
    var loop = true;
    while (loop) {
        loop = false;
        var $logics = $root.find("div.ruleNode.logic");
        if ($logics) {
            for (var i = 0; i < $logics.length; i++) {
                var $logicChild = $logics.eq(i).find(">div.ruleNode.logic");
                if ($logicChild.length == 1) {
                    $logics.eq(i).after($logicChild[0]);
                    $logics.eq(i).remove();
                    loop = true;
                    break;
                }
                var $dataChild = $logics.eq(i).find(">div.ruleNode.data");
                if ($logicChild.length == 0 && $dataChild.length == 0) {
                    $logics.eq(i).remove();
                    loop = true;
                    break;
                }
            }
        }
    }
}

multiRule.SUPPORT_VALUE_TYPES = {

    "num": {
        getHtml: function ($target, node, initValue) {
            var html = ("<span class='name' title='A'>A</span>").replace(/A/g, node.name) +
                "<select class='operateSymbol'>" +
                "<option value='num_eq' selected>" + "等于" + "</option>" +
                "<option value='num_neq'>" + "不等于" + "</option>" +
                "<option value='num_gt'>" + "大于" + "</option>" +
                "<option value='num_lt'>" + "小于" + "</option>" +
                "<option value='num_ge'>" + "大于等于" + "</option>" +
                "<option value='num_le'>" + "小于等于" + "</option>" +

                "</select>" +
                "<span class='inputValue'>" +
                "<input class='dimension'/>" +
                "<input type='text' class='num' title='请输入数字'/>" +
                "</span>";

            var $html = $(html);
            $target.find(".body").prepend($html);
            var $operateSymbol = $html.filter("select.operateSymbol");
            if (initValue) {
                $operateSymbol.val(initValue.operateSymbol);
            }
            var $num = $html.find("input.num");
            var dimensionValues = globalConfigConstant.dimensionDetail[node.element["dimensionId"]]
            var $dimension = $html.find("input.dimension").selectBox(dimensionValues);
            if (dimensionValues) {
                $num.addClass("willHide");
                $num.attr("title","请选择有效值");
                if (initValue) {
                    $dimension.val(initValue.operateParams["compareValue"]);
                }

                $dimension.change(function () {
                    $num.val($dimension.val());
                }, true)
            } else {
                $dimension.hide();
                $num.removeClass("willHide");
                if (initValue) {
                    $num.val(initValue.operateParams["compareValue"]);
                }
            }
            return $target;
        },
        getValue: function ($ruleNode_data) {
            var result = {
                nodeType: "data",
                operateParams: {valueType: "num"}
            }
            if (utils.valid($ruleNode_data.find(">div.body select.operateSymbol"), utils.notEmpty, result, "operateSymbol") &&
                utils.valid($ruleNode_data.find(">input.id"), utils.notEmpty, result["operateParams"], "id") &&
                utils.valid($ruleNode_data.find(">input.name"), utils.notEmpty, result["operateParams"], "name") &&
                utils.valid($ruleNode_data.find("input.num"), utils.isNumber, result["operateParams"], "compareValue") &&
                utils.valid($ruleNode_data.find(">input.dimensionId"), utils.any, result["operateParams"], "dimensionId")) {
                return result
            } else {
                throw("num节点参数不完整");
            }
        }
    },//num

    "string": {
        getHtml: function ($target, node, initValue) {
            var html = ("<span class='name' title='A'>A</span>").replace(/A/g, node.name) +
                "<select class='operateSymbol'>" +
                "<option value='string_eq' selected>" + "等于" + "</option>" +
                "<option value='string_neq'>" + "不等于" + "</option>" +
                "<option value='string_contain'>" + "包含" + "</option>" +
                "<option value='string_notcontain'>" + "不包含" + "</option>" +
                "<option value='string_null'>" + "为空" + "</option>" +
                "<option value='string_notnull'>" + "不为空" + "</option>" +
                "</select>" +
                "<span class='inputValue'>" +
                "<input class='dimension'/>" +
                "<input type='text' class='num' title='请输入值'/>" +
                "</span>";

            var $html = $(html);
            $target.find(".body").prepend($html);
            var $operateSymbol = $html.filter("select.operateSymbol");
            if (initValue) {
                $operateSymbol.val(initValue.operateSymbol);
            }
            var $inputValue = $html.filter("span.inputValue");
            var $num = $html.find("input.num");
            var dimensionValues = globalConfigConstant.dimensionDetail[node.element["dimensionId"]]
            var $dimension = $html.find("input.dimension").selectBox(dimensionValues);
            if (dimensionValues) {
                $num.addClass("willHide");
                $num.attr("title","请选择有效值");
                if (initValue) {
                    var operateValue = $operateSymbol.val();
                    if (operateValue != "string_null" && operateValue != "string_notnull") {
                        $dimension.val(initValue.operateParams["compareValue"]);
                    }
                }
                $dimension.change(function () {
                    $num.val($dimension.val());
                }, true);
            } else {
                $dimension.hide();
                $num.removeClass("willHide");
                if (initValue) {
                    $num.val(initValue.operateParams["compareValue"]);
                }
            }
            initEvents();
            function initEvents() {
                $operateSymbol.change(function () {
                    var value = $(this).val();
                    if (value == "string_null" || value == "string_notnull") {
                        $inputValue.hide();
                    } else {
                        $inputValue.show();
                    }
                })
            }

            $operateSymbol.trigger("change");
            return $target;
        },
        getValue: function ($ruleNode_data) {
            var result = {
                nodeType: "data",
                operateParams: {valueType: "string"}
            }

            var operateSymbolValue = $ruleNode_data.find(">div.body select.operateSymbol").val();
            var needInputNum = true;
            if (operateSymbolValue == "string_null" || operateSymbolValue == "string_notnull") {
                needInputNum = false;
            }

            if (utils.valid($ruleNode_data.find(">div.body select.operateSymbol"), utils.notEmpty, result, "operateSymbol") &&
                utils.valid($ruleNode_data.find(">input.id"), utils.notEmpty, result["operateParams"], "id") &&
                utils.valid($ruleNode_data.find(">input.name"), utils.notEmpty, result["operateParams"], "name") &&
                (!needInputNum || utils.valid($ruleNode_data.find("input.num"), utils.notEmpty, result["operateParams"], "compareValue")) &&
                utils.valid($ruleNode_data.find(">input.dimensionId"), utils.any, result["operateParams"], "dimensionId")) {
                return result
            } else {
                throw("string节点参数不完整");
            }
        }
    },//string

    "date": {
        getHtml: function ($target, node, initValue) {
            var html = ("<span class='name'></span>") +
                "<select class='operateSymbol'>" +
                "<option value='date_gt' selected>" + "大于" + "</option>" +
                "<option value='date_lt'>" + "小于" + "</option>" +
                "<option value='date_ge'>" + "大于等于" + "</option>" +
                "<option value='date_le'>" + "小于等于" + "</option>" +
                "<option value='date_eq'>" + "等于" + "</option>" +
                "<option value='date_neq'>" + "不等于" + "</option>" +
                "</select>" +
                "<input type='text' class='num' title='请输入时间' onclick='laydate()'>";
            var $html = $(html);
            $target.find(".body").prepend($html);
            $html.filter("span.name").attr("title", node.name).text(node.name);

            if (initValue) {
                $html.filter("select.operateSymbol").val(initValue.operateSymbol);
                $html.filter("input.num").val(initValue.operateParams["compareValue"]);
            }
            return $target;
        },
        getValue: function ($ruleNode_data) {
            var result = {
                nodeType: "data",
                operateParams: {valueType: "date"}
            }
            if (utils.valid($ruleNode_data.find(">div.body select.operateSymbol"), utils.notEmpty, result, "operateSymbol") &&
                utils.valid($ruleNode_data.find(">input.id"), utils.notEmpty, result["operateParams"], "id") &&
                utils.valid($ruleNode_data.find(">input.name"), utils.notEmpty, result["operateParams"], "name") &&
                utils.valid($ruleNode_data.find("input.num"), utils.notEmpty, result["operateParams"], "compareValue")) {
                return result
            } else {
                throw("date节点参数不完整");
            }
        }
    },//date

    "model": {
        getHtml: function ($target, node, initValue) {
            var html = "<select class='operateSymbol'>" +
                "<option value='match' selected>" + "满足" + "</option>" +
                // "<option value='unmatch'>" + "不满足" + "</option>" +
                "</select>" +
                ("<span class='name' title='A' >A</span>").replace(/A/g, node.name);

            var $html = $(html);
            $target.find(".body").prepend($html);

            if (initValue) {
                $html.filter("select.operateSymbol").val(initValue.operateSymbol);
            }
            return $target;
        },
        getValue: function ($ruleNode_data) {
            var result = {
                nodeType: "data",
                operateParams: {valueType: "model"}
            }
            if (utils.valid($ruleNode_data.find(">div.body select.operateSymbol"), utils.notEmpty, result, "operateSymbol") &&
                utils.valid($ruleNode_data.find(">input.id"), utils.notEmpty, result["operateParams"], "id") &&
                utils.valid($ruleNode_data.find(">input.name"), utils.notEmpty, result["operateParams"], "name")) {
                return result
            } else {
                throw("tag节点参数不完整");
            }
        }
    }//tag
};
