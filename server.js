'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const postrouter = require('./postrouter');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

app.use (morgan('comment'));
app.use (express.static('public'));

BlogPosts.create('Exception handling in async functions', `Async functions was one of the most welcomed new features of JavaScript in recent years. I was so exiceted by async/await, that impulsively bought the domain javascriptasyncfunction.com.

One aspect in which async functions really shine when compared to traditional approach is error handling. Error handling is based on another beloved, and more ancient construct, try... catch.

However try... catch is able to catch only exeptions thrown in functions which are explicitly awaited. In retrospective, it makes perfectly sense… but I never fully realized it, until I met my first uncaught exception

invalid json response body at [omissis] reason: Unexpected token I in JSON at position 0
The following is a repro of the issue:

function whateverReturnsAPromise () {
  return Promise.reject("Ops.");
}

async function example () {
  try {
    return whateverReturnsAPromise();
  } catch (error) {
    // execution never reaches this block
    console.log("Caught exception");
    console.log(error);
  }
}
Let’s look at a more common example:

async function getCharacter (characterId) {
  try {
    const response = await fetch(\`https://swapi.co/api/people/\${characterId}\`);
    return response.json();
  } catch (error) {
    console.log("Caught exception:", error.message);
    console.log(error);
  }
}
In the above snippet we have an uncought exception if the api does not return a valid JSON response. That’s bad. The solution is straightforward.

return await response.json();
More on: javascript, nodejs

Senior Developer at YOOX Net-A-Porter Group. Passionate about javascript, nodejs. Occasional blogger and speaker

 Bologna, Italy   https://brunoscopelliti.com`, 'Bruno Scopelliti', 'NOV 8, 2017');

BlogPosts.create('New `util.promisify` in Node.js', `A quick search on npmjs reveals how this topic is at the center of JavaScript developer’s hearts. I used to have too my personal utility to convert Node.js callback-based internals methods into returning-promise ones. 
So I guess this is a big, great news for everyone who’s working with node: Node.js is adding a new utility that does just this at its core, util.promisify.

If you have ever used one of those promisify modules, you won’t be too much surprised by util.promisify; they work almost in the very same way.

util.promisify takes a function following the Node.js callback style, i.e. taking an error-first (err, value) => ... callback as last argument, and returns a version that returns promises.

But you know, a code snippet is worth a thousand words.

Let’s say I want to read the content of a file. fs.readFile is the tool for this job, but its implementation currently only works with callbacks:

const fs = require('fs');

fs.readFile('./notes.txt', (err, txt) => {
  if (err) {
    throw new Error(err.message);
  }
  console.log(txt);
});
If I wanted a Promise-based fs.readFile, I had two choices; pick one of those modules from npm, or manually code my promise aware fs.readFile. Here, I’m going for the second option, just for the sake of showing what’s going on under the nice abstraction of a promisifier function.

const fs = require('fs');

exports = module.exports = 
  (file, options) => 
    new Promise((res, rej) => {
      fs.readFile(file, options, (err, txt) => {
        if (err) {
          return rej(err.message);
        }
        res(txt);
      });
    });
That’s pretty straightforward, but it does not scale very well… I won’t use a such approach if I need more functions working with promises. 
We can think to extract the capacity of promisifying a given function into a proper utility; and that’s exactly what the authors of those packages did… and what now we have in the core, exposed as util.promisify.

const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

readFile('./notes.txt')
  .then(txt => console.log(txt));
util.promisify could eventually work even with methods which do not take an error-first (err, value) => ... callback as last argument. Let’s consider as example fs.exists (that it is now deprecated).

fs.exists('/etc/passwd', (exists) => {
  console.log(exists ? 'it's there' : 'no passwd!');
});
Using the util.promisify.custom symbol it is possible to override the return value of util.promisify.

const fs = require('fs');

const exists = (file) =>
  new Promise((res, rej) => {
    fs.access(file, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return res(false);
        }

        return rej(err);
      }

      res(true);
    });
  });

fs.exists[util.promisify.custom] = exists;

util.promisify(fs.exists) === exists; // true
Having the possibility to use native Promise these days is particularly exciting, cause the support for async/await is starting to spread.

(async () => {
  const fs = require('fs');
  const util = require('util');

  const readFile = util.promisify(fs.readFile);

  const txt = await readFile('./notes.txt');
  console.log(txt);
})();
util.promisify is planned to be released for the first time as part of first Release Candidate for Node.js 8.0.0; here you can watch the pull request progress, that is now merged.

More on: javascript, nodejs

Senior Developer at YOOX Net-A-Porter Group. Passionate about javascript, nodejs. Occasional blogger and speaker

 Bologna, Italy   https://brunoscopelliti.com`, 'Bruno Scopelliti', 'MAY 16, 2017');

app.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get());
});

app.post('/blog-posts', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\`in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const item = BlogPosts.create(req.body.title, req.body.author, req.body.content, req.body.publishDate);
  res.status(201).json(item);
});

// app.put('/blog-posts/:id', (req, res) => 

// app.delete('/blog-posts/:id', (req, res) => 