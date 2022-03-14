const mongoose = require('mongoose');
const Categoria = require('../models/categoria.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt')
const res = require('express/lib/response');
const Usuario = require('../models/usuario.model')

function agregarCategoria(req, res){
    const parametros = req.body;
    const modeloCategoria = new Categoria();
    if(req.user.rol == 'Administrador'){
        modeloCategoria.nombre = parametros.nombre;
        modeloCategoria.descripcion = parametros.descripcion

        modeloCategoria.save((err, categoriaGuardada)=>{
            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticiion'})
            if(!categoriaGuardada) return res.status(500).send({mensaje: 'Hubo un error al agregar la categoria'})

            return res.status(200).send({categoria: categoriaGuardada})

        })


    }else{
        return res.status(500).send({mensaje: 'Solo un administrador puede agregar categoria'})
    } 



}
function obtenerCategorias(req, res){

    if(req.user.rol == 'Administrador'){

        Categoria.find({}, (err, categoriasEncontradas)=>{
            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
            if(!categoriasEncontradas) return res.status(500).send({mensaje: 'Hubo un error al obtener categorias'})

            return res.status(200).send({categoria: categoriasEncontradas})
        })

    }else{

        return res.status(500).send({mensaje: 'Solo los administradores pueden ver las categorias'})

    }



}
function editarCategorias(req, res){
    const parametros = req.body;
    const idCategoria = req.params.idCategoria;

    if(req.user.rol == 'Administrador'){

        Categoria.findByIdAndUpdate(idCategoria, parametros,{new: true}, (err, categoriaActualizada)=>{

            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
            if(!categoriaActualizada) return res.status(500).send({mensaje: 'Hubo un error al editar la categoria'})

            return res.status(200).send({categoria: categoriaActualizada})

        })


    }else{

        return res.status(500).send({mensaje: 'Solo los administradores pueden editar las categorias'})

    }


}
function eliminarCategoria(req, res) {
    const idCategoria = req.params.idCategoria;
    if(req.user.rol = 'Administrador'){
        Categoria.findOne({_id: idCategoria}, (err, encontrado)=>{
            
            Categoria.findOne({nombre: 'Por Defecto'}, (err, categoriaEncontrada)=>{

                if(!categoriaEncontrada){
                    const modeloCategoria = new Categoria();
                    modeloCategoria.nombre = 'Por Defecto '
                    modeloCategoria.descripcion = 'Categoria por defecto'

                    modeloCategoria.save((err, categoriaGuardada)=>{
                        if(err) return res.status(400).send({mensaje: 'Hubo un error al agregar la categoria'})
                        if(!categoriaGuardada) return res.status(400).send({mensaje: 'Error al agregar la categoria'})
                    

                    })

                }

            })
            
         


    })
 
    }else{
     
    }

  
}
function agregarProductos(req, res){
    const parametros = req.body;
    const idCategoria = req.params.idCategoria;

    if(req.user.rol == 'Administrador'){

        Categoria.findByIdAndUpdate(idCategoria, {$push: {productos: {nombre: parametros.nombre, descripcion: parametros.descripcion, precio: parametros.precio, stock: parametros.stock}}},{new: true}, (err, productoAgregado)=>{
            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
            if(!productoAgregado) return res.status(500).send({mensaje: 'Hubo un error al agregar el producto'})

            return res.status(500).send({productos: productoAgregado})
        })

    }


}

function editarProductos(req, res){
const parametros = req.body; 
const idProducto = req.params.idProducto;

if(req.user.rol == 'Administrador'){
    Categoria.updateOne({"productos._id": idProducto}, {$set : {"productos.$.nombre": parametros.nombre, "productos.$.descripcion": parametros.descripcion, "productos.$.precio": parametros.precio, "productos.$.stock": parametros.stock}}, {new: true}, (err, productosActualizados)=>{

        if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
        if(!productosActualizados) return res.status(500).send({mensaje: 'Hubo un error al editar el producto'})

        return res.status(200).send({producto: productosActualizados})

    })
}


}

