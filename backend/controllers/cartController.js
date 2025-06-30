import UserModel from "../models/userModel.js";
//add product to user cart
const addToCart = async (req, res) => {
try{
    const userId = req.userId; 
    const {  itemId, size } = req.body;
    
    const userData = await UserModel.findById(userId);

    let cartData = userData.cartData;

    if(cartData[itemId]){
       
        if(cartData[itemId][size]){
            cartData[itemId][size] += 1; //increment quantity
        }else{
            cartData[itemId][size] = 1; //add new size with quantity 1
        }
    }else{
        cartData[itemId] = {}; //create new item
        cartData[itemId][size] = 1; //add size with quantity 1
    }

    await UserModel.findByIdAndUpdate(userId, { cartData });

    res.json({success: true, message: 'Item added to cart successfully'});
}catch(err){
    console.log(err);
    return res.json({success: false, message: err.message});
}

}
//update user cart
const updateCart = async (req, res) => {
    try {
        const userId = req.userId; 
      const {  itemId, size, quantity } = req.body;

      const userData = await UserModel.findById(userId);
      let cartData = userData.cartData;

      cartData[itemId][size] = quantity; //update quantity

      await UserModel.findByIdAndUpdate(userId, { cartData });

      res.json({ success: true, message: "Cart updated" });
    } catch (err) {
      console.log(err);
      return res.json({ success: false, message: err.message });
    }

}


//get user cart 
const getUserCart = async(req, res) => {
    try{

        const userId = req.userId;

        const userData = await UserModel.findById(userId);
        if(!userData){
            return res.json({success: false, message: 'User not found'});
        }
        const cartData = await  userData.cartData;

        res.json({success: true, cartData});
    }catch(err){
        console.log(err);
        return res.json({success: false, message: err.message});
    }
}


export {
  addToCart,
  updateCart,
  getUserCart,
}



