import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ name: 'AniPub API', status: 'ok' }))

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
