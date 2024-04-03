const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

personsRouter.get('/:id', (request, response, next) => {
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

personsRouter.post('/', (request, response, next) => {
  const body = request.body
  //   if (!body.name || !body.number) {
  //     return response.status(400).json({
  //       error: 'content missing'
  //     })
  //   }

  const person = new Person({
    name: body.name,
    number: body.number,
    important: body.important || false
  })

  // persons = persons.concat(person)
  person.save().then(savedPerson => {
    console.log('person saved')
    response.json(savedPerson)
  }).catch(error => next(error))
})

personsRouter.delete('/:id', (request, response, next) => {
  const { id } = request.params
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  })
    .catch(error => next(error))
    // persons = persons.filter((person) => person.id !== id)
})

personsRouter.put('/:id', (request, response, next) => {
  const body = request.body
  const id = request.params.id

  const person = {
    name: body.name,
    number: body.number,
    important: body.important || false
  }

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' }).then(updatedPerson => {
    response.json(updatedPerson)
  }).catch(error => next(error))
  // const personIndex = persons.findIndex((person) => person.id === id)
  // persons[personIndex] = {
  //   ...persons[personIndex],
  //   ...body
  // }
})

module.exports = personsRouter
