const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises;

/**
 * Image processing utilities for X-ray analysis
 */

class ImageProcessor {
  constructor() {
    this.allowedFormats = ["jpeg", "jpg", "png", "dicom"];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.targetSize = { width: 512, height: 512 }; // Standard size for analysis
  }

  /**
   * Validate uploaded image
   */
  async validateImage(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push("File size exceeds 10MB limit");
    }

    // Check file type
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .slice(1);
    if (
      !this.allowedFormats.includes(fileExtension) &&
      !file.mimetype.startsWith("image/")
    ) {
      errors.push(
        "Invalid file format. Only JPEG, PNG, and DICOM files are supported"
      );
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return true;
  }

  /**
   * Process image for AI analysis
   */
  async processForAnalysis(imageBuffer) {
    try {
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Resize and normalize image
      const processedImage = await sharp(imageBuffer)
        .resize(this.targetSize.width, this.targetSize.height, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 1 },
        })
        .greyscale() // Convert to grayscale for X-ray analysis
        .normalize() // Normalize contrast
        .toBuffer();

      return {
        processedImage,
        metadata: {
          originalWidth: metadata.width,
          originalHeight: metadata.height,
          format: metadata.format,
          channels: metadata.channels,
          processedWidth: this.targetSize.width,
          processedHeight: this.targetSize.height,
        },
      };
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error("Failed to process image: " + error.message);
    }
  }

  /**
   * Save image to storage
   */
  async saveImage(imageBuffer, filename, directory = "uploads") {
    try {
      const uploadDir = path.join(__dirname, "..", directory);

      // Create directory if it doesn't exist
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, imageBuffer);

      return {
        filepath,
        filename,
        url: `/${directory}/${filename}`,
      };
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error("Failed to save image: " + error.message);
    }
  }

  /**
   * Create thumbnail for preview
   */
  async createThumbnail(imageBuffer, size = 200) {
    try {
      const thumbnail = await sharp(imageBuffer)
        .resize(size, size, {
          fit: "cover",
        })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      console.error("Error creating thumbnail:", error);
      throw new Error("Failed to create thumbnail: " + error.message);
    }
  }

  /**
   * Convert image to base64 for frontend display
   */
  async toBase64(imageBuffer) {
    return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  }

  /**
   * Enhance X-ray image for better analysis
   */
  async enhanceXray(imageBuffer) {
    try {
      const enhanced = await sharp(imageBuffer)
        .greyscale()
        .normalize() // Auto-adjust contrast
        .sharpen() // Enhance edges
        .modulate({
          brightness: 1.1,
          contrast: 1.2,
        })
        .toBuffer();

      return enhanced;
    } catch (error) {
      console.error("Error enhancing X-ray:", error);
      throw new Error("Failed to enhance X-ray: " + error.message);
    }
  }

  /**
   * Extract DICOM metadata if applicable
   */
  async extractDICOMMetadata(imageBuffer) {
    // TODO: Implement DICOM parsing
    // This would require a DICOM parser library like 'dicom-parser'
    // For now, return null
    return null;
  }
}

module.exports = new ImageProcessor();
