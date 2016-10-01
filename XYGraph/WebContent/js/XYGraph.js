

XYGraph = function() {
	
	var margin = 40,
    width = parseInt(d3.select("#graph").style("width")) - margin*2,
    height = parseInt(d3.select("#graph").style("height")) - margin*2;

var xScale = d3.scaleTime()
    .range([0, width]);
    //.nice(d3.time.year);

var yScale = d3.scaleLinear()
    .range([height, 0]);
    //.nice();

var line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.close); });

var graph = d3.select("#graph")
    .attr("width", width + margin*2)
    .attr("height", height + margin*2)
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");


// parse the date / time
//var parseTime = d3.timeParse("%Y-%m-%d");
var parseTime = d3.timeParse("%d-%b-%y");



/*
 * Handles reading in as many data sets are you want. The data sets have to be of the same of number of columns and types
 * 
 */
var dataSets = [];

d3.queue()
	.defer(d3.csv, "data/data.csv")
	.defer(d3.csv, "data/data2.csv")
	.awaitAll(ready);

function ready(error, results) {
	results.forEach(function(array) {
		dataSets.push(array);
	});
	console.dir(dataSets);	
	plotGraphs(dataSets);
}

/**
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
 */

var formatObject = {"date": parseTime, "close":Number};

function formatData(data, formatObject) {
	for (prop in formatObject) {
		data[prop] = formatObject[prop](data[prop]);
	}
}


/**
 * Convert to handle multiple curves
 * 
 * Use the queue to read in the files
 * 
 * Break out the function calls that handle individual data sets
 *  generate a domain across all data sets
 *  Don't assume that one axis has the same domain across all data sets like date might but not absolute
 *  run the call to create the graph line for each data set.
 */

//d3.csv("data/data.csv", function(error, data) {

function plotGraphs(dataSets) {
	
	
 dataSets.forEach(function(dataSet) {
	 dataSet.forEach(function(d) {
			formatData(d, formatObject);  
		    //d.date = parseTime(d.date);
		    //d.close = +d.close;
		  });
	 
 })	;
 

xScale.domain(d3.extent(dataSets[0], function(d) { return d.date; }));
 // yScale.domain(d3.extent(data, function(d) { return d.close; }));

  
//  xScale.domain([0, d3.max(dataSets, function(dataSet) {
//	  return d3.max(dataSet, function(d) {
//		  return d.date;
//	  });
//  } ) ] );
  
  yScale.domain([0, d3.max(dataSets, function(dataSet) {
	  return d3.max(dataSet, function(d) {
		  return d.close;
	  });
  } ) ] );

  
  // Called once - same axis works for all data sets
  graph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

  // Called once - same axis works for all data sets
  graph.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  // Called as many times as there are data sets  
  dataSets.forEach(function(dataSet) {
	  graph.append("path")
      .datum(dataSet)
      .attr("class", "line")
      .attr("d", line);
	  

  });
  
//  
//  graph.append("path")
//      .datum(data)
//      .attr("class", "line")
//      .attr("d", line);

  function resize() {
    var width = parseInt(d3.select("#graph").style("width")) - margin*2,
    height = parseInt(d3.select("#graph").style("height")) - margin*2;

    /* Update the range of the scale with new width/height */
    xScale.range([0, width]);
    yScale.range([height, 0]);

    /* Update the axis with the new scale */
    graph.select('.x.axis')
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    graph.select('.y.axis')
      .call(d3.axisLeft(yScale));

    /* Force D3 to recalculate and update the line */
    graph.selectAll('.line')
      .attr("d", line);
  }

  d3.select(window).on('resize', resize); 

  resize();
};
	
};

new XYGraph();