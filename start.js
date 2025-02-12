var simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

var Level = class Level {
    constructor (plan) {
        let rows = plan.trim().split("\n").map(l => [...l]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];

        this.rows = rows.map((row,y) => {
            return row.map ((ch,x) => {
                let type = levelChars[ch];
                if (typeof type != "string") {
                    let pos = new Vec(x,y);
                    this.startActors.push(type.create(pos, ch));
                    type = "empty";                    
                }
                return type;                
            })
        })
    }
    
    touches (pos, size, type) {
        let xStart = Math.floor(pos.x);
        let xEnd = Math.ceil(pos.x + size.x);
        let yStart = Math.floor(pos.y);
        let yEnd = Math.ceil(pos.y + size.y);

        for (let y = yStart; y < yEnd; y++) {
            for (let x = xStart; x < xEnd; x++) {
                let isOutside = x < 0 || x > this.width || y < 0 || y > this.height;
                let here = isOutside ? "wall" : this.rows[y][x];
                if (here == type) return true;
            }
        }
        return false;   
    }
}

var State = class State {
    constructor (level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }
    static start(level) {
        return new State(level, level.startActors, "playing");
    }
    get player() {
        return this.actors.find(a => a.type == "player");
    }
    update (time, keys) {
        let actors = this.actors.map (actor => actor.update(time, this, keys));
        let newState = new State (this.level, actors, this.status);
        if (newState.status != "playing") return newState;
    }
}