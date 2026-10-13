import http from './http'

export async function loginApi(data) {
  const res = await http.post('/auth/login', data)
  return res.data
}

export async function registerApi(data) {
  const res = await http.post('/auth/register', data)
  return res.data
}

export async function meApi() {
  const res = await http.get('/auth/me')
  return res.data
}
