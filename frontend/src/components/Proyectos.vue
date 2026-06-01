<script setup>
    import { ref, reactive, onMounted } from "vue";
    import {
        addProyecto,
        getProyectos,
        deleteProyecto,
        updateProyecto,
        getProyectoById
    } from "../api/apiProyectos";
    import { getEmpleados } from "../api/apiEmpleados";
    import jsPDF from "jspdf";
    import autoTable from "jspdf-autotable";
    const proyectos = ref([]);
    const empleados = ref([]);
    const form = reactive({
        id: null,
        nombre: "",
        descripcion: "",
        fechaInicio: "",
        prioridad: "",
        empleadoId: "",
        _empleadoValido: null
    });

    onMounted(()=> cargarDatos());

    async function cargarDatos() {
        try {
            empleados.value = await getEmpleados();
            proyectos.value = await getProyectos();
        } catch(e) {
            console.error(e);
        }
    };

    function buscarEmpleado() {
        if (!form.empleadoId) {
            return;
        }

        const emp = empleados.value.find(e => e.id === form.empleadoId);
        
        if (emp) {
            form._empleadoValido = true;
        } else {
            form._empleadoValido = false;
            console.log("Empleado no encontrado");
        }
    }

    async function addOrUpdate() {
        buscarEmpleado();

        if (!form._empleadoValido){
            return;
        }
        if (!form.nombre) {
            return;
        }
        if (!form.fechaInicio) {
            return;
        }
        if (!form.prioridad) {
            return;
        }

        const proyectoData = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            fechaInicio: form.fechaInicio,
            prioridad: form.prioridad,
            empleadoId: form.empleadoId
        };

        try {
            if (form.id === null) {
                await addProyecto({ ...proyectoData, id: crypto.randomUUID() });
            } else {
                await updateProyecto(form.id, proyectoData);
            }

            await cargarDatos();
            resetForm();
        } catch(e) {
            console.error(e);
        }
    }
    
    function selProyecto(p) {
        form.id = p.id,
        form.nombre = p.nombre,
        form.descripcion = p.descripcion,
        form.fechaInicio = p.fechaInicio,
        form.prioridad = p.prioridad,
        form.empleadoId = p.empleadoId,
        form._empleadoValido = true;
    }

    async function delProyecto(id){
        try {
            await deleteProyecto(id);
            await cargarDatos();
        } catch(e) {
            console.error(e);
        }
    }

    function resetForm() {
        form.id = null,
        form.nombre = "",
        form.descripcion = "",
        form.fechaInicio = "",
        form.prioridad = "",
        form.empleadoId = "",
        form._empleadoValido = null;
    }

    function obtenerNombreEmpleado(id) {
        const emp = empleados.value.find(e => e.id === id);
        return emp.nombre;
    }

    function generarPDF(titulo, columnas, filas) {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(titulo, 14, 15);

        autoTable(doc, {
            startY: 25,
            head: [columnas],
            body: filas
        });

        doc.save(`${titulo}.pdf`);
    }

    function pdfProyectos() {
        const columnas = ["ID", "Nombre", "Descripción", "Fecha Inicio", "Prioridad", "Nombre Empleado"];
        const filas = proyectos.value.map(p => [p.id, p.nombre, p.descripcion, p.fechaInicio, p.prioridad, obtenerNombreEmpleado(p.empleadoId)]);

        generarPDF("Lista de Proyectos", columnas, filas);
    }

    function pdfProyectosEmpleado() {
        const columnas = ["ID", "Nombre", "Descripción", "Fecha Inicio", "Prioridad", "Nombre Empleado"];
        const filas = [p.id, p.nombre, p.descripcion, p.fechaInicio, p.prioridad, obtenerNombreEmpleado(p.empleadoId)]

        generarPDF(columnas, filas);
    }
