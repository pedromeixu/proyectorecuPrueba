import axios from "axios";

const API_URL = "http://localhost:3000/proyectos";

export async function getProyectos() {
    try {
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        throw new Error("Error al obtener proyectos");
    }
}

export async function addProyecto(nuevoProyecto) {
    try {
        const res = await axios.post(API_URL, nuevoProyecto);
        return res.data;
    } catch (error) {
        throw new Error("Error al crear proyecto");
    }
}

export async function deleteProyecto(id) {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        throw new Error("Error al eliminar proyecto");
    }
}

export async function updateProyecto(id, proyectoActualizado) {
    try {
        const res = await axios.put(`${API_URL}/${id}`, proyectoActualizado);
        return res.data;
    } catch (error) {
        throw new Error("Error al actualizar proyecto");
    }
}

export async function getProyectoById(id) {
    try {
        const res = await axios.get(`${API_URL}/${id}`);
        return res.data;
    } catch (error) {
        throw new Error("Error al obtener proyecto por ID");
    }
}