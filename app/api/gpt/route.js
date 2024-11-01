import OcrSpaceAPI from 'ocr-space-api';

export async function POST(req) {
  const ocr = new OcrSpaceAPI({
    apiKey: "K87560169088957",
  });

  try {
    const { imageUrl } = await req.json(); // Получаем URL изображения из тела запроса
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Обработка изображения
    const result = await ocr.ocrImage(imageUrl);
    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      return new Response(JSON.stringify(result.ParsedResults.map(res => res.ParsedText).join('\n')), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'No OCR results found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error processing image:', error); // Логируем ошибку
    return new Response(JSON.stringify({ error: 'Error processing the image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
