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
        ["#817f75", "#cdfff9", "#b3b5bb"]
    ]

    var currentColorScheme = colorSchemes[4]

    d3.select(document.body)
        .style('background-color', currentColorScheme[1])

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

        this.getArea = function() {
            var areaValue = 0;
            for(var i in this.squares)
                areaValue += this.squares[i].height;
            return areaValue;            
        }
    }


    this.load = function(graph) {

        var circleGrid = new QuarterCircleGrid();

        var sortedNodes = graph.nodes.sort(function(a, b) {
            return b.score - a.score;
        });

        // console.log(sortedNodes);

        var lowerScore = sortedNodes[sortedNodes.length-1].score;

        for(var i in sortedNodes) {
            var node = sortedNodes[i];
            node.width = parseInt(node.score/lowerScore);
            node.height = parseInt(node.score/lowerScore);

            circleGrid.addSquare(node);
        }

        console.log(circleGrid.getArea());

        // var blocks = [
        //     30,10,5,3,2
        // ]

        // for(var i in blocks) {
        //     var blockSize = blocks[i];
        //     var newSquare = new Square({
        //         width: parseInt(blockSize),
        //         height: parseInt(blockSize)
        //     })

        //     circleGrid.addSquare(newSquare);
        // }

       



        self.svg.selectAll("rect")
            .data(circleGrid.squares)
            .enter()
            .append("rect")
            .attr("fill", currentColorScheme[2])
            .attr("height", function(d){return d.height*10 - 2})
            .attr("width",  function(d){return d.width*10 - 2})
            .attr("x",  function(d){return d.x*10})
            .attr("y",  function(d){return d.y*10})

        // console.log(graph)

    }
}