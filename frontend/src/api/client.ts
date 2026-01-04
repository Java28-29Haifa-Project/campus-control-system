
//const baseurl = import.meta.env.VITE_API_BASE_URL;

export const fetchHealth= async () => {
    try{
        //const response = await fetch(`${baseurl}/health`);
        const response = await fetch(`/health`);

        if(!response.ok){
            throw new Error(`Http response status ${response.status}`);
        }

        return await response.json();
    } catch(e){
        console.error("Health check failed", e);
        throw e;
    }
}