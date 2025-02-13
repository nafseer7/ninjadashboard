import JoomlaDetailsPage from "@/app/components/JoomlaDetailsPage";


const Page = async ({ params }: { params: Promise<{ fileId: string }> }) => {
  const resolvedParams = await params; // Await the Promise to resolve params
  const { fileId } = resolvedParams;

  return <JoomlaDetailsPage fileId={fileId} />;
};

export default Page;
