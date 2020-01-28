var express = require('express');
var Mongo = require ('mongodb');
const { check, validationResult } = require('express-validator');
const io = require('socket.io')(3040, {
  serveClient: true,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
var MongoClient = Mongo.MongoClient;

var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
app.use(bodyParser.urlencoded({ extended: true}));


io.on('connect', (socket)=>{
  console.log('Connected');


  socket.on('real', (data)=>{
    socket.emit('refresh', data);
  })
})


function insertReg(res, req, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    
    var db = client.db('dbprojek');
    var data = req.body;
    db.collection(doc).insertOne(data, (err, result)=>{
      if(err) throw err;
      res.send('Success');
    });
  })
}

function insertGen(res, req, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;

    var db = client.db('dbprojek');
    var data = req;
    db.collection(doc).insertOne(data, (err, result)=>{
      if(err) throw err;
      res.send('Success');
    });
  })
}



function getData(res, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    var db = client.db('dbprojek');

    db.collection(doc).find().toArray((err, result)=>{
      if(err) throw err;
      res.send(result);
    })
  })
}



function getVideo(res, data, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    var db = client.db('dbprojek');

db.collection("users").find({}, {video:1}).toArray((err, result)=>{
      if(err) throw err;
      res.send(result);
    })
})
}


function searchVideo(res, data, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    var db = client.db('dbprojek');

db.collection("users").find({video: {$elemMatch: {judul: {$regex:data}}}}).toArray((err, result)=>{
      if(err) throw err;
      
      const fruits = [
        {name: 'apples', quantity: 2},
        {name: 'bananas', quantity: 0},
        {name: 'cherries', quantity: 5}
      ];


      
      var test = result.map((item, i)=>{
        return item.video;
      })

      var leonid = test[0];

      const getLeonid = leonid.find(fruit => fruit.judul === 'Youtube Rewind 2018');
     

      
        

        var value2 = fruits.values();

      const getFruit = fruits.find(fruit => fruit.name === 'apples');

      var test2 = test.find(function(element) {
        return element == data;
      });
      
      
      let obj = test.find(o => o.judul === data);

      var term = data; // search term (regex pattern)
      var search = new RegExp(term , 'i'); // prepare a regex object
      let b = test.filter(item => search.test(item));

      res.send(getLeonid);
      
    })
})
}

function deleteData(req, res, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    var db = client.db('dbprojek');

    var where = req.body;
    where._id = new Mongo.ObjectId(where._id);
    db.collection(doc).deleteOne(where, req.body, (err, obj)=>{
      if(err) throw err;
      res.send('Data Successfully Deleted');
    })
  })
}

function updateData(req, res, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    var db = client.db('dbprojek');

    var where = req.body;
    where._id = new Mongo.ObjectId(where._id);

    db.collection(doc).updateOne({_id:where._id},{$set:req.body} , (err, obj)=>{
      if(err) throw err;
      res.send('Data Successfully Updated');
    })
  })
}

function addVideo(res, req, doc){
  MongoClient.connect('mongodb://localhost:27017', (err, client)=>{
    if(err) throw err;
    var db = client.db('dbprojek');

    var data = req;
    // var where = req.body.id;
    // where._id = new Mongo.ObjectId(where._id);
    db.collection(doc).update({"nama":"Salma Edyna Putri"},{$push:{"video": data}});
    if(err) throw err;
    res.send('Video Added');
  })
}

//Router Registrasi
router.post('/registration', [
 check('nama')
 .notEmpty(),
 check('jk')
 .isLength({max: 1})
 .notEmpty(),
 check('email')
 .isEmail()
 .notEmpty(),
 check('password')
 .isLength({min: 8})
 .notEmpty()
], (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({ errors: errors.array() });
    }
    insertReg(res, req, 'users');
  
});


//Router Insert Genre
router.post('/insert', [
  check('nama')
  .notEmpty()
], (req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({ errors: errors.array() });
  }
  var data = {
    nama:req.body.nama
  }
  insertGen(res, data, 'genre');
});


//Router Get Data Genre
router.get('/getGenre', (req, res, next)=>{
  getData(res, 'genre');
});

//Router Update Data Genre
router.post('/updateGenre', (req, res, next)=>{
  updateData(req, res, 'genre');
});

//Router Delete Data Genre
router.post('/deleteGenre', (req, res, next)=>{
  console.log(JSON.stringify(req.body));
  deleteData(req, res, 'genre');
});


//Router Get Data Users
router.get('/getData', (req, res, next)=>{
  getData(res, 'users');
});

//Router Delete Data Users
router.post('/deleteData', (req, res, next)=>{
  console.log(JSON.stringify(req.body));
  deleteData(req, res, 'users');
});

//Router Update Data Users
router.post('/updateData', (req, res, next)=>{
  updateData(req, res, 'users');
});

//Router Upload File
router.post('/upload', async (req, res)=>{
  try {
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    } else {
        //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
        let avatar = req.files.avatar;
        
        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        avatar.mv('./public/profil/' + avatar.name);

        //send response
        res.send({
            status: true,
            message: 'File is uploaded',
            data: {
                name: avatar.name,
                mimetype: avatar.mimetype,
                size: avatar.size
            }
        });
    }
} catch (err) {
    res.status(500).send(err);
}
});

//Router Add Video
router.post('/addvideo', [
  check('id')
  .notEmpty(),
  check('link')
  .notEmpty(),
  check('judul')
  .notEmpty(),
  check('keterangan')
  .notEmpty()
], (req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({ errors: errors.array() });
  }
  var data = {
    id:req.body.id,
    link:req.body.link,
    judul:req.body.judul,
    keterangan:req.body.keterangan
  }
  addVideo(res, data, 'users');
})

router.get('/getVideo',(req, res, next)=>{
  getVideo(res, 'users')
})

router.get('/sample', (req, res, next)=>{
  var a = {};
  
  if(typeof req.query !=='undefined'){
    a.nama = req.query.nama;
    a.kelas = req.query.kelas;
  }

  res.send(a);
})

router.get('/search', (req, res, next)=>{
  var data = '';
  if(typeof req.query.search !=='undefined'){
    data = req.query.search;
  }
  
  searchVideo(res, data, 'users');
})

module.exports = router;
