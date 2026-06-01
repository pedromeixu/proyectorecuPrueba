<script setup>
  import { ref, reactive, onMounted } from "vue";
  import Swal from "sweetalert2";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import { getEmpleados } from "../api/apiEmpleados";
  import {
    getTareas,
    addTarea,
    updateTarea,
    deleteTarea
  } from "../api/apiTareas";

  // ESTADOS
  const tareas = ref([]);
  const empleados = ref([]);

  // FORMULARIO
  const form = reactive({
    id: null,
    titulo: "",
    descripcion: "",
    estado: "",
    prioridad: "media",
    empleadoId: "",
    horas: 0,
    precioHora: 0,
    total: 0,
    _empleadoValido: null
  });

  // =========================
  // CARGAR DATOS INICIALES
  // =========================
  onMounted(() => cargarDatos());

  async function cargarDatos() {
    Swal.showLoading();
    try {
      empleados.value = await getEmpleados();
      tareas.value = await getTareas();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      Swal.close();
    }
  }

  // =========================
  // VALIDAR EMPLEADO POR ID
  // =========================
  function buscarEmpleado() {
    if (!form.empleadoId) {
      Swal.fire("Error", "Debes introducir un ID", "error");
      return;
    }

    const emp = empleados.value.find(e => e.id === form.empleadoId);

    if (emp) {
      form._empleadoValido = true;
    } else {
      form._empleadoValido = false;
      Swal.fire("Empleado no encontrado", "Ese ID no existe", "error");
      form.empleadoId = "";
    }
  }

  // =========================
  // AÑADIR O EDITAR TAREA
  // =========================
  async function addOrUpdate() {
    if (!form.titulo) {
      Swal.fire("Error", "El título es obligatorio", "error");
      return;
    }
    if (!form.estado) {
      Swal.fire("Error", "El estado es obligatorio", "error");
      return;
    }
    if (!form.empleadoId) {
      Swal.fire("Error", "El empleado es obligatorio", "error");
      return;
    }

    const tareaData = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      estado: form.estado,
      prioridad: form.prioridad,
      empleadoId: form.empleadoId,
      horas: Number(form.horas),
      precioHora: Number(form.precioHora),
      total: Number(form.horas) * Number(form.precioHora)
    };

    Swal.showLoading();

    try {
      if (form.id === null) {
        // NUEVA TAREA
        await addTarea({ ...tareaData, id: crypto.randomUUID() });
      } else {
        // EDITAR TAREA
        await updateTarea(form.id, tareaData);
      }

      await cargarDatos();
      resetForm();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      Swal.close();
    }
  }

  // =========================
  // CARGAR TAREA EN FORMULARIO
  // =========================
  function selTarea(t) {
    form.id = t.id;
    form.titulo = t.titulo;
    form.descripcion = t.descripcion;
    form.estado = t.estado;
    form.prioridad = t.prioridad;
    form.empleadoId = t.empleadoId;
    form.horas = t.horas;
    form.precioHora = t.precioHora;
    form.total = t.total;
    form._empleadoValido = true;
  }

  // =========================
  // ELIMINAR TAREA
  // =========================
  async function delTarea(id) {
    Swal.showLoading();
    try {
      await deleteTarea(id);
      await cargarDatos();
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    } finally {
      Swal.close();
    }
  }

  // =========================
  // RESET FORM
  // =========================
  function resetForm() {
    form.id = null;
    form.titulo = "";
    form.descripcion = "";
    form.estado = "";
    form.prioridad = "media";
    form.empleadoId = "";
    form.horas = 0;
    form.precioHora = 0;
    form.total = 0;
    form._empleadoValido = null;
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

  function pdfTareasOrdenadas() {
    const columnas = ["ID", "Título", "Prioridad", "Estado", "UsuarioId"];

    // Orden personalizado: alta → media → baja
    const prioridadOrden = { alta: 1, media: 2, baja: 3 };

    const filas = tareas.value
      .slice() // copiamos para no mutar el array original
      .sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad])
      .map(t => {
        const empleado = empleados.value.find(e => e.id === t.empleadoId);
        const nombreEmpleado = empleado ? empleado.nombre : "Empleado desconocido";

        return [
          t.id,
          t.titulo,
          t.prioridad,
          t.estado,
          nombreEmpleado
        ];
      });

    generarPDF("Tareas Ordenadas por Prioridad", columnas, filas);
  }

  function pdfTareasEmpleado(empleadoId) {
    const empleado = empleados.value.find(e => e.id === empleadoId);
    const nombreEmpleado = empleado ? empleado.nombre : "Empleado desconocido";
    const filtradas = tareas.value.filter(t => t.empleadoId === empleadoId);

    const columnas = ["ID", "Título", "Prioridad", "Estado"];
    const filas = filtradas.map(t => [
      t.id,
      t.titulo,
      t.prioridad,
      t.estado
    ]);

    generarPDF(`Tareas del Empleado ${nombreEmpleado}`, columnas, filas);
  }
