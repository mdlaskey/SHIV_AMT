from time import time
import IPython
import numpy as np
from numpy import linalg as LA


class QCheck(object):
    """An emulated camera implementation that streams a repeated sequence of
    files 1.jpg, 2.jpg and 3.jpg at a rate of one frame per second."""

    def __init__(self,rollout= 'rollout5',file_path = None):
        self.q_file = open('quality_labels.txt','r')
        self.q_labels = []
        self.get_labels(self.q_file)
        #self.pre_label = False


    def get_labels(self,q_f):
        # return self.frames[95]

        for line in q_f:            
            labels = line.split()
            img_name = labels[0]
            label = np.array([float(labels[1]),float(labels[2]),float(labels[3]),float(labels[4])])
            self.q_labels.append([img_name,label])



    def check_quality(self,labels):

        wrk_num = len(labels)
        my_num = len(self.q_labels)
        sm = 0
        ct = 0
        dif = 0

        if(np.abs(wrk_num - my_num) > 20):
            return False

        for l in self.q_labels:
            for l_wrk in labels:
                if(l[0] == l_wrk[0]):
                    dif = LA.norm(l[1]-l_wrk[1])
                    sm += dif
                    ct += 1

        if(dif/ct > 0.05):
            return False
        else:
            return True


    
