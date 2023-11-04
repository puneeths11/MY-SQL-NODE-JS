const { faker } = require("@faker-js/faker"); // requiring faker package
const mysql = require("mysql2"); //requiring my sql
const express = require("express"); //requiring express
const app = express(); //initaing express with variable called app
const path = require("path"); //requiring the path
const methodOverride = require("method-override"); //requiring method override to enable patch delete
const { v4: uuidv4 } = require("uuid"); //requiring uuid generate id
/*-----------------------------------------
Defining Embedded Javascript template
------------------------------------------*/
app.use(methodOverride("_method")); //using method override
app.use(express.urlencoded({ extended: true })); //parsing form data from edit.ejs
app.set("view engine", "ejs"); //specifying ejs view
app.set("views", path.join(__dirname, "/views")); //specifying ejs path directory
//-------------------------------------------------

/*------------------------------------------
connecting mysql with the server localhost
--------------------------------------------*/
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "8055",
});

/*---------------------------------------------------------------------------------------------------
retriving random data from faker and defining a function (retuns -> object (with key value pairs) )
------------------------------------------------------------------------------------------------------*/
// let getRandomUser = () => {

//   return {
//     id: faker.datatype.uuid(),
//     username: faker.internet.userName(),
//     email: faker.internet.email(),
//     password: faker.internet.password(),
//   };
// };
//console.log(getrandomUser()); //returns random user details
//---------------------------------------------------------------

/*--------------------------------------------------------------------------------------------
manual inserting data
----------------------------------------------------------------------------------------------*/
// let q = "SHOW TABLES"; //querry written inside the variable & passing q in connection.querry
//------------------------------------------------------------------------------------

/*------------------------------------------------------------------------------------------
inserting values into user using place holders (?,?,?,?) with single user details value 
--------------------------------------------------------------------------------------*/
// let q = "INSERT INTO user (id,username,email,password) VALUES(?,?,?,?)";
// let user = ["1234", "puneeth0111", "puni2@gmail.com", "hello123"];
//------------------------------------------------------------------------------

/*----------------------------------------------------------------------------------
inserting multiple values to using sing place holder (?) using array within an array
-----------------------------------------------------------------------------------*/
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let users = [
//   ["001", "mr.puneeth", "mrpuneeth@gmail.com", "12345@"],
//   ["002", "mr.rohan", "mrrohan@gmail.com", "123456@"],
// ];
//-------------------------------------------------------------------------------

/*----------------------------------------------------------------------------------------------
3rd method defining sql query in node js itself with the help of mysql 2 package connection.query 
-------------------------------------------------------------------------------------------------*/
//  try{
//    connection.query(q, [users],(err, result) =>{ // here querry written inside the connection querry
//    //passing q and users in array because of multiple values
//     if(err)throw err;
//      console.log(result);
// console.log(result.length);//since result is an array we can perform diff array operations
// console.log(result[0]);//array operation accessing first element in array
// console.log(result[1]);//array operation accessing second element in array
//    })
//  }catch(err){
//    console.log("AN ERROR HAAS BEEN CAUGHT",err);
//  }
//-------------------------------------------------------------------------------------------------

/* ----------------------------------------
ends sql connection in output console
---------------------------------------*/
// connection.end();
//-----------------------------------------

/*---------------------------------------------------------------------------------------------------
retriving random data from faker and defining a function (retuns -> array (without key only values) )
------------------------------------------------------------------------------------------------------*/
let getRandomUser = () => {
  return [
    faker.datatype.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
//-------------------------------------------------------------------------------------------------

/*------------------------------------------------------------------
Inserting Bulk data using faker package
--------------------------------------------------------------*/
// let q = "INSERT INTO USER (id, username, email, password) VALUES ?";
// let data = []; //empty array
// for(let i=0; i<=100; i++){
//   data.push(getRandomUser()); //101 user data is pushed in array object
// }

/*------------------------------------------------------------------------------------
try catch method for defining sql query using connection.query mysql2 package
------------------------------------------------------------------------------------*/
// try{
//   connection.query(q,[data],(err,result) => {
//     if(err)throw err;
//     console.log(result);
//   });
// }catch(err){
//   console.log("error occured !",err);
// };

// connection.end(); //closing the sql connection
//----------------------------------------------------------------------------------

/*-----------------------------------------------------------------
Routing -> [home route]to fetch and show total number of user 
------------------------------------------------------------------*/
app.get("/", (req, res) => {
  let q = `SELECT COUNT(*) from user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result[0]["COUNT(*)"]); //count(*)is key for the result object(keyvalue pair)
      let count = result[0]["COUNT(*)"];
      res.render("home.ejs", { count }); //renders home.ejs page
    });
  } catch (err) {
    console.log("error occured !", err);
    res.send("some error in the Database");
  }
});
/*note :- connection.end() is not specefied because it automatically end 
automtaiclly ends after completing the app.get request         
//--------------------------------------------------------------------



/*----------------------------------------------------------------------------
Routing -> [user route] to fetch and show the user details 
-----------------------------------------------------------------------------*/
app.get("/user", (req, res) => {
  let q = `SELECT * from user`;
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showuser.ejs", { users });
    });
  } catch (err) {
    console.log("error occured !", err);
    res.send("some error in the Database");
  }
});
//---------------------------------------------------------------------------------------

/*----------------------------------------------------------------------------
Routing -> [edit route & update route] 
-----------------------------------------------------------------------------*/
//Edit Route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM USER WHERE id='${id}'`; //' ' added because we want pass is as a string
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0]; //result in array at 0 because object inside array
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log("error occured !", err);
    res.send("some error in the Database");
  }
});

//Update Route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formpass, username: newusername } = req.body;
  let q = `SELECT * FROM USER WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formpass != user.password) {
        res.send("Wrong password");
      } else {
        let q2 = `UPDATE user SET username='${newusername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log("error occured !", err);
    res.send("some error in the Database");
  }
});
//-----------------------------------------------------------------

/*----------------------------------------------------------------------------
Routing -> adding the new user
-----------------------------------------------------------------------------*/
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

//----------------------------------------------------------------

/*----------------------------------------------------------------------------
Routing -> deleting the user 
-----------------------------------------------------------------------------*/
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});
//----------------------------------------------------------------

/*------------------------------------------------------------
starting the server
------------------------------------------------------------*/
app.listen("8080", () => {
  console.log("server is listening to port 8080");
});
