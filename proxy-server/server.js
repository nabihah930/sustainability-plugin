import e from "express";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();
const app = e();
app.use(e.json());

const PORT = process.env.PORT || 3000;

app.get('/test', async(req, res) => {
    console.log('\nHitting the test endpoint!');
    res.status(200).json({ status: "Success" });
})

app.post('/metrics', async (req, res) => {
  const metrics = req.body;
  const data = JSON.stringify(metrics);
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.FROGE_METRICS_WEB_TRIGGER_URL,
    headers: { 
      'Content-Type': 'application/json'
    },
    data
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data?.message));
    res.status(200).json({ status: response.status, message: 'Forwarded Metrics to Forge Web Trigger' });
  } catch (error) {
    console.error('❗ Error forwarding to Forge:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to forward to Forge', details: error?.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\nProxy server running on port ${PORT}...\n`);
});
