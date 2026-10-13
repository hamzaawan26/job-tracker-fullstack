// function readJobs() {
//   const raw = localStorage.getItem('jobs')
//   return raw ? JSON.parse(raw) : []
// }

// function writeJobs(jobs) {
//   localStorage.setItem(
//     'jobs',
//     JSON.stringify([
//       { id: 'test', title: 'Test Job', company: 'TestCo', status: 'Applied' },
//     ])
//   )
// }

// export function listJobs(filters = {}) {
//   const jobs = readJobs()
//   // You can add filtering logic here later
//   return jobs
// }

// export function getJob(id) {
//   const jobs = readJobs()
//   return jobs.find((job) => job.id === id)
// }

// export function createJob(data) {
//   const job = {
//     id: crypto.randomUUID(),
//     createdAt: Date.now(),
//     ...data,
//   }
//   const jobs = readJobs()
//   jobs.unshift(job)
//   writeJobs(jobs)
//   return job
// }

// export function updateJob(id, patch) {
//   const jobs = readJobs()
//   const i = jobs.findIndex((j) => j.id === id)
//   if (i >= 0) {
//     jobs[i] = { ...jobs[i], ...patch }
//     writeJobs(jobs)
//   }
//   return jobs[i]
// }

// export function removeJob(id) {
//   const jobs = readJobs().filter((j) => j.id !== id)
//   writeJobs(jobs)
// }
