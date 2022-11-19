/**************************************
 *      Queue class for Pledges       *
 **************************************/
export default class Queue {
	queue: any[] = []

	enqueue(element: any) {
		this.queue.push(element)
	}

	dequeue() {
		if(this.isEmpty()) return false
		return this.queue.shift()
	}

	isEmpty() {
		return !this.queue.length
	}
}
