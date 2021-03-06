import express, {Application} from 'express'; 
import morgan from 'morgan'; 
import cors from 'cors';  

import authController from './controllers/authController';

const jwt = require('jsonwebtoken');
import config from './config'; 
import securedRoutes from './routes/securedRoutes'; 

import indexRoutes from './routes/indexRoutes'; 
import teacherTimetableRoutes from './routes/teacherRoutes'; 
import authRoutes from './routes/authRoutes'; 

class Server {
    public app : Application; 
    constructor(){
        this.app = express(); 
        this.config(); 
        this.routes(); 
    }

    config():void{

        //permite automatizar el servidor
        if(typeof process.env.PORT == 'undefined' ){
            this.app.set('port',  3000); 
        }  
        else{
            this.app.set('port',   process.env.PORT); 
        }

        this.app.use(morgan("dev")); //permite  ver los logs de las peticiones api (post, get, put etc) que recibe esta clase. 
        this.app.use(cors()); //para manejar las cabeceras de las peticiones
        this.app.use(express.json()); //para recibir objetos json de las peticiones cliente
        this.app.use(express.urlencoded({extended:false})); 
        //delete in the future /api/auth/me route
        this.app.use(function (req: any, res: any, next: () => void) {
            if (req.url !== '/api/auth/login' && req.url !== '/api/auth/me' ){ 

                var token = req.headers.authorization?.substr(6);  
                if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
                
                jwt.verify(token, config.jwtKey, function(err: any, decoded: any) {
                    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
                    else {

                        var urlRequest = req.url; 

                        //If endpoint ends with a number, remove the number to compare the endpoint with routes in secureRoutes.ts 
                        if(urlRequest.match(/[0-9]$/)){    
                            urlRequest = urlRequest.substring(0, urlRequest.lastIndexOf("/"))                          
                        }

                        if(urlRequest in securedRoutes){
                            var securedRoutes2 : any = securedRoutes
           
                            if(decoded.accountType >= securedRoutes2[urlRequest][req.method]){
                                //console.log(decoded); 
                                next();
                            }else{
                                return res.status(500).send({ auth: false, message: 'Insufficient permissions' });
                            }
             
                        }else{
                            return res.status(500).send({ auth: false, message: 'Unknow endpoint' });
                        }
                       
                    }

                }); 

            }else{
                next();
            }            
            
        })

    } 
    
    routes():void{
        this.app.use("/",indexRoutes); 
        this.app.use("/api/teachers", teacherTimetableRoutes); 
        this.app.use("/api/auth", authRoutes); 
        
    } 

    start():void{
        this.app.listen(this.app.get('port'), () =>{
            console.log ('Server iniciado en el puerto '  + this.app.get('port')); 
        }); 
    }

}

const server = new Server(); 
server.start(); 