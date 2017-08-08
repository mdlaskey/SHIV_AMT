import os
import Pyro4

sharer = Pyro4.Proxy("PYRONAME:shared.server")

#robot interface
def label_image(img):
    global sharer
    sharer.set_img(img)
    sharer.set_img_ready(True)

    while not sharer.is_labeled():
        pass

    label = sharer.get_label_data()
    sharer.set_labeled(False)

    return label

ind = 0
frame = open("data/images/frame_" + str(ind) + ".png", "rb").read()
x = label_image(frame)
