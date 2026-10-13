import http from './http'

export function fetchJobs(params) {
  return http.get('/jobs', { params })
}

export function createJob(data) {
  return http.post('/jobs', data)
}

export function updateJob(id, data) {
  return http.put(`/jobs/${id}`, data)
}

export function deleteJob(id) {
  return http.delete(`/jobs/${id}`)
}
