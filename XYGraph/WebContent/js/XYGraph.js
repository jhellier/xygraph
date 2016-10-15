/**
 * XYGraph - Simple xy graph that can be extended
 * 
 * Convert data. Any column that needs to be formated in any way.
 * takes in an array and an object that describes each columns format
 * that needs to be formated. 
 * The format object's properties can be functions that are applied to the column value.
 * 
 *  Each object has two properties
 *      column name in the form of the actual property name
 *      function to apply to that column value
 * 
 *         col['date'] = formatFunction
 * 
 *         To apply this function
 * 
 *    col['date'](args)
 * 
 *     Applying it to a property of a data object
 *     
 *     Example:  d.date where date is a property of the d object
 *     First identify the property then apply the format function to that property
 *     Iterate through the property keys: Object.keys(targetObject)
 *     
 *     if there is an object ft = {"date":someValue}
 *     then Object.keys(ft) will give you ["date"]
 *     
 *     Given a data array iterate through each element and apply the key value to see if a property exists
 *     if the property does exist then apply the format function associated with that property.
 *     
 *     Using the above example
 *     
 *     d['date'] = ft['date'](d['date'])
 *     
 *     For iterating over the keys it would be
 *     
 *     for (prop in ft) {
 *             //Taking the old value of d.value and formatting it then assigning it back to d.value.
 *             d[prop] = ft[prop](d[prop]);
 *     }
 *         
 * 
 * 
 * 
 *     1. Handle finding extent for dates over multiple data sets (arrays) FIXED
 *     2.  Handle if the data is provided by files or by a data store
 *     3. Set up axis title so that it can be centered and larger font
 *     4. Clean up the code so that it is cleanly callable and configurable
 *     5. Add highlight capability
 *     6. Think about the design: Simple, function add-ons and more complex
 *     7. What are the qualities of a simple graph, a complex one?
 *     8. Handle various data types.
 * 
 */

XYGraph = function (divPanelTag, metaData, dataSets, margin, gap) {

    var formatObject = metaData.formatObject,
        cols = metaData.cols,   
        width = parseInt(d3.select(divPanelTag).style("width"), 10) - margin * 2,
        height = parseInt(d3.select(divPanelTag).style("height"), 10) - margin * 2,
        xAxis,
        yAxis;
    
 // cols['xType'] puts in the appropriate d3 class for scale like d3.scaleTime if
 // the axis is dates
 var xScale = cols['xType']
     .range([0, width]);

 // Use nice to round off the tick text to a nice round number
 // .nice(d3.time.year);
 
 var yScale = cols['yType']
     .range([height, 0]);
 
 var line = d3.line()
     .x(function (d) { return xScale(d[cols.x]); })
     .y(function (d) { return yScale(d[cols.y]); });
 
 var xGap = margin + gap;
 var yGap = margin - gap;
 
 var graph = d3.select(divPanelTag)
      .append("svg")
      .attr("class","graph")
      .attr("width", width)
      .attr("height", height + margin * 2)
      .append("g")
      .attr("transform", "translate(" + xGap + "," + yGap + ")");



 /**
  * Recalculates the graph to fit properly in whatever size the containing window is
  */
 function resize(what) {
     console.log(" tag " + divPanelTag);
   var width = parseInt(d3.select(divPanelTag).style("width")) - margin * 3,
   height = parseInt(d3.select(divPanelTag).style("height")) - margin * 2;

   /* Update the range of the scale with new width/height */
   xScale.range([0, width]);
   yScale.range([height, 0]);

   xAxis.ticks(Math.max(width / 50, 2));
   yAxis.ticks(Math.max(height / 50, 2));
   
   /* Update the axis with the new scale */
   graph.select(divPanelTag + ' .x.axis')
     .attr("transform", "translate(0," + height + ")")
     .call(xAxis);
   
     d3.select(divPanelTag + " #xAxisTitle")
     .attr("x", width - 100);
     
   graph.select(divPanelTag + ' .y.axis')
     .call(yAxis);
   
   /* Force D3 to recalculate and update the line */
   graph.selectAll(divPanelTag + ' .line')
     .attr("d", line);
 };

function plotGraphs() {
    
    // Remove any old graph lines
    d3.selectAll(divPanelTag + " .line").remove()
  
         xScale.domain([d3.min(dataSets, function (dataSet) {
                            return d3.min(dataSet, function (d) {
                                return d[cols.x];
                            })
                        }),
                        d3.max(dataSets, function (dataSet) {
                            return d3.max(dataSet, function (d) {
                                return d[cols.x];
                            })
                        })
            ]);
 
  
          yScale.domain([0, d3.max(dataSets, function (dataSet) {
              return d3.max(dataSet, function (d) {
                  return d[cols.y];
              });
          } ) ] );

  //Offers 10 colors that can be accessed by c10(index)
  // in an iteration calling c10(i) will give you different colors for each step up to 10
  var c10 = d3.scaleOrdinal(d3.schemeCategory10);
  
  xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);
  
  // Called once - same axis works for all data sets
  graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height  + ")")
      .call(xAxis)
     .append("text")
        .attr("id", "xAxisTitle")
         .attr("y",-16)
         .attr("x", width - 100)
         .attr("dy", ".71em")
         .style("text-anchor", "end")
         .text(cols.xAxisTitle)

  // Called once - same axis works for all data sets
  graph.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("id", "yAxisTitle")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(cols.yAxisTitle);

  // Called as many times as there are data sets  
  dataSets.forEach(function (dataSet,i) {
      graph.append("path")
      .datum(dataSet)
      .attr("class", "line")
      .style("stroke", c10(i))
      .attr("d", line);
  });



  // Any resize of the main browser will fire a resize event and call resize
  // This does not work. It only resizes the last graph created. The rest of the graphs do not resize. It only
  // calls resize once for the last graph instance. 
  //d3.select(window).on('resize', resize); 
  
  // Handles resizing all the graphs when the window resizes. 
  window.addEventListener("resize", resize);

  // Upon initial load of this script execute a resize
  resize();
  
  return this;
  
};

plotGraphs();


return  {
    plotGraph: function () {
        plotGraphs();
        return this;
    },
    
    setDataSets: function(newDataSets) {
        dataSets = newDataSets;
    },
    
    getDataSets: function() {
        return dataSets;
    },
    
    resize: function() {
        resize();
        return;
    }
    
    
    
}
    
};


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

