function fApp(express, bodyParser, createReadStream, crypto, http, dot, m) {
  const Router = express.Router();
  const hu = { 
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS,DELETE'
  };
  const app = express();

  dot.config({path: './.env' });
  const { URL } = process.env;
  const { MongoClient: { connect } } = m; 

  Router
    .route('/login')
    .get(r => r.res.end('unchatty'));  

  Router
    .route('/insert/')
    .post(async (req, res) => {	 
      const link = req.body.URL;
      const conn = await connect(link, {
        useNewUrlParser: true,
        useUnifiedTopology: true 
      });
    const regex = /\/[a-zA-Z-]*\?|\/[a-zA-Z-]*$/;
    const name=req.body.name;
    const password=req.body.password;
    const db_name=regex.exec(link)[0].replace('/','').replace('?','');
    const db = conn.db(db_name);
    await db
      .collection('users')
      .insertOne( { name: name, password: password });
    res.json('OK');
  });

  Router
    .route('/code')
    .get(r => {
      const readStream = createReadStream(
        import.meta.url.substring(7)
      );

      readStream.on('open', function () {
        readStream.pipe(r.res);
      });
    });  


  Router
    .route('/sha1/:input/')
    .get(r => {
      const hash = crypto.createHash('sha1');
      r.res.end(hash.update(r.params.input).digest('hex'));
    });

  Router
    .route('/*')
    .all(r => {
      r.res.status(404).end('unchatty');
    });
  app
    .use((r, rs, n) => rs.status(200).set(hu) && n())
    .use(bodyParser.urlencoded({ extended: false }))
    .post('/req/', function (req, res) {
      let rawData = '';
      http.get(req.body.addr, (rs) => {
        rs.on('data', (chunk) => { rawData += chunk; });
        rs.on('end', () => {
          res.send(rawData)
        })
      })
    })
    .get('/req/', function (req, res) {
      let rawData = '';
      http.get(req.query.addr, (rs) => {
        rs.on('data', (chunk) => { rawData += chunk; });
        rs.on('end', () => {
          res.send(rawData)
        })
      })
    })
    .use('/', Router)
    .use(({ res: r }) => r.status(404).set(hu).send('???????? ??????!'))
    .use((e, r, rs, n) => rs.status(500).set(hu).send(`????????????:: ${e}`))

  return http.Server(app)
}
export default fApp;