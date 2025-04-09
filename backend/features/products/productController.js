const Product = require('../../model/productsModel')

class ProductContoller{
    static async createProduct(req, res){
        try{
            const product = new Product(req.body);
            const savedProduct = await product.save();
            res.status(201).json(savedProduct);
        }
        catch(error){
            res.status(400).json({error : error.message});
        }
    }
    static async getAllProduct(req, res){
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
}
module.exports = ProductContoller;
