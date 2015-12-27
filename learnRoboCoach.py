import cPickle as pickle
import math
import numpy as np 
import matplotlib as plt
import IPython
import sys
sys.path.append('/Users/michaelluskey/Documents/RL/LFD/lapmaster1.1/')

from Classes.RobotCont import RobotCont

AllData = pickle.load(open('AllData.p','rb'))

Users = len(AllData)

avg_coach = 0.0
avg_no_coach = 0.0

std_coach = 0.0
std_no_coach = 0.0
Costs = []
States = []
Controls = []

for user in AllData[0:8]:
	data = user[1]
	data = data[-5:-1]
	for trial in data:
		idx = trial[2].astype(bool)

		cost = 1/trial[1]
		control = trial[3]
		states = trial[4]
		Costs.append(cost[idx])
		Controls.append(control[idx])
		States.append(states[idx])




rc = RobotCont()

rc.calQ(Costs,States,Controls)
pickle.dump(rc,open('RoboCont.p','wb'))


IPython.embed()

