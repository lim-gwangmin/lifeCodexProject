const { User } = require('../models/Users');


exports.firebaseConfig = (req, res) => {
      res.json({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
   });
};

exports.saveFirebaseToken = async (req ,res) => {
   const { email, firebaseToken } = req.body;
 
   try {
     // 이미 등록된 사용자가 있는지 확인
     const user = await User.findOne({ email });
 
     if (user) {
       user.firebaseToken = firebaseToken;
     };
 
     // 저장하거나 업데이트된 사용자 정보 저장
     await user.save();
 
     res.status(200).json({ message: 'Firebase Token saved successfully' });
   } catch (err) {
     console.error(err);
     res.status(500).json({ error: 'Failed to save Firebase Token' });
   }
}

