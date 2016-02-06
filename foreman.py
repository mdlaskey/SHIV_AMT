from time import time
import IPython
import numpy as np
from camera import Camera


class Foreman(object):
    def __init__(self,video= ''):
        self.Workers = dict()
        self.rollouts = self.compile_list()
        self.num_rl = len(self.rollouts)
        self.cmpl_rl = []
        self.Worker_Stats = dict()

    def compile_list(self):
        rollouts = []
        for i in range(0,5):
            rollouts.append("rollouts"+str(i))
        return rollouts

    def getWork(self,workerID):
        return self.Workers[workerID]

    def assignWorker(self,workerID):
        if(not workerID in self.Workers):
            rollout = self.rollouts.pop()
            self.Workers[workerID] = Camera(rollout)
            
        return
        


    def endFilm(self,workerID):
        camera = self.Workers[workerID]

        #Keep Track of Workers Videos 
        if(not workerID in self.Worker_Stats):
            self.Worker_Stats[workerID] = 1
        else:
            self.Worker_Stats[workerID] += 1

        self.cmpl_rl.append(camera.rollout)

        if(len(self.cmpl_rl) == self.num_rl):
            return True
        else: 
            rollout = self.rollouts.pop()
            self.Workers[workerID] = Camera(rollout)
            return False

    def notFinished(self,workerID):
        camera = self.Workers[workerID]
        self.rollouts.append(camera.rollout)
        return




  

