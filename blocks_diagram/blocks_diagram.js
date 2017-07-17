String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function BlockDiagram(svgContainerId) {

    var self = this;

	//Create event handle to store events
	var eventHandler = new EventHandler();
	this.on = function(event, callback) {
		eventHandler.on(event, callback);
		return self;	
	}

    self.svg = d3.select("#" + svgContainerId);

    var colorSchemes = [
        ["#3c3c3c", "#f5f5f5", "#3c3c3c"],
        ["#403d58", "#f2efea", "#403d58"],
        ["#cfd2b2", "#e0d8de", "#4b3b47"],
        ["#4b3b47", "#e0d8de", "#cfd2b2"],
        ["#b3b5bb", "#cdfff9", "#817f75"],
        ["#31493c", "#e8f1f2", "#b3efb2"],
        ["#817f75", "#cdfff9", "#b3b5bb"],
        ["#1f271b", "#d3efbd", "#1f271b"],
    ]

    var currentColorScheme = colorSchemes[4]

    // d3.select(document.body)
    //     .style('background-color', currentColorScheme[1])

    d3.select("header").style('background-color', currentColorScheme[0])


    // function Square(obj) {
    //     this.obj = obj
    //     this.anchor = {x:null, y:null}

    //     this.getCoordinates = function() {
    //         return {
    //             height: this.obj.height,
    //             width: this.obj.width,
    //             x: this.anchor.x,
    //             y: this.anchor.y,
    //             anchorValue: this.anchor.high
    //         }
    //     }
    // }


    function hypotenuse(a, b) {
        return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
    }


    function Grid() {

        var gridMatrix = [];

        this.getValue = function(x,y) {
            if(gridMatrix[x] == undefined)
                gridMatrix[x] = [];
            return gridMatrix[x][y];
        }

        this.setValue = function(x,y,value) {
            if(gridMatrix[x] == undefined) 
                gridMatrix[x] = [];
            gridMatrix[x][y] = value;  
        }

        this.checkSpace = function(x, y, width, height) {
            for(var checkX = x; checkX < x + width; checkX++)
                for(var checkY = y; checkY < y + height; checkY++)
                    if(this.getValue(checkX, checkY)) {
                        return true;
                    }
            return false;
        }

        this.fillSpace = function(x, y, width, height) {
            for(var checkX = x; checkX < x + width; checkX++)
                for(var checkY = y; checkY < y + height; checkY++)
                    this.setValue(checkX, checkY, 1);
        }
    }

    function QuarterCircleGrid() {
        
        this.anchorPoints = [{x:0, y:0, hyp: 0}];
        this.squares = [];
        this.grid = new Grid();

        this.addSquare = function(square) {
            var bestAnchorIndex = null;
            for(var i in this.anchorPoints) {
                var aP =  this.anchorPoints[i];

                if(!aP || this.grid.checkSpace(aP.x, aP.y, 
                    square.width, square.height))
                        continue

                if(bestAnchorIndex == null || this.anchorPoints[bestAnchorIndex].hyp > aP.hyp)
                   bestAnchorIndex = i;
            }

            //Attach anchor points to the square
            square.x = this.anchorPoints[bestAnchorIndex].x;
            square.y = this.anchorPoints[bestAnchorIndex].y;

            //Delete used anchor
            delete this.anchorPoints[bestAnchorIndex];


            //Fill new square space into the grid
            this.grid.fillSpace(square.x, square.y, square.width, square.height)

            var newAnchor1 = {
                x: square.x + square.width,
                y: square.y,
            }
            newAnchor1.hyp = hypotenuse(newAnchor1.x, newAnchor1.y);

            var newAnchor2 = {
                x: square.x,
                y: square.y + square.height,
            }
            newAnchor2.hyp = hypotenuse(newAnchor2.x, newAnchor2.y);

            //Push new anchors and square
            this.anchorPoints.push(newAnchor1);
            this.anchorPoints.push(newAnchor2);
            this.squares.push(square);
        }
    }


    this.load = function(graph) {

        //Remove the first element that is the query itself
        // graph.nodes = graph.nodes.slice(1);

        var sortedNodes = graph.nodes.sort(function(a, b) {
            return b.score - a.score;
        });

        var lowerScore = sortedNodes[sortedNodes.length-1].score;

        for(var i in sortedNodes) {
            var node = sortedNodes[i];
            node.width = parseInt(node.score/lowerScore);
            node.height = parseInt(node.score/lowerScore);
        }

        //Split the data into four groups, with maximizing size equality between them

        function getMinIndex(array) {
            var minIndex = 0;
            for(var i = 1; i < array.length; i++)
                if(array[minIndex] > array[i])
                    minIndex = i;
            return minIndex;
        }

        function flipCoordsVertically(sqrs) {
            for(var i=0; i < sqrs.length; i++) {
                var sqr = sqrs[i];
                sqr.y = -sqr.y - sqr.height;
            }
        }

        function flipCoordsHorizontally(sqrs) {
            for(var i=0; i < sqrs.length; i++) {
                var sqr = sqrs[i];
                sqr.x = -sqr.x - sqr.width;
            }
        }

        var groupSizes = [0,0,0,0];
        var groups = [[],[],[],[]];

        //Ensure the first nodes to be positioned correctly
        groups[1].push(sortedNodes[0]);
        groupSizes[1] += Math.pow(sortedNodes[0].width, 2);
        groups[3].push(sortedNodes[1]);
        groupSizes[3] += Math.pow(sortedNodes[1].width, 2);

        for(var i = 2; i < sortedNodes.length; i++) {
            var node = sortedNodes[i];
            var minInd = getMinIndex(groupSizes);

            groups[minInd].push(node);
            groupSizes[minInd] += Math.pow(node.width, 2);
        }

        //For each group create a grid and fill it
        //Then flip it according to its quadrant
        for(var i = 0; i < groups.length; i++) {
            var circleGrid = new QuarterCircleGrid();

            var sqrs = groups[i];

            for(var j = 0; j < sqrs.length; j++)
                circleGrid.addSquare(sqrs[j]);

            switch(i) {
                case 0:
                    flipCoordsVertically(sqrs);
                    break;
                case 1:
                    flipCoordsVertically(sqrs);
                    flipCoordsHorizontally(sqrs);
                    break;
                case 2:
                    flipCoordsHorizontally(sqrs);
                    break;
            }
        }

        var blockMargin = 2;
        var blockScale = 50;
        var textMargin = 10;

        var block = self.svg.selectAll(".square-blocks")
            .data(sortedNodes)
            .enter()
            .append("g")
            .attr("transform", function(d) {
                return "translate(" + d.x*blockScale + " " + d.y*blockScale + ")";
            })
            .attr("class", "square-blocks");

        block.append("rect")
            .attr("fill", currentColorScheme[2])
            .attr("height", function(d){
                d.blockHeight = d.height*blockScale - blockMargin;
                return d.blockHeight;
            })
            .attr("width",  function(d){
                d.blockWidth = d.width*blockScale - blockMargin;
                return d.blockWidth;
            });

        var textBlock = block.append("text")
            .text(function(d) {
                var blockTextValue = decodeURIComponent(d.id);
                blockTextValue = blockTextValue.replaceAll("_", " ");
                return blockTextValue; 
            });
            // .attr("font-size", 5); 
            //Ratio between height/font-size for upper case include is =~ 1.3
            // 1/1.3 =~ 0.75

        //Get ggbox for each text to adjust its size
        textBlock.each(function(d) {
            var textBBox = this.getBBox();
            d.fontSize = 0.75 * (textBBox.height/(textBBox.width + textMargin)) * (d.blockWidth)
        });

		textBlock.attr("text-anchor", "middle")
            .attr("fill", "#d3efbd")
            .attr("font-size", function(d){ return d.fontSize; })
            .attr("x", function(d){
                return d.blockWidth/2;
            })
            .attr("y", function(d){
                return d.blockHeight/2;
            });

    }
}