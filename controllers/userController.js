import userModel from "../models/userModel.js";

const getUser=async(req,res)=>{
  const users=await userModel.find();
  if(!users){
    return res.status(400).json({success:false,message:"user not found"});
  }
  res.status(200).json({success:true,users});
}

export {getUser};