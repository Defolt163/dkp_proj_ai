const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

const OAUTH_URL = 'https://mcs.mail.ru/auth/oauth/v1/token';
const CLIENT_ID = 'mcs0178928304.ml.vision.3k9wfup6Pbfnt1gqPsyJf'; // Ваш CLIENT_ID
const CLIENT_SECRET = 'AcUiiU8RDptDmrPJu8zoXum6k9hocQXaciTcApTiEzxkzRyw4aU79XKWGCqXw'; // Ваш CLIENT_SECRET

let accessToken = null;
let tokenExpiresAt = null;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const getAccessToken = async () => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);

  try {
    const response = await fetch(OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка получения токена:', errorText);
      return;
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiresAt = Date.now() + data.expires_in * 1000;

    console.log('Новый токен получен:', accessToken);
  } catch (error) {
    console.error('Ошибка получения токена:', error);
  }
};

const ensureAccessToken = async (req, res, next) => {
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    await getAccessToken();
  }
  console.log('Используем токен:', accessToken);
  next();
};

app.post('/recognize-text', ensureAccessToken, async (req, res) => {
    try {
      const { imageData } = req.body;

      if (!imageData) {
        return res.status(400).send('imageData не переданы');
      }

      /* console.log('Отправка запроса с телом:', {
        analyze_specs: [
          {
            content: imageData,
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }); */

      const response = await fetch('https://smarty.mail.ru/api/v1/text/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 2MMVWY9aLEUSjxnrbqx2hXww7qDyBw52oNvFRqUh7NewTyP2mv`,
        },
        body: JSON.stringify({
          analyze_specs: [
            {
              content: '../1666844647_44-celes-club-p-sts-mashina-instagram-47.jpg',
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка Vision API:', response.status, errorText);
        return res.status(response.status).send(errorText || 'Ошибка на сервере');
      }

      const data = await response.json();
      console.log('Ответ от Vision API:', data);
      res.json(data);
    } catch (error) {
      console.error('Ошибка при обращении к Vision API:', error);
      res.status(500).send('Ошибка на сервере');
    }
});

  

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
