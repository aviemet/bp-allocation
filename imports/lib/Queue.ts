/**************************************
 *      Queue class for Pledges       *
 **************************************/
export default class Queue<T> {
	private queue: T[]

	constructor() {
		this.queue = []
	}

	enqueue(element: T) {
		this.queue.push(element)
	}

	dequeue() {
		if(this.isEmpty()) return null

		return this.queue.shift()!
	}

	isEmpty() {
		return !this.queue.length
	}
}
