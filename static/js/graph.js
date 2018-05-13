queue()
    .defer(d3.csv, "static/data/salaries.csv")
    .await(makeGraphs);
    
function makeGraphs(error, salaryData) {
    var ndx = crossfilter(salaryData);
    
    salaryData.forEach(function(d) {
        d.salary = parseInt(d.salary);
    });
    
    showDisciplineSelector(ndx);
    
    showPercentProfByGender(ndx);
    
    showGenderBalance(ndx);
    showAverageSalaries(ndx);
    showRankDist(ndx);
    
    
    dc.renderAll();
}

function showDisciplineSelector(ndx) {
    dim = ndx.dimension(dc.pluck('discipline'));
    group = dim.group();
    
    dc.selectMenu('#discipline-selector')
        .dimension(dim)
        .group(group)
}

function showPercentProfByGender(ndx) {
    var percentageFemale = ndx.groupAll().reduce(
        function(p, v) {
            if(v.sex == 'female') {
                p.count++;
                if(v.rank == 'Prof') {
                    p.areProf++;
                }
            }
            return p;
        },
        function(p, v) {
            if(v.sex == 'female') {
                p.count--;
                if(v.rank == 'Prof') {
                    p.areProf--;
                }
            }
            return p;
        },
        function () {
            return {count: 0, areProf: 0};
        }
    );
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

function showAverageSalaries(ndx) {
    var dim = ndx.dimension(dc.pluck('sex'));
    
    function add(p, v) {
        p.count++;
        p.total += v.salary;
        p.average = p.total / p.count;
        return p;
    }
    
    function remove(p, v) {
        p.count--;
        if(p.count == 0) {
            p.total = 0;
            p.average = 0;
        } else {
            p.total -= v.salary;
            p.average = p.total / p.count;
        }
        return p;
    }
    
    function init() {
        return {count: 0, total: 0, average: 0};
    }
    
    var averageSalaryByGender = dim.group().reduce(add, remove, init);
    
    dc.barChart('#average-salary')
        .width(400)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(averageSalaryByGender)
        .valueAccessor(function(d) {
            return parseInt(d.value.average); // Rounded to integer for simplicity
        })
        .transitionDuration(500)
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender")
        .yAxis().ticks(4);
}

function showRankDist(ndx) {
    
    function rankByGender(dimension, rank) {
        return dimension.group().reduce(
            function(p, v) {
                p.total++;
                if(v.rank == rank) {
                    p.match++;
                }
                return p;
            },
            function(p, v) {
                p.total--;
                if(v.rank == rank) {
                    p.match--;
                }
                return p;
            },
            function() {
                return {total: 0, match: 0};
            }
        );
    }
    
    var dim = ndx.dimension(dc.pluck('sex'));
    var profByGender = rankByGender(dim, 'Prof');
    var asstProfByGender = rankByGender(dim, 'AsstProf');
    var assocProfByGender = rankByGender(dim, 'AssocProf');
    
    dc.barChart('#rank-distribution')
        .width(400)
        .height(300)
        .dimension(dim)
        .group(profByGender, 'Prof.')
        .stack(asstProfByGender, 'Asst. Prof.')
        .stack(assocProfByGender, 'Assoc. Prof.')
        .valueAccessor(function(d) {
            if(d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            } else {
                return 0;
            }
        })
        .x(d3.scaleOrdinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({top: 10, right: 100, bottom: 30, left: 50});
}