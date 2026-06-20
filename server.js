const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/search-rank", async (req, res) => {
  const { keyword, videoId, regionCode = "KR" } = req.query;

  if (!keyword || !videoId) {
    return res.status(400).json({ error: "keyword와 videoId가 필요합니다." });
  }

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: keyword,
        type: "video",
        maxResults: 50,
        regionCode,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const items = response.data.items || [];
    const results = items.map((item, idx) => ({
      rank: idx + 1,
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle
    }));

    const foundIndex = results.findIndex(v => v.videoId === videoId);

    res.json({
      found: foundIndex >= 0,
      rank: foundIndex >= 0 ? foundIndex + 1 : null,
      results
    });
  } catch (error) {
    res.status(500).json({
      error: "YouTube API 호출 실패",
      detail: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
