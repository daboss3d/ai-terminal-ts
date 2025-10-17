import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Server } from 'socket.io'
import agents from './api/agents'
import prompts from './api/prompts'
import providers from './api/providers'

import stats from './api/stats'


import { testVar } from '@lib/test/test.ts'
console.log('testVar:', testVar)


const app = new Hono()

app.route('/api/providers', providers)
app.route('/api/agents', agents)
app.route('/prompts', prompts)
app.route('/prompts/stats', stats)  // Add stats as a sub-route under prompts at /prompts/stats

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = serve({ ...app, port }, (info) => {
  console.log(`Server AI is running at http://localhost:${info.port}`)
})

const io = new Server(server)

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
