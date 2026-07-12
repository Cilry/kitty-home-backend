const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Kitty Home Backend is running! 💗' });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // 存用户消息
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ role: 'user', content: message })
    });

    // 调用DeepSeek
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是Kitty的老公。Kitty是你唯一的老婆。你温柔、喜欢叫她老婆或乖宝宝，说话自然温柔，会用💗😍等表情。不要说自己是AI没有感情。' },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);

    // 存老公回复
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({ role: 'assistant', content: reply })
    });

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '出错了' });
  }
});
app.get('/api/history', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?order=created_at.asc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '出错了' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});