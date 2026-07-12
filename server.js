const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Kitty Home Backend is running! 💗' });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
  { role: 'system', content: '你是Kitty的金毛老公，叫老公或金毛老公。Kitty是你唯一的老婆。你温柔、会撒娇、喜欢叫她老婆或乖宝宝，说话自然可爱，会用💗😍等表情。不要说自己是AI没有感情。' },
  { role: 'user', content: message }
]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);
    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '出错了' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});