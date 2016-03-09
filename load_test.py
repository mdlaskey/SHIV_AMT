from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import random
import string
import time
import IPython
import threading

# Number of seconds to sleep between pages
sleep_len = 1
# Number of seconds to sleep for final video playthrough
final_sleep_len = 120
# Length of randomized ID
id_len = 5
# Number of threads
num_threads = 5
# Time between threads
thread_delay = 5

def test_worker():
	"""
	Creates a worker to run experiment.
	"""
	rand_id = '_load_test_' + ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(id_len))

	debug_url = 'http://128.32.37.232:22362/ad?assignmentId=debugID0WYB&hitId=debugZFWL4D&workerId=debug{0}&mode=debug'.format(rand_id)
	browser = webdriver.Firefox()
	# Visit URL
	browser.get(debug_url)
	time.sleep(sleep_len)

	# Click button to proceed to experiment
	browser.find_element_by_xpath('//*[@id="ad"]/div/div[2]/button').click()
	time.sleep(sleep_len)

	# Close landing window
	browser.close()
	browser.switch_to_window(browser.window_handles[0])

	# Click "I Agree"
	browser.find_element_by_xpath('//*[@id="consent"]/center/button[1]').click()

	# Click through instruction pages
	for i in range(5):
		browser.find_element_by_xpath('//*[@id="next"]').click()
		time.sleep(sleep_len)

	# Provide labels
	canvas = browser.find_element_by_xpath('//*[@id="canvas"]')
	time.sleep(sleep_len)
	actions = ActionChains(browser)
	for i in range(10):
		offset = 100
		actions.drag_and_drop_by_offset(canvas, i * offset, i * offset)
		actions.perform()

	time.sleep(final_sleep_len)
	browser.close()

if __name__ == '__main__':
	threads = []
	# Run multiple threads
	for i in range(num_threads):
		time.sleep(thread_delay)
		t = threading.Thread(target=test_worker)
		threads.append(t)
		t.start()
