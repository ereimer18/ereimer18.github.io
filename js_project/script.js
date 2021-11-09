/**
 * Welcome to Lunar Lander!
 * The goal is to land your ship on top of the target at a safe speed of 3 pixels/second or less
 * As levels advance, gravitational force increases and the targets begin to move
 * You have 3 ships to attempt to land before the game is over and you lose your score
 * Hitting the ground or the sides of the target will destroy a ship.
 * Each ship has limited fuel, so watch that!
 * 
 * Controls are 'Enter' to begin playing, 'Space' to thrust, and left/right arrow keys to rotate
 * 
 * This game was inspired by watching the Asteroids tutorial from freeCodeCamp.org (https://www.youtube.com/watch?v=H9CSWMxJx84&t=4219s).
 * I followed and used code from part 1 of the tutorial, "Spaceship creation" to draw and move the spaceship: https://drive.google.com/file/d/1Gpwsi3LroGM0A0kJCwET-DA9JN1rx8ME/view
 * I also used the explosion function and animation from part 3, "Collision Detection and Explosions" to animate my explosions: https://drive.google.com/file/d/1G7uwqyL1rMUHYUN_ogH7Zx3oHr0jZIs9/view
 * 
 * Enjoy my game!
 * 
 */


const FPS = 30; // frames per second
const FRICTION = 0.6; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const GRAVITY = 4; // downward acceleration of the ship in pixels per second per second when falling
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 6; // acceleration of the ship in pixels per second per second
const TURN_SPEED = 360; // turn speed in degrees per second
const SHIP_FUEL = 250; // arbitrary amount of fuel available 
const SHIP_EXPLODE_DUR = 0.3; // duration of the ship's explosion in seconds
const LIVES = 3; // the number of lives before game over
const MAX_SPEED = 3; // the maximum landing speed to not explode

/** @type {HTMLCanvasElement} */ 
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

// set this canvas to the screen dimensions
canv.setAttribute('width', window.innerWidth);
canv.setAttribute('height', window.innerHeight);

// calculate random target position and dimensions
let setTargetX = () => Math.random() * canv.width;
let setTargetY = () => Math.random() * (canv.height / 2) + (canv.height / 2);
let setTargetWidth = () => Math.random() * 100 + 20;
let setTargetHeight = () => Math.random() * 100 + 20;
let setDirection = () => (Math.round(Math.random()) * 2 - 1) + (Math.round(Math.random()) * 2 - 1)

// initialize the ship and globals
let ship = newShip();
let target = newTarget();
let score = 0;
let topScore = 0;
let playing = false;


// set up the spaceship object
function newShip() {
    return {
        x: 15,
        y: canv.height / 2,
        r: SHIP_SIZE / 2,
        angle: 90 / 180 * Math.PI, // convert to radians
        rot: 0,
        thrustSpeed: SHIP_THRUST,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        },
        fuel: SHIP_FUEL,
        lives: LIVES,
        explodeTime: 0
    }
}


// set up the landing target
function newTarget() {
    return {
        x: setTargetX(),
        y: setTargetY(),
        width: setTargetWidth(),
        height: setTargetHeight(),
        directionX: setDirection(),
        directionY: setDirection()
    }
}


// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 32: // space (thrust the ship up)
            ship.thrusting = true;
            break;
        case 37: // left arrow (rotate ship left)
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 39: // right arrow (rotate ship right)
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 13: // enter (start game)
            playing = true;
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 32: // space (stop thrusting)
            ship.thrusting = false;
            break;
        case 37: // left arrow (stop rotating left)
            ship.rot = 0;
            break;
        case 39: // right arrow (stop rotating right)
            ship.rot = 0;
            break;
    }
}


// reset the position and values of the existing ship
function resetShip() {
    ship.thrust.y = 0; 
    ship.x = 15;
    ship.y = canv.height / 2;
    ship.angle = 90 / 180 * Math.PI; // convert to radians
    ship.rot = 0;
    ship.thrusting = false;
    ship.thrust.x = 0;
    ship.thrust.y = 0;
    ship.fuel = SHIP_FUEL;
    ship.explodeTime =  0;
}


// create a new ship if no more lives are left and return to start or reset the ship
function destroyShip() {
    if (ship.lives <= 1) {
        if (score > topScore) {
            topScore = score;
        }
        score = 0;
        target = newTarget();
        ship = newShip();
        playing = false;
    }
    else {
        ship.lives--;
        resetShip();
    }
}


// triggers the exploding flag and the duration of the explosion
function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
    ship.thrust.x = 0;
    ship.thrust.y = 0;
}


// display start screen with game instructions, wait for player to start
function start() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "white";
    ctx.font = '25px Arial';
    ctx.fillText("vertical speed: " + parseInt(ship.thrust.y) * -1, 15, 40);
    ctx.fillText("fuel: " + parseInt(ship.fuel / 2.5) + "%", 15, 70);
    ctx.fillText("lives: " + ship.lives, 15, 100);
    ctx.fillText("top score: " + topScore, canv.width - 120, 40);
    ctx.fillText("score: " + score, canv.width - 120, 70);
    ctx.font = '28px Arial';
    ctx.fillText("Welcome to Lunar Lander!", 15, canv.height/2);
    ctx.fillText("You must try to land on top of the target", 15, canv.height/2 + 50);
    ctx.fillText("Don't hit the ground or land faster than a speed of 3 px/s", 15, canv.height/2 + 100);
    ctx.fillText("Lastly, watch your fuel! Good Luck!", 15, canv.height/2 + 150);
    ctx.fillText("Use 'Space' to thrust and the right/left arrow keys to rotate", 15, canv.height/2 + 250);
    ctx.fillText("Hit 'Enter' to begin", 15, canv.height/2 + 300);
}


