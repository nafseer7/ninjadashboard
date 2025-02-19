import PleskDetailsPage from "@/app/components/PleskDetailsPage";

const Page = async ({ params }: { params: Promise<{ fileId: string }> }) => {
  const resolvedParams = await params; // Await the Promise to resolve params
  const { fileId } = resolvedParams;

  return <PleskDetailsPage fileId={fileId} />;
};

export default Page;
