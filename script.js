const $ = (id) => document.getElementById(id);

function videoId(input) {
  const v = input.trim();
  const m = v.match(/(?:v=|youtu\.be\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return v;
}

async function runAll() {
  alert("검색 시작");

  const keyword = $("keyword").value.trim();
  const video = $("video").value.trim();
  const region = $("region").value;

  if (!keyword || !video) {
    alert("키워드와 영상 URL을 입력하세요.");
    return;
  }

  $("apiBox").textContent = "검색 중...";

  try {
    const vid = videoId(video);
    const res = await fetch(`/api/search-rank?keyword=${encodeURIComponent(keyword)}&videoId=${encodeURIComponent(vid)}&regionCode=${region}`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "API 오류");
      return;
    }

    $("apiBox").textContent = "검색 완료";
    $("rankBox").textContent = data.found ? `${data.rank}위` : "50위 안에 없음";

    $("results").innerHTML = data.results.map(x => `
      <div>
        <b>${x.rank}위</b> ${x.title}<br>
        <small>${x.channelTitle}</small>
      </div>
    `).join("");

  } catch (e) {
    $("apiBox").textContent = "오류";
    alert(e.message);
  }
}
