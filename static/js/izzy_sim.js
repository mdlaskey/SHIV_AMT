//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");




var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
started = false



workerID = psiTurk.taskdata.get('workerId')
console.log(psiTurk)

//
//document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();

bgImage.src = "static/images/background.jpg";
bgImage.onload = function () {
	bgReady = true;
};
// Car image
var armReady = false;
var armImage = new Image();


armImage.src =  "static/images/Arm.png";
armImage.onload = function () {
	armReady = true;
};

// Gripper Top Image
var gptReady = false;
var gptImage = new Image();
gptImage.src =  "static/images/Gripper.png";
gptImage.onload = function () {
	gptReady = true;
};


// Gripper Bottom Image
var gpdReady = false;
var gpdImage = new Image();
gpdImage.src =  "static/images/Gripper_d.png";
gpdImage.onload = function () {
	gpdReady = true;
};

// Circular image
var circReady = false;
var circImage = new Image();
circImage.src =  "static/images/RotTable.png";
circImage.onload = function () {
	circReady = true;
};









// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);




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

		$.ajax('http://0.0.0.0:5000/get_help', {
	                type: "GET",
	                data: state
	                });
		
		if(roboCoach){
			console.log("Give advice")	
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
		ctx.drawImage(bgImage, 0, 0);
	}
	if (circReady){
		ctx.drawImage(circImage,70,40);
	}

	if (armReady){
		ctx.drawImage(armImage,-130,173);
	}

	if (gptReady){
		ctx.drawImage(gptImage,205,-25);
	}

	if (gpdReady){
		ctx.drawImage(gpdImage,205,25);
	}

	


};





// The main game loop
var main = function () {

	// Request to do this again ASAP
	requestAnimationFrame(main);
	render()


};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};
