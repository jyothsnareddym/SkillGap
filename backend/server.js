
require('dotenv').config();

console.log('App ID loaded:', !!process.env.ADZUNA_APP_ID);
console.log('App Key loaded:', !!process.env.ADZUNA_APP_KEY);

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;


console.log("Database URL configured:", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
app.use(cors());
app.use(express.json());

// Check whether the backend is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SkillGap backend is running!' });
});

// Search jobs using Adzuna
app.get('/api/jobs', async (req, res) => {
  try {
    const { what, where = 'India' } = req.query;

    if (!what || !what.trim()) {
      return res.status(400).json({
        error: 'Please provide a job title using ?what=java developer',
      });
    }

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      return res.status(500).json({
        error: 'Adzuna credentials are missing from backend/.env',
      });
    }

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: what.trim(),
      results_per_page: '10',
      'content-type': 'application/json',
    });

    // Adzuna's India jobs endpoint
    const url =
      `https://api.adzuna.com/v1/api/jobs/in/search/1?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      const details = await response.text();
      console.error('Adzuna error:', response.status, details);

      return res.status(response.status).json({
        error: 'Adzuna API request failed',
        status: response.status,
        details: details.slice(0, 500),
      });
    }

    const data = await response.json();

    const jobs = (data.results || []).map((job) => ({
      title: job.title,
      company: job.company?.display_name || 'Not specified',
      location: job.location?.display_name || 'Not specified',
      description: job.description || '',
      salaryMin: job.salary_min ?? null,
      salaryMax: job.salary_max ?? null,
      url: job.redirect_url || '',
      created: job.created || null,
    }));

    res.json({
      totalResults: data.count ?? jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Job search error:', error.message);
    res.status(500).json({ error: 'Unable to search jobs right now.' });
  }
});
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      status: 'OK',
      database: 'Connected',
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
    });
  }
});
// Test whether all SkillGap tables exist
app.get('/api/db-tables-health', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'profiles',
          'tasks',
          'analysis_results'
        )
      ORDER BY table_name;
    `);

    res.json({
      status: 'OK',
      tablesFound: result.rows.length,
      tables: result.rows.map((row) => row.table_name),
    });
  } catch (error) {
    console.error('Table check error:', error.message);

    res.status(500).json({
      status: 'ERROR',
      message: 'Unable to check database tables',
    });
  }
});

const NEWS_CATEGORIES = {
  technology: 'technology AI software',
  hiring: 'hiring',
  layoffs: 'tech layoffs',
  skills: 'programming developer skills',
};
  

app.get('/api/news', async (req, res) => {
  try {
    const category = String(
      req.query.category || 'technology'
    ).toLowerCase();

    const query = NEWS_CATEGORIES[category];

    if (!query) {
      return res.status(400).json({
        error: 'Invalid category',
        availableCategories: Object.keys(NEWS_CATEGORIES),
      });
    }

    const params = new URLSearchParams({
      query,
      tags: 'story',
      hitsPerPage: '10',
    });

    const response = await fetch(
      `https://hn.algolia.com/api/v1/search?${params}`
    );

    if (!response.ok) {
      return res.status(502).json({
        error: 'News provider request failed',
      });
    }

    const data = await response.json();

    const articles = (data.hits || [])
      .filter((item) => item.title && item.url)
      .map((item) => ({
        id: item.objectID,
        title: item.title,
        url: item.url,
        source: 'Hacker News',
        author: item.author || 'Unknown',
        publishedAt: item.created_at || null,
        points: item.points || 0,
      }));

    res.json({
      category,
      totalResults: articles.length,
      articles,
    });
  } catch (error) {
    console.error('News API error:', error.message);

    res.status(500).json({
      error: 'Unable to fetch news right now.',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SkillGap backend running on port ${PORT}`);
});

