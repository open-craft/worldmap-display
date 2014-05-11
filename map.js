(function(element) {

var width = 1000,
    height = 485;

var countries; // Global var
var choiceElement = 0;

var projection = d3.geo.equirectangular();

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(element)
    .selectAll(".worldmap-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var divTooltip = d3.select(element)
    .selectAll(".worldmap-map")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var color = d3.scale.linear()
    .range(["#e4efd3", "#c2e699", "#78c679", "#31a354", "#006837"]);

var rankColors = ["#2ecc71", "#3498db", "#9b59b6", "#e74c3c", "#e67e22", "#f1c40f", "#c0392b", "#2980b9", "#27ae60", "#f39c12", "#d35400"];
var assignedRankColors = {};
var rankColorsIndex = 0;

// Create JSON object
var json = JSON.parse(AtlasJSONData);

/* Code to display text directly on map, if needed
svg.append("text")
    .attr("transform", "translate(" + 20 + "," + 350 + ")")
    .style("text-anchor", "left")
    .text(function(d) { return json.statistics[0].title; });
*/

// Dynamically add dropdown options from JSON object
for (var s in json.statistics) {
    if ($.isNumeric(s)) {
        $(".worldmap-selector", element).append('<option value="' + s + '">' + json.statistics[s].title + '</option>');
    }
}


function selection(choice) {
    choiceElement = choice; // Set global var for use in the D3.js main function

    if (type != "rank") {
        // Update color domain on change
        var domainArray = [];
        step = (json.statistics[choice].max - json.statistics[choice].min) / 4.0;
        for (var i = 0; i <= 4; i++) {
            domainArray.push(json.statistics[choice].min + step * i);
        }
        color = color.domain(domainArray);
    }

    var type = json.statistics[choice].type; // Used to store type (slider, rank, etc.)

    // Update selection title
    $('.worldmap-title', element).text(json.statistics[choice].title);

    /* Code to update text displayed directly on map, if needed
    svg.selectAll("text")
        .attr("class", "title")
        .style("text-anchor", "left")
        .text(function(d) { return json.statistics[choice].title; });
    */

    svg.selectAll(".country")
        .data(countries)
        .style("fill", function(d) {
            if (d.properties.name) // Ignore undefined
            {
                var countryValue = json.statistics[choice].countries[d.properties.name]; // Get country value from JSON
                if (countryValue !== undefined && type != "rank") {
                    return color(countryValue); // Return corresponding color depending on country value
                } else if (countryValue !== undefined && type == "rank") {
                    // Set new specific color for answer, if not yet encountered
                    if (!assignedRankColors[countryValue]) {
                        assignedRankColors[countryValue] = rankColors[rankColorsIndex++];
                    }

                    return assignedRankColors[countryValue];
                }
            }

            // Default to gray
            return "#bdc3c7";
        });
}

function mouseover() {
    divTooltip.transition()
        .duration(500)
        .style("opacity", 0.75);
}

function mousemove(d) {
    if (d.properties.name) {
        var type = json.statistics[choiceElement].type;
        var countryValue = json.statistics[choiceElement].countries[d.properties.name]; // Pull unique country value
        var overall;
        if (type == "mrq" || type == "slider") {
            overall = json.statistics[choiceElement].average;
        } else if (type == "rank") {
            overall = json.statistics[choiceElement].top;
        }

        var detailString;
        if (countryValue === undefined) {
            detailString = "Specific country information unavailable";
        } else {
            detailString = d.properties.name + " is: " + countryValue;
        }

        var overallString = "The average is: " + overall;

        divTooltip
        // Display detailed hover info
            .html("<h3>" + d.properties.name + "</h3><h4 class='countryDetail'>" + detailString + "</h4><h4 class='countryAverage'>" + overallString + "</h4>")
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 40) + "px");
    }
}

function mouseout() {
    divTooltip.transition()
        .duration(200)
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
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    selection(choiceElement);
});

$('.worldmap-selector', element).change(function() {
    selection(this.value);
});

})($('.worldmap-display')[0]);
