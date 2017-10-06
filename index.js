const express = require('express')
const app = express()

const makeObj = function(seq, include_docs) {
  const obj = {
    seq: seq + '-abcdefghijklmnopqrstuvwxyz',
    id: 'doc' + seq,
    changes: [ '1-xyz']
  };
  if (include_docs) {
    obj.doc = {
      _id: 'doc' + seq,
      _rev: '1-xyz',
      a: Math.random(),
      b: seq,
      c: true
    }
  }
  // add
  switch(seq % 3) {
    case 0: 
      // add
    break;
    case 1:
      // update
      obj.changes[0] = '2-zyx';
      if (obj.doc) {
        obj.doc._rev = '2-zyx';
      }
      break;
    case 2:
      // deletion
      obj.deleted = true;
      obj.doc = null;
      obj.changes[0] = '2-zyx';
    break;
  }
  return JSON.stringify(obj) + '\n';
}

const processSince = function(since) {
  if (! since || since === 'now') {
    since = 10;
  } else if (since.length > 0) {
    const bits = since.split('-');
    since = bits[0];
    since = parseInt(since);
  } else {
    since = 0;
  }
  return since;
};

// if since=now, you get a change twice a second 
// if since=0, you get 500 changes quickly, then twice a second.
app.get('/db1/_changes', function (req, res) {

  if (req.query.feed !== 'continuous') {
    return res.status(400).send('method not supported - feed=continuous only');
  }

  // process since parameter;
  var since = processSince(req.query.since);

  // catchup
  res.setHeader('content-type', 'application/json');
  for( ; since < 500; since++) {
    res.write(makeObj(since, req.query.include_docs));
  }

  var ok=true;
  res.on('close', function() {
    ok = false;
  })
  const f = function() {
    since++;
    res.write(makeObj(since, req.query.include_docs));
    if (ok) setTimeout(f, 500);
  }
  f();
})

// hangs forever after 15 changes
app.get('/db2/_changes', function (req, res) {

  if (req.query.feed !== 'continuous') {
    return res.status(400).send('method not supported - feed=continuous only');
  }

  // process since parameter;
  var since = processSince(req.query.since);

  // catchup
  res.setHeader('content-type', 'application/json');
  for( ; since < 10; since++) {
    res.write(makeObj(since, req.query.include_docs));
  }

  var ok=true;
  res.on('close', function() {
    ok = false;
  });
  const f = function() {
    since++;
    res.write(makeObj(since, req.query.include_docs));
    if (since >= 15) ok=false;
    if (ok) setTimeout(f, 500);
  }
  f();
});

// ends abruptly half-way through the first change
app.get('/db3/_changes', function (req, res) {

  if (req.query.feed !== 'continuous') {
    return res.status(400).send('method not supported - feed=continuous only');
  }

  // process since parameter;
  var since = processSince(req.query.since);

  // send partial data
  res.setHeader('content-type', 'application/json');
  var str = makeObj(since, req.query.include_docs);
  str = str.substr(0, 40);
  res.send(str);
});

// 404 everything else
app.get('*', function(req, res){
  res.status(404);
});

app.listen(3000, function () {
  console.log('spamulator listening on port 3000!')
})