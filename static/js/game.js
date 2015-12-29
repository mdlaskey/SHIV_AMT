//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");

if(document.body != null){  
	var background = document.getElementById("background").className;
	var roboCoach = (document.getElementById("roboCoach").className == 'true')
	var expert = (document.getElementById("expertCoach").className == 'true')
	var summer = (document.getElementById("summer").className == 'true')
	var fnl = (document.getElementById("final").className == 'true')
	document.getElementById('next').style.visibility = 'hidden'
}

console.log(background+" "+roboCoach+" "+expert+" "+summer+" "+fnl)

var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
started = false

//
//document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();

bgImage.src = background;
bgImage.onload = function () {
	bgReady = true;
};
// Car image
var carReady = false;
var carImage = new Image();

carImage.src =  "static/images/human_ 0.png";
carImage.onload = function () {
	carReady = true;
};

// Speed Up image
var upReady = false;
var upImage = new Image();
upImage.src =  "static/images/green_car.png";
upImage.onload = function () {
	upReady = true;
};


// Speed Down image
var downReady = false;
var downImage = new Image();
downImage.src =  "static/images/red_car.png";
downImage.onload = function () {
	downReady = true;
};

// Game objects
var car = {
	v: 0, // movement in pixels per second
	theta: Math.PI,
	x: canvas.width/2,
	y: canvas.width/2, 
	x_f:-395.36474681, 
	y_f:499.29913709,
	ref_speed: 5,
	help: 0,
	low: false,
	interval: 45,
	t: 45
};


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var reset_car = function(complete){
	car.v = 0, // movement in pixels per second
	car.theta = Math.PI,
	car.x = canvas.width/2,
	car.y = canvas.width/2, 
	car.x_f = -395.36474681, 
	car.y_f = 499.29913709,
	car.ref_speed = 5,
	car.help = 0,
	car.low = false,
	interval = 45,
	car.t = 45,
	fdbback = 0
	if(!complete){
		started = false
	}


}

var car_dyn = function(angle,acc){
	w = 20
	
	car.x = car.x - car.v*Math.cos(car.theta)
	car.y = car.y - car.v*Math.sin(car.theta)
	car.x_f = car.x_f - car.v*Math.cos(car.theta)
	car.y_f = car.y_f - car.v*Math.sin(car.theta)
	car.theta = car.theta - car.v*Math.tan(angle)/w
	car.v = car.v + acc
	console.log(car.x+" "+car.y)

}


var inOil = function(){

	if(car.x > 1020 && car.x < 1400){
		if(car.y > 165 && car.y < 520){
			return true
		}
	}

	// if(car.x > 1330 && car.x < 1780){
	// 	if(car.y > 350 && car.y < 670){
	// 		return true
	// 	}
	// }

	return false
}


var expertCoach = function(){
	if(car.help == 0){
		fdbback = 0
	}
	else if(car.help < 0){
		fdbback = -1
	}
	else{
		fdbback = 1
	}
}

var pumpedBrakes = function(){

	if(car.t < car.interval){ 
		car.t++; 
	}
	else{ 
		car.t = 0
		if(car.low){ 
			car.ref = car.v 
			car.low = false
		}
		else{
			car.ref = car.v
			car.low = true
		}
	}
	console.log("REF "+car.ref + " V "+car.v + " LOW " + car.low + " T " +car.t)

	if(car.low && car.v >= car.ref){
		car.help = -1
		return 1
	}
	else if(!car.low && car.v <= car.ref){
		car.help = 1
		return 1
	}
	else{
		car.help = 0
		return 0
	}
		
	
}
var dynamics = function(angle,acc){
	if(!inOil()){
		car.ref = car.ref_speed
		car.help = 0
		out = true
	}
	else if(!summer && inOil()){ 
		if(out){
			out = false
			car.v= car.ref_speed
		}

		val = pumpedBrakes()
		
		if(val > 0.0){
			angle = 0.1*angle-.15
		}
	}
	car_dyn(angle,acc)
	if(inOil() && !summer){
		if(car.v > car.ref_speed+1){
			car.v = car.ref_speed+1
		}
		else if(car.v < car.ref_speed-1){ 
			car.v = car.ref_speed-1
		}
	}

	if(!inOil() || summer){
		if(car.v > 6){
			car.v = 6
		}
	}
	if(car.v < 4){ 
		car.v = 4
	}
}

