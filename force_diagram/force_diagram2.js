function createElasticSvgContainer(id, margins, parentNode) {

    if(id == undefined)
        id = "elastic-svg";

    if(parentNode == undefined)
        parentNode = document.body;

    if(margins == undefined)
        margins = {
            top: '10',
            left: '10',
            bottom: '10',
            right: '10'
        }

    var svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgContainer.setAttribute("id", id);

    svgContainer.customMargins = margins

    function updateSize() {
        var newHeight = (window.innerHeight - svgContainer.customMargins.top - svgContainer.customMargins.bottom);
        var newWidth = (window.innerWidth*1 - svgContainer.customMargins.left - svgContainer.customMargins.right);

        svgContainer.setAttribute("width", newWidth);
        svgContainer.setAttribute("height", newHeight);
    }

    window.addEventListener("resize", updateSize);

    updateSize();

    //Append to parent and return
    parentNode.append(svgContainer);
    return svgContainer
}


// function zoomableCO


function ForceDiagram(svgContainerId) {

    baseRadius = 50;

    var svg = d3.select("#" + svgContainerId),
        width = +svg.attr("width"),
        height = +svg.attr("height");


    svg.style("background-color", "#ddd");

    // var color = d3.scaleOrdinal(d3.schemeCategory20);

    // var simulation = d3.forceSimulation()
    //     .force("link", d3.forceLink().id(function(d) { return d.id; }))
    //     .force("charge", d3.forceManyBody())
    //     .force("center", d3.forceCenter(width / 2, height / 2))
    //     .force("collision", d3.forceCollide(baseRadius*1.5))

    //Get svg mouse area and register its events
	// var svgMouseArea = d3.select("#node-container-mouse-area")
	// 	.on("mousedown", function() {
	// 		svgMouseArea.style("cursor", "move");		
	// 	})
	// 	.on("mouseup", function() {
	// 		svgMouseArea.style("cursor", "");		
	// 	})
	// 	.on("click", function() {
	// 		eventHandler.fire("click");
	// 	});



    this.load = function(graph) {

        console.log(graph);

        var force = d3.layout.force()
            .size([width, height])
            .nodes(graph.nodes)
            .links(graph.links)
            // .id(function(d) { return d.id; })
            .linkStrength(0.1)
            .friction(0.9)
            .linkDistance(width/3.05)
            .charge(-30)
            .gravity(0.1)
            .theta(0.8)
            .alpha(0.1);
            // .start();

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { 
                return Math.sqrt(d.value); 
            });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter()
            .append("g");
            // .call(d3.drag()
            //     .on("start", dragstarted)
            //     .on("drag", dragged)
            //     .on("end", dragended));

        node.append("circle")
            .attr("r", function(d) {
                if(d.score != undefined)
                    return baseRadius*d.score;

                return baseRadius;
            })
            .attr("fill", function(d) { 
                return "blue"; 
            })

        node.append("text")
			.attr("text-anchor", "middle")
            .text(function(d) {
                return d.id; 
            });
            




        // simulation
        //     .nodes(graph.nodes)
        //     .on("tick", ticked);



        // simulation.force("link")
        //     .links(graph.links);

        force.on("tick", refreshPositions);

        force.start();

        function refreshPositions() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) {
                return "translate(" + d.x + " " + d.y + ")";
            }); 

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }    
}





