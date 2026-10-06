/**
 * Helper utility to parse and convert various cloud storage URLs (Google Drive, Dropbox, etc.)
 * into directly embeddable image URLs for <img> tags.
 */
export const formatDirectImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already a Data URL (base64) or blob URL, return as is
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // 1. Google Drive URLs
  // Patterns:
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                        trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                        trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Google UserContent CDN is the most reliable endpoint for <img> tags
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Dropbox URLs
  // https://www.dropbox.com/s/xyz/photo.jpg?dl=0 -> replace dl=0 with raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/\?dl=0$/, '?raw=1').replace(/&dl=0$/, '&raw=1');
  }

  // 3. Imgur single image page -> direct image
  // https://imgur.com/abcXYZ -> https://i.imgur.com/abcXYZ.jpg
  if (/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/.test(trimmed)) {
    const id = trimmed.split('/').pop();
    return `https://i.imgur.com/${id}.jpg`;
  }

  return trimmed;
};

/**
 * Resizes and compresses an image file to a lightweight Base64 string (~30-60 KB)
 * suitable for localStorage and Supabase storage without external hosting.
 */
export const compressImageFileToBase64 = (file, maxDimension = 600, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File yang dipilih bukan gambar yang valid.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
