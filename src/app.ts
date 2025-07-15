interface Movimiento {
  id: number;
  tipo: "ingreso" | "gasto";
  monto: number;
  descripcion: string;
}

// Elementos del DOM
const ingresosInput = document.getElementById("ingresos") as HTMLInputElement;
const gastosInput = document.getElementById("gastos") as HTMLInputElement;
const ahorrosInput = document.getElementById("ahorros") as HTMLInputElement;
const descripcionInput = document.getElementById("descripcion") as HTMLInputElement;
const totalTexto = document.getElementById("total") as HTMLElement;
const ahorrosTexto = document.getElementById("ahorrosInfo") as HTMLElement;
const listaHistorial = document.getElementById("listaHistorial") as HTMLElement;
const btnCalcular = document.getElementById("calcular") as HTMLButtonElement;
const btnReiniciar = document.getElementById("reiniciar") as HTMLButtonElement;

// Estado inicial
let historial: Movimiento[] = JSON.parse(localStorage.getItem("historial") || "[]");
let total = parseFloat(localStorage.getItem("total") || "0");
let ahorros = parseFloat(localStorage.getItem("ahorros") || "0");

// Mostrar valores al cargar
actualizarVista();
renderizarHistorial();

btnCalcular.addEventListener("click", () => {
  const ingresos = parseFloat(ingresosInput.value) || 0;
  const gastos = parseFloat(gastosInput.value) || 0;
  const nuevosAhorros = parseFloat(ahorrosInput.value) || 0;
  const descripcion = descripcionInput.value.trim();

  if (ingresos < 0 || gastos < 0 || nuevosAhorros < 0) {
    alert("No se permiten valores negativos.");
    return;
  }

  if (!descripcion) {
    alert("Por favor, escribí una descripción del movimiento.");
    return;
  }

  if (ingresos === 0 && gastos === 0) {
    alert("Debes ingresar un valor mayor a cero en Ingresos o Gastos.");
    return;
  }

  if (ingresos > 0) {
    total += ingresos;
    historial.push({
      id: Date.now(),
      tipo: "ingreso",
      monto: ingresos,
      descripcion
    });
  }

  if (gastos > 0) {
    total -= gastos;
    historial.push({
      id: Date.now() + 1, // para evitar IDs repetidos en ingreso y gasto simultáneo
      tipo: "gasto",
      monto: gastos,
      descripcion
    });
  }

  ahorros = nuevosAhorros;

  // Guardar datos en localStorage
  localStorage.setItem("total", total.toString());
  localStorage.setItem("ahorros", ahorros.toString());
  localStorage.setItem("historial", JSON.stringify(historial));

  // Limpiar inputs
  ingresosInput.value = "";
  gastosInput.value = "";
  ahorrosInput.value = "";
  descripcionInput.value = "";

  actualizarVista();
  renderizarHistorial();
});

btnReiniciar.addEventListener("click", () => {
  total = 0;
  ahorros = 0;
  historial = [];

  localStorage.clear();

  ingresosInput.value = "";
  gastosInput.value = "";
  ahorrosInput.value = "";
  descripcionInput.value = "";

  actualizarVista();
  renderizarHistorial();
});

function actualizarVista() {
  totalTexto.textContent = `Total disponible: $${total.toFixed(2)}`;
  ahorrosTexto.textContent = `Ahorros del mes: $${ahorros.toFixed(2)}`;
}

function renderizarHistorial() {
  listaHistorial.innerHTML = "";

  historial.forEach((mov) => {
    // Validar monto antes de usar toFixed
    const monto = typeof mov.monto === "number" ? mov.monto : 0;

    const li = document.createElement("li");
    li.textContent = `${mov.tipo === "ingreso" ? "+ Ingreso" : "- Gasto"}: $${monto.toFixed(2)} - ${mov.descripcion}`;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.style.marginLeft = "10px";
    btnEliminar.addEventListener("click", () => {
      eliminarMovimiento(mov.id);
    });

    li.appendChild(btnEliminar);
    listaHistorial.appendChild(li);
  });
}

function eliminarMovimiento(id: number) {
  const index = historial.findIndex(mov => mov.id === id);
  if (index > -1) {
    const mov = historial[index];

    if (mov.tipo === "ingreso") {
      total -= mov.monto;
    } else if (mov.tipo === "gasto") {
      total += mov.monto;
    }

    historial.splice(index, 1);

    localStorage.setItem("historial", JSON.stringify(historial));
    localStorage.setItem("total", total.toString());

    renderizarHistorial();
    actualizarVista();
  }
}
