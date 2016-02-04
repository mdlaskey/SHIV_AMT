from time import time
import IPython
import numpy as np


class Camera(object):
    """An emulated camera implementation that streams a repeated sequence of
    files 1.jpg, 2.jpg and 3.jpg at a rate of one frame per second."""

    def __init__(self,video= ''):
        self.frames = []
        self.states = []
        self.img_name = []
        self.index = -1
        self.first = True
        self.srt_time = 0
        self.file_lbl = open('rollout7/labels.txt','w')
        file_str = open('rollout7/states.txt','r')
        for i in range(0,150):
            self.frames.append(open("rollout7/rollout7_frame_"+str(i)+".jpg",'rb').read())
            self.img_name.append("rollout7/rollout7_frame_"+str(i)+".jpg")
            line = file_str.readline()
            line = line.split()
            state = line[1:5]
            print state
            self.states.append(state)

    def get_frame(self):
        # return self.frames[95]

        if(self.first):
            self.first = False
            self.srt_time = int(time())

        self.index = int(time())-self.srt_time

        return self.frames[self.index]


    def get_state(self):
        # return self.states[95],95
 
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

    def get_vid(self):
        return "video"

    def end(self,idx):
        if(idx == len(self.img_name)-1):
            self.first = True
            return True

        else: 
            return False

    def writeImage(self,label,i):
        if(not self.was_label(label) or self.file_lbl.closed):
            return
        else:
            img_n = self.getImage(i)
            line = img_n+" "+label[0]+" "+label[1]+" "+label[2]+" "+label[3]+"\n"
            self.file_lbl.write(line)
        if(self.end(i)):
            self.file_lbl.close()


