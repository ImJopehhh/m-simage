// js/admin.js (VERSI TANPA LOGIN)
import { database } from './firebase-config.js';

// --- ELEMENT SELECTIONS ---
// Elemen login dan terkait login dihapus
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
    // Koneksi ke database dan listen perubahan
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

        // Pasang Event Listeners untuk Tombol Aksi SETELAH post dimuat
        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));
    }, (error) => {
        console.error("Firebase Read Failed: ", error);
        document.getElementById('firebase-status').textContent = 'Error ❌';
        document.getElementById('firebase-status').classList.remove('text-green-500');
        document.getElementById('firebase-status').classList.add('text-red-500');
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
            .then(() => console.log('Post berhasil diperbarui!'))
            .catch(error => console.error("Update Error:", error));
    } else {
        // Create New Post
        database.ref('posts').push(postData)
            .then(() => console.log('Post baru berhasil dibuat!'))
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
            .then(() => console.log('Post berhasil dihapus!'))
            .catch(error => console.error("Delete Error:", error));
    }
};

// --- EVENT LISTENERS UTAMA ---

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

// --- INISIALISASI (LANGSUNG TAMPILKAN DASHBOARD) ---
document.addEventListener('DOMContentLoaded', initDashboard);
            
