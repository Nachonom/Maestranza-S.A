// Variables globales
const inventory = [];
const movements = [];
const lots = [];
const taggedItems = {};
const kits = {};
const suppliers = [];
const purchaseHistory = [];

// Abrir modal de registro de inventario
document.getElementById('open-inventory-form').addEventListener('click', function () {
  document.getElementById('inventory-modal').style.display = 'block';
});

// Cerrar modal
document.querySelector('.close').addEventListener('click', function () {
  document.getElementById('inventory-modal').style.display = 'none';
});

// Agregar artículo al inventario
document.getElementById('inventory-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const description = document.getElementById('descripcion').value;
  const serialNumber = document.getElementById('numero-serie').value;
  const location = document.getElementById('ubicacion').value;

  const newItem = { description, serialNumber, location };
  inventory.push(newItem);

  alert('Artículo agregado al inventario');
  console.log(inventory);

  // Limpiar formulario
  document.getElementById('inventory-form').reset();
  document.getElementById('inventory-modal').style.display = 'none';
});

// Rastrear movimientos
document.getElementById('track-movements').addEventListener('click', function () {
  alert('Mostrando movimientos...');
  console.log(movements);
});

// Administrar lotes
document.getElementById('manage-lots').addEventListener('click', function () {
  alert('Administrando lotes...');
  console.log(lots);
});

// Generar informes
document.getElementById('generate-reports').addEventListener('click', function () {
  const report = `
    **Informe de Inventario**
    - Artículos Registrados: ${inventory.length}
    - Movimientos Registrados: ${movements.length}
    - Lotes Registrados: ${lots.length}
    - Kits Registrados: ${Object.keys(kits).length}
  `;
  alert(report);
});