{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // scripts/debug-print.js\
const fs = require('fs');\
const path = './prisma/schema.prisma';\
\
const buf = fs.readFileSync(path);\
const txt = buf.toString('utf8');\
\
console.log('CWD =', process.cwd());\
console.log('PATH =', path);\
console.log('SIZE =', buf.length, 'bytes');\
\
console.log('\\n--- FIRST 40 LINES (TEXT) ---');\
console.log(txt.split('\\n').slice(0, 40).join('\\n'));\
\
console.log('\\n--- FIRST 80 BYTES (HEX) ---');\
console.log([...buf.slice(0, 80)].map(x => x.toString(16).padStart(2, '0')).join(' '));\
}