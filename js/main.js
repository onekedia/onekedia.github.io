$(function(){
	var fund_data = new Array();
	var	benchmark_data = new Array();
	var fund_value = 10000;
	var benchmark_value = 9000;
	$('#loading-image').show();
	$.getJSON('data.json',function(data){
		// set date available
		date_available = Highcharts.dateFormat('%b %d, %Y', new Date(Date.parse(data[0]['monthEndDate'])));
		$('.fund-start-date').html(date_available);
		// set year dropdown
		year_array = [];
		// end_year_array = [];
		$.each(data,function(i,year){
			c_month_fund = year['meNavMtd']* 100;
			fund_value = fund_value + c_month_fund;
			fund_data.push(new Array(Date.parse(year['monthEndDate']), fund_value));
			c_month_benchmark = year['returnMTD_me']* 100;
			benchmark_value = benchmark_value + c_month_benchmark;
			benchmark_data.push(new Array(Date.parse(year['monthEndDate']), benchmark_value));
			year_array.push(year['returnYear']);
		});
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
		for (i = 0; i < year_array.length; i+=1 ){
			$('#start-year').append("<option value=" + year_array[i] + ">" + year_array[i] + "</option>")
			$('#end-year').append("<option value=" + year_array[i] + ">" + year_array[i] + "</option>")
		}
		// Highchart Function
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
			    backgroundColor: '#FCFFC5',
			    borderColor: 'transparent',
			    borderRadius: 500,
			    borderWidth: 1,
			    useHTML: true,
                formatter: function() {
                        return "<div class='custom-tooltip'> <span> $"+ this.y + "</span></br>" + Highcharts.dateFormat('%b %d, %Y', this.x)
                        	+ "</div>"
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
	}).error(function(){
	}).complete(function(){
		$('#loading-image').hide();
		$('.chart').show();
	})
	;
});