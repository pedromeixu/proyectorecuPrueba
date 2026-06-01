import axios from "axios";

const API_URL = "http://localhost:3000/tareas";

export async function getTareas() {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    throw new Error("Error al obtener tareas");
  }
}

export async function addTarea(nuevaTarea) {
  try {
    const res = await axios.post(API_URL, nuevaTarea);
    return res.data;
  } catch (error) {
    throw new Error("Error al crear tarea");
  }
}

export async function deleteTarea(id) {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw new Error("Error al eliminar tarea");
  }
}

export async function updateTarea(id, tareaActualizada) {
  try {
    const res = await axios.put(`${API_URL}/${id}`, tareaActualizada);
    return res.data;
  } catch (error) {
    throw new Error("Error al actualizar tarea");
  }
}
