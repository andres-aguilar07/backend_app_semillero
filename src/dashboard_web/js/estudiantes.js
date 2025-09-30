import { API } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás autenticado");
        window.location.href = "../login.html";
        return;
    }

    try {
        const res = await fetch(`${API}/api/admin/students`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al cargar los estudiantes");
            return;
        }

        // Insertar filas en la tabla
        const tbody = document.getElementById("students-body");
        tbody.innerHTML = ""; // limpiar por si acaso

        data.forEach(est => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
        <td class="px-6 py-3">${est.id}</td>
        <td class="px-6 py-3">${est.nombres}</td>
        <td class="px-6 py-3">${est.correo}</td>
        <td class="px-6 py-3 text-center">
          <button onclick="window.location.href='estudiante-perfil.html?id=${est.id}'"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow">
            Ver perfil
          </button>
        </td>
      `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error obteniendo estudiantes:", error);
        alert("Error en el servidor");
    }
});


