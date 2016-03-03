//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");

if(document.body != null){  
	document.getElementById('next').style.visibility = 'hidden'
	document.getElementById('yes').style.visibility = 'hidden'
	document.getElementById('no').style.visibility = 'hidden'
	document.getElementById('query').style.visibility = 'hidden'
}

// addr = '128.32.37.232'
addr = '0.0.0.0'

var ctx = canvas.getContext("2d");
canvas.width = 420;
canvas.height = 420;
started = false



workerID = psiTurk.taskdata.get('workerId')
console.log(psiTurk)
video_id = "not_init"
current_state = [0,0,0,0]
img_idx = 0

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
var armImage_t = new Image();
var armImage = new Image()

armImage_t.src =  "static/images/Arm_lbl.png";
armImage_t.onload = function () {
	armReady = true;
};

// Gripper Top Image
var gptReady = false;
var gptImage = new Image();
gptImage.src =  "static/images/Gripper_t_lbl.png";
gptImage.onload = function () {
	gptReady = true;
};

var armImage_t_lng = new Image();
var armReady_t_lng = false;
armImage_t_lng.src =  "static/images/Arm_lbl_prv.png";
armImage_t_lng.onload = function () {
	armReady_t_lng = true;
};


// Gripper Bottom Image
var gpdReady = false;
var gpdImage = new Image();
gpdImage.src =  "static/images/Gripper_lbl.png";
gpdImage.onload = function () {
	gpdReady = true;
};

// Circular image
var circReady = false;
var circImage = new Image();
var circImage_st = new Image();
circImage_st.src =  "static/images/RotTable_lbl.png";
circImage_st.onload = function () {
	circReady = true;
};

var circImage_prv = new Image();
circImage_prv.src =  "static/images/RotTable_lbl_prv.png";
circImage_prv.onload = function () {
	circReady_prv = true;
};




var metersToPixels = function(val_m){
	return 1.0*420/0.5461*val_m
}
new_frame = 'true'
//Parameters 
ARM_X = 190
ARM_Y = 590
THRUST_0 = 0
THRUST_LIMITS = metersToPixels(0.05)
GRASP_LIMITS = metersToPixels(0.02)
first_g = 'true'
// ROT_LIMITS



clicked = false;
// Handle keyboard controls
var keysDown = {};
label = [0,0,0,0]

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
	grasp: 0,
	thrust_d: 0,
	theta_d:0,
	grasp_d:0,
	table_angle_d:0,
};


var start = function (modifier){
	if(! started){
		document.getElementById('text').style.visibility = 'visible'
	}
	if(13 in keysDown){
		started = true
		document.getElementById('text').style.visibility = 'hidden'
	}
}

var isGood = function (clicked,rot_table,grasper){

	return rot_table == 0 && grasper == 0 && !clicked
}

var mouseToPos = function(){
	//Translate to ARM Cordinate Frame
	m_x = m_pose[0]-ARM_X
	m_y = m_pose[1]-ARM_Y
	m_x_old = m_pose_old[0]-ARM_X
	m_y_old = m_pose_old[1]-ARM_Y


	v_x = m_x - m_x_old
	v_y = m_y - m_y_old

	m_l2 = Math.sqrt((Math.pow(m_y,2)))
	m_old_l2 =  Math.sqrt((Math.pow(m_y_old,2)))
	sign = sgn(m_l2 - m_old_l2)
	//Get Magnitude 
	l2 = Math.sqrt((Math.pow(v_y,2)))

	
	izzy.thrust_d += -sign*l2

	if(Math.abs(izzy.thrust_d) > THRUST_LIMITS){
		izzy.thrust_d = sgn(izzy.thrust_d)*THRUST_LIMITS
	}

	//Get Angle
	izzy.theta_d += (m_x-m_x_old)*0.005

	if(Math.abs(izzy.theta_d) > 0.2){
		izzy.theta_d = sgn(izzy.theta_d)*0.2
	}
	m_pose_old = m_pose

}