</script>


<template>
  <div class="tareas container py-4">

    <h2 class="section-title mb-4">Gestión de tareas</h2>

    <!-- FORMULARIO -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">

        <h3 class="form-title mb-3">
          {{ form.id ? "Editar tarea" : "Nueva tarea" }}
        </h3>

        <form @submit.prevent="addOrUpdate" class="row g-3">

          <div class="col-12">
            <label class="form-label fw-semibold">Título *</label>
            <input v-model="form.titulo" type="text" class="form-control" />
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Descripción</label>
            <textarea v-model="form.descripcion" class="form-control" rows="3"></textarea>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Estado *</label>
            <select v-model="form.estado" class="form-select">
              <option value="">Seleccione...</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Prioridad</label>
            <select v-model="form.prioridad" class="form-select">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">ID Empleado *</label>
            <div class="d-flex gap-2">
              <input
                v-model="form.empleadoId"
                type="text"
                class="form-control"
                :class="{
                  'is-valid': form._empleadoValido === true,
                  'is-invalid': form._empleadoValido === false
                }"
              />
              <button type="button" class="btn btn-outline-secondary" @click="buscarEmpleado">
                🔎
              </button>
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Horas *</label>
            <input
              v-model="form.horas"
              type="number"
              min="0"
              step="0.5"
              class="form-control"
            ></input>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Precio/Hora (€)</label>
            <input
              v-model="form.precioHora"
              type="number"
              min="0"
              step="0.5"
              class="form-control"
            ></input>
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
    <h3 class="section-title mb-3">Listado de tareas</h3>

    <!-- BOTONES PDF -->
    <div class="d-flex justify-content-end gap-2 mb-3">
      <button class="btn btn-primary-corp" @click="pdfTareasOrdenadas">
        📄 Exportar todas
      </button>

      <button class="btn btn-outline-secondary" @click="pdfTareasEmpleado(form.empleadoId)">
        👤 Exportar por empleado
      </button>
    </div>

    <div class="row g-3">
      <div class="col-md-4" v-for="t in tareas" :key="t.id">
        <div class="card tarea-card shadow-sm border-0 h-100" :class="t.estado">
          <div class="card-body">

            <h5 class="card-title text-primary-corp fw-bold">{{ t.titulo }}</h5>

            <p class="mb-1"><strong>Descripción:</strong> {{ t.descripcion }}</p>
            <p class="mb-1"><strong>Estado:</strong> {{ t.estado }}</p>
            <p class="mb-1"><strong>Prioridad:</strong> {{ t.prioridad }}</p>

            <p class="mb-2">
              <strong>Empleado:</strong>
              {{ empleados.find(e => e.id === t.empleadoId)?.nombre || "Desconocido" }}
            </p>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm btn-outline-primary" @click="selTarea(t)">
                Editar
              </button>
              <button class="btn btn-sm btn-danger" @click="delTarea(t.id)">
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

/* TARJETAS DE TAREAS */
.tarea-card {
  border-radius: 10px;
}

/* COLORES POR ESTADO */
.pendiente {
  border-left: 6px solid #e74c3c;
}

.en_proceso {
  border-left: 6px solid #f1c40f;
}

.finalizada {
  border-left: 6px solid #2ecc71;
}

/* TEXTO DE TÍTULO DE TAREA */
.card-title {
  font-size: 1.1rem;
}
</style>
