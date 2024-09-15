require('dotenv').config()
const morgan = require('morgan');
const express = require('express');
const app = express();
const Person = require("./models/person");

morgan.token('body', (req) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(express.json());


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const currentDate = new Date().toString();
    Person.countDocuments().then(totalRecords => {
        response.send(`Phonebook has info for ${totalRecords} people<br>${currentDate}`);
    });
});

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(p => {
        if (p) {
            response.send(p);
        } else {
            response.status(404).end();
        }
    }).catch(error => next(error))
});

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {

    const body = request.body
    const person = {
        name: String(body.name),
        number: String(body.number)
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updated => {
            response.json(updated)
        })
        .catch(error => next(error))
})

app.post('/api/persons', async (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const existingPerson = await Person.findOne({ name: new RegExp(`^${body.name}$`, 'i') });
    if (existingPerson) {
        return response.status(400).json({
            error: 'name must be unique'
        });
    }

    const person = new Person({
        name: String(body.name),
        number: String(body.number)
    });


    person.save().then((p) => {
        response.json(p);
    });
});

// register end handler
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)
}
app.use(errorHandler);


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})