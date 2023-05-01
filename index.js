const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const connection = mysql.createConnection({
    host: "server2.bsthun.com",
    port: "6105",
    user: "lab_tffkh",
    password: "42l4ZAN3vm4NzzrI",
    database: "lab_todo02_t5sind",
  });
  connection.connect();

  console.log("Database is connected");

const port = 3000;
const app = express();

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });

  //login testing with given example -> start
  app.post("/basic/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ? AND password = ?",
		[username, password]
	);
	console.log("DEBUG: /basic/login => " + sql);
	connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows == 0) {
			res.json({
				success: false,
				message: "Login credential is incorrect",
			});
		} else {
			res.json({
				success: true,
				message: "Login credential is correct",
				user: rows[0],
			});
		}
	});
});
//login testing with given example -> end
//hashing testing exmple --> start
const bcrypt = require("bcrypt");

// Hash 12345678
const example = async () => {
	const salt1 = await bcrypt.genSalt(10);
	console.log("Salt #1: ", salt1);
	const hash1 = await bcrypt.hash("12345678", salt1);
	console.log("Hash #1: ", hash1);

	const salt2 = await bcrypt.genSalt(10);
	console.log("Salt #2: ", salt2);
	const hash2 = await bcrypt.hash("asdf12123", salt1);
	console.log("Hash #2: ", hash2);

	const valid1 = await bcrypt.compare(
		"12345679",
		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus2"
	);
	console.log("Validation #1: ", valid1);

	const valid2 = await bcrypt.compare(
		"12345679",
		"$2b$10$fwkjdMXyeLb7DGaU2UKwTecPJfC7i3ktBP5pFwC3ov71dMSsehus3" // Modify last charactor a little bit
	);
	console.log("Validation #2: ", valid2);

	const valid3 = await bcrypt.compare(
		"asdf12123",
		hash2 // Previously hgenerated hash
	);
	console.log("Validation #3: ", valid3);
};

example();
//hashing testing exmple --> end

//new implement login using hash --> start
app.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ? AND password = ?",
		[username, password]
	);
	connection.query(sql, (err, rows) => {
		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows == 0) {
			res.json({
				success: false,
				message: "Login credential is incorrect",
			});
		} else {
            console.log(password);
            console.log(rows[0].hashed_password);
            const isValidPass = bcrypt.compareSync(password, rows[0].hashed_password);
            if(isValidPass){
                res.json({
                    success:true,
                    message:"Password Valid!",
                });
            }
            else{
                res.json({
                    success:false,
                    message:"Password Invalid!",
                });
            }
		}
	});
});
//new implement login using hash --> end
//register --.>start
app.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
    //check the length of password =>9
    if(password.length >= 8){
        const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        const valid = pattern.test(password);
        if(valid){
            //generate salt and hash password
            const hash = bcrypt.hashSync(password, 10);
            var sql = mysql.format(
                `INSERT INTO users (username,password,hashed_password,created_at,updated_at) VALUES (?,?,?,NOW(),NOW())`,
                [username, password,hash]
            );
            connection.query(sql, (err, rows) => {
                if (err) {
                    return res.json({
                        success: false,
                        data: null,
                        error: err.message,
                    });
                }
                else{
                    res.json({
                        success:true,
                        message:"Successful!",
                    });
                    console.log("inserted");
                }
            })
        }
    }
	
});