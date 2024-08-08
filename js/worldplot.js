//function to create world map containing happiness score
function createWorldMapHapp(){

    // The svg
    var svgHapp = d3.select("#happiness_map"),
    width = +svgHapp.attr("width"),
    height = +svgHapp.attr("height");

    //Centering svg in html
    svgHapp
        .style("margin-left", "50%")
        .style("margin-top", "-5%")

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoMercator()
        .scale(100)
        .center([0,20])
        .translate([(width / 2) , (height / 2) + 50]);
    
    var d3mapHapp = d3.map();

    //Blue scale to fill in the map according to thresholds
    var colorScaleBlue = d3.scaleThreshold()
        .domain([2.5, 3.5, 4.4, 5, 5.6, 6.2, 6.9, 7.3])
        .range(d3.schemeBlues[9]);

    //tooltip to inspect individual country
    var tooltip = d3.select("div.tooltip");

    var g;
    /*
    var regionBounds = [];
    var regions = [];*/
    
    //Read input file: topographic data for map and input dataset
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .defer(d3.csv, "./data/merged_data.csv")
        .await(ready);



    function ready(error, topo, dataset) {
        
        updateMapHapp(dataset, topo, 2015);
        yearSlider(dataset, topo);
            
    }

    //Function to update Happiness map according to selected year
    function updateMapHapp(dataset, topo, year){
        
        //Set value of Happiness score for each country in map object
        for(let i = 0; i < dataset.length ; i++){
            if(dataset[i].Year == year){
                d3mapHapp.set(dataset[i].Code, +dataset[i].Score);
            }
        }

        // Draw the map
        g = svgHapp.append("g")
            .selectAll("path")
            .remove()
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = d3mapHapp.get(d.id) || 0;
                return colorScaleBlue(d.total);
            })
            //show name and score of country under the mouse
            .on("mouseover",function(d,i,dataset){                 
                d3.select(this).attr("fill","white").attr("stroke-width",2);
                return tooltip.style("hidden", false).html(`${d.properties.name} <br>Happiness Score: ${d3mapHapp.get(d.id) || "0 (No data)" }`)
            })
            .on("mousemove",function(d,dataset){
                tooltip.classed("hidden", false)
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style("left", (d3.event.pageX + 15) + "px")
                    .html(`${d.properties.name} <br>Happiness Score: ${d3mapHapp.get(d.id) || "0 (No data)" }`)                 
            })
            .on("mouseout",function(d,i){
                d3.select(this).attr("fill",function (d) {
                    d.total = d3mapHapp.get(d.id) || 0;
                    return colorScaleBlue(d.total);
                })
                tooltip.classed("hidden", true);
            });
        
            //g.on("click", clicked(regionBounds));

           //Add color legend
            var legend = d3.legendColor()
                .scale(colorScaleBlue)
                .labels(d3.legendHelpers.thresholdLabels);

            svgHapp.append("g")
                .attr("transform", "translate(950,50)")
                .attr("font-size", 20)
                .attr("fill", "white")
                .call(legend);

    }

    //function to create slider to select year
    function yearSlider(dataset, topo){

        var dataTime = d3.range(0, 5).map(function(d) {
            return new Date(2015 + d, 10, 3);
        });

        var sliderTime = d3 
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(300)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .default(new Date(1998, 10, 3))
            .on('onchange', val => {
                //update map on value change
                updateMapHapp(dataset ,topo ,d3.timeFormat('%Y')(val))
            });

        var gTime = d3
            .select('div#slider-time')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .attr('stroke', 'white')
            .attr('stroke-width', 0.4)
            .attr('font-size', 10)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);
    }

}

//function to create world map containing GDP per capita value
function createWorldMapGDP(){

    // The svg
    var svgGDP = d3.select("#gdp_map"),
    width = +svgGDP.attr("width"),
    height = +svgGDP.attr("height");

    //centering svg in html
    svgGDP
        .style("margin-left", "50%")
        .style("margin-top", "-5%")

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoMercator()
        .scale(100)
        .center([0,20])
        .translate([(width / 2) , (height / 2) + 50]);

    var d3mapGDP = d3.map();

    //Green scale to fill in the map according to thresholds
    var colorScaleGreen = d3.scaleThreshold()
        .domain([0.2, 0.4, 0.6, 0.7, 0.9, 1.1, 1.3])
        .range(d3.schemeGreens[8]);

    var tooltip = d3.select("div.tooltip");
    var g;
    /*
    var regionBounds = [];
    var regions = [];*/
    
    //Read input file: topographic data for map and input dataset
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .defer(d3.csv, "./data/merged_data.csv")
        .await(ready);

    function ready(error, topo, dataset) {
        
        //console.log(regionBounds)
        updateMapGDP(dataset, topo, 2015);
        yearSlider(dataset, topo);
        
    }

    //Function to update GDP map according to selected year
    function updateMapGDP(dataset,topo, year){
        
        //Set value of GDP for each country in map object
        for(let i = 0; i < dataset.length ; i++){
            if(dataset[i].Year == year){
                d3mapGDP.set(dataset[i].Code, +dataset[i].GDPpCapita);
            }
        }

        // Draw the map
        svgGDP.append("g")
            .selectAll("path")
            .remove()
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = d3mapGDP.get(d.id) || 0;
                return colorScaleGreen(d.total);
            })
            //show name and gdp of country under the mouse
            .on("mouseover",function(d,i,dataset){                 
                d3.select(this).attr("fill","white").attr("stroke-width",2);
                return tooltip.style("hidden", false).html(`${d.properties.name} <br>GDP per capita: ${d3mapGDP.get(d.id) || "0 (No data)" }`)
            })                      
            .on("mousemove",function(d,dataset){
                tooltip.classed("hidden", false)
                    .style("top", (d3.event.pageY - 20) + "px")
                    .style("left", (d3.event.pageX + 15) + "px")
                    .html(`${d.properties.name} <br>GDP per capita: ${d3mapGDP.get(d.id) || "0 (No data)" }`) 
                    
            })
            .on("mouseout",function(d,i){
                d3.select(this).attr("fill",function (d) {
                    d.total = d3mapGDP.get(d.id) || 0;
                    return colorScaleGreen(d.total);
                })
                tooltip.classed("hidden", true);
            });

            //Add color legend
            var legend = d3.legendColor()
                .scale(colorScaleGreen)
                .labels(d3.legendHelpers.thresholdLabels);

            svgGDP.append("g")
                .attr("transform", "translate(950,50)")
                .attr("font-size", 20)
                .attr("fill", "white")
                .call(legend);

    }
        
    function yearSlider(dataset, topo){

        var dataTime = d3.range(0, 5).map(function(d) {
            return new Date(2015 + d, 10, 3);
        });

        var sliderTime = d3 
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(300)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .default(new Date(1998, 10, 3))
            .on('onchange', val => {
                //update map on value change
                updateMapGDP(dataset ,topo ,d3.timeFormat('%Y')(val))
            });

        var gTime = d3
            .select('div#slider-time')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .attr('stroke', 'white')
            .attr('stroke-width', 0.3)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);
    }

   
}