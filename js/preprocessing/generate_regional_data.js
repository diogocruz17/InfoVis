// This script was used to filter the dataset by region.
// In order to not have to generate the data each time the stacked bar charts are called,
// we separated the two and stored the filtered data as a separate file used in the stacked bar script
// Note: runs on d3.v5 or higher

d3.csv("./data/merged_data.csv").then(function (data) {
    data.sort(function (a, b) {
        return d3.ascending(a['Country or region'], b['Country or region']) || d3.descending(a['Year'], b['Year'])
    })

    regions = new Set(data.map(d => d['Region']))
    years = new Set(data.map(d => +d['Year']))
    years = [...years].sort(function (a, b) { return a - b })

    // regionsByYear contains all countries grouped by region, grouped by year
    regionsByYear = []
    years.forEach(function (year) {
        currentYear = []
        regions.forEach(function (region) {
            currentYear.push(data.filter(d => +d['Year'] === year)
                .filter(d => d['Region'] === region)
            )
        })
        regionsByYear.push(currentYear)
    })

    // For each year, create a stacked bar chart of the total happiness in a region
    happinessPerRegionPerYear = []
    regionsByYear.forEach(function (year) {
        happinessPerRegion = {}
        happinessPerRegion["Year"] = +year[0][0].Year

        year.forEach(function (region) {
            regionalHappiness = 0

            region.forEach(function (country) {

                // Average the happiness of all countries in a specific region
                regionalHappiness += +country['GDPpCapita'] / region.length
            })

            happinessPerRegion[region[0].Region] = regionalHappiness
        })

        happinessPerRegionPerYear.push(happinessPerRegion)
    })

    //generate a string in csv format containing the generated data
    dataFile = 'Year,'
    regions.forEach(function (region) {
        dataFile += region + ','
    })
    dataFile = dataFile.slice(0, -1)
    dataFile += '\n'

    happinessPerRegionPerYear.forEach(function (year) {
        dataFile += year.Year + ','
        regions.forEach(function (region) {
            dataFile += year[region] + ','
        })
        dataFile = dataFile.slice(0, -1)
        dataFile += '\n'
    })
    console.log(dataFile)

    // Now store dataFile and use it as input for the stacked bar chart
})
