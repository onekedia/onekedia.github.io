

	setTimeout(function() {

		(function($){

			

			KURTOSYS.timeSeriesURL = 'https://api.kurtosys.io//timeseries/get?entityids=[107658231,107645425,107645439]&propertyids=[40379157]&periodtypeid=[155450411]&clientid=105272942&verbosity=0&utcdate=1&filterdateon=datefrom&startdate=19400101&enddate&rebasevalue={{rebase}}&currencyid=3765&_api_key=2BAE1BC8-A7E0-4F6F-B756-00B50B712BF4&_user_token=2D973F66-6CE0-4B49-B10D-CCA56B1BEFBC';

			var chart;
			var numberFormat = '0,0.00';

			numeral.language('customNumberFormat', {"delimiters":{"thousands":",","decimal":"."},"abbreviations":{"thousand":"k","million":"M","billion":"Bn","trillion":"t"}});
			numeral.language('customNumberFormat');


			var ChartConfig = {
				alignTicks: true,
				reflow: true,
				renderTo: '',
				exporting: { enabled: false },
				credits: {
					enabled: false
				},
				chart: {
					marginLeft: 0,
					marginRight: 0,
					width: null,
					height: 600,
					borderWidth: 5,
					borderColor: '#fefefe',
					plotBorderWidth: 2,
					events: {
						load: function () {
							setTimeout(function() {
								$(window).resize();
							});
						}
					}
				},
				rangeSelector: {
					enabled: true
				},
				colors: [
					'#5E8AB4',
					'#E98100',
					'#543017'
				],
				title: {
					text: ''
				},
				subtitle: {
					text: ''
				},
				xAxis: {
					tickInterval: 30 * 24 * 3600 * 1000, // monthly intervals
					minTickInterval: 28 * 24 * 3600 * 1000, // monthly intervals
					maxTickInterval: 31 * 24 * 3600 * 1000, // monthly intervals
					events: {
						setExtremes: function(e) {
							KURTOSYS.rebaseChart(KURTOSYS.stripFormatting($('#w315__m-chart-rebase-initial-investment').val()));
						},
						afterSetExtremes: function(e){
							KURTOSYS.rebaseChart(KURTOSYS.stripFormatting($('#w315__m-chart-rebase-initial-investment').val()));

							var chart = $('.w315__m-chart--chart').highcharts();

							var getData = function(data, min, max){
								var retArray = [];

								_.forIn(data, function(item, key){
									if(data[key].x >= min && data[key].x <= max + 10){
										retArray.push(data[key]);
									}
								});

								return { data: retArray };
							};

							var d1 = getData(KURTOSYS.chart.originalSeries[0].data, e.min, e.max);

							var first = _.get(_.first(_.get(d1,['data'])),['x']) || e.min;
							var last = _.get(_.last(_.get(d1,['data'])),['x']) || e.max;

							$('.w315__m-chart--controls-year:eq(0) select').val(moment(first).format('YYYY'));
							$('.w315__m-chart--controls-month:eq(0) select').val(moment(first).format('MM'));

							$('.w315__m-chart--controls-year:eq(1) select').val(moment(last).format('YYYY'));
							$('.w315__m-chart--controls-month:eq(1) select').val(moment(last).format('MM'));

							$('.w315__m-chart-info .performanceValue').html(numeral(e.target.series[0].dataMax).format(numberFormat) + '%');

							

							

							// KURTOSYS.chart.extremes = d1;
							chart.series[0].setData(d1.data);

							var perfMax = _.get(_.last(_.get(chart, ['series', 0, 'data']), function(datapoint) { return datapoint.change; }), 'change');
							$('.w315__m-chart-info .performanceValue').html(numeral(perfMax).format(numberFormat) + '%');

							

							
						}
					},

					type: 'datetime',
					title: {
						enabled: true
					},
					labels: {
						formatter: function() {

							// remove first and last times due to formatting issue in highcharts // see JPP-687
							return Highcharts.dateFormat('%b \'%y', new Date(this.value)); // format numbers
						},
						style: {
							'fontFamily': 'AmplitudeLight',
							'textTransform': 'uppercase'
						}
					},
					minPadding: 0,
					startOnTick: true,
					endOnTick: true,
					lineWidth: 0,
					minorGridLineWidth: 0,
					lineColor: 'transparent',
					ordinal: true,
					tickPositioner: function() {
						var ticks = [];

						for (var i = 0; i < this.tickPositions.length; i++) {
							ticks.push(this.tickPositions[i] - (24 * 3600 * 1000));
						}

						var firstMonth = moment(ticks[0]).format('M');
						var months = [];
						for(var i = 1; i < ticks.length; i++){
							var month = moment(ticks[i]).format('M');
							if(firstMonth == month){
								break;
							}
							months.push(month);
						}

						var lastTick = moment(ticks[ticks.length-1]).format('M');
						if(months.indexOf(lastTick) == -1){
							ticks.pop();
						}

						return ticks;
					}
				},
				yAxis: {
					title: {
						text: ' '
					},
					events: {
						afterSetExtremes: function(e) {
							KURTOSYS.rebaseChart(KURTOSYS.stripFormatting($('#w315__m-chart-rebase-initial-investment').val()));
						}
					},
					tickmarkPlacement: 'on',
					labels: {
						align: 'left',
						x: 2,
						y: -2,
						formatter: function() {
							
							var val = parseInt(KURTOSYS.stripFormatting($('#w315__m-chart-rebase-initial-investment').val()));
							val += (parseInt(this.value) * (val / 100));
							val = KURTOSYS.formatDollarText(val);
							return val.split('.')[0];
							
						},
						style: {
							'fontFamily': 'AmplitudeLight',
							'textTransform': 'uppercase'
						}
					},
					opposite: false,
					startOnTick: true,
					endOnTick: true,
					showFirstLabel: true
				},
				tooltip: {
					
					formatter: function() {
						var p = this.points[0].point.change;
						var val = parseInt(KURTOSYS.stripFormatting($('#w315__m-chart-rebase-initial-investment').val()));
						p = KURTOSYS.calculateChange(val, p);

						var dformat = 'MM/DD/YYYY';

						var ret; // return value
						var b; // benchmark value
						var s; // shareprice value

						
						ret = '<b>'+this.points[0].series.name + '<b><br>' + moment(this.points[0].x).format(dformat) + ', ' + KURTOSYS.formatDollarText(p);
						


						

						return ret;
					}
					
				},
				legend: {
					enabled: false,
					borderColor: '#ffffff',
					itemStyle: {
						cursor: 'pointer',
						color: '#6d6e71',
						fontFamily: '"AmplitudeLight"',
						fontSize: '14px',
						padding: '0 10px'
					}
				},
				style: {
					fontFamily: '"AmplitudeLight"',
					fontSize: '14px',
					color: '#6d6e71'
				},
				plotOptions: {
					area: {
						fillColor: 'none',
						lineWidth: 2,
						marker: {
							enabled: false,
							states: {
								hover: {
									enabled: true,
									radius: 5
								}
							}
						},
						shadow: false,
						states: {
							hover: {
								lineWidth: 4
							}
						}
					},
					series: {
						compare: 'percent'
					}
				},
				navigator: {
					adaptToUpdatedData: false,
					height: 80,
					xAxis: {
						labels: {
							style: {
								'fontFamily': 'AmplitudeLight'
							}
						}
					}
				},
				rangeSelector: {
					// inputEnabled: false,
					allButtonsEnabled: false,
					buttons: [],
					inputDateFormat: '%Y-%m-%d'
				},
				series: [],
				scrollbar: {
					liveRedraw: false
				}

			}
			