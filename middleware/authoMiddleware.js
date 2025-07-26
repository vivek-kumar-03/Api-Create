const  jwt = require("jsonwebtoken")
function authMiddleware(req, res,next){
    const authHeader=req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer")) 
{
        return res.status(401).json({error:"No token Provided"})
    }
    const SECRET_KEY="this_is_my_secret_key";
    const token=authHeader.split(" ")[1];
    console.log("Exteracted Token", token);
    try{
        const decoded=jwt.verify(token,SECRET_KEY,)
        req.user=decoded;
        next();
    }catch(error){
        console.error("jwt Error:", error.message);
        return res.status(401).json({message: "invalid token"})

        }
    
}
module.exports=authMiddleware;