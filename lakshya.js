document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('frm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const tableBody = document.getElementById('tbdy');
    const searchInput = document.getElementById('searchContact');
    const searchByName = document.getElementById('searchBy1');
    const searchByPhone = document.getElementById('searchBy2');

    const popup = document.getElementById('popup');
    const existsPopup = document.getElementById('existsup');
    const confirmBox = document.getElementById('confirm');

    const invalidMsg = document.querySelector('#frm p');
    const baseURL = 'http://localhost:3000';

   
    loadContacts();


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name || !phone) {
            invalidMsg.style.display = 'block';
            return;
        } else {
            invalidMsg.style.display = 'none';
        }

        try {
            const res = await fetch(`${baseURL}/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });

            if (res.status === 400) {
                popup.style.display = 'block';
            } else if (res.status === 409) {
                existsPopup.style.display = 'block';
            } else {
                const newContact = await res.json();
                addContactRow(newContact);
                form.reset();
            }
        } catch (err) {
            console.error('Error adding contact:', err);
        }
    });


    document.getElementById('ok').onclick = () => popup.style.display = 'none';
    document.getElementById('eok').onclick = () => existsPopup.style.display = 'none';

   
    async function loadContacts() {
        try {
            const res = await fetch(`${baseURL}/contacts`);
            const contacts = await res.json();
            tableBody.innerHTML = '';
            contacts.forEach(addContactRow);
        } catch (err) {
            console.error('Error loading contacts:', err);
        }
    }

    function addContactRow(contact) {
        const tr = document.createElement('tr');

        const nameTd = document.createElement('td');
        nameTd.textContent = contact.name;

        const phoneTd = document.createElement('td');
        phoneTd.textContent = contact.phone;

        const deleteTd = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => confirmDelete(contact.phone, tr);
        deleteTd.appendChild(delBtn);

        tr.appendChild(nameTd);
        tr.appendChild(phoneTd);
        tr.appendChild(deleteTd);

        tableBody.appendChild(tr);
    }

   
    function confirmDelete(phone, row) {
        confirmBox.style.display = 'block';
        document.getElementById('yesbtn').onclick = async () => {
            try {
                await fetch(`${baseURL}/contacts/${phone}`, { method: 'DELETE' });
                row.remove();
                confirmBox.style.display = 'none';
            } catch (err) {
                console.error('Error deleting contact:', err);
            }
        };
        document.getElementById('nobtn').onclick = () => {
            confirmBox.style.display = 'none';
        };
    }

    
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        const by = searchByName.checked ? 'name' : searchByPhone.checked ? 'phone' : null;

        if (!by) return;

        try {
            const res = await fetch(`${baseURL}/search?query=${encodeURIComponent(query)}&by=${by}`);
            const results = await res.json();
            tableBody.innerHTML = '';
            results.forEach(addContactRow);
        } catch (err) {
            console.error('Error searching contacts:', err);
        }
    });
});
