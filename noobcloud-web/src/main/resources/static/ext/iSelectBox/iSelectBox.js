/*																					 *
 * ********************************************************************************* *
 *  Created by Administrator on 2016/11/10.										   * *
 * 	******************************************************************************** *
 *  *																			   * *
 *  * **使用方法:									 						       * *
 *  *	 * 基 本 语 法:jquery对象.selectBox(options)                                * *
 *  *	 * options :需要加载的数据量												   * *
 *  *		                                  									   * *
 *  * **iSelectBox分为A类数据加载方式和B类加载方式			                       * *
 *  *	 * A类加载方式为全部加载，B类为分页加载				                       * *
 *  *	 * 该对象会自动根据该为浏览器设定的数据一次承载量进行类别选择		           * *
 *  *																			   * *
 *  * **对象包括的操作方法主要有						                               * *
 *  *	 * getText(),change(fn,[trigger]),hide(),val([val])						   * *
 *  *				   															   * *
 *  * **注意点：																	   * *
 *  *	 * 该插件主要依赖jquery											           * *
 *  *																			   * *
 *  ******************************************************************************** *
 *  																				 *
 */
(function($){
	var ISelectBox = (function(){
		function ISelectBox(){
			this.setLimitByBrowser.call(this,arguments[1]);
			this.initHtml.apply(this,arguments);
			this.registerEvent();
			return this;
		}

		ISelectBox.prototype.setLimitByBrowser = function(){
			//A类方式为全部加载，B类为分页加载
			if(!arguments[0]){
				this.loadLimit = 1000;this.handleType = "A";
				return "default";
			};
			var userAgent = window.navigator.userAgent,loadLimit = 1000,handleType = "A",browserType = "default",
				pgSet = arguments[0].length;

			if (userAgent.indexOf("Firefox") > -1) {
				loadLimit = 1500;handleType =pgSet <= 5000?"A":"B";browserType =  "Firefox";
			}else if (userAgent.indexOf("Chrome") > -1){
				loadLimit = 4000;handleType =pgSet <= 5000?"A":"B";browserType =  "Chrome";
			}else if (userAgent.indexOf("Safari") > -1) {
				loadLimit = 2500;handleType =pgSet <= 5000?"A":"B";browserType =  "Safari";
			}else{
				handleType =pgSet <= 1000?"A":"B";browserType =  "IE/OTHER";
			}
			this.loadLimit = loadLimit;this.handleType = handleType;//A类方式为全部加载，B类为分页加载
			return browserType;
		}
		ISelectBox.prototype.initHtml = function(){
			var $willInput = arguments[0],options = arguments[1],optionHTML = [],loadLimit = this.loadLimit,
				handleType = this.handleType,optionsMap = {};
			if (options){
				for (var index=0;index<options.length;index++){
					//性能问题考虑
					if (index < loadLimit || handleType == "A"){
						optionHTML.push("<li data-value='"+options[index].key+"' class='data-option'>"+options[index].value+"</li>");
					}
					optionsMap[options[index].key]={"index":index,"text":options[index].value};
				}
			}
			var $icon = $("<div class='iSelectBox-i-icon'><i class='fa fa-chevron-down'></i><div>"),
				$sValue = $("<input class='iSelectBox-i-value' type='hidden' title='请选择有效值'/>"),
				$panel = $("<div class='panel iSelectBox-p' style='display:none;'>" +
					"<ul class='result'>"+optionHTML.join('')+"</ul>" +
					"<div class='iSelectBox-pg'><span class='prev d'><</span><span class='pgv'>1</span><span class='next d'>></span></div>"+
					"</div>").hide();

			$willInput.wrap("<div class='iSelectBox-c'><div class='iSelectBox-i'></div></div>")
				.after($sValue)
				.after($icon)
				.addClass("iSelectBox-i-text")
				.parent()
				.after($panel);

			var $container = $willInput.closest(".iSelectBox-c").css({"width":"auto"});
			if (!options || options.length <= loadLimit) $panel.find("div.iSelectBox-pg").hide();

			this.options = options;
			this.optionsMap = optionsMap;
			this.text = $willInput;
			this.icon = $icon;
			this.vText = $sValue;
			this.panel = $panel;
			this.container = $container;
			this.document = $($container[0].ownerDocument);
			this.setPosition = function(){
				if (arguments.length === 0) return;
				var $_1 = arguments[0],$_p = arguments[1],width = $_1[0].clientWidth,left = $_1.offset().left,
					top = $_1.offset().top + $_1.outerHeight(),docScrollTop = $(this.document).scrollTop(),
					winHeight = $(window).height(),pHeight = $_p.outerHeight(),pTop = top-docScrollTop,offsetTop = pTop;
				if((pHeight + pTop) > winHeight) offsetTop = $_1.offset().top-pHeight-docScrollTop;
				$_p.css({"width":width+"px","left":left+"px",top:offsetTop+"px"});
				return $_p;
			};
			this.toggleEle = function(){
				if (arguments.length === 0) return;
				var $element = arguments[0],domainObj = arguments[1],options = domainObj.options,optionHTML = [],
					handleType = domainObj.handleType,$iSelectBoxPg = $element.find(".iSelectBox-pg"),$text = $(domainObj.text),
					$result = $element.find("ul"),isVisible = $element.toggle().is(":visible");

				handleType == "A"?$iSelectBoxPg.hide():$iSelectBoxPg.show();

				if(isVisible){
					for (var index=0;index<options.length;index++){
						//性能问题考虑
						if (index < loadLimit || handleType == "A"){
							optionHTML.push("<li data-value='"+options[index].key+"' class='data-option'>"+options[index].value+"</li>");
						}
					}
					$result.empty().append(optionHTML.join(""));
					$iSelectBoxPg.find(".pgv").text("1");
					domainObj.setPosition($text.focus(),$element);
				}
			};
		},
		ISelectBox.prototype.registerEvent = function(){
			this.text.on("keyup",[this],function(e){
				var _this = e.data[0];
				console.log(e.keyCode);
				switch(e.keyCode){
					case 9:case 16:case 17:case 18:case 20:case 27:case 33:case 34:case 35:case 36:case 38:case 40:case 45:
					case 91:case 92:case 93:case 113:case 115:case 118:case 119:case 120:case 122:case 123:case 144:break;
					case 13:e.preventDefault();_this.keyHandler.enter(_this);break;
					default:e.preventDefault();_this.keyHandler.query(_this);break;
				}
			});
			this.text.on("keydown",[this],function(e){
				var _this = e.data[0];
				switch(e.keyCode){
					case 38:_this.keyHandler.up(_this);break;
					case 40:_this.keyHandler.down(_this);break;
					default:break;
				}
			});
			this.text.on("focus",[this],function(e){
				var _select = e.data[0],$_panel = $(_select.panel),$_doc = $(_select.document);
				$_doc.find(".panel.iSelectBox-p").not($_panel).hide();
			});
			this.icon.on("click",[this],function(e){
				var _select = e.data[0],$_text = $(_select.text),$_panel = $(_select.panel),$_doc = $(_select.document),
					_position = _select.setPosition;
				//打开结果框时初始化保证从最上面开始显示
				$_panel.scrollTop(0);
				//设置panel位置
				_position($_text.focus(),$_panel);
				//隐显结果框
				_select.toggleEle($_panel,_select);
				//隐藏其他iselectBox的所有结果框
				$_doc.find(".panel.iSelectBox-p").not($_panel).hide();
				//将选中数据在结果框可显位置显示
				_select._selectedItemShow.call(_select,$_panel);
			});
			this.vText.on("change",function(e){
				var func = $(this).data("func");
				if (func == undefined) return;
				func();
			});
			this.panel.on("click","li.data-option",[this],function(e){
				var _select = e.data[0],$_input = $(_select.text),$_value = $(_select.vText);
				$(_select.panel).hide();
				$_input.val($(this).text());
				$_value.val($(this).attr("data-value"));
				$_value.trigger("change");
			});
			this.panel.on("mouseover","li.data-option",function(e){
				$(e.target).addClass("hover").siblings("li").removeClass("hover");
			});
			this.document.on("click mousedown",function(event){
				if ($(event.target).closest(".iSelectBox-c").length <= 0){
					$(this).find(".panel.iSelectBox-p").hide();
				}
			});
			this.panel.on("click","span.d",[this],function(e){
				var $this = $(this),domainObj = e.data[0],$_panel = $(domainObj.panel),$result = $_panel.find("ul"),
					options = domainObj.options,optionHTML = [],resultChangeCount = 0,$pgv = $this.siblings(".pgv"),
					loadLimit = domainObj.loadLimit,resultLastValue = $result.find("li:last").attr("data-value"),lastIndex = 0,
					resultFirstValue = $result.find("li:first").attr("data-value"),firstIndex = 0;

				$(domainObj.text).focus();
				if(($this.hasClass("next") && resultLastValue == (options.length-1))
					|| ($this.hasClass("prev") && resultFirstValue == 0)){
					return;
				}

				$result.find("li").remove();
				$_panel.scrollTop(0);

				if($this.hasClass("prev")){
					$pgv.text(parseInt($pgv.text())-1);
					for (var index=options.length-1;index>=0;index--){
						if(options[index].key == resultFirstValue && firstIndex == 0){
							firstIndex = index;
						}
						if(firstIndex != 0 && firstIndex != index && resultChangeCount < loadLimit){
							optionHTML.push("<li data-value='"+options[index].key+"' class='data-option'>"+options[index].value+"</li>");
							resultChangeCount++;
						}else if(firstIndex != 0 && resultChangeCount == loadLimit){
							break;
						}
					}
					$result.append(optionHTML.reverse().join(""));
				}else{
					$pgv.text(parseInt($pgv.text())+1);
					for (var index=0;index<options.length;index++){
						if(options[index].key == resultLastValue && firstIndex == 0){
							lastIndex = index;
						}
						if (lastIndex != 0 && lastIndex != index && resultChangeCount < loadLimit){
							optionHTML.push("<li data-value='"+options[index].key+"' class='data-option'>"+options[index].value+"</li>");
							resultChangeCount++;
						}else if(lastIndex != 0 && resultChangeCount == loadLimit){
							break;
						}
					}
					$result.append(optionHTML.join(""));
				}
			});
		},
		ISelectBox.prototype.keyHandler = {
			up:function(target){this.doDms(target,"prev")},
			down:function(target){this.doDms(target,"next")},
			enter:function(target){this.doEnter(target)},
			query:function(target){this.doQuery(target)},
			doDms:function(target,dir){
				var $currentPanel = $(target.panel),$_text = $(target.text),$_vText = $(target.vText);
				var $item = $currentPanel.find("li.hover"),$result = $currentPanel.find("ul.result");

				if ($result.children().length < 0) return false;
				if ($item.length == 0 && dir == "next"){
					var $selectedItem = $currentPanel.find("li:first").addClass("hover");
					$_text.val($selectedItem.text());
					$_vText.val($selectedItem.attr("data-value"));

					if ($selectedItem.offset().top < $_text.offset().top){
						$result.scrollTop(0);
					}
				}else{
					var $willItem = (dir == "next"?$item.nextAll(":not(.unable):first"):$item.prevAll(":not(.unable):first")),willScrollTop;

					if ($willItem.length > 0){
						var willPosition = $willItem.position();
						$item.removeClass("hover");
						$willItem.addClass("hover");

						$_text.val($willItem.text());
						$_vText.val($willItem.attr("data-value"));

						if (willPosition.top < 0){
							willScrollTop = $result.scrollTop() + willPosition.top;
						}else if (willPosition.top + $willItem.outerHeight() > $result.height()){
							willScrollTop = $result.scrollTop()+willPosition.top+$willItem.outerHeight() - $result.height();
						}
						if (willScrollTop != undefined)	$result.scrollTop(willScrollTop);
					}
				}
				$_vText.trigger("change");
			},
			doEnter:function(target){
				var $_panel = $(target.panel).hide(),$_text = $(target.text),$_value = $(target.vText);
				var $selectedItem = $_panel.find("li.hover");
				if ($selectedItem.length > 0){
					$_text.val($selectedItem.text());
					$_value.val($selectedItem.attr("data-value"));
					$_value.trigger("change");
				}
			},
			doQuery:function(target){
				var $_panel =  $(target.panel).show(),$_text = $(target.text),$_vText = $(target.vText),searchText = $_text.val(),
					$result = $_panel.find("ul.result"),optionHTML=[],searchShowCount = 0,options = target.options,totleMatchCount = 0,
					$pgv = $_panel.find(".iSelectBox-pg") ,setPosition = target.setPosition,loadLimit = target.loadLimit,
					handleType = target.handleType;

				$_panel.find("li.hover").removeClass("hover");

				//输入值有变动，就设置显示值为空
				$_vText.val("");
				$_vText.trigger("change");

				for (var index=0;index<options.length;index++){
					if(options[index].value.indexOf(searchText) != -1){
						if(searchShowCount < loadLimit || handleType == "A"){
							optionHTML.push("<li data-value='"+options[index].key+"' class='data-option'>"+options[index].value+"</li>");
							searchShowCount++;
						}
						totleMatchCount++;
					}
				}
				if(totleMatchCount < loadLimit){
					$pgv.hide();
					$pgv.find(".pgv").text("1");
				}else{
					$pgv.show();
				}
				$result.empty().append(optionHTML.join(""));
				setPosition($_text,$_panel);
			}
		},
		ISelectBox.prototype._selectedItemShow = function($panel){
			var selectValue = $(this.vText).val(),$result = $panel.find("ul.result"),options = this.options,
				loadLimit = this.loadLimit,$pgv = $panel.find(".pgv"),optionsMap = this.optionsMap,handleType = this.handleType;
			$result.find("li").removeClass("hover");
			if (selectValue != "" && optionsMap){
				var $selectItem,selectPositionTop = 0,optionHTML = [],indexText = optionsMap[selectValue],index = indexText.index;
				if(handleType == "B"){
					var currentPg = parseInt(index/loadLimit),startIndex = 0,endIndex = 0;//当前所在的页
					$pgv.text(currentPg+1);
					startIndex = currentPg*loadLimit;
					endIndex = (currentPg+1)*loadLimit-1;

					for (var index=0;index<options.length;index++){
						if (index >=startIndex && index <= endIndex){
							optionHTML.push("<li data-value='"+options[index].key+"' class='data-option'>"+options[index].value+"</li>");
						}
					}
					$result.empty().append(optionHTML.join(""));
				}

				$selectItem = $result.find("li[data-value= "+selectValue+"]").addClass("hover");
				selectPositionTop = $selectItem.position().top;

				if (selectPositionTop + $selectItem.outerHeight() > $result.height()){
					var h = $result.scrollTop()+selectPositionTop+$selectItem.outerHeight() - $result.height();
					$result.scrollTop(h);
				}else if (selectPositionTop < 0){
					h = $panel.scrollTop() + selectPositionTop;
					$result.scrollTop(h);
				}
			}
		},
		//模拟jquery的值处理val()
		ISelectBox.prototype.val = function(){
			if(arguments.length <= 0){
				return this.vText.val();
			}
			var options = this.options,selectValue = arguments[0],selectText = "";

			for (var index=0;index<options.length;index++){
				if(options[index].key == selectValue){
					selectText = options[index].value;
					break;
				}
			}
			this.text.val(selectText);
			this.vText.val(selectValue);
		},
		ISelectBox.prototype.hide = function(){
			$(this.container).hide();
		},
		//获取当前模拟select选中的值
		ISelectBox.prototype.getText = function(){
			return this.text.val();
		},
		//change事件，默认不进行trigger触发，autoHandle为true时即点击了trigger
		ISelectBox.prototype.change = function(fn,trigger){
			this.vText.data("func",fn);
			if (trigger) this.vText.trigger("change");
		},
		ISelectBox.prototype.destroy = function(){

		}
		return ISelectBox;
	})();

	$.fn.extend({
		selectBox: function(options){
			return new ISelectBox(this,options);
		}
	});
})(jQuery)