// Importing dependencies
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

// Configuring Prisma
const prisma = new PrismaClient();

// Configuring Express
const app = express();
app.use(cors());
app.use(express.json());

// Route to list all clients
app.get('/clients', async (req, res) => {
  const clients = await prisma.client.findMany();
  res.json(clients);
});

// Route to list all cars
app.get('/cars', async (req, res) => {
  const cars = await prisma.car.findMany();
  res.json(cars);
});

// Route to search for a specific client
app.get('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const client = await prisma.client.findUnique({ where: { id: parseInt(id) } });
  res.json(client);
});

// Route to search for a specific car
app.get('/cars/:id', async (req, res) => {
  const { id } = req.params;
  const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
  res.json(car);
});

// Route to rent a car
app.post('/rent', async (req, res) => {
  const { clientId, carId } = req.body;
  const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
  if (car.rented) {
    res.status(400).json({ error: 'Car already rented' });
    return;
  }
  const rental = await prisma.rental.create({
    data: {
      client: { connect: { id: parseInt(clientId) } },
      car: { connect: { id: parseInt(carId) } },
      rentalDate: new Date(),
      returnDate: null,
    },
  });
  await prisma.car.update({ where: { id: parseInt(carId) }, data: { rented: true } });
  res.json(rental);
});

// Route to return a rented car
app.post('/return', async (req, res) => {
  const { rentalId, carId } = req.body;
  const rental = await prisma.rental.findUnique({ where: { id: parseInt(rentalId) } });
  if (!rental) {
    res.status(400).json({ error: 'Rental not found' });
    return;
  }
  await prisma.rental.update({
    where: { id: parseInt(rentalId) },
    data: { returnDate: new Date() },
  });
  await prisma.car.update({ where: { id: parseInt(carId) }, data: { rented: false } });
  res.json({ message: 'Car returned' });
});

// Route to add a new car
app.post('/cars', async (req, res) => {
  const { make, model, year, color } = req.body;
  const car = await prisma.car.create({ data: { make, model, year, color, rented: false } });
  res.json(car);
});

// Route to add a new client
app.post('/clients', async (req, res) => {
    const { name, email, phone } = req.body;
    const client = await prisma.client.create({ data: { name, email, phone } });
    res.json(client);
  });
  
  // Route to update a car
  app.put('/cars/:id', async (req, res) => {
    const { id } = req.params;
    const { make, model, year, color } = req.body;
    const car = await prisma.car.update({
      where: { id: parseInt(id) },
      data: { make, model, year, color },
    });
    res.json(car);
  });
  
  // Route to update a client
  app.put('/clients/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { name, email, phone },
    });
    res.json(client);
  });
  
  // Route to delete a car
  app.delete('/cars/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.rental.deleteMany({ where: { carId: parseInt(id), returnDate: null } });
    await prisma.car.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Car deleted' });
  });
  
  // Route to delete a client
  app.delete('/clients/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.rental.deleteMany({ where: { clientId: parseInt(id), returnDate: null } });
    await prisma.client.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Client deleted' });
  });
  
  // Starting the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  