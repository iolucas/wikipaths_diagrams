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

function hypotenuse(a, b) {
    return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
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