import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const LIVE_INTERNSHIPS = [
  {
    id: "internship-1",
    kind: "internship",
    title: "Frontend Developer Intern",
    company: "MetaSphere",
    verified: true,
    rating: 4.8,
    desc: "Build React features, improve performance, and ship polished product UI.",
    location: "Remote",
    stipend: 40000,
    duration: "6 Months",
    type: "Remote",
    tags: ["React", "JavaScript", "HTML", "CSS", "UI/UX"],
    logo: "MS",
    gradient: "linear-gradient(135deg, #38bdf8, #2563eb)",
    saved: false,
    applyUrl: "https://example.com/internship/frontend"
  },
  {
    id: "internship-2",
    kind: "internship",
    title: "Backend Engineer Intern",
    company: "CloudFlow",
    verified: true,
    rating: 4.4,
    desc: "Develop Node.js APIs, database integrations, and production-ready backend services.",
    location: "Bangalore",
    stipend: 30000,
    duration: "4 Months",
    type: "Hybrid",
    tags: ["Node.js", "Express", "JavaScript", "MongoDB", "REST API"],
    logo: "CF",
    gradient: "linear-gradient(135deg, #22c55e, #10b981)",
    saved: false,
    applyUrl: "https://example.com/internship/backend"
  },
  {
    id: "internship-3",
    kind: "internship",
    title: "Full Stack Intern",
    company: "LaunchPad Labs",
    verified: true,
    rating: 4.7,
    desc: "Work across React frontends and Node.js microservices with a product team.",
    location: "Pune",
    stipend: 35000,
    duration: "5 Months",
    type: "Hybrid",
    tags: ["React", "Node.js", "JavaScript", "Express", "MongoDB"],
    logo: "LP",
    gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    saved: false,
    applyUrl: "https://example.com/internship/fullstack"
  },
  {
    id: "internship-4",
    kind: "internship",
    title: "AI Product Intern",
    company: "NeuroCore",
    verified: false,
    rating: 4.1,
    desc: "Support AI product workflows, prompt testing, and model evaluation operations.",
    location: "Remote",
    stipend: 28000,
    duration: "3 Months",
    type: "Remote",
    tags: ["Python", "AI/ML", "Prompting", "Data Analysis"],
    logo: "NC",
    gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
    saved: false,
    applyUrl: "https://example.com/internship/ai-product"
  }
];

const LIVE_HACKATHONS = [
  {
    id: "hackathon-1",
    kind: "hackathon",
    title: "React Sprint Hackathon",
    company: "Swayam",
    verified: true,
    rating: 4.9,
    desc: "Build interactive education tools using modern frontend stacks.",
    location: "Online",
    stipend: 50000,
    duration: "48 Hours",
    type: "Live",
    tags: ["React", "JavaScript", "Frontend", "Education"],
    logo: "SS",
    gradient: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    saved: false,
    applyUrl: "https://example.com/hackathon/react-sprint",
    prize: "INR 50,000",
    time: "Ends in 24h",
    users: "120"
  },
  {
    id: "hackathon-2",
    kind: "hackathon",
    title: "AI Build Challenge",
    company: "MedTech Labs",
    verified: true,
    rating: 4.6,
    desc: "Ship practical AI solutions for healthcare and productivity workflows.",
    location: "Hybrid",
    stipend: 75000,
    duration: "3 Days",
    type: "Upcoming",
    tags: ["AI", "JavaScript", "APIs", "Open Innovation"],
    logo: "MT",
    gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
    saved: false,
    applyUrl: "https://example.com/hackathon/ai-build",
    prize: "INR 75,000",
    time: "Apr 18 - Apr 20",
    users: "280"
  },
  {
    id: "hackathon-3",
    kind: "hackathon",
    title: "Backend Systems Jam",
    company: "CloudFlow",
    verified: false,
    rating: 4.0,
    desc: "Design scalable APIs, event flows, and backend systems for real-world products.",
    location: "Online",
    stipend: 30000,
    duration: "36 Hours",
    type: "Live",
    tags: ["Node.js", "Express", "System Design", "REST API"],
    logo: "BJ",
    gradient: "linear-gradient(135deg, #14b8a6, #0f766e)",
    saved: false,
    applyUrl: "https://example.com/hackathon/backend-jam",
    prize: "INR 30,000",
    time: "Ends in 10h",
    users: "95"
  }
];
fetch("http://127.0.0.1:3000/api/explore")
function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills.split(",").map((skill) => skill.trim().toLowerCase()).filter(Boolean);
  }

  return [];
}

function buildKeywordSet(item) {
  const keywords = [
    item.title,
    item.company,
    item.desc,
    item.location,
    item.type,
    ...(item.tags || [])
  ];

  return keywords.join(" ").toLowerCase();
}

