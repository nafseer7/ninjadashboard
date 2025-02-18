import DirectAdminDetailsPage from "@/app/components/DirectAdminDetailsPage";

const Page = async ({ params }: { params: Promise<{ fileId: string }> }) => {
    const resolvedParams = await params; // Await the Promise to resolve params
    const { fileId } = resolvedParams;

    return <DirectAdminDetailsPage fileId={fileId} />;
};

export default Page;
