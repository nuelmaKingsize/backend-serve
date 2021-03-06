// Requires
var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// TODO
app.get('/todo/:query', (req, res, next) => {
    var busqueda = req.params.query;

    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuario(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

// POR COLECCION
app.get('/coleccion/:tabla/:query', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex)
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex)
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex)
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Coleccion invalida',
                errors: { message: `coleccion ${tabla} invalida` }
            });
    }

    promesa.then(data => {
            res.status(200).json({
                ok: true,
                [tabla]: data
            });
        })
        .catch(err => {
            res.status(500).json({
                ok: false,
                mensaje: 'error DB',
                errors: err
            });
        });

});


function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al Cargar Hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error a cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error a cargar usuario', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}


module.exports = app;