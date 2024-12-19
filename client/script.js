const gallery = document.querySelector('.gallery');
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Create new image card
        const card = document.createElement('div');
        card.className = 'card';
        
        const img = document.createElement('img');
        img.src = data.imageUrl;
        img.className = 'image-card';
        
        card.appendChild(img);
        gallery.insertBefore(card, gallery.firstChild);
        
        // Show the image URL
        alert(`Image uploaded! URL: ${data.imageUrl}`);
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed!');
    }
}); 