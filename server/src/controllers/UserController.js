const UserModel =  require("../models/Users")
const bcrypt = require("bcryptjs")



exports.registerUser = ( req, res ) => {
   // console.log("Inside resgiter user");
    
    const user = req.body;
    const newUser = new UserModel(user);
    newUser.save((err, result) => {
        if (err){
            res
            .status(500)
            .send(JSON.stringify({ message: "Something went wrong!", err }));

        } else {
            res.send(JSON.stringify({user: result}));
        }
    });
    // res.json(user);

}


exports.registerCamera = async ( req, res ) => {
    // console.log("Inside resgiter user");


    try {
        
        await UserModel.updateOne({_id: req.params.id}, {
            $push : {
                cameras :  
                     req.body
                
            }
        }) 
        res.send(JSON.stringify({Response: "added successfully"}));
        

    } catch (error) {
        res
             .status(500)
             .send(JSON.stringify({ message: "Something went wrong!", error }));
 
    }
 
}






exports.find = async (req, res) => {

    try{
        console.log("param value:" + req.params.emailId)
        const user = await UserModel.findOne({emailId: req.params.emailId});
        console.log("user "+user);
        if(user === null){
            res.status(204).send("User not present")
        }
        else {
            res.status(200).send(user.emailId)
        }
    }
    catch(err){
        console.log("Inside userController find");
    }
}


exports.login = async (req, res) => {

    try{
        const user = await UserModel.findOne({emailId: req.body.emailId});
        console.log("user "+user);
        if(user === null){
            res.status(204).send("User not present")
        }
        else {
          
          const result = await user.comparePassword(req.body.password);
          if(result){
            console.log("Login successful");
            // res.cookie('cookie',"user",{maxAge: 900000, httpOnly: false, path : '/'});
            // res.cookie('userId',user._id,{maxAge: 900000, httpOnly: false, path : '/'});
            // res.cookie('userEmail',user.emailId,{maxAge: 900000, httpOnly: false, path : '/'});
            // res.cookie('userFirstName',user.firstName,{maxAge: 900000, httpOnly: false, path : '/'});
            // res.cookie('userLastName',user.lastName,{maxAge: 900000, httpOnly: false, path : '/'});
            // res.cookie('userLocation',user.address.city,{maxAge: 900000, httpOnly: false, path : '/'});

            // res.writeHead(200,{
            // 'Content-Type' : 'text/plain'
            // })
            // res.end("Successful Login");
            res.send(user);


        } else {
            res
                .status(400)
                .send(JSON.stringify({ message: "Invalid login credentials." }));

        }
    }
    }
    
    catch(err){
        console.log("Inside userController find");
    }
}




exports.deleteCamera = async ( req, res ) => {
    // console.log("Inside resgiter user");


    try {
        
        await UserModel.updateOne({emailId: req.params.emailId}, {
            $pull : {
                cameras:{
                    _id : req.params.cameraId
                }                  
            }
        }) 
        res.send(JSON.stringify({Response: "Camera Deleted successfully"}));
        

    } catch (error) {
        res
             .status(500)
             .send(JSON.stringify({ message: "Something went wrong!", error }));
 
    }
 
}


exports.updateCamera = async ( req, res ) => {
    // console.log("Inside resgiter user");


    try {
        
        await UserModel.updateOne({emailId: req.params.emailId, "cameras._id" : req.body._id}, {
            $set : {
                "cameras.$.name": req.body.name,
                "cameras.$.ip" : req.body.ip
            }
        }) 
        res.send(JSON.stringify({Response: "Camera Updated successfully"}));
        

    } catch (error) {
        res
             .status(500)
             .send(JSON.stringify({ message: "Something went wrong!", error }));
 
    }
 
}


exports.liveFeed = async ( req, res ) => {
    // console.log("Inside resgiter user");


    try {
        
        const cameras = await UserModel.findOne({emailId: req.params.emailId}, {
            cameras : 1
        }) 
        res.status(200).send(cameras)        

    } catch (error) {
        res
             .status(500)
             .send(JSON.stringify({ message: "Something went wrong!", error }));
 
    }
 
}