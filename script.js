const $ = (id) => document.getElementById(id);
let timer = null;

function login() {
  const pw = $("password").value.trim();
  if (!pw) {
    alert("비밀번호를 입력하세요.");
    return;
  }

  localStorage.setItem("sitePassword", pw);
  $("loginBox").style.display = "none";
  $("appBox").style.display = "block";
}

function logout() {
  localStorage.removeItem("sitePassword");
  stopSearch();
  $("appBox").style.display = "none";
  $("loginBox").style.display = "block";
}

async function searchLive() {
  const keyword = $("keyword").value.trim();
  const region = $("region").value;
  const password = localStorage.getItem("sitePassword");

  if (!keyword) {
    alert("키워드를 입력하세요.");
    return;
  }

  $("status").textContent = "검색 중...";

  try {
    const res = await fetch(`/api/live-search?keyword=${encodeURIComponent(keyword)}&regionCode=${region}`, {
      headers: {
        "x-site-password": password
      }
    });

    const data = await res.json();

    if (!res.ok) {
      $("status").textContent = data.error || "오류 발생";
      alert(data.error || "API 오류");
      logout();
      return;
    }

    $("status").textContent = `${region} / "${keyword}" 라이브 ${data.count}개 검색됨 / 10초마다 자동 새로고침`;

    $("results").innerHTML = data.results.map(v => `
      <div class="card">
        <div class="rank">${v.rank}</div>
        <img src="${v.thumbnail}" class="thumb">
        <div class="info">
          <h3>${v.title}</h3>
          <p>채널명: ${v.channelTitle}</p>
          <a href="${v.liveUrl}" target="_blank">라이브 보기</a>
        </div>
        <div class="viewers">
          ${Number(v.viewers).toLocaleString()}명
        </div>
      </div>
    `).join("");

    const now = new Date();
    if ($("clock")) {
      $("clock").textContent = now.toLocaleTimeString("ko-KR");
    }

  } catch (e) {
    $("status").textContent = "검색 실패";
    alert(e.message);
  }
}

function startSearch() {
  searchLive();

  if (timer) clearInterval(timer);

}

function stopSearch() {
  if (timer) clearInterval(timer);
  timer = null;
  $("status").textContent = "자동 새로고침 중지됨";
}

window.onload = () => {
  if (localStorage.getItem("sitePassword")) {
    $("loginBox").style.display = "none";
    $("appBox").style.display = "block";
  }

  if ($("clock")) {
    $("clock").textContent = new Date().toLocaleTimeString("ko-KR");
  }
};
