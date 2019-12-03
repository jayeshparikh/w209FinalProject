// https://gist.githubusercontent.com/jayeshparikh/852688dc04567dd98b1dcea2073dd1e5/raw/4eba2d31e63d45cef3fdd81073ad6cfee48f137c/10NOV2019_sf_entries.csv

d3.csv("https://gist.githubusercontent.com/jayeshparikh/852688dc04567dd98b1dcea2073dd1e5/raw/4eba2d31e63d45cef3fdd81073ad6cfee48f137c/10NOV2019_sf_entries.csv").then(d => chart(d));

var dateFormat = d3.timeParse("%m/%d/%Y");
var yearFormat = d3.timeFormat("%Y");
var dateStrFormat = d3.timeFormat("%b %d, %Y");

function chart(csv) {

  //console.log(csv);
	csv.forEach(function(d) {
       //console.log(d.surfaceFailureDate)
		   d.surfaceFailureDate = dateFormat(d.surfaceFailureDate);
       //console.log(d.surfaceFailureDate)
       d.year = yearFormat(d.surfaceFailureDate);
       d.surfaceFailureComponent = d.surfaceFailureComponent;
       d.surfaceFailureSubComponent = d.surfaceFailureSubComponent;
       d.surfaceFailureManufacturer = d.surfaceFailureManufacturer;
       d.surfaceFailureRootCause = d.surfaceFailureRootCause;
		return d;
	})
  
  console.log("after for each")
  console.log(csv);
	var years  = [...new Set(csv.map(d => d.year))];
  
  console.log("Years:")
  console.log(years.sort(d3.descending))

	var options = d3.select("#year").selectAll("option")
                  .data(years)
	                .enter().append("option")
		              .text(d => d)

	var svg = d3.select("#chart"),
		  margin = {top: 40, right: 45, bottom: 40, left: 175},
		  width = +svg.attr("width") - margin.right - margin.left,
      height = +svg.attr("height") - margin.top - margin.bottom;

  //var gCanvas = svg.append("g")
  //  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var y = d3.scaleBand()
            .range([height - margin.bottom, margin.top])
            .padding(0.05)
            .paddingOuter(0.2);
               //.align(0.1);

  var x = d3.scaleLinear()
            .range([0, width - margin.right - margin.left])
            .nice();

	var xAxis = g => g
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(d3.axisTop(x))

	var yAxis = g => g
		.attr("transform", "translate(" + margin.left + ",0)")
		.call(d3.axisLeft(y))

	svg.append("g")
		.attr("class", "x-axis")

	svg.append("g")
		.attr("class", "y-axis")
  
  console.log("before update")
  console.log(d3.select("#year").property("value"))
	update(d3.select("#year").property("value"), 0)
  console.log("after update")

	function update(year, speed) {

		var data = csv.filter(f => f.year == year)
    var barheight = 7;

    console.log("In Update")
    console.log(year)
    var failureCount = d3.nest()
                     .key(function(d) { 
                         if (d.surfaceFailureComponent == "") 
                            { return "Blank"}
                         else { return d.surfaceFailureComponent };
                     })
                     .entries(data)
                     .sort(function(a, b){ 
                         return (a.values.length - b.values.length)
                     });
   
    console.log("Printing failure count...") 
    console.log(failureCount)
  
    var maxFailures = d3.max(failureCount, function(d) {return d.values.length;});
  
    console.log("Max value: ")
    console.log(maxFailures)
    y.domain(
       failureCount.map(function(d) {
          return d.key;
       })
    );
		//y.domain([0, d3.max(data, d => d.value)]).nice()

		svg.selectAll(".y-axis")
       .transition().duration(speed)
			 .call(yAxis);
    
    svg
      .append("text")      // text label for the y axis
      .attr("y", margin.left/4)
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .style("text-anchor", "middle")
      .style("font", "15px arial")
      .style("font-weight", "bold")
      .text("Failure Components");     
    
    x.domain([0, d3.max(failureCount, d => d.values.length)]).nice()
		//x.domain(data.map(d => d.month))

		svg.selectAll(".x-axis")
       .transition().duration(speed)
			 .call(xAxis)

    svg
      .append("text")      // text label for the x axis
      .attr("x", width / 2 )
      .attr("y", margin.top/2)
      .style("text-anchor", "middle")
      .style("font", "15px arial")
      .style("font-weight", "bold")
      .text("Number of Failures");   
    
		var bar = svg.selectAll(".bar")
			.data(failureCount, d => d.key)

		bar.enter()
       .append("rect")
			 .attr("class", "bar")
       .on("mouseover", function(d,i){
          console.log("Mouse Move...",i)
          d3.select(this)
            .transition()
          svg.append("text")
             .attr("id", "MyText"+i)
             .attr("y", y(d.key)+5)
             .attr("x", x(d.values.length)/2 + margin.left)
             .text(d.values.length)
               .style("font-size", "10px")
       })
       .on("mouseout", function(d,i) {
         console.log(i)
         console.log("mouseout", d)
         d3.select(this)
           .transition()
           .duration(50)
         d3.select("#MyText"+i).remove()
       })
			 .merge(bar)
		   .transition().duration(speed)
			 .attr("x", margin.left)
			 .attr("y", function (d) {
           //console.log(d.key)
           return y(d.key);
	     })
			 //.attr("height", d => y(0) - y(d.value))
       .attr("width", function (d) {
          //console.log(d.values.length)
          return x(d.values.length);
	     })
       .attr("height", barheight)
       
       //.attr("text", "test")
   
		bar.exit().remove();
    console.log("after exit")
  }
 
	chart.update = update;
}

var select = d3.select("#year")
	.style("border-radius", "5px")
	.on("change", function() {
		chart.update(this.value, 750)
	})

/*
var checkbox = d3.select("#sort")
	.style("margin-left", "45%")
	.on("click", function() {
		chart.update(select.property("value"), 750)
	})
*/
