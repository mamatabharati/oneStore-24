const express=require('express');
const appServer=express();

const session=require('express-session');
//session package used to store info in memory but it has no infinite resource
const mongodb_session=require('connect-mongodb-session')(session);
//used to store data in mongodb in a session package

const cookieParser=require('cookie-parser');

const csurf=require('csurf');

const flash=require('connect-flash');

const multer=require('multer');
//multer is a node.js middleware for handling multipart/formdata for uploading files


const mongoose=require('mongoose');
const dbDriver='mongodb+srv://mamatabharati:bharati1176@cluster0.fpksk.mongodb.net/oneStore24?retryWrites=true&w=majority';

const User_model=require('./MODEL/auth');

const path=require('path');

const csurfProtection=csurf();

appServer.use(cookieParser());

const admin_routing=require('./ROUTER/adminRouter');
const user_routing=require('./ROUTER/userRouter');
const auth_routing=require('./ROUTER/authRouter');




appServer.use(express.urlencoded());

appServer.use(flash());

const storeValue=new mongodb_session({
    uri:'mongodb+srv://mamatabharati:bharati1176@cluster0.fpksk.mongodb.net/oneStore24',
    collection:'my session'
})

appServer.use(session({secret:'secret-key',resave:false,saveUninitialized:false,store:storeValue}));

appServer.use(express.static(path.join(__dirname,'PUBLIC')));

appServer.use('/Uploaded_images',express.static(path.join(__dirname,'Uploaded_images')));
//to store images

//to use the images folder after adding it to the database
const fileStorage=multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'Uploaded_images')
    },
    filename:(req,file,callback)=>{
        callback(null,file.originalname)
    }
});

const fileFilter=(req,file,callback)=>{
    if(file.mimetype.includes("png")||
    file.mimetype.includes("jpg")||
    file.mimetype.includes("jfif")||
    file.mimetype.includes("jpeg"))
    {
        callback(null,true)
    }
    else{
        callback(null,false)
    }
}

appServer.use(multer({storage:fileStorage,fileFilter:fileFilter,limits:{fieldSize:1024*1024*5}}).single('productImage'));
//productImage:(add_product.ejs) name attribute  

appServer.set('view engine','ejs');
appServer.set('views','VIEW');

appServer.use((req,res,next)=>{
    if(!req.session.user)
    {
        return next();
    }
    User_model.findById(req.session.user._id)
    .then(userValue=>{
        req.user=userValue;
        // console.log("user details:",req.user);
        next();
    }).catch(err=>{
        console.log("user not found",err);
    })
});

appServer.use(csurfProtection);

appServer.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrf_token=req.csrfToken();//csrf_token:user defined variable, csrfToken()
    next();
})


appServer.use(admin_routing);
appServer.use(user_routing);
appServer.use(auth_routing);




mongoose.connect(dbDriver,{useNewUrlParser:true,useUnifiedTopology:true})
.then(result=>{
    appServer.listen(1111,()=>{
        console.log("Server connected at localhost:1111/homepage");
    })
}).catch(err=>{
    console.log("db not connected",err);
})
