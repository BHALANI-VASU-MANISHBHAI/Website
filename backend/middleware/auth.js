import jwt from 'jsonwebtoken';



const authUser= async (req, res, next) => {
   
   try{
      const token = req.headers.token;  
   if(!token){
        return res.json({success: false, message: 'Not Authorized Login Again'});
   }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("token ", token_decode);
   //  req.body.userId = token_decode.id;
      req.userId = token_decode.id; // Store user ID in request object
      req.role = token_decode.role;
      console.log("req.userId ", req.userId);
      console.log("req.role ", req.role);
    next(); 

   }catch(err){
    console.log(err);
    return res.json({success: false, message:err.message});
   }

}

export default authUser;