const firebaseConfig = {
  apiKey: "AIzaSyAJwkmIR8w7dpudmRVigzHgYwSNakQVb-4",
  authDomain: "desafio-12-b4c37.firebaseapp.com",
  projectId: "desafio-12-b4c37",
  storageBucket: "desafio-12-b4c37.appspot.com",
  messagingSenderId: "888695163332",
  appId: "1:888695163332:web:0d31a90595770a8c273c91",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

function mostrarMensaje(mensaje, esError) {
  const mensajeElement = esError
    ? document.getElementById("errorMessages")
    : document.getElementById("confirmationMessage");
  mensajeElement.textContent = mensaje;
  mensajeElement.style.display = "block";

  setTimeout(() => {
    mensajeElement.style.display = "none";
  }, 3000);
}

function esCorreoValido(correo) {
  const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return correoRegex.test(correo);
}

let modoEdicion = false;
let contactoEditandoId = null;

document.getElementById("agregar").addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const fechaNacimiento = document.getElementById("fecha-nacimiento").value;

  const nombreApellidoRegex = /^[a-zA-Z\s]+$/;

  if (!nombreApellidoRegex.test(nombre)) {
    mostrarMensaje("Por favor, ingresa un nombre válido.", true);
    return;
  }

  if (!esCorreoValido(email)) {
    mostrarMensaje("Por favor, ingresa un correo electrónico válido.", true);
    return;
  }

  if (fechaNacimiento && nombre && email) {
    if (modoEdicion) {
      const contactoRef = db.ref(`contactos/${contactoEditandoId}`);
      contactoRef
        .update({
          nombre,
          email,
          fechaNacimiento,
        })
        .then(() => {
          mostrarMensaje("Contacto actualizado correctamente.", false);

          document.getElementById("agregar").textContent = "Agregar";
          modoEdicion = false;
          contactoEditandoId = null;

          document.getElementById("nombre").value = "";
          document.getElementById("email").value = "";
          document.getElementById("fecha-nacimiento").value = "";
        })
        .catch((error) => {
          console.error("Error al actualizar el contacto:", error);
        });
    } else {
      const nuevoContacto = db.ref("contactos").push();
      nuevoContacto
        .set({
          nombre,
          email,
          fechaNacimiento,
        })
        .then(() => {
          mostrarMensaje("Contacto agregado correctamente.", false);

          document.getElementById("nombre").value = "";
          document.getElementById("email").value = "";
          document.getElementById("fecha-nacimiento").value = "";
        })
        .catch((error) => {
          console.error("Error al agregar el contacto:", error);
        });
    }
  } else {
    mostrarMensaje("Por favor, completa todos los campos obligatorios.", true);
  }
});

const contactList = document.getElementById("contact-list");
db.ref("contactos").on("child_added", (snapshot) => {
  const contacto = snapshot.val();
  const contactoItem = document.createElement("div");
  contactoItem.classList.add("contact-item");
  contactoItem.innerHTML = `
      <div class="contact">
        <p>Nombre: ${contacto.nombre}</p>
        <p>Email: ${contacto.email}</p>
        <p>Fecha de Nacimiento: ${contacto.fechaNacimiento}</p>
        <button class="editar" data-id="${snapshot.key}">Editar</button>
        <button class="eliminar" data-id="${snapshot.key}">Eliminar</button>
      </div>
    `;

  contactList.appendChild(contactoItem);

  const eliminarButton = contactoItem.querySelector(".eliminar");
  eliminarButton.addEventListener("click", () => {
    const contactoId = eliminarButton.getAttribute("data-id");
    const contactoRef = db.ref(`contactos/${contactoId}`);

    const confirmacion = confirm(`¿Estás seguro que deseas eliminar el contacto ${contacto.nombre}?`);
  
    if (confirmacion) {
      contactoRef
        .remove()
        .then(() => {
          mostrarMensaje("Contacto eliminado correctamente.", false);
          contactList.removeChild(contactoItem);
        })
        .catch((error) => {
          console.error("Error al eliminar el contacto:", error);
        });
    }
  });

  const editarButton = contactoItem.querySelector(".editar");
  editarButton.addEventListener("click", () => {
    const contactoId = editarButton.getAttribute("data-id");
    const contactoRef = db.ref(`contactos/${contactoId}`);
    const contacto = childSnapshot.val();

    document.getElementById("nombre").value = contacto.nombre;
    document.getElementById("email").value = contacto.email;
    document.getElementById("fecha-nacimiento").value =
      contacto.fechaNacimiento;
    document.getElementById("agregar").textContent = "Actualizar";
    modoEdicion = true;
    contactoEditandoId = contactoId;
  });
});
