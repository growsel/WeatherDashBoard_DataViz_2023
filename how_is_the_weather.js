

class weather_class {

	async load_data() {

		this.json = await d3.json("https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn-provinces.json")
		// this.load_weather()
		// for (const d in this.json.features){

		await Promise.all(this.json.features.map(async (d) => {
			d.name = d.properties.Name.replace(" Province", "").replace("City", "");
			if (d.name == 'Dak Lak'){
				d.name = "Buon Ma Thuot"
				// console.log(d.name)
			}
			if (d.name == 'Nghe An'){
				d.name = "Vinh"
				// console.log(d.name)

			}
			if (d.name == 'Thua Thien Hue'){
				d.name = "Hue"
				// console.log(d.name)
				
			}
			if (d.name == 'Ba Ria - Vung Tau'){
				d.name = "Vung Tau"
				// console.log(d.name)
				
			}
			if (d.name == 'An Giang'){
				d.name = "Chau Doc"
				// console.log(d.name)
				
			}
			if (d.name == 'Hau Giang'){
				d.name = "Can Tho"
				// console.log(d.name)
				
			}
			if (d.name == 'Quang Ninh'){
				d.name = "Ha Long"
				// console.log(d.name)
				
			}
			if (d.name == 'Dong Thap'){
				d.name = "Cao Lanh"
				// console.log(d.name)
				
			}

			d.vietnamese_name = d.properties.Ten;
			// console.log(d.name)
			d.country_code = "VN"
			var geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${d.name},${d.country_code}&limit=1&appid=${this.apikey}`
			var geo_res = await fetch(geoUrl);
			var geo_data = await geo_res.json();
			// console.log(d.name, geo_data)
			d.lat = geo_data[0].lat;
			d.lon = geo_data[0].lon;


			
			var forecastUrl = `http://api.openweathermap.org/data/2.5/forecast/daily?lat=${d.lat}&lon=${d.lon}&appid=${this.apikey}&units=${this.units}&lang=${this.language}&cnt=${this.amount_of_day}`;
			var res = await fetch(forecastUrl);
			var data = await res.json();
			d.data = data.list
		}));
		this.load_map()
		
	};


	constructor() {
		this.apikey = "b54ce71b1de11dfd1909564195966b51";
		this.json = null;
		this.load_data();
		this.date = 0;
		this.display_param = "" 
		this.amount_of_day = 16;
		this.language = 'en';
		this.units = 'metric';

		var map_svg = d3.select("#map_svg")
		this.map_width = map_svg.attr("width");
		this.map_height = map_svg.attr("height");

		this.zoom = d3.zoom()
			.scaleExtent([1, 5])
			.translateExtent([[0, 0], [this.map_width, this.map_height]])
			.on('zoom', this.handleZoom);

		d3.select('#map_svg')
			.call(this.zoom);
		

		// function 
	}


	next_date(){
		if(this.date < (this.amount_of_day - 1)){
			this.date +=1;
			document.getElementById("date_select").selectedIndex = `${this.date}`;
			this.reload_map();
		}
	}
	prev_date(){
		if(this.date >= 1){
			this.date -=1;
			document.getElementById("date_select").selectedIndex = `${this.date}`;
			this.reload_map();
		}
	}
	set_date(){
		let input_int = parseInt(document.getElementById("date_select").value);
		if(input_int >= 0 && input_int <= (this.amount_of_day - 1) ){
			this.date = input_int;
			console.log(this.date);
			this.reload_map();
		}
	}

	handleZoom(e) {
		d3.select('#the_map')
			.attr('transform', e.transform);
	}

	zoomIn() {
		d3.select('svg')
			.transition()
			.call(this.zoom.scaleBy, 2);
	}

	zoomOut() {
		d3.select('svg')
			.transition()
			.call(this.zoom.scaleBy, 0.5);
	}

	resetZoom() {
		d3.select('svg')
			.transition()
			.call(this.zoom.scaleTo, 1);
	}

	center() {
		d3.select('svg')
			.transition()
			.call(this.zoom.translateTo, 0.5 * this.map_width, 0.5 * this.map_height);
	}

	panLeft() {
		d3.select('svg')
			.transition()
			.call(this.zoom.translateBy, -50, 0);
	}
	
	panRight() {
		d3.select('svg')
			.transition()
			.call(this.zoom.translateBy, 50, 0);
	}
	panUp() {
		d3.select('svg')
			.transition()
			.call(this.zoom.translateBy, 0, 50);
	}
	panDown() {
		d3.select('svg')
			.transition()
			.call(this.zoom.translateBy, 0, -50);
	}

