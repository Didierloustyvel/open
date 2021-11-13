  var PORT = process.env.PORT || 8080
  const express = require("express")
  const http = require("http");
  const multer = require("multer");
  const app = express()
  const server = http.createServer(app);
  const path = require('path')
  const fs = require('fs')

  app.set("views", "./views")
  app.set("view engine", "ejs")
  app.use("/assets", express.static("public"))
  app.get("/*", (req, res) => {
    res.render("index.ejs")
  })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
      const {
        originalname
      } = file;
      cb(null, originalname);
    }
  });
  const upload = multer({
    storage
  })
const handleError = (err, res) => {
  res.render("index.ejs")

};


app.post(
  "/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./public/uploads");

    // if (
      path.extname(req.file.originalname).toLowerCase() === "."
      // ) {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        
        res.render("index.ejs")

      });
  }
);

  const {
    Client
  } = require('pg');

  const client = new Client({
    user: "ydzazpqdzbfezf",
    host: "ec2-54-73-110-26.eu-west-1.compute.amazonaws.com",
    database: "d3d0447eojo7dj",
    password: "ce3bd0a318c87532bafb3c697a11eabcddb3bfd3d4d2808c5116b372680078b7",
    port: 5432,
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });;
  client.connect();



  const io = require("socket.io")(server);
  io.sockets.on('connection', async (socket) => {

    const directoryPath = path.join(__dirname, 'public/uploads');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      files.forEach(function (file) {
        // Do whatever you want to do with the file
        socket.emit('file', file);

      });
    })
      
  socket.on('deleteFile', async (value) => {
     socket.emit('dl', value);
    fs.unlink("./public/uploads/" + value, (err) => {
      if (err) {
        console.log("failed to delete local image:" + err);
      } else {
        console.log('successfully deleted local image');
      }
    })
  });

    socket.on('delete_article', async (value) => {
      client.query("DELETE FROM public.articles WHERE id =" + value + "");
      console.log("article suprimmer")
    });

    socket.on('co', async (value) => {
      console.log('ok')
      if (value == "pass='admin'") {
        console.log('administrateur connecter')

        client.query('SELECT * FROM public.articles  ORDER BY "like" DESC;', (err, res) => {
          dataTable = []
          if (err) throw err;
          for (let row of res.rows) {

            let buffTitre = Buffer.from(row.titre, 'base64');
            let titre = buffTitre.toString('utf-8');
            let buff = Buffer.from(row.paragraphe, 'base64');
            let paragraphe = buff.toString('utf-8');
            let like = row.like
            //  console.log(text);
            let cat = row.categorie
            console.log(cat)
            //  console.log(text);
            dataRow = [row.id, like, titre, paragraphe, cat]
            dataTable.push(dataRow)
          }
          socket.emit('datAmin', dataTable)
          console.log('send data to admin')
        })
      }
    });

    socket.on('session', async (value) => {
      console.log("ok")
      if (value[0] == "loustyveldidier88@gmail.com" && value[1] == "admin") {
        console.log('administrateur connecter')

        socket.emit('coockie', "pass='admin'");
        client.query('SELECT * FROM public.articles  ORDER BY "like" DESC;', (err, res) => {
          dataTable = []
          if (err) throw err;
          for (let row of res.rows) {

            let buffTitre = Buffer.from(row.titre, 'base64');
            let titre = buffTitre.toString('utf-8');
            let buff = Buffer.from(row.paragraphe, 'base64');
            let paragraphe = buff.toString('utf-8');
            let like = row.like
            //  console.log(text);
            let cat = row.categorie
            console.log(cat)
            //  console.log(text);
            dataRow = [row.id, like, titre, paragraphe, cat]
            dataTable.push(dataRow)
          }
          socket.emit('datAmin', dataTable)
          console.log('send data to admin')
        })
      }


    });

    client.query('SELECT * FROM public.articles  ORDER BY "like" DESC;', (err, res) => {
      dataTable = []
      if (err) throw err;
      for (let row of res.rows) {

        let buffTitre = Buffer.from(row.titre, 'base64');
        let titre = buffTitre.toString('utf-8');
        console.log(titre)
        let buff = Buffer.from(row.paragraphe, 'base64');
        let paragraphe = buff.toString('utf-8');
        let like = row.like
        //  console.log(text);
        let cat = row.categorie
        console.log(cat)
        //  console.log(text);
        dataRow = [row.id, like, titre, paragraphe, cat]
        dataTable.push(dataRow)
      }
      socket.emit('data', dataTable)
      console.log('send data to client')
    })

    socket.on('send', async (value) => {
      titre = Buffer.from(value[0]).toString('base64')
      paragraphe = Buffer.from(value[1]).toString('base64')
      client.query("INSERT INTO public.articles( titre, paragraphe,  \"like\",categorie) VALUES ( '" + [titre] + "','" + [paragraphe] + "','" + [0] + "','" + [value[3]] + "')");
      console.log('Enregistrer en bdd')
    });
    socket.on('update_Titre', async (value) => {
      id = value[0]
      titre = Buffer.from(value[1]).toString('base64')
      client.query("UPDATE public.articles SET titre='" + [titre] + "' WHERE id=" + id + "");
    });

    socket.on('update_Paragraphe', async (value) => {
      id = value[0]
      paragraphe = Buffer.from(value[1]).toString('base64')
      client.query("UPDATE public.articles SET paragraphe='" + [paragraphe] + "' WHERE id=" + id + "");
    });
    socket.on('plus', async (value) => {
      console.log(value)
      id = value[0]
      plus = value[1]
      client.query("UPDATE public.articles SET \"like\"=" + plus + " WHERE id =" + id + "");
    });
    socket.on('moin', async (value) => {
      console.log(id)
      id = value[0]
      plus = value[1]
      client.query("UPDATE public.articles SET \"like\"=" + plus + " WHERE id =" + id + "");
    });

  })


  server.listen(PORT, () => console.log("Server started"))