

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
			console.log(d.name, geo_data)
			d.lat = geo_data[0].lat;
			d.lon = geo_data[0].lon;


			var amount_of_day = 7;
			var language = 'vi';
			var units = 'metric';
			var forecastUrl = `http://api.openweathermap.org/data/2.5/forecast/daily?lat=${d.lat}&lon=${d.lon}&appid=${this.apikey}&units=${units}&lang=${language}&cnt=${amount_of_day}`;
			var res = await fetch(forecastUrl);
			var data = await res.json();
			d.data = data.list
		}));
		this.load_svg()
		
	};


	constructor() {
		this.apikey = "b54ce71b1de11dfd1909564195966b51";
		this.json = null;
		this.load_data();
		this.date = 0;
		this.display_param = "" 

	}


	next_date(){
		this.date += 1
	}
	prev_date(){
		this.date -=1
	}


	load_svg() {
		var json = this.json;
		

		// The svg
		var svg = d3.select("#svg_1")
		var width = svg.attr("width");
		var height = svg.attr("height");

		var center = d3.geoCentroid(json)
		// center = [Math.round(center[0]),Math.round(center[1])]

		var scale = 3000;
		var offset = [width / 2, height / 2];



		var projection = d3.geoMercator()
			.scale(scale)
			.center(center)
			.translate(offset);
		var de_path = d3.geoPath().projection(projection)

		// console.log("provinces_data",provinces_data);
		// console.log("map_dat", json);
		json.features.forEach(d => {
			console.log(d)
			d.today_weather =  d.data[this.date]
		})
		svg.append("g")
			.selectAll("path")
			.data(json.features)
			.enter().append("path")
			.attr("d", de_path)
			.attr("name", d => d.vietnamese_name)
			.attr("day_temp", d => d.today_weather.feels_like.day)
			.attr("night_temp", d => d.today_weather.feels_like.night)
			.attr("eve_temp", d => d.today_weather.feels_like.eve)
			.attr("mor_temp", d => d.today_weather.feels_like.morn)
			.attr("fill", d => this.temp_color(d.today_weather.feels_like.day))
			.style("stroke", "#000")
			.attr("stroke-width", "0.2");

		var tooltip = d3.select("body")
			.append("div")
			.attr("class", "tooltip")
			.attr("id","tooltip")
			.style("position", "fixed")
			.style("visibility", "hidden")
			.style("top", "0")
			.style("right", "0");

		svg.selectAll("path")
			.on("mouseover", function(event) {
				
				// Show the tooltip
				tooltip.style("visibility", "visible");



				// Set the tooltip content
				tooltip.html("<h1>"+d3.select(this).attr("name") + "</h1><br><h2>Temperature</h2><br><h3>  Day: " + parseInt(d3.select(this).attr("day_temp")).toLocaleString() + "</h3><br><h3>  Night: " + parseInt(d3.select(this).attr("night_temp")).toLocaleString())+"</h3>";
				// tooltip.html("Country/Region: " );
			})
			.on("mouseout", function(d) {
				// Hide the tooltip
				tooltip.style("visibility", "hidden");
			});
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

demo_object = new weather_class();