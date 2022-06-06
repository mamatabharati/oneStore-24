const ProductModel=require('../MODEL/product') ;
const path=require('path');

exports.getHomepage=(req,res)=>{
    res.render('Admin/home',{
        titlepage:"home",
        path:'/homepage'
    })
}

exports.getAddProduct=(req,res)=>{
    res.render('Admin/add_product',{  
        titlepage:"add product",
        path:'/add_product'
    })
}

exports.post_AddProductData=(req,res)=>{
    console.log("add_product details:",req.body);
    
    const pbrand=req.body.brand;
    const ptitle=req.body.title;
    const pprice=req.body.price;
    const pdesc=req.body.desc;
    const product_img=req.file;
    console.log(product_img);
    const pImage_url=product_img.path;

    const formData=new ProductModel({
        p_brand:pbrand,
        p_title:ptitle,
         p_price:pprice,
         p_desc:pdesc,
         p_image:pImage_url
        });

    formData.save()
    .then(results=>{
        console.log("product saved");
    })
    .catch(err=>{
        console.log("error at saving products",err);
    });

    res.redirect('/product_details');
}

    
exports.get_productDetails=(req,res)=>{
    ProductModel.find().then(product=>{
        res.render('Admin/viewProduct',{  
             titlepage:"all product",
                 data:product,
                 path:'/product_details'
             })
    }).catch(err=>{
        console.log("data not fetched",err);
    })
}

exports.getEditForm=(req,res)=>{
    let edit_id=req.params.pid;
    console.log("edit id:",edit_id);
    ProductModel.findById(edit_id)
    .then(form=>{
        res.render('Admin/edit_form',{
            titlepage:"edit form",
            data:form,
            path:'/edit_form/:pid'
        })
    })
    .catch(err=>{
        console.log("form not found",err);
    })
}

exports.postEditData=(req,res)=>{
    console.log("collected value from edit form:",req.body);
    let edited_brand=req.body.pbrand;
    let edited_title=req.body.ptitle;
    let edited_price=req.body.pprice;
    let edited_desc=req.body.pdesc;
    let edited_id=req.body.prod_id;

    
ProductModel.findById(edited_id).then(old_data=>{

    old_data.p_brand=edited_brand;
    old_data.p_title=edited_title;
    old_data.p_price=edited_price;
    old_data.p_desc=edited_desc;

    return old_data.save()
    .then(result=>{
        console.log("edited product saved",result);
        res.redirect('/product_details');
    })
    .catch(err=>{
        console.log("error at saving edited products",err);
    });
    
}).catch(err=>{
    console.log("product not found",err);
})
  
}

exports.getDeleteData=(req,res)=>{
    
    let product_id=req.params.pid;
    console.log("product id:",product_id);
    ProductModel.deleteOne({_id:product_id})
    .then(result=>{
        console.log(result);
        res.redirect('/product_details');
    })
    .catch(err=>{
        console.log("error to delete data",err);
    })
}

exports.postDeleteData=(req,res)=>{
    let product_id=req.body.del_id;
    console.log("product(post) id:",product_id);
    ProductModel.deleteOne({_id:product_id})
    .then(result=>{
        console.log(result);
        res.redirect('/product_details');
    })
    .catch(err=>{
        console.log("error at deleting",err);
    })
}