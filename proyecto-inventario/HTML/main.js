document.addEventListener('DOMContentLoaded', function() {
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const currentViewTitle = document.getElementById('current-view-title');
    const contentArea = document.getElementById('content-area');
    const lowStockBadge = document.getElementById('low-stock-badge');

    const inventoryModal = document.getElementById('inventory-modal');
    const inventoryForm = document.getElementById('inventory-form');
    const closeModalButton = document.querySelector('#inventory-modal .close-button');

    const itemImageInput = document.getElementById('item-image');
    const imagePreview = document.getElementById('image-preview');
    let itemImageDataUrl = null; 

    const bodegaNombresCompletos = {
        "BCC": "BCC - Bodega Central de Componentes",
        "ARC": "ARC - Almacén de Repuestos Críticos",
        "BNF": "BNF - Bodega Norte - Fabricación",
        "DLQ": "DLQ - Depósito de Lubricantes y Químicos",
        "BSMP": "BSMP - Bodega Sur - Mantenimiento Pesado",
        "AKE": "AKE - Almacén de Kits y Ensamblajes",
        "BTR": "BTR - Bodega de Tránsito y Recepción",
        "PAMV": "PAMV - Patio de Aceros y Materiales Voluminosos",
        "BHE": "BHE - Bodega de Herramientas Especializadas",
        "ACG": "ACG - Almacén de Consumibles Generales",
        "": "-- Sin Ubicación --" 
    };

    function openInventoryModal() {
        if (inventoryModal) inventoryModal.style.display = 'block';
        if (imagePreview) {
            imagePreview.style.display = 'none';
            imagePreview.src = "#";
        }
        itemImageDataUrl = null;
        if (itemImageInput) itemImageInput.value = ''; 
    }

    function closeInventoryModal() {
        if (inventoryModal) inventoryModal.style.display = 'none';
        if (inventoryForm) inventoryForm.reset();
        if (imagePreview) {
            imagePreview.style.display = 'none';
            imagePreview.src = "#";
        }
        itemImageDataUrl = null;
        if (itemImageInput) itemImageInput.value = '';
    }

    if (closeModalButton) closeModalButton.addEventListener('click', closeInventoryModal);
    window.addEventListener('click', (event) => { if (event.target == inventoryModal) closeInventoryModal(); });

    if (itemImageInput) {
        itemImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')){ 
                    alert('Por favor, seleccione un archivo de imagen válido.');
                    event.target.value = ''; 
                    if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = "#"; }
                    itemImageDataUrl = null;
                    return; 
                }
                const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
                if (file.size > maxSizeInBytes) {
                    alert(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Máximo 2MB.`);
                    event.target.value = '';
                    if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = "#"; }
                    itemImageDataUrl = null;
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                    itemImageDataUrl = e.target.result;
                }
                reader.onerror = function() {
                    alert('Error al leer el archivo.');
                    itemImageDataUrl = null;
                }
                reader.readAsDataURL(file);
            } else {
                if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = "#"; }
                itemImageDataUrl = null;
            }
        });
    }

    function updateLowStockBadge() {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const lowStockItems = inventory.filter(item => parseInt(item.quantity) <= parseInt(item.minStock) && parseInt(item.minStock) > 0);
        if (lowStockBadge) {
            lowStockBadge.textContent = lowStockItems.length;
            lowStockBadge.style.display = lowStockItems.length > 0 ? 'inline-block' : 'none';
        }
    }

    if (inventoryForm) {
        inventoryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const newItem = {
                id: Date.now(),
                name: document.getElementById('item-name').value,
                description: document.getElementById('item-description').value,
                sku: document.getElementById('item-sku').value,
                serial: document.getElementById('item-serial').value,
                location: document.getElementById('item-location-select').value,
                quantity: parseInt(document.getElementById('item-quantity').value) || 0,
                minStock: parseInt(document.getElementById('item-min-stock').value) || 0,
                imageDataUrl: itemImageDataUrl 
            };
            
            if (!newItem.location) {
                alert('Por favor, seleccione una ubicación (bodega).');
                return; 
            }

            let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            if (inventory.some(item => item.sku === newItem.sku)) {
                alert('Error: Ya existe un artículo con este SKU.');
                return;
            }
            inventory.push(newItem);
            localStorage.setItem('inventory', JSON.stringify(inventory));
            alert(`Artículo "${newItem.name}" agregado.`);
            closeInventoryModal();
            updateLowStockBadge();
            if (document.querySelector('.sidebar-nav li.active a').dataset.view === 'registroInventario') {
                loadView('registroInventario');
            }
        });
    }

    function loadView(viewName) {
        contentArea.innerHTML = '';
        let viewTitle = 'Dashboard'; 

        switch (viewName) {
            case 'dashboard':
                viewTitle = 'Dashboard';
                const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
                const totalItems = inventory.length;
                const lowStockCount = inventory.filter(item => parseInt(item.quantity) <= parseInt(item.minStock) && parseInt(item.minStock) > 0).length;
                const movimientosCount = 0; 
                const lotesCount = 0;
                const proveedoresCount = 0;
                const kitsCount = 0; 

                contentArea.innerHTML = `
                    <h2>Visión General del Sistema</h2>
                    <div class="dashboard-grid">
                        <div class="dashboard-card" data-view-target="registroInventario">
                            <div class="card-icon-container blue"> <i class="fas fa-boxes"></i> </div>
                            <div class="card-info"><h3>Total Artículos</h3></div>
                            <div class="card-value">${totalItems}</div>
                        </div>
                        <div class="dashboard-card" data-view-target="alertasStock">
                            <div class="card-icon-container red"> <i class="fas fa-bell"></i> </div>
                            <div class="card-info"><h3>Alertas Stock Bajo</h3></div>
                            <div class="card-value">${lowStockCount}</div>
                        </div>
                        <div class="dashboard-card" data-view-target="seguimientoMovimientos">
                            <div class="card-icon-container yellow"> <i class="fas fa-exchange-alt"></i> </div>
                            <div class="card-info"><h3>Movimientos</h3></div>
                            <div class="card-value">${movimientosCount}</div>
                        </div>
                        <div class="dashboard-card" data-view-target="controlLotes">
                            <div class="card-icon-container purple"> <i class="fas fa-calendar-alt"></i> </div>
                            <div class="card-info"><h3>Control de Lotes</h3></div>
                            <div class="card-value">${lotesCount}</div>
                        </div>
                        <div class="dashboard-card" data-view-target="gestionProveedores">
                            <div class="card-icon-container green"> <i class="fas fa-truck"></i> </div>
                            <div class="card-info"><h3>Proveedores</h3></div>
                            <div class="card-value">${proveedoresCount}</div>
                        </div>
                        <div class="dashboard-card" data-view-target="gestionKits">
                            <div class="card-icon-container orange"> <i class="fas fa-cogs"></i> </div>
                            <div class="card-info"><h3>Gestión de Kits</h3></div>
                            <div class="card-value">${kitsCount}</div>
                        </div>
                        <div class="dashboard-card" id="dashboard-add-item-card">
                            <div class="card-icon-container teal"> <i class="fas fa-plus-circle"></i> </div>
                            <div class="card-info"><h3>Registrar Artículo</h3></div>
                            <div class="card-value"><i class="fas fa-arrow-right"></i></div>
                        </div>
                    </div>`;
                
                document.querySelectorAll('.dashboard-card[data-view-target]').forEach(card => {
                    card.addEventListener('click', function() {
                        const targetView = this.dataset.viewTarget;
                        const navLink = document.querySelector(`.sidebar-nav a[data-view="${targetView}"]`);
                        if (navLink) navLink.click();
                    });
                });
                document.getElementById('dashboard-add-item-card')?.addEventListener('click', openInventoryModal);
                break;

            case 'registroInventario':
                viewTitle = 'Registro de Inventario';
                let items = JSON.parse(localStorage.getItem('inventory')) || [];
                let tableHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Listado de Artículos</h2>
                        <button id="open-inventory-modal-from-list" class="btn-primary">Agregar Nuevo Artículo</button>
                    </div>`;
                if (items.length === 0) {
                    tableHTML += '<p>No hay artículos registrados en el inventario.</p>';
                } else {
                    tableHTML += `<table class="product-table">
                                    <thead>
                                        <tr>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>SKU</th>
                                            <th>Descripción</th>
                                            <th>Nº Serie</th>
                                            <th>Ubicación</th>
                                            <th>Cantidad</th>
                                            <th>Stock Mín.</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>`;
                    items.forEach(item => {
                        const ubicacionCompleta = bodegaNombresCompletos[item.location] || item.location; 
                        const imgSrc = item.imageDataUrl ? item.imageDataUrl : 'images/placeholder-image.png'; 
                        
                        tableHTML += `<tr>
                                        <td><img src="${imgSrc}" alt="${item.name || 'Imagen'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;"></td>
                                        <td>${item.name}</td>
                                        <td>${item.sku}</td>
                                        <td>${item.description || '-'}</td>
                                        <td>${item.serial || '-'}</td>
                                        <td>${ubicacionCompleta}</td>
                                        <td>${item.quantity}</td>
                                        <td>${item.minStock}</td>
                                        <td>
                                            <button class="btn-edit-item" data-id="${item.id}" title="Editar"><i class="fas fa-edit"></i></button> 
                                            <button class="btn-delete-item" data-id="${item.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                                        </td>
                                      </tr>`;
                    });
                    tableHTML += '</tbody></table>';
                }
                contentArea.innerHTML = tableHTML;
                document.getElementById('open-inventory-modal-from-list')?.addEventListener('click', openInventoryModal);
                document.querySelectorAll('.btn-delete-item').forEach(b => b.addEventListener('click', function() { deleteInventoryItem(this.dataset.id); }));
                document.querySelectorAll('.btn-edit-item').forEach(b => b.addEventListener('click', function() { 
                    alert('Funcionalidad de editar pendiente. ID del item: ' + this.dataset.id); 
                }));
                break;

            case 'alertasStock':
                viewTitle = 'Alertas de Stock Bajo';
                let currentInv = JSON.parse(localStorage.getItem('inventory')) || [];
                let lowItems = currentInv.filter(item => parseInt(item.quantity) <= parseInt(item.minStock) && parseInt(item.minStock) > 0);
                let alertsHTML = '<h2>Artículos con Stock Bajo</h2>';
                if (lowItems.length === 0) {
                    alertsHTML += '<p>No hay artículos con niveles de stock bajo actualmente.</p>';
                } else {
                    alertsHTML += '<ul class="low-stock-list">';
                    lowItems.forEach(item => { alertsHTML += `<li>${item.name} (SKU: ${item.sku}) - Stock Actual: ${item.quantity} (Mínimo Requerido: ${item.minStock})</li>`; });
                    alertsHTML += '</ul>';
                }
                contentArea.innerHTML = alertsHTML;
                break;

            case 'seguimientoMovimientos': viewTitle = 'Seguimiento de Movimientos'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Esta sección permitirá registrar y consultar las entradas y salidas de stock de cada artículo.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'controlLotes': viewTitle = 'Control de Lotes y Fechas'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Aquí se podrán gestionar artículos por lotes, asignando fechas de vencimiento o fabricación.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'etiquetasCategorias': viewTitle = 'Etiquetas y Categorías'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Permitirá crear y asignar categorías (ej: Herramientas, Repuestos, Consumibles) y etiquetas personalizadas a los artículos para facilitar su búsqueda y organización.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'historialPrecios': viewTitle = 'Historial de Precios'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Se podrá consultar el historial de precios de compra de los componentes para tomar decisiones informadas.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'gestionKits': viewTitle = 'Gestión de Kits'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Permitirá definir "kits" o conjuntos de piezas que se utilizan como un solo artículo en ensamblajes, haciendo seguimiento de sus componentes individuales.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'generacionInformes': viewTitle = 'Generación de Reportes'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Se podrán generar informes personalizados sobre el estado del inventario, niveles de stock, tendencias de consumo, etc.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'gestionProveedores': viewTitle = 'Gestión de Proveedores'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Permitirá registrar y administrar la información de los proveedores, incluyendo detalles de contacto y términos.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            case 'integracionCompras': viewTitle = 'Integración con Compras'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Futura integración para automatizar órdenes de compra basadas en niveles de inventario.</p><p>Funcionalidad pendiente de desarrollo (requiere backend)...</p>`; break;
            case 'configuracion': viewTitle = 'Configuración'; contentArea.innerHTML = `<h2>${viewTitle}</h2><p>Ajustes generales del sistema, como unidades de medida, umbrales de alerta por defecto, etc.</p><p>Funcionalidad pendiente de desarrollo...</p>`; break;
            default: 
                viewTitle = viewName.charAt(0).toUpperCase() + viewName.slice(1);
                contentArea.innerHTML = `<p>Contenido para la vista '${viewTitle}' no definido aún.</p>`;
        }
        if(currentViewTitle) currentViewTitle.textContent = viewTitle;
    }

    function deleteInventoryItem(itemId) {
        if (!confirm('¿Está seguro de que quiere eliminar este artículo?')) return;
        let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        inventory = inventory.filter(item => item.id.toString() !== itemId.toString());
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateLowStockBadge();
        if (document.querySelector('.sidebar-nav li.active a').dataset.view === 'registroInventario') {
            loadView('registroInventario');
        } else {
            alert('Artículo eliminado.');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            loadView(this.dataset.view);
        });
    });

    loadView('dashboard'); 
    updateLowStockBadge(); 
});
