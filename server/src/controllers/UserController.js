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
          const ipPresent = user.cameras.find(obj=> obj.ip===req.body.ipAddress);
          if(result){
            if(req.body.ipAddress == "")
                res.send({id: user._id,emailId : user.emailId, name: user.name , roomId: user.roomId});
            else if(ipPresent)
            {
                const ipName = user.cameras.find(cam=>cam.ip == req.body.ipAddress).name;
                res.send({id: user._id, emailId : user.emailId, name: ipName, roomId: user.roomId});
            }
            else
                res
                    .status(400)
                    .send(JSON.stringify({ error: "Invalid login credentials." }));

        } else {
            res
                .status(400)
                .send(JSON.stringify({ error: "Invalid login credentials." }));

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

// Save Recording

exports.saveRecording = async ( req, emailId ) => {
    console.log("Inside saveRecording user");
    console.log(req)


    try {
        
        await UserModel.updateOne({emailId: emailId}, {
            $push : {
                recordings :  
                     req
                
            }
        }) 
        console.log("completed")
        // res.send(JSON.stringify({Response: "added successfully"}));
        

    } catch (error) {
        console.log(error)
        // res
            //  .status(500)
            //  .send(JSON.stringify({ message: "Something went wrong!", error }));
 
    }
 
}


exports.fetchRecordings= async (req, res) => {
    try{
      
        // const page = parseInt(req.query.page);
        // const limit = parseInt(req.query.limit);
        // const skipIndex = (page - 1) * limit;
        
        const results = await UserModel.find({emailId: req.params.id }, {recordings:1})

        res.status(200).send(results)
        
    }
    catch(err){
        console.log("Inside fetchRecordings : " + err);
    }
}
