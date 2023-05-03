import jwt from "jsonwebtoken"

export const isAuth=async(req, res,next)=>{
   try {
    const{token}=req.cookies

    if(!token){
     return   res.status(400).json({
            success:false,
            message:"Login First"
        })
    }

    const decode=jwt.verify(token,process.env.JWT_SECRET);

    req.user=decode.id

next();
   } catch (error) {
    return res.status(500).json({
        success:false,
        message:error.message
    })
   }
}