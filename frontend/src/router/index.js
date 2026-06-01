import Acerca from "../components/Acerca.vue"
import Empleados from "../components/Empleados.vue"
import Estadisticas from "../components/Estadisticas.vue"
import Inicio from "../components/Inicio.vue"
import Tareas from "../components/Tareas.vue"
import Facturas from "../components/Facturas.vue"
import Success from "../components/Success.vue"
import Cancel from "../components/Cancel.vue"
import Proyectos from "../components/Proyectos.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
    {
        path: "/",
        name: "Inicio",
        component: Inicio
    },
    {
        path: "/empleados",
        name: "Empleados",
        component: Empleados
    },
    {
        path: "/tareas",
        name: "Tareas",
        component: Tareas
    },
    {
        path: "/facturas",
        name: "Facturas",
        component: Facturas
    },
    
    {
        path: "/estadisticas",
        name: "Estadisticas",
        component: Estadisticas
    },
    {
        path: "/success",
        name: "Success",
        component: Success
    },
    {
        path: "/cancel",
        name: "Cancel",
        component: Cancel
    },
    {
        path: "/about",
        name: "Acerca",
        component: Acerca
    },
    {
        path: "/proyectos",
        name: "Proyectos",
        component: Proyectos
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router