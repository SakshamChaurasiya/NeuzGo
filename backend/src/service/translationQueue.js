const EventEmitter = require("events");

class TranslationQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.concurrency = Number(process.env.TRANSLATION_CONCURRENCY) || options.concurrency || 2;
    this.maxRetries = Number(process.env.TRANSLATION_MAX_RETRIES) || options.maxRetries || 3;
    this.backoffMs = Number(process.env.TRANSLATION_BACKOFF_MS) || options.backoffMs || 1000;

    this.queue = []; // Array of job objects
    this.activeJobs = new Map(); // jobId -> job object currently executing
    this.jobRegistry = new Map(); // jobId -> job object (either pending, processing, or retrying)
  }

  /**
   * Enqueue a translation job.
   * @param {string} id - Unique identifier for the job (e.g., "articleId:lang")
   * @param {number} priority - Priority value (1 = highest, 5 = lowest)
   * @param {function} taskFn - Async function returning a promise to execute the translation
   * @returns {Promise<any>}
   */
  enqueue(id, priority, taskFn) {
    // Prevent duplicate jobs
    if (this.jobRegistry.has(id)) {
      const existingJob = this.jobRegistry.get(id);
      // If it's already in the queue, we can potentially upgrade its priority if the new request is higher
      if (priority < existingJob.priority && existingJob.status === "pending") {
        existingJob.priority = priority;
        this._sortQueue();
        console.log(`[Queue] 🚀 Upgraded priority of duplicate job "${id}" to ${priority}`);
      }
      return existingJob.promise;
    }

    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const job = {
      id,
      priority,
      taskFn,
      retries: 0,
      status: "pending",
      createdAt: Date.now(),
      promise,
      resolve,
      reject,
    };

    this.queue.push(job);
    this.jobRegistry.set(id, job);
    this._sortQueue();

    this.emit("jobAdded", { id, priority, queueSize: this.queue.length });
    console.log(`[Queue] 📥 Enqueued job "${id}" (Priority: ${priority}, Queue Size: ${this.queue.length})`);

    // Process next asynchronously
    setImmediate(() => this._processNext());

    return promise;
  }

  /**
   * Sort queue by priority ascending (1 = highest, 5 = lowest), then by creation time ascending.
   */
  _sortQueue() {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * Process the next job in the queue if concurrency limit has not been reached.
   */
  async _processNext() {
    if (this.activeJobs.size >= this.concurrency) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    job.status = "processing";
    this.activeJobs.set(job.id, job);

    const startTime = Date.now();
    this.emit("jobStart", { id: job.id, runningWorkers: this.activeJobs.size });
    console.log(`[Queue] ⚙️ Processing job "${job.id}" (Running: ${this.activeJobs.size}/${this.concurrency})`);

    try {
      const result = await job.taskFn();
      const duration = Date.now() - startTime;

      job.status = "completed";
      this.activeJobs.delete(job.id);
      this.jobRegistry.delete(job.id);

      job.resolve(result);
      this.emit("jobCompleted", { id: job.id, duration, queueSize: this.queue.length });
      console.log(`[Queue] ✅ Completed job "${job.id}" in ${duration}ms`);

      // Process next job
      this._processNext();
    } catch (err) {
      const duration = Date.now() - startTime;
      this.activeJobs.delete(job.id);

      if (job.retries < this.maxRetries) {
        job.retries++;
        job.status = "retrying";
        const delay = this.backoffMs * Math.pow(2, job.retries);
        
        this.emit("jobRetry", { id: job.id, retries: job.retries, delay });
        console.warn(`[Queue] ⚠️ Job "${job.id}" failed: ${err.message}. Retrying in ${delay}ms (Attempt ${job.retries}/${this.maxRetries})`);

        setTimeout(() => {
          job.status = "pending";
          this.queue.push(job);
          this._sortQueue();
          this._processNext();
        }, delay);
      } else {
        job.status = "failed";
        this.jobRegistry.delete(job.id);
        job.reject(err);
        
        this.emit("jobFailed", { id: job.id, retries: job.retries, error: err.message });
        console.error(`[Queue] ❌ Job "${job.id}" failed after ${job.retries} retries. Error: ${err.message}`);
        
        this._processNext();
      }
    }
  }

  /**
   * Cancel a job if it is still pending.
   * @param {string} id - Unique identifier for the job
   */
  cancel(id) {
    if (!this.jobRegistry.has(id)) return false;

    const job = this.jobRegistry.get(id);
    if (job.status === "pending") {
      this.queue = this.queue.filter((j) => j.id !== id);
      this.jobRegistry.delete(id);
      job.reject(new Error("Job cancelled"));
      this.emit("jobCancelled", { id });
      console.log(`[Queue] 🚫 Cancelled job "${id}"`);
      return true;
    }

    return false;
  }

  /**
   * Get current queue statistics.
   */
  getStats() {
    return {
      queueSize: this.queue.length,
      activeCount: this.activeJobs.size,
      registeredCount: this.jobRegistry.size,
      concurrency: this.concurrency,
    };
  }
}

// Single instance for app-wide use
const translationQueueInstance = new TranslationQueue();

module.exports = {
  TranslationQueue,
  translationQueue: translationQueueInstance,
};
