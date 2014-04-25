/* map.js */

var width = 1000,
    height = 700;

var countries; // Global var
var choiceElement = 0;

var projection = d3.geo.equirectangular(),
    color = d3.scale.category20();

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var divTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var color = d3.scale.threshold()
    .domain([3, 4, 4.5, 5, 5.5]) // TODO: Include more thresholds if needed
    .range(["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"]);

var rankColor = d3.scale.threshold()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range(["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e74c3c", "#e67e22", "#f1c40f", "#c0392b", "#2980b9", "#27ae60", "#f39c12", "#d35400"]);

// Temporary stand in. To be replaced by preferred JSON receiving method (website, file, etc.)
var jsonString = '{"survey_qualtrics_id":"SV_123456789","statistics":[{"type":"mrq","title":"Types of health centers","average":3.746,"countries":{"unitedstates":4.86,"france":5.12, "canada":3.11, "mexico":4.21, "greenland":5.41}},{"type":"slider","title":"Number of hospitals within 10km","average":3.746,"countries":{"unitedstates":4.86,"france":5.12, "canada":3.11, "mexico":4.21, "greenland":5.43}},{"type":"rank","title":"Care provided","preferred":"At the hospital","countries":{"unitedstates":"Local doctor","france":"At the hospital", "canada":"At the hospital", "mexico":"Local doctor", "greenland":"At the hospital"}}]}';

// Create JSON object
var json = JSON.parse(jsonString);

// Dynamically add dropdown options from JSON object
$(function() {
	for (var element in json.statistics)
	{
		$("#selector").append('<option value="' + element + '">' + json.statistics[element].title + '</option>');
	}	
});

// Logic for dropdown on selection
function selection(choice) {
	//console.log(choice);
	choiceElement = choice; // Set global var for use in the D3.js main function

	var type = json.statistics[choice].type; // Used to store type (slider, rank, etc.)

	svg.selectAll(".country")
      .data(countries)
      .style("fill", function(d) { 
      		if (d.properties.name) // Ignore undefined
      		{
      			var countryNameNoSpace = d.properties.name.replace(/\s+/g, ""); // Remove spaces
      			var countryValue = json.statistics[choice].countries[countryNameNoSpace.toLowerCase()]; // Get country value from JSON
      			if (countryValue && type != "rank")
      			{
      				return color(countryValue); // Return corresponding color depending on country value
      			}
      		}

      		if (type == "rank")
      		{
      			return rankColor(Math.random() * (9 - 0) + 0);
      			//.style("fill", function(d, i) { return color(d.color = d3.max(neighbors[i], function(n) { return countries[n].color; }) + 1 | 0); });
      		}
      		
      		return color(Math.random() * (5.4 - 3) + 3); // TODO: Remove this stand-in for countries without JSON data yet
      });
}

function mouseover() {
  	divTooltip.transition()
      .duration(500)
      .style("opacity", 0.75);
}

function mousemove(country, detail, total) {
  	divTooltip
      .html("<h3>" + country + "</h3><h4>" + detail + "<br/>" + total + "</h4>") // Display detailed hover info
      .style("left", (d3.event.pageX + 20) + "px")
      .style("top", (d3.event.pageY - 40) + "px");
}

function mouseout() {
  	divTooltip.transition()
      .duration(20)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 40) + "px")
      .style("opacity", 0);
}

// Main D3.js function
d3.json("world.json", function(error, world) {
  countries = topojson.feature(world, world.objects.countries).features; // Load TopoJSON object

  svg.selectAll(".country")
      .data(countries)
    .enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d) { 
      	if (d.properties.name) // Ignore undefined
      		{
      			var countryNameNoSpace = d.properties.name.replace(/\s+/g, ""); // Remove spaces
      			var countryValue = json.statistics[choiceElement].countries[countryNameNoSpace.toLowerCase()]; // Pull unique country value from JSON object
      			if (countryValue)
      			{
      				return color(countryValue); // Return corresponding color depending on country value
      			}
      		}
      		
      		return color(Math.random() * (5.4 - 3) + 3); // TODO: Remove stand-in for countries without JSON data yet 
      })
      .on("mouseover", mouseover)
      .on("mousemove", function(d) { 

      	var type = json.statistics[choiceElement].type;
      	var countryNameNoSpace = d.properties.name.replace(/\s+/g, ""); // Remove spaces
      	var countryValue = json.statistics[choiceElement].countries[countryNameNoSpace.toLowerCase()]; // Pull unique country value
      	if (type == "mrq" || type == "slider")
      	{
      		// Pass hover information for mrq and slider types
      		mousemove(d.properties.name, d.properties.name + " is: " + countryValue, "The average is: " + json.statistics[choiceElement].average); 
      	}
      	else if(type == "rank")
      	{
      		// Pass hover information for rank type
      		mousemove(d.properties.name, d.properties.name + " is: " + countryValue, "The overall preferred is: " + json.statistics[choiceElement].preferred); 
      	}
      	else // Default catch for unexpected type
      	{
      		mousemove(d.properties.name, " ");
      	}
      })
      .on("mouseout", mouseout);
});