</script>
<template>
    <div class="tareas container py-4">
        <h2 class="section_title mb-4">Gestión de proyectos</h2>
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-body">

                <h3 class="form-title mb-3">Nuevo Proyecto</h3>
                <form @submit.prevent="addOrUpdate" class="row g-3">
                    <div class="col-12">
                        <label class="form-label fw-semibold">Nombre</label>
                        <input v-model="form.nombre" type="text" class="form-control">
                    </div>

                    <div class="col-12">
                        <label class="form-label fw-semibold">Descripción</label>
                        <textarea v-model="form.descripcion" rows="3" class="form-control"></textarea>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Fecha Inicio</label>
                        <input v-model="form.fechaInicio" type="date" class="form-control">
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Prioridad</label>
                        <select v-model="form.prioridad" class="form-select">
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label class="form-label fw-semibold">ID empleado</label>
                        <input v-model="form.empleadoId" type="text" class="form-control">
                    </div>

                    <div class="col-12 d-flex gap-2 mt-3">
                        <button type="submit" class="btn btn-primary-corp">Guardar</button>
                        <button type="button" @click="resetForm" class="btn btn-outline-secondary">Limpiar</button>
                    </div>
                </form>
            </div>
        </div>
        <h3 class="mt-4 mb-3">Listado de proyectos</h3>

        <div class="">
            <button @click="pdfProyectos">
                Exportar proyectos
            </button>
        </div>

        <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle proyectos-table">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Fecha Inicio</th>
                        <th>Prioridad</th>
                        <th>Empleado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="p in proyectos" :key="p.id">
                        <td>{{ p.id }}</td>
                        <td>{{ p.nombre }}</td>
                        <td>{{ p.descripcion }}</td>
                        <td>{{ p.fechaInicio }}</td>
                        <td><span
                                class="badge prioridad"
                                :class="{
                                    'prioridad-alta': p.prioridad === 'alta',
                                    'prioridad-media': p.prioridad === 'media',
                                    'prioridad-baja': p.prioridad === 'baja'
                                }"
                            >{{ p.prioridad }}</span></td>
                        <td>
                            {{
                                empleados.find(e => e.id === p.empleadoId).nombre
                            }}
                        </td>

                        <td>
                            <button class="btn btn-sm btn-warning" @click="selProyecto(p)">Editar</button>
                            <button class="btn btn-sm btn-danger" @click="delProyecto(p.id)">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
    /* TÍTULOS */
    .section-title {
        color: #0a3d62;
        font-weight: 700;
    }

    .form-title {
        color: #0a3d62;
        font-weight: 600;
    }

    /* BOTÓN AZUL CLARO CORPORATIVO */
    .btn-primary-corp {
        background-color: #4da3ff;
        border-color: #4da3ff;
        font-weight: 600;
        color: white;
        transition: 0.2s ease;
    }

    .btn-primary-corp:hover {
        background-color: #1e90ff;
        border-color: #1e90ff;
    }

    /* TABLA */

    /* TABLA GENERAL */
    .proyectos-table {
        border-radius: 8px;
        overflow: hidden;
        background: white;
    }

    /* FILAS */
    .proyectos-table tbody tr:hover {
        background-color: #f1f7ff;
        transition: 0.2s ease;
    }

    /* BADGES DE PRIORIDAD */
    .prioridad {
        padding: 6px 10px;
        border-radius: 6px;
        font-weight: 600;
        text-transform: capitalize;
        font-size: 0.85rem;
    }

    .prioridad-alta {
        background-color: #ff6b6b;
        color: white;
    }

    .prioridad-media {
        background-color: #feca57;
        color: #5a3e00;
    }

    .prioridad-baja {
        background-color: #1dd1a1;
        color: white;
    }

    /* BOTONES DE ACCIÓN */
    .btn-warning {
        font-weight: 600;
    }

    .btn-danger {
        font-weight: 600;
    }

    /* RESPONSIVE EXTRA */
    @media (max-width: 768px) {
        .proyectos-table td,
        .proyectos-table th {
            font-size: 0.85rem;
            padding: 6px;
        }
    }

</style>