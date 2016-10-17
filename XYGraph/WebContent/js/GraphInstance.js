/**
 * An example of how to use XYGraph.js
 * 
 * Assumes that this set of functions will handle the data retrieval and the data cleaning and formating
 * 
 * Also assumes that the CSS is set up to take a specific number of graphs. In this case 3. So the
 * the CSS is set for width or height at 33% depending on the orientation.
 */


//parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

var formatObject = {
    "date" : parseTime,
    "close" : Number
};

var cols = {
    "x" : "date",
    "y" : "close",
    "xType" : d3.scaleTime(),
    "yType" : d3.scaleLinear(),
    "yAxisTitle" : "Price ($)",
    "xAxisTitle" : "Date"
};



 var metaData = {},
    dataSets = [],
          xyGraph1,
          xyGraph2;

metaData.cols = cols;
metaData.formatObject = formatObject;

d3.queue()
    .defer(d3.csv, "data/data.csv")
    .defer(d3.csv, "data/data2.csv")
    .awaitAll(ready);

function formatData(data, formatObject) {
    for (prop in formatObject) {
        data[prop] = formatObject[prop](data[prop]);
    }
}


d3.select("#toggle").on("click", function() {
    toggleGraphOrientation();
});

function toggleGraphOrientation() {
    
    var orientation = d3.selectAll(".graphPanelVert");
    if (orientation.size()  != 0) {
        d3.selectAll(".graphPanelVert").attr("class", "graphPanelHorz");
    } else {
        d3.selectAll(".graphPanelHorz").attr("class", "graphPanelVert");
    }
    
    window.dispatchEvent(new Event('resize'));
    
}


function ready(error, results) {
    results.forEach(function (array) {
        dataSets.push(array);
    });
    console.dir(dataSets);    

    dataSets.forEach(function (dataSet) {
        dataSet.forEach(function (d) {
            formatData(d, formatObject);
        });
    });
    
    xyGraph1 = new XYGraph("#graphPanel1", metaData, dataSets, 40, 30);
    xyGraph2 = new XYGraph("#graphPanel2", metaData, dataSets, 40, 30);
    xyGraph2 = new XYGraph("#graphPanel3", metaData, dataSets, 40, 30);
}

