export const uploadFile = async (file: File): Promise<any> => {
    const uploadApiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL;

    if (!uploadApiUrl) {
        throw new Error("API URL is not defined in the environment variables.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(uploadApiUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to upload file. Please try again.");
    }

    return response.json();
};
