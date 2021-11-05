/**
 * 图表扩展
 */
jQuery.extend({
	/**
	 * 柱图折线图混搭
	 */
	lines : function(divId, data) {
		var options = {
			tooltip : {
				trigger: 'axis'
			},
			title:{
				show:true,
				text:data.text,
				x:'center',
				y:'bottom',
				textStyle:{
					fontSize: 18,
					fontWeight: 'bolder',
					color: '#333'
				}
			},
			toolbox: {
				show : false,
				feature : {
					mark : {show: true},
					dataView : {show: true, readOnly: false},
					magicType: {show: true, type: ['line', 'bar']},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			calculable : true,
			legend: {
				data:data.names
			},
			xAxis : [
				{
					type : 'category',
					data : data.titles
				}
			],
			yAxis : [
				{
					type : 'value',
					axisLabel : {
						formatter: '{value}'
					}
				},
				{
					type : 'value',
					axisLabel : {
						formatter: '{value}'
					}
				}
			],
			series : data.series
		};

		require([ 'echarts', 'echarts/chart/line','echarts/chart/bar' ], function(ec) {
			var chart = ec.init(document.getElementById(divId));
			chart.setOption(options, true);
		});
	},

	funnel : function(divId, params) {
		var itemStyles = [{
			normal: {
				label: {
					formatter: '{b}\n上一步'
				},
				labelLine: {
					show : false
				}
			},
			emphasis: {
				label: {
					position:'inside',
					formatter: '{b}\n上一步转化率 : {c}%'
				}
			}
		}, {
			normal: {
				borderColor: '#fff',
				borderWidth: 2,
				label: {
					position: 'inside',
					formatter: '{c}%',
					textStyle: {
						color: '#696969'
					}
				}
			},
			emphasis: {
				label: {
					position:'inside',
					formatter: '{b}\n总体转化率 : {c}%'
				}
			}
		} ];

		var option = {
			tooltip : {
				trigger: 'axis',
				formatter: "{a} <br/>{b} : {c}"
			},
			toolbox: {
				show : true,
				feature : {
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			xAxis: [{
				type : 'value',
				axisLabel : {
					formatter : function(value) {
						if (value > 1000) {
							return value / 1000 + "K";
						} else {
							return value;
						}
					}
				}
			}],
			yAxis: [{
				type : 'category'
			}],
			grid: {
				y: '10%',
				x: '10%',
				x2: '60%',
				y2: '11%',
			},
			series : []
		};

		if (typeof (params) == "undefined" || params == null) {
			return option;
		}
		option.yAxis[0].data = params.yAxisData.reverse();
		$.each(params.barData, function(idx, value){
			option.series.push({
				name: value.name,
				type: 'bar',
				barWidth: 20,
				itemStyle: {
					normal:{
						barBorderRadius:[0,15,15,0],
						label: {
							show: true,
						}
					}
				},
				data: value.data.reverse()
			});
		});
		$.each(params.funnelData, function(idx, value){
			option.series.push({
				name: value.name,
				type: 'funnel',
				y: '10%',
				y2: '10%',
				x: '50%',
				width: '36%',
				itemStyle: itemStyles[idx],
				data: value.data
			});
		});

		require([ 'echarts', 'echarts/chart/bar','echarts/chart/funnel' ], function(ec) {
			var chart = ec.init(document.getElementById(divId));
			chart.setOption(option, true);
			chart.setTheme("macarons");
		});
	}
});