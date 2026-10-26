import express from 'express';
import path from 'path';
import { pool } from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());
const publicPath = path.join(import.meta.dirname, '..', 'static');
app.use(express.static(publicPath));

pool.query('SELECT NOW()', (err) => {
    if(err) {
        console.log('всё хуйня');
    } else {
        console.log('заебок');
    }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS habits(
        id INT PRIMARY KEY,
        name TEXT,
        target INT,
        days JSONB
    )
`, (err) => {
    if (err) console.error("Ошибка при создании таблицы:", err.message);
});

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});