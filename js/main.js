// js/main.js
import { database } from './firebase-config.js';

const pinnedContainer = document.getElementById('pinned-posts-container');
const allContainer = document.getElementById('all-posts-container');
const loadingMsg = document.getElementById('loading-msg');
const noPinnedMsg = document.getElementById('no-pinned-msg');
const modal = document.getElementById('post-modal');

// Fungsi untuk membuat Post Card menggunakan kelas Tailwind
const createPostCard = (postId, post) => {
    const card = document.createElement('div');
    card.className = 'post-card bg-surface-dark rounded-lg overflow-hidden shadow-xl hover:shadow-primary-blue/30 transform hover:scale-[1.02] transition duration-300 cursor-pointer';
    card.dataset.postId = postId;
    
    // Aspek Rasio (1:1 seperti Instagram)
    card.innerHTML = `
        <div class="w-full aspect-square overflow-hidden">
            <img src="${post.imageUrl}" alt="${post.title}" class="w-full h-full object-cover">
        </div>
        <div class="p-4">
            <h3 class="text-lg font-poppins font-semibold truncate">${post.title}</h3>
            <p class="text-sm text-text-muted">Oleh: ${post.author}</p>
        </div>
    `;

    card.addEventListener('click', () => showPostModal(post));
    return card;
};

// Fungsi untuk menampilkan Modal
const showPostModal = (post) => {
    document.getElementById('modal-image').src = post.imageUrl;
    document.getElementById('modal-title').textContent = post.title;
    document.getElementById('modal-author').textContent = post.author;
    document.getElementById('modal-description').textContent = post.description;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Non-aktifkan scroll body
};

// Fungsi untuk memuat semua Posts
const loadPosts = () => {
    database.ref('posts').on('value', (snapshot) => {
        // Hapus konten lama
        pinnedContainer.innerHTML = '';
        allContainer.innerHTML = '';
        
        loadingMsg.classList.add('hidden');
        noPinnedMsg.classList.add('hidden');

        let isPinnedFound = false;
        
        snapshot.forEach((childSnapshot) => {
            const postId = childSnapshot.key;
            const post = childSnapshot.val();

            const card = createPostCard(postId, post);
            
            // Tampilkan di All Posts
            allContainer.prepend(card); // prepend agar yang baru di atas

            // Tampilkan di Pinned Posts jika isPinned=true
            if (post.isPinned) {
                pinnedContainer.prepend(createPostCard(postId, post));
                isPinnedFound = true;
            }
        });
        
        if (!isPinnedFound) {
            noPinnedMsg.classList.remove('hidden');
        }

        if (!snapshot.exists()) {
            allContainer.innerHTML = '<p class="text-text-muted text-center col-span-full">Belum ada post yang tersedia.</p>';
        }
    }, (error) => {
        loadingMsg.textContent = `Error memuat data: ${error.message}`;
        console.error("Firebase Read Failed: ", error);
    });
};

document.addEventListener('DOMContentLoaded', loadPosts);

// Menutup modal saat menekan ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
});
