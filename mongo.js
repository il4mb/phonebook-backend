const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('Please provide the MongoDB password as an argument.');
    process.exit(1);
}

const credentials = process.argv[2];
if (!credentials.includes(":")) {
    console.error("Invalid credentials");
    process.exit();
}
const password = credentials.split(":")[1];
const username = credentials.split(":")[0];
const args = process.argv.slice(3);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    date: { type: Date, default: Date.now() }
});

const Person = mongoose.model('Person', personSchema);

class Command {
    constructor(accept, handle) {
        this.accept = accept;
        this.handle = handle;
    }
}

const commandHandlers = [
    new Command(
        (args) => args.length === 1 && args[0] === "initial",
        async () => {
            const persons = [
                { name: "Arto Hellas", number: "040-123456" },
                { name: "Ada Lovelace", number: "39-44-5323523" },
                { name: "Dan Abramov", number: "12-43-234345" },
                { name: "Mary Poppendieck", number: "39-23-6423122" }
            ];

            try {
                for (const p of persons) {
                    await new Person(p).save();
                }
                console.log('All persons saved successfully!');
            } catch (error) {
                console.error('Error saving persons:', error.message);
            }
        }
    ),
    new Command(
        (args) => args.length === 0,
        async () => {
            try {
                const result = await Person.find({});
                console.log("phonebook:")
                result.forEach(p => console.log(`${p.name} ${p.number}`));
            } catch (error) {
                console.error('Error retrieving persons:', error.message);
            }
        }
    ),
    new Command(
        (args) => args.length === 2,
        async (args) => {
            const [name, number] = args;
            const person = new Person({ name, number });

            try {
                await person.save();
                console.log(`added ${name} number ${number} to phonebook`);
            } catch (error) {
                console.error('Error saving person:', error.message);
            }
        }
    )
];

const commandInterpreter = async () => {
    const handler = commandHandlers.find(h => h.accept(args));

    if (!handler) {
        console.error("Unknown command.");
        return;
    }

    const url = `mongodb+srv://${username}:${password}@cluster0.lqv1b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(url);
        await handler.handle(args);
    } catch (error) {
        console.error('Database connection error:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

commandInterpreter();
