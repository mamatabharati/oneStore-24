const RegLogin_model=require('../MODEL/auth');
const bcrypt=require('bcryptjs');


exports.getRegPage=(req,res)=>{
    let message=req.flash('error');
    console.log(message);
    if(message.length>0)
    {
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('Auth/Reg',{  
        titlepage:"Reg form",
        path:'/registration',
        errorMsg:message
    })
}

exports.getLoginPage=(req,res)=>{
    let message=req.flash('error');
    console.log(message);
    if(message.length>0)
    {
        message=message[0];
    }
    else{
        message=null;
    }
    res.render('Auth/Login',{
        titlepage:"Login",
        path:'/loginPage',
        errorMsg:message,
        cookie_data:req.cookies
    })
}

exports.postRegDetails=(req,res)=>{
   
    let reg_fname=req.body.r_fname;
    let reg_lname=req.body.r_lname;
    let reg_email=req.body.r_email;
    let reg_password=req.body.r_password;

    console.log("Data of Registration form:",reg_fname,reg_lname,reg_email,reg_password);

    //findOne:finds and returns one document that matches given selection criteria in terms of true or false

    RegLogin_model.findOne({email:reg_email})//model email:controller email
    .then(userValue=>{
        if(userValue)//if email matches i.e true
        {
            console.log("Email already exist",userValue);
            req.flash('error','***Email already exist,try new email');
            return res.redirect('/registration');
        }

        return bcrypt.hash(reg_password,12)//controller password,rotation
        .then(hashPassword=>{
            const userData=new RegLogin_model({fname:reg_fname,lname:reg_lname,email:reg_email,password:hashPassword})
            return userData.save()
        }).then(result=>{
            console.log("Registration done");
            return res.redirect('/loginPage');
        }).catch(err=>{
            console.log("error to save registered data:",err);
        })
    }).catch(err=>{
        console.log("error in findOne",err);

    })
     
}

exports.postLoginDetails=(req,res)=>{
    const email=req.body.l_email;
    const password=req.body.l_password;
    const checked=req.body.checked;
    console.log("login details:",email,password);

    RegLogin_model.findOne({email:email})//checks model email:controller email
    .then(userValue=>{
        if(!userValue)//if email does not exist
        {
            console.log("invalid email");
            req.flash('error','*Invalid email');
            return res.redirect('/loginPage');
        }
        bcrypt.compare(password,userValue.password)//checks controller password: user's password(userValue)
        .then(result=>{
            if(!result)//if password does not match
            {
                req.flash('error','*Invalid password');
                console.log("Invalid password");
            }
            else
            {
             console.log("logged in"+result);
             req.session.isLoggedIn=true;//isLoggedIn is a user defined variable in the session to check user is logged in or not
             req.session.user=userValue;//user is a variable in session to store logged in user value
             return req.session.save(err=>{
                 if(err)
                 {
                     console.log(err);
                 }
                 else if(checked)
                 {
                     const cookieData={emailCookie:userValue.email,passwordCookie:password}
                     res.cookie('cookieData',cookieData,
                     {
                         expires:new Date(Date.now()+12000000),
                         httpOnly:true
                     })
                 }
                 console.log("logged in");
                 return res.redirect('/userAllProducts');
             })
            }
        }).catch(err=>{
            console.log("error to find email",err);
            res.redirect('/loginPage');
        })
    })
}

exports.getLogOut=(req,res)=>{
        req.session.destroy();
        res.redirect('/loginPage');
}