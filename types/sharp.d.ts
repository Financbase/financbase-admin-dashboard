/**
 * Type declaration for sharp when it's not installed
 * This allows the code to compile even if sharp is not in dependencies
 */
declare module 'sharp' {
  interface Sharp {
    (input?: string | Buffer): SharpInstance;
    metadata(): Promise<ImageMetadata>;
  }

  interface SharpInstance {
    resize(width?: number, height?: number, options?: ResizeOptions): SharpInstance;
    webp(options?: WebpOptions): SharpInstance;
    avif(options?: AvifOptions): SharpInstance;
    jpeg(options?: JpegOptions): SharpInstance;
    png(options?: PngOptions): SharpInstance;
    metadata(): Promise<ImageMetadata>;
    toBuffer(): Promise<Buffer>;
  }

  interface ResizeOptions {
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    withoutEnlargement?: boolean;
  }

  interface WebpOptions {
    quality?: number;
    effort?: number;
  }

  interface AvifOptions {
    quality?: number;
    effort?: number;
  }

  interface JpegOptions {
    quality?: number;
    progressive?: boolean;
  }

  interface PngOptions {
    quality?: number;
    compressionLevel?: number;
  }

  interface ImageMetadata {
    width?: number;
    height?: number;
    format?: string;
  }

  const sharp: Sharp;
  export default sharp;
}
