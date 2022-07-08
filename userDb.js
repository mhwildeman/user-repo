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
  try{
  await db.exec('ALTER TABLE user ADD COLUMN first_name TEXT;');
  await db.exec('ALTER TABLE user ADD COLUMN infix TEXT;');
  await db.exec('ALTER TABLE user ADD COLUMN last_name TEXT;');
  await db.exec('ALTER TABLE user ADD COLUMN display_name TEXT;');
  }
  catch(e){}
}

init();

module.exports = {addUser:addUser,getUser:getUser,checkPassword:checkPassword,getUsers:getUsers,getUserById:getUserById,deleteUserById:deleteUserById};
function addUser(username, password, firstName, infix, lastName) {
  return new Promise((resolve, reject) => {
    let id = uuidv4();
    bcrypt.hash(password, SALT_ROUNDS)
      .then(passwordHash => db.run('INSERT INTO user(id, username, password, first_name, infix, last_name) VALUES (:id, :username, :password, :firstname, :infix, :last_name)', {
        ':id': id, ':username': username, ':password': passwordHash,':firstname': firstName, ':infix':infix, ':last_name':lastName
      }))
      .then(result => resolve(id)).catch(error => {resolve(''); })
  });
}

function getUsers() {
  return db.all('SELECT id, username, first_name, infix, last_name FROM user;');
}


function getUser(username) {
  return db.get('SELECT id, username, first_name, infix, last_name FROM user where username = :username', {
    ':username': username
  });
}

function getUserById(id) {
  return db.get('SELECT id, username, first_name, infix, last_name FROM user where id = :id', {
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
