//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");




var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
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
var armImage = new Image();


armImage.src =  "static/images/Arm_lbl.png";
armImage.onload = function () {
	armReady = true;
};

// Gripper Top Image
var gptReady = false;
var gptImage = new Image();
gptImage.src =  "static/images/Gripper_t_lbl.png";
gptImage.onload = function () {
	gptReady = true;
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
circImage.src =  "static/images/RotTable_lbl.png";
circImage.onload = function () {
	circReady = true;
};



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

var mouseToPos = function(){
	//Translate to ARM Cordinate Frame
	m_x = m_pose[0]+200
	m_y = m_pose[1]-220
	m_x_old = m_pose_old[0]+200
	m_y_old = m_pose_old[1]-220


	v_x = m_x - m_x_old
	v_y = m_y - m_y_old

	m_l2 = Math.sqrt(Math.pow(m_x,2)+Math.pow(m_y,2))
	m_old_l2 =  Math.sqrt(Math.pow(m_x_old,2)+Math.pow(m_y_old,2))
	sign = Math.sign(m_l2 - m_old_l2)

	//Get Magnitude 
	l2 = Math.sqrt(Math.pow(v_x,2)+Math.pow(v_y,2))
	console.log(l2)
	izzy.thrust_d += sign*l2

	//Get Anlge 
	izzy.theta_d += (m_y-m_y_old)*0.005
	m_pose_old = m_pose

}

var dynamics = function(angle,thrust,rot_table,grasper){
	//izzy.table_angle += rot_table
	//izzy.theta += angle

	izzy.grasp_d += grasper
	izzy.rot_table_d += rot_table
	
	if(clicked){
		mouseToPos()
	}

	console.log("STATE "+current_state)
	izzy.thrust = current_state[1]*1000+izzy.thrust_d
	izzy.table_angle = current_state[3]+izzy.table_angle_d
	izzy.theta = -current_state[0]+Math.PI+Math.PI/7+izzy.theta_d
	izzy.grasp = current_state[2]*1000+izzy.grasp_d

	label[0] = izzy.theta_d
	label[1] = izzy.thrust_d/1000
	label[2] = izzy.grasp_d
	label[3] = izzy.table_angle_d
	
	izzy.arm_x = izzy.thrust*Math.cos(izzy.theta)
	izzy.arm_y = izzy.thrust*Math.sin(izzy.theta)

	

}

// Update game objects
var update = function (modifier) {
	angle = 0
	rot_table = 0
	thrust = 0
	grasper = 0
	
	bgImage.src = 'http://0.0.0.0:5000/video_feed'
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
	
	$.ajax('http://0.0.0.0:5000/state_feed', {
                type: "GET",
                data: feedback,
                // Work with the response
				success: function( response ) {
			     // server response
			    current_state = response.items
			    video_id = response.id
			    img_idx = response.idx
			    for(i = 0; i<4; i++){
			    	current_state[i] = parseFloat(current_state[i])
			    	
			    }
		}
    });

	if(65 in keysDown){ //Player holding a
		rot_table = -0.1
	}
	if(68 in keysDown){ //Player holding d
		rot_table = 0.1
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
	ctx.translate(-200,220)
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
		drawRotatedImage(circImage,210,210,izzy.table_angle);
	}

	if (armReady){
		drawArm(armImage,izzy.arm_x,izzy.arm_y,izzy.theta);
	}


};

t = 0
// The main game loop
var main = function () {

	// Request to do this again ASAP
	requestAnimationFrame(main);
	update()
	render()
	console.log("RATE "+t)
	t += 1


};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};
