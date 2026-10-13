import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default http
