import cPickle as pickle
import math
import numpy as np 
import matplotlib as plt
import IPython
import csv
f = open('data.csv','wb')

datawriter = csv.writer(f)
    

AllData = pickle.load(open('AllData.p','rb'))

Users = len(AllData)

avg_coach = 0.0
avg_no_coach = 0.0

std_coach = 0.0
std_no_coach = 0.0

for user in AllData:
	data = user[1]
	data = data[-5:-1]
	lst = user[0]['undefined']
	coach_on = data[0][0]
	lst.append(coach_on)
	
	for trial in data:
		idx = trial[2].astype(bool)
		cost = trial[1]
		#IPython.embed()
		if(trial[0] == 'false'):
			lst.append(np.sum(cost[idx]))
			print "NO COACH ", np.sum(cost[idx])
			avg_no_coach += np.sum(cost[idx])
		else:
			lst.append(np.sum(cost[idx]))
			print "COACH ", np.sum(cost[idx])
			avg_coach += np.sum(cost[idx])
	datawriter.writerow(lst)

for user in AllData:
	data = user[1]
	data = data[-5:-1]
	avg_coach1 = 0.0
	avg_no_coach1 = 0.0
	for trial in data:
		idx = trial[2].astype(bool)
		cost = trial[1]
		#IPython.embed()
		if(trial[0] == 'false'):
			avg_no_coach1 += np.sum(cost[idx])
		else:
			avg_coach1 += np.sum(cost[idx])

	if(trial[0] == 'false'):
		std_no_coach += np.sqrt((avg_no_coach1-avg_no_coach/5.0)**2)
	else:
		std_coach += np.sqrt((avg_coach1-avg_coach/5.0)**2)

f.close()
print "AVERAGE NO COACH ", avg_no_coach/5
print "AVERAGE COACH ",avg_coach/5

print "STD NO COACH ", std_no_coach/5
print "STD COACH ",std_coach/5


