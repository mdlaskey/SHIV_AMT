# this file imports custom routes into the experiment server
import sys
sys.path.append('/Users/michaelluskey/Documents/RL/LFD/lapmaster1.1/')
#from race_game_asst import RaceGame
import IPython 
import numpy as np
from PIL import Image


import cPickle as pickle
from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app
from jinja2 import TemplateNotFound
from flask import Flask
from flask.ext.jsonpify import jsonify
from functools import wraps
from sqlalchemy import or_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import db_session, init_db
from Classes.Supervisor import Supervisor 
from psiturk.models import Participant
from json import dumps, loads
from cStringIO import StringIO
# load the configuration options
config = PsiturkConfig()
config.load_config()
myauth = PsiTurkAuthorization(config)  # if you want to add a password protect route use this

#
# explore the Blueprint
custom_code = Blueprint('custom_code', __name__, template_folder='templates', static_folder='static')
custom_code = Flask(__name__)

UserData = []
AllData = []

controls = []
reward = [] 
states = []
AllData = dict()
CurrentData = dict()
first = True
supervisor = Supervisor()

#rc = pickle.load(open('/Users/michaelluskey/Documents/RL/LFD/AMT_Experiment/RoboCont.p'))

def serve_pil_image(pil_img):
    img_io = StringIO()
    pil_img.save(img_io, 'JPEG')
    #print base64.b64encode(im_data.getvalue())
    
    return base64.b64encode(im_data.getvalue())

# #----------------------------------------------
# # example accessing data
# #----------------------------------------------
# @custom_code.route('/run_game')
# def run_game():
# 	game = request.args['game']
# 	coach = request.args['coach']
# 	print coach
# 	if(game == 'summer'):
# 		#RaceGame.T = 1500
# 		race_game = RaceGame(game = game, coach = 'false')
# 		while race_game.running:
# 			race_game.control_car()
# 		trial = [coach,race_game.cost,race_game.inOil,race_game.controls,race_game.states]
# 		UserData.append(trial)
# 	elif(game == 'winter'):
# 		#RaceGame.T = 500
# 		if(coach == 'true'): 
# 			for i in range(2):
# 				race_game = RaceGame(game = game,coach='false')
# 				while race_game.running:
# 					race_game.control_car()

# 		for i in range(5):
# 			race_game = RaceGame(game = game,coach=coach,roboCoach = rc)
# 			while race_game.running:
# 				race_game.control_car()
# 			trial = [coach,race_game.cost,race_game.inOil,race_game.controls,race_game.states]
# 			UserData.append(trial)
# 	else:
# 		#RaceGame.T = 500
# 		race_game = RaceGame(game = 'winter',coach = 'false')
# 		while race_game.running:
# 				race_game.control_car()
# 		trial = [coach,race_game.cost,race_game.inOil,race_game.controls,race_game.states]
# 		UserData.append(trial)

@custom_code.route('/get_help')
def get_help():
	
	#Sort Data
	data = dict(request.args)



	key = data['undefined'][0]
	state = np.array(data['undefined'][0:4], dtype=float)
	control = np.array(data['undefined'][4:6], dtype=float)

	#Get reward
	r = supervisor.getCost(state)


	states.append(state)
	controls.append(control)
	reward.append(r)
	#Save Data
	if(first):
		IPython.embed()
		states.append(state)
		controls.append(control)
		first = False
	else:
		states.append(state)
		controls.append(control)
		reward.append(r)
	CurrentData[key] = [states,controls,reward]


@custom_code.route('/finish_trial')
def finish_trial(): 
	data = dict(request.args)
	key = data['undefined'][0]

	CumData[key].append([states,controls,reward])
	IPython.embed()


@custom_code.route('/get_stuff')
def get_stuff(): 
	return jsonify(user="1")



@custom_code.route('/save_data')
def save_data():

	responses = dict(request.args)
	key = data['undefined'][0]
	total_data = [responses,CumData[key]]
	AllData[key] = total_data
	pickle.dump(AllData,open('AllData.p','wb'))
	#IPython.embed()
	



if __name__ == '__main__':
	print "running"
	custom_code.run(host='0.0.0.0')
