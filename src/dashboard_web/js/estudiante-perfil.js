import { API } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás autenticado");
        window.location.href = "../login.html";
        return;
    }

    // Obtener ID desde query param
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get("id");

    if (!studentId) {
        alert("No se especificó un estudiante");
        return;
    }

    try {
        const res = await fetch(`${API}/api/admin/students/${studentId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al cargar el perfil del estudiante");
            return;
        }

        // Rellenar el HTML con la info del estudiante
        document.getElementById("estudiante-nombre").textContent = `${data.nombres} ${data.apellidos}`;
        document.getElementById("estudiante-correo").textContent = data.correo || "-";
        document.getElementById("estudiante-edad").textContent = data.edad || "-";
        document.getElementById("estudiante-telefono").textContent = data.telefono || "-";
        document.getElementById("estudiante-semestre").textContent = data.semestre_actual || "-";
        document.getElementById("estudiante-ciudad").textContent = data.ciudad || "-";
        document.getElementById("estudiante-fecha-nacimiento").textContent = data.fecha_nacimiento || "-";

    } catch (error) {
        console.error("Error obteniendo perfil:", error);
        alert("Error en el servidor");
    }
});