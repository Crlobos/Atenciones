$(document).ready(function() {
    // Inicializar DataTable
    let tabla = $('#tablaAtenciones').DataTable({
        "ajax": {
            "url": "obtener_atenciones.php",
            "type": "GET",
            "dataSrc": "data"
        },
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
        },
        "columns": [
            { 
                "data": "FechaIngreso",
                "render": function(data) {
                    return moment(data).format('DD/MM/YYYY HH:mm');
                }
            },
            { "data": "Paciente" },
            { "data": "Medico" },
            { "data": "Especialidad" },
            { "data": "Actividad" },
            { "data": "Diagnostico" },
            { 
                "data": "FechaAlta",
                "render": function(data) {
                    return data ? moment(data).format('DD/MM/YYYY HH:mm') : 'Pendiente';
                }
            },
            { 
                "data": "ID",
                "render": function(data) {
                    return `
                        <button class="btn btn-sm btn-warning btn-editar" data-id="${data}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${data}">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    `;
                },
                "orderable": false
            }
        ],
        "responsive": true,
        "order": [[0, "desc"]]
    });

    // Manejar el envío del formulario para nueva atención
    $('#atencionForm').on('submit', function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        let formData = new FormData(this);

        $.ajax({
            url: 'guardar_atencion.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                let res = JSON.parse(response);
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Atención registrada correctamente',
                        timer: 2000
                    });
                    $('#atencionForm')[0].reset();
                    tabla.ajax.reload();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: res.message
                    });
                }
            },
            error: function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al procesar la solicitud'
                });
            }
        });
    });

    // Función para validar el formulario
    function validarFormulario() {
        let valido = true;
        $('.form-control[required]').each(function() {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
                valido = false;
            } else {
                $(this).removeClass('is-invalid');
            }
        });

        if (!valido) {
            Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                text: 'Por favor, complete todos los campos requeridos.'
            });
        }

        return valido;
    }

    // Manejar click en botón editar
    $('#tablaAtenciones tbody').on('click', '.btn-editar', function() {
        let id = $(this).data('id');
        let data = tabla.row($(this).parents('tr')).data();
        mostrarModalEdicion(data);
    });

    // Manejar click en botón eliminar
    $('#tablaAtenciones tbody').on('click', '.btn-eliminar', function() {
        let id = $(this).data('id');
        
        Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'eliminar_atencion.php',
                    type: 'POST',
                    data: { id: id },
                    success: function(response) {
                        let res = JSON.parse(response);
                        if (res.success) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Eliminado!',
                                text: 'El registro ha sido eliminado.',
                                timer: 2000
                            });
                            tabla.ajax.reload();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: res.message
                            });
                        }
                    }
                });
            }
        });
    });

    // Función para mostrar modal de edición
    function mostrarModalEdicion(data) {
        $('#editarForm #fechaIngreso').val(moment(data.FechaIngreso).format('YYYY-MM-DDTHH:mm'));
        $('#editarForm #paciente').val(data.Paciente);
        $('#editarForm #medico').val(data.Medico);
        $('#editarForm #especialidad').val(data.Especialidad);
        $('#editarForm #actividad').val(data.Actividad);
        $('#editarForm #diagnostico').val(data.Diagnostico);
        $('#editarForm #alta').val(data.FechaAlta ? moment(data.FechaAlta).format('YYYY-MM-DDTHH:mm') : '');
        $('#editarForm #id').val(data.ID);

        $('#editarModal').modal('show');
    }

    // Manejar envío del formulario de edición
    $('#editarForm').on('submit', function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        let formData = new FormData(this);

        $.ajax({
            url: 'actualizar_atencion.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                let res = JSON.parse(response);
                if (res.success) {
                    $('#editarModal').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Atención actualizada correctamente',
                        timer: 2000
                    });
                    tabla.ajax.reload();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: res.message
                    });
                }
            }
        });
    });

    // Validaciones en tiempo real
    $('.form-control').on('input', function() {
        if ($(this).prop('required') && !$(this).val()) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

     // Limpiar validaciones al abrir modal
     $('#editarModal').on('show.bs.modal', function() {
        $('.form-control').removeClass('is-invalid');
    });

}); // Cierre de $(document).ready
        
    