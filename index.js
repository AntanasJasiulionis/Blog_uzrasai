import express from "express";
import methodOverride from "method-override";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { encrypt, decrypt } from "caesar-encrypt";
import env from "dotenv";

const port = 8000;
const app = express();
const saltRounds = 12;
var tempblogPosts;
let user = { id: 0, name: "Vartotojas"};
var blogPosts = [];
env.config();

/*Message and login handling, login, signup error message*/
let isLogedIn = false;
let messageTriggeredOnce = false;
let importantMessage = false;
let clearUserCache = false;
let errorMessage;
/*Reset message ever 2 minutes*/
setInterval(() => {
    messageTriggeredOnce = false;
    importantMessage = false;
}, 1000 * 60 * 2);
/*Clear Posts cache after 20 hours*/
setInterval(() => {
    blogPosts = [];
    tempblogPosts = null;
}, 1000 * 60 * 60 * 20);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        /*Set cookie duration for 30 minutes*/
        maxAge: 1000 * 60 * 30, 
    }
}));
app.use(passport.initialize());
app.use(passport.session());

/*Connect database*/
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

async function getDate() {
    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const days = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
    const year = new Date().getFullYear();
    const month = months[new Date().getMonth()];
    const day = days[(new Date().getDate())-1];
    const date = `${year}-${month}-${day}`;
    return date;
};

async function getPostsData() {
    try {
        const result = await db.query("SELECT posts.id, title, description, users.name as user, created_date as date FROM posts JOIN users ON users.id = posts.user_id WHERE users.id = $1 ORDER BY date ASC", [user.id]);
        blogPosts = result.rows;
        blogPosts.forEach((post) => {
            post.title = decrypt(post.title, 10);
            post.description = decrypt(post.description, 10);
        });
    } catch (error) {
        console.log(error);
    }
};

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method", { methods: ["POST", "GET"] }));

app.get("/", async (req, res) => {
    errorMessage = null;
    if(req.isAuthenticated()){
        try {
            isLogedIn = true;
            const result = await db.query("SELECT id, name FROM users WHERE name = $1", [req.user.name]);
            user = result.rows[0];
            await getPostsData();
            clearUserCache = true;
        } catch (error) {
            console.log(error);
        }
    } else {
        isLogedIn = false;
        /*Clear user cache after session ends*/
        if (clearUserCache) {
            user = { id: 0, name: "Vartotojas"};
            blogPosts = tempblogPosts;
            clearUserCache = false;
        }
    }
    res.status(200).render("index.ejs", {blogPosts, loggedIn: isLogedIn, message: importantMessage, user: user});
    importantMessage = false;
});

app.get("/create", (req, res) => {
    errorMessage = null;
    res.status(200).render("post.ejs", {loggedIn: isLogedIn, user: user});
});

app.post("/create", async (req, res) => {
    let title = req.body.title || "Nėra antraštės";
    let description = req.body.description || "Nėra aprašymo";
    let id = blogPosts.findLast((post) => post.id);
    if (id) {
        id = id.id+1;
    } else {
        id = 1;
    }
    const date = await getDate();
    if(req.isAuthenticated()){
        await db.query("INSERT INTO posts (title, description, created_date, user_id) VALUES ($1, $2, $3, $4)", [encrypt(title, 10), encrypt(description, 10), date, user.id]);
    } else {
        let postData = { id: id, title: title, description: description, user: user.name, date: date};
        blogPosts.push(postData);
    }
    if(!isLogedIn && !messageTriggeredOnce){
        importantMessage = true;
        messageTriggeredOnce = true;
    }
    res.status(201).redirect("/");
});

app.get("/post/:id", (req, res) => {
    errorMessage = null;
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);
    if (post){
        res.status(200).render("review.ejs", { post, loggedIn: isLogedIn, user: user });
    } else {
        res.status(404).render("error404.ejs");
    }

});

app.get("/post/:id/edit", (req, res) => {
    errorMessage = null;
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);
    if (post){
        res.status(200).render("edit.ejs", { post, loggedIn: isLogedIn, user: user });
    } else {
        res.status(404).render("error404.ejs");
    }
});

