/**
 * Created by yuanfei on 2018/6/21.
 */

function modelRule($root) {

    this.$root = $root;
    //这些类对该组件有影响，增加必须的，删除不能存在的
    this.$root.addClass("multiRule").removeClass("ruleNode").removeClass("logic");

    this.init = function (multiRules) {
        this.$root.empty();

        if (multiRules) {
            var statis = {}, rootNode;
            for (var i = 0; i < multiRules.length; i++) {
                if (multiRules[i].pid == modelRule.ROOT_NODE_PID) {
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
                    var childNodes = statis[node.id];
                    if (childNodes) {
                        var $newParentNode = modelRule.buildLogicNode(node,childNodes.length)
                        if (childNodes.length > 1) {
                            $pNode.css("display","block");
                        }
                        $pNode.append($newParentNode)
                        for (var i = 0; i < childNodes.length; i++) {
                            var $dataNode = $newParentNode.filter("div.data.node_" + childNodes[i].pid + "_" +  childNodes[i].id.substr((childNodes[i].pid + "_L").length)).find(".body");
                            appendNodes($dataNode, childNodes[i]);
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
                    var $dataNode = $pNode;//$pNode.filter("div.data.node_" + node.pid + "_" +  node.id.substr((node.pid + "_L").length)).find(".body");
                    modelRule.buildDataNode($dataNode, newNode, node);
                } else {
                    layer.alert("节点类型错误");
                    throw("节点类型错误：" + node);
                }
            }
        }
        return this;
    };

    return this;
}

modelRule.ROOT_NODE_PID = "root";

modelRule.buildLogicNode = function (initValue, type) {
    var div = "<div class='ruleNode data node_" + initValue.id + "_0'>" +
                    "<span>(</span>" +
                    "<div class='body' style='padding:0 15px;display:inline-block;'></div>" +
                    "<span>)</span>" +
                "</div>";
    for (var i = 1;i<type;i++) {
        div += "<div class='ruleNode logic' style='font-weight: bold;'>" + modelRule.getOperateSymbol(initValue.operateSymbol) + "</div>";
        div += "<div class='ruleNode data node_" + initValue.id + "_" + i + "'>" +
                "<span>(</span>" +
                "<div class='body' style='padding:0 15px;display:inline-block;'></div>" +
                "<span>)</span>" +
            "</div>";
    }
    return $(div);
};

modelRule.getOperateSymbol = function (operateSymbol) {
    switch (operateSymbol) {
        case "and": return "交集";
        case "or": return "并集";
        case "not": return "剔除";
        case "num_eq": return "等于";
        case "num_neq": return "不等于";
        case "num_gt": return "大于";
        case "num_lt": return "小于";
        case "num_ge": return "大于等于";
        case "num_le": return "小于等于";
        case "string_eq": return "等于";
        case "string_neq": return "不等于";
        case "string_contain": return "包含";
        case "string_notcontain": return "不包含";
        case "string_null": return "为空";
        case "string_notnull": return "不为空";
        case "date_gt": return "大于";
        case "date_lt": return "小于";
        case "date_ge": return "大于等于";
        case "date_le": return "小于等于";
        case "date_eq": return "等于";
        case "date_neq": return "不等于";
        case "match": return "满足";
    }
};

modelRule.buildDataNode = function ($pNode, node, initValue) {
    return modelRule.SUPPORT_VALUE_TYPES[node.valueType].getHtml($pNode, node, initValue);
}

modelRule.SUPPORT_VALUE_TYPES = {

    "num": {
        getHtml: function ($target, node, initValue) {
            var html = ("<span class='name' title='A'>A</span>").replace(/A/g, node.name) + "<span style='display: inline-block;padding: 0 5px;font-weight: bold;'>" + modelRule.getOperateSymbol(initValue.operateSymbol) + "</span>" +
                "<span class='inputValue'></span>";

            var $html = $(html);
            $target.filter(".body").prepend($html);
            var $inputValue = $html.filter(".inputValue");
            var dimensionValues = globalConfigConstant.dimensionDetail[node.element["dimensionId"]]
            if (dimensionValues) {
                for (var i = 0;i< dimensionValues.length; i++) {
                    if (dimensionValues[i].key == initValue.operateParams["compareValue"]) {
                        $inputValue.text(dimensionValues[i].value);
                        break;
                    }
                }
            } else {
                if (initValue) {
                    $inputValue.text(initValue.operateParams["compareValue"]);
                }
            }
            return $target;
        }
    },//num

    "string": {
        getHtml: function ($target, node, initValue) {
            var html = ("<span class='name' title='A'>A</span>").replace(/A/g, node.name) + "<span style='display: inline-block;padding: 0 5px;font-weight: bold;'>" + modelRule.getOperateSymbol(initValue.operateSymbol) + "</span>" +
                "<span class='inputValue'></span>";

            var $html = $(html);
            $target.filter(".body").prepend($html);
            var $inputValue = $html.filter(".inputValue");
            var dimensionValues = globalConfigConstant.dimensionDetail[node.element["dimensionId"]]
            var operateValue = initValue.operateSymbol;
            if (operateValue != "string_null" && operateValue != "string_notnull") {
                if (dimensionValues) {
                    for (var i = 0;i< dimensionValues.length; i++) {
                        if (dimensionValues[i].key == initValue.operateParams["compareValue"]) {
                            $inputValue.text(dimensionValues[i].value);
                            break;
                        }
                    }
                } else {
                    $inputValue.text(initValue.operateParams["compareValue"]);
                }
            } else {
                $inputValue.hide();
            }
            return $target;
        }
    },//string

    "date": {
        getHtml: function ($target, node, initValue) {
            var html = ("<span class='name'></span>") + "<span style='display: inline-block;padding: 0 5px;font-weight: bold;'>" +modelRule.getOperateSymbol(initValue.operateSymbol) + "</span>" +
                + "<span class='num'></span>";
            var $html = $(html);
            $target.filter(".body").prepend($html);
            $html.filter("span.name").attr("title", node.name).text(node.name);

            if (initValue) {
                $html.filter("span.num").text(initValue.operateParams["compareValue"]);
            }
            return $target;
        }
    },//date

    "model": {
        getHtml: function ($target, node, initValue) {
            var html = "<span style='display: inline-block;padding: 0 5px;font-weight: bold;'>" +modelRule.getOperateSymbol(initValue.operateSymbol) + "</span>" +
                ("<span class='name' title='A' >(模型)A</span>").replace(/A/g, node.name);

            var $html = $(html);
            $target.filter(".body").prepend($html);

            return $target;
        }
    }//tag
};
