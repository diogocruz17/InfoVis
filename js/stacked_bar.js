function createStackedBar(inputFile) {

    // Select the html element and assign the neccesary variables
    var svg = d3.select('#stacked_bar'),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Centering the chart inside the html figure
    svg
        .style("margin-left", "50%")
        .style("margin-top", "-10%")

    // Define a tooltip to view datapoints
    var tooltip = d3.select('figure p')
        .append('div')
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "#fffffc")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "18")
        .text("a simple tooltip");

    // Define axes
    var x = d3.scaleBand()
        .rangeRound([0, width - 170])
        .paddingInner(0.05)
        .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"]);

    // Read pre-generated data from file
    d3.csv(inputFile, function (d, i, columns) {
        for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
        d.total = t;
        return d;
    }, function (error, data) {
        if (error) throw error;

        var keys = data.columns.slice(1);

        // Provide data to axes
        x.domain(data.map(function (d) { return d.Year; }));
        y.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
        z.domain(keys);

        // Stack data
        g.append("g")
            .selectAll("g")
            .data(d3.stack()
                .keys(keys)
                (data))

            // For each region, create a block for each year where height corresponds to data
            .enter().append("g")
            .attr("fill", function (d) { return z(d.key); })
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("class", "bar_element")
            .attr("x", function (d) { return x(d.data.Year); })
            .transition().duration(1000).style("transition-timing-function", "ease-out")
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())

        // Grow block when hovered over
        d3.selectAll(".bar_element")
            .on('mouseover', function () {
                d3.select(this)
                    .attr('width', x.bandwidth() + 10)
                    .attr('height', (d) => y(d[0]) - y(d[1]) + 10)
                    .attr('y', (d) => y(d[1]) - 5)
                    .attr('x', (d) => x(d.data.Year) - 5)
                    .text(function (d) { return (d[1] - d[0]).toFixed(3) });

                // Show value (height) of block with tooltip
                tooltip.text(d3.select(this).text())
                return tooltip.style('visibility', 'visible');
            })

            // Move tooltip to the selected block
            .on('mousemove', function () {
                return tooltip
                    .style("top", String(+d3.select(this)
                        .attr("y") - 40) + "px")
                    .style("left", String(+d3.select(this)
                        .attr("x") + 590) + "px");
            })

            // Shrink block and remove tooltip when moved out
            .on('mouseout', function () {
                d3.select(this)
                    .attr('width', x.bandwidth())
                    .attr('height', (d) => y(d[0]) - y(d[1]))
                    .attr('y', (d) => y(d[1]))
                    .attr('x', (d) => x(d.data.Year))
                return tooltip.style('visibility', 'hidden')
            });

        // Draw axes
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#fff")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text(function () {
                if (inputFile === "./data/regional_data_score.csv") return "Happiness";
                if (inputFile === "./data/regional_data_gdp.csv") return "GDP per capita";
            });

        d3.selectAll(".axis .domain").attr("stroke", "#fff")
        d3.selectAll(".axis .tick line").attr("stroke", "#fff")
        d3.selectAll(".axis .tick text").attr("fill", "#fff").attr("font-size", "12")

        // Add a legend
        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 11)
            .attr("fill", "#fff")
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(20," + i * 25 + ")"; });

        legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });
    });
}
