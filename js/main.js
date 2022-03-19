//import 'js/index.js'
if (window.structuredClone === undefined) {
    window.structuredClone = function (obj) {
      return JSON.parse(JSON.stringify(obj))
    }
  }
IsoMap = (function() {

    /**
     * @desc constructor
     * @param object $params - initial parameters
     */
    function IsoMap(params) {
        this.canvas = document.getElementById('canvas');
        this.context = canvas.getContext('2d');
        this.matrix = []
        this.info = []
        this.targetPoint = []
        this.startingPoint = []
        this.selected = []
        this.hidden = false
        this.areyousure = 0
        this.path = undefined
        // tiles color
        this.color = '#15B89A';
        this.debug = true 
        this.description = ""
        this.game = false
        this.end = () => {}
        this.paused = false
        this.phrasecount = 0
        this.phrasedelay = 4500
        this.timer = undefined

        // canvas area details
        this.screen = { 
            width: params.screen.width,
            height: params.screen.height
         };

        // size of isometric map
        this.map = {
            width: params.map.width,
            height: params.map.height
        };

        // size of single tile
        this.tile = {
            width: params.tile.width,
            height: params.tile.height
        }

        // initial position of isometric map
        this.position = {
            x: this.screen.width / 2,
            y: this.tile.height
        }
    }

    /**
     * @desc draw isometric map
     */
    IsoMap.prototype.create = function() {
        // set canvas size
        this.canvas.setAttribute('width', this.screen.width);
        this.canvas.setAttribute('height', this.screen.height);

        // tiles drawing loops
        for(let a = 0; a < this.map.height; a++) {
            this.matrix[a] = new Array(this.map.width).fill(0)
        }
        //this.info[[0,0]] = 0
        //console.log(this.matrix)
       // //console.log(this.info)
        this.redrawTiles()


        // add event listeners
        this.addListeners();
    };
/*
    const setColor = (isometricPosition, color) => {
        if (isometricPosition.x && isometricPosition.y && color) {
            if (!this.info[[isometricPosition.y, isometricPosition.x]]) {
                this.info[[isometricPosition.y, isometricPosition.x]] = {color: color}
            }
            else this.info[[isometricPosition.y, isometricPosition.x]].color = color
        }
    } */

    /**
     * @desc draw single tile
     * @param int $x - position x on canvas area
     * @param int $y - position y on canvas area
     */
    IsoMap.prototype.drawTile = function(x, y, _color, _alpha, _stroke) {
        var tileWidth = this.tile.width;
        var tileHeight = this.tile.height;
        this.context.globalAlpha = 1
        this.context.lineWidth = 1
        this.context.strokeStyle = undefined
        // begin
        this.context.beginPath();

        // move to start point
        this.context.moveTo(x - tileWidth / 2, y);

        /**
         * create four lines
         * --------------------------------------------
         *    step 1  |  step 2  |  step 3  |  step 4
         * --------------------------------------------
         *    /       |  /       |  /       |  /\  
         *            |  \       |  \/      |  \/
         * --------------------------------------------
         */
         let isopos = this.convertScreenToIsometric(x, y)
         if (this.selected[0]-1 == isopos.y && this.selected[1] == isopos.x) { 
            ////console.log("=")
            ////console.log(isopos.x, "+",isopos.y)
            ////console.log(this.selected[1], "+", this.selected[0])
            //this.context.strokeStyle = "rgba(255, 0, 0, 1)"
            //this.context.lineWidth = 2
            if (this.areyousure == 0 || this.areyousure == 1) { this.context.fillStyle = "rgba(255, 255, 255, 1)" }
            else { this.context.fillStyle = "rgba(255, 0, 0, 1)" }
         }
         else {
         this.info[[y, x]] ? (this.context.fillStyle = this.info[[y,x]].color) : (_color ? this.context.fillStyle = _color : this.context.fillStyle = this.color)
        }
        this.context.lineTo(x - tileWidth, y + tileHeight / 2);
        this.context.lineTo(x - tileWidth / 2, y + tileHeight);
        this.context.lineTo(x, y + tileHeight / 2);
        this.context.lineTo(x - tileWidth / 2,  y);

        // draw path
        ////console.log("selected: ", this.selected  )
        //if (this.selected != null) //console.log(this.selected)
        ////console.log([isopos.y, isopos.x])
        ////console.log([isopos.y, isopos.x], "!=", this.selected)
        //this.context.strokeStyle = "rgba(255,0,0,01)"
        //this.context.lineWidth = 2
        /*
        if (_alpha != undefined) { this.context.globalAlpha = _alpha }
        else { this.context.globalAlpha = 1 } */
        //if (!_stroke) { this.context.stroke() }
        this.context.stroke()

        // fill tile
        //this.context.fillStyle = this.color;
        //if (_color != undefined) { this.context.fillStyle = _color }
        let debugColor = this.context.fillStyle
        //if (isopos.x == 1 || isopos.x == 0) { //console.log('point is ', isopos, ' and color is ', debugColor, ' although by info its ', (this.info ? this.info[[isopos.y, isopos.x]] : undefined), ' this.info is ', this.info) }
        this.context.fill();
        this.context.fillStyle = 'orange'
        //if (isOnMap(isopos, this.map)) {
            if (isOnMap({x: isopos.x , y: isopos.y}, this.map)) {
           // this.context.fillText('x: '+isopos.x+', y: '+isopos.y, x, y)
        }
    }



      IsoMap.prototype.findWay = function(position, end) {
        var queue = []
        let tmatrix = structuredClone(this.matrix)
        tmatrix[position[0]][position[1]] = 1
        queue.push([position]) // store a path, not just a position
        while (queue.length > 0) {
          var path = queue.shift() // get the path out of the queue
          var pos = path[path.length - 1] // ... and then the last position from it
          var direction = [
            [pos[0] + 1, pos[1]],
            [pos[0], pos[1] + 1],
            [pos[0] - 1, pos[1]],
            [pos[0], pos[1] - 1]
          ]
      
          for (var i = 0; i < direction.length; i++) {
            // Perform this check first:
            if (direction[i][0] == end[0] && direction[i][1] == end[1]) {
              // return the path that led to the find
              //console.log("RETURNING ", path.concat([end]))
              return path.concat([end])
            }
      
            if (
              direction[i][0] < 0 ||
              direction[i][0] >= tmatrix.length ||
              direction[i][1] < 0 ||
              direction[i][1] >= tmatrix[0].length ||
              tmatrix[direction[i][0]][direction[i][1]] != 0
            ) {
              continue
            }
      
            tmatrix[direction[i][0]][direction[i][1]] = 1
            // extend and push the path on the queue
            queue.push(path.concat([direction[i]]))
          }
        }
      }

          /**
     * @desc draw single shape - prism
     * @param object $isometricPosition - position on map { x: value, y: value }
     */
    IsoMap.prototype.drawPrism = function(isometricPosition, _color, _hide) {
        var screenPosition = this.convertIsometricToScreen(isometricPosition.x, isometricPosition.y);
        var x = screenPosition.x;
        var y = screenPosition.y;
        var tileWidth = this.tile.width;
        var tileHeight = this.tile.height;
        if (!_color && this.info[[isometricPosition.y, isometricPosition.x]] && this.info[[isometricPosition.y, isometricPosition.x]].color) {
            _color =  this.info[[isometricPosition.y, isometricPosition.x]].color
        }
        //_color ? _color = shadeColor(_color, getRandomInt(0, 20)) :
        // top
        this.context.beginPath();

        this.context.moveTo(x - tileWidth / 2, y - tileHeight);
        this.context.lineTo(x - tileWidth, y - tileHeight / 2);
        this.context.lineTo(x - tileWidth / 2, y);
        this.context.lineTo(x, y - tileHeight / 2);
        this.context.lineTo(x - tileWidth / 2,  y - tileHeight);
        
        this.context.fillStyle = '#555555';
        let multiplier = 3
        if (_color != undefined) { this.context.fillStyle = shadeColor(_color, 10*multiplier) }
        this.context.globalAlpha = 1
        this.context.fill();

        // left
        this.context.beginPath();

        this.context.moveTo(x - tileWidth, y - tileHeight / 2);
        this.context.lineTo(x - tileWidth, y + tileHeight / 2);
        this.context.lineTo(x - tileWidth / 2, y + tileHeight);
        this.context.lineTo(x - tileWidth / 2, y);
        this.context.lineTo(x - tileWidth, y - tileHeight / 2);

        this.context.fillStyle = '#444444';
        if (_color != undefined) { this.context.fillStyle = shadeColor(_color, 5*multiplier ) }
        this.context.fill();

        // right
        this.context.beginPath();

        this.context.moveTo(x - tileWidth / 2, y);
        this.context.lineTo(x, y - tileHeight / 2);
        this.context.lineTo(x, y + tileHeight / 2);
        this.context.lineTo(x - tileWidth / 2, y + tileHeight);
        this.context.lineTo(x - tileWidth / 2, y);

        this.context.fillStyle = '#777777';
        if (_color != undefined) { this.context.fillStyle = shadeColor(_color, 15*multiplier) }
        this.context.fill();
        //this.drawTile(x, y, shadeColor(_color, multiplier), this.context.globalAlpha, true)
        //this.drawTile(x, y, shadeColor(this.context.fillStyle, 5*multiplier), true)
    }
    4/** 
    * @desc 1
    * @params 1
    */
    IsoMap.prototype.redrawTiles = function(drawTiles) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        //if (drawTiles == undefined) { drawTiles == false }
        for (i = 0; i < this.map.width; i++) {
            for (j = 0; j < this.map.height; j++) {
                if (this.matrix[j] != undefined && this.matrix[j][i] != undefined && this.matrix[j][i] == 0 || (drawTiles == false || this.hidden == true)) {
                    let x = (i-j) * this.tile.width / 2 + this.position.x;
                    let y = (i+j) * this.tile.height / 2 + this.position.y;
                // calculate coordinates

                // draw single tile
                //let _color = undefined
                //if (this.info[[j,i]]) { _color = this.info[[j,i]].color }
                let color = undefined
                //if ((!drawTiles) && this.matrix[j][i] == 1) color = undefined
                //if (this.matrix[j][i] == 1) color = undefined
                if (this.info[[j,i]] != undefined) { color = this.info[[j,i]].color }
                this.drawTile(x, y, color); 
            }
            else if (this.matrix[j][i] == 1 && (drawTiles == true || this.hidden == false)) {
                //if (!drawTiles) { 
                    this.drawPrism({x: i, y: j}, this.info[[j,i]] ? this.info[[j,i]].color : undefined) 
                //else 
                //this.drawTile(x, y, this.info[[j,i]] ? this.info[[j,i]].color : undefined); 
            }
            }
        }
    }
    /**
     * @desc init map listeners
     */

    IsoMap.prototype.changeColor = function(pos, color, _stroke) {
        if (color && pos.x != undefined && pos.y != undefined) {
            this.info[[pos.y, pos.x]] = {color: color.color, name: color.name}
            //if (_stroke) { this.info[[pos.y,pos.x]].stroke = _stroke }
            //this.info[pos.y, pos.x]
        }
        this.redrawTiles()
    }


    const keyboardListener = (event) => {
        let key = event.key
        let code = event.code
        if (key == 'W' || key == 'w') {
            if (self.description != null && self.game == true) {
                responsiveVoice.speak(self.description, "Deutsch Female")
            }
        }
    }
    const mousedownListener = (event) => {
                    //console.log("ONMOUSEDOWN")
            //console.log(event)
            // console.log(self.game)
            var self = isoMap
            let mousePosition = getMousePosition(event);
            let isometricPosition = self.convertScreenToIsometric(mousePosition.x, mousePosition.y);
            if (self.game == true) {
                ////console.log("pognai")
            let mousePosition = getMousePosition(event);
            let isometricPosition = self.convertScreenToIsometric(mousePosition.x, mousePosition.y);
            //console.log(isometricPosition)
           // //console.log(this.map[isometricPosition.y])
            if (event.button == 0) {
                console.log(self.matrix)
                if ( isOnMap(isometricPosition, self.map) && (self.matrix[isometricPosition.y][isometricPosition.x] != 1) ) {
                //console.log("go")
                console.log([isometricPosition.x, isometricPosition.y])
                console.log(self.selected)
                console.log(self.areyousure)
                if (self.selected[0] == isometricPosition.y && self.selected[1] == isometricPosition.x) { console.log("go1"); self.areyousure++ }
                else { self.areyousure == 0; self.selected = structuredClone([isometricPosition.y, isometricPosition.x]) }
                //console.log(this.selected)
                //this.hidden = false
                self.redrawTiles(true)
                if (self.areyousure == 2) { 
                    
                    self.speak('Sind Sie sicher?', "Deutsch Female") }
                    self.redrawTiles(true)
                if (self.areyousure == 3) {
                    if (targetPoint[0] == self.selected[0] && targetPoint[1] == self.selected[1]) {
                        
                        self.speak("Richtig!", "Deutsch Female")
                        self.areyousure = 0
                        self.selected = [-1, -1]
                        //self.end()
                        for (const point of self.path) {
                            if (point != targetPoint && point != startingPoint) isoMap.changeColor({x: point[1], y: point[0]}, {color: '#0000FF'})
                        }

                        self.path = []
                        self.changeColor({x: targetPoint[1], y: targetPoint[0]}, {color: '#FF0000'})
                        self.redrawTiles(true)
                    }
                    else {
                        self.selected = [-1, -1]
                        self.areyousure = 0
                        self.speak("Falsch!", "Deutsch Female")
                        self.redrawTiles(true)
                    }
                }

            }
            else {
                console.log("undefined")
                self.selected = [-1, -1]
                self.redrawTiles(true)
                self.areyousure = 0
            }
            }
            else if (event.button == 2) {
                //this.hidden = !this.hidden
                //this.hidden = !this.hidden
                self.hidden = !self.hidden
                self.redrawTiles()
            }
        }
            //console.log(event.button)
            /*
            if (isOnMap(isometricPosition, self.map) && self.debug) {
                self.drawPrism(isometricPosition, '#BBAABB');
               // console.log(isometricPosition)
               //if (self.description) responsiveVoice.speak(self.description, "Deutsch Female");
                if (event.button == 0) {
                }
                else if (event.button == 2 ) {
                }
                self.redrawTiles()
            }  */
    }

    IsoMap.prototype.addListeners = function() {
        var self = this;
        this.canvas.addEventListener('mousedown', mousedownListener, false);
        document.addEventListener('keypress', keyboardListener)
    }

    IsoMap.prototype.removeListeners = function() {
        let self = this
        window.removeEventListener('contextmenu', mousedownListener, false )
        document.removeEventListener('keypress', keyboardListener)
    }

    const speakCallback = () => {
        if (buttonpause != undefined && buttonpause.innerHTML != "undefined") {
            buttonpause.innerHTML = "Audio anhalten"
        }
    }

        IsoMap.prototype.speak = (e, e1, e2) => {
            if (e2 != undefined && e2 == true) {
                console.log("GO SPEAK")
                let self = this
                let callbacker = () => {
                    console.log("callbacker called")
                    if (result[isoMap.phrasecount] != undefined) {
                        //while (isoMap.paused == true) { console.log("WAITING FOR END...")}
                        responsiveVoice.speak(result[isoMap.phrasecount], voice) }
                }
                let func = () => {
                    console.log("func called")
                    console.log(isoMap.phrasecount)
                    if (isoMap.phrasecount >= 0 && isoMap.phrasecount < result.length) {
                        console.log("if")
                        callbacker()
                        isoMap.phrasecount++
                        buttongocentre.innerHTML = isoMap.phrasecount + ". Schritte wiederholen"
                        isoMap.timer = setTimeout(func, isoMap.phrasedelay)  
                    }
                    else {
                        console.log("else")
                        isoMap.phrasecount = 0
                    }
                }
                isoMap.timer = setTimeout(() => {
                    func()

                }, this.phrasedelay)
            }
            else { 
                responsiveVoice.speak(e, (voice != undefined ? voice : "Deutsch Female"), {rate: (rate != undefined ? rate : 0.85), onend: speakCallback})
            }
        }

        
    
    const shadeColor = (color, percent) => {

        var R = parseInt(color.substring(1,3),14);
        var G = parseInt(color.substring(3,5),16);
        var B = parseInt(color.substring(5,7),16);
    
        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);
    
        R = (R<255)?R:255;  
        G = (G<255)?G:255;  
        B = (B<255)?B:255;  
    
        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    
        return "#"+RR+GG+BB;
    }
    IsoMap.prototype.findIntersections = function(path, matrix) {
        if (path && matrix) {
            let currenty = path[0][0]
            let currentx = path[0][1]
            let returnObject = []
            for (const value of path) {
                /*
                if ( (value[0] != currenty && value[1] == currentx) || (value[0] == currenty && value[1] != currentx) ) {
                    returnObject.push(value)
                } */
                let index = path.indexOf(value)
                currentx =value[0][1]
                currenty = value[0][0]
                if (path[index+1] && path[index-1] && (path[index+1][0] != path[index-1][0] && path[index+1][1] != path[index-1][1]) ) {
                    returnObject.push(value)
                }
            }
            return returnObject
        }
    }
    IsoMap.prototype.findInterestingPlaces = function(path, matrix) {
        console.log(matrix)
        let returnObjects = {regularObjects: [], diagonalObjects: [] }
        for (pos of path) {
        var direction = [
            [pos[0] + 1, pos[1]], // higher
            [pos[0], pos[1] + 1], // to the right
            [pos[0] - 1, pos[1]], // lower
            [pos[0], pos[1] - 1] // to the left
          ]
          let directionConvert = ["higher", "right", "lower", "left"]
          for(check of direction) {
              if (matrix[check[0]] && matrix[check[0]][check[1]]  != undefined && matrix[check[0]][check[1]] == 1) {
                  returnObjects.regularObjects.push({x: check[1], y: check[0], relative: directionConvert[direction.indexOf(check)]})
              }
          }
        var direction2 = [
            [pos[0] + 1, pos[1] + 1], // higher and righter)
            [pos[0] + 1, pos[1] - 1], // higher and lefter)
            [pos[0] - 1, pos[1] + 1], // lower and righter)
            [pos[0] - 1, pos[1] - 1] // lower and lefter)
        ]
        let directionConvert2 = ["higherrighter", "higherlefter", "lowerrighter", "lowerlefter"]
        for(check of direction2) {
            if (matrix[check[0]] && matrix[check[0]][check[1]]  != undefined && matrix[check[0]][check[1]] == 1) {
                returnObjects.diagonalObjects.push({x: check[1], y: check[0], relative: directionConvert2[direction2.indexOf(check)]})
            }
        }
    }
    returnObjects.diagonalObjects = returnObjects.diagonalObjects.filter(e => returnObjects.regularObjects.includes(e))
    return returnObjects
    }
    IsoMap.prototype.convertScreenToIsometric = function(x, y) {
        x = (x - this.position.x) / this.tile.width;
        y = (y - this.position.y) / this.tile.height;

        var isoX = Math.round(y + x) 
        var isoY = Math.round(y - x) -1

       return { x: isoX, y: isoY };
    };
    IsoMap.prototype.clearTile = function(isometricPosition) {
        if (isometricPosition && isometricPosition.x && isometricPosition.y) {
            this.matrix[isometricPosition.y][isometricPosition.x] = 0
        }
        this.redrawTiles()
    }
    IsoMap.prototype.convertIsometricToScreen = function(x, y) {
        var screenX = ( (x-y) * this.tile.width /2 ) + this.position.x;
        var screenY = ( (x+y) * this.tile.height /2 ) + this.position.y;

        return { x: screenX, y: screenY};
    };

    IsoMap.prototype.getDirectionPhrase = function(dir) {
        let phrases = {
            turnleft: ["Biegen Sie links ab.", "Biegen Sie links ab."],
            turnright: ["Biegen Sie rechts ab.", "Biegen Sie rechts ab."],
            turnbackwards: ["Kehren Sie um."],
            goforward: ["Gehen Sie {0} Zellen weiter.", "Gehen Sie {0} Zellen geradeaus."],
            goforwardc: ["Gehen Sie geradeaus zum {0}en Würfel.", "Gehen Sie weiter, bis Sie auf einen {0}en Würfel treffen."]
            //turnleft: ["Links abbiegen.", "Biegen Sie links ab.", "Drehen Sie sich nach links.", "Drehen Sie sich auf links.", "Nach links abbiegen.", "Abbiegung nach links.", "Linkskurve.", "Links."],
    //turnright:["Rechts abbiegen.", "Biegen Sie recht ab.", "Drehen Sie sich nach rechts.", "Drehen Sie sich auf rechts.", "Nach rechts abbiegen.", "Abbiegung nach rechts.", "Rechtskurve.", "Rechts."],
//turnbackwards: ["Umkehren.", "Kehren Sie um.", "Rückwärts drehen.", "Drehen Sie um.", "Umdrehen.", "Drehen Sie zurück.", "Drehen Sie um.", "Kehren Sie zurück.", "Zurückdrehen.", "Zurückkehren.", "Kehrtmachen."],
 //goforward: ["Gehen Sie {0} Zellen weiter.", "Gehen Sie {0} Zellen vorwärts.", "{0} Zellen weiter gehen.", "{0} Zellen vorwärts gehen.", "{0} Zellen nach vorne gehen.", "Machen Sie {0} Schritte vorwärts.", "Gehen Sie {0} Schritte vorwärts.", "Machen Sie {0} Schritte nach vorne.", "Gehen Sie {0} Schritte nach vorne.",
 //"{0} Schritte vorwärts machen.", "{0} Schritte geradeaus gehen.", "{0} Schritte geradeaus machen.", "{0} Schritte vorwärts gehen.", "{0} Schritte nach vorne machen.", "Gehen Sie {0} Mal vorwärts.", "Gehen Sie {0} Mal nach vorne.", "Gehen Sie {0} Mal weiter.", "{0} Mal nach vorne gehen.", "{0} Mal vorwärts gehen.", "{0} Mal weiter gehen.", "Machen Sie {0} Schritte weiter.", "Gehen Sie {0} Schritte weiter.", "Gehen Sie {0} Schritte geradeaus."],
//goforwardc: ["Gehen Sie nach vorne zum {0}en Würfel.", "Gehen Sie geradeaus zum {0}en Würfel.", "Gehen Sie vorwärts zum {0}en Würfel.", "Gehen Sie nach vorne, bis Sie auf einen {0}en Würfel treffen.", "Gehen Sie geradeaus, bis Sie auf einen {0}en Würfel treffen.", "Gehen Sie vorwärts, bis Sie auf einen {0}en Würfel treffen.", "Vorwärts zum {0}en Würfel gehen.", "Geradeaus zum {0}en Würfel gehen.", "Nach vorne zum {0}en Würfel gehen."]
}
if (dir != undefined) {
    let returnphrase = ""
    if (dir == "turnleft") { returnphrase = phrases.turnleft[getRandomInt(phrases.turnleft.length)] }
    else if (dir == "turnright") { returnphrase = phrases.turnright[getRandomInt(phrases.turnright.length)] }
    else if (dir == "goforward") { returnphrase = phrases.goforward[getRandomInt(phrases.goforward.length)] }
    else if (dir == "goforwardc") { returnphrase = phrases.goforwardc[getRandomInt(phrases.goforwardc.length)] }
    console.log(returnphrase)
    return returnphrase
}
    }
    IsoMap.prototype.describePath = function(path, _intersections, places, _targetPoint, _startingPoint) {
        let description
        if (path) {
            console.log(_intersections)
            description = ""
            /*
            let phrases = ["turnleft"="Drehen Sie sich nach links.", "turnright"="Drehen Sie sich nach rechts.", "turnbackwards"="Kehren Sie um.",
        "goforward"="Gehen Sie {0} Zellen weiter.", "goforwardc"="Gehen Sie nach vorne zum {0}en Würfel."] */
        let phrases = {
            turnleft: "Drehen Sie sich nach links.", 
            turnright: "Drehen Sie sich nach rechts.", 
            turnbackwards: "Kehren Sie um.",
    goforward: "Gehen Sie {0} Zellen weiter.",
     goforwardc: "Gehen Sie nach vorne zum {0}en Würfel."
    }
            let currentpath = path[0]
            let direction = []
            let tempdesc = ""
            for ( let a = 0;  a < (_intersections != undefined ? _intersections.length : 0); a++ ) {

                //if (currentpath == undefined) { currentpath = path[0] }
                if (a != 0 && _intersections[a-1]) { currentpath = _intersections[a-1] }
                //let direction = ""
                console.log("intersection: ", _intersections[a])
                //console.log(format(this.getDirectionPhrase("goforward") 228))
                let y = _intersections[a][0]
                let x = _intersections[a][1]
                let cube = false
                //console.log(intersections[a][0])
                console.log(currentpath[0])
                //console.log(this.matrix[y-1][x])
                if ( currentpath[0] < _intersections[a][0] && currentpath[1] == _intersections[a][1] ) {
                    direction[a] = "S"
                    if (this.matrix[y+1] != undefined && this.matrix[y+1][x] == 1) cube = true
                    if (direction[a-1] == undefined) { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnbackwards")) + " "
                    }
                    else if (direction[a-1] != undefined && direction[a-1] == "W") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                        //console.log("Turn right and go forward")
                    }
                    else if (direction[a-1] != undefined && direction[a-1] == "E") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                        //console.log("Turn left and go forward")
                    }
                        //tempdesc = tempdesc + format(phrases)
                        if (cube) { tempdesc = tempdesc + format(this.getDirectionPhrase("goforwardc"), this.info[[y+1, x]].name) + " " }
                        else { tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_intersections[a][0] - currentpath[0])) + " "};

                        console.log(tempdesc)

                } // lower?
                else if ( currentpath[0] > _intersections[a][0] && currentpath[1] == _intersections[a][1] ) {
                    direction[a] = "N"
                    console.log("N")
                    if (this.matrix[y-1] != undefined && this.matrix[y-1][x] == 1) cube = true            
                    //console.log(this.matrix[y-1] ? this.matrix[y-1][x] : "not defined")
                    if (direction[a-1] == undefined) { 
                        //tempdesc = tempdesc + format(this.getDirectionPhrase("turnright"))
                        console.log("Go forward")
                }
                    else if (direction[a-1] != undefined && direction[a-1] == "W") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                        //console.log("Turn left and go forward") 
                        
                }
                    else if (direction[a-1] != undefined && direction[a-1] == "E") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                        console.log("Turn right and go forward") }
                    //console.log("go higher")
                    if (cube) { tempdesc = tempdesc + format(this.getDirectionPhrase("goforwardc"), this.info[[y-1, x]].name) + " " }
                    else { tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_intersections[a][0] - currentpath[0])) + " "};
                    //if (direction[a])
                } // higfher?
                else if ( currentpath[0] == _intersections[a][0] && currentpath[1] < _intersections[a][1] ) {
                    direction[a] = "W"
                    if (this.matrix[y][x+1] != undefined && this.matrix[y][x+1] == 1) cube = true
                    if (direction[a-1] == undefined) { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                        console.log("Turn right and go forware") }
                    else if (direction[a-1] != undefined && direction[a-1] == "S") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                        console.log("Turn left and go forward") }
                    else if (direction[a-1] != undefined && direction[a-1] == "N") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                        console.log("Turn right and go forward") }
                    else if (direction[a-1] != undefined && direction[a-1] == "E") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                        console.log("Turn left and go forward") }
                        if (cube) { tempdesc = tempdesc + format(this.getDirectionPhrase("goforwardc"), this.info[[y, x+1]].name) + " " }
                        else { tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_intersections[a][1] - currentpath[1])) + " "};
                } // righter?
                else if ( currentpath[0] == _intersections[a][0] && currentpath[1] > _intersections[a][1] ) {
                    direction[a] = "E"
                    if (this.matrix[y][x-1] != undefined && this.matrix[y][x-1] == 1) cube = true
                    if (direction[a-1] == undefined) { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                        console.log("Turn left and go forward") }
                    else if (direction[a-1] != undefined && direction[a-1] == "S") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                        console.log("Turn right and go forward") }
                    else if (direction[a-1] != undefined && direction[a-1] == "N") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                        console.log("Turn left and go forward") }
                    else if (direction[a-1] != undefined && direction[a-1] == "W") { 
                        tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                        console.log("Turn right and go forward") }

                        if (cube) { tempdesc = tempdesc + format(this.getDirectionPhrase("goforwardc"), this.info[[y, x-1]].name) + " " }
                        else { tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_intersections[a][1] - currentpath[1])) + " "};
                } // lefter?
                console.log(tempdesc)
            }
            //if (_intersections.length == 1 ) { currentpath = _intersections[0] }
            _intersections.length == 0 ? currentpath = _startingPoint : currentpath = _intersections[_intersections.length-1]
            /*
            console.log("For end")
            console.log(currentpath)
            console.log(direction[direction.length-1])
            console.log(_targetPoint) */
                if (_targetPoint && direction[direction.length-1] != undefined) {
                    //console.log("start if")
                    let prevDirection = direction[direction.length-1]
                    //console.log(prevDirection)
                    if (currentpath[0] == _targetPoint[0] && currentpath[1] < _targetPoint[1]) {
                        console.log("righter, prevDirection: ", prevDirection)
                        if (prevDirection != undefined && prevDirection == "S") {  
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                            console.log("Turn left and go forward") }
                        else if (prevDirection != undefined && prevDirection == "N") {  
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                            console.log("Turn right and go forward") }
                        else if (prevDirection != undefined && prevDirection == "E") {   
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                            console.log("Turn left and go forward") }
                            tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_targetPoint[1] - currentpath[1])) + " "
                    } //righter
                    else if (currentpath[0] == _targetPoint[0] && currentpath[1] > _targetPoint[1]) {
                        console.log("lefter, prevDirection: ", prevDirection)
                        if (prevDirection != undefined && prevDirection == "S") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                            console.log("Turn right and go forward") }
                        else if (prevDirection != undefined && prevDirection == "N") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                            console.log("Turn left and go forward") }
                        else if (prevDirection != undefined && prevDirection == "W") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                            console.log("Turn right and go forward") }
                            tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_targetPoint[1] - currentpath[1])) + " "
                    } //lefter
                    else if (currentpath[0] > _targetPoint[0] && currentpath[1] == _targetPoint[1]) {
                        console.log("higher, prevDirection: ", prevDirection)
                        if (prevDirection != undefined && prevDirection == "W") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                            console.log("Turn left and go forward") }
                        else if (prevDirection != undefined && prevDirection == "E") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                            console.log("Turn right and go forward") }
                            tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_targetPoint[0] - currentpath[0])) + " "
                    }   // higher                
                    else if (currentpath[0] < _targetPoint[0] && currentpath[1] == _targetPoint[1]) {
                        console.log("lower, prevDirection: ", prevDirection)
                        if (prevDirection != undefined && prevDirection == "W") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnright")) + " "
                            console.log("Turn right and go forward") }
                        else if (prevDirection != undefined && prevDirection == "E") { 
                            tempdesc = tempdesc + format(this.getDirectionPhrase("turnleft")) + " "
                            console.log("Turn left and go forward") }
                            tempdesc = tempdesc + format(this.getDirectionPhrase("goforward"), Math.abs(_targetPoint[0] - currentpath[0])) + " "
                    } //lower
                }  
                console.log(tempdesc)
                description = tempdesc
        }
        return description
    }

    function findColor(pos) {
        if (this.matrix[pos[0]][pos[1]] != undefined) {

        }
    }

    function getMousePosition(event) {
        var canvas = event.target;
        var rect = canvas.getBoundingClientRect();

        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        };
    };

    function format (fmtstr) {
        var args = Array.prototype.slice.call(arguments, 1);
        return fmtstr.replace(/\{(\d+)\}/g, function (match, index) {
          return args[index];
        });
      }

    IsoMap.prototype.randomColor = () => {return Math.floor(Math.random()*16777215).toString(16)};

    function isOnMap(position, map) {
        if (position.x >= 0 && position.x < map.width 
            && position.y >= 0 && position.y < map.height) {
                return true;
        } else {
            return false;
        }
    };

    return IsoMap;
})();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  var synth = window.speechSynthesis;
  var isoMap = undefined
  let mapwidth = 10
  let mapheight = 10
  let params = {
    map: { width: 10, height: 10},
    screen: { width: 1366 , height:768 },
    tile: { width: 64*2, height: 32*2 },
    game: {ntiles: Math.round((mapwidth*mapheight)/3)}
}
let maximum = 350
let rate = 1
let button =  document.createElement("button")
let buttonrepeat = document.createElement("button")
let buttonseetext = document.createElement("button")
let buttonhide = document.createElement("button")
let buttonsettings = document.createElement("button")
let buttonshowanswer = document.createElement("button")
let buttonpause = document.createElement("button")
let buttongoleft = document.createElement("button")
buttongoleft.id = "buttonleft"
buttongoleft.innerHTML = "<<"
let buttongoright = document.createElement("button")
buttongoright.id = "buttonright"
buttongoright.innerHTML = ">>"
let buttongocentre = document.createElement("button")
buttongocentre.id = "buttoncentre"
let p = document.createElement('p')
p.id = "transcription"
//let rangeheight = document.getElementById("myRangeHeight")
//let rangewidth = document.getElementById("myRangeWidth")
//let rangetiles = document.getElementById("myRangeTiles")
let container = document.createElement("div")
let container2 = document.createElement("div")
let rangerate = document.createElement("INPUT")
let rangeratep = document.createElement('p')
rangerate.setAttribute("type", "range")
rangerate.min = 0.01
rangerate.step = 0.01
rangerate.max = 1.0
rangerate.value = rate
rangeratep.innerHTML = "Sprechtempo: " + Math.round((rangerate.value*100)) + "%"
rangerate.oninput = function() {
    rate = rangerate.value
    rangeratep.innerHTML = "Sprechtempo: " + Math.round((rangerate.value*100))+"%"
}
let rangetiles = document.createElement("INPUT")
let rangetilesp = document.createElement('p')
rangetiles.min = 1
rangetiles.value = params.game.ntiles
rangetiles.setAttribute("type", "range")
rangetiles.max = (params.map.width*params.map.height)*0.8
rangetilesp.innerHTML = "Anzahl der Würfel: " + params.game.ntiles
rangetiles.oninput = function() { 
    let value = rangetiles.value; 
    params.game.ntiles = value; 
    rangetilesp.innerHTML = "Anzahl der Würfel: " + params.game.ntiles 
}
let rangeheight = document.createElement("INPUT")
rangeheight.min = 1
rangeheight.value = params.map.height
let rangeheightp = document.createElement('p')
rangeheight.setAttribute("type", "range")
rangeheightp.innerHTML = "Größe der Karte: " + params.map.height
rangeheight.oninput = function() { 
    let value = rangeheight.value
    params.map.height = value 
    params.map.width = value
    //params.screen.width = params.tile.width*params.map.width
    //params.screen.height = params.tile.height*params.map.height
    /*
    rangetiles.max = params.map.height * params.map.width
    if (rangetiles.value > rangetiles.max && rangetiles.value != rangetiles.min) {
        rangetiles.value = rangetiles.max
        params.game.ntiles = rangetiles.value 
    }
    rangetilesp.innerHTML = "Anzahl der Würfel: " + params.game.ntiles  */
    rangeheightp.innerHTML = "Größe der Karte: " + params.map.height 
}

