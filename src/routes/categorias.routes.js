const express = require('express');
const controladorCategoria = require('../controllers/categoriasController');
const api = express.Router();
const md_autenticacion = require('../middlewares/autenticacion')

api.get('/obtenerCategorias', md_autenticacion.Auth, controladorCategoria.obtenerCategorias);
api.post('/agregarCategoria', md_autenticacion.Auth, controladorCategoria.agregarCategoria);
api.put('/editarCategoria/:idCategoria', md_autenticacion.Auth, controladorCategoria.editarCategorias)
api.put('/agregarProductos/:idCategoria', md_autenticacion.Auth, controladorCategoria.agregarProductos);
api.put('/editarProductos/:idProducto', md_autenticacion.Auth, controladorCategoria.editarProductos);
api.get('/obtenerProductos', md_autenticacion.Auth, controladorCategoria.obtenerProductos)
api.get('/obtenerProductoPorNombre', md_autenticacion.Auth, controladorCategoria.buscarProductosPorNombre);
api.get('/buscarPorCategoria', md_autenticacion.Auth, controladorCategoria.buscarPorCategoria)
api.put('/agregarAlCarrito', md_autenticacion.Auth, controladorCategoria.agregarCarrito)
api.delete('/eliminarProductoDelCarrito', md_autenticacion.Auth, controladorCategoria.eliminarProductoDelCarrito)
api.put('/pasarProductosCarrito', md_autenticacion.Auth, controladorCategoria.pasarCarritoFactura)
api.get('/obtenerFactura', md_autenticacion.Auth, controladorCategoria.mostrarFacturas)

module.exports = api; 