function scoreOpportunity(userSkills, item) {
  const normalizedTags = (item.tags || []).map((tag) => tag.toLowerCase());
  const matchedSkills = normalizedTags.filter((tag) => userSkills.includes(tag));
  const textBlob = buildKeywordSet(item);
  const semanticHits = userSkills.filter((skill) => textBlob.includes(skill));
  const skillScore = normalizedTags.length > 0 ? matchedSkills.length / normalizedTags.length : 0;
  const semanticScore = userSkills.length > 0 ? semanticHits.length / userSkills.length : 0;
  const qualityScore = (Number(item.rating) || 0) / 5;
  const verificationBonus = item.verified ? 0.08 : 0;
  const liveBonus = item.kind === "hackathon" && item.type === "Live" ? 0.05 : 0;
  const remoteBonus = item.type === "Remote" || item.location === "Online" ? 0.03 : 0;
  const score =
    skillScore * 0.5 +
    semanticScore * 0.24 +
    qualityScore * 0.1 +
    verificationBonus +
    liveBonus +
    remoteBonus;

  return {
    ...item,
    matchedSkills: [...new Set([...matchedSkills, ...semanticHits])],
    matchScore: Number(score.toFixed(3)),
    matchPercent: Math.min(99, Math.max(1, Math.round(score * 100))),
    source: item.kind
  };
}

async function fetchLiveInternships() {
  return LIVE_INTERNSHIPS;
}

async function fetchLiveHackathons() {
  return LIVE_HACKATHONS;
}

function buildFallbackInsight(skills, items) {
  if (items.length === 0) {
    return `No strong opportunities were found for ${skills.join(", ")} right now, so the list is empty until stronger matches appear.`;
  }

  const topItems = items
    .slice(0, 3)
    .map((item) => `${item.title} at ${item.company}`)
    .join(", ");

  return `These recommendations prioritize strong skill overlap, better quality signals, and timely opportunities for ${skills.join(", ")}. Top matches include ${topItems}.`;
}

async function refineWithAi(skills, rankedItems) {
  const shortlist = rankedItems.slice(0, 10);
  const fallbackItems = shortlist.filter((item) => item.matchScore >= 0.12).slice(0, 8);
  const fallbackInsight = buildFallbackInsight(skills, fallbackItems);

  if (!openai) {
    return {
      items: fallbackItems,
      aiInsight: fallbackInsight
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert career assistant AI.
Given ranked opportunities, improve the ordering, remove weak matches, and explain the final recommendations.
Return valid JSON with this exact shape:
{
  "recommendedIds": ["string"],
  "aiInsight": "string"
}
Rules:
- Keep only relevant, quality opportunities.
- Prefer items with stronger skill fit and clearer career value.
- Use only ids from the provided candidates.
- Return at most 8 ids.`
        },
        {
          role: "user",
          content: JSON.stringify({
            skills,
            opportunities: shortlist.map((item) => ({
              id: item.id,
              kind: item.kind,
              title: item.title,
              company: item.company,
              desc: item.desc,
              tags: item.tags,
              type: item.type,
              location: item.location,
              rating: item.rating,
              verified: item.verified,
              matchedSkills: item.matchedSkills,
              matchScore: item.matchScore,
              matchPercent: item.matchPercent
            }))
          })
        }
      ]
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return {
        items: fallbackItems,
        aiInsight: fallbackInsight
      };
    }

    const parsed = JSON.parse(content);
    const recommendedIds = Array.isArray(parsed.recommendedIds) ? parsed.recommendedIds : [];
    const selectedItems = recommendedIds
      .map((id) => shortlist.find((item) => item.id === id))
      .filter(Boolean);

    return {
      items: selectedItems.length > 0 ? selectedItems : fallbackItems,
      aiInsight: typeof parsed.aiInsight === "string" && parsed.aiInsight.trim()
        ? parsed.aiInsight.trim()
        : fallbackInsight
    };
  } catch (error) {
    console.error("Error refining explore results with AI:", error);

    return {
      items: fallbackItems,
      aiInsight: fallbackInsight
    };
  }
}

app.get("/", (req, res) => {
  res.send("AI Server Running");
});

app.post("/api/explore", async (req, res) => {
  res.json({ items: [], aiInsight: "test" });
  try {
    const skills = normalizeSkills(req.body?.skills);

    if (skills.length === 0) {
      return res.status(400).json({
        error: "skills must be a non-empty array or comma-separated string"
      });
    }

    const [internships, hackathons] = await Promise.all([
      fetchLiveInternships(),
      fetchLiveHackathons()
    ]);

    const combinedItems = [...internships, ...hackathons]
      .map((item) => scoreOpportunity(skills, item))
      .sort((first, second) => second.matchScore - first.matchScore);

    const refined = await refineWithAi(skills, combinedItems);

    return res.json({
      items: refined.items,
      aiInsight: refined.aiInsight
    });
  } catch (error) {
    console.error("Error generating explore recommendations:", error);

    return res.status(500).json({
      error: "Failed to generate explore recommendations"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
