![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-8a2be2?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

# 주번 알림 프로젝트

회사에서 매주 커피 머신 및 분리수거를 담당하는 당번을 정하지만,  
휴가나 일정 변경으로 인해 **이번 주 당번이 누구인지 헷갈리는 상황이 자주 발생**했습니다.

이를 해결하고자, 주기적인 알림과 관리 기능이 포함된 **자체 당번 관리 프로그램**을 개발하였습니다.

## 주요 기능

1. **주간 알림 자동 발송**  
   - 매주 월요일 오전 09:00, 이번 주 및 다음 주 당번에게 푸시 알림 전송  
   - 각 요일별 업무 종료 전, 해당 요일 당번에게 업무 알림 발송

2. **당번 변경 요청 기능**  
   - 사용자는 다른 사용자에게 당번 변경을 요청할 수 있으며  
   - 상대방은 수락 또는 거절이 가능합니다.

3. **관리자 기능**  
   - 관리자 계정은 당번 사용자 추가/삭제/변경이 가능합니다.

<!-- .env 
============= -->
<!-- MONGO_DB_URL = "mongodb+srv://gmLim:awdsxz2@Cluster0.pykgshf.mongodb.net/?retryWrites=true&w=majority"
PORT = 80 -->
