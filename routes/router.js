const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
// middleWare
const authenticateToken = require('../middlewares/authenticateToken');
// controller
const mainController = require('../controller/mainController');
const signController = require('../controller/signController');
const userController = require('../controller/userController');
const fireBaseController = require('../controller/fcmController');
/**************************** page ******************************/
// 메인
router.get('/', authenticateToken, mainController.main);
// 로그아웃
router.get('/logout', async (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         console.error('세션을 파기하는 동안 오류가 발생했습니다:', err);
         return res.status(500).json({ error: '로그아웃 중 오류가 발생했습니다.' });
      }
      // 로그아웃 성공 시 홈 페이지나 다른 페이지로 리다이렉트할 수 있음
      res.redirect('login'); // 홈 페이지로 리다이렉트
   });
});
// 회원가입
router.get('/signUp', async (req, res) => {
   res.render('sign_up', { layout: 'partials/sign_layout' });
});
// 로그인
router.get("/login", async (req, res) => {
   res.render('login', { layout: 'partials/sign_layout' });
});
/**************************** API ********************************/
// 회원가입 인증 메일 전송
router.post('/api/sendEmail', upload.none(), signController.sendEmail);
// 회원가입 이메일 인증 번호 체크
router.post('/api/emailAuthentication', upload.none(), signController.emailAuthentication);
// 회원가입
router.post('/api/signUp', upload.none(), signController.signUp);
// 로그인
router.post('/api/login', upload.none(), signController.login);

// 당번에 추가할 유저 목록 가져오기
router.get('/api/getOrderList', authenticateToken, userController.getOrderList);
// 당번 추가
router.post('/api/addToOrderList', authenticateToken, userController.addToOrderList);
// 관리자 당번 순서 변경 (터치 이벤트)
router.post('/api/adminChangeOrderList', authenticateToken, upload.none(), userController.adminChangeOrderList);
// 관리자 당번 제거
router.delete('/api/deleteOrder', authenticateToken, userController.deleteOrder);

// 당번 변경 요청 보내기
router.post('/api/requestOrderChange', authenticateToken, userController.requestOrderChange);
// 당번 변경 요청 거절 및 수락
router.post('/api/responseOrderChange', authenticateToken, userController.responseOrderChange);
// 당번 변경 알림 수신 가져오기
router.post('/api/orderChangeNotifications', authenticateToken, userController.orderChangeNotifications);

// FCM 정보 가져오기
router.get('/api/firebaseConfig', authenticateToken, fireBaseController.firebaseConfig);
// FCM 토큰 저장
router.post('/api/saveFirebaseToken', authenticateToken, fireBaseController.saveFirebaseToken);
// FCM 푸시 메시지 테스트
router.post('/api/testPush', authenticateToken, userController.testPush);

module.exports = router;