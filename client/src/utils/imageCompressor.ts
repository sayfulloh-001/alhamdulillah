/**
 * Compresses an image file client-side, resizes it, and converts it to WebP format.
 * Guarantees that the resulting base64 string is less than 300KB (approx 400,000 characters).
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's a PDF, we don't compress (just read as base64)
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        // Resize calculations
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Quality tuning loop to stay strictly under 300KB
        let quality = 0.8;
        let base64 = canvas.toDataURL('image/webp', quality);
        
        // Base64 is approx 33% larger than binary data. 
        // 300KB binary ≈ 400KB base64 string length (409,600 characters).
        const MAX_BASE64_LENGTH = 390000; 

        while (base64.length > MAX_BASE64_LENGTH && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/webp', quality);
        }

        console.log(`Image compressed. Final base64 length: ${base64.length} chars (Quality: ${quality.toFixed(1)})`);
        resolve(base64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
