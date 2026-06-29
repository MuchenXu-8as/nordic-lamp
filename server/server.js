require('dotenv').config();


const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');


const db = require('./db');
const initSchema = require('./schema');
const { seed, DEFAULT_SETTINGS } = require('./seed');


initSchema();
seed();


const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));


const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nordic-lamp-dev-secret-change-me';


const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = ROOT_DIR;
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const UPLOAD_DIR = path.join(ROOT_DIR, 'data', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });


app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(PUBLIC_DIR, {
  index: 'index.html',
  extensions: ['html']
}));
