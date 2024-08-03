//'http://localhost:8080/crud/api/items';



const apiUrl = 'http://localhost:8080/crud/api/items';

// Function to fetch and display items
async function fetchItems() {
    try {
        const response = await fetch(apiUrl);
        const items = await response.json();
        const itemList = document.getElementById('item-list');
        itemList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.name;
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editItem(item);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteItem(item.id);
            li.appendChild(editButton);
            li.appendChild(deleteButton);
            itemList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Function to create a new item
async function createItem(item) {
    try {
        await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        fetchItems();
    } catch (error) {
        console.error('Error creating item:', error);
    }
}

// Function to update an existing item
async function updateItem(item) {
    try {
        await fetch(`${apiUrl}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        fetchItems();
    } catch (error) {
        console.error('Error updating item:', error);
    }
}

// Function to delete an item
async function deleteItem(id) {
    try {
        await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
        });
        fetchItems();
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

// Function to handle form submission
document.getElementById('item-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const itemId = document.getElementById('item-id').value;
    const itemName = document.getElementById('item-name').value;

    if (itemId) {
        // Update existing item
        updateItem({ id: itemId, name: itemName });
    } else {
        // Create new item
        createItem({ name: itemName });
    }

    // Reset form
    document.getElementById('item-form').reset();
    document.getElementById('submit-button').style.display = 'inline';
    document.getElementById('update-button').style.display = 'none';
});

// Function to set up edit mode
function editItem(item) {
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('submit-button').style.display = 'none';
    document.getElementById('update-button').style.display = 'inline';
}

// Initial fetch of items
fetchItems();
