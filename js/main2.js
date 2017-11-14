var date = new Date;
var setYear = true;
var cusip=543487854;
var monthStart=date.getMonth();
var monthEnd=date.getMonth();
var yearStart=2015;
var yearEnd= date.getFullYear();
var query='path1';
var fundInvestment='10000';
var chart;
var cached_data = new Array();
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
		$('#end-month').val(monthEnd);
		options['cusip'] = $('#chart-container').attr('data-cusip');
		options['monthStart'] = new Date($('#chart-container').attr('data-startdate')).getMonth();
		options['yearStart'] = new Date($('#chart-container').attr('data-startdate')).getFullYear();
		path = getQueryPath(options);
		if ((date.getFullYear() - 10) > options['yearStart']){
			options['yearStart'] = date.getFullYear() - 10;
		}
		$('#fundInvestment').val( '$' + fundInvestment.replace(/[^\d]/g, '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,").toString());
		$('#fundInvestment').on('change', function(){
			options['fundInvestment'] = parseInt($('#fundInvestment').val().replace(/[^\d]/g, ''));
			$('#fundInvestment').val( '$' + (parseInt($('#fundInvestment').val().replace(/[^\d]/g, '')) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,").toString());
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
	function set_dates(){
		$('#start-month,#end-month').on('change', function(){
			var sm = $('#start-month').val();
			var sy = $('#start-year').val();
			var em = $('#end-month').val();
			var ey = $('#end-year').val();
			check_start_month = cached_data.getIndexBy("monthEndDate", (sy+'-'+getDigit(sm)));
			check_end_month = cached_data.getIndexBy("monthEndDate", (ey+'-'+getDigit(em)));
			if (check_start_month == -1) {
				$('#start-month').val(Highcharts.dateFormat('%m', new Date(Date.parse(cached_data[0]['monthEndDate']))));
			}
			if (check_end_month == -1) {
				$('#end-month').val(Highcharts.dateFormat('%m', new Date(Date.parse(cached_data[cached_data.length-1]['monthEndDate']))));
			}
		})
	}
	function getMin(arr, prop) {
		var min;
		for (var i=0 ; i<arr.length ; i++) {
			if (!min || parseInt(arr[i][prop]) < parseInt(min[prop]))
				min = arr[i];
		}
		return min;
	}

	Array.prototype.getIndexBy = function (name, value) {
	    for (var i = 0; i < this.length; i++) {
	        if (this[i][name].indexOf(value) != -1 ) {
	            return i;
	        }
	    }
	    return -1;
	}
	var getDigit = function (value) {
		if (value.toString().length == 1) {
            value = "0" + value;
        }
        return value
	}
	function getChartDataReady(data,sm,sy,em,ey,options){
		var data = cached_data;
		console.log('start',data.length);
		var data_length = data.length;
		sp = data.getIndexBy("monthEndDate", (sy+'-'+getDigit(sm)));
		for (var i = 0; i < sp; i++){
			if (data.getIndexBy("monthEndDate", (sy+'-'+getDigit(sm))) != 0 ){
				// console.log('shift',data);
				data.shift();
			}
		}
		console.log('before',data.length);
		ep = data.getIndexBy("monthEndDate", (ey+'-'+getDigit(em)));
		for (var i = (ep+1); i < data_length; i++){
			if (data.getIndexBy("monthEndDate", (ey+'-'+getDigit(em))) != (data.length-1)){
				// console.log('pop',data);
				data.pop();
			}
		}
		console.log('after',data.length);
		data[0]['meFund'] = '0.00';
		// console.log(data);
		var fund_data = new Array();
		var fund_value = parseInt(options['fundInvestment']);
		$.each(data,function(i,year){
			c_month_fund = (year['meFund']/ 100) * parseInt(fund_value);
            fund_value = fund_value + Math.round(c_month_fund);
			fund_data.push(new Array(Date.parse(year['monthEndDate']), fund_value));
		});
		return fund_data
	}

	function filterData(jdata,options){
		var data = jdata;
		var sm = $('#start-month').val();
		var sy = $('#start-year').val();
		var em = $('#end-month').val();
		var ey = $('#end-year').val();
		fund_data = getChartDataReady(data,sm,sy,em,ey,options);
		console.log(fund_data.length);
		$('#fund-val').html("$"+(fund_data[fund_data.length-1][1]+"").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
		options['fundMaxRange'] = getMax(fund_data,'1')[1];
		options['fundMinRange'] = getMin(fund_data,'1')[1];
		highchart(fund_data,options);
	}
	// populate stock data
	function getStockData(path,options){
		var data = new Array();
		if (cached_data.length == 0){
			$.getJSON(path,function(pdata){
				cached_data = pdata;
				date_available = Highcharts.dateFormat('%b %d, %Y', new Date(Date.parse(pdata[0]['monthEndDate'])));
				$('.fund-start-date').html(date_available);
				year_array = [];
				$.each(pdata,function(i,year){
					year_array.push((new Date(Date.parse(year['monthEndDate']))).getFullYear());
				});
				// set year dropdown
				if (setYear){
					populateYear(year_array);
					setYear = false;
					$('#end-year').val(year_array[year_array.length -1]);
				}
				$('#fundName').html(pdata[0]['fundName']);
				console.log(pdata);
				set_dates()
				filterData(cached_data,options);
			});
		}
		else{
			console.log('else',cached_data);
			filterData(cached_data,options);
		}
	}
	// query path function
	function getQueryPath(options){
		if (query == "path1"){
			path = "https://www.ngam.natixis.com/search/service/growth10k/history/"+options['cusip']+"?"+'monthStart='+options['monthStart']+'&monthEnd='+options['monthEnd']+'&yearStart='+options['yearStart']+'&yearEnd='+options['yearEnd']
			// path = "http://fwireboss03:8180/search/service/growth10k/history/"+options['cusip']+"?"+'monthStart='+options['monthStart']+'&monthEnd='+options['monthEnd']+'&yearStart='+options['yearStart']+'&yearEnd='+options['yearEnd']
			//path = "http://cmsapbosv01:8180/search/service/growth10k/history/"+options['cusip']+"?"+'monthStart='+options['monthStart']+'&monthEnd='+options['monthEnd']+'&yearStart='+options['yearStart']+'&yearEnd='+options['yearEnd']
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
	function highchart(fund_data,options){
		chart = Highcharts.stockChart('chart-container', {
			exporting: { enabled: false },
			labels: {
				align: 'left',
				x: 0,
				y: 0
			},
			scrollbar: {
				enabled: false
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
					s.join("</b>") + '</b>';
				}
			},
			yAxis: [{
				min: Math.round(parseInt(options['fundMinRange'])),//0,//Math.round(parseInt(options['fundMinRange']) - (parseInt(options['fundMaxRange']) - parseInt(options['fundMinRange']))),
				max: Math.round(parseInt(options['fundMaxRange'])),//+ (parseInt(options['fundMaxRange']) - parseInt(options['fundMinRange']))/10),
				tickInterval: (Math.round(parseInt(options['fundMaxRange']) / 4)),//Math.round(((parseInt(options['fundMaxRange']) - parseInt(options['fundMinRange'])) / fund_data.length)),
				opposite: false,
				labels: {
					formatter: function(){
						return "$" + (this.value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");//((this.value)/1000).toString() + ',000';
					}
				},
				showFirstLabel: true,
				showLastLabel: true
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
						return "<span class='end-val' style='color:gray;'>Ending Value: </span><br/><b>"+"$"+(this.value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +'</b>'
					}
				}
			}
			// },
			// {
			// 	linkedTo: 1,
			// 	opposite: true,
			// 	gridLineWidth: 0,
			// 	tickPositioner: function(min,max){
			// 		var data = this.chart.yAxis[0].series[1].processedYData;
			// 		//last point
			// 		return [data[data.length-1]];
			// 	},
			// 	labels: {
			// 		useHTML: true,
			// 		formatter: function () {
			// 			return "</br><span class='end-val' style='color:gray;'>Ending Value: </span><br/><b>"+"$"+(this.value + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +'</b>'
			// 		}
			// 	}
			// }

			],
			xAxis: {
				type: 'datetime',
				min: fund_data[0][0],//new Date('2015/1/22').getTime(),
				max: fund_data[fund_data.length - 1][0], //new Date('2017/5/22').getTime(),
				// tickInterval: 30*24*60*60
				labels: {
					style: {

					}
				}
			},
			colors: ['#643488', '#00B5CC', '#90ed7d', '#f7a35c', '#8085e9', 
				'#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
			series: [
				{
					name: 'OakMark Fund',
					data: fund_data,
					color: "#643488",
					type: 'area',
					fillOpacity: 0.15,
					marker: {
            			lineWidth: 3,
            			lineColor: '#643488',
						fillColor: '#fff',
            			radius: 6
						// symbol: 'circle',
					},
					showInNavigator: true,
					zIndex: 2
				}
				// }, 
				// {
				// 	name: 'Benchmark',
				// 	data: benchmark_data,
				// 	color: "#00B5CC",
				// 	type: 'area',
				// 	fillOpacity: 0.15,
				// 	marker: {
				// 		fillColor: '#fff',
				// 		symbol: 'circle',
    //         			lineColor: '#00B5CC',
    //         			lineWidth: 3
				// 	},
				// 	showInNavigator: true,
				// 	zIndex: 1
				// }
			],
			navigator: {
			    maskFill: 'rgba(239,239,239,0.45)',
			    series: [{
			        type: 'areaspline',
			        color: '#643488',
			        fillOpacity: 0.4,
			        dataGrouping: {
			            smoothed: false
			        },
			        lineWidth: 2,
			        lineColor: '#643488',
			        fillOpacity: 0.15,
			        marker: {
			            enabled: false
			        },
			        shadow: true
			    },
			    {
			        type: 'areaspline',
			        color: '#00B5CC',
			        fillOpacity: 0.4,
			        dataGrouping: {
			            smoothed: false
			        },
			        lineWidth: 2,
			        lineColor: '#00B5CC',
			        fillOpacity: 0.15,
			        marker: {
			            enabled: false
			        },
			        shadow: true
			    }
			    ]
			},
			dataLabels: {
            	style: {
               		fontFamily: '\'kabelblack\'',
               	}
            },
			responsive: {
	            rules: [{
	                condition: {
	                    maxWidth: 500
	                },
	                chartOptions: {
	                    chart: {
	                        height: 300
	                    },
	                    subtitle: {
	                        text: null
	                    },
	                    navigator: {
	                        enabled: false
	                    }
	                }
	            },{
	                condition: {
	                    maxWidth: 800
	                },
	                chartOptions: {
	                    chart: {
	                        height: 400
	                    },
	                    subtitle: {
	                        text: null
	                    },
	                    navigator: {
	                        enabled: true
	                    }
	                }
	            },
	            {
	                condition: {
	                    maxWidth: 1400
	                },
	                chartOptions: {
	                    chart: {
	                        height: 400
	                    },
	                    subtitle: {
	                        text: null
	                    },
	                    navigator: {
	                        enabled: true
	                    }
	                }
	            }
	            ]
	        }
		});
		if(500 >= $(document).width()){
			chart.setSize(null);
		}
	}
})();