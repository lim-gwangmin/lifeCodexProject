const { User, UserOrder, EveryWorks, TargetWorks } = require('../models/Users');

exports.main = async (req, res) => {
   const token = req.user.token;

   if (token) {
      // 로그인 유저 정보
      const user = await User.findOne({ token });
      // 당번 리스트
      let orderList = await UserOrder.find({});
      // order 값을 기준으로 오름차순 정렬
      orderList.sort((a, b) => a.order - b.order);
      // 정렬된 리스트에 대해 순번을 새로 할당
      let updatedOrderList = orderList.map((user, index) => {
        return { ...user._doc, order: index + 1 }; // 1번부터 순서대로 할당
      });
      // 로그인한 유저를 제외한 나머지 당번 리스트
      let remainingOrderList = [];
      const thisCheckOrder = await UserOrder.find({ email: req.user.email });

      if(thisCheckOrder.length) {
         remainingOrderList = await UserOrder.find({ email: { $ne: req.user.email } });
      };

      // 모두의 일 
      const everyWorks = await EveryWorks.find({});
      // 당번의 일
      const targetWorks = await TargetWorks.find({});
     // 토큰이 존재하면 홈페이지로 이동
     res.render('index', {
         email: user.email,
         name: user.name,
         permission: user.permission,
         orderList: updatedOrderList,
         remainingOrderList,
         everyWorks,
         targetWorks,
         layout: 'partials/layout'
      });
   } else {
      // 토큰이 없으면 로그인 페이지로 이동
      res.redirect('/login');
   }
};