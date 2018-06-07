const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios')
const { crearMensaje } = require('../utilidades/utilidades')


const usuarios = new Usuarios()


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback)=>{
        if (!data.usuario.nombre || !data.usuario.sala ){
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            })
        }

        client.join(data.usuario.sala);

        usuarios.agregarPersona( client.id, data.usuario.nombre, data.usuario.sala);
        client.broadcast.to(data.usuario.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.usuario.sala));
        callback(usuarios.getPersonasPorSala(data.usuario.sala));        

    });

    client.on('crearMensaje', (data) =>{
        let persona = usuarios.getPersona( client.id );
        let mensaje = crearMensaje( persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    });

    client.on('disconnect', () =>{
        let personaBorrada = usuarios.borrarPersona( client.id );

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } abandoó el chat.`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
    });


    // Mensajes privados
    client.on('mensajePrivado', data =>{
        let persona = usuarios.getPersona( client.id );
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))
    })

});