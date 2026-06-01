import axios from "axios";

const API_URL = "http://localhost:3000/empleados";

// Obtener lista completa de empleados
export async function getEmpleados() {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    throw new Error("Error al obtener empleados");
  }
}

// Añadir empleado nuevo
export async function addEmpleado(nuevoEmpleado) {
  try {
    const res = await axios.post(API_URL, nuevoEmpleado);
    return res.data;
  } catch (error) {
    throw new Error("Error al crear empleado");
  }
}

// Eliminar empleado por ID
export async function deleteEmpleado(id) {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error("Error al eliminar empleado");
  }
}

// Actualizar empleado por ID
export async function updateEmpleado(id, empleadoActualizado) {
  try {
    const res = await axios.put(`${API_URL}/${id}`, empleadoActualizado);
    return res.data;
  } catch (error) {
    throw new Error("Error al actualizar empleado");
  }
}

// Obtener empleado por ID
export async function getEmpleadoById(id) {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    throw new Error("Error al obtener empleado por ID");
  }
}
