//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");

if(document.body != null){  
	document.getElementById('next').style.visibility = 'hidden'
	document.getElementById('ARM').style.visibility = 'hidden'
	document.getElementById('GRIPPER').style.visibility = 'hidden'
	document.getElementById('TABLE').style.visibility = 'hidden'
}


var ctx = canvas.getContext("2d");
canvas.width = 504;
canvas.height = 429;
started = false
current_state = [0,0,0,0]

workerID = psiTurk.taskdata.get('workerId')
console.log(psiTurk)
ball = [0,0]


ARM_X = 210
ARM_Y = 700
THRUST_0 = 10
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


var armImage_t = new Image();
var armReady_t = false;
armImage_t.src =  "static/images/Arm_lbl.png";
armImage_t.onload = function () {
	armReady_t = true;
};



// Gripper Top Image
var gptReady_t = false;
var gptImage_t = new Image();
gptImage_t.src =  "static/images/Gripper_t_lbl.png";
gptImage_t.onload = function () {
	gptReady_t = true;
};


// Gripper Bottom Image
var gpdReady_t = false;
var gpdImage_t = new Image();
gpdImage_t.src =  "static/images/Gripper_lbl.png";
gpdImage_t.onload = function () {
	gpdReady_t = true;
};

// Circular image
var circReady_t = false;
var circImage_t = new Image();
circImage_t.src =  "static/images/RotTable_lbl.png";
circImage_t.onload = function () {
	circReady_t = true;
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
	theta: -Math.PI/2,
	thrust: 0,
	arm_x: 0,
	arm_y: 0, 
	grasp: 30
};


var dynamics = function(angle,thrust,rot_table,grasper){
	izzy.table_angle += rot_table

	if(izzy.table_angle > 2*Math.PI){
		izzy.table_angle = 0
	}



	izzy.theta += angle


	if(izzy.theta > 0.3-Math.PI/2){
		izzy.theta = 0.3-Math.PI/2
	}
	else if(izzy.theta < -0.3-Math.PI/2){
		izzy.theta = -0.3-Math.PI/2
	}

	// /izzy.thrust = THRUST_0

	if(izzy.thrust > 140){
		izzy.thrust = 140
	}
	else if(izzy.thrust < 0){
		izzy.thrust = 0
	}

	izzy.arm_x = Math.abs(izzy.thrust*Math.sin(izzy.theta))
	izzy.arm_y = Math.abs(izzy.thrust*Math.cos(izzy.theta))
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
	checkPoints()

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


function drawArm(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	 ctx.save(); 
	 ctx.translate(ARM_X,ARM_Y)
	 ctx.rotate(angle)
	 ctx.translate(x,y)
	

	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image,0, 0);


	if (gptReady){
		ctx.drawImage(gptImage,460,-178-izzy.grasp);
	}

	if (gpdReady){
		ctx.drawImage(gpdImage,460,-178+izzy.grasp);
	}
 
	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}



var checkPoints = function(){
	//Check ARM
	if(r == 0){

		x_t = 70.2
		y_t = 38.35
		theta_t = 0.2-Math.PI/2
		if (armReady_t){
			drawArm(armImage_t,x_t,y_t,theta_t);
		}
		console.log("Izzy State "+izzy.arm_x+" "+izzy.arm_y+" "+izzy.theta)
		if(Math.abs(izzy.arm_x - x_t)<10 && Math.abs(izzy.arm_y - y_t/2)<10){
			if(Math.abs(theta_t - izzy.theta)<0.1){
				r += 1
			}
		}


		document.getElementById('ARM').style.visibility = 'visible'
		document.getElementById('GRIPPER').style.visibility = 'hidden'
		document.getElementById('TABLE').style.visibility = 'hidden'
	}
	//Check Gripper 
	else if(r == 1){

		if(izzy.grasp < 19){
			r+=1
		}

		document.getElementById('ARM').style.visibility = 'hidden'
		document.getElementById('GRIPPER').style.visibility = 'visible'
		document.getElementById('TABLE').style.visibility = 'hidden'
	}
	//Check Table
	else if(r == 2){

		if (circReady_t){
			drawRotatedImage(circImage_t,250,225,1.0);
		}
		console.log("TABLE VALUE ", izzy.table_angle)
		if(Math.abs(izzy.table_angle - 1.0)<0.01 || Math.abs(izzy.table_angle - -2.2)<0.01){
			r+=1
			document.getElementById('TABLE').style.visibility = 'hidden'
		}

		document.getElementById('ARM').style.visibility = 'hidden'
		document.getElementById('GRIPPER').style.visibility = 'hidden'
		document.getElementById('TABLE').style.visibility = 'visible'
	}
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

	if (armReady){
		drawArm(armImage,izzy.arm_x,izzy.arm_y,izzy.theta);
	}

};

var  sgn = function(val){
	if(val > 0){
		return 1
	}
	else if(val < 0){
		return -1
	}
	else{
		return 0
	}
}

var mouseToPos = function(){
	//Translate to ARM Cordinate Frame
	m_x = m_pose[0]+50
	m_y = m_pose[1]
	m_x_old = m_pose_old[0]+50
	m_y_old = m_pose_old[1]


	v_x = m_x - m_x_old
	v_y = m_y - m_y_old

	m_l2 = Math.sqrt((Math.pow(m_y,2)))
	m_old_l2 =  Math.sqrt((Math.pow(m_y_old,2)))
	sign = sgn(m_l2 - m_old_l2)
	//Get Magnitude 
	l2 = Math.sqrt((Math.pow(v_y,2)))

	izzy.thrust += -sign*l2


	//Get Anlge 
	izzy.theta += (m_x-m_x_old)*0.005
	m_pose_old = m_pose

}


// Draw everything
var complete = function () {
	running = false
	document.getElementById('next').style.visibility = 'visible'

};


r = 0
running = true
step = 0
STEP = 200
// The main game loop
var main = function () {

	// Request to do this again ASAP
	if(running){
		requestAnimationFrame(main);
		render()
		update()
		step += 1
	}

	if(r>2){
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
