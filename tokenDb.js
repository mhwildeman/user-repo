var sqlite3 = require('sqlite3');
var open = require('sqlite').open;
var uuidv4 = require('uuid').v4;
const basicAuth = require('express-basic-auth')

var db;

async function init() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.cached.Database
  });
  try {
    await db.exec('CREATE TABLE tokens (username TEXT NOT NULL UNIQUE, token NOT NULL)');
    let token = uuidv4();
    await db.run('INSERT INTO tokens(username,token) VALUES (:username,:token)', { ':username': 'admin', ':token': token });
    console.log("Admin token: %s", token);

  }
  catch (e) {
    let result = await db.get('SELECT * FROM tokens where username = ?', 'admin');
    console.log("Admin token: %s", result.token);

  }
}

init();

module.exports = { validateUser: validateUser };
function validateUser(username, password, cb) {
  db.get('SELECT * FROM tokens where username = ?', username).then(result => {
    if (result && basicAuth.safeCompare(username, result.username) && basicAuth.safeCompare(password, result.token))
      return cb(null, true)
    else
      return cb(null, false)
  });

}