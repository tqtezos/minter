import { encode, decode } from "blurhash";

const loadImage = async (src: string) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (...args) => reject(args);
        img.src = src;
    });

const getImageData = (image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
};

export const encodeImageToBlurhash = async (imageUrl: string) => {
    const image = await loadImage(imageUrl) as HTMLImageElement;
    const imageData = getImageData(image);
    return encode(imageData.data, imageData.width, imageData.height, 4, 4);
};

export const decodeBlurhashToDataURL = async (hash: string) => {

    const pixels = decode(hash, 4, 4);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imageData = ctx.createImageData(400, 400);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();

    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    // const imageData = ctx.createImageData(width, height);
    // imageData.data.set(pixels);
    // canvas.toBlob((blob) => {
    //     const url = URL.createObjectURL([blob]);
    // });
    // const ctx = URL.createObjectURL([canvas.toBlob()]);
    // const imageData = ctx.createImageData(width, height);
    // imageData.to
}