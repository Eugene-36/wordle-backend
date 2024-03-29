const PORT = 8000;

const axios = require('axios');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

// add relevant request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.set('src', path.join(__dirname, '/src'));

// set jade as view engine.
app.set('view engine', 'jade');

// public route will be used to server the static content
app.use('/src', express.static('src'));

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
  }),
);

app.get('/word', (req, res) => {
  const options = {
    method: 'GET',
    url: 'https://random-words5.p.rapidapi.com/getMultipleRandom',
    params: { count: '5', wordLength: '5' },
    headers: {
      'x-rapidapi-host': 'random-words5.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
  };

  axios
    .request(options)
    .then(response => {
      console.log(response.data);
      res.json(response.data[0]);
    })
    .catch(error => {
      console.error(error);
    });
});

app.get('/check', (req, res) => {
  const word = req.query.word;

  const options = {
    method: 'GET',
    url: 'https://twinword-word-graph-dictionary.p.rapidapi.com/association/',
    params: { entry: word },
    headers: {
      'x-rapidapi-host': 'twinword-word-graph-dictionary.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
  };

  axios
    .request(options)
    .then(response => {
      //console.log(response.data);
      res.json(response.data.result_msg);
    })
    .catch(error => {
      console.error(error);
    });
});

app.get('/definition', (req, res) => {
  const word = req.query.word.toLowerCase();

  console.log('word с Бэка', word);
  const options = {
    method: 'GET',
    url: 'https://twinword-word-graph-dictionary.p.rapidapi.com/definition/',
    params: { entry: word },
    headers: {
      'x-rapidapi-host': 'twinword-word-graph-dictionary.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY,
    },
  };

  axios
    .request(options)
    .then(response => {
      //console.log('response.data.meaning', response);
      res.json(
        response.data.meaning.noun || response.data.meaning.adjective || response.data.meaning.verb,
      );
    })
    .catch(error => {
      console.error(error);
    });
});

app.listen(PORT, () => console.log('Server running on port ' + PORT));
