<script setup>
    import { ref, reactive, onMounted } from "vue";
    import Swal from "sweetalert2";
    import jsPDF from "jspdf";
    import autoTable from "jspdf-autotable";

    import { getEmpleados } from "../api/apiEmpleados";
    import { getTareas } from "../api/apiTareas";
    import { getFacturas, addFactura, deleteFactura } from "../api/apiFacturas";

    // ESTADOS
    const empleados = ref([]);
    const tareas = ref([]);
    const facturas = ref([]);

    const seleccion = reactive({
    empleadoId: "",
    fecha: "",
    tareasSeleccionadas: []
    });

    // =========================
    // CARGA INICIAL
    // =========================
    onMounted(() => cargarDatos());

    async function cargarDatos() {
        Swal.showLoading();
        try {
            empleados.value = await getEmpleados();

            const tareasRaw = await getTareas();
            tareas.value = tareasRaw.map(t => ({
            ...t,
            total: t.total ?? (Number(t.horas) * Number(t.precioHora))
            }));

            facturas.value = await getFacturas();
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            Swal.close();
        }
    }

        // =========================
        // TAREAS FINALIZADAS DO EMPREGADO
        // =========================
    function tareasFiltradas() {
        return tareas.value.filter(
            t =>
            t.empleadoId === seleccion.empleadoId &&
            t.estado === "finalizada"
        );
    }

        // =========================
        // XERAR CÓDIGO FACTURA
        // =========================
    function generarCodigo() {
        const ano = new Date().getFullYear();
        const numero = facturas.value.length + 1;
        return `F-${ano}-${String(numero).padStart(3, "0")}`;
    }

    // =========================
    // CREAR FACTURA
    // =========================
    async function crearFactura() {
        if (!seleccion.empleadoId) {
            Swal.fire("Error", "Debes seleccionar un empleado", "error");
            return;
        }
        if (!seleccion.fecha) {
            Swal.fire("Error", "Debes seleccionar una fecha", "error");
            return;
        }
        if (seleccion.tareasSeleccionadas.length === 0) {
            Swal.fire("Error", "Debes seleccionar al menos una tarea", "error");
            return;
        }

        const tareasFactura = seleccion.tareasSeleccionadas.map(id => {
            const t = tareas.value.find(x => x.id === id);
            return {
            id: t.id,
            titulo: t.titulo,
            horas: t.horas,
            precioHora: t.precioHora,
            total: t.total
            };
        });

        const totalFactura = tareasFactura.reduce((acc, t) => acc + t.total, 0);

        const factura = {
            id: crypto.randomUUID(),
            codigo: generarCodigo(),
            clienteId: seleccion.empleadoId,
            fecha: seleccion.fecha,
            tareas: tareasFactura,
            totalFactura
        };

        Swal.showLoading();
        try {
            await addFactura(factura);
            await cargarDatos();
            resetSeleccion();
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            Swal.close();
        }
    }

    // =========================
    // RESET
    // =========================
    function resetSeleccion() {
        seleccion.empleadoId = "";
        seleccion.fecha = "";
        seleccion.tareasSeleccionadas = [];
        }

        // =========================
        // IMPRIMIR FACTURA
        // =========================
        function imprimirFactura(f) {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Factura ${f.codigo}`, 14, 15);

        doc.setFontSize(12);
        doc.text(`Fecha: ${f.fecha}`, 14, 25);

        const empleado = empleados.value.find(e => e.id === f.clienteId);
        doc.text(`Cliente: ${empleado?.nombre || "Desconocido"}`, 14, 32);

        autoTable(doc, {
            startY: 40,
            head: [["Tarea", "Horas", "Precio/Hora", "Total"]],
            body: f.tareas.map(t => [
            t.titulo,
            t.horas,
            t.precioHora + " €",
            t.total + " €"
            ])
        });

        doc.setFontSize(14);
        doc.text(`TOTAL FACTURA: ${f.totalFactura} €`, 14, doc.lastAutoTable.finalY + 10);

        doc.save(`Factura-${f.codigo}.pdf`);
    }

    async function pagarFactura(factura) {
        const lineItems = factura.tareas.map(t => ({
            price_data: {
            currency: "eur",
            product_data: { name: t.titulo },
            unit_amount: t.precioHora * 100
            },
            quantity: t.horas
        }));

        try {
            const res = await fetch("http://localhost:3001/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lineItems })
            });

            const data = await res.json();
            window.location.href = data.url;

        } catch (e) {
            Swal.fire("Error", e.message, "error");
        }
    }
</script>

<template>
  <div class="container py-4">

    <h2 class="section-title mb-4">Facturación</h2>

    <!-- FORMULARIO FACTURA -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body">

        <h3 class="form-title mb-3">Crear factura</h3>

        <div class="row g-3">

          <div class="col-md-6">
            <label class="form-label fw-semibold">Empleado</label>
            <select v-model="seleccion.empleadoId" class="form-select">
              <option value="">Seleccione...</option>
              <option v-for="e in empleados" :key="e.id" :value="e.id">
                {{ e.nombre }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-semibold">Fecha factura</label>
            <input type="date" v-model="seleccion.fecha" class="form-control" />
          </div>

          <div class="col-12">
            <label class="form-label fw-semibold">Tareas finalizadas</label>

            <div v-for="t in tareasFiltradas()" :key="t.id" class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                :value="t.id"
                v-model="seleccion.tareasSeleccionadas"
              />
              <label class="form-check-label">
                {{ t.titulo }} — {{ t.total }} €
              </label>
            </div>
          </div>

          <div class="col-12 mt-3">
            <button class="btn btn-primary-corp" @click="crearFactura">
              Crear factura
            </button>
          </div>

        </div>

      </div>
    </div>

    <!-- LISTADO FACTURAS -->
    <h3 class="section-title mb-3">Listado de facturas</h3>

    <div class="row g-3">
      <div class="col-md-4" v-for="f in facturas" :key="f.id">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">

            <h5 class="fw-bold text-primary-corp">{{ f.codigo }}</h5>
            <p><strong>Fecha:</strong> {{ f.fecha }}</p>
            <p><strong>Total:</strong> {{ f.totalFactura }} €</p>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm btn-outline-primary" @click="imprimirFactura(f)">
                Imprimir
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteFactura(f.id)">
                Eliminar
              </button>
              <button class="btn btn-sm btn-success" @click="pagarFactura(f)">
                💳 Pagar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>
