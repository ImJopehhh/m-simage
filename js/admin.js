// js/admin.js
import { database, auth } from './firebase-config.js';

// --- ELEMENT SELECTIONS ---
const loginSection = document.getElementById('admin-login');
const dashboardSection = document.getElementById('admin-dashboard');
const loginError = document.getElementById('login-error');
const postsTableBody = document.getElementById('posts-table-body');
const postCrudModal = document.getElementById('post-crud-modal');

// --- KONFIGURASI LOGIN (Ganti dengan kredensial yang Anda inginkan) ---
const ADMIN_EMAIL = 'admin@simage.com';
const ADMIN_PASSWORD = 'supersecretpassword'; // Harusnya menggunakan .env di real-app, tapi untuk statis

// --- FUNGSI UTILITY ---
const hideModal = () => postCrudModal.classList.add('hidden');
const showModal = (title) => {
    document.getElementById('crud-modal-title').textContent = title;
    postCrudModal.classList.remove('hidden');
};

// --- FUNGSI CRUD POSTS ---
const createPostRow = (postId, post) => {
    const row = postsTableBody.insertRow();
    row.className = 'hover:bg-gray-800 transition duration-150';
    row.innerHTML = `
        <td class="p-3 font-semibold truncate">${post.title}</td>
        <td class="p-3 text-sm text-text-muted">${post.author}</td>
        <td class="p-3 text-center">${post.isPinned ? '✔️' : '❌'}</td>
        <td class="p-3 text-center space-x-2">
            <button data-id="${postId}" class="edit-btn px-3 py-1 bg-yellow-600 rounded-md text-xs hover:bg-yellow-700">Edit</button>
            <button data-id="${postId}" class="delete-btn px-3 py-1 bg-red-600 rounded-md text-xs hover:bg-red-700">Hapus</button>
        </td>
    `;
    return row;
};

// ... (Logika lainnya seperti handleEdit, handleDelete, savePost, dan initDashboard)

// --- INISIALISASI DASHBOARD & REALTIME LISTENER ---
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
    });
};

// --- AUTENTIKASI (PENTING UNTUK STATIC HOSTING) ---
const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;

    loginError.classList.add('hidden');

    // ** Metode Statis (Karena host di GitHub Pages) **
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Logika sederhana: Buat session token di localStorage
        localStorage.setItem('simage_admin_token', 'logged_in');
        initDashboard();
    } else {
        loginError.textContent = 'Email atau Password salah.';
        loginError.classList.remove('hidden');
    }

    /*
    // ** Metode Firebase Auth (Lebih Aman) **
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            initDashboard();
        })
        .catch((error) => {
            loginError.textContent = `Error Login: ${error.message}`;
            loginError.classList.remove('hidden');
        });
    */
};

const handleLogout = () => {
    localStorage.removeItem('simage_admin_token');
    window.location.reload(); // Refresh untuk kembali ke login
    /* auth.signOut().then(() => window.location.reload()); */
};

// --- EVENT LISTENERS ---
document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('logout-btn').addEventListener('click', handleLogout);
// ... (Tambahkan Event Listeners untuk CRUD di admin.js)

// --- INICIAL CHECK (Saat load halaman) ---
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('simage_admin_token') === 'logged_in') {
        initDashboard();
    }
});
