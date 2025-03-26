const path = require("path");
const { User, UserOrder, Notification } = require('../models/Users');
const schedule = require('node-schedule');
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Path to your service account key JSON file
// Firebase Admin SDK 설정
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://codex-project-b4939.firebaseio.com',
});

const changeOrder = async () => {
  try {
    // 현재 target이 true인 사용자 찾기
    const currentTargetUser = await UserOrder.findOne({ target: true });

    if (!currentTargetUser) {
      throw new Error('현재 target이 true인 사용자를 찾을 수 없습니다.');
    };

    // totalCount 구하기 (orderList 데이터 수)
    const totalCount = await UserOrder.countDocuments({});

    // currentTargetUser의 order 값에 +1 한 사용자 찾기
    let nextOrder = currentTargetUser.order + 1;

    if (nextOrder > totalCount) { 
      nextOrder = 1;
    };

    const nextTargetUser = await UserOrder.findOne({ order: nextOrder });

    // nextTargetUser의 target과 nextTarget 설정
    if (nextTargetUser) {
      nextTargetUser.target = true;
      nextTargetUser.nextTarget = false;
      await nextTargetUser.save();
    } else {
      console.log(`주어진 order (${nextTargetUser.name})에 해당하는 사용자를 찾을 수 없습니다.`);
    }

    nextOrder = nextTargetUser.order + 1;

    if (nextOrder > totalCount) { 
      nextOrder = 1;
    };

    // nextOrder보다 +1 큰 order 값을 가진 사용자 찾기
    const nextOrderPlusOneUser = await UserOrder.findOne({ order: nextOrder });

    if (nextOrderPlusOneUser) {
      nextOrderPlusOneUser.target = false;
      nextOrderPlusOneUser.nextTarget = true;
      await nextOrderPlusOneUser.save();
    } 


    // 그 외 나머지 데이터들 추출
    const otherUsers = await UserOrder.find({
      $and: [
        { email: { $ne: nextTargetUser.email} }, // nextTargetUser를 제외한 나머지 데이터
        { email: { $ne: nextOrderPlusOneUser.email } } // nextOrderPlusOneUser를 제외한 나머지 데이터
      ]
    });

    // 그 외 나머지 데이터들의 target과 nextTarget을 false로 변경
    await UserOrder.updateMany(
      { _id: { $in: otherUsers.map(user => user._id) } }, // 해당 사용자들의 _id 배열
      { $set: { target: false, nextTarget: false } } // 업데이트할 필드 설정
    );

  } catch (err) {
    console.error('오류 발생:', err);
  }
};
const thisChangeOrder = async () => {
  try {
    const currentTargetUser = await UserOrder.findOne({ target: true });
    let nextOrder = currentTargetUser.order;

    // 현재 target이 true인 사용자 찾기

    if (!currentTargetUser) {
      nextOrder = 1;
    };

    // totalCount 구하기 (orderList 데이터 수)
    const totalCount = await UserOrder.countDocuments({});

    // currentTargetUser의 order 값에 +1 한 사용자 찾기
    if (nextOrder > totalCount) { 
      nextOrder = 1;
    };

    const nextTargetUser = await UserOrder.findOne({ order: nextOrder });

    // nextTargetUser의 target과 nextTarget 설정
    if (nextTargetUser) {
      nextTargetUser.target = true;
      nextTargetUser.nextTarget = false;
      await nextTargetUser.save();
    } 

    nextOrder = nextTargetUser.order + 1;

    if (nextOrder > totalCount) { 
      nextOrder = 1;
    };

    // nextOrder보다 +1 큰 order 값을 가진 사용자 찾기
    const nextOrderPlusOneUser = await UserOrder.findOne({ order: nextOrder });

    if (nextOrderPlusOneUser) {
      nextOrderPlusOneUser.target = false;
      nextOrderPlusOneUser.nextTarget = true;
      await nextOrderPlusOneUser.save();
    } 


    // 그 외 나머지 데이터들 추출
    const otherUsers = await UserOrder.find({
      $and: [
        { email: { $ne: nextTargetUser.email} }, // nextTargetUser를 제외한 나머지 데이터
        { email: { $ne: nextOrderPlusOneUser.email } } // nextOrderPlusOneUser를 제외한 나머지 데이터
      ]
    });

    // 그 외 나머지 데이터들의 target과 nextTarget을 false로 변경
    await UserOrder.updateMany(
      { _id: { $in: otherUsers.map(user => user._id) } }, // 해당 사용자들의 _id 배열
      { $set: { target: false, nextTarget: false } } // 업데이트할 필드 설정
    );

  } catch (err) {
    console.error('오류 발생:', err);
  }
};
const weeklyTarget = schedule.scheduleJob({ dayOfWeek: 1, hour: 0, minute: 0 }, changeOrder);

