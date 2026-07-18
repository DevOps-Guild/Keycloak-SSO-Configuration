/**
 * server.js - Minimal production server with Keycloak proxy
 *
 * Proxies /api/* to Keycloak to avoid CORS.
 * Serves static files from dist/.
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080'
const KEYCLOAK_ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin'
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin'
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'myapp-frontend'
const PORT = process.env.PORT || 3000
const DIST_DIR = path.join(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveStatic(res, filePath) {
  try {
    const content = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    res.end(content)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}

function proxyToKeycloak(req, res) {
  const targetPath = req.url.replace('/api', '')
  const targetUrl = new URL(targetPath, KEYCLOAK_URL)
  const url = targetUrl.toString()

  console.log(`[PROXY] ${req.method} ${req.url} -> ${url}`)

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', () => {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
    }

    const proxyReq = http.request(url, options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)

      if (proxyRes.statusCode === 302 || proxyRes.statusCode === 303) {
        res.end()
        return
      }

      proxyRes.pipe(res)
    })

    proxyReq.on('error', err => {
      console.error('[PROXY ERROR]', err.message)
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Proxy error', message: err.message }))
    })

    if (body) proxyReq.write(body)
    proxyReq.end()
  })
}

async function getAdminToken() {
  const res = await fetch(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: KEYCLOAK_ADMIN_USERNAME,
      password: KEYCLOAK_ADMIN_PASSWORD,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Admin login failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data.access_token
}

async function registerUser(payload) {
  const token = await getAdminToken()
  const res = await fetch(`${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      enabled: true,
      emailVerified: false,
      credentials: [{ type: 'password', value: payload.password, temporary: false }],
    }),
  })

  if (res.status === 201) {
    return { ok: true }
  }

  const text = await res.text()
  throw new Error(`Keycloak user creation failed: ${res.status} ${text}`)
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/register' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}')
        if (!payload.username || !payload.email || !payload.password) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Missing required signup fields.' }))
          return
        }

        await registerUser(payload)
        res.writeHead(201, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        console.error('[REGISTER ERROR]', err.message)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  if (req.url.startsWith('/api')) {
    proxyToKeycloak(req, res)
    return
  }

  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url)

  if (!fs.existsSync(filePath) && !req.url.includes('.')) {
    filePath = path.join(DIST_DIR, 'index.html')
  }

  serveStatic(res, filePath)
})

server.listen(PORT, () => {
  console.log(`\n✅ MyApp server running at http://localhost:${PORT}`)
  console.log(`   📡 API proxy -> ${KEYCLOAK_URL}`)
  console.log(`   📁 Static files -> dist/\n`)
})
