var date = new Date;
var setYear = true;
var cusip=543487854;
var monthStart=1;
var monthEnd=date.getMonth();
var yearStart=2015;
var yearEnd= date.getFullYear();
var query='path2';
var fundInvestment='10000';
var chart;
var options = {
	'query': query,
	'cusip': cusip,
	'monthStart': monthStart,
	'monthEnd': monthEnd,
	'yearStart': yearStart,
	'yearEnd': yearEnd,
	'fundInvestment': fundInvestment.replace(/[^\d]/g, '')
};
(function() {
	setTimeout(function(){
		path = getQueryPath(options);
		$('#end-month').val(monthEnd);
		options['cusip'] = $('#chart-container').attr('data-cusip');
		options['monthStart'] = new Date($('#chart-container').attr('data-startdate')).getMonth();
		options['yearStart'] = new Date($('#chart-container').attr('data-startdate')).getFullYear();
		if ((date.getFullYear() - 10) > options['yearStart']){
			options['yearStart'] = date.getFullYear() - 10;
		}
		$('#fundInvestment').val( '$' + fundInvestment.replace(/[^\d]/g, ''));
		$('#fundInvestment').on('change', function(){
			options['fundInvestment'] = parseInt($('#fundInvestment').val().replace(/[^\d]/g, ''));
			getStockData(path,options);
		});
		$('#start-month,#start-year,#end-month,#end-year').on('change', function(){
			$.each($('#start-month,#start-year,#end-month,#end-year'),function(i,elem){
				options[elem.name] = elem.value;
			})
			if (options['yearEnd'] < options['yearStart']){
				options['yearEnd'] = options['yearStart'];
				$('#end-year').val(options['yearStart']);
			}
			path = getQueryPath(options);
			$('.container').html('');
			getStockData(path,options);
		});
		getStockData(path,options);
	},3000);

	function getMax(arr, prop) {
		var max;
		for (var i=0 ; i<arr.length ; i++) {
			if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
				max = arr[i];
		}
		return max;
	}

	function getMin(arr, prop) {
		var min;
		for (var i=0 ; i<arr.length ; i++) {
			if (!min || parseInt(arr[i][prop]) < parseInt(min[prop]))
				min = arr[i];
		}
		return min;
	}
	// populate stock data
	function getStockData(path,options){
		$.getJSON(path,function(data){
			// set date available
			date_available = Highcharts.dateFormat('%b %d, %Y', new Date(Date.parse(data[0]['monthEndDate'].split(' ')[0])));
			$('.fund-start-date').html(date_available);
			year_array = [];
			var fund_data = new Array();
			var	benchmark_data = new Array();
			var fund_value = parseInt(options['fundInvestment']);
			var benchmark_value = parseInt(options['fundInvestment']);
			$.each(data,function(i,year){
				c_month_fund = (year['meFund']/ 100) * parseInt(options['fundInvestment']);
				fund_value = Math.round(fund_value + c_month_fund);
				fund_data.push(new Array(Date.parse(year['monthEndDate'].split(' ')[0]), fund_value));
				c_month_benchmark = (year['meBenchmark']/ 100) * parseInt(options['fundInvestment']);
				benchmark_value = Math.round(benchmark_value + c_month_benchmark);
				benchmark_data.push(new Array(Date.parse(year['monthEndDate'].split(' ')[0]), benchmark_value));
				year_array.push(year['returnYear']);
			});
			console.log(fund_data,benchmark_data)
			// set year dropdown
			if (setYear){
				populateYear(year_array);
				setYear = false;
				$('#end-year').val(year_array[year_array.length -1]);
			}
			$('#fundName').html(data[0]['fundName']);
			$('#benchmarkName').html(data[0]['primaryBenchmarkIndexName']);
			$('#fund-val').html("$"+(fund_data[fund_data.length-1][1]+"").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
			$('#benchfund-val').html("$"+(benchmark_data[benchmark_data.length-1][1]+"").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
			options['fundMaxRange'] = getMax(fund_data,'1')[1];
			options['benchMaxRange'] = getMax(benchmark_data,'1')[1];
			options['fundMinRange'] = getMin(fund_data,'1')[1];
			options['benchMinRange'] = getMin(benchmark_data,'1')[1];
			highchart(fund_data,benchmark_data,options);
		// }).error(function(){
			// console.log('nothing found');
		// }).complete(function(){
		// 	$('#loading-image').hide();
		// 	$('.chart').css('opacity', 1);
		});
	}
	// query path function
	function getQueryPath(options){
		if (query == "path1"){
			path = "http://cmsapbosv01:8180/search/service/growth10k/history/"+options['cusip']+"?"+'monthStart='+options['monthStart']+'&monthEnd='+options['monthEnd']+'&yearStart='+options['yearStart']+'&yearEnd='+options['yearEnd']
		}
		else{
			path = '/data.json';
		}
		return path
	}

	// year populate function
	function populateYear(year_array){
		Array.prototype.contains = function(v) {
			for(var i = 0; i < this.length; i++) {
				if(this[i] === v) return true;
			}
			return false;
		};
		Array.prototype.unique = function() {
			var arr = [];
			for(var i = 0; i < this.length; i++) {
				if(!arr.contains(this[i])) {
					arr.push(this[i]);
				}
			}
			return arr; 
		}
		year_array = year_array.unique();
		i = 1;
		$('#start-year').html('');
		$('#end-year').html('');
		for (i = 0; i < year_array.length; i+=1 ){
			$('#start-year').append("<option value=" + year_array[i] + ">" + year_array[i] + "</option>")
			$('#end-year').append("<option value=" + year_array[i] + ">" + year_array[i] + "</option>")
		}
	}

	// Highchart Function
	function highchart(fund_data,benchmark_data,options){
		chart = Highcharts.stockChart('chart-container', {
			exporting: { enabled: false },
			// width: 800,
			labels: {
				align: 'left',
				x: 0,
				y: 0
			},
			plotOptions: {
			    series: {
			    	lineWidth: 3,
			        states: {
			            hover: {
			                enabled: true,
			                halo: {
			                    size: 0
			                }
			            }
			        }
			    }
			},
			scrollbar: {
				enabled: false
			},
			rangeSelector: {
				selected: 5,
				inputEnabled: false,
				buttonTheme: {
					visibility: 'hidden'
				},
				labelStyle: {
					visibility: 'hidden'
				}
			},
			tooltip: {
				crosshairs: {
					color: 'transparent',
					dashStyle: 'solid'
				},
				backgroundColor: null,
				borderWidth: 0,
				shadow: false,
				useHTML: true,
				style: {
					padding: 0
				},
				formatter: function() {
					var s = [];
					$.each(this.points, function(i, point) {
						s.push((this.y + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,").toString());
					});
					return Highcharts.dateFormat('%b %d, %Y', this.x) +
					"</br><b class='head'><b class='oakmark'></b><b class='oakmark-text'>$" + 
					s.join("</b></br><b class='benchmark'></b><b class='benchmark-text'>$") + '</b></b>' ;
				}
			},
			yAxis: [{
				min: 0,
				max: (parseInt(options['fundInvestment']) * 5),
				tickInterval: (parseInt(options['fundInvestment']) / 2),
				opposite: false,
				labels: {
					formatter: function(){
						return "$" + (this.value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");//((this.value)/1000).toString() + ',000';
					}
				},
				showFirstLabel: true
			},{
				linkedTo: 0,
				opposite: true,
				gridLineWidth: 0,
				tickPositioner: function(min,max){
					var data = this.chart.yAxis[0].series[0].processedYData;
					//last point
					return [data[data.length-1]];
				},
				labels: {
						useHTML: true,
						formatter: function () {
							return "<span class='end-val' style='color:gray;'>Ending Value: <br/><b>"+"$"+(this.value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +'</b></span>'
						}
				}
			},
			{
				linkedTo: 1,
				opposite: true,
				gridLineWidth: 0,
				tickPositioner: function(min,max){
					var data = this.chart.yAxis[0].series[1].processedYData;
					//last point
					return [data[data.length-1]];
				},
				labels: {
					useHTML: true,
					formatter: function () {
						return "</br><span class='end-val' style='color:gray;'>Ending Value: <br/><b>"+"$"+(this.value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +'</b></span>'
					}
				}
			}

			],
			xAxis: {
				type: 'datetime',
				min: fund_data[0][0],//new Date('2015/1/22').getTime(),
				max: fund_data[fund_data.length - 1][0] //new Date('2017/5/22').getTime(),
				// tickInterval: 30*24*60*60
			},
			colors: ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 
				'#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
			series: [
				{
					name: 'OakMark Fund',
					data: fund_data,
					color: "#7a4684",
					type: 'area',
					fillColor: {
						linearGradient: {
							x1: 2,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, '#643488'],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					marker: {
						fillColor: '#fff',
						symbol: 'circle',
            			lineColor: '#7a4684',
            			lineWidth: 3,
            			width: 40,
            			height: 40
					},
					showInNavigator: true
				}, 
				{
					name: 'Benchmark',
					data: benchmark_data,
					color: "#00B5CC",
					type: 'area',
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 0
						},
						stops: [
							[0, '#9dc6e0'],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0.15).get('rgba')]
						]
					},
					marker: {
						fillColor: '#fff',
						symbol: 'circle',
            			lineColor: '#00B5CC',
            			lineWidth: 3,
            			width: 60,
            			height: 60
					},
					showInNavigator: true
				}
			],
			navigator: {
			    maskFill: 'rgba(239,239,239,0.45)',
			    series: [{
			        type: 'areaspline',
			        color: 'rgba(255, 255, 255, 0.00)',
			        fillOpacity: 0.4,
			        dataGrouping: {
			            smoothed: false
			        },
			        lineWidth: 2,
			        lineColor: 'red',
			        fillColor : {
			            linearGradient : {  
			                x1 : 0, 
			                y1 : 0, 
			                x2 : 0, 
			                y2 : 1 
			            }, 
			            stops : [[0, '#FF8000'], [1, '#FFFF00']] 
			        },
			        marker: {
			            enabled: false
			        },
			        shadow: true
			    },
			    {
			        type: 'areaspline',
			        color: 'rgba(55, 55, 255, 0.00)',
			        fillOpacity: 0.1,
			        dataGrouping: {
			            smoothed: false
			        },
			        lineWidth: 2,
			        lineColor: 'red',
			        fillColor : {
			            linearGradient : {  
			                x1 : 0, 
			                y1 : 0, 
			                x2 : 0, 
			                y2 : 1 
			            }, 
			            stops : [[0, '#FF8000'], [1, '#FFFF00']] 
			        },
			        marker: {
			            enabled: false
			        },
			        shadow: true
			    }
			    ]
			}
		});
		if(500 >= $(document).width()){
			chart.setSize(null);
		}
	}
})();