function obtenerProductos(req, res){

    if(req.user.rol == 'Administrador'){

        var parametros = req.body;
    
        Categoria.aggregate([
            {
                $match: { }
            },
            {
                $unwind: "$productos"
            },
            {
                $match: {}
            }, 
            {
                $group: {
                    "_id": "$_id",
                    "nombre": { "$first": "$nombre" },
                    "productos": { $push: "$productos" }
                }
            }
        ]).exec((err, productosEncontrados) => {
            return res.status(200).send({ productos: productosEncontrados})
        })

    }


        

}
function buscarProductosPorNombre(req, res){

    var parametros = req.body;

    Categoria.aggregate([
        {
            $match: {}
        },
        {
            $unwind: "$productos"
        },
        {
            $match: { "productos.nombre": { $regex: parametros.nombre, $options: 'i' } }
        }, 
        {
            $group: {
                "_id": "$_id",
                "nombre": { "$first": "$nombre" },
                "productos": { $push: "$productos" }
            }
        }
    ]).exec((err, productosEncontrados) => {
        return res.status(200).send({ productos: productosEncontrados})
    })
}
function buscarPorCategoria(req, res){
const nombreUsuario = req.body.nombre;

Categoria.find({nombre: { $regex: nombreUsuario , $options: "i" }}, (err, categoriaEncontrado)=>{

    if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
    if(!categoriaEncontrado) return res.status(500).send({mensaje: 'No se encontro ninguna categoria con ese nombre'})

    return res.status(200).send({categoria: categoriaEncontrado})
    
})

}