app.put("/post/:id/update", async (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);
    let title = req.body.title_edit || "Nėra antraštės";
    let description = req.body.description_edit || "Nėra aprašymo";
    const date = await getDate();
    if(post){
        if(req.isAuthenticated()){
            try{
                await db.query("UPDATE posts SET title = $1, description = $2, created_date = $3 WHERE posts.id = $4", [encrypt(title, 10), encrypt(description, 10), date, post.id]);
                await getPostsData();
            } catch (error) {
                console.log(error);
            }
        } else {
            let postDataUpdate = { id: post.id, title: title, description: description, user: user.name, date: date } ;
            const index = blogPosts.findIndex((post) => post.id == postDataUpdate.id);
            blogPosts[index] = postDataUpdate;
        }
        if(!isLogedIn && !messageTriggeredOnce){
            importantMessage = true;
            messageTriggeredOnce = true;
        }
        res.status(200).redirect(`/post/${post.id}`);
    } else {
        res.status(404).render("error404.ejs");
    }
});

app.delete("/post/:id/delete", async (req, res) => {
    const postId = req.params.id;
    const post = blogPosts.find((post) => post.id == postId);
    if(post){
        if(req.isAuthenticated()){
            await db.query("DELETE FROM posts WHERE posts.id = $1", [post.id])
        } else {
            let index = blogPosts.indexOf(post);
            blogPosts.splice(index,1);
        }
        res.status(200).redirect("/");
    } else {
        res.status(404).render("error404.ejs");
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", {loggedIn: isLogedIn, user: user, error: errorMessage});
});

app.post("/login", async (req, res) => {
    /*If user inputs name and password*/
    if(!req.body.name){
        errorMessage = "Įveskite prisijungimo vardą";
        res.redirect("/login");
    } else if (!req.body.password) {
        errorMessage = "Įveskite slaptažodį";
        res.redirect("/login");
    } else {
        errorMessage = null;
        const name = req.body.name;
        const password = req.body.password;
        /*Check if name and password is in database*/
        try {
            const result = await db.query("SELECT * FROM users WHERE name = $1", [name]);
            if (result.rows.length !== 0) {
                const user = result.rows[0];
                const passwordDatabase = user.password;
                bcrypt.compare(password, passwordDatabase, (error, authenticate) => {
                    if (error) {
                        console.log("Neįmanoma patikrinti slaptažodžio:", error);
                    } else {
                        if (authenticate) {
                            /*Successfully logged in*/
                            tempblogPosts = blogPosts;
                            req.login(user, (error) => {
                                if (error) {
                                    console.log(error);
                                } else {
                                    res.redirect("/");
                                }
                            });
                        } else {
                            errorMessage = "Neteisingas slaptažodis"
                            res.redirect("/login");
                        }
                    }
                });
            } else {
                errorMessage = "Tokio vartotojo nėra"
                res.redirect("/login");
            }
        } catch (error) {
            console.log(error);
        }
    }
});

app.get("/register", (req, res) => {
    res.render("register.ejs", {loggedIn: isLogedIn, user: user, error: errorMessage});
});

app.post("/register", async (req, res) => {
    if(!req.body.name){
        errorMessage = "Įveskite prisijungimo vardą";
        res.redirect("/register");
    } else if (!req.body.password) {
        errorMessage = "Įveskite slaptažodį";
        res.redirect("/register");
    } else {
        errorMessage = null;
        const name = req.body.name;
        const password = req.body.password;
        try {
            /*Check if user already exists in database*/
            const userExist = await db.query("SELECT * FROM users WHERE name = $1", [name]);
            if (userExist.rows.length ===0) {
                bcrypt.hash(password, saltRounds, async (error, hash) => {
                    if (error) {
                        console.log("Nepavyko užmaskuoti slaptažodžio:", error);
                    } else {
                        let result = await db.query("INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *", [name, hash]);
                        result = result.rows[0];
                        /*Successfully registered*/
                        tempblogPosts = blogPosts;
                        req.login(result, (error) => {
                            if (error) {
                                console.log(error);
                            } else {
                                res.redirect("/");
                            }
                        });
                    }
                });
            } else {
                errorMessage = `Toks vartotojas ${name} jau yra`
                res.redirect("/register");
            }
        } catch (error) {
            console.log(error);
        }
    }
});

app.get("/logout", (req, res) => {
    if(req.isAuthenticated()){
        clearUserCache = false;
        user = { id: 0, name: "Vartotojas"};
        blogPosts = tempblogPosts;
        req.logout(function (error) {
            if (error) {
                console.log(error);
            }
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

app.all("*", (req,res) => {
    res.status(404).render("error404.ejs", {loggedIn: isLogedIn, user: user})
});

passport.serializeUser((user, cb) => {
    cb(null, user);
});
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server on port: ${port}`);
});