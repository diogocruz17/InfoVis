function createScatterPlot() {
    // set the dimensions and margins of the graph
    // append the svg object to the body of the page
    var svg = d3.select("#scatterplot"),
    margin = { top: 10, right: 55, bottom: 35, left: 65 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    svg.style("margin-left", "50%")
        .style("margin-top", "-10%")

    var tooltip = d3.select("figure p")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "#000000")
        .style("background", "#FFFFFF")
        .style("font-family", "sans-serif")
        .style("font-size", "16")
        .text("Tooltip!");

    // Select the attributes to compare here
    var attr1 = "GDPpCapita"
    var attr2 = "Score"

    //Read the data
    data = d3.csv("./data/merged_data.csv", function(data) {
        data.sort(function(a, b) {
            return d3.ascending(a['Country'], b['Country']) || d3.descending(a['Year'], b['Year']);
        })

        var countries = new Set(data.map(d => d['Country']));
        var regionSet = new Set(data.map(d => d['Region']));
        var regions = Array.from(regionSet);


        var color = d3.scaleOrdinal()
            .domain(regions)
            .range(d3.schemeCategory10);

        var minYear = d3.min(data, d => +d['Year'])
        var maxYear = d3.max(data, d => +d['Year'])

        var results = []

        data.forEach(function(d) {
            d[attr1] = +d[attr1];
            d[attr2] = +d[attr2];

        });

        countries.forEach(function(c) {
            var country = data.filter(d => d['Country'] === c)

            var year1 = country.filter(d => +d['Year'] === minYear)
            var year2 = country.filter(d => +d['Year'] === maxYear)

            if (year1.length > 0 && year2.length > 0) { // A country must be present in both years
                var attr1Diff = year2[0][attr1] - year1[0][attr1]
                var attr2Diff = year2[0][attr2] - year1[0][attr2]
                results.push([c, attr1Diff, attr2Diff, year1[0], year2[0]])
            }
        });

        var maxAttr1 = d3.max(results, d => d[1])
        var minAttr1 = d3.min(results, d => d[1])
        var maxAttr2 = d3.max(results, d => d[2])
        var minAttr2 = d3.min(results, d => d[2])

        // Add X axis
        var x = d3.scaleLinear()
            .domain([Math.min(0, Math.floor(minAttr1)), Math.ceil(maxAttr1)])
            .range([0, width]);
        g.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .style("color", "#FFFFFF")
                .call(d3.axisBottom(x))
            .append("text")
                .attr("class", "axis-title")
                .attr("y", "-5%")
                .attr("x", "50%")
                .style("text-anchor", "end")
                .attr("fill", "#FFFFFF")
                .attr("font-size", "15")
                .text("Change in: " + attr1);
            

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([Math.min(0, Math.floor(minAttr2)), Math.ceil(maxAttr2)])
            .range([height, 0]);
        g.append("g")
                .attr("class", "axis")
                .call(d3.axisLeft(y).ticks(null, "s"))
                .append("text")
                    .attr("class", "axis-title")
                    .attr("transform", "rotate(-90)")
                    .attr("y", "5%")
                    .attr("x", "-15%")
                    .attr("dy", "0.32em")
                    .style("text-anchor", "end")
                    .attr("fill", "#FFFFFF")
                    .attr("font-size", "15")
                    .text("Change in: " + attr2);

        d3.selectAll(".axis .domain").attr("stroke", "#fff")
        d3.selectAll(".axis .tick line").attr("stroke", "#fff")
        d3.selectAll(".axis .tick text").attr("fill", "#fff").attr("font-size", "12")


        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(results)
            .enter()
            .append("circle")
            .attr("class", "country_info")
            .attr("cx", function (d) { return x(d[1]); } )
            .attr("cy", function (d) { return y(d[2]); } )
            .attr("r", 3)
            .style("fill", function (d) { return color(d[4]['Region']) })
            .text(function(d) { return d[0] })
            .on("mouseover", function() { 
                y1 = d3.select(this).data()[0][3];
                y2 = d3.select(this).data()[0][4];

                d3.select(this)
                    .attr("r", 10);
                tooltip.text(d3.select(this).text());
                tooltip.style("visibility", "visible");

                tooltip.append("text").html("<br>" + y1["Year"]);
                tooltip.append("text").html("<br>" + attr1 + ": " + y1[attr1]);
                tooltip.append("text").html("<br>" + attr2 + ": " + y1[attr2]);
                tooltip.append("text").html("<br><br>" + y2["Year"]);
                tooltip.append("text").html("<br>" + attr1 + ": " + y2[attr1]);
                tooltip.append("text").html("<br>" + attr2 + ": " + y2[attr2]);

                return
            })
            .on("mousemove", function(){
                return tooltip
                    .style("top", (+d3.select(this).attr("cy") - 100) + "px")
                    .style("left",(+d3.select(this).attr("cx") + 300) + "px");
            })
            .on("mouseout", function() { 
                d3.select(this).attr("r", 3);
                return tooltip.style("visibility", "hidden");
            })


        // Add a legend
        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 11)
            .attr("fill", "#fff")
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(regions)
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(20," + i * 25 + ")"; });

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });
    })
}