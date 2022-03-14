const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const CategoriaSchema = Schema({
    nombre: String,
    descripcion: String,
    productos: [{
        nombre: String,
        descripcion: String, 
        precio: String,
        stock: Number

    }]


})


module.exports = mongoose.model('Categorias', CategoriaSchema)