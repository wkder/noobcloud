var conditionKey = [];
conditionKey['pv'] = true;
conditionKey['uv'] = true;

var conditionKeyDesc = []
conditionKeyDesc['曝光量'] = true;
conditionKeyDesc['曝光用户数'] = true;

var optPriority = [];
optPriority["||"] = 0;
optPriority["&&"] = 1;
optPriority["=="] = 2;
optPriority["="] = 2;
optPriority[">="] = 2;
optPriority["<="] = 2;
optPriority[">"] = 2;
optPriority["<"] = 2;
optPriority["+"] = 3;
optPriority["-"] = 3;
optPriority["*"] = 4;
optPriority["/"] = 4;

var conditionDic = [];
conditionDic['pv'] = "曝光量";
conditionDic['uv'] = "曝光用户数";
conditionDic["||"] = "或";
conditionDic["&&"] = "且";

var conditionDicByName = []
conditionDicByName['曝光量'] = "pv";
conditionDicByName['曝光用户数'] = "uv";
conditionDicByName["或"] = "||";
conditionDicByName["且"] = "&&";


function isVerifiedExp(exp) {
    return isVerifiedRPN(generateRPN(exp))
}

// 判断exp字符串是否是一个合法的tag
// 第一版本的函数，合法的tag包含：1. pv/uv/数字 >= 数字 2. ( ) && ||
function isVerifiedTag_former(exp) {
    var rpn = generateRPN(exp)
    console.log("rpn: " + rpn)
    if (rpn == null) {
        return false
    }
    if (rpn.length == 3) {
        if (isVariableOrNumber(rpn[0]) && isVariableOrNumber(rpn[1]) && isOperatorExceptParentheses(rpn[2])) {
            return true
        } else {
            return false
        }
    } else if (rpn.length == 1) {
        if (isParentheses(rpn[0]) || isAndOrOperator(rpn[0])) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

// 判断exp字符串是否是一个合法的tag
function isVerifiedTag(exp) {
    return isVerifiedSplit(exp)
}

// 返回： 获取表达式字符串从前部开始的合法tag
// exp : 表达式字符串
// isGenerateTagTillTail : 如果整个字符串是合法的tag，是否也生成tag
function getFirstVerifiedTag(exp, isGenerateTagTillTail) {
    var cloneTag = exp;
    var existPass = false;
    var subTag = ""
    var readyTag = ""
    var processComplete = false
    var isTrimSpace = true
    var isOddDoubleQuotationMark = false
    var isOddSingleQuotationMark = false

    while (cloneTag.length > 0) {
        existPass = false;
        readyTag = ""
        for (var i = 1; i <= cloneTag.length; i++) {
            subTag = ""
            for (var j = 0; j < i; j++) {
                if (isOddDoubleQuotationMark || isOddSingleQuotationMark) {
                    subTag += cloneTag[j]
                } else {
                    if (!calcIsSpace(cloneTag[j])) {
                        subTag += cloneTag[j]
                    }
                }
                if (cloneTag[j] == '"' && (j == 0 || j > 0 && cloneTag[j - 1] != '\\') && !isOddSingleQuotationMark) {
                    isOddDoubleQuotationMark = !isOddDoubleQuotationMark
                }
                if (cloneTag[j] == "'" && (j == 0 || j > 0 && cloneTag[j - 1] != '\\') && !isOddDoubleQuotationMark) {
                    isOddSingleQuotationMark = !isOddSingleQuotationMark
                }
            }
            //subTag = cloneTag.substring(0, i)
            if (isVerifiedTag(subTag)) {
                existPass = true
            } else {
                if (existPass) {
                    cloneTag = cloneTag.substring(i - 1, cloneTag.length)
                    readyTag = subTag.substring(0, subTag.length - 1)
                    break
                }
            }
            if (i == cloneTag.length) {
                processComplete = true
                if (isGenerateTagTillTail && isVerifiedTag(subTag)) {
                    readyTag = subTag
                    cloneTag = ""
                }
            }
        }
        if (readyTag.length > 0) {
            return [readyTag, cloneTag];
            //input.parent().html(escape(readyTag)).removeClass('active');
            //input.parent().html(escape(cloneTag)).addClass('active');
            readyTag = ""
        }
        if (processComplete) {
            break
        }
    }
    return [readyTag, cloneTag]
}

function getFirstVerifiedTag_with_all_space(exp, isGenerateTagTillTail) {
    var cloneTag = exp;
    var existPass = false;
    var subTag = ""
    var readyTag = ""
    var processComplete = false

    while (cloneTag.length > 0) {
        existPass = false;
        readyTag = ""
        for (var i = 1; i <= cloneTag.length; i++) {
            subTag = cloneTag.substring(0, i)
            if (isVerifiedTag(subTag)) {
                existPass = true
            } else {
                if (existPass) {
                    cloneTag = cloneTag.substring(i - 1, cloneTag.length)
                    readyTag = subTag.substring(0, subTag.length - 1)
                    break
                }
            }
            if (i == cloneTag.length) {
                processComplete = true
                if (isGenerateTagTillTail && isVerifiedTag(subTag)) {
                    readyTag = subTag
                    cloneTag = ""
                }
            }
        }
        if (readyTag.length > 0) {
            return [readyTag, cloneTag];
            //input.parent().html(escape(readyTag)).removeClass('active');
            //input.parent().html(escape(cloneTag)).addClass('active');
            readyTag = ""
        }
        if (processComplete) {
            break
        }
    }
    return [readyTag, cloneTag]
}

// 与或运算符
function isAndOrOperator(splitNode) {
    return splitNode == '&&' || splitNode == '||'
}

// 与或运算符的中文名
function isAndOrOperatorDesc(splitNode) {
    return splitNode == '且' || splitNode == '或'
}

// 是个变量 例如 pv uv
function isVariable(splitNode) {
    if (conditionKey[splitNode.toLowerCase()] != undefined) {
        return true
    }
    return false
}

// 是个变量的中文名 例如 曝光量 曝光用户数
function isVariableDesc(splitNode) {
    if (conditionKeyDesc[splitNode.toLowerCase()] != undefined) {
        return true
    }
    return false
}

// 是个 变量或者数字
function isVariableOrNumber(splitNode) {
    return isVariable(splitNode) || isNumber(splitNode)
}

// 是个数字
function isNumber(splitNode) {
    return !isNaN(splitNode)
}

// 不包含括号的操作符
function isOperatorExceptParentheses(splitNode) {
    return optPriority[splitNode] != undefined && !isParentheses(splitNode)
}

// 是个括号
function isParentheses(splitNode) {
    return splitNode == "(" || splitNode == ")"
}

function isVerifiedSplit(splitNode) {
    if (optPriority[splitNode] != undefined || isAndOrOperatorDesc(splitNode)) {
        return true
    } else if (splitNode == '(' || splitNode == ')') {
        return true
    } else if (isNumber(splitNode) && splitNode.length > 0 && splitNode[0] != '+' && splitNode[0] != '-') {   //  是数字
        return true
    } else if (isVariable(splitNode) || isVariableDesc(splitNode)) {
        return true
    }
    return false
}

function normalCalculate(a, b, operation) {
    switch (operation) {
        case "*":
            return a * b
        case "-":
            return a - b
        case "+":
            return a + b
        case "/":
            return a / b
        case ">":
            if (a > b) {
                return 1
            } else {
                return 0
            }
        case "<":
            if (a < b) {
                return 1
            } else {
                return 0
            }
        case "==":
            if (a == b) {
                return 1
            } else {
                return 0
            }
        case "=":
            if (a == b) {
                return 1
            } else {
                return 0
            }
        case ">=":
            if (a >= b) {
                return 1
            } else {
                return 0
            }
        case "<=":
            if (a <= b) {
                return 1
            } else {
                return 0
            }
        case "&&":
            if (a != 0 && b != 0) {
                return 1
            } else {
                return 0
            }
        case "||":
            if (a == 0 && b == 0) {
                return 0
            } else {
                return 1
            }
        default:
            return "";
    }
}

// 判断字符串数组是否是合法的后缀表达式
function isVerifiedRPN(datas) {
    var stack = [];
    if (datas == null) {
        return false
    }

    for (var i = 0; i < datas.length ; i++) {
        if (calcIsNumberString(datas[i])) {
            if (!isVerifiedSplit(datas[i])) {
                return false
            }
            stack.push(datas[i])
        } else {
            p1 = stack.pop()
            p2 = stack.pop()

            if (p1 == undefined || p2 == undefined) {
                return false
            }

            if (!isNaN(p1) && parseInt(p1) === 0 && datas[i] == "/") {
                return false
            }
            p3 = p1 + p2 + datas[i]
            stack.push(p3)
        }
    }
    return stack.length == 1 || stack.length == 0
}

// 将exp中缀表达式转化为后缀表达式
function generateRPN(exp) {
    var stack = []

    var spiltedStr = convertToStrings(exp)
    var datas = []
    var tmp;
    var pop;

    for (var i = 0; i < spiltedStr.length; i++) { // 遍历每一个字符
        //tmp := spiltedStr[i] //当前字符
        tmp = spiltedStr[i]

        if (!calcIsNumberString(tmp)) { //是否是数字
            // 四种情况入栈
            // 1 左括号直接入栈
            // 2 栈内为空直接入栈
            // 3 栈顶为左括号，直接入栈
            // 4 当前元素不为右括号时，在比较栈顶元素与当前元素，如果当前元素大，直接入栈。
            if (tmp == "(" ||
                stack.length == 0 || (lookTop(stack) == "(" && tmp != ")") ||
                (compareOperator(tmp, lookTop(stack)) == 1 && tmp != ")")) {
                stack.push(tmp)
            } else { // ) priority
                if (tmp == ")") { //当前元素为右括号时，提取操作符，直到碰见左括号
                    for (; ;) {
                        pop = stack.pop()
                        if (pop == null || pop == "(") {
                            break
                        } else {
                            datas.push(pop)
                        }
                    }
                } else { //当前元素为操作符时，不断地与栈顶元素比较直到遇到比自己小的或者左括号（或者栈空了），然后入栈。
                    for (; ;) {
                        pop = lookTop(stack)
                        if (pop != null && pop != "(" && compareOperator(tmp, pop) != 1) {
                            datas.push(stack.pop())
                        } else {
                            stack.push(tmp)
                            break
                        }
                    }
                }
            }

        } else {
            datas.push(tmp)
        }
    }

    //将栈内剩余的操作符全部弹出。
    for (; ;) {
        pop = stack.pop()
        if (pop != null) {
            if (pop == "(") {
                return null
            }
            datas.push(pop)
        } else {
            break
        }
    }
    return datas
}

// 获取栈顶元素，但不进行弹栈操作
function lookTop(stack) {
    if (stack.length == 0) {
        return null
    } else {
        return stack[stack.length - 1]
    }
}

// 比较运算符优先级
// if return 1, o1 > o2.
// if return 0, o1 = 02
// if return -1, o1 < o2
function compareOperator(o1, o2) {
    var o1Priority = 0;
    var o2Priority = 0;

    if (optPriority[o1] != undefined) {
        o1Priority = optPriority[o1]
    }

    if (optPriority[o2] != undefined) {
        o2Priority = optPriority[o2]
    }

    if (o1Priority > o2Priority) {
        return 1
    } else if (o1Priority == o2Priority) {
        return 0
    } else {
        return -1
    }
}

function convertToStrings(exp) {
    if (exp == null || exp == undefined) {
        return []
    }

    // 去除空格
    exp.replace(/ /g, "")
    // 去除制表符
    exp.replace(/\t/g, "")

    var strs = [];
    //bys := []byte(exp)
    var number = ''
    var opt = ''
    var curByte;

    for (var i = 0; i < exp.length; i++) {
        //curByte = bys[i]
        curByte = exp.charAt(i)

        if (calcIsWord(curByte)) {
            number += curByte
        } else {
            completeOpt = false;
            if (curByte == '(' || curByte == ')') {
                if (number != "") {
                    strs.push(number);
                    number = ""
                }
                if (opt != "") {
                    strs.push(opt);
                    opt = ""
                }
                completeOpt = true
            }

            opt += curByte

            if (i + 1 >= exp.length) {
                completeOpt = true
            }
            if (i + 1 < exp.length && (calcIsWord(exp.charAt(i + 1)) || calcIsSpace(exp.charAt(i + 1)))) {
                completeOpt = true
            }

            if (completeOpt) {
                if (number != "") {
                    strs.push(number)
                    number = ""
                }
                if (opt != "") {
                    strs.push(opt)
                    opt = ""
                }
            }
        }
    }
    if (number != "") {
        strs.push(number)
        number = ""
    }
    if (opt != "") {
        strs.push(opt)
        opt = ""
    }
    return strs
}

function calcIsWord(ch) {
    if (calcIsAlpha(ch) || calcIsNumber(ch)) {
        return true
    }
    return false
}

function calcIsNumberString(o1) {
    if (optPriority[o1] != undefined) {
        return false
    } else if (o1 == "(" || o1 == ")") {
        return false
    } else {
        return true
    }
}

function calcIsNumber(o1) {
    if (o1 >= '0' && o1 <= '9' || o1 == '.') {
        return true
    }
    return false
}

function calcIsAlpha(o1) {
    if (o1 >= 'a' && o1 <= 'z' || o1 >= 'A' && o1 <= 'Z') {
        return true
    }
    return false
}

function calcIsSpace(ch) {
    return ch == ' ' || ch == '\t'
}

// 生成统计页面的展示字符串
// 例如 uv+5>10;uv=2;result=0 生成的字符串为 曝光用户[2]+5>10
function getExtStopCondDescValueString(extStopCondDesc) {
    if (extStopCondDesc == undefined || extStopCondDesc == "") {
        return "";
    }
    var split = extStopCondDesc.split(";");
    var descStringNodes = convertToStrings(split[0]);

    for (var si = 1 ; si < split.length; si++) {
        var keyValueSplit = split[si].split("=");
        if (keyValueSplit.length != 2) {
            continue;
        }

        for (var i = 0; i < descStringNodes.length; i++) {
            if (descStringNodes[i].toLowerCase() == keyValueSplit[0].toLowerCase()) {
                descStringNodes[i] = dictionaryMatch(descStringNodes[i].toLowerCase()) + "[" + keyValueSplit[1] + "]";
            }
        }
    }

    var descString = "";
    for (var i = 0; i < descStringNodes.length; i++) {
        descString += dictionaryMatch(descStringNodes[i]) + " ";
    }

    return descString;
}

// 用于新增任务时的显示，不会显示变量的值
function getExtStopCondDescString(extStopCondDesc) {
    if (extStopCondDesc == undefined || extStopCondDesc == "") {
        return "";
    }
    var descStringNodes = convertToStrings(extStopCondDesc);

    var descString = "";
    for (var i = 0; i < descStringNodes.length; i++) {
        descString += dictionaryMatch(descStringNodes[i]) + " ";
    }

    return descString;
}

function dictionaryMatch(key) {
    try {
        var val = conditionDic[key];
        if (!val || val == undefined) return key;
        return val;
    } catch (e) {
        return key;
    }
}

function dictionaryMatchByName(key) {
    try {
        var val = conditionDicByName[key];
        if (!val || val == undefined) return key;
        return val;
    } catch (e) {
        return key;
    }
}

function replaceColor(val) {
    if (val == "且" || val == "或") {
        return "green-tag";
    } else if (val == "(" || val == ")") {
        return "red-tag";
    } else {
        return "";
    }
}
