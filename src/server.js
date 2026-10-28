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
        console.error(err.message);
        process.exit(1);
    } else {
        console.log('Успех');
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

app.get('/habits', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM habits');

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/habits', async (req, res) => {
    const habitsArray = req.body;
    
    try {
        const promises = habitsArray.map(habit => {
            const daysData = (habit.days && Array.isArray(habit.days)) 
                ? JSON.stringify(habit.days) 
                : '[]';
            const sql = `
                INSERT INTO habits (id, name, target, days)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id)
                DO UPDATE SET
                    name = EXCLUDED.name, 
                    target = EXCLUDED.target,
                    days = EXCLUDED.days
            `
            return pool.query(sql, [habit.id, habit.name, habit.target, daysData])
        });

        const activeIds = habitsArray.map(h => h.id);
        await pool.query('DELETE FROM habits WHERE NOT (id = ANY($1))', [activeIds]);

        await Promise.all(promises);
        res.status(201).json({ message: "Привычки успешно обновлены" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});