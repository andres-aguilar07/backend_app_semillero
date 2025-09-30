async function loadAside() {
  const aside = await fetch("../aside2.html").then(r => r.text());
  document.getElementById("sidebar").innerHTML = aside;

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
