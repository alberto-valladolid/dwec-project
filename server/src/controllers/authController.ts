import {Request,Response} from 'express';
import pool from '../database';
import config from '../config'; 


// const cors = require('cors');
// const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
// const express = require('express');

class AuthController{


    public async login(req : Request,res : Response){

        
        //var testUser = { username: 'asdf', password: 'asdf'};

        if (req.body) {

            //console.log("select count(*) from teacher where user_name = '" + req.body.username + "' and pw = '" + req.body.password+ "'" ); 
            var user = req.body;
            var accountType :number = 0; 

        
            
            const resultFromTeachersTable =  await pool.query("select count(*) as count from teacher where user_name = '" + req.body.username + "' and pw = '" + req.body.password + "'" );
             const resultFromStudentsTable =  await pool.query("select count(*) as count from student where user_name = '" + req.body.username + "' and pw = '" + req.body.password + "'");
            const resultFromAdminsTable =  await pool.query("select count(*) as count from admin where user_name = '" + req.body.username + "' and pw = '" + req.body.password + "'" ) ;
          

            //console.log(resultFromAdminsTable[0].count); 


            if(resultFromTeachersTable[0].count == 1){
               accountType = 2;
            }else if(resultFromStudentsTable[0].count == 1){
               accountType = 1;
            }else if(resultFromAdminsTable[0].count == 1){ 
               accountType = 3;
            }
          
         
            if (accountType == 1 || accountType == 2 || accountType == 3 ) {

              var token = jwt.sign({ id: user.username, accountType: accountType, id2:  user.username }, config.jwtKey, {
                expiresIn: 86400 // expires in 24 hours
              });


              //var token = jwt.sign(user, JWT_Secret);

              res.status(200).send({
                //signed_user: user,
                token: token,
                accType: accountType
              });
            } else {
              res.status(403).send({
                errorMessage: 'Authorisation required!'
              });
            }
        } else {
            res.status(403).send({
                errorMessage: 'Please provide email and password'
            });
        }


        //res.json( await pool.query("select * from teacher") + "funciona");

    }

    //delete in the future this method
    public async me(req : Request,res : Response){

      // console.log(req.headers.authorization?.substr(6)); 
    

      var token = req.headers.authorization?.substr(6);  
      if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
      
      jwt.verify(token, config.jwtKey, function(err: any, decoded: any) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        
        res.status(200).send(decoded.accountType);
      }); 

    }

}

const authController = new AuthController();
export default authController; 