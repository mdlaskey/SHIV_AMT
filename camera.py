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
        self.file_lbl = open('Video_Example/labels.txt','w')
        file_str = open('Video_Example/states.txt','r')
        for i in range(100):
            self.frames.append(open("Video_Example/frame_"+str(i)+".jpg",'rb').read())
            self.img_name.append("Video_Example/frame_"+str(i)+".jpg")
            line = file_str.readline()
            line = line.split()
            state = [line[1],line[3],line[5],line[6]]
            self.states.append(state)

    def get_frame(self):
        return self.frames[int(time()) % 100]

    def get_state(self):
        return self.states[int(time()) % 100], int(time()) % 100

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


