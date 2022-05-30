const User = require("../Models/User");
const Token = require("../Models/Token");
const mongoose = require("mongoose");





// Bcryptjs
var bcrypt = require('bcryptjs');

// JWT
var jwt = require("jsonwebtoken");
var privateKey = "*(&duconha1minhvn21h";

module.exports = function(app){
    
    app.post("/register", function(req, res){
        console.log("Post register");
        console.log( req.body );
        // Check avaible Username/Email
        User.find({
            "$or": [{"Username":req.body.Username}, {"Email":req.body.Email}]
        }, function(err, data){
            if(data.length==0){

                //Ma hoa password voi Bcryptjs
                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(req.body.Password, salt, function(err, hash) {
                        if(err){
                            res.json({kq:false, errMsg:"Password encode error!"});
                        }else{

                            // Save user to Mongo Server
                            var newUser = User({
                                Username:   req.body.Username,
                                Password:   hash,
                                Name    :   req.body.Name,
                                Image   :   req.body.Image,
                                Email   :   req.body.Email,
                                Address :   req.body.Address,
                                PhoneNumber:req.body.PhoneNumber,
                                Active: true,
                                RegisterDate: Date.now()
                            });

                            newUser.save(function(err){
                                if(err){
                                    res.json({kq:false, errMsg:"Mongo save user error"});
                                }else{
                                    res.json({kq:true, errMsg:"User register successfully."});
                                }
                            });

                        }
                    });
                });

            }else{
                res.json({kq:false,errMsg:"Email/Username is not availble."});
            }
        });
    });
    //login user
    app.post("/login",function(req,res){
        if(!req.body.Email|| !req.body.Password)
        {
            res.json({"kq":false, "errMsg":"Email is not availble."});
        }else{
            User.findOne({Email:req.body.Email},function(err,user){
                if(user==null){
                    res.json({"kq":false, "errMsg":"Email is not register"});
                }else{
                    bcrypt.compare(req.body.Password,user.Password,function(err,res2){
                        if(res2 === true){
                           //Login thanh cong
                           user.Password="banthatdethuong";
                           jwt.sign(
                            {data:user}, privateKey, {expiresIn:Math.floor(Date.now()/1000)+60*60*24*30*3}, function(err2, token){
                            if(err2){
                                res.json({"kq":false, "errMsg":"token err"});
                            }else{
                                res.json({"kq":true, "errMsg":token});
                                // Save Toke
                                var currenToken = new Token({
                                    Token: token,
                                    User: data.user.,
                                    RegisterDate: Date.now(),
                                    State: true
                                });
                                currenToken.save(function(err){
                                    if(err){
                                        res.json({kq:false, errMsg:"Mongo save user error"});
                                    }else{
                                        res.json( {kq:true, Token:token})
                                    }
                                });
                            }
                        });
                        }else{
                            res.json({kq:false, errMsg:" Password is not invalin"});
                        }
                    });
                }
            });
        }   
    });

    app.post("/verifyToken", function(req, res){
        Token.findById({Token:req.body.Token, State:true}).select("_id").lean().then(result=>{
            if(!result){
                res.json({kq:false, errMsg:"Error Token"});
            }else{
    
                jwt.verify(req.body.Token, privateKey, function(err, decoded) {
                    if(!err && decoded !== undefined ){
                        res.json({kq:true, User:decoded});
                    }else{
                        res.json({kq:false, errMsg:"Token loi."});
                    }
                });
            }
        });    
    });

    app.post("/logout", function(req, res){
        Token.updateOne({Token:req.body.Token},{State:false}, function(err){
            if(err){
                res.json({kq:false, errMsg:"Logout error."});
            }else{
                res.json({kq:true, errMsg:"Logout successfully."});
            }
        });
    });
}