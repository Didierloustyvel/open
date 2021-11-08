  var PORT = process.env.PORT || 8080
const { Socket } = require("dgram");
  const express = require("express")
  const http = require("http");
  const app = express()
  const server = http.createServer(app);


  app.set("views", "./views")
  app.set("view engine", "ejs")
  app.use("/assets", express.static("public"))
  app.get("/*", (req, res) => {
    res.render("index.ejs")
  })



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
    socket.on('coockie_user', async (value) => {
       if(value == "pass='admin'"){
        socket.emit('reset');

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
    socket.on('delete_article', async (value) => {
      client.query("DELETE FROM public.articles WHERE id =" + value + "");
      console.log("article suprimmer")
    });
    socket.on('session', async (value) => {
        if(value[0] == "loustyveldidier88@gmail.com" && value[1] == "admin"){
            console.log('administrateur connecter')
             socket.emit('reset');
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
        }else{
          console.log(value)
        }
    });
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