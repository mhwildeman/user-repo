const userDb = require('./userDb.js');
const tokenDb = require('./tokenDb.js');
const basicAuth = require('express-basic-auth')


var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require("fs");

// create application/json parser
//var jsonParser = bodyParser.json()

// (async ()=>{
//     let id = await userDb.addUser('mhwildeman@gmail.com','myPassword');
//     console.log(id);
//     let user = await userDb.getUser('mhwildeman@gmail.com');
//     console.log(user);
//     let match = await userDb.checkPassword('mhwildeman@gmail.com','myPassword');
//     console.log(match);
//     match = await userDb.checkPassword('mhwildeman@gmail.com','myPasswor');
//     console.log(match);
//     // let result = await userDb.deleteUser('mhwildeman@gmail.com');
//     // console.log(result);    
// })();

var jsonParser = bodyParser.json()


app.use(basicAuth({
    authorizer: tokenDb.validateUser,
    authorizeAsync: true,
    challenge: true
}))

app.get('/users', function (req, res) {
    if (req.query.username) return userDb.getUser(req.query.username).then(user=>{
        if(user){
            res.json({count:1,results:[user]});
        }
        else{
            res.json({count:0,results:[]});
        }
    });
    userDb.getUsers().then(results => res.json({count:results.length,results:results}));
})

app.get('/users/:id', function (req, res) {
    userDb.getUserById(req.params.id).then(user=>{
        if(user){
            res.json(user);
        }
        else{
            res.status(404).json({error:"Not found"});
        }
    });
    
  });

  app.delete('/users/:id', function (req, res) {
    userDb.deleteUserById(req.params.id).then(result=>{
        if(result.changes === 1){
            res.status(204).end();
        }
        else{
            res.status(404).json({error:"Not found"});
        }
    });
    
  });

app.post('/users', jsonParser, function (req, res) {
    res.type('json');
    userDb.addUser(req.body.username, req.body.password).then(id => {
        if(id!=='')
            res.json({id:id})
        else{
            userDb.getUser(req.body.username).then(user=>{
                res.status(409).json({error:"Username already taken.", id:user.id})
            });
            
        }
    });
});

app.post('/check-password', jsonParser, function (req,res) {
    userDb.checkPassword(req.body.username, req.body.password).then(result =>{
        res.status(200).json({isValid:result});
    })
});
 
 var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 });
