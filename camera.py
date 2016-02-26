from time import time
import IPython
import numpy as np


class Camera(object):
    """An emulated camera implementation that streams a repeated sequence of
    files 1.jpg, 2.jpg and 3.jpg at a rate of one frame per second."""

    def __init__(self,rollout= 'rollout5',file_path = None):
        self.frames = []
        self.states = []
        self.img_name = []
        self.index = -1
        self.first = True
        self.rollout = rollout
        self.srt_time = 0
        self.pre_i = -2

        addr = "/home/annal/Izzy/vision_amt/data/amt/rollouts/"
        addr_lbl = "/home/annal/Izzy/vision_amt/data/amt/"

        self.base = time()
        # addr = "/home/annal/Izzy/vision_amt/data/amt/rollouts/"

        self.file_lbl = file_path 
        file_str = open(addr+rollout+'/states.txt','r')
        for i in range(0,80):
            self.frames.append(open(addr+rollout+'/'+rollout+'_frame_'+str(i)+'.jpg','rb').read())
            self.img_name.append(rollout+'_frame_'+str(i)+'.jpg')

            line = file_str.readline()
            line = line.split()
            state = line[1:5]
            print state
            self.states.append(state)

    def get_frame(self):
        # return self.frames[95]

        if(time() - self.base > 0.4 or self.first): 
            self.index += 1
            self.base = time()
            self.first = False
            if(self.index > 79):
                self.index = 79
        return self.frames[self.index]


    def get_state(self):
        # return self.states[95],95
        print "ROLL OUT ",self.rollout
        return self.states[self.index], self.index

    def stringToArray(self,data):
        length = len(data)
        arry_data = np.zeros(length)

        for i in range(length):
            arry_data[i] = float(data[i])

        return arry_data

    def getImage(self,idx):
        return self.img_name[idx]

    def was_label(self,label):
        label = self.stringToArray(label)
        epsilon = 1e-7
        if(np.abs(np.sum(label)) < epsilon): 
            return True
        else: 
            return True 

    def safetyLimits(self,deltas):

        #Rotation 15 degrees
        #Extension 1 cm 
        #Gripper 0.5 cm
        #Table 15 degrees
        print deltas
        for i in range(len(deltas)):
            deltas[i] = float(deltas[i])
        deltas[0] = np.sign(deltas[0])*np.min([0.2,np.abs(deltas[0])])
        deltas[1] = np.sign(deltas[1])*np.min([0.01,np.abs(deltas[1])])
        deltas[2] = np.sign(deltas[2])*np.min([0.005,np.abs(deltas[2])])
        deltas[3] = np.sign(deltas[3])*np.min([0.2,np.abs(deltas[3])])
        return deltas 
    def checkLabel(self,deltas,idx):
        sm = 0.0
        print "i ",idx
        print "PRE i",self.pre_i
        for i in range(len(deltas)):
            sm += deltas[i]
        if(sm == 0.0 or idx == self.pre_i):
            self.pre_i = idx
            return False
        else:
            self.pre_i = idx
            return True
    def get_vid(self):
        return "video"
        

    def end(self,idx):
        if(idx == len(self.img_name)-1):
            self.first = True
            self.index = -1
            return True
        else: 
            return False

    def writeImage(self,label,i):
        if(self.file_lbl.closed):
            return
        else:
            label = self.safetyLimits(label)
            if(self.checkLabel(label,i)):
                img_n = self.getImage(i)
                line = img_n+" "+str(label[0])+" "+str(label[1])+" "+str(label[2])+" "+str(label[3])+"\n"
                self.file_lbl.write(line)
        
