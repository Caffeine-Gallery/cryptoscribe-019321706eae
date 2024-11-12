import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('cancelBtn').addEventListener('click', hideNewPostForm);
    document.getElementById('postForm').addEventListener('submit', handleSubmit);

    // Load initial posts
    await loadPosts();
});

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
    quill.setText('');
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const body = quill.root.innerHTML;

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Publishing...';
    submitBtn.disabled = true;

    try {
        await backend.createPost(title, body, author);
        hideNewPostForm();
        await loadPosts();
        
        // Reset form
        document.getElementById('title').value = '';
        document.getElementById('author').value = '';
        quill.setText('');
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function loadPosts() {
    const loadingDiv = document.getElementById('loading');
    const postsContainer = document.getElementById('posts');
    
    loadingDiv.classList.remove('hidden');

    try {
        const posts = await backend.getPosts();
        postsContainer.innerHTML = ''; // Clear existing posts
        
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Please refresh the page.</p>';
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    
    const date = new Date(Number(post.timestamp / 1000000n));
    
    article.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <span class="author">By ${post.author}</span>
            <span class="date">${date.toLocaleDateString()}</span>
        </div>
        <div class="post-content">
            ${post.body}
        </div>
    `;
    
    return article;
}
