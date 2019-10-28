const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true, useFindAndModify: false });
app.use(methodOverride("_method"));
app.use(expressSanitizer());

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    image: String,
    body: String,
    createdDate: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", blogSchema);

app.get("/", (request, response) => {
    response.redirect("/blogs");
});

app.get("/blogs", (request, response) => {
    Blog.find({}, (error, allBlogs) => {
        if (error || !allBlogs) {
            console.log("Something went wrong!");
            console.log(error);
            return response.render("index", { blogs: {} });
        }
        response.render("index", { blogs: allBlogs });
    });
});

app.get("/blogs/new", (request, response) => {
    response.render("new");
});

app.post("/blogs", (request, response) => {
    request.body.blog.body = request.sanitize(request.body.blog.body);
    Blog.create(request.body.blog, (error) => {
        if (error) {
            console.log("Something went wrong!");
            console.log(error);
        } else {
            response.redirect("/blogs");
        }
    });
});

app.get("/blogs/:id", (request, response) => {
    Blog.findById(request.params.id, (error, foundBlog) => {
        if (error || !foundBlog) {
            console.log("Something went wrong!");
            console.log(error);
            return response.render("show", { blog: {} });
        }
        response.render("show", { blog: foundBlog });
    });
});

app.get("/blogs/:id/edit", (request, response) => {
    Blog.findById(request.params.id, (error, foundBlog) => {
        if (error || !foundBlog) {
            console.log("Something went wrong!");
            console.log(error);
            return response.render("edit", { blog: {} });
        }
        response.render("edit", { blog: foundBlog });
    });
});

app.put("/blogs/:id", (request, response) => {
    request.body.blog.body = request.sanitize(request.body.blog.body);
    Blog.findByIdAndUpdate(request.params.id, request.body.blog, (error) => {
        if (error) {
            console.log("Something went wrong!");
            console.log(error);
        } else {
            response.redirect("/blogs/" + request.params.id);
        }
    });
});

app.delete("/blogs/:id", (request, response) => {
    Blog.findByIdAndRemove(request.params.id, (error) => {
        if (error) {
            console.log("Something went wrong!");
            console.log(error);
        } else {
            response.redirect("/blogs");
        }
    });
});

app.listen(3000, () => {
    console.log("The RESTfulBlogApp server has started!");
});