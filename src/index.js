const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;
  const customersAlreadyExist = customers.some(
    (custumer) => custumer.cpf === cpf
  );

  if(customersAlreadyExist) {
    return response.status(400).json({ error: "Customer already exists!"});
  }

  customers.push({
    id: uuidv4(),
    name,
    cpf,
    statement: []
  });

  return response.status(201).send();
});

app.get('/statement/:cpf', (request, response) => {
  const { cpf } = request.params;
  const customer = customers.find(custumer => custumer.cpf === cpf);

  return response.json(customer.statement);
});

app.listen(3333);
