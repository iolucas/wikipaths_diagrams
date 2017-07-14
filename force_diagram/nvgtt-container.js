'use strict';
//Container class to manage container stuff

var ElasticSvg = function(containerId, parentNode) {

	var self = this;

	//Create event handle to store events
	var eventHandler = new EventHandler();
	this.on = function(event, callback) {
		eventHandler.on(event, callback);
		return self;	
	}

	//Create necessary nodes
	var svgNode = d3.select(parentNode)
		.append("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.style("display", "block")
		.style("position", "fixed")
		.style("top", 0);

	var contentGroup = svgNode.append("g")
		.attr("id", containerId);

	var mouseArea = svgNode.append("rect")
		.attr("fill", "transparent")
		.attr("width", "100%")
		.attr("height", "100%")
		.on("click", function() {
			eventHandler.fire("click");
		})
		.on("dblclick", function() {
			eventHandler.fire("dblclick");
		});
		// .on("mousedown", function() {
		// 		mouseArea.style("cursor", "move");
		// })
		// .on("mouseup", function() {
		// 		d3.select(this).style("cursor", "");		
		// })




	//Properties of the container
	this._scale = 1;
	this._position = { x:0, y:0 }

	//Create object to handle nodes container zooming/draging
	var containerZoom = d3.zoom()
		//.scaleExtent([1, 1])
		.scaleExtent([0.1, 5])
		// .translateExtent([[0,1000],[0,1000]])
		.on("zoom", function() {

			// d3.event.translate = [
			// 	d3.event.transform.x,
			// 	d3.event.transform.y,
			// ]

			// d3.event.scale = d3.event.transform.k;

			self._position.x = d3.event.transform.x;
			self._position.y = d3.event.transform.y;
			self._scale = d3.event.transform.k;

			contentGroup.attr("transform", "translate(" + self._position.x + " " + self._position.y + ")scale(" + self._scale + ")");

			// contentGroup//.transition().delay(2000).duration(100)
			// 	.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		});

	//Must set mouse events down here becasue of a bug disabling dblclick zoom
	// mouseArea.node().addEventListener("mousedown", function() {
	// 	mouseArea.style("cursor", "move");
	// });

	// mouseArea.node().addEventListener("mouseup", function() {
	// 	alert("oi");
	// 	mouseArea.style("cursor", "");
	// });


	//Enable zoom/drag
	mouseArea.call(containerZoom)
		.on("dblclick.zoom", null); //Disable dblclick zoom



	//Public methods

	//Function to get the d3 selection of the container
	// this.select = function() {
	// 	var containerSelection = contentGroup;
	// 	return containerSelection;
	// }

	// this.position = function() {
	// 	return { X: position.x, Y: position.y }
	// }

	this.translate = function(x, y) {
		var newTransform = d3.zoomTransform(mouseArea);
		newTransform.x = x;
		newTransform.y = y;
		containerZoom.transform(mouseArea, newTransform);
	}

	this.scale = function(scaleFactor) {
		var newTransform = d3.zoomTransform(mouseArea);
		newTransform.k = scaleFactor;
		containerZoom.transform(mouseArea,newTransform);
	}

	this.fitScreen = function(margin) {

		var containerBox = contentGroup.node().getBBox();

		if(margin == undefined)
			margin = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0
			}       

        var yScale = (window.innerHeight - margin.top - margin.bottom) / containerBox.height;
        var xScale = (window.innerWidth - margin.left - margin.right) / containerBox.width;

        var newScale = xScale < yScale ? xScale : yScale;   //Get the lower scale

        newScale = newScale > 1 ? 1 : newScale; //Ensure they are max of 1
        newScale = newScale < 0.1 ? 0.1 : newScale; //ensure they are min of 0.1

        //Apply the scale to the chart
        self.scale(newScale);

		var leftOffset = -containerBox.x * newScale + margin.left; //Left justify

		//Add below to center in the screen
		leftOffset += (window.innerWidth - margin.left - margin.right - containerBox.width*newScale) / 2;

        //Translate it to the better position
        self.translate(leftOffset, -containerBox.y * newScale + margin.top);
	}
}


// var NvgttChart_Container = new function() {

// 	d3.select(".svg-container").style("display", "block");

// 	var self = this;

// 	//Properties of the container
// 	var scale = 1;
// 	var position = { x:0, y:0 }

// 	//Get the blocks container reference
// 	var container = d3.select("#block-container");

// 	//Get svg mouse area and register its events
// 	var svgMouseArea = d3.select("#node-container-mouse-area")
// 		.attr("fill", "transparent")
// 		.on("mousedown", function() {
// 			svgMouseArea.style("cursor", "move");		
// 		})
// 		.on("mouseup", function() {
// 			svgMouseArea.style("cursor", "");		
// 		})
// 		.on("click", function() {
// 			eventHandler.fire("click");
// 		});


// 	//Create object to handle nodes container zooming/draging
// 	var containerZoom = d3.behavior.zoom()
// 		//.scaleExtent([1, 1])
// 		.scaleExtent([0.1, 5])
// 		.on("zoom", function() {

// 			/*if(d3.event.translate[0] < 0)
// 				d3.event.translate[0] = 0;

// 			if(d3.event.translate[1] < 0)
// 				d3.event.translate[1] = 0;*/

// 			container//.transition().delay(2000).duration(100)
// 				.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

// 			self.position.X = d3.event.translate[0];
// 			self.position.Y = d3.event.translate[1];

// 			scale = d3.event.scale;
// 		});

// 	//Enable zoom
// 	svgMouseArea.call(containerZoom);

// 	//Public methods

// 	//Function to get the d3 selection of the container
// 	this.select = function() {
// 		var containerSelection = container;
// 		return containerSelection;
// 	}

// 	this.position = function() {
// 		return { X: position.x, Y: position.y }
// 	}

// 	this.translate = function(x, y) {
// 		return containerZoom.translate([x, y]).event(svgMouseArea);	
// 	}

// 	this.scale = function(scaleFactor) {
// 		if(scaleFactor)
// 			return containerZoom.scale(scaleFactor).event(svgMouseArea);
// 		else
// 			return scale;
// 	}

// 	this.fitScreen = function() {

// 		var containerBox = container.node().getBBox();

// 	    var margin = {
//             top: 0,
//             bottom: 0,
//             left: 0,
//             right: 0
//         }           
        
//         var yScale = (window.innerHeight - margin.top - margin.bottom) / containerBox.height;
//         var xScale = (window.innerWidth - margin.left - margin.right) / containerBox.width;

//         var newScale = xScale < yScale ? xScale : yScale;   //Get the lower scale

//         newScale = newScale > 1 ? 1 : newScale; //Ensure they are max of 1
//         newScale = newScale < 0.1 ? 0.1 : newScale; //ensure they are min of 0.1

//         //Apply the scale to the chart
//         self.scale(newScale);

//         //Translate it to the better position
//         self.translate(-containerBox.x * newScale + margin.left,
//             -containerBox.y * newScale + margin.top);
// 	}

// 	//Create event handle to store events
// 	var eventHandler = new EventHandler();
// 	this.on = function(event, callback) {
// 		eventHandler.on(event, callback);
// 		return self;	
// 	}
// }

/*
Navigatte.Container = new function() {

	var self = this;

	//Public variable holding the current scale and translate attributes
	var scale = 1;
	this.Position = { X: 0, Y: 0 }

	var container;
	//var svgContainer;
	var svgMouseArea;	

	//Create object to handle nodes container zooming/draging
	var containerZoom = d3.behavior.zoom()
		//.scaleExtent([1, 1])
		.scaleExtent([0.1, 5])
		.on("zoom", function() {

			container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

			self.Position.X = d3.event.translate[0];
			self.Position.Y = d3.event.translate[1];

			scale = d3.event.scale;
		});

	this.Translate = function(x, y) {
		return containerZoom.translate([x, y]).event(svgMouseArea);	
	}

	this.Scale = function(scaleFactor) {
		if(scaleFactor)
			return containerZoom.scale(scaleFactor).event(svgMouseArea);
		else
			return scale;
	}

	var eventHandler = new EventHandler();
	this.on = function(event, callback) {
		eventHandler.on(event, callback);
		return self;	
	}

	//Function to get the d3 selection of the container
	this.Select = function() {
		var containerSelection = container;
		return containerSelection;
	}

	//Function to init the navigatte container class
	this.Init = function(parentId) {

		//Get the svg container reference
		//svgContainer = d3.select(".svg-container");

		//Get the blocks container reference
		container = d3.select("#block-container");

		//Add mouse area events
		svgMouseArea = d3.select("#node-container-mouse-area")
			.on("mousedown", function() {
				d3.select(this).style("cursor", "move");		
			})
			.on("mouseup", function() {
				d3.select(this).style("cursor", "");		
			})
			.on("click", function() {
				eventHandler.fire("click");
			});
	
		//Enable the nodes container to be zoomed/dragged
		svgMouseArea.call(containerZoom);
	}

}*/

