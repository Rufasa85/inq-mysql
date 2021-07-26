const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: process.env.DB_PASSWORD,
    database: "cats_db"
  },
  console.log(`Connected to the cats_db database.`)
);

const seeCats = () => {
  db.query("SELECT * FROM cats", (err, data) => {
    if (err) {
      console.log(err);
      db.end();
    } else {
      console.table(data);
      main();
    }
  });
};
const seeToys = () => {
  db.query(
    "SELECT  toys.name AS toy, score, review, cats.name AS cat FROM toys JOIN cats ON toys.cat_id=cats.id ORDER BY score DESC",
    (err, data) => {
      if (err) {
        console.log(err);
        db.end();
      } else {
        console.table(data);
        main();
      }
    }
  );
};

const insertCat = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "cats name?",
        name: "name"
      },
      {
        type: "confirm",
        message: "are they cute?",
        name: "isCute"
      },
      {
        type: "confirm",
        message: "are they asleep?",
        name: "isAsleep"
      }
    ])
    .then(answers => {
      db.query(
        `INSERT INTO cats (name,isCute,isAsleep) VALUES(?,?,?)`,
        [answers.name, answers.isCute, answers.isAsleep],
        (err, data) => {
          if (err) {
            console.log(err);
            db.end();
          } else {
            console.log("cat added!");
            seeCats();
          }
        }
      );
    });
};

const insertToy = () => {
  db.query("SELECT * FROM cats", (err, data) => {
    if (err) {
      console.log(err);
      db.end();
    } else {
        const inqCats = data.map(cat=>{
            return {
                name:cat.name,
        value:cat.id
            }
        })
      inquirer
        .prompt([
            {
                type:"list",
                message:"which cat is reviewing this toy?",
                choices:inqCats,
                name:'cat_id'
            },
          {
            type: "input",
            message: "toy name?",
            name: "name"
          },
          {
            type: "input",
            message: "what is the score?",
            name: "score"
          },
          {
            type: "input",
            message: "review:",
            name: "review"
          }
          
        ])
        .then(answers => {
            console.log(answers);
          db.query(
            `INSERT INTO toys (name,score,review,cat_id) VALUES(?,?,?,?)`,
            [answers.name, answers.score, answers.review,answers.cat_id],
            (err, data) => {
              if (err) {
                console.log(err);
                db.end();
              } else {
                console.log("toy added!");
                seeToys();
              }
            }
          );
        });
    }
  });
};

const main = () => {
  inquirer
    .prompt({
      type: "list",
      choices: ["see all cats", "see all toys", "add a cat", "add a toy", "QUIT"],
      message: "what do you want to do?",
      name: "choice"
    })
    .then(({ choice }) => {
      switch (choice) {
        case "see all cats":
          seeCats();
          break;

        case "see all toys":
          seeToys();
          break;

        case "add a cat":
          insertCat();
          break;
        case "add a toy":
          insertToy();
          break;

        default:
          console.log("bye!");
          db.end();
          break;
      }
    });
};

main();
