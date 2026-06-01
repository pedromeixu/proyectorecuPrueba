<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm py-3">
    <div class="container">

      <!-- Marca -->
      <RouterLink to="/" class="navbar-brand fw-bold text-primary-corp">
        Mi Empresa
      </RouterLink>

      <!-- Botón móvil -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Enlaces -->
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto gap-3">

          <li class="nav-item">
            <RouterLink to="/" class="nav-link">Inicio</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/empleados" class="nav-link">Empleados</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/tareas" class="nav-link">Tareas</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/facturas" class="nav-link">Facturas</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/estadisticas" class="nav-link">Estadísticas</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/about" class="nav-link">Sobre nosotros</RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink to="/proyectos" class="nav-link">Proyectos</RouterLink>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</template>

<style scoped>
/* Color corporativo */
.text-primary-corp {
  color: #0a3d62 !important;
}

/* Enlaces */
.nav-link {
  font-weight: 500;
  color: #222 !important;
  transition: 0.2s ease;
}

.nav-link:hover {
  color: #0a3d62 !important;
}

/* Activo */
.router-link-active {
  font-weight: 600;
  color: #0a3d62 !important;
  border-bottom: 2px solid #0a3d62;
  padding-bottom: 2px;
}
</style>
