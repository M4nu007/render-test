const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

// ojo tiene que ser antes de importar el modelo person
require('dotenv').config()

const Person = require('./models/person')

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

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

// let persons = [
//   {
//     id: 1,
//     name: 'Arto Hellas',
//     number: '040-123456',
//     important: true
//   },
//   {
//     id: 2,
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//     important: false
//   },
//   {
//     id: 3,
//     name: 'Dan Abramov',
//     number: '12-43-234345',
//     important: true
//   },
//   {
//     id: 4,
//     name: 'Mary Poppendieck',
//     number: '39-23-6423122',
//     important: true
//   }
// ]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   const dataFilter = persons.find((person) => person.id === id)

//   if (dataFilter) {
//     response.send(dataFilter)
//   }
//   response.status(404).end()
// })

app.get('/api/persons/:id', (next, request, response) => {
  const { id } = request.params
  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    const cantidad = persons.length
    const fecha = new Date()
    response.send(
      `<p>Phonebook has info for ${cantidad} people</p> <p>${fecha}</p>`
    )
  }).catch(error => next(error))
})

// const generateId = () => {
//   const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0
//   return maxId + 1
// }

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // const person = {
  //   id: generateId(),
  //   name: body.name,
  //   number: Number(body.number),
  //   important: Boolean(body.important) || false
  // }
  const person = new Person({
    name: body.name,
    number: body.number,
    important: Boolean(body.important) || false
  })

  // persons = persons.concat(person)
  person.save().then(savedPerson => {
    console.log('person saved')
    response.json(savedPerson)
  }).catch(error => next(error))
  // response.status(201).send(person)
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const id = request.params.id

  const person = {
    name: body.name,
    number: Number(body.number),
    important: Boolean(body.important) || false
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' }).then(updatedPerson => {
    response.json(updatedPerson)
  }).catch(error => next(error))
  // const personIndex = persons.findIndex((person) => person.id === id)
  // persons[personIndex] = {
  //   ...persons[personIndex],
  //   ...body
  // }

  // response.status(201).send(body)
})

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  })
    .catch(error => next(error))
  // persons = persons.filter((person) => person.id !== id)
  // response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// este debe ser el último middleware cargado
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`web server running in the port ${PORT}`)
})
