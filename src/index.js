const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccount(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find(custumer  => custumer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((accumulator, operation) => {
    if (operation.type === 'credit') {
      return accumulator + operation.amount;
    } else {
      return accumulator - operation.amount;
    }
  }, 0);

  return balance;
}

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

app.get('/statement', verifyIfExistsAccount, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.post('/deposit', verifyIfExistsAccount, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccount, (request, response) => {
  const { amount } = request.body;

  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient funds!'})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccount, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  // Valor da hora ' 00:00' para obter qualquer hor??rio
  const dateFormatted = new Date(date + ' 00:00');

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormatted).toDateString()
    );

  return response.json(statement);
});

app.put('/account', verifyIfExistsAccount, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get('/account', verifyIfExistsAccount, (request, response) => {
  const { customer } = request;

  return response.json(customer);
});

app.delete('/account', verifyIfExistsAccount, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.get('/balance', verifyIfExistsAccount, (request, response) => {
  const { customer } = request;

  const balace = getBalance(customer.statement);

  return response.json(balace);
});

app.listen(3333);
