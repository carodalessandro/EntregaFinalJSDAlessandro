class Mercaderia {
  constructor(mercaderia) {
    this.id = mercaderia.id;
    this.tipo = mercaderia.tipo;
    this.precio = mercaderia.precio;
    this.cantidad = mercaderia.cantidad;
    this.precioTotal = mercaderia.precio;
  }

  agregarUnidad() {
    this.cantidad++;
  }

  quitarUnidad() {
    this.cantidad--;
  }

  actualizarPrecioTotal() {
    this.precioTotal = this.precio * this.cantidad;
  }
}

function imprimirProductosEnHTML() {
  let contenedorCard = document.getElementById("contenedorCard");
  contenedorCard.innerHTML = "";

  fetch("/productos.json")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((mercaderia) => {
        let card = document.createElement("div");
        card.innerHTML = `
            <div class="row justify-content-around align-items-center">
            <div class="card marginPedidos" style="max-width: 520px;">
              <div class="row g-0 align-items-center">
                  <div class="col-md-4">
                      <img src="${mercaderia.img}" class="img-fluid rounded-start" alt="">
                  </div>
                  <div class="col-md-8">
                      <div class="card-body d-flex flex-column">
                          <h5 class="card-title text-center"><strong>${mercaderia.tipo}</strong></h5>
                          <div class=" d-flex flex-column align-items-end">
                              <p class="card-text text-center">${mercaderia.descripcion}</p>
                              <button id="agregar${mercaderia.tipo}${mercaderia.id}" type="button" class="boton btn d-flex">
                              <a class="nav-link ms-2 mb-3">Agregar al carrito</a></button>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
            </div>
                  `;
        contenedorCard.appendChild(card);

        let boton = document.getElementById(
          `agregar${mercaderia.tipo}${mercaderia.id}`
        );
        boton.addEventListener("click", () => agregarAlCarrito(mercaderia));
      });
    })
    .catch((error) => {
      console.log(error);
    });
}
imprimirProductosEnHTML();

function agregarAlCarrito(producto) {
  let index = carrito.findIndex((elemento) => elemento.id === producto.id);
  console.log({ index });

  if (index != -1) {
    carrito[index].agregarUnidad();
    carrito[index].actualizarPrecioTotal();
    Toastify({
      text: "Agregaste otra unidad de este producto",
      className: "info",
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
    }).showToast();
  } else {
    let mercaderia = new Mercaderia(producto);
    mercaderia.cantidad = 1;
    carrito.push(mercaderia);
    swal.fire({
      text: "El producto fue agregado con éxito",
      icon: "success",
    });
  }

  localStorage.setItem("carritoEnStorage", JSON.stringify(carrito));
  imprimirTabla(carrito);
}

function eliminarDelCarrito(id) {
  let index = carrito.findIndex((elemento) => elemento.id === id);

  if (carrito[index].cantidad > 1) {
    carrito[index].quitarUnidad();
    carrito[index].actualizarPrecioTotal();
  } else {
    carrito.splice(index, 1);
  }

  swal({
    text: "El producto fue eliminado con éxito",
    icon: "success",
  });

  localStorage.setItem("carritoEnStorage", JSON.stringify(carrito));
  imprimirTabla(carrito);
}

function obtenerPrecioTotal(array) {
  return array.reduce((total, elemento) => total + elemento.precioTotal, 0);
}

function imprimirTabla(array) {
  let contenedor = document.getElementById("tablaCarrito");
  contenedor.innerHTML = "";

  let tabla = document.createElement("div");

  tabla.innerHTML = `
          <div class="contenedor">
              <table class="table">
                  <thead>
                      <tr>
                      <th scope="col">cantidad</th>
                      <th scope="col">Producto</th>
                      <th scope="col">Precio Unitario</th>
                      <th scope="col">Precio Total</th>
                      </tr>
                  </thead>
                  <tbody id="bodyTabla">
                  </tbody>
              </table>
          </div>
      `;

  contenedor.appendChild(tabla);

  let bodyTabla = document.getElementById("bodyTabla");

  for (let mercaderia of array) {
    let datos = document.createElement("tr");
    datos.innerHTML = `
                  <td>${mercaderia.cantidad}</td>
                  <td>${mercaderia.tipo}</td>
                  <td>${mercaderia.precio}</td>
                  <td>$${mercaderia.precioTotal}</td>
                  <td><button type="button" id="eliminar${mercaderia.id}" class="btnCarrito">Eliminar producto</button></td>
                  `;

    bodyTabla.appendChild(datos);

    let botonEliminar = document.getElementById(`eliminar${mercaderia.id}`);
    botonEliminar.addEventListener("click", () =>
      eliminarDelCarrito(mercaderia.id)
    );
  }

  let precioTotal = obtenerPrecioTotal(array);
  let accionesCarrito = document.getElementById("accionesCarrito");
  accionesCarrito.innerHTML = `
          <h5 class= "contenedor">Total Compra: $${precioTotal}</h5>
      `;
}

function chequearCarritoEnStorage() {
  let contenidoEnStorage = JSON.parse(localStorage.getItem("carritoEnStorage"));

  if (contenidoEnStorage) {
    let array = [];

    for (const objeto of contenidoEnStorage) {
      let mercaderia = new Mercaderia(objeto);
      mercaderia.actualizarPrecioTotal();
      array.push(mercaderia);
    }

    imprimirTabla(array);

    return array;
  }

  return [];
}

function IDCompra(length) {
  let chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

function finalizarCompra() {
  let finalizar = document.getElementById("finalizarCompra");
  finalizar.innerHTML = `<div id="finalizarCompra" class="container d-flex justify-content-center mb-4 mt-3">
                <button type="button" class="boton d-flex justify-content-center borde">Finalizar compra</button>
                </div>
        
          
                `;

  finalizar.onclick = () => {
    if (carrito.length == 0) {
      swal.fire({
        text: "No ha agregado ningún producto al carrito",
        icon: "error",
      });
    } else {
      carrito = [];
      localStorage.clear(),
        (document.getElementById("tablaCarrito").innerHTML = ""),
        (document.getElementById("accionesCarrito").innerHTML = "");
      swal.fire({
        icon: "success",
        title: "Su Id de compra es: " + IDCompra(8),
        showConfirmButton: false,
        html: `<a class="btn btn-outline-success btn-lg" href="../index.html" role="button">
        Volver al inicio </a>`,
      });
    }
  };
}

finalizarCompra();

let carrito = chequearCarritoEnStorage();
