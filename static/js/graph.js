queue()
    .defer(d3.csv, "static/data/salaries.csv")
    .await(makeGraphs);
    
function makeGraphs(error, salaryData) {
    var ndx = crossfilter(salaryData);
    
    showGenderBalance(ndx);
    
    dc.renderAll();
}

function showGenderBalance(ndx) {
    var dim = ndx.dimension(dc.pluck('sex'));
    var group = dim.group();
    
    dc.barChart('#gender-balance')
        .width(400)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender")
        .yAxis().ticks(20);
}