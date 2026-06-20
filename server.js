const express = require("express");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/live-search", async (req, res) => {
  const { keyword, regionCode = "KR" } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: "keyword가 필요합니다." });
  }

  try {
    const searchRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: keyword,
        type: "video",
        eventType: "live",
        maxResults: 50,
        regionCode,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const items = searchRes.data.items || [];
    const ids = items.map(item => item.id.videoId).filter(Boolean).join(",");

    let statsMap = {};

    if (ids) {
      const videoRes = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
        params: {
          part: "liveStreamingDetails,statistics,snippet",
          id: ids,
          key: process.env.YOUTUBE_API_KEY
        }
      });

      for (const v of videoRes.data.items || []) {
        statsMap[v.id] = {
          viewers: v.liveStreamingDetails?.concurrentViewers || "0",
          viewCount: v.statistics?.viewCount || "0"
        };
      }
    }

    const results = items.map((item, index) => {
      const id = item.id.videoId;
      return {
        rank: index + 1,
        videoId: id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        liveUrl: `https://www.youtube.com/watch?v=${id}`,
        viewers: statsMap[id]?.viewers || "0",
        viewCount: statsMap[id]?.viewCount || "0"
      };
    });

    res.json({
      keyword,
      regionCode,
      count: results.length,
      updatedAt: new Date().toISOString(),
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
