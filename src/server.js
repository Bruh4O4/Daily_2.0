import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const publicPath = path.join(import.meta.dirname, '..', 'static');
app.use(express.static(publicPath));

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});