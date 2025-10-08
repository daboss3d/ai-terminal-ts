import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Server } from 'socket.io'
import agents from './api/agents'
import prompts from './api/prompts'


import { testVar } from '@lib/test/test.ts'
console.log('testVar:', testVar)


const app = new Hono()


app.route('/agents', agents)
app.route('/prompts', prompts)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const server = serve({ ...app, port }, (info) => {
  console.log(`Server is running at http://localhost:${info.port}`)
})

const io = new Server(server)

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
