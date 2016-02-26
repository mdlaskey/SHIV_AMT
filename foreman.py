from time import time
import IPython
import numpy as np
from camera import Camera


class Foreman(object):
    def __init__(self,video= ''):
        self.Workers = dict()
        self.rollouts = self.compile_list()
        # Camera(self.rollouts[0])
        addr_lbl = "/home/annal/Izzy/vision_amt/data/amt/"

        self.file_lbl = open(addr_lbl+'/labels_amt_exp_91_99.txt','w')
        self.num_rl = len(self.rollouts)
        self.cmpl_rl = []
        self.idx = 0
        self.Worker_Stats = dict()

    def compile_list(self):
        rollouts = []
        rng = []
      
        for i in range(91,100):
            rng.append(i)
            print i
            rollouts.append("rollout"+str(i))
        return rollouts

    def getWork(self,workerID):
        return self.Workers[workerID]

    def assignWorker(self,workerID):
  
        if(not workerID in self.Workers):
            rollout = self.rollouts[self.idx]
            # self.idx += 1
            self.Workers[workerID] = Camera(rollout, file_path = self.file_lbl)
            
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
            self.file_lbl.close()
            return True
        else: 
            self.idx+=1
            rollout = self.rollouts[self.idx]
            

            self.Workers[workerID] = Camera(rollout,file_path = self.file_lbl)
            return False

    def notFinished(self,workerID):
        camera = self.Workers[workerID]
        self.rollouts.append(camera.rollout)
        return
