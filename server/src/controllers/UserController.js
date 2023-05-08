const UserModel =  require("../models/Users")
const bcrypt = require("bcryptjs")
var portsUtil = require("../rtsp/portsUtil")
var webSocketUtils = require("../rtsp/webSocketUtils")



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


    if(req.body.isRTSP == true){
        console.log(req.body)
        const port = portsUtil.getPort()
        console.log('********* PORT ', port)
        req.body.port = port
        console.log('********* REQ ', req.body)
        if(port == undefined){
            console.log("INSIDE undefined")
            res
                     .status(500)
                     .send(JSON.stringify({ message: "Sorry Currently no Ports are available" }));
        }
        else{

            webSocketUtils.startStream(req.body, req.params.id)

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
        
    }

    else{
        try {
            
            await UserModel.updateOne({emailId: req.params.id}, {
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
 
}






exports.refreshCamera = async ( req, res ) => {
    console.log(req.body)
    console.log(req.query.action)
    console.log('user id: ', req.params.id)

    const portInUse = webSocketUtils.checkPortInUse(req.body.port)

    if (portInUse == false){
        // restart connection
        console.log('line 107')
        webSocketUtils.startStream(req.body, req.params.id)
        portsUtil.engagePort(req.body.port)

        // remove this port from available ports list
    }
    else{
        // compare both the camera name
        console.log('line 112')
        try{

        const cameraSame = webSocketUtils.checkPortInUseHasSameCameraName(req.body.port, req.body.name)

            
            if(cameraSame == true){
                // stop and refresh the connection
                webSocketUtils.restartStream(req.body, req.params.id);
                console.log('line 123')
            }else{
                // get new port for this camera and start the connection
                const port = portsUtil.getPort()
                // console.log("Port returned: ", port)
                req.body.port = port;
                // console.log("cameraSame: ", cameraSame, ' body: ', req.body);

                webSocketUtils.startStream(req.body, req.params.id)
                console.log('line 132')
                console.log("cameraSame: " , cameraSame)

                // update new port details in camera

                await UserModel.updateOne({_id: req.params.id, "cameras._id" : req.body._id}, {
                    $set : {
                        "cameras.$.port": port
                    }
                }) 
                
            }
            
        }
        catch(err){
        console.log('Error in refreshCamera, line 117, error: ', err)
        }
    }

    // if response is false that is the same port is not in use can directly start the streaming, otherwise response is true check if cameraID is different, then the user sent, then only get a new port start process on that and update the DB with new port details, otherwise just stop the stream and start it again on the same port 
    console.log("response")
    res.send(JSON.stringify({Response: "Camera Refreshed successfully with new port"}));
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
                res.send({id: user._id, emailId : user.emailId, name: ipName, roomId: user.roomId, ip: true});
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

        const camera = await UserModel.findOne({emailId: req.params.emailId, cameras: { $elemMatch: { _id: req.params.cameraId } }}, {"cameras.$": 1})
        console.log("****** CAMERA: ", camera.cameras[0])

        if(camera.cameras[0].isRTSP === true){
            console.log("INSIDE isRTSP port release")
            // release port 
            portsUtil.releasePort(camera.cameras[0].port)
            
            // release websocket connection
            webSocketUtils.stopStream(camera.cameras[0].port)
        }
        
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

        // if camera type is IP then restart the stream

            const camera = await UserModel.findOne({emailId: req.params.emailId, "cameras._id" : req.body._id}, { "cameras.$": 1 }).exec();
            console.log('camera: ', camera)
            if(camera.cameras[0].isRTSP == true){
                console.log('Inside if: ', camera)
                webSocketUtils.restartStream(camera.cameras[0], camera._id);
            }
            
        //
        
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



exports.getCameras = async ( req, res ) => {
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
// the socket and rtsp camera details
exports.liveFeed = async ( req, res ) => {
    // console.log("Inside resgiter user");


    try {
        
        const cameras = await UserModel.aggregate([
            { $match: { "emailId": req.params.emailId } },
            { $project: {
                cameras: {
                  $filter: {
                    input: "$cameras",
                    as: "camera",
                    cond: { $eq: [ "$$camera.isRTSP", true ] }
                  }
                }
              }
            }
          ])
//         const cameras = await UserModel.find(
            
//   { "emailId": req.params.emailId, "cameras": { $elemMatch: { "isRTSP": true } } },
//   { "cameras": 1 }) 
        res.status(200).send(cameras)        

    } catch (error) {
        res
             .status(500)
             .send(JSON.stringify({ message: "Something went wrong!", error }));
 
    }
 
}

// Save Recording

exports.saveRecording = async ( req, userId ) => {
    console.log("Inside saveRecording user");
    console.log(req)


    try {
        
        await UserModel.updateOne({_id: userId}, {
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
        
        const results = await UserModel.findOne({_id: req.params.id }, {recordings:1})

        res.status(200).send(results)
        
    }
    catch(err){
        console.log("Inside fetchRecordings : " + err);
    }
}


exports.fetchQueries= async (req, res) => {
    try{
      
        console.log(req.params.id)
        const results = await UserModel.findOne({_id: req.params.id }, {queries:1})
        console.log(results)
        res.status(200).send(results)
        
    }
    catch(err){
        console.log("Inside fetchQueries : " + err);
    }
}


exports.deleteQuery= async (req, res) => {
    try{
      
        await UserModel.updateOne({_id: req.params.id}, {
            $pull : {
                queries:{
                    message_id : req.params.query_id
                }                  
            }
        }) 
        res.send(JSON.stringify({Response: "Request Deleted successfully"}));
        
    }
    catch(err){
        console.log("Inside fetchQueries : " + err);
    }
}


