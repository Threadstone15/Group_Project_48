document.addEventListener('DOMContentLoaded', function () {
    loadEquipment();
});

function loadEquipment() {
    fetch('http://localhost:8080/crud/api/equipment')
        .then(response => response.json())
        .then(data => {
            const equipmentTableBody = document.getElementById('equipment-table-body');
            equipmentTableBody.innerHTML = '';

            data.forEach(equipment => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${equipment.equipmentId}</td>
                    <td>${equipment.name}</td>
                    <td>${equipment.purchaseDate}</td>
                    <td>${equipment.status}</td>
                    <td>${equipment.maintenanceDuration}</td>
                    <td>
                        <button onclick="editEquipment(${equipment.equipmentId})">Edit</button>
                        <button onclick="deleteEquipment(${equipment.equipmentId})">Delete</button>
                    </td>
                `;

                equipmentTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error:', error));
}

function saveEquipment() {
    const name = document.getElementById('name').value;
    const purchaseDate = document.getElementById('purchase-date').value;
    const status = document.getElementById('status').value;
    const maintenanceDuration = document.getElementById('maintenance-duration').value;

    const equipment = { name, purchaseDate, status, maintenanceDuration };

    fetch('http://localhost:8080/crud/api/equipment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipment)
    })
    .then(response => {
        if (response.ok) {
            loadEquipment();
            resetForm();
        } else {
            console.error('Error:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

function editEquipment(id) {
    fetch(`/${id}`)
        .then(response => response.json())
        .then(equipment => {
            document.getElementById('equipment-id').value = equipment.equipmentId;
            document.getElementById('name').value = equipment.name;
            document.getElementById('purchase-date').value = equipment.purchaseDate;
            document.getElementById('status').value = equipment.status;
            document.getElementById('maintenance-duration').value = equipment.maintenanceDuration;

            document.getElementById('form-title').textContent = 'Edit Equipment';
            document.getElementById('save-btn').style.display = 'none';
            document.getElementById('update-btn').style.display = 'inline';
        })
        .catch(error => console.error('Error:', error));
}

function updateEquipment() {
    const id = document.getElementById('equipment-id').value;
    const name = document.getElementById('name').value;
    const purchaseDate = document.getElementById('purchase-date').value;
    const status = document.getElementById('status').value;
    const maintenanceDuration = document.getElementById('maintenance-duration').value;

    const equipment = { name, purchaseDate, status, maintenanceDuration };

    fetch(`http://localhost:8080/crud/api/equipment/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipment)
    })
    .then(response => {
        if (response.ok) {
            loadEquipment();
            resetForm();
        } else {
            console.error('Error:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

function deleteEquipment(id) {
    fetch(`http://localhost:8080/crud/api/equipment/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadEquipment();
        } else {
            console.error('Error:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}

function resetForm() {
    document.getElementById('equipment-id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('purchase-date').value = '';
    document.getElementById('status').value = '';
    document.getElementById('maintenance-duration').value = '';

    document.getElementById('form-title').textContent = 'Add New Equipment';
    document.getElementById('save-btn').style.display = 'inline';
    document.getElementById('update-btn').style.display = 'none';
}
