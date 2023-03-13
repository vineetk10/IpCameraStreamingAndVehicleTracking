const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const { ObjectID } = require('bson');


const UserSchema = new mongoose.Schema({
    name : {
        type: String,
        trim: true
    },
   
    emailId : {
        type: String,
        trim: true
    },
    password : {
        type: String,
        trim: true
    },
    cameras : [
        {
            ip: String,
            name: String,
            date: Date,
            session: String,
            connection: String,
            token: String 
        }
    ],
    roomId : {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
    },
    recordings : [
        {
            cameraName: String,
            name: String,
            startDate: Date,
            endDate: Date,
            duration: Number,
            s3URI:String
        }
    ]
});

  

UserSchema.pre('save', function(next){
    if(this.isModified('password')){
        bcrypt.hash(this.password, 8, (err, hash) => {
            if(err){
                return next(err);
            }

            this.password = hash;
            next();
        });
    }
});


UserSchema.methods.comparePassword = async function(password) {
    if(!password) throw new Error('Password is missing.');
    try{
        const result = await bcrypt.compare(password, this.password);
        return result;
    } catch(err){
        console.log('Error while comparing password : '+err.message);
    }
}



const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel;
