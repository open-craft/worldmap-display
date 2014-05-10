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

var color = d3.scale.threshold()
    .domain([0, 1]) // TODO: Include more thresholds if needed
    .range(["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"]);

var rankColor = d3.scale.threshold()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range(["#bdc3c7", "#2ecc71", "#3498db", "#9b59b6", "#e74c3c", "#e67e22", "#f1c40f", "#c0392b", "#2980b9", "#27ae60", "#f39c12", "#d35400"]);

// Temporary stand in. To be replaced by preferred JSON receiving method (website, file, etc.)
var jsonString = '{"survey_qualtrics_id":"SV_123456789","statistics":[{"type":"mrq","title":"Types of health centers","average":3.746,"min":3.11,"max":5.41,"countries":{"unitedstates":4.86,"france":5.12, "canada":3.11, "mexico":4.21, "greenland":5.41}},{"type":"slider","title":"Number of hospitals within 10km","average":3.746,"countries":{"unitedstates":4.86,"france":5.12, "canada":3.11, "mexico":4.21, "greenland":5.43}},{"type":"rank","title":"Care provided","preferred":"At the hospital","countries":{"unitedstates":"Local doctor","france":"At the hospital", "canada":"At the hospital", "mexico":"Local doctor", "greenland":"At the hospital"}}]}';

// Create JSON object
var json = JSON.parse(jsonString);

/* Code to display text directly on map, if needed
svg.append("text")
    .attr("transform", "translate(" + 20 + "," + 350 + ")")
    .style("text-anchor", "left")
    .text(function(d) { return json.statistics[0].title; });
*/

// Used for rank color options
var rankObj = {};

// Get unique array elements while still supporting IE8 and later
Array.prototype.filter = function(fun, scope) {
    var T = this;
    var A = [];
    var i = 0;
    var itm;
    var L = T.length;
    if (typeof fun == 'function') {
        while (i < L) {
            if (i in T) {
                itm = T[i];
                if (fun.call(scope, itm, i, T)) A[A.length] = itm;
            }
            ++i;
        }
    }
    return A;
};

// Dynamically add dropdown options from JSON object
for (var s in json.statistics) {
    if ($.isNumeric(s)) {
        $(".worldmap-selector", element).append('<option value="' + s + '">' + json.statistics[s].title + '</option>');
    }
}

// Set color threshold min and max

function setMinMaxThreshold(min, max) {
    var thresholdArray = [];
    thresholdArray.push(min);
    var thresholdStep = (max - min) / 4;
    for (var i = 0; i <= 4; i++) {
        thresholdArray.push(thresholdArray[thresholdArray.length - 1] + thresholdStep);
    }

    color = d3.scale.threshold()
        .domain(thresholdArray)
        .range(["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837", "#00341b"]);
}

function updateColorThreshold(index) {
    if (json.statistics[index].min && json.statistics[index].max) {
        setMinMaxThreshold(json.statistics[index].min, json.statistics[index].max);
    } else {
        var countryValueArray = [];
        for (var countryValue in json.statistics[index].countries) {
            countryValueArray.push(json.statistics[index].countries[countryValue]);
        }

        setMinMaxThreshold(Math.min.apply(null, countryValueArray), Math.max.apply(null, countryValueArray));
    }
}

// Set color threshold upon load
updateColorThreshold(0);

// Logic for dropdown on selection

function selection(choice) {
    choiceElement = choice; // Set global var for use in the D3.js main function

    // Update color threshold on change
    updateColorThreshold(choice);

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
                var countryNameNoSpace = d.properties.name.replace(/\s+/g, ""); // Remove spaces
                var countryValue = json.statistics[choice].countries[countryNameNoSpace.toLowerCase()]; // Get country value from JSON
                if (countryValue && type != "rank") {
                    return color(countryValue); // Return corresponding color depending on country value
                }
                if (type == "rank") {
                    // If specific answer hasn't been found yet
                    if (!rankObj[countryValue]) {
                        // Set new specific color for answer
                        rankObj[countryValue] = rankColor(Object.keys(rankObj).length - 1);
                    }

                    return rankObj[countryValue];
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
        var countryNameNoSpace = d.properties.name.replace(/\s+/g, ""); // Remove spaces
        var countryValue = json.statistics[choiceElement].countries[countryNameNoSpace.toLowerCase()]; // Pull unique country value
        var overall;
        if (type == "mrq" || type == "slider") {
            overall = json.statistics[choiceElement].average;
        } else if (type == "rank") {
            overall = json.statistics[choiceElement].preferred;
        }

        var detailString;
        if (!countryValue) {
            detailString = "Specific country information unavailable";
        } else {
            detailString = d.properties.name + " is: " + countryValue;
        }

        var overallString;
        if (!overall) {
            overallString = "Overall information unavailable";
        } else {
            overallString = "The average is: " + overall;
        }

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
