const Product = require('../../model/productsModel')

class ProductController{
    static async createProduct(req, res){
        try{
            const {name, company, model, year, description, KilometersTraveled} = req.body;

            if(!name || !company || !model || !year){
               return res.status(400).json({message: "All fields are required."})
            }

            const product = new Product({
                 name,
                 company,
                 model,
                 year,
                 description,
                 KilometersTraveled,
                 listedBy: req.user._id,
                 image: imagePath 
                });
            
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

    static async getProductById(req, res){
        try{
            const {id} = req.params;
            const products = await Product.findById(id);

            if (!product) {
                return res.status(404).json({ message: 'Product not found!' });
            };

            res.status(200).json({
                message : 'Requested Product fetched Successfully',
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


    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const deletedProduct = await Product.findByIdAndDelete(id);

            if (!deletedProduct) {
                return res.status(404).json({ message: 'Product not found!' });
            }

            res.status(200).json({
                message: 'Product deleted successfully!',
                product: deletedProduct
            });
        } catch (error) {
            res.status(500).json({
                message: "Error while deleting the product",
                error: error.message
            });
        }
    }

    // Example addition to your ProductController's getAllProducts method
    static async getAllProducts(req, res){
        try{
            const filter = {};
            if(req.query.featured === 'true') {
                filter.featured = true;
            }
            
            const limit = req.query.limit ? parseInt(req.query.limit) : 0;
            
            const products = await Product.find(filter).limit(limit);
            res.status(200).json({
                message: 'Fetched products successfully!',
                products
            });
        }
        catch(error){
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = ProductController;
