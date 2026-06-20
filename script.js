const $ = (id) => document.getElementById(id);
let timer = null;

async function searchLive() {
  const keyword = $("keyword").value.trim();
  const region = $("region").value;

  if (!keyword) {
    alert("키워드를 입력하세요.");
    return;
  }

  $("status").textContent = "검색 중...";

  try {
    const res = await fetch(`/api/live-search?keyword=${encodeURIComponent(keyword)}&regionCode=${region}`);
    const data = await res.json();

    if (!res.ok) {
      $("status").textContent = "오류 발생";
      alert(data.error || "API 오류");
      return;
    }

    $("status").textContent = `${region} / "${keyword}" 라이브 ${data.count}개 검색됨 / 10초마다 자동 새로고침`;

    $("results").innerHTML = data.results.map(v => `
      <div class="card">
        <div class="rank">${v.rank}위</div>
        <img src="${v.thumbnail}" class="thumb">
        <div class="info">
          <h3>${v.title}</h3>
          <p>채널명: ${v.channelTitle}</p>
          <p>동접자 수: ${Number(v.viewers).toLocaleString()}명</p>
          <a href="${v.liveUrl}" target="_blank">라이브 보기</a>
        </div>
      </div>
    `).join("");

  } catch (e) {
    $("status").textContent = "검색 실패";
    alert(e.message);
  }
}

function startSearch() {
  searchLive();

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    searchLive();
  }, 10000);
}

function stopSearch() {
  if (timer) clearInterval(timer);
  timer = null;
  $("status").textContent = "자동 새로고침 중지됨";
}
