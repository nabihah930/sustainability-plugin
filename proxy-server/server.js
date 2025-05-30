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
  const { measurements } = req.body;
  console.log('Metrics Received: ', measurements);

  try {
    const forgeRequest = {
      method: 'POST',
      path: '/x1/BwRYiiZYkCKCWxX1Qoy6Z9uQmZ8',
      headers: {
        "Content-Type": ["application/json"]
      },
      body: JSON.stringify({
        key: 'submitMetrics',
        payload: measurements
      }),
      // Optional: add query parameters if needed
      queryParameters: {} 
    };

    console.log(forgeRequest);
    const response = await axios.post(
      `https://a5d4b6d8-65a7-47db-b69a-5f91ff6999d9.hello.atlassian-dev.net/x1/BwRYiiZYkCKCWxX1Qoy6Z9uQmZ8`,
      forgeRequest,
      {
        headers: {
          // Authorization: `Bearer ${process.env.FORGE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ status: 'Forwarded', forgeResponse: response.statusCode });
  } catch (error) {
    console.error('❗ Error forwarding to Forge:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to forward to Forge', details: error?.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\nProxy server running on port ${PORT}...\n`);
});
