import Subscriber from "../models/subscriberModel.js";

const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Already subscribed." });
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


//get all subscribers
// const getAllSubscribers = async (req, res) => {
//   try {
//     const subscribers = await Subscriber.find({});
//     res.json({ success: true, subscribers });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message:err.message });
//   }
// };

// export { addSubscriber ,getAllSubscribers};


//check if email is already subscribed
const checkSubscriber = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if already subscribed
    const existing = await Subscriber
      .findOne({ email });
    
    if (existing) {
      return res.json({ success: true, message: "Already subscribed.", email: existing.email });
    }
    // If not subscribed, return success with no email
    return res.json({ success: false, message: "Not subscribed.", email: null });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
}

export { checkSubscriber,addSubscriber }; 