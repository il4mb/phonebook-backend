const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI


console.log('connecting to', url)

mongoose.connect(url)

    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(\d{2,3})-\d{5,}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number! It should have 2-3 digits followed by a '-' and at least 5 digits.`
        },
        minLength: 8
    },
    date: {
        type: Date,
        default: Date.now
    }
});


personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.date
    }
})


module.exports = mongoose.model('Person', personSchema)