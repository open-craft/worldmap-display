(function(element) {

var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);
    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();

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
    .attr("height", height)
    .attr("id", "world-map")
    .attr("viewBox", "0 0 1000 485")
    .attr("preserveAspectRatio", "xMidYMid");

var color = d3.scale.linear()
    .range(["#e4efd3", "#c2e699", "#78c679", "#31a354", "#006837"]);

var rankColors = ["#2ecc71", "#3498db", "#9b59b6", "#e74c3c", "#e67e22", "#f1c40f",
                  "#c0392b", "#2980b9", "#27ae60", "#f39c12", "#d35400"];
var assignedRankColors = {};
var rankColorsIndex = 0;

// Responsive worldmap
var ratio = 1000/485;
var worldmap = $("#world-map", element);
function on_resize() {
    var width = worldmap.parent().width();
    worldmap.attr("width", width);
    worldmap.attr("height", width/ratio);
    $(".tooltip", element).css('max-width', width/2 + "px");
    $('.worldmap-selector').trigger('update');
}
$(window).on("resize", on_resize);
on_resize();

var json;

function round(num) {
    return Math.round(num * 100) / 100;
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

    var overall = "Global: ";
    if (type == "mrq" || type == "slider") {
        overall += round(json.statistics[choice].average);
    } else if (type == "rank") {
        overall += json.statistics[choice].top;
    }

    $(".worldmap-global", element).text(overall);

    svg.selectAll(".country")
        .data(countries)
        .style("fill", function(d) {
            if (d.properties.name) // Ignore undefined
            {
                // Get country value from JSON
                var countryValue = json.statistics[choice].countries[d.properties.name];
                if (countryValue !== undefined && type != "rank") {
                    // Return corresponding color depending on country value
                    return color(countryValue);
                } else if (countryValue !== undefined && type == "rank") {
                    // Set new specific color for answer, if not yet encountered
                    if (!assignedRankColors[countryValue]) {
                        assignedRankColors[countryValue] = rankColors[rankColorsIndex++];
                    }
                    if (!assignedRankColors[countryValue]) {
                        assignedRankColors[countryValue] = "hsl("+ Math.random()*360 + ",100%,50%)";
                    }

                    return assignedRankColors[countryValue];
                }
            }

            // Default to gray
            return "#bdc3c7";
        }).style("cursor", function(d) {
            if (d.properties.name)
                return "pointer";
            return "auto";
        });
}

function mouseover() {
    d3.select(element).selectAll(".tooltip")
        .transition()
        .duration(500)
        .style("opacity", 0.75);
}

function mousemove(d) {
    if (d.properties.name) {
        var type = json.statistics[choiceElement].type;
        // Pull unique country value
        var countryValue = json.statistics[choiceElement].countries[d.properties.name];

        var detailString;
        if (countryValue === undefined) {
            detailString = "N/A";
        } else if (type !== "rank") {
            detailString = round(countryValue);
        } else {
            detailString = countryValue;
        }

        $(".tooltip .country-name", element).text(d.properties.name);
        $(".tooltip .country-detail", element).text(detailString);
        $(".tooltip", element).css("left", (d3.event.pageX + 20) + "px");
        $(".tooltip", element).css("top", (d3.event.pageY - 40) + "px");

        // Compensate for tooltip overflowing view window.
        var tooltipWidth = $(".tooltip", element).width();
        if ((d3.event.pageX + tooltipWidth + 20) > worldmap.parent().width()) {
            $(".tooltip", element).css("left", (d3.event.pageX - tooltipWidth - 20) + "px");
        }
    }
}

function mouseout() {
    d3.select(element).selectAll(".tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0);
}

function countryclick(d) {
    if (d.properties.name) {
        $(".worldmap-map-view", element).hide(0, function() {
            $(".country-title", element).text(d.properties.name);

            $(".custom-html").empty();
            if (json.country_messages[d.properties.name]) {
                $(".custom-html").html(json.country_messages[d.properties.name]);
            }

            $(".country-stats", element).empty();
            for (var i = 0; i < json.statistics.length; i++) {
                if (d.properties.name in json.statistics[i].countries) {
                    var name, value, type, overall;
                    name = json.statistics[i].title;
                    value = json.statistics[i].countries[d.properties.name];
                    type = json.statistics[i].type;
                    if (type == "mrq" || type == "slider") {
                        overall = round(json.statistics[i].average);
                    } else if (type == "rank") {
                        overall = json.statistics[i].top;
                    }

                    $(".country-stats", element).append($('<tr>')
                        .append($('<td>', {
                            text: name,
                            "class": "stat-name"
                        }))
                        .append($('<td>', {
                            text: value,
                            "class": "stat-value"
                        }))
                        .append($('<td>', {
                            text: '[Global: ' + overall + ']',
                            "class": "stat-global"
                        }))
                    );
                }
            }

            $(".worldmap-country-view", element).show();
        });
    }
}

$(".worldmap-country-view .back", element).click(function() {
    $(".worldmap-country-view", element).hide(0, function() {
        $(".worldmap-map-view", element).show();
    });
});

// Main D3.js function
function d3_main(error, world) {
    // Load TopoJSON object
    countries = topojson.feature(world, world.objects.countries).features;

    svg.selectAll(".country")
        .data(countries)
        .enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("click", countryclick);

    selection(choiceElement);
}

$('.worldmap-selector').selectmenu({customClass:'worldmap-selector-custom'});

$.getJSON(urlParams["json"], function(data) {
    json = data;
    // Dynamically add dropdown options from JSON object
    for (var s in json.statistics) {
        if ($.isNumeric(s)) {
            $('<option>', {
                text: json.statistics[s].title,
                value: s,
            }).appendTo("select.worldmap-selector", element);
        }
    }
    $('.worldmap-selector').trigger('update');
    d3.json("world.json", d3_main);
});

$('.worldmap-selector', element).on("selectmenuchange", function() {
    selection(this.value);
});

})($('.worldmap-display')[0]);
