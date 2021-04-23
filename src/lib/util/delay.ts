export async function delay(timeout: number): Promise<void> {
    return await new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