// 매시간마다 실행되는 스케줄러 설정
schedule.scheduleJob('* * * * *', async () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 현재 target이 true인 사용자 찾기
  const currentTargetUser = await UserOrder.findOne({ target: true });
  // 모든 사용자의 토큰 가져오기
  let tokensSnapshot = await User.find({ firebaseToken: { $exists: true, $ne: null } }).exec();
  const title = '슬코생 당번 알림';
  let body = '';
  let trigger = false;
  
  // 조건에 따라 작업 수행
  if (dayOfWeek === 1 && hour === 9 && minute === 0) {
    console.log('월요일 오전 9시 조건 실행');
    tokensSnapshot = await User.find({ firebaseToken: { $exists: true, $ne: null } }).exec();
    body = `이번 주 당번은 ${currentTargetUser.name}님 입니다!`;
    const tokens = tokensSnapshot.map(user => user.firebaseToken);

    // 웹 푸시 알림 보내기
    if(tokens) {
      await admin.messaging().sendToDevice(tokens, {
        notification: {
          title,
          body,
        }
      });
    };
  } else if (dayOfWeek === 2 && hour === 9 && minute === 0) {
      console.log('화요일 오전 9시 조건 실행');

  } else if (dayOfWeek === 3 && hour === 16 && minute === 0) {
      console.log('수요일 오후 16시 조건 실행');
      tokensSnapshot = currentTargetUser.firebaseToken;
      body = `수요일은 커피머신, 정수기 물 받침대 설거지, 제빙기 청소하는 날입니다.`;

      const tokens = tokensSnapshot.map(user => user.firebaseToken);

      // 웹 푸시 알림 보내기
      if(tokens) {
        await admin.messaging().sendToDevice(tokens, {
          notification: {
            title,
            body,
          }
        });
      };

  } else if (dayOfWeek === 4 && hour === 9 && minute === 0) {
      console.log('목요일 오전 9시 조건 실행');

  } else if (dayOfWeek === 5 && hour === 16 && minute === 0) {
      console.log('금요일 오후 16시 조건 실행');
      tokensSnapshot = await User.find({ firebaseToken: { $exists: true, $ne: null } }).exec();
      body = `일반, 음식물 쓰레기, 분리수거 정리 및 분리배출하는 날입니다.`;
      const tokens = tokensSnapshot.map(user => user.firebaseToken);

      // 웹 푸시 알림 보내기
      if(tokens) {
        await admin.messaging().sendToDevice(tokens, {
          notification: {
            title,
            body,
          }
        });
      };
  } else {
      console.log(`현재 시간: ${now}`);
  }

});
// 당번에 추가할 유저 목록 가져오기
exports.getOrderList = async (req, res) => {


  
  try {
    const orderListUsers = await UserOrder.find({}, 'email');
    const orderListUserEamils = orderListUsers.map(order => order.email);
    const usersNotInOrderList = await User.aggregate([
      { $match: { email: { $nin: orderListUserEamils } } },
      { $project: { _id:0, email: 1, name: 1 } } 
    ]);


    res.status(200).json(usersNotInOrderList);
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
// [관리자] 당번 추가하기
exports.addToOrderList = async (req, res) => {
    const { check_order_list } = req.body;

    try {
      let checkOrderArray = [];

      if (Array.isArray(check_order_list)) {
        checkOrderArray = check_order_list;
      } else {
        checkOrderArray.push(check_order_list);
      }

      // 배열을 순회하면서 처리
      for (let i = 0; i < checkOrderArray.length; i++) {
        const userEmail = checkOrderArray[i];
        const user = await User.findOne({ email: userEmail });

        // User 테이블에서 해당 이메일을 갖고 있는 유저 정보를 찾음
        if (user) {
          const newUserOrder = new UserOrder({
            email: user.email,
            name: user.name,
            order: String((await UserOrder.countDocuments()) + 1), // UserOrder 데이터 갯수보다 하나 더 많은 order 값 설정
            target:false,
            nextTarget: false,
          });
          await newUserOrder.save(); // UserOrder 데이터에 추가
        }

      }
      await thisChangeOrder();
      res.redirect('/');
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}
// [관리자] 당번 순서 변경하기 (터치 이벤트)
exports.adminChangeOrderList = async (req, res) =>{
  const { order } = req.body;

  try {
    for (let i = 0; i < order.length; i++) {
      const userEmail = order[i];
      // order 필드에 카운터 값을 할당하고 카운터를 증가시킵니다.
      // 사용자의 이메일을 기준으로 찾아서 order 값을 업데이트합니다.
      const user = await UserOrder.findOneAndUpdate({ email: userEmail }, { order: i + 1 });
      if (!user) {
        console.error('이메일을 찾을 수 없습니다.', userEmail);
        // 사용자를 찾을 수 없는 경우 에러 처리
        res.status(404).json({ success: false, error: '이메일을 찾을 수 없습니다. ' + userEmail });
        return;
      }
    }
    await thisChangeOrder();
    res.status(200).json({ success: true, error: '순서 변경에 성공했습니다.' });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
// [관리자] 당번 제거
exports.deleteOrder = async (req, res) => {
  const { email } = req.body;

  try {
      const deleteUser = await UserOrder.findOne({ email });
      const totalCount = await UserOrder.countDocuments({});
      const targetOrder = deleteUser.order;

      if(totalCount > targetOrder) {
        const nextOrder = await UserOrder.findOne({ order: targetOrder + 1 });
        nextOrder.target = true;
        nextOrder.nextTarget = false;
      } else {
        const nextOrder = await UserOrder.findOne({ order: 1 });
        nextOrder.target = true;
        nextOrder.nextTarget = false;
      };

      const result = await UserOrder.deleteOne({ email });

      await thisChangeOrder();
      if (result.deletedCount === 1) {
          res.json({ success: true });
      } else {
          res.status(404).json({ success: false, error: 'User not found' });
      }
  } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ success: false, error: error.message });
  }
};
// 당번 변경 요청 보내기
exports.requestOrderChange = async (req, res) => {
  const { requesterEmail, targetEmail } = req.body;

  try {
    const requester =  await UserOrder.findOne({ email: requesterEmail });
    const target =  await UserOrder.findOne({ email: targetEmail });



    const notification = new Notification({
        email: targetEmail,
        message: `${requester.name}님이 당번 변경을 요청했습니다.`,
        targetName: target.name,
        requestEmail: requesterEmail
      });
     await notification.save();

        
     const pushTarget =  await User.findOne({ email: targetEmail });

        const targetToken = pushTarget.firebaseToken;
  
        if(targetToken) {
          await admin.messaging().sendToDevice(targetToken, {
            notification: {
              title: '당번 변경 요청',
              body: `${requester.name}님이 당번 변경을 요청했습니다.`,
            }
          });
        };


    res.status(200).json({ success: true, message: '교환 요청을 보냈습니다.' });
  } catch (error) {
      console.error('Error requesting exchange:', error);
      res.status(500).json({ success: false, error: error.message });
  }
}
// 당번 변경 요청 거절 및 수락
exports.responseOrderChange = async (req, res) => {
  const { targetEmail, requesterEmail, action, createdAt } = req.body; // action이 'accept' 또는 'reject'일 수 있습니다.

  try {

    const targetPushUser = await User.findOne({ email: targetEmail });
    const requesterPushUser = await User.findOne({ email: requesterEmail });
    const targetToken = requesterPushUser.firebaseToken;

    if (action === 'accept') {
        // 교환 처리
        const targetUser = await UserOrder.findOne({ email: targetEmail });
        const requesterUser = await UserOrder.findOne({ email: requesterEmail });

        if (!targetUser || !requesterUser) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // order 값 교환
        const tempOrder = targetUser.order;
        targetUser.order = requesterUser.order;
        requesterUser.order = tempOrder;

        // target 값 교환
        const tempTarget = targetUser.target;
        targetUser.target = requesterUser.target;
        requesterUser.target = tempTarget;
        // nextTarget 값 교환
        const tempNextTarget = targetUser.nextTarget;
        targetUser.nextTarget = requesterUser.nextTarget;
        requesterUser.nextTarget = tempNextTarget;


        await targetUser.save();
        await requesterUser.save();

        // 수락 알림 업데이트
        await Notification.updateMany(
            { email: targetEmail, requestEmail: requesterEmail, status: 'pending', createdAt: { $eq: createdAt } },
            { $set: { status: 'accepted' } }
        );

        // 현재 사용자의 이메일과 같은 email 또는 requestEmail 필드의 모든 문서의 상태를 'rejected'로 변경
        await Notification.updateMany(
          { 
            $or: [
              { email: targetEmail }, 
              { requestEmail: targetEmail }
            ], 
            status: 'pending'
          },
          { $set: { status: 'rejected' } }
        );

        await Notification.updateMany(
          { 
            $or: [
              { email: requesterEmail }, 
              { requestEmail: requesterEmail }
            ], 
            status: 'pending'
          },
          { $set: { status: 'rejected' } }
        );



        if(targetToken) {
          await admin.messaging().sendToDevice(targetToken, {
            notification: {
              title: '당번 변경 요청 수락',
              body: `${targetPushUser.name}님이 당번 변경을 수락했습니다.`,
            }
          });
        };

        res.status(200).json({ success: true, message: '교환 요청을 수락했습니다.' });
    } else if (action === 'reject') {
      // 거부 알림 업데이트
      await Notification.updateMany(
        { email: targetEmail, requestEmail: requesterEmail, status: 'pending' },
        { $set: { status: 'rejected' } }
      );

        if(targetToken) {
          await admin.messaging().sendToDevice(targetToken, {
            notification: {
              title: '당번 변경 요청 거절',
              body: `${targetPushUser.name}님이 당번 변경을 거절했습니다.`,
            }
          });
        };

        res.status(200).json({ success: true, message: '교환 요청을 거부했습니다.' });
    } else {
        res.status(400).json({ success: false, message: '유효하지 않은 작업입니다.' });
    }
    await thisChangeOrder();

  } catch (error) {
      console.error('Error responding to exchange:', error);
      res.status(500).json({ success: false, error: error.message });
  }
}
// 당번 변경 알림 수신
exports.orderChangeNotifications = async (req, res) => {
  const { userEmail } = req.body;
  try {
      // userEmail이 email 필드 또는 requestEmail 필드에 있는 알림을 찾기
      const notifications = await Notification.find({
        $or: [
          { email: userEmail },
          { requestEmail: userEmail }
        ]
      }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}






exports.testPush = async (req,res) => {
  const { title, message } = req.body;
  try {

    // 모든 사용자의 토큰 가져오기
    const tokensSnapshot = await User.find({ firebaseToken: { $exists: true, $ne: null } }).exec();
    const tokens = tokensSnapshot.map(user => user.firebaseToken);

    if(tokens) {
      await admin.messaging().sendToDevice(tokens, {
        notification: {
          title,
          icon: path.join(__dirname, 'assets/images/icon_webPush.png'),
          body: message,
        }
      });
    };

    res.status(200).send('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Error sending push notification');
  }
};