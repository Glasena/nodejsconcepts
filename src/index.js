const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

/*

{ 
	id: 'uuid', // precisa ser um uuid
	name: 'Alison', 
	username: 'Glasena', 
	todos: []
}

*/

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const user = users.find(aUser => aUser.username === username);

  if (!user){
    return response.status(404).json({error: 'User not found'});
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  if (!username){
    return response.status(406).json({error: 'Invalid Username'});
  }

  const userAlreadyExists = users.some((aUser) => aUser.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: 'User already exists'});
  }
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {

    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),

  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  for (user_todo of user.todos) {

    if(user_todo.id === id){
      user_todo.title = title;
      user_todo.deadline = new Date(deadline);
      return response.json(user_todo);
    }

  }

  return response.status(404).json({error: "Todo Not Found !"});

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { id } = request.params;

  for (user_todo of user.todos) {

    if(user_todo.id === id){
      user_todo.done = true;
      return response.json(user_todo);
    }

  }

  return response.status(404).json({error: "Todo Not Found !"});

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { id } = request.params;
  
  const index = user.todos.map((todos) => { return todos.id }).indexOf(id);

  if (index === -1){
    return response.status(404).json({error: "Not Found"});
  }

  if (user.todos.splice(index, 1)){
    return response.status(204).json({msg: "ok"});
  }
  
  return response.status(400).json({error: "Not ok"});

});

module.exports = app;