/**
 * This is the XYGraph which will hold all development for exploring what an xygraph can do.
 * 
 * Convert data. Any column that needs to be formated in any way.
 * takes in an array and an object that describes each columns format
 * that needs to be formated. 
 * The format object's properties can be functions that are applied to the column value.
 * 
 *  Each object has two properties
 *  	column name in the form of the actual property name
 *  	function to apply to that column value
 * 
 * 		col['date'] = formatFunction
 * 
 * 		To apply this function
 * 
 * 		col['date'](args)
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
 *     		//Taking the old value of d.value and formatting it then assigning it back to d.value.
 *     		d[prop] = ft[prop](d[prop]);
 *     }
 * 		
 * 
 * 
 *  To Do: 
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

XYGraph = function(divPanelTag, metaData, dataSets, margin, gap) {

	var formatObject = metaData.formatObject;
	var cols = metaData.cols;
	
    width = parseInt(d3.select(divPanelTag).style("width")) - margin*2,
    height = parseInt(d3.select(divPanelTag).style("height")) - margin*2;
	
// cols['xType'] puts in the appropriate d3 class for scale like d3.scaleTime if the axis is dates
var xScale = cols['xType']
	.range([0, width]);

// Use nice to round off the tick text to a nice round number
//.nice(d3.time.year);

var yScale =cols['yType']
	.range([height, 0]);

var line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.close); });

var xGap = margin + gap;
var yGap = margin - gap;

var graph = d3.select(divPanelTag)
    .attr("width", width)
    .attr("height", height + margin*2)
   .append("g")
 .attr("transform", "translate(" + xGap + "," + yGap + ")");

function formatData(data, formatObject) {
	for (prop in formatObject) {
		data[prop] = formatObject[prop](data[prop]);
	}
}


function plotGraphs() {
	
		dataSets.forEach(function(dataSet) {
			dataSet.forEach(function(d) {
				formatData(d, formatObject);
			});
		});
  
 		xScale.domain([d3.min(dataSets, function(dataSet) {
							return d3.min(dataSet, function(d) {
								return d[cols['x']];
							})
						}),
						d3.max(dataSets, function(dataSet) {
							return d3.max(dataSet, function(d) {
								return d[cols['x']];
							})
						})
			]);
 
  
		  yScale.domain([0, d3.max(dataSets, function(dataSet) {
			  return d3.max(dataSet, function(d) {
				  return d[cols['y']];
			  });
		  } ) ] );

  //Offers 10 colors that can be accessed by c10(index)
  // in an iteration calling c10(i) will give you different colors for each step up to 10
  var c10 = d3.scaleOrdinal(d3.schemeCategory10);
  
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);
  
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
     	.text(cols["xAxisTitle"])

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
      .text(cols["yAxisTitle"]);

  // Called as many times as there are data sets  
  dataSets.forEach(function(dataSet,i) {
	  graph.append("path")
      .datum(dataSet)
      .attr("class", "line")
      .style("stroke", c10(i))
      .attr("d", line);
  });


  /**
   * Recalculates the graph to fit properly in whatever size the containing window is
   */
  function resize() {
    var width = parseInt(d3.select(divPanelTag).style("width")) - margin*3,
    height = parseInt(d3.select(divPanelTag).style("height")) - margin*2;

    /* Update the range of the scale with new width/height */
    xScale.range([0, width]);
    yScale.range([height, 0]);

    xAxis.ticks(Math.max(width/50, 2));
    yAxis.ticks(Math.max(height/50, 2));
    
    /* Update the axis with the new scale */
    graph.select('.x.axis')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    
      d3.select("#xAxisTitle")
      .attr("x", width - 100);
      
    graph.select('.y.axis')
      .call(yAxis);
    
    /* Force D3 to recalculate and update the line */
    graph.selectAll('.line')
      .attr("d", line);
  }

  // Any resize of the main browser will fire a resize event and call resize
  d3.select(window).on('resize', resize); 

  // Upon initial load of this script execute a resize
  resize();
};


return  {
	plotGraph: function() {
		plotGraphs();
	}
	
}
	
};


//parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

var formatObject = {
		"date": parseTime, 
		"close":Number
		};

var cols =  {	"x":"date", 
					"y":"close",
					"xType": d3.scaleTime()	,
					"yType": d3.scaleLinear(),
					"yAxisTitle": "Price ($)",
					"xAxisTitle": "Date"
					};



var metaData = {};
var dataSets = [];

metaData.cols = cols;
metaData.formatObject = formatObject;

d3.queue()
	.defer(d3.csv, "data/data.csv")
	.defer(d3.csv, "data/data2.csv")
	.awaitAll(ready);

function ready(error, results) {
	results.forEach(function(array) {
		dataSets.push(array);
	});
	console.dir(dataSets);	
	new XYGraph("#graph", metaData, dataSets, 40, 30).plotGraph();
}