let rangewidth = document.createElement("INPUT")
let rangewidthp = document.createElement('p')
rangewidth.min = 1
rangewidth.value = params.map.width
rangewidth.setAttribute("type", "range")
rangewidthp.innerHTML = "Breite der Karte: " + params.map.width
rangewidth.max = (params.map.width*params.map.height)*0.8
rangewidth.oninput = function() { 
    let value = rangewidth.value; 
    params.map.width = value;
    /*
    rangetiles.max = params.map.height * params.map.width
    if (rangetiles.value > rangetiles.max && rangetiles.value != rangetiles.min) {
        rangetiles.value = rangetiles.max
       params.game.ntiles = rangetiles.value
    }
    rangetilesp.innerHTML = "Anzahl der Würfel: " + params.game.ntiles  */
    rangewidthp.innerHTML = "Breite der Karte: " + params.map.width 
}


//container.appendChild(rangewidth)
//container.appendChild(rangewidthp)
//container.appendChild(rangeheight)
//container.appendChild(rangeheightp)
container.appendChild(rangetiles)
container.appendChild(rangetilesp)
container.appendChild(rangerate)
container.appendChild(rangeratep)
//document.body.appendChild(rangeheight)
console.log(rangewidth)

button.innerHTML = "Neu Spiel"
buttonrepeat.innerHTML = "Die Anweisungen wiederholen"
buttonseetext.innerHTML = "Transkription anzeigen"
buttonhide.innerHTML = "Würfel ausblenden"
buttonshowanswer.innerHTML = "Antwort zeigen"
buttonsettings.innerHTML = "Einstellungen anzeigen"
buttonpause.innerHTML = "Audio anhalten"
buttongocentre.innerHTML = "Schritte wiederholen"
buttonpause.addEventListener("click", function() {
    if (buttonpause.innerHTML == "Audio anhalten" && responsiveVoice.isPlaying()) {
        //buttonpause.innerHTML = "Audio fortsetzen"
        responsiveVoice.cancel()
        //isoMap.paused = true
        clearTimeout(isoMap.timer)
    }
    else if (buttonpause.innerHTML == "Audio fortsetzen" ) {
        buttonpause.innerHTML = "Audio anhalten"
        responsiveVoice.resume()
        isoMap.paused = false
    }
})
button.addEventListener("click", function() {
    if (isoMap != undefined ) { 
        isoMap.matrix = []
        isoMap.info = []
        isoMap.targetPoint = []
        isoMap.startingPoint = []
        isoMap.selected = []
        isoMap.hidden = false
        isoMap.areyousure = 0
        isoMap.path = []
        isoMap.description = ""
        isoMap.screen = undefined
        isoMap.map = undefined
        isoMap.tile = undefined
        isoMap.position = undefined
        isoMap.phrasecount = 0
        // clear timer
        clearTimeout(isoMap.timer)
        isoMap.timer = undefined
        isoMap.removeListeners()
     }
    if (isoMap != undefined && isoMap.context != undefined) { isoMap.context.clearRect(0, 0, isoMap.canvas.width, isoMap.canvas.height) }
    init()
})

