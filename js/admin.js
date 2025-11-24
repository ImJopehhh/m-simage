// js/admin.js
import { database } from './firebase-config.js';

// --- ELEMENT SELECTIONS ---
const loginSection = document.getElementById('admin-login');
const dashboardSection = document.getElementById('admin-dashboard');
const loginError = document.getElementById('login-error');
const postsTableBody = document.getElementById('posts-table-body');
const postCrudModal = document.getElementById('post-crud-modal');

// CRUD FORM ELEMENTS
const crudModalTitle = document.getElementById('crud-modal-title');
const postIdEdit = document.getElementById('post-id-edit');
const postTitle = document.getElementById('post-title');
const postAuthor = document.getElementById('post-author');
const postImageUrl = document.getElementById('post-image-url');
const postDescription = document.getElementById('post-description');
const postIsPinned = document.getElementById('post-is-pinned');
const savePostBtn = document.getElementById('save-post-btn');

// --- KONFIGURASI LOGIN STATIS ---
// Mengingat hosting di GitHub Pages, kita menggunakan metode login statis dengan localStorage.
const ADMIN_EMAIL = 'admin@simage.com';
const ADMIN_PASSWORD = 'supersecretpassword'; 

// --- FUNGSI UTILITY MODAL ---
const showModal = (title) => {
    crudModalTitle.textContent = title;
    postCrudModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

const hideModal = () => {
    postCrudModal.classList.add('hidden');
    document.body.style.overflow = '';
};

const resetForm = () => {
    postIdEdit.value = '';
    postTitle.value = '';
    postAuthor.value = '';
    postImageUrl.value = '';
    postDescription.value = '';
    postIsPinned.checked = false;
    savePostBtn.textContent = 'Simpan Post';
};

// --- FUNGSI CRUD LOGIC ---

// 1. READ & RENDER
const createPostRow = (postId, post) => {
    const row = postsTableBody.insertRow();
    row.className = 'hover:bg-gray-800 transition duration-150';
    row.innerHTML = `
        <td class="p-3 font-semibold truncate max-w-xs">${post.title}</td>
        <td class="p-3 text-sm text-text-muted">${post.author}</td>
        <td class="p-3 text-center">${post.isPinned ? '✔️' : '❌'}</td>
        <td class="p-3 text-center space-x-2 whitespace-nowrap">
            <button data-id="${postId}" class="edit-btn px-3 py-1 bg-yellow-600 rounded-md text-xs hover:bg-yellow-700">Edit</button>
            <button data-id="${postId}" class="delete-btn px-3 py-1 bg-red-600 rounded-md text-xs hover:bg-red-700">Hapus</button>
        </td>
    `;
    return row;
};

const initDashboard = () => {
    // Tampilkan Dashboard, Sembunyikan Login
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');

    database.ref('posts').on('value', (snapshot) => {
        postsTableBody.innerHTML = ''; // Kosongkan tabel
        let totalCount = 0;
        let pinnedCount = 0;

        snapshot.forEach((childSnapshot) => {
            const postId = childSnapshot.key;
            const post = childSnapshot.val();
            createPostRow(postId, post);
            totalCount++;
            if (post.isPinned) pinnedCount++;
        });

        document.getElementById('total-posts-count').textContent = totalCount;
        document.getElementById('pinned-posts-count').textContent = pinnedCount;

        // Pasang Event Listeners untuk Tombol Aksi
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));
    });
};

// 2. CREATE / UPDATE
const handleSavePost = () => {
    const postData = {
        title: postTitle.value.trim(),
        author: postAuthor.value.trim(),
        imageUrl: postImageUrl.value.trim(),
        description: postDescription.value.trim(),
        isPinned: postIsPinned.checked,
        timestamp: Date.now()
    };

    if (!postData.title || !postData.imageUrl) {
        alert("Judul dan URL Gambar wajib diisi!");
        return;
    }

    const postId = postIdEdit.value;

    if (postId) {
        // Update Post
        database.ref('posts/' + postId).update(postData)
            .then(() => alert('Post berhasil diperbarui!'))
            .catch(error => console.error("Update Error:", error));
    } else {
        // Create New Post
        database.ref('posts').push(postData)
            .then(() => alert('Post baru berhasil dibuat!'))
            .catch(error => console.error("Create Error:", error));
    }

    hideModal();
    resetForm();
};

// 3. EDIT (Load Data ke Form)
const handleEdit = (e) => {
    const postId = e.currentTarget.dataset.id;
    
    database.ref('posts/' + postId).once('value', (snapshot) => {
        const post = snapshot.val();
        resetForm(); // Reset dulu

        postIdEdit.value = postId;
        postTitle.value = post.title;
        postAuthor.value = post.author;
        postImageUrl.value = post.imageUrl;
        postDescription.value = post.description;
        postIsPinned.checked = post.isPinned;
        
        savePostBtn.textContent = 'Perbarui Post';
        showModal('Edit Post');
    });
};

// 4. DELETE
const handleDelete = (e) => {
    const postId = e.currentTarget.dataset.id;

    if (confirm(`Anda yakin ingin menghapus Post ID ${postId}?`)) {
        database.ref('posts/' + postId).remove()
            .then(() => alert('Post berhasil dihapus!'))
            .catch(error => console.error("Delete Error:", error));
    }
};

// --- AUTENTIKASI ---
const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    loginError.classList.add('hidden');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('simage_admin_token', 'logged_in');
        initDashboard();
    } else {
        loginError.textContent = 'Email atau Password salah.';
        loginError.classList.remove('hidden');
    }
};

const handleLogout = () => {
    localStorage.removeItem('simage_admin_token');
    window.location.reload(); // Refresh untuk kembali ke login
};

// --- EVENT LISTENERS UTAMA ---

document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);

// Modal Triggers
document.getElementById('open-create-modal').addEventListener('click', () => {
    resetForm();
    showModal('Buat Post Baru');
});
document.getElementById('cancel-post-btn').addEventListener('click', hideModal);

// Save Button
savePostBtn.addEventListener('click', handleSavePost);

// Menutup modal saat menekan ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !postCrudModal.classList.contains('hidden')) {
        hideModal();
    }
});


// --- INICIAL CHECK ---
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('simage_admin_token') === 'logged_in') {
        initDashboard();
    }
});
