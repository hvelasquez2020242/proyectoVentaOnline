const mongoose = require('mongoose');
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt')
const res = require('express/lib/response');
const Categoria = require('../models/categoria.model')

function crearUsuarioPorDefecto(){
    var modeloUsuarios = new Usuario();


    bcrypt.hash('123456', null, null, (err, password) => {
        Usuario.find({ nombre : 'Admin' }, (err, usuarioEncontrados) => {
            if ( usuarioEncontrados.length > 0 ){ 
               return console.log('Ya existe la cuenta');
            } else {
                modeloUsuarios.nombre = 'Admin',
            modeloUsuarios.password = password; 
            modeloUsuarios.rol = 'Administrador'

                

                    modeloUsuarios.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({mensaje: 'Hubo un error en la petición'})
                        if(!usuarioGuardado) return res.status(500).send({mensaje: 'Usuario ya registrado'})

                        return console.log('El administrador' + usuarioGuardado);
                    })
                                    
            }
        })
       
       
    })
}

function Login(req, res) {
    var parametros = req.body;

    Usuario.findOne({ nombre : parametros.nombre }, (err, usuarioEncontrado) => {
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
        if (usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword) => {
                    if (verificacionPassword) {
                        return res.status(200)
                            .send({token: jwt.crearToken(usuarioEncontrado),facturas: usuarioEncontrado.factura  })
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'La contrasena no coincide.'})
                    }
                })
        } else {
            return res.status(500).send({mensaje: 'No se encontro la cuenta'})
        }
    })    
}
function agregarUsuarios(req, res){
    const parametros = req.body;
    const modeloUsuarios = new Usuario(); 

    if(req.user.rol == 'Administrador'){
        bcrypt.hash(parametros.password, null, null, (err, password)=>{
          
            if(parametros.nombre && parametros.password){
            modeloUsuarios.nombre = parametros.nombre; 
            modeloUsuarios.password = password;
            modeloUsuarios.apellido = parametros.apellido
            modeloUsuarios.rol = parametros.rol; 
    
            modeloUsuarios.save((err, usuarioGuardado)=>{
                return res.status(200).send({usuario: usuarioGuardado})
            }) 
            }else{
                return res.status(500).send({mensaje: 'Debe enviar los parametros obligatorios'})
            }
        })

       
    }else{

        return res.status(500).send({mensaje: 'No tiene permitido agregar usuarios'})

    }


}
function registroClientes(req, res){
    const parametros = req.body;
    const modeloUsuarios = new Usuario(); 

    if(req.user.rol == 'Administrador'){
        bcrypt.hash(parametros.password, null, null, (err, password)=>{
          
            if(parametros.nombre && parametros.password){
            modeloUsuarios.nombre = parametros.nombre; 
            modeloUsuarios.password = password;
            modeloUsuarios.apellido = parametros.apellido
            modeloUsuarios.rol = 'Cliente'; 
    
            modeloUsuarios.save((err, usuarioGuardado)=>{
                return res.status(200).send({usuario: usuarioGuardado})
            }) 
            }else{
                return res.status(500).send({mensaje: 'Debe enviar los parametros obligatorios'})
            }
        })

       
    }else{

        return res.status(500).send({mensaje: 'No tiene permitido agregar usuarios'})

    }


}
function editarRol(req, res){

    const parametros = req.body
    const idUsuario = req.params.idUsuario; 


    if(req.user.rol == 'Administrador'){
        Usuario.findByIdAndUpdate(idUsuario, parametros,{new: true}, (err, usuarioEditado)=>{
            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
            if(!usuarioEditado) return res.status(500).send({mensaje: 'Hubo un error al editar el usuario'})

            return res.status(200).send({usuario: usuarioEditado})

        })
    }else{

    return res.status(500).send({mensaje: 'No tiene permitido editar el rol'})

    }



}

