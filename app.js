require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const PORT = 3000;

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Test Successful!'
    });
});

app.use(require('./routes/index'));

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});