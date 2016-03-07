import splinter
from splinter import Browser
import random
import string
import time
import IPython
import threading

# Number of seconds to sleep between pages
sleep_len = 5
# Number of seconds to sleep for final video playthrough
final_sleep_len = 60
# Length of randomized ID
id_len = 5

def test_worker():
	rand_id = '_load_test_' + ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(id_len))

	debug_url = 'http://128.32.37.232:22362/ad?assignmentId=debugID0WYB&hitId=debugZFWL4D&workerId=debug{0}&mode=debug'.format(rand_id)
	with Browser() as browser:
		# Visit URL
		browser.visit(debug_url)
		time.sleep(sleep_len)

		# Click button to proceed to experiment
		browser.find_by_xpath('//*[@id="ad"]/div/div[2]/button')[0].click()
		time.sleep(sleep_len)

		# Change main window to experiment window
		landing_window = browser.windows[0]
		exp_window = browser.windows[1]
		exp_window.is_current = True

		# Close landing window
		landing_window.close()

		# Click "I Agree"
		browser.find_by_xpath('//*[@id="consent"]/center/button[1]')[0].click()

		# Click through instruction pages
		for i in range(5):
			browser.find_by_xpath('//*[@id="next"]')[0].click()
			time.sleep(sleep_len)

		time.sleep(final_sleep_len)

if __name__ == '__main__':
	threads = []
	num_threads = 5
	# Run multiple threads
	for i in range(num_threads):
		t = threading.Thread(target=test_worker)
		threads.append(t)
		t.start()