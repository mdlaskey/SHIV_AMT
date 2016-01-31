//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");




var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
started = false
current_state = [0,0,0,0]

workerID = psiTurk.taskdata.get('workerId')
console.log(psiTurk)
ball = [0,0]
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

// Ball Image
var ballReady = false;
var ballImage = new Image();
ballImage.src =  "static/images/ball.png";
ballImage.onload = function () {
	ballReady = true;
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


clicked = false;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("mousedown", function (e) {
	clicked = true;
	m_pose = [e.clientX, e.clientY]
	m_pose_old = m_pose
}, false);

addEventListener("mousemove", function (e) {
	m_pose = [e.clientX, e.clientY]
}, false);

addEventListener("mouseup", function (e) {
	clicked = false;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Game objects
var izzy = {
	table_angle: 0, // movement in pixels per second
	theta: 0,
	thrust: 0,
	arm_x: 0,
	arm_y: 0, 
	grasp: 0
};


var dynamics = function(angle,thrust,rot_table,grasper){
	izzy.table_angle += rot_table
	izzy.theta += angle


	if(izzy.theta > 0.51){
		izzy.theta = 0.51
	}
	else if(izzy.theta < -0.51){
		izzy.theta = -0.51
	}

	izzy.thrust += thrust

	if(izzy.thrust > 140){
		izzy.thrust = 140
	}
	else if(izzy.thrust < 0){
		izzy.thrust = 0
	}

	izzy.arm_x = izzy.thrust*Math.cos(izzy.theta)
	izzy.arm_y = izzy.thrust*Math.sin(izzy.theta)

	izzy.grasp += grasper


	if(izzy.grasp > 40){
		izzy.grasp = 40
	}
	else if(izzy.grasp < 18){
		izzy.grasp = 18
	}

}

// Update game objects
var update = function (modifier) {
	angle = 0
	rot_table = 0
	thrust = 0
	grasper = 0
	//bgImage.src = "http://0.0.0.0:5000/video_feed"
	
	if(65 in keysDown){ //Player holding a
		rot_table = -0.1
	}
	if(68 in keysDown){ //Player holding d
		rot_table = 0.1
	}

	if(clicked){
		console.log(m_pose[0]+" "+m_pose[1])
		mouseToPos()
	}


	if(87 in keysDown){ // Player holding w
		grasper = 1
	}
	if(83 in keysDown){ // Player holding s
		grasper = -1
	}

	dynamics(angle,thrust,rot_table,grasper)
	if(gotBall()){
		r += 1
	}

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

function drawBall(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 
	ctx.translate(240,220)
	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle) //* TO_RADIANS);
 
	// move to the middle of where we want to draw our image
	ctx.translate(x, y);
 
 
	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width/2), -(image.height/2));


	if (gptReady){
		ctx.drawImage(gptImage,230,-220-izzy.grasp);
	}

	if (gpdReady){
		ctx.drawImage(gpdImage,230,-220+izzy.grasp);
	}
 
	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}







function drawArm(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 
	ctx.translate(-50,220)
	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle) //* TO_RADIANS);
 
	// move to the middle of where we want to draw our image
	ctx.translate(x, y);
 
 
	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width/2), -(image.height/2));


	if (gptReady){
		ctx.drawImage(gptImage,230,-220-izzy.grasp);
	}

	if (gpdReady){
		ctx.drawImage(gpdImage,230,-220+izzy.grasp);
	}
 
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
		drawRotatedImage(circImage,250,225,izzy.table_angle);
	}

	// if (armReady){
	// 	drawArm(armImage,izzy.arm_x,izzy.arm_y,izzy.theta);
	// }

	// // if (ballReady) {
	// // 	drawBall(ballImage, ball_pos[r][0], ball_pos[r][1],izzy.table_angle);
	// // }
};


var mouseToPos = function(){
	//Translate to ARM Cordinate Frame
	m_x = m_pose[0]+50
	m_y = m_pose[1]-220
	m_x_old = m_pose_old[0]+50
	m_y_old = m_pose_old[1]-220


	v_x = m_x - m_x_old
	v_y = m_y - m_y_old

	m_l2 = Math.sqrt((Math.pow(m_x,2)+Math.pow(m_y,2)))
	m_old_l2 =  Math.sqrt((Math.pow(m_x_old,2)+Math.pow(m_y_old,2)))
	sign = Math.sign(m_l2 - m_old_l2)
	//Get Magnitude 
	l2 = Math.sqrt((Math.pow(v_x,2)+Math.pow(v_y,2)))
	console.log(l2)
	izzy.thrust += sign*l2


	//Get Anlge 
	izzy.theta += (m_y-m_y_old)*0.005
	m_pose_old = m_pose

}


// Draw everything
var complete = function () {

};

var gotBall = function (angle) {
	

	gripper_x = izzy.arm_x
	gripper_y = izzy.arm_y*6
	l1 = Math.abs(gripper_x - ball_pos[r][0])+Math.abs(gripper_y-ball_pos[r][1])
	eps = 20
	if(l1 < eps){
		return true
	}
	else{
		return false
	}
}

ball_pos = [[100,100],[100,-100],[100,-100]]


r = 0
running = false
// The main game loop
var main = function () {

	// Request to do this again ASAP
	if(running){
		requestAnimationFrame(main);
		render()
		update()
	}

	if(r > 2){
		complete()
	}


};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};