function editarUsuario(req, res){
const idUsuario = req.params.idUsuario; 
const parametros = req.body; 



if(req.user.rol == 'Administrador'){

    Usuario.findOne({_id: idUsuario}, (err, usuarioEncontrado)=>{

        if(usuarioEncontrado.rol == 'Cliente'){
            Usuario.findByIdAndUpdate(idUsuario, parametros,{new: true}, (err, usuarioActualizado)=>{
                if(err) return res.status({mensaje: 'Hubo un error en la repeticion'})
                if(!usuarioActualizado) return res.status(500).send({mensaje: 'Hubo un error al actualizar los datos'})

                return res.status(200).send({usuario: usuarioActualizado})
            })
        }else{
            return res.status(500).send({mensaje: 'No puede editar un usuario con un rol de administrador'})

        }

    })

}

}

function eliminarUsuario(req, res){
const idUsuario = req.params.idUsuario; 

if(req.user.rol == 'Administrador'){

    Usuario.findOne({_id: idUsuario}, (err, usuarioEncontrado)=>{

        if(usuarioEncontrado.rol == 'Cliente'){

            Usuario.findByIdAndDelete({_id: idUsuario}, (err, usuarioEliminado)=>{
                if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                if(!usuarioEliminado) return res.status(500).send({mensaje: 'Hubo un error al eliminar el usuario'})

                return res.status(200).send({usuario: usuarioEliminado})
            })

        }else{

            return res.status(500).send({mensaje: 'No puede eliminar un usuario con rol de administrador'})

        }

    })

}



}
function editarPerfilUsuario(req, res){
    const parametros = req.body; 
    const idUsuario = req.user.sub; 
    
    if(req.user.rol == 'Cliente'){
        bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{   

            

             Usuario.findByIdAndUpdate(idUsuario, {nombre: parametros.nombre, apellido: parametros.apellido,password: passwordEncriptada}, {new: true}, (err, usuarioEditado)=>{
                if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                if(!usuarioEditado) return res.status(500).send({mensaje: 'Hubo un error al editar el usuario'}) 
                return res.status(200).send({usuario: usuarioEditado})
    
             })
    })
    
    
    
    }
    
    
    }

function eliminarPerfilUsuario(req, res){
    const idUsuario = req.user.sub;

    if(req.user.rol == 'Cliente'){

        Usuario.findByIdAndDelete({_id: idUsuario}, (err, usuarioEliminado)=>{
            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
            if(!usuarioEliminado) return res.status(500).send({mensaje: 'Hubo un error al eliminar el usuario'})

            return res.status(200).send({usuario: usuarioEliminado})
        })

    }



}
function verFacturas(req, res){
    const idUsuario = req.user.sub; 
    const idCliente = req.params.idCliente;

    if(req.user.rol == 'Administrador'){

        Usuario.aggregate([
            {
                $match: {"_id": mongoose.Types.ObjectId(idCliente)}
            },
            {
                $unwind: "$factura"
            },
            {
                $match: { }
            }, 
            {
                $group: {
                    "_id": "$_id",
                    "nombre": { "$first": "$nombre" },
                    "factura": { $push: "$factura" }
                }
            }
        ]).exec((err, facturasEncontradas) => {
            return res.status(200).send({ factura: facturasEncontradas})
        })

    }else{

        return res.status(200).send({mensaje: 'Solo los administradores pueden ver las facturas'})

    }

   

    

}
function verLosProductosAgotados(req, res){

    Categoria.find({"productos.stock": 0},{productos: {$elemMatch: {stock: 0}}},(err, categoriaEncontrada)=>{
        if(!categoriaEncontrada) return res.status(500).send({mensaje: 'Hay existencias de todos los productos'})
       
        if(categoriaEncontrada.length > 0){
            return res.status(200).send({producto: categoriaEncontrada})
        }else{
            return res.status(500).send({mensaje: 'Hay existencias de todos los productos'})
        }
       
    })


    
}
module.exports = {
    crearUsuarioPorDefecto,
    Login, 
    verFacturas,
    agregarUsuarios,
    eliminarUsuario,
    editarRol, 
    editarUsuario,
    registroClientes,
    verLosProductosAgotados,
    editarPerfilUsuario,
    eliminarPerfilUsuario
}