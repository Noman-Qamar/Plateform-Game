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
        let player = newState.player;
        if (this.level.touches(player.pos, player.size, "lava")) {
            return new State (this.level, actors, "lost");            
        }
        for (let actor of actors) {
            if (actor != player && overlap (actor, player)) {
                newState = actor.collide(newState);
            }
        }
        return newState;
    };
}

var Vec = class Vec {
    constructor (x, y) {
        this.x = x; this.y = y;
    }
    plus(other) {
        return new Vec (this.x + other.x, this.y + other.y);
    }
    times(factor) {
        return new Vec (this.x * factor, this.y * factor);
    }
}

var Player = class Player {
    constructor (pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
    get type () {return "player";}
    get size () {return new Vec(0.8, 1.5);}

    static create (pos) {
        return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0,0));
    }

    update(time, state, keys) {
        
    }
}
function overlap(actor1, actor2) {
    return  actor1.pos.x < actor2.pos.x + actor2.size.x &&
            actor1.pos.x + actor1.size.x > actor2.pos.x &&
            actor1.pos.y < actor2.pos.y + actor2.size.y &&
            actor1.pos.y + actor1.size.y > actor2.pos.y    
}