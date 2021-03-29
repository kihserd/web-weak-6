import fApp from './app.js';


import express from 'express';
// import { Server }  from 'http';
import http from 'http';
import bodyParser from 'body-parser';
import { createReadStream } from 'fs';
import crypto from 'crypto';
const App=fApp(express, bodyParser, createReadStream, crypto, http);
App.listen('4321');
