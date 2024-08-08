document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('equipmentForm');
    const tableBody = document.querySelector('#equipmentTable tbody');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const equipmentId = document.getElementById('equipmentId').value;
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;

        const equipment = { name, type };

        if (equipmentId) {
            // Update existing equipment
            await fetch(`/api/equipment/${equipmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipment)
            });
        } else {
            // Create new equipment
            await fetch('/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipment)
            });
        }

        form.reset();
        loadEquipment();
    });

    async function loadEquipment() {
        const response = await fetch('/api/equipment');
        const equipmentList = await response.json();
        tableBody.innerHTML = '';
        equipmentList.forEach(equipment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${equipment.equipmentId}</td>
                <td>${equipment.name}</td>
                <td>${equipment.type}</td>
                <td>
                    <button onclick="editEquipment(${equipment.equipmentId}, '${equipment.name}', '${equipment.type}')">Edit</button>
                    <button onclick="deleteEquipment(${equipment.equipmentId})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    window.editEquipment = (id, name, type) => {
        document.getElementById('equipmentId').value = id;
        document.getElementById('name').value = name;
        document.getElementById('type').value = type;
    };

    window.deleteEquipment = async (id) => {
        await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
        loadEquipment();
    };

    loadEquipment();
});