// interval containing main game logic
function update() {

    // wait for player to start game
    if (!playing) {
        start();
    }
    else {
        let exploding = ship.explodeTime > 0;

        // draw space
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = "white";
        ctx.font = '25px Arial';
        ctx.fillText("vertical speed: " + parseInt(ship.thrust.y) * -1, 15, 40);
        ctx.fillText("fuel: " + parseInt(ship.fuel / 2.5) + "%", 15, 70);
        ctx.fillText("score: " + score, canv.width - 120, 40);
        ctx.fillText("lives: " + ship.lives, canv.width - 120, 70);


        if (exploding) {
            ship.explodeTime--;
            if (ship.explodeTime <= 0) {
                destroyShip();
            }
            // draw the explosion (concentric circles of different colours)
            ctx.fillStyle = "darkred";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
        }
        else {
            // cancel thrusting if out of fuel
            if (ship.fuel <= 0) {
                ship.thrusting = false;
            }

            // if the ship lands on top of the target
            if ((ship.y + ship.r >= target.y) && (ship.y < target.y) && ((ship.x + ship.r) > target.x) && (ship.x - ship.r) < (target.x + target.width)) {
                if (ship.thrust.y < MAX_SPEED && ship.thrust.x < MAX_SPEED && !exploding) {
                    score++;
                    resetShip();
                    target = newTarget();
                    // increase ship speed
                    if (score % 6 == 0) {
                        ship.thrustSpeed++;
                    }
                }
                else {
                    explodeShip();
                }
            }
            // if the ship hits the bottom of the screen
            else if (ship.y + ship.r > canv.height) {
                explodeShip();
            }
            // if the ship hits the side or botton of the target
            else if ((ship.x + ship.r) > target.x && (ship.x - ship.r) < (target.x + target.width) && (ship.y + ship.r > target.y) && (ship.y - ship.r < (target.y + target.height))) {
                explodeShip();
            }
            // thrust the ship
            else if (ship.thrusting) {
                ship.thrust.x += ship.thrustSpeed * Math.cos(ship.angle) / FPS;
                ship.thrust.y -= ship.thrustSpeed * Math.sin(ship.angle) / FPS;

                // expend fuel
                ship.fuel--;

                // draw the thruster tail
                if (!exploding) {
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = SHIP_SIZE / 10;
                    ctx.beginPath();
                    ctx.moveTo( // rear left
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.angle) + 0.5 * Math.sin(ship.angle)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.angle) - 0.5 * Math.cos(ship.angle))
                    );
                    ctx.lineTo( // rear centre (behind the ship)
                        ship.x - ship.r * 5 / 3 * Math.cos(ship.angle),
                        ship.y + ship.r * 5 / 3 * Math.sin(ship.angle)
                    );
                    ctx.lineTo( // rear right
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.angle) - 0.5 * Math.sin(ship.angle)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.angle) + 0.5 * Math.cos(ship.angle))
                    );
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
            // apply friction and gravity to the ship
            else {
                // apply friction (slow the ship down when not thrusting)
                ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
                if (ship.thrust.y < 0) {
                    ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
                }
                
                // apply gravity
                // as score increases so does gravity
                if (!exploding) {
                    ship.thrust.y += (GRAVITY + ((score / 5) ** 2)) / FPS;
                }
                
            }

            // draw the triangular ship
            ctx.strokeStyle = "white";
            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo( // nose of the ship
                ship.x + 4 / 3 * ship.r * Math.cos(ship.angle),
                ship.y - 4 / 3 * ship.r * Math.sin(ship.angle)
            );
            ctx.lineTo( // rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.angle) + Math.sin(ship.angle)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.angle) - Math.cos(ship.angle))
            );
            ctx.lineTo( // rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.angle) - Math.sin(ship.angle)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.angle) + Math.cos(ship.angle))
            );
            ctx.closePath();
            ctx.stroke();

            // draw the landing target
            ctx.strokeStyle = "white";
            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo( // top left corner
                target.x,
                target.y
            );
            ctx.lineTo( // top right
                target.x + target.width,
                target.y
            );
            ctx.lineTo( // bottom right
                target.x + target.width,
                target.y + target.height
            );
            ctx.lineTo( // bottom left
                target.x,
                target.y + target.height
            );
            ctx.closePath();
            ctx.stroke();

            // rotate the ship
            ship.angle += ship.rot;

            // move the ship
            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;

            // move the target horizontally if level 4 has been reached
            if (score >= 4) {
                if (target.x <= 0 || (target.x + target.width) >= canv.width) {
                    target.directionX *= -1;
                }
                target.x += target.directionX;
            }
            // move the target vertically if level 7 has been reached
            if (score >= 7) {
                if (target.y <= 0 || (target.y + target.height) >= canv.height) {
                    target.directionY *= -1;
                }
                target.y += target.directionY;
            }

            // handle screen edges to bounce off the sides
            if (ship.x < 0 + ship.r) {
                ship.thrust.x = 1;
            } 
            else if (ship.x > canv.width - ship.r) {
                ship.thrust.x = -1;
            }
        }
        
    }

}