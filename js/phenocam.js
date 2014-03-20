jQuery.extend({
	parseQuerystring: function() {
		var nvpair = {};
		var qs = window.location.search.replace('?', '');
		var pairs = qs.split('&');
		$.each(pairs, function(i, v) {
			var pair = v.split('=');
			nvpair[pair[0]] = pair[1];
		});
		return nvpair;
	}
});

$(document).ready(function() {
	var qs = $.parseQuerystring();
	if (qs.hasOwnProperty('site')) {
		var site = qs.site;
	}
	else {
		var site = "Marena";
	}
	$('#sitename').html("<h1>" + site + "</h1>")

	var catalog = "http://production.cybercommons.org/catalog/db_find/eomf_phenocam/data/";
	var query = JSON.stringify({
		"spec": {
			"site": site
		},
		"fields": ["date", "url"],
		"limit": 6,
		"sort": [["date", - 1]]
	});

	function getThumbs() {
		$.getJSON(catalog + query + "?callback=?", function(images) {

			$.each(images.reverse(), function(i) {
				d = new Date(this.date);
				$('#thumbs').append('<div class="thumbcontainer" ><img class="thumbnail" style="float:left;" id="t' + i + '" src="' + this.url + '" width=100 height=75/><div class="thumbmeta">' + (d.getUTCMonth() + 1) + '/' + d.getUTCDate() + ' ' + d.getUTCHours() + ':' + d.getUTCMinutes() + '</div></div>')
			});

			$(".thumbnail").click(function() {
				$('img').removeClass("selected");
				var imgsrc = $(this).attr('src');
				$("#fullsize").attr('src', imgsrc);
				$(this).addClass("selected");
			});
			$('#t5').click();

		});
	}

	getThumbs();

	function getGCC() {
		var outData = [];
		var outList = [];
		var query = {
			spec: {
				site: site
			},
			fields: ['brightness', 'date', 'url']
		};
		var plotdata = "http://production.cybercommons.org/catalog/db_find/eomf_phenocam/data/" + JSON.stringify(query);
		$.getJSON(plotdata + "?callback=?", function(data) {
			//console.log(data); 
			$.each(data, function(i, item) {
				if (new Date(item['date']).getUTCHours() == 13) {
					outList.push([new Date(item['date']), item.brightness.g / (item.brightness.g + item.brightness.b + item.brightness.r), item.url])
					outData.push({
						x: new Date(item['date']),
						y: item.brightness.g / (item.brightness.g + item.brightness.b + item.brightness.r),
						url: item.url,
                                                isodate:  new Date(item['date']).toISOString()
					});
				}
			});
			//console.log(outData);
			//plotgcc(outList);
			plotgccd3([{
				values: outData,
				key: "GCC",
				color: "#ff7f0e"
			}]);
                        $("#csv").click(function() { 
                                var csvdata = JSON2CSV(outData); 
                                window.open("data:text/csv;charset=utf-8," + escape(csvdata));
                            });
			console.log([{
				values: outData,
				key: "GCC",
				color: "#ff7f0e"
			}])
		});
	}

	function plotgcc(outData) {

		$('#plot').bind("plotclick", function(event, pos, item) {
			$("#fullsize").attr('src', outData[item.dataIndex][2]);
		});

		$.plot($('#plot'), [outData], {
			xaxis: {
				label: "gcc",
				mode: 'time',
				min: new Date(2012, 5, 15).getTime()
			},
			grid: {
				hoverable: true,
				clickable: true
			}
		});

	}

	function plotgccd3(outData) {

		nv.addGraph(function() {
			chart = nv.models.lineWithFocusChart({
				tooltips: false
			});

			chart.xAxis.axisLabel('Date').tickFormat(function(d) {
				return d3.time.format('%x')(new Date(d))
			});

			chart.yAxis.axisLabel('Green Chromatic Color (gcc)').tickFormat(d3.format(',.2f'));

			chart.x2Axis.tickFormat(function(d) {
				return d3.time.format('%x')(new Date(d))
			});

			chart.y2Axis.tickFormat(d3.format(',.2f'));

			d3.select('#chart svg').datum(outData).call(chart);

			nv.utils.windowResize(function() {
				d3.select('#chart svg').call(chart)
			});

			chart.lines.dispatch.on('elementClick', function(e) {
				$("#fullsize").attr('src', e.point.url);
			});

			return chart

		});
	};

	getGCC();

});