var dynamics = function(angle,thrust,rot_table,grasper){
	//izzy.table_angle += rot_table
	//izzy.theta += angle

	izzy.grasp_d += grasper

	if(Math.abs(izzy.grasp_d) > GRASP_LIMITS){
		izzy.grasp_d = sgn(izzy.grasp_d)*GRASP_LIMITS
	}

	izzy.table_angle_d += rot_table

	if(Math.abs(izzy.table_angle_d) > 0.15){
		izzy.table_angle_d = sgn(izzy.table_angle_d)*0.15
	}
	
	if(clicked){
		mouseToPos()
	}
	armImage = armImage_t_lng
	armReady = true
	if(isGood(clicked,rot_table,grasper)){
		armReady = false
		izzy.theta_d = 0
		izzy.thrust_d = 0
		izzy.grasp_d = 0
		izzy.table_angle_d = 0
	}
	circImage = circImage_st
	circReady = false

	if(!clicked && rot_table != 0){
		armReady = false
		circReady = true
		circImage = circImage_prv
	}

	//Handle Gripper Negative Problem 
	if(current_state[2] < 0.0){
		current_state[2] = 0.04+current_state[2]*-1
	}


	//Convert meters to pixels
	s_thrust = metersToPixels(current_state[1])
	s_grasp = metersToPixels(current_state[2])//*1.75


	izzy.thrust = THRUST_0 - s_thrust+izzy.thrust_d
	izzy.table_angle = current_state[3]+izzy.table_angle_d
	izzy.theta = -current_state[0]+Math.PI/2+izzy.theta_d+Math.PI/10
	izzy.grasp = s_grasp+izzy.grasp_d

	label[0] = -izzy.theta_d
	label[1] = -izzy.thrust_d/1000
	label[2] = izzy.grasp_d
	label[3] = izzy.table_angle_d
	

	izzy.arm_x = Math.abs(izzy.thrust)
	izzy.arm_y = 0 
}

// Update game objects
var update = function (modifier) {
	angle = 0
	rot_table = 0
	thrust = 0
	grasper = 0
	end = false
	
	
	feedback = []
	feedback.push({
		key: "key",
		value: workerID
	})
	feedback.push({
		key: "vID",
		value: video_id
	})
	feedback.push({
		key: "state",
		value: current_state
	})
	feedback.push({
		key: "label",
		value: label[0]+" "+label[1]+" "+label[2]+" "+label[3]
	})
	feedback.push({
		key: "idx",
		value: img_idx
	})
	feedback.push({
		key: "idx",
		value: first_g
	})
	feedback.push({
		key: "idx",
		value: new_frame
	})
	
	new_frame = 'false'

	$.ajax('http://'+addr+':5000/state_feed', {
                type: "GET",
                data: feedback,
                // Work with the response
				success: function( response ) {
			     // server response
			    current_state = response.items
			    img_idx = response.idx
			    video_id = response.id
			    end = response.end 
			  	q = response.query

			    for(i = 0; i<4; i++){
			    	current_state[i] = parseFloat(current_state[i])
			    	console.log(i+" "+current_state[i])
			    	
			    }
			    if(q){
			    	query()
			    }
			    if(end){

					complete()
				}
				

				// if(response.end){
			   // 	console.log("END "+response.end)
			   // }
		}
    });
    first_g = 'false'
    bgImage.src = 'http://'+addr+':5000/video_feed/'+workerID

	if(65 in keysDown){ //Player holding a
		rot_table = -0.05
	}
	if(68 in keysDown){ //Player holding d
		rot_table = 0.05
	}

	if(87 in keysDown){ // Player holding w
		grasper = 1
	}
	if(83 in keysDown){ // Player holding s
		grasper = -1
	}

	dynamics(angle,thrust,rot_table,grasper)


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
	ctx.rotate(angle)//* TO_RADIANS);
 
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
	ctx.drawImage(image,-240, -30);

	if (gptReady){
		ctx.drawImage(gptImage,240,-190-izzy.grasp);
	}

	if (gpdReady){
		ctx.drawImage(gpdImage,240,-190+izzy.grasp);
	}
 
	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}

fdbback = 0;
// Draw everything
var render = function () {

	if (bgReady) {
		drawRotatedImage(bgImage,210,210,Math.PI/2);
	}
	if (circReady){
		drawRotatedImage(circImage,210,210,izzy.table_angle);
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

var complete = function() {
	running = false
	document.getElementById('next').style.visibility = 'visible'
}
var query_n = function(){

	document.getElementById('yes').style.visibility = 'hidden'
	document.getElementById('no').style.visibility = 'hidden'
	document.getElementById('query').style.visibility = 'hidden'
	complete()
};

var query_y = function(){

	document.getElementById('yes').style.visibility = 'hidden'
	document.getElementById('no').style.visibility = 'hidden'
	document.getElementById('query').style.visibility = 'hidden'
	running = true
	new_frame = 'true'
};
document.getElementById("yes").onclick = query_y;
document.getElementById("no").onclick = query_n;



var query = function() {
	running = false
	document.getElementById('yes').style.visibility = 'visible'
	document.getElementById('no').style.visibility = 'visible'
	document.getElementById('query').style.visibility = 'visible'
	
}

t = 0
running = true
// The main game loop
var main = function () {
	// Request to do this again ASAP
	if(running){
		requestAnimationFrame(main);
		update()
		render()
	}
	else{
		requestAnimationFrame(main);
	}

};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};