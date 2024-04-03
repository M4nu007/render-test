const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const personsRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const morgan = require('morgan')
const Person = require('./models/person')

mongoose.set('strictQuery', false)

const url = config.MONGODB_URI

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/persons', personsRouter)

morgan.token('response-post', function (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms -- :response-post'))

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    const cantidad = persons.length
    const fecha = new Date()
    response.send(
      `<p>Phonebook has info for ${cantidad} people</p> <p>${fecha}</p>`
    )
  }).catch(error => next(error))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
// const PORT = config.PORT
// app.listen(PORT, () => {
//   console.log(`web server running in the port ${PORT}`)
// })
