/**************************************
 *      Queue class for Pledges       *
 **************************************/
export default class Queue {
	constructor() {
		this.queue = [];
	}

	enqueue(element) {
		this.queue.push(element);
	}

	dequeue() {
		if (this.isEmpty()) return 'Queue is empty';
		return this.queue.shift();
	}

	isEmpty() {
		return !this.queue.length;
	}
}