var make_data= function (){
	data = []
	data.push({
		key: "x",
		value: -(car.x-1700)+(canvas.width/2 - 1385)
	})
	data.push({
		key: "y",
		value: (car.y-1700)-(canvas.width/2 - 1187)
	})
	data.push({
		key: "theta",
		value: car.theta
	})
	data.push({
		key: "v",
		value: car.v
	})
	return data
}

var start = function (modifier){
	if(! started){
		document.getElementById('text').style.visibility = 'visible'
	}
	if(13 in keysDown){
		started = true
		document.getElementById('text').style.visibility = 'hidden'
	}
}

// Update game objects
var update = function (modifier) {
	acc = 0
	angle = 0

	state = []
	
	
	if (38 in keysDown) { // Player holding up
		acc = 1;
	}
	if (40 in keysDown) { // Player holding down
		acc = -1;
	}
	if (37 in keysDown) { // Player holding left
		angle = 0.1;
	}
	if (39 in keysDown) { // Player holding right
		angle = -0.1;
	}

	state = make_data()
	state.push({
		key: "angle",
		value: angle
	})
	state.push({
		key: "v",
		value: acc
	})


	if(inOil()){

		$.ajax('http://128.32.164.66:5000/get_help', {
	                type: "GET",
	                data: state
	                });
		
		if(roboCoach){
			$.ajax('http://0.0.0.0:5000/get_stuff', {
		                dataType: 'jsonp',
		    			 // The name of the callback parameter, as specified by the YQL service
		    			jsonp: "callback",
		 
						// Work with the response
						success: function( response ) {
						     // server response
						    
						    fdbback = parseFloat(response.user)
						    console.log( fdbback);
						}
			});
		}
		else if(expert){
			expertCoach()
		}
	}

	dynamics(angle,acc)

};


var TO_RADIANS = Math.PI/180; 
function drawRotatedImage(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 
 
	// move to the middle of where we want to draw our image
	ctx.translate(x, y);
 
	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle) //* TO_RADIANS);
 
	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width/2), -(image.height/2));
 
	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}



fdbback = 0;
// Draw everything
var render = function () {
	if (bgReady) {

		//ctx.drawImage(bgImage, car.x-1385, car.y-1187);

		ctx.drawImage(bgImage, car.x-1700, car.y-1700);
		//ctx.drawImage(bgImage, car.x,car.y);
	}


	if(inOil() && (roboCoach || expert)){
		
		if(fdbback == 0 && carReady){
			drawRotatedImage(carImage, canvas.width/2, canvas.height/2,car.theta);
		}
		else if(fdbback == -1 && downReady){
			drawRotatedImage(downImage, canvas.width/2, canvas.height/2,car.theta);
		}
		else if(fdbback == 1 && upReady){
			drawRotatedImage(upImage, canvas.width/2, canvas.height/2,car.theta);
		}
	}
	else{ 
		if(carReady){
			drawRotatedImage(carImage, canvas.width/2, canvas.height/2,car.theta);
		}
	}


};

ROUNDS = 5
round = 0
if(fnl || summer){
	ROUNDS = 1
}
T=500
if(summer){
	T = 1100
}
t=0

var finish = function(complete){
	if(complete){
		document.getElementById('next').style.visibility = 'visible'
	}

	$.ajax('http://0.0.0.0:5000/finish_trial', {
                type: "GET",
                data: roboCoach
                });

	reset_car(complete)
	requestAnimationFrame(main);
}

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	if(round < ROUNDS && bgReady && started){
		if(t<T){
		
			update(delta / 1000);
			render();

			then = now;
			t = t+1
			// Request to do this again ASAP
			requestAnimationFrame(main);
		}
		else{

			round = round +1
			t = 0
			finish(round == ROUNDS)
		}
	}
	else if(!bgReady || !started){
		// Request to do this again ASAP
		requestAnimationFrame(main);
		//render();
		start()
	}


};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};