	load_map() {
		var json = this.json;
		

		var svg = d3.select("#map_svg")
		var width = svg.attr("width");
		var height = svg.attr("height");

		var center = d3.geoCentroid(json)
		// center = [Math.round(center[0]),Math.round(center[1])]

		var scale = height*3;
		
		var offset = [width / 2, height / 2];



		var projection = d3.geoMercator()
			.scale(scale)
			.center(center)
			.translate(offset);
		var de_path = d3.geoPath().projection(projection)

		// console.log("provinces_data",provinces_data);
		// console.log("map_dat", json);
		json.features.forEach(d => {
			// console.log(d)
			d.today_weather =  d.data[this.date]
			if (d.today_weather.rain){

			} else {
				d.today_weather.rain = "N/A"
			}
		})
		svg.append("g")
			.attr("id","the_map")
			.selectAll("path")
			.data(json.features)
			.enter().append("path")
			.attr("d", de_path)
			.attr("name", d => d.vietnamese_name)
			.attr("day_temp", d => d.today_weather.feels_like.day)
			.attr("night_temp", d => d.today_weather.feels_like.night)
			.attr("eve_temp", d => d.today_weather.feels_like.eve)
			.attr("mor_temp", d => d.today_weather.feels_like.morn)
			.attr("humidity", d => d.today_weather.humidity)
			.attr("weather", d => d.today_weather.weather.description)
			.attr("rain_prob", d => d.today_weather.pop)
			.attr("cloud", d => d.today_weather.clouds)
			.attr("rain", d => d.today_weather.rain)
			.attr("fill", d => this.temp_color(d.today_weather.feels_like.day))
			.style("stroke", "#000")
			.attr("stroke-width", "0.2");

		var tooltip = d3.select(".tooltip")
			// .append("div")
			// .attr("class", "tooltip")
			// .attr("id","tooltip")
			// .style("position", "fixed")
			// .style("visibility", "hidden")
			// .style("top", "0")
			// .style("right", "0");

		svg.selectAll("path")
			.on("mouseover", function(event) {
				
				// Show the tooltip
				tooltip.style("visibility", "visible");


				// Set the tooltip content
				tooltip.html("<h1>"+d3.select(this).attr("name") + "</h1><h2>Temperature</h2><h3>  Day: " + parseInt(d3.select(this).attr("day_temp")).toLocaleString() + "</h3><h3>  Rain: " + d3.select(this).attr("rain"))+"</h3>";
				// tooltip.html("Country/Region: " );
			})
			.on("mouseout", function(d) {
				// Hide the tooltip
				tooltip.style("visibility", "hidden");
			});
	};

	reload_map() {
		var json = this.json;
		

		// The svg
		var svg = d3.select("#map_svg")
		var width = svg.attr("width");
		var height = svg.attr("height");

		var center = d3.geoCentroid(json)
		// center = [Math.round(center[0]),Math.round(center[1])]

		var scale = height*3;
		
		var offset = [width / 2, height / 2];



		var projection = d3.geoMercator()
			.scale(scale)
			.center(center)
			.translate(offset);
		var de_path = d3.geoPath().projection(projection)

		// console.log("provinces_data",provinces_data);
		// console.log("map_dat", json);
		json.features.forEach(d => {
			// console.log(d)
			d.today_weather =  d.data[this.date]
			if (d.today_weather.rain){

			} else {
				d.today_weather.rain = "N/A"
			}
		})
		var the_map = d3.select("#the_map");
		the_map.selectAll("path")
			.data(json.features)
			.join("path")
			.attr("d", de_path)
			.attr("name", d => d.vietnamese_name)
			.attr("day_temp", d => d.today_weather.feels_like.day)
			.attr("night_temp", d => d.today_weather.feels_like.night)
			.attr("eve_temp", d => d.today_weather.feels_like.eve)
			.attr("mor_temp", d => d.today_weather.feels_like.morn)
			.attr("humidity", d => d.today_weather.humidity)
			.attr("weather", d => d.today_weather.weather.description)
			.attr("rain_prob", d => d.today_weather.pop)
			.attr("cloud", d => d.today_weather.clouds)
			.attr("rain", d => d.today_weather.rain)
			.attr("fill", d => this.temp_color(d.today_weather.feels_like.day))
			.style("stroke", "#000")
			.attr("stroke-width", "0.2");

		

		
	};

	temp_color(input_number) {
		if (input_number > 41) {
			return "#a60000";
		}
		if (input_number > 35.1) {
			return "#cf2929";
		}
		if (input_number > 29.1) {
			return "#ea5d45";
		}
		if (input_number > 23.1) {
			return "#f79d54";
		}
		if (input_number > 18.1) {
			return "#fcde69";
		}
		if (input_number > 13.1) {
			return "#cdfe6d";
		}
		if (input_number > 8.1) {
			return "#69fd61";
		}
		if (input_number > 4.1) {
			return "#88f0ca";
		}
		if (input_number > 0) {
			return "#87c2f3";
		} else {
			return "#6675da";
		}
	};
}

