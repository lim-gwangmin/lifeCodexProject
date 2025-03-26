importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js')
const firebaseConfig = {
   apiKey: "AIzaSyBtvbqA28mbqZYZqINF6KUOhcrJfa3INUU",
   authDomain: "codex-project-b4939.firebaseapp.com",
   projectId: "codex-project-b4939",
   storageBucket: "codex-project-b4939.appspot.com",
   messagingSenderId: "558480223114",
   appId: "1:558480223114:web:05d36364cbf0f8284c3673",
   measurementId: "G-X1PJ1T37DE"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  const { title, body, click_action } = payload.notification;

  const notificationTitle = title;
  const notificationOptions = {
    body: body,
    icon: './assets/images/icon_webPush.png',
    data: {
      clickUrl: click_action || '/'  // click_action이 없을 경우 기본 경로로 설정
    }
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
