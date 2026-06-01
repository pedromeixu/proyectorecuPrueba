<script setup>
  import { ref, reactive, onMounted } from "vue";
  import Swal from "sweetalert2";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import {
    getEmpleados,
    addEmpleado,
    deleteEmpleado,
    updateEmpleado
  } from "../api/apiEmpleados";

  // Lista reactiva
  const empleados = ref([]);

  // Formulario Reactivo
  const form = reactive({
    id: null,
    nombre: "",
    email: "",
    movil: "",
    puesto: "rrhh"
  });

  // Estado
  const cargando = ref(false);

  // Cargar empleados al iniciar
  onMounted(() => cargarEmpleados());

  async function cargarEmpleados() {
    cargando.value = true;
    Swal.showLoading();

    try {
      empleados.value = await getEmpleados();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      cargando.value = false;
      Swal.close();
    }
  }

  // Seleccionar empleado para editar
  function selEmpleado(emp) {
    form.id = emp.id;
    form.nombre = emp.nombre;
    form.email = emp.email;
    form.movil = emp.movil;
    form.puesto = emp.puesto;
  }

  // Resetear formulario
  function resetForm() {
    form.id = null;
    form.nombre = "";
    form.email = "";
    form.movil = "";
    form.puesto = "rrhh";
  }

  // Añadir o actualizar empleado
  async function addOrUpdate() {
    if (!form.nombre || !form.email) {
      Swal.fire("Error", "Nombre y email son obligatorios", "error");
      return;
    }

    const empleadoData = {
      nombre: form.nombre,
      email: form.email,
      movil: form.movil,
      puesto: form.puesto
    };

    Swal.showLoading();

    try {
      if (form.id === null) {
        // Crear nuevo empleado con ID string
        await addEmpleado({ ...empleadoData, id: crypto.randomUUID() });
      } else {
        // Actualizar empleado existente
        await updateEmpleado(form.id, empleadoData);
      }

      await cargarEmpleados();
      resetForm();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      Swal.close();
    }
  }

  // Eliminar empleado
  async function delEmpleado(id) {
    Swal.showLoading();

    try {
      await deleteEmpleado(id);
      await cargarEmpleados();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      Swal.close();
    }
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

  function pdfEmpleados() {
    const columnas = ["ID", "Nombre", "Email", "Móvil"];
    const filas = empleados.value.map(e => [e.id, e.nombre, e.email, e.movil]);

    generarPDF("Lista de Empleados", columnas, filas);
  }

</script>

<template>
  <div class="empleados container py-4">

    <h2 class="section-title mb-4">Gestión de empleados</h2>

    <!-- FORMULARIO -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">

        <h3 class="form-title mb-3">
          {{ form.id ? "Editar empleado" : "Nuevo empleado" }}
        </h3>

        <form @submit.prevent="addOrUpdate" class="row g-3">

          <div class="col-md-6">
            <label class="form-label fw-semibold">Nombre *</label>
            <input v-model="form.nombre" type="text" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Email *</label>
            <input v-model="form.email" type="email" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Móvil</label>
            <input v-model="form.movil" type="text" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Puesto</label>
            <select v-model="form.puesto" class="form-select">
              <option value="rrhh">RRHH</option>
              <option value="contabilidad">Contabilidad</option>
              <option value="almacen">Almacén</option>
              <option value="ventas">Ventas</option>
            </select>
          </div>

          <div class="col-12 d-flex gap-2 mt-3">
            <button type="submit" class="btn btn-primary-corp">
              {{ form.id ? "Guardar" : "Añadir" }}
            </button>

            <button type="button" class="btn btn-outline-secondary" @click="resetForm">
              Limpiar
            </button>
          </div>

        </form>

      </div>
    </div>

    <!-- LISTADO -->
    <h3 class="section-title mb-3">Listado</h3>

    <!-- BOTÓN PDF -->
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary-corp" @click="pdfEmpleados">
        📄 Exportar PDF
      </button>
    </div>

    <p v-if="cargando">Cargando...</p>

    <div v-else class="row g-3">
      <div class="col-md-4" v-for="emp in empleados" :key="emp.id">
        <div class="card empleado-card shadow-sm border-0 h-100">
          <div class="card-body">

            <h5 class="card-title text-primary-corp fw-bold">{{ emp.nombre }}</h5>

            <p class="mb-1"><strong>Email:</strong> {{ emp.email }}</p>
            <p class="mb-1"><strong>Móvil:</strong> {{ emp.movil }}</p>
            <p class="mb-2"><strong>Puesto:</strong> {{ emp.puesto }}</p>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm btn-outline-primary" @click="selEmpleado(emp)">
                Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="delEmpleado(emp.id)">
                Eliminar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>


<style scoped>
  .section-title {
    color: #0a3d62;
    font-weight: 700;
  }

  .btn-primary-corp {
    background-color: #4da3ff;
    border-color: #4da3ff;
    font-weight: 600;
    color: white;
  }

  .btn-primary-corp:hover {
    background-color: #1e90ff;
    border-color: #08324f;
  }

  .empleado-card {
    border-radius: 10px;
  }

  .form-title {
    color: #0a3d62;
    font-weight: 600;
  }
</style>
