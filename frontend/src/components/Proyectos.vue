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

</script>
<template>
    <form @submit.prevent="addOrUpdate">
        <div>
            <label>Nombre</label>
            <input v-model="form.nombre" type="text">
        </div>

        <div>
            <label>Descripción</label>
            <textarea v-model="form.descripcion" rows="3"></textarea>
        </div>

        <div>
            <label>Fecha Inicio</label>
            <input v-model="form.fechaInicio" type="date">
        </div>

        <div>
            <label>Prioridad</label>
            <select v-model="form.prioridad">
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
            </select>
        </div>

        <div>
            <label>ID empleado</label>
            <input v-model="form.empleadoId" type="text">
        </div>

        <div>
            <button type="submit">Guardar</button>
            <button type="button" @click="resetForm">Limpiar</button>
        </div>
    </form>

    <h2>Listado de proyectos</h2>

    <table>
        <thead>
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
                <td>{{ p.prioridad }}</td>
                <td>
                    {{
                        empleados.find(e => e.id === p.empleadoId).nombre
                    }}
                </td>

                <td>
                    <button @click="selProyecto(p)">Editar</button>
                    <button @click="delProyecto(p.id)">Eliminar</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>