const Product = require('../../model/productsModel')

class ProductController{
    static async createProduct(req, res){
        try{
            const {name, company, model, year, description, KilometersTraveled} = req.body;

            if(!name || !company || !model || !year){
               return res.status(404).json({message: "All fields are required."})
            }

            const product = new Product({ name, company, model, year, description, KilometersTraveled });
            
            const savedProduct = await product.save();
            res.status(201).json(savedProduct);
        }
        catch(error){
            res.status(400).json({error : error.message});
        }
    }
    static async getAllProducts(req, res){
        try{
            const products = await Product.find();
            res.status(200).json({
                message : 'Fetched all products successfully!',
                products
            });
        }
        catch(error){
            res.status(500).json({error: error.message});
        }
    }
    static async updateProduct(req, res){
        try{
           const {id} = req.params;
           const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new : true,
            runValidators: true
           });

           if(!updatedProduct) {
            res.status(400).json({message: 'Product not found!'})
           }
           res.status(200).json({
            message: 'Updated product!',
            product: updatedProduct
        });        
        }
        catch(error){
            res.status(500).json({
                message : "Error while updating the product",
                error : error.message
            });
        }
    }
}
module.exports = ProductController;
