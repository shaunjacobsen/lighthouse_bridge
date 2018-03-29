const { app } = require('./../../app');
const RedisSMQ = require('rsmq');
const RSMQWorker = require('rsmq-worker');
const http = require('http').Server(app);
const socketIO = require('socket.io');
const rsmq = new RedisSMQ({ host: '127.0.0.1', port: 6379, ns: 'lh_bridge' });

rsmq.createQueue({ qname: 'outbound' }, (err, resp) => {
  if (resp === 1) {
    console.log('outbound queue created');
  }
});

const Distribution = {
  out: function(message) {
    rsmq.sendMessage({ qname: 'outbound', message: message }, function(err, resp) {
      if (!resp) {
        console.log('Message could not be sent');
      }
    });
  },
}

const io = socketIO(http);

io.on('connection', (socket) => {
  console.log('new connection from device');
});

if (process.env.NODE_ENV !== 'test') {
  http.listen(3003, () => {
    console.log('Socket on 3003');
  });
}

function push(destination, payload) {
  return new Promise((resolve, reject) => {
    io.emit(destination, payload);
    resolve(true);
  });
}

const outboundQueueWorker = new RSMQWorker('outbound', {
  autostart: true,
  rsmq: rsmq,
  interval: [0.5, 1, 2]
});

outboundQueueWorker.on('message', async function(message, next, id) {
  let contents = JSON.parse(message);
  let result = await push(contents.destination, contents.payload);
  if (result) {
    outboundQueueWorker.del(id);
    next();
  }
});

outboundQueueWorker.on('error', (err, msg) => console.log(err));

outboundQueueWorker.start();

module.exports = { Distribution };