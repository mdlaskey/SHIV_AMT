import os
import Pyro4
import time

sharer = Pyro4.Proxy("PYRONAME:shared.server")

#robot interface
def label_image(img):
    global sharer
    sharer.set_img(img)
    sharer.set_img_ready(True)

    print("robot waiting")
    while not sharer.is_labeled():
        pass

    label = sharer.get_label_data()
    sharer.set_labeled(False)

    return label

for ind in range(0, 6):
    frame = "data/images/frame_" + str(ind) + ".png"
    x = label_image(frame)
    time.sleep(5)
