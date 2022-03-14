const express = require('express');
const controladorUsuario = require('../controllers/usuarioController');
const api = express.Router();
const md_autenticacion = require('../middlewares/autenticacion')

api.post('/agregarAdmin', controladorUsuario.crearUsuarioPorDefecto)
api.post('/login' ,controladorUsuario.Login);
api.delete('/eliminarUsuario/:idUsuario', md_autenticacion.Auth,controladorUsuario.eliminarUsuario);
api.put('/editarUsuario/:idUsuario', md_autenticacion.Auth,controladorUsuario.Login);
api.put('/editarRol/:idUsuario', md_autenticacion.Auth,controladorUsuario.editarRol);
api.post('/agregarUsuario', md_autenticacion.Auth,controladorUsuario.agregarUsuarios);
api.post('/registrarClientes', md_autenticacion.Auth, controladorUsuario.registroClientes);
api.put('/editarUsuario', md_autenticacion.Auth, controladorUsuario.editarPerfilUsuario)
api.delete('/eliminarPerfilUsuario', md_autenticacion.Auth, controladorUsuario.eliminarPerfilUsuario)
api.get('/verFacturas/:idCliente', md_autenticacion.Auth, controladorUsuario.verFacturas)
api.get('/verProductosAgotados', md_autenticacion.Auth, controladorUsuario.verLosProductosAgotados)

module.exports = api; 