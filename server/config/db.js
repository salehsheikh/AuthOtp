import mongoose from "mongoose";

// Connect to MongoDB
async function connect(){
    try{
        const mongoUri=process.env.MONGO_URI;
        const db=await mongoose.connect(mongoUri,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("connected to MongoDB");
        return Promise.resolve(db);
        
    }catch(err){
        return Promise.reject(err);
    }
};
export default connect;