buttonsettings.addEventListener("click", function() {
    if (params != undefined) {
        if (buttonsettings.innerHTML == "Einstellungen anzeigen") {
            //let br = document.createElement("br")
            document.body.appendChild(container)
            buttonsettings.innerHTML = "Einstellungen schließen"
        }
        else if (buttonsettings.innerHTML == "Einstellungen schließen") {
            document.body.removeChild(container)
            buttonsettings.innerHTML = "Einstellungen anzeigen"
        }
    }
})
buttonrepeat.addEventListener("click", function() {
    if (isoMap != undefined && isoMap.description != "" && isoMap.description != undefined) {
        clearTimeout(isoMap.timer)
        isoMap.phrasecount = 0
        isoMap.speak(isoMap.description, "Deutsch Female", true)
    }
})
buttonseetext.addEventListener("click", function() {
    if (buttonseetext.innerHTML == "Transkription anzeigen") {
    if (isoMap != undefined && isoMap.description != "" && isoMap.description != undefined) {
        p.innerHTML = isoMap.description
        document.body.appendChild(p)
        buttonseetext.innerHTML = "Transkription schließen"
}
    }
    else if (buttonseetext.innerHTML == "Transkription schließen") {
        buttonseetext.innerHTML = "Transkription anzeigen"
        document.body.removeChild(p)
    }
})
buttonhide.addEventListener("click", function() {
    if (isoMap != undefined && isoMap.hidden != undefined) {
        if (buttonhide.innerHTML == "Würfel ausblenden") {
        isoMap.hidden = true
        isoMap.redrawTiles()
        buttonhide.innerHTML = "Würfel zeigen"
        }
        else if (buttonhide.innerHTML == "Würfel zeigen") {
            isoMap.hidden = false
            isoMap.redrawTiles()
            buttonhide.innerHTML = "Würfel ausblenden"
        }
    }
})
buttonshowanswer.addEventListener("click", function() {
    if (isoMap != undefined && isoMap.game === true) {
        if (buttonshowanswer.innerHTML == "Antwort zeigen") {
            if (isoMap.targetPoint != undefined && isoMap.targetPoint.length != undefined) {
                isoMap.changeColor({x: targetPoint[1], y: targetPoint[0]}, {color: '#FF0000'})
            }
            buttonshowanswer.innerHTML = "Antwort ausblenden"
        }
        else if(buttonshowanswer.innerHTML == "Antwort ausblenden") {
            isoMap.changeColor({x: targetPoint[1], y: targetPoint[0]}, {color: isoMap.color})
            buttonshowanswer.innerHTML = "Antwort zeigen"
        }
    }
})
buttongocentre.addEventListener("click", function() {
    if (isoMap != undefined) {
    clearTimeout(isoMap.timer)
    responsiveVoice.cancel()
    let newvalue = isoMap.phrasecount - 1
    if (newvalue >= 0 && newvalue < result.length) {
        isoMap.speak(result[newvalue], "Deutsch Female")
    }
}
})
buttongoright.addEventListener("click", function() {
    if (isoMap != undefined) {
    clearTimeout(isoMap.timer)
    if (isoMap.phrasecount + 1 <= result.length) { isoMap.phrasecount++}
    buttongocentre.innerHTML = isoMap.phrasecount + ". Schritte wiederholen"
    }
})
buttongoleft.addEventListener("click", function() {
    if (isoMap != undefined) {
    clearTimeout(isoMap.timer)
    let newvalue = isoMap.phrasecount - 1
    if (newvalue >= 1) {
        isoMap.phrasecount = newvalue
    }
    buttongocentre.innerHTML = isoMap.phrasecount + ". Schritte wiederholen" 
}
})
container2.appendChild(buttongoleft)
container2.appendChild(buttongocentre)
container2.appendChild(buttongoright)
document.body.appendChild(button)
document.body.appendChild(buttonrepeat)
document.body.appendChild(buttonseetext)
document.body.appendChild(buttonhide)
document.body.appendChild(buttonshowanswer)
document.body.appendChild(buttonsettings)
document.body.appendChild(buttonpause)
// left
//document.body.appendChild(buttongoleft)
//document.body.appendChild(buttongocentre)
//document.body.appendChild(buttongoright)
document.body.appendChild(container2)
// right
window.addEventListener('contextmenu', event => event.preventDefault())
//let voice = (getRandomInt(2) == 0 ? "Deutsch Female": "Deutsch Male")
voice = "Deutsch Female"
const start = () => {
    isoMap = new IsoMap(params)
    isoMap.matrix = []
    //isoMap.map = []
    isoMap.hidden = false
    isoMap.game = false
    isoMap.areyousure = 0
    isoMap.description = ""
    isoMap.info = []
    isoMap.startingPoint = []
    isoMap.targetPoint = []
isoMap.create()
isoMap.end = () => { start(); init(); }
clear()
init()
}
const clear = () => {
    /*
    isoMap.hidden = false
isoMap.game = false
isoMap.areyousure = 0
isoMap.description = ""
isoMap.info = []
isoMap.startingPoint = []
isoMap.targetPoint = [] */
}
let result = []
const init = () => {
    responsiveVoice.cancel()
    //voice = (getRandomInt(2) == 0 ? "Deutsch Female": "Deutsch Male")
    voice = "Deutsch Female"
    console.log("lets go")
    console.log(params.game.ntiles)
    console.log(params.map.height)
    console.log(params.map.width)
    try { document.body.removeChild(p) } catch{}
    buttonseetext.innerHTML = "Transkription anzeigen"
    buttonhide.innerHTML = "Würfel ausblenden" 
    buttonshowanswer.innerHTML = "Antwort zeigen"
    buttonpause.innerHTML = "Audio anhalten"
    isoMap = new IsoMap(params)
    //console.log(isoMap)
    isoMap.create()
    isoMap.end = init
    isoMap.path = []
//let colors = ["#990099", "BA8000", "#404040"]
//let colors = [{color: "#808080", name:"}, "#C0C0C0", "#000080", "#008080", "#008080", "#800000", "#800080", "#808000", "#F0F8FF", "#7FFFD4", "#A52A2A", "#DEB887", "#5F9EA0", "#D2691E", "#FF7F50"]
let colors = [{color: "#808080", name: "Grau"}, 
//{color: "#C0C0C0", name: "Silber"}, 
//{color: "#000080", name: "Marinenblau"}, 
{color: "#008080", name: "Krickentengrün"}, {color: "#008000", name: "Grün"}, 
{color: "#800000", name: "Kastanie"}, {color: "#800080", name: "Purpur"}, 
//{color: "#FF00FF ", name: "Fuchsia"}, 
{color: "#808000", name: "Olivgrün"}, 
//{color: "#F0F8FF", name: "Eisfarben"}, 
{color: "#7FFFD4", name: "Aquamarinblau"}, 
//{color: "#F5F5DC", name: "Beige"}, 
{color: "#A52A2A", name: "Braun"}, {color: "#5F9EA0", name: "Kadettenblau"}, {color: "#D2691E", name: "Schokolade"}, {color: "#6495ED", name: "Kornblumenblau"}, {color: "#DC143C", name: "Karmesinrot"}, 
{color: "#008B8B", name: "Dunkeltürkis"}, {color: "#FF8C00", name: "Dunkelorange"}, 
//{color: "#FFD700", name: "Gold"}, 
{color: "#DA70D6", name: "Orchidee"}, {color: "#4682B4", name: "Stahlblau"}, {color: "#FF1493", name: "Tiefrosa"}  ] 

//let colors = [{color: "rgba(130, 40, 0, 0.5)", name: "test"}]
let colorsdict = []
//colorsdict["#990099"] = "rosa"; colorsdict["#BA8000"] = "orange"; colorsdict["#404040"] = "schwarz"
//console.log(getRandomInt(3))
//targetPoint = [0,0]
//startingPoint = [0,0]
let distance = 0
let path = []

for ( let a = 0; a < params.game.ntiles; a++) {
    let randomy = getRandomInt(isoMap.map.height)
    let randomx = getRandomInt(isoMap.map.width)
    //if ( (randomx != startingPoint[1] && randomy != startingPoint[0]) && (randomx != targetPoint[1] && randomy != targetPoint[0]) )
    isoMap.matrix[randomy][randomx] = 1
    //let randomcolor = "#"+isoMap.randomColor()
    //console.log(randomcolor)
    let ro = colors[getRandomInt(colors.length)]
    let color = ro.color
    //console.log(ro)
    //console.log(randomx, randomy)
    isoMap.changeColor({x: randomx, y:randomy}, ro)
    //isoMap.matrix[getRandomInt(isoMap.map.width)]
}
let attempts = 0
do { startingPoint = [getRandomInt(isoMap.map.height), getRandomInt(isoMap.map.width)]; targetPoint = [getRandomInt(isoMap.map.height-1), getRandomInt(isoMap.map.width)]; 
    path = isoMap.findWay(startingPoint, targetPoint);
    attempts++
    console.log("attempts:", attempts)
    if (attempts > maximum) { break; } 
 } while (startingPoint == targetPoint || (!path || !path.length || path.length < (isoMap.map.width+isoMap.map.height)/2) 
 || (isoMap.matrix[startingPoint[0]][startingPoint[1]] == 1 || isoMap.matrix[targetPoint[0]][targetPoint[1]] == 1) 
 ); 
 if (attempts > maximum) {
     console.log("TOO MANY ATTEMPTS")
     params.game.ntiles = (params.game.ntiles*0.9)
     init()
 }
 else {
 isoMap.path = path
//console.log("target: ", targetPoint)
//console.log("starting: ", startingPoint)
//console.log('path.length: ', path.length)
////console.log("way: ", isoMap.findWay(startingPoint, targetPoint, isoMap.matrixCopy))
//let way = isoMap.findWay(startingPoint, targetPoint, isoMap.matrixCopy)
isoMap.changeColor({x: startingPoint[1], y: startingPoint[0]}, {color: '#00FF00'})
//isoMap.changeColor({x: targetPoint[1], y: targetPoint[0]}, {color: '#FF0000'})
//isoMap.changeColor({x: 0, y:12}, '#ccba0a')
//isoMap.changeColor({x: 1, y:12}, '#ccba0a')
//isoMap.redrawTiles()

for (const point of path) {
    //console.log(point)
    if (point != targetPoint && point != startingPoint) {
        //isoMap.changeColor({x: point[1], y: point[0]}, {color: '#0000FF'})
    }
} 
//isoMap.redrawTiles()
let places =isoMap.findInterestingPlaces(path, structuredClone(isoMap.matrix))
////console.log(places)
for (const value of places.regularObjects) {
    ////console.log(value)
    //isoMap.changeColor({x: value.x, y: value.y}, '#0296D9')
}
for (const value of places.diagonalObjects) {
    ////console.log('diagonal')
    ////console.log(value)
    //isoMap.changeColor({x: value.x, y: value.y}, '#EC7B5A')
}
isoMap.redrawTiles()
//console.log()
let intersections = isoMap.findIntersections(path, structuredClone(isoMap.matrix))
let description = isoMap.describePath(structuredClone(path), structuredClone(intersections), structuredClone(places), structuredClone(targetPoint), structuredClone(startingPoint))
//console.log(description)
isoMap.description = description
console.log("Description: ", description)
result = description.match( /[^\.!\?]+[\.!\?]+/g )
//isoMap.phrasecount = result.length
//if (result != undefined) { i }
console.log("Result:", result)
isoMap.redrawTiles(true)
let seta = false
isoMap.speak(description, "Deutsch Female", true)
let suck1 = (e) => { isoMap.redrawTiles(e); if (!seta) {setTimeout(suck1, 4.5*1000, !e); seta = true; isoMap.game = true } }
setTimeout(suck1, 1.5*1000, false)
 }

//setTimeout(suck1, 1500, true)
//isoMap.drawPrism({ x: 5, y: 5});
//isoMap.clearTile({x: 5, y:5}); isoMap.changeColor({x:5, y:5}, isoMap.color)
//isoMap.drawPrism({ x: 8, y: 7});


/*         this.matrix[3][0] = 1
        //setColor({x: 5, y: 5}, '#00FF00')
        this.info[[3,0]] = {color: '#ccba0a'}
        this.info[[5,0]] = {color: '#00FF00'}
        this.info[[7,7]] = {color: '#FFFF00'}
        this.info[[14,0]] = {color: '#BBBBBB'} */

}


//isoMap = new IsoMap(params)
//isoMap.end = init
//init()
//clear()
//init()