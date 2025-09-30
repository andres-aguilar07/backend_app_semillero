import { API } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No estás autenticado");
    window.location.href = "../login.html";
    return;
  }

  try {
    const res = await fetch(`${API}/api/admin/psychologists`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error al cargar los psicologos");
      return;
    }

    // Insertar filas en la tabla
    const tbody = document.getElementById("psychologists-body");
    tbody.innerHTML = ""; // limpiar por si acaso

    data.forEach(psicologo => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="px-6 py-3">${psicologo.id}</td>
        <td class="px-6 py-3">${psicologo.nombres}</td>
        <td class="px-6 py-3">${psicologo.correo}</td>
        <td class="px-6 py-3 text-center flex gap-2 justify-center">
          <!-- Botón Ver perfil -->
          <button onclick="window.location.href='psicologo-perfil.html?id=${psicologo.id}'"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow">
            Ver perfil
          </button>

          <!-- Botón Editar -->
          <button onclick='abrirModal(${JSON.stringify(psicologo)})'
            class="bg-gray-400 hover:bg-gray-600 text-white p-2 rounded-md shadow flex items-center justify-center"
            title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16.862 3.487l3.651 3.651a1.5 1.5 0 010 2.122l-9.193 9.193-4.243.707.707-4.243 9.193-9.193a1.5 1.5 0 012.122 0z" />
            </svg>
          </button>

          <!-- Botón Eliminar -->
          <button onclick="eliminarPsicologo(${psicologo.id})"
            class="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md shadow flex items-center justify-center"
            title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4h6v3" />
            </svg>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error obteniendo psicologos:", error);
    alert("Error en el servidor");
  }
});

// Abrir modal y rellenar campos
window.abrirModal = function(est) {
  document.getElementById("modal-editar").classList.remove("hidden");

  document.getElementById("edit-id").value = est.id;
  document.getElementById("edit-nombres").value = est.nombres || "";
  document.getElementById("edit-apellidos").value = est.apellidos || "";
  document.getElementById("edit-correo").value = est.correo || "";
  document.getElementById("edit-telefono").value = est.telefono || "";
  document.getElementById("edit-edad").value = est.edad || "";
  document.getElementById("edit-ciudad").value = est.ciudad || "";
}

// Cerrar modal
window.cerrarModal = function() {
  document.getElementById("modal-editar").classList.add("hidden");
}

// Guardar cambios
document.getElementById("btn-guardar").addEventListener("click", async () => {
  const id = document.getElementById("edit-id").value;
  
  // Validar campos requeridos
  const nombres = document.getElementById("edit-nombres").value.trim();
  const apellidos = document.getElementById("edit-apellidos").value.trim();
  const correo = document.getElementById("edit-correo").value.trim();
  const telefono = document.getElementById("edit-telefono").value.trim();
  const edad = document.getElementById("edit-edad").value;
  const ciudad = document.getElementById("edit-ciudad").value.trim();

  // Validaciones
  if (!nombres || !apellidos || !correo || !telefono || !ciudad || !edad) {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }

  if (edad < 18 || edad > 100) {
    Swal.fire("Error", "La edad debe estar entre 18 y 100 años", "error");
    return;
  }
  
  const payload = {
    nombres,
    apellidos,
    correo,
    telefono,
    edad: Number(edad),
    ciudad,
  };

  // Confirmación antes de actualizar
  const result = await Swal.fire({
    title: "¿Guardar cambios?",
    text: "Se actualizarán los datos del psicólogo",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, actualizar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${API}/api/admin/psychologists/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire("Error", data.message || "Error al actualizar psicólogo", "error");
      return;
    }

    Swal.fire({
      title: "Actualizado",
      text: "Psicólogo actualizado correctamente",
      icon: "success",
      confirmButtonText: "Ok"
    }).then(() => {
      cerrarModal();
      location.reload(); // recargar tabla después de actualizar
    });

  } catch (err) {
    console.error("Error editando:", err);
    Swal.fire("Error", "Error en el servidor", "error");
  }
});

// Abrir modal agregar
window.abrirModalAgregar = function() {
  document.getElementById("modal-agregar").classList.remove("hidden");
}

// Cerrar modal agregar
window.cerrarModalAgregar = function() {
  document.getElementById("modal-agregar").classList.add("hidden");
}

// Guardar nuevo psicólogo
document.getElementById("btn-agregar").addEventListener("click", async () => {
  // Validar campos requeridos
  const nombres = document.getElementById("add-nombres").value.trim();
  const apellidos = document.getElementById("add-apellidos").value.trim();
  const correo = document.getElementById("add-correo").value.trim();
  const contrasena = document.getElementById("add-contrasena").value.trim();
  const telefono = document.getElementById("add-telefono").value.trim();
  const ciudad = document.getElementById("add-ciudad").value.trim();
  const edad = document.getElementById("add-edad").value;
  const sexo = document.getElementById("add-sexo").value;

  // Validaciones
  if (!nombres || !apellidos || !correo || !contrasena || !telefono || !ciudad || !edad || !sexo) {
    Swal.fire("Error", "Todos los campos son obligatorios", "error");
    return;
  }

  if (edad < 18 || edad > 100) {
    Swal.fire("Error", "La edad debe estar entre 18 y 100 años", "error");
    return;
  }

  const payload = {
    nombres,
    apellidos,
    correo,
    contrasena,
    telefono,
    ciudad,
    edad: Number(edad),
    sexo
  };

  // Confirmación antes de crear
  const result = await Swal.fire({
    title: "¿Agregar psicólogo?",
    text: "Se registrará un nuevo psicólogo en el sistema",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, agregar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    console.log("Payload enviado:", payload);
    const res = await fetch(`${API}/api/admin/addPsychologist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire("Error", data.message || "Error al agregar psicólogo", "error");
      return;
    }

    Swal.fire({
      title: "Agregado",
      text: "Psicólogo agregado correctamente",
      icon: "success",
      confirmButtonText: "Ok"
    }).then(() => {
      cerrarModalAgregar();
      // Limpiar formulario
      document.getElementById("add-nombres").value = "";
      document.getElementById("add-apellidos").value = "";
      document.getElementById("add-correo").value = "";
      document.getElementById("add-contrasena").value = "";
      document.getElementById("add-telefono").value = "";
      document.getElementById("add-ciudad").value = "";
      document.getElementById("add-edad").value = "";
      document.getElementById("add-sexo").value = "";
      location.reload(); // recargar tabla
    });

  } catch (err) {
    console.error("Error agregando:", err);
    Swal.fire("Error", "Error en el servidor", "error");
  }
});

// Eliminar psicólogo
window.eliminarPsicologo = async function(id) {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará al psicólogo permanentemente",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${API}/api/admin/psychologists/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire("Error", data.message || "Error al eliminar psicólogo", "error");
      return;
    }

    Swal.fire({
      title: "Eliminado",
      text: "Psicólogo eliminado correctamente",
      icon: "success",
      confirmButtonText: "Ok"
    }).then(() => {
      location.reload(); // recargar tabla después del OK
    });
  } catch (err) {
    console.error("Error eliminando:", err);
    Swal.fire("Error", "Error en el servidor", "error");
  }
}

