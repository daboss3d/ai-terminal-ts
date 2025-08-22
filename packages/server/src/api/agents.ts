import { Hono } from 'hono'
import { promises as fs } from 'fs'

const app = new Hono()

app.get('/', async (c) => {
  const agents = await fs.readFile('data/config/agents.json', 'utf-8')
  return c.json(JSON.parse(agents))
})

export default app
