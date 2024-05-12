const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');


require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

const client = new MongoClient(process.env.MONGOURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
  
    if (!apiKey || apiKey !== process.env.APIKEY) {
      return res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
    next();
  };

app.use(validateApiKey);

app.get('/getRewardPoints', async (req, res) => {
    await client.connect();
    const collection = await client.db(process.env.HEALTHDB).collection(process.env.WORKOUTS);
    const workouts = await collection.find({}).toArray();
    const totalRewardPoints = workouts.filter(workout => typeof workout.rewardPoints === 'number'
        && !Number.isNaN(workout.rewardPoints)).reduce((sum, workout) => sum + workout.rewardPoints, 0);
    res.status(200).json({ totalRewardPoints });
});

app.get('/getLogs', async (req, res) => {
    await client.connect();
    const collection = await client.db(process.env.HEALTHDB).collection(process.env.WORKOUTS);
    const workouts = await collection.find({}).toArray();
    const logs = workouts.filter(workout => typeof workout.rewardPoints === 'number'
        && !Number.isNaN(workout.rewardPoints));
    res.status(200).json({ logs });
});

const calculateRewardPoints = (workout) => {
    const { pushups, lunges, squats, wallSits, planks } = workout;
    return (pushups + lunges + squats + wallSits + planks) * 0.5;
};

app.post('/logWorkout', async (req, res) => {
    try {
        const { pushups, lunges, squats, wallSits, planks } = req.query;

        const workout = {
            date: new Date(),
            pushups: Number(pushups),
            lunges: Number(lunges),
            squats: Number(squats),
            wallSits: Number(wallSits),
            planks: Number(planks),
        };
        workout['rewardPoints'] = calculateRewardPoints(workout);
        await client.connect();
        const collection = client.db(process.env.HEALTHDB).collection(process.env.WORKOUTS);
        const workoutResult = await collection.insertOne(workout);
        console.log('Workout inserted:', workoutResult);
        res.status(201).send({ message: 'Workout logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while logging workout data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});