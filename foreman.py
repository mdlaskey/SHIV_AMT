from time import time
import IPython
import numpy as np
from camera import Camera
from QCheck import QCheck


class Foreman(object):
    def __init__(self,video= ''):
        self.Workers = dict()
        self.Locks = dict()
        self.Files = dict()
        self.rollouts = self.compile_list()
        # Camera(self.rollouts[0])
        #addr_lbl = "/home/annal/Izzy/vision_amt/data/amt/"
        self.addr_lbl = ""
        self.qCheck = QCheck()

        self.num_rl = len(self.rollouts)
        self.cmpl_rl = []
        self.idx = -1
        self.Worker_Stats = dict()

    def compile_list(self):
        rollouts = []
        rng = []
        rng.append(145)
        rollouts.append("rollout"+str(145))

        for i in range(146,150):
            rng.append(i)
            rollouts.append("rollout"+str(i))
        return rollouts

    def getWork(self,workerID):
        return self.Workers[workerID]

    def setLock(self,wID,v):
        self.Locks[wID] = v

    def getLock(self,workerID):
        if(not workerID in self.Locks):
            self.Locks[workerID] = False
        return self.Locks[workerID]


    def assignWorker(self,workerID):
  
        if(not workerID in self.Workers):
            rollout = self.rollouts[0]

            f_path = open(self.addr_lbl+workerID+"_labels.txt",'w')
            self.Files[workerID] = f_path
            # self.idx += 1
            self.Workers[workerID] = Camera(rollout, file_path = f_path)
            
        return
        
    def saveWork(self,workerID):
        f_path = self.Files[workerID]
        f_path.close()

    def endFilm(self,workerID):
        camera = self.Workers[workerID]

        #Keep Track of Workers Videos 
        if(not workerID in self.Worker_Stats):
            self.Worker_Stats[workerID] = 1
            if(not self.qCheck.check_quality(camera.labels)):
                return True
        else:
            self.Worker_Stats[workerID] += 1
            self.cmpl_rl.append(camera.rollout)

        if(len(self.cmpl_rl) == self.num_rl):
            return True
        else: 

            self.idx+=1
            rollout = self.rollouts[self.idx]
            f_path= self.Files[workerID]
            self.Workers[workerID] = Camera(rollout,file_path = f_path)
            return False

    def notFinished(self,workerID):
        camera = self.Workers[workerID]
        self.rollouts.append(camera.rollout)
        return