function agregarCarrito(req, res){
    const parametros = req.body
    const idUsuario = req.user.sub;
 
    Categoria.findOne({"productos.nombre": parametros.nombre}, {_id: false, productos:{$elemMatch: {nombre: parametros.nombre}}}, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
        if(!productoEncontrado) return res.status(500).send({mensaje: 'No se encontro el producto'})
        Usuario.findOne({_id: idUsuario},{carrito:{$elemMatch:{producto: parametros.nombre}}}, (err, carroEncontrado)=>{
            if(carroEncontrado.carrito[0]){

                const cantidadUno = carroEncontrado.carrito[0].cantidad;
                const cantidadTotal = cantidadUno + Number(parametros.cantidad);
               // return res.status(200).send({mensaje: cantidadTotal})
                if(cantidadTotal > productoEncontrado.productos[0].stock){
                    
                    return res.status(200).send({mensaje: 'Solo contamos con' + ' ' + productoEncontrado.productos[0].stock + ' de stock '})
                }else{
                    const idCarro = carroEncontrado.carrito[0]._id;
                    Usuario.updateOne({"carrito._id": idCarro}, {$inc:{"carrito.$.cantidad": parametros.cantidad}}, {new: true}, (err, carroActualizados) =>{
                        if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                        if(!carroActualizados) return res.status(500).send({mensaje: 'Hubo un error al editar empleados'})
                        Usuario.findOne({"carrito._id": idCarro}, {carrito: {$elemMatch:{_id: idCarro}}},(err, carro)=>{
    
                            const total = carro.carrito[0].cantidad * carro.carrito[0].precio
                           
                            const a = carro.carrito.length - 1
                            Usuario.updateOne({"carrito._id": carro.carrito[a]._id}, {$set :{"carrito.$.subTotal": total}}, {new: true}, (err, empleadosActualizados) =>{
                                if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                                if(!empleadosActualizados) return res.status(500).send({mensaje: 'Hubo un error al editar empleados'})
                                Usuario.findOne({"carrito._id": carro.carrito[a]._id}, (err, carritoFinal)=>{
                                    let totalCarritoLocall = 0;
    
                            
                                    for(let i = 0; i <carritoFinal.carrito.length; i++){
                    
                                        totalCarritoLocall += carritoFinal.carrito[i].subTotal

                                        Usuario.findOne({_id: idUsuario},(err, carro)=>{
                                            for(let i = 0;i < carro.carrito.length; i++){
                                            }
                                            Usuario.updateOne({"carrito._id": carro.carrito[i]._id},{$set:{"carrito.$.total": totalCarritoLocall}},{new: true}, (err, actualizado)=>{
                                            })
                                            })
                                       }
                                       Usuario.findOne({"carrito._id": carro.carrito[a]._id}, (err, carroFinal)=>{


                                })
                                })
                            }
                              )
    
                        })
                    }

                    



                    
                      )
                      Usuario.findOne({_id: idUsuario}, (err, carroFinal)=>{
                        return res.status(200).send({mensaje: carroFinal})

                    })  
                      
                }
        

            }else{
                if(parametros.cantidad > productoEncontrado.productos[0].stock){
                    return res.status(500).send({mensaje: 'Solo contamos con' + ' ' + productoEncontrado.productos[0].stock + ' ' + 'de stock' })
        
                }else{
              
                    const totalA = parametros.cantidad * productoEncontrado.productos[0].precio; 
        
                    Usuario.findOne({_id: idUsuario}, (err, carritoEncontrado)=>{
                        let totalCarritoLocal = 0;
                
                       
                        //return res.status(200).send({mensaje: totalCarritoLocal})
                        Usuario.findByIdAndUpdate(idUsuario, {$push: {carrito: {producto: productoEncontrado.productos[0].nombre, precio: productoEncontrado.productos[0].precio, cantidad: parametros.cantidad, subTotal: totalA}}},{new: true}, (err, carritoAgregado)=>{
                            if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                            if(!carritoAgregado) return res.status(500).send({mensaje: 'Hubo un error al agregar el producto'})
                
                          const a = carritoAgregado.carrito.length - 1
                           // return res.status(500).send({productos: carritoAgregado.carrito[a]._id})
        
                           for(let i = 0; i <carritoAgregado.carrito.length; i++){
        
                            totalCarritoLocal += carritoAgregado.carrito[i].subTotal
        
                           }
                            
                            Usuario.updateOne({"carrito._id": carritoAgregado.carrito[a]._id}, {$set :{"carrito.$.total": totalCarritoLocal}}, {new: true}, (err, empleadosActualizados) =>{
                                if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                                if(!empleadosActualizados) return res.status(500).send({mensaje: 'Hubo un error al editar empleados'})
                                Usuario.find({"carrito._id": carritoAgregado.carrito[a]._id}, (err, carritoFinal)=>{
        
                                    return res.status(200).send({carrito: carritoFinal})
                                })
                            }
                              )
                        })
        
        
                    })
                
        
                 
                }
            }
        })
        
    
       

    })
  

}
function eliminarProductoDelCarrito(req, res){
    const parametros = req.body;



    Usuario.updateMany({_id: req.user.sub}, {$pull :{carrito:{producto: parametros.nombre}}}, (err, carritoEliminado) =>{
        if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
        if(!carritoEliminado) return res.status(500).send({mensaje: 'Hubo un error al editar empleados'})

        return res.status(200).send({carrito: carritoEliminado})
    }

   
      )
      Usuario.findOne({_id: req.user.sub},(err, encontrado)=>{
        let total = 0;
        for(let i = 0; i < encontrado.carrito.length; i++){

            total = encontrado.carrito[i].subTotal;
            Usuario.updateOne({"carrito._id": encontrado.carrito[i]._id},{$set:{"carrito.$.total": total}},{new: true}, (err, actualizado)=>{

            })
          
         
        }
        
    })


}
function pasarCarritoFactura(req, res){
const idUsuario = req.user.sub; 

Usuario.findOne({_id: idUsuario},(err, carro)=>{
for(let i = 0;i < carro.carrito.length; i++){

    Usuario.findByIdAndUpdate(idUsuario, {$push: {factura: {producto: carro.carrito[i].producto, precio: carro.carrito[i].precio, cantidad: carro.carrito[i].cantidad, subTotal: carro.carrito[i].subTotal, total: carro.carrito[i].total} }},{new: true}, (err, carritoAgregado)=>{

        Categoria.updateOne({"productos.nombre": carro.carrito[i].producto}, {$inc:{"productos.$.stock": -carro.carrito[i].cantidad}}, {new: true}, (err, carroActualizados) =>{
            Usuario.updateMany({_id: req.user.sub}, {$pull :{carrito:{_id: carro.carrito[i]._id}}}, (err, carritoEliminado) =>{
                if(err) return res.status(500).send({mensaje: 'Hubo un error en la peticion'})
                if(!carritoEliminado) return res.status(500).send({mensaje: 'Hubo un error al editar empleados'})

                Usuario.findOne({_id: idUsuario}, (err, usuarioEncontrado)=>{
                    return res.status(200).send({factura: usuarioEncontrado.factura})
                })

            }
              )
        })


        

    })

}


})

}
function mostrarFacturas(req, res){
    const idUsuario = req.user.sub; 
    Usuario.findOne({_id: idUsuario}, (err, usuarioEncontrado)=>{
        
        return res.status(200).send({factura: usuarioEncontrado.factura})
    })
}

module.exports = {

    agregarCategoria,
    obtenerCategorias,
    editarCategorias,
    agregarProductos,
    editarProductos,
    obtenerProductos,
    buscarProductosPorNombre,
    buscarPorCategoria,
    agregarCarrito,
    eliminarProductoDelCarrito,
    pasarCarritoFactura,
    mostrarFacturas
}



