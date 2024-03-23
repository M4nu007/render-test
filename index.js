const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('response-post', function (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms -- :response-post'))

// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }
// app.use(requestLogger)

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
    important: true
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    important: false
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
    important: true
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    important: true
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const dataFilter = persons.find((person) => person.id === id)

  if (dataFilter) {
    response.send(dataFilter)
  }
  response.status(404).end()
})

app.get('/info', (request, response) => {
  const cantidad = persons.length
  const fecha = new Date()
  response.send(
    `<p>Phonebook has info for ${cantidad} people</p> <p>${fecha}</p>`
  )
})

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: Number(body.number),
    important: Boolean(body.important) || false
  }

  persons = persons.concat(person)

  response.status(201).send(person)
})

app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  const id = Number(request.params.id)
  console.log(body)

  const personIndex = persons.findIndex((person) => person.id === id)
  persons[personIndex] = {
    ...persons[personIndex],
    ...body
  }

  response.status(201).send(body)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`web server running in the port ${PORT}`)
})
