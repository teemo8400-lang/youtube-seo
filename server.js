YouTube SEO Pro 설치법

1. Google Cloud에서 YouTube Data API v3 API 키를 만든다.
2. Render.com 가입 후 New + > Web Service 선택.
3. 이 폴더를 GitHub 저장소에 올리고 Render에 연결한다.
4. Render 설정값:
   Build Command: npm install
   Start Command: node server.js
5. Environment Variables에 추가:
   YOUTUBE_API_KEY = 본인 API 키
6. 배포 완료 후 Render 주소로 접속.

주의: API 키는 절대 index.html/script.js에 넣지 말고 Render 환경변수에만 넣으세요.
