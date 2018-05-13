queue()
    .defer(d3.csv, "static/data/salaries.csv")
    .await(makeGraphs);
    
function makeGraphs(error, salaryData) {
    var ndx = crossfilter(salaryData);
    
    showDisciplineSelector(ndx);
    showGenderBalance(ndx);
    
    dc.renderAll();
}

function showDisciplineSelector(ndx) {
    dim = ndx.dimension(dc.pluck('discipline'));
    group = dim.group();
    
    dc.selectMenu('#discipline-selector')
        .dimension(dim)
        .group(group)
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
        .xAxisLabel("Gender")
        .yAxis().ticks(20);
}