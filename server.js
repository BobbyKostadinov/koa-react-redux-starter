import koaBunyanLogger from 'koa-bunyan-logger';
import Router  from 'koa-router';
import Koa from 'koa';
import compression  from 'koa-compress';
import serve from 'koa-static';
import fs from 'fs';

const app = Koa();
const router = Router();
const PORT = process.env.PORT || 8888;


//Init logger
app.use(koaBunyanLogger());
app.use(koaBunyanLogger.requestIdContext());
app.use(koaBunyanLogger.timeContext());

app.use(function *(next) {
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  this.log.info('%s %s for %s; duration: %sms', this.request.method, this.request.ip, this.path, ms);
});

//Set cache headers
app.use(function *(next) {
  this.set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');
  this.set('Cache-Control', 'no-store, ' + 'no-cache, must-revalidate, max-age=0');
  this.set('Pragma', 'no-cache');
  yield next;
});


app.use(function *(next) {
   compression();
   yield next;
});

app.use(serve(__dirname + '/public'));


router.get('/favicon.ico', function *(next) {
  this.body = '';
  yield next;
});

router.get('/_health', function *(next) {
  this.body = 'ok';
});

app
  .use(router.routes());


if (!module.parent) {
  app.listen(PORT, function () {
    console.log('on :%s', PORT);
  });
}
