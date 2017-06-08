$(function(){
	$('#loading-image').show();
	// cuspip=543487854;
	// monthStart=1;
	// monthEnd=5;
	// yearStart=2015;
	// yearEnd=2017;
	var setYear = true;
	var query = (window.location.search.substring(1)).split('&')[0].split('=')[1];
	var cuspip = (window.location.search.substring(2)).split('&')[1].split('=')[1];
	var monthStart = (window.location.search.substring(3)).split('&')[2].split('=')[1];
	var monthEnd = (window.location.search.substring(4)).split('&')[3].split('=')[1];
	var yearStart = (window.location.search.substring(5)).split('&')[4].split('=')[1];
	var yearEnd = (window.location.search.substring(6)).split('&')[5].split('=')[1];
	var options = {
		'query': query,
		'cuspip': cuspip,
		'monthStart': monthStart,
		'monthEnd': monthEnd,
		'yearStart': yearStart,
		'yearEnd': yearEnd
	}
	path = getQueryPath(options);
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
		getStockData(path);
	})
	getStockData(path);

	// populate stock data
	function getStockData(path){
		$.getJSON(path,function(data){
			// set date available
			date_available = Highcharts.dateFormat('%b %d, %Y', new Date(Date.parse(data[0]['monthEndDate'])));
			
			$('.fund-start-date').html(date_available);
			year_array = [];
			var fund_data = new Array();
			var	benchmark_data = new Array();
			var fund_value = 10000;
			var benchmark_value = 9000;
			$.each(data,function(i,year){
				c_month_fund = year['meNavMtd']* 100;
				fund_value = fund_value + c_month_fund;
				fund_data.push(new Array(Date.parse(year['monthEndDate']), fund_value));
				c_month_benchmark = year['returnMTD_me']* 100;
				benchmark_value = benchmark_value + c_month_benchmark;
				benchmark_data.push(new Array(Date.parse(year['monthEndDate']), benchmark_value));
				year_array.push(year['returnYear']);
			});
			// set year dropdown
			if (setYear){
				populateYear(year_array);
				setYear = false;

				$('#end-year').val(year_array[year_array.length -1]);
			}
			highchart(fund_data,benchmark_data);
		}).error(function(){
		}).complete(function(){
			$('#loading-image').hide();
			$('.chart').show();
		});
	}
	// query path function
	function getQueryPath(options){
		if (query == "path1"){
			path = "http://cmsapbosv01:8180/search/service/growth10k/history/"+options['cuspip']+"?"+'monthStart='+options['monthStart']+'&monthEnd='+options['monthEnd']+'&yearStart='+options['yearStart']+'&yearEnd='+options['yearEnd']
		}
		else{
			path = 'data.json';
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
	function highchart(fund_data,benchmark_data){
		Highcharts.stockChart('container', {
			exporting: { enabled: false },
			width: 1000,
			labels: {
			    align: 'left',
			    x: 0,
			    y: 0
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
       			backgroundColor: null,
		        borderWidth: 0,
		        shadow: false,
		        useHTML: true,
		        style: {
		            padding: 0
		        },
		        formatter: function() {
		            return '<b class="head">$' + ((this.y)/1000).toFixed().toString() + ',' + ((this.y)%1000).toString() + '</b> <br>' + Highcharts.dateFormat('%b %d, %Y', this.x);
		        }
            },
			yAxis: {
				min: 9000,
				max: 15000,
				opposite: false,
				labels: {
					formatter: function(){
						return "$" + ((this.value)/1000).toString() + ',000';
					}
				}
			},
			xAxis: {
				min: new Date('2015/1/22').getTime(),
				max: new Date('2017/5/22').getTime(),
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
							[0, '#c797d8'],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					marker: {
                    	fillColor: '#7a4684'
                	},
                	showInNavigator: true
				}, 
				{
					name: 'Benchmark',
					data: benchmark_data,
					color: "#6faadb",
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
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					marker: {
                    	fillColor: '#6faadb'
                	},
                	showInNavigator: true
				}
			]
		});
	}
});