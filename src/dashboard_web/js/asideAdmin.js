async function loadAside() {
  const aside = await fetch("../aside.html").then(r => r.text());
  document.getElementById("sidebar").innerHTML = aside;

  // Resaltar opción activa
  const current = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("bg-neutral-200");
    } else {
      link.classList.add("hover:bg-neutral-100");
    }
  });

  // Mostrar datos del usuario
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    document.getElementById("user-name").textContent = `${user.nombres} ${user.apellidos}`;
  }
}
window.onload = loadAside;

function logout() {
  // Eliminar solo el token
  localStorage.removeItem("token");
  localStorage.clear()

  // O si quieres borrar TODO el localStorage
  // localStorage.clear();

  // Redirigir al login
  window.location.href = "../login.html";
}

