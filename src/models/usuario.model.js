const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const UsuarioSchema = Schema({
    nombre: String,
    apellido: String,
    password: String, 
    rol: String,
    carrito: [{
        producto: String,
        precio: Number, 
        cantidad: Number, 
        subTotal: Number,
        total: Number
    }],
    factura: [{
        producto: String, 
        precio: Number, 
        cantidad: Number,
        subTotal: Number,
        total: Number

    }]
})

module.exports = mongoose.model('Usuarios', UsuarioSchema)