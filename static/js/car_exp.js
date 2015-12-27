
var CarExperiment = function() {

	var wordon, // time word is presented
	    listening = false;

	// Stimuli for a basic Stroop experiment
	var stims = [
			["SHIP", "red", "unrelated"],
		];

	stims = _.shuffle(stims);

	var next = function() {
		listening = true;
	};
	
	var response_handler = function(e) {
		if (!listening) return;

		var keyCode = e.keyCode,
			response;
	
		switch (keyCode) {
			case 38:
				// "R"
				response="down";
				break;
			case 40:
				// "G"
				response="up";
				break;
			default:
				response = "";
				break;
		}
		//d3.select("#simulator").html('<center><pX= ' + e.clientX + 'Y= ' + e.clientY' </p></div></center>');
		if (response.length>0) {
			listening = false;
			//d3.select("#simulator").html('<p id="prompt">Type "R" for Red, "B" for blue, "G" for green.</p>');
			d3.select("#simulator").html('<center><div class="image"><img src="static/images/SteeringWheel.png" width="75%"></div></center>');
			
			//next();
		}
	};
	
	var finish = function() {
	    $("body").unbind("keydown", response_handler); // Unbind keys
	    currentview = new Questionnaire();
	};
	
	var show_word = function(text, color) {
		d3.select("#stim")
			.append("div")
			.attr("id","word")
			.style("color",color)
			.style("text-align","center")
			.style("font-size","150px")
			.style("font-weight","400")
			.style("margin","20px")
			.text(text);
	};

	var remove_word = function() {
		d3.select("#word").remove();
	};

	
	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Register the response handler that is defined above to handle any
	// key down events.
	$("body").focus().keydown(response_handler); 
	//$("body").focus().onmousedown(response_handler);

	// Start the test
	next();
	
};


