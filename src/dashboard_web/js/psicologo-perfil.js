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
    const psychologistId = params.get("id");

    if (!psychologistId) {
        alert("No se especificó un psicologo");
        return;
    }

    try {
        const res = await fetch(`${API}/api/admin/psychologists/${psychologistId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al cargar el perfil del psicologo");
            return;
        }

        // Rellenar el HTML con la info del estudiante
        document.getElementById("psicologo-nombre").textContent = `${data.nombres} ${data.apellidos}`;
        document.getElementById("psicologo-correo").textContent = data.correo || "-";
        document.getElementById("psicologo-telefono").textContent = data.telefono || "-";
        document.getElementById("psicologo-ciudad").textContent = data.ciudad || "-";
        document.getElementById("psicologo-edad").textContent = data.edad || "-";

    } catch (error) {
        console.error("Error obteniendo perfil:", error);
        alert("Error en el servidor");
    }
});