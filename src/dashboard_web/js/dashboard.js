    import { API } from "./config.js";

    document.addEventListener("DOMContentLoaded", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No estás autenticado");
        window.location.href = "../login.html";
        return;
      }

      try {
        const res = await fetch(`${API}/api/admin/count`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Error al cargar los datos");
          return;
        }

        // Actualizamos el DOM
        document.getElementById("total-usuarios").textContent = data.usuarios;
        document.getElementById("total-psicologos").textContent = data.psicologos;

      } catch (error) {
        console.error("Error obteniendo conteos:", error);
        alert("Error en el servidor");
      }
    });
