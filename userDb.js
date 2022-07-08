var sqlite3 = require('sqlite3');
var open = require('sqlite').open;
var uuidv4 = require('uuid').v4;
var bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

var db;

async function init(){
  db = await open({
    filename: './database.db',
    driver: sqlite3.cached.Database
  });
  
  await db.exec('CREATE TABLE if not exists user (id TEXT, username TEXT NOT NULL UNIQUE, password)');
}

init();

module.exports = {addUser:addUser,getUser:getUser,checkPassword:checkPassword,getUsers:getUsers,getUserById:getUserById,deleteUserById:deleteUserById};
function addUser(username, password) {
  return new Promise((resolve, reject) => {
    let id = uuidv4();
    bcrypt.hash(password, SALT_ROUNDS)
      .then(passwordHash => db.run('INSERT INTO user(id, username, password) VALUES (:id, :username, :password)', {
        ':id': id, ':username': username, ':password': passwordHash
      }))
      .then(result => resolve(id)).catch(error => {resolve(''); })
  });
}

function getUsers() {
  return db.all('SELECT id, username FROM user;');
}


function getUser(username) {
  return db.get('SELECT id, username FROM user where username = :username', {
    ':username': username
  });
}

function getUserById(id) {
  return db.get('SELECT id, username FROM user where id = :id', {
    ':id': id
  });
}

function deleteUserById(id) {
  return db.run('DELETE FROM user where id = :id', {
    ':id': id
  });
}

function checkPassword(username, password) {
  let promise = new Promise((resolve, reject) => {
    db.get('SELECT password FROM user where username = :username', {
      ':username': username
    })
      .then(row => {return bcrypt.compare(password, row.password);})
      .then(match => {resolve(match);})
      .catch(err => {resolve(false);});
  });

  return promise;
}
