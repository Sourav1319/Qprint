var express=require('express');
var bodyparser=require('body-parser');
var user_repo=require('./repo/users');
var userdb_repo=require('./repo/userdb');
var cookieSession=require('cookie-session');
var app=express();
var adminID='123456789'
app.use(bodyparser.urlencoded({extended:true}));
app.use(cookieSession({
	keys:['1234567']
}));
app.set("view engine","ejs");

app.get('/',(req,res)=>{
	res.redirect('/signin');
})

app.get('/admin',async (req,res)=>{
	if(req.session&&req.session.userID!==adminID){
		res.redirect(`/user/${req.session.userID}`);
	}
	res.render('adminpage',{info:await userdb_repo.getAll()});
	return;
})

app.get('/delete',(req,res)=>{
	res.render('admindelete');
})
app.get('/about',(req,res)=>{
	res.render('about');
})
app.post('/delete',async(req,res)=>{
	await userdb_repo.admindelete(req.body);
	res.redirect('/admin');
})
app.get('/signup',(req,res)=>{
	res.render('auth/signup',{error:''});
})

app.post('/signup',async(req,res)=>{
	const existinguser=await user_repo.check(req.body);
	if(!req.body.password.length){
		res.render('auth/signup',{error:'Please enter a valid password'});
	}
	if(existinguser){
		res.render('auth/signup',{error:'User with given username already exists'});
	}else{
		const user=await user_repo.create(req.body);
		const info=await userdb_repo.create(user.id,user.username);
		req.session.userID=user.id;
		if(user.id==="123456789"){
			res.redirect('/admin');
		}
		res.redirect(`/user/${user.id}`);
	}	
})

app.get('/signin',(req,res)=>{
	res.render('auth/signin',{error:''});
})

app.post('/signin',async (req,res)=>{
	const user=await user_repo.check(req.body);
	if(user&&req.body.password===user.password){
		req.session.userID=user.id;
		if(user.id==="123456789"){
			res.redirect('/admin');
		}else{
			res.redirect(`/user/${user.id}`);
		}
	}else{
		if(user){
			res.render('auth/signin',{error:'Incorrect password'});
		}else{
			res.render('auth/signin',{error:'User does not exist'});
		}
	}
});


app.get('/logout',(req,res)=>{
	req.session=null;
	res.redirect('/signin');
})

app.get('/user/:id/new',valid,(req,res)=>{
	res.render("new",{url:req.params.id});
});

app.post('/user/:id/new',valid,async (req,res)=>{
	await userdb_repo.pushdata(req.params.id,req.body);
	res.redirect(`/user/${req.params.id}`);
})



app.get('/user/:id/edit',valid,(req,res)=>{
	res.render('edit',{url:req.params.id});
})

app.post('/user/:id/edit',valid,async(req,res)=>{
	await userdb_repo.edit(req.params.id,req.body.olddata,req.body.newdata);
	res.redirect(`/user/${req.params.id}`);
})

app.get('/user/:id/delete',valid,(req,res)=>{
	res.render('delete',{url:req.params.id});
})

app.post('/user/:id/delete',valid,async(req,res)=>{
	await userdb_repo.delete(req.params.id,req.body);
	res.redirect(`/user/${req.params.id}`);
})

app.get('/user/:id',valid,async (req,res)=>{
	res.render('userpage',{info:await userdb_repo.getById(req.params.id)});
})

function valid(req,res,next){
	if(req.session.userID===req.params.id){
		return next();
	}
	res.redirect('/signin');
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